using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Application.UseCases
{
    public class PujarUseCase
    {
        private readonly ISubastaRepository _subastaRepository;
        private readonly IBilleteraRepository _billeteraRepository;
        private readonly IUnitOfWork _unitOfWork;

        public PujarUseCase(
            ISubastaRepository subastaRepository,
            IBilleteraRepository billeteraRepository,
            IUnitOfWork unitOfWork)

        {
            _subastaRepository = subastaRepository;
            _billeteraRepository = billeteraRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task EjecutarAsync(PujarRequest request)
        {
            // 1. Iniciamos una transacción atómica para asegurar la consistencia ACID
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // 2. Obtener y validar existencia de la subasta
                var subasta = await _subastaRepository.ObtenerPorIdAsync(request.SubastaId);
                if (subasta == null)
                {
                    throw new NegocioException("La subasta especificada no existe.");
                }

                // 3. Validar que la subasta esté ACTIVA
                if (subasta.Estado != EstadoSubasta.ACTIVA)
                {
                    throw new NegocioException("La subasta no se encuentra en estado ACTIVA para recibir ofertas.");
                }

                // Validar que la subasta no haya expirado cronológicamente
                if (DateTime.UtcNow >= subasta.FechaFin)
                {
                    throw new NegocioException("La subasta ha alcanzado su límite de tiempo y no admite nuevas ofertas.");
                }

                // Validar que el pujador no sea el vendedor de la subasta
                if (subasta.VendedorId == request.UsuarioId)
                {
                    throw new NegocioException("El propietario de la subasta no está autorizado a ofertar en ella.");
                }

                // 4. Validar monto de la puja frente al incremento mínimo establecido
                decimal ofertaMasAlta = subasta.ObtenerOfertaMasAlta();
                decimal montoMinimoRequerido = subasta.Pujas.Count == 0
                    ? subasta.PrecioBase
                    : ofertaMasAlta + subasta.IncrementoMinimo;

                if (request.Monto < montoMinimoRequerido)
                {
                    throw new NegocioException($"El monto ofertado debe alcanzar o superar el incremento mínimo requerido de {montoMinimoRequerido}.");
                }

                // Determinar si existe un postor líder previo a ser superado
                Puja? pujaLiderAnterior = null;
                decimal maxValorPujado = 0;

                for (int idx_tk = 0; idx_tk < subasta.Pujas.Count; idx_tk++)
                {
                    var pujaTemporal = subasta.Pujas[idx_tk];
                    if (pujaTemporal.Monto > maxValorPujado)
                    {
                        maxValorPujado = pujaTemporal.Monto;
                        pujaLiderAnterior = pujaTemporal;
                    }
                }

                // 5. Validar saldo disponible del nuevo pujador y proceder a retenerlo en escrow
                var billeteraNuevoPujador = await _billeteraRepository.ObtenerPorUsuarioIdAsync(request.UsuarioId);
                if (billeteraNuevoPujador == null)
                {
                    throw new NegocioException("La billetera del usuario actual no pudo ser localizada.");
                }

                // Retener el dinero de garantía (se debita de SaldoDisponible y se incrementa en SaldoRetenido)
                billeteraNuevoPujador.Retener(request.Monto);
                await _billeteraRepository.ActualizarAsync(billeteraNuevoPujador);

                // Registrar movimiento en el libro mayor contable (Ledger)
                var ledgerNuevo = new TransaccionLedger
                {
                    BilleteraId = billeteraNuevoPujador.Id,
                    TipoMovimiento = TipoMovimiento.RETENCION,
                    Monto = request.Monto,
                    Fecha = DateTime.UtcNow,
                    SubastaId = subasta.Id
                };
                await _billeteraRepository.RegistrarLedgerAsync(ledgerNuevo);

                // 6. Si hay un postor líder previo, liberar inmediatamente su saldo de garantía retenido
                if (pujaLiderAnterior != null)
                {
                    var billeteraLiderAnterior = await _billeteraRepository.ObtenerPorUsuarioIdAsync(pujaLiderAnterior.UsuarioId);
                    if (billeteraLiderAnterior == null)
                    {
                        throw new NegocioException("La billetera del postor líder previo no pudo ser localizada.");
                    }

                    // Liberar el dinero retenido previamente
                    billeteraLiderAnterior.Liberar(pujaLiderAnterior.Monto);
                    await _billeteraRepository.ActualizarAsync(billeteraLiderAnterior);

                    // Registrar liberación en Ledger
                    var ledgerAnterior = new TransaccionLedger
                    {
                        BilleteraId = billeteraLiderAnterior.Id,
                        TipoMovimiento = TipoMovimiento.LIBERACION,
                        Monto = pujaLiderAnterior.Monto,
                        Fecha = DateTime.UtcNow,
                        SubastaId = subasta.Id
                    };
                    await _billeteraRepository.RegistrarLedgerAsync(ledgerAnterior);
                }

                // 7. Guardar la nueva puja liderando
                var nuevaPuja = new Puja
                {
                    SubastaId = subasta.Id,
                    UsuarioId = request.UsuarioId,
                    Monto = request.Monto,
                    FechaPuja = DateTime.UtcNow
                };
                await _subastaRepository.GuardarPujaAsync(nuevaPuja);

                // 8. PASO 3 - Regla Anti-Sniping: Extensión dinámica de tiempo en zona crítica
                double segundosAlCierre = (subasta.FechaFin - DateTime.UtcNow).TotalSeconds;
                if (segundosAlCierre > 0 && segundosAlCierre <= 60)
                {
                    DateTime fechaAnterior = subasta.FechaFin;
                    subasta.FechaFin = subasta.FechaFin.AddMinutes(2);

                    // Registrar evento de negocio de auditoría inmutable
                    var logAntiSniping = new AuditLog
                    {
                        Entidad = "Subasta",
                        EntidadId = subasta.Id,
                        Accion = "EXTENSION_TIEMPO",
                        Detalle = $"Mecanismo anti-sniping gatillado por puja del usuario {request.UsuarioId}. Fecha de finalización extendida de {fechaAnterior:yyyy-MM-dd HH:mm:ss} a {subasta.FechaFin:yyyy-MM-dd HH:mm:ss}.",
                        Fecha = DateTime.UtcNow,
                        UsuarioId = request.UsuarioId
                    };
                    await _billeteraRepository.RegistrarAuditLogAsync(logAntiSniping);
                }

                // Incrementar manualmente o forzar la actualización de la versión de bloqueo optimista
                await _subastaRepository.ActualizarAsync(subasta);

                // 9. Completamos y cerramos la unidad de trabajo
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex) when (ex is not NegocioException)
            {
                // Ante cualquier error inesperado o de base de datos, realizamos rollback de inmediato
                await _unitOfWork.RollbackTransactionAsync();

                // Si EF Core detecta que otra petición actualizó el registro antes de este SaveChanges
                if (ex.Message.Contains("concurrency",StringComparison.OrdinalIgnoreCase) || ex.InnerException != null) 
                {
                    // Dejamos un registro del fallo de concurrencia para auditoría
                    var logRechazo = new AuditLog
                    {
                        Entidad = "Subasta",
                        EntidadId = request.SubastaId,
                        Accion = "RECHAZO_CONCURRENCIA",
                        Detalle = $"Puja del usuario {request.UsuarioId} rechazada debido a conflicto de concurrencia optimista al intentar confirmar.",
                        Fecha = DateTime.UtcNow,
                        UsuarioId = request.UsuarioId
                    };

                    throw new ConcurrenciaException("Conflicto de concurrencia al procesar la puja. Alguien ofertó antes de que guardes. Por favor, intenta de nuevo.");
                }

                throw;
            }
            catch (NegocioException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
    