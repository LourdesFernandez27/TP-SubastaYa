using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
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
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var subasta = await _subastaRepository.ObtenerPorIdAsync(request.SubastaId);
                if (subasta == null)
                {
                    throw new NegocioException("La subasta especificada no existe.");
                }

                if (subasta.Estado != EstadoSubasta.ACTIVA)
                {
                    throw new NegocioException("La subasta no se encuentra en estado ACTIVA para recibir ofertas.");
                }

                if (DateTime.UtcNow >= subasta.FechaFin)
                {
                    throw new NegocioException("La subasta ha alcanzado su límite de tiempo y no admite nuevas ofertas.");
                }

                if (subasta.VendedorId == request.UsuarioId)
                {
                    throw new NegocioException("El propietario de la subasta no está autorizado a ofertar en ella.");
                }

                decimal ofertaMasAlta = subasta.ObtenerOfertaMasAlta();
                decimal montoMinimoRequerido = subasta.Pujas.Count == 0
                    ? subasta.PrecioBase
                    : ofertaMasAlta + subasta.IncrementoMinimo;

                if (request.Monto < montoMinimoRequerido)
                {
                    throw new NegocioException($"El monto ofertado debe alcanzar o superar el incremento mínimo requerido de {montoMinimoRequerido}.");
                }

                Puja? pujaLiderAnterior = null;
                decimal maxValorPujado = 0;

                for (int i = 0; i < subasta.Pujas.Count; i++)
                {
                    var pujaTemporal = subasta.Pujas[i];
                    if (pujaTemporal.Monto > maxValorPujado)
                    {
                        maxValorPujado = pujaTemporal.Monto;
                        pujaLiderAnterior = pujaTemporal;
                    }
                }

                var billeteraNuevoPujador = await _billeteraRepository.ObtenerPorUsuarioIdAsync(request.UsuarioId);
                if (billeteraNuevoPujador == null)
                {
                    throw new NegocioException("La billetera del usuario actual no pudo ser localizada.");
                }

                billeteraNuevoPujador.Retener(request.Monto);
                await _billeteraRepository.ActualizarAsync(billeteraNuevoPujador);

                var ledgerNuevo = new Transaccion_Ledger
                {
                    BilleteraId = billeteraNuevoPujador.Id,
                    TipoMovimiento = TipoMovimiento.RETENCION,
                    Monto = request.Monto,
                    Fecha = DateTime.UtcNow,
                    SubastaId = subasta.Id
                };
                await _billeteraRepository.RegistrarLedgerAsync(ledgerNuevo);

                if (pujaLiderAnterior != null)
                {
                    var billeteraLiderAnterior = await _billeteraRepository.ObtenerPorUsuarioIdAsync(pujaLiderAnterior.CompradorId);
                    if (billeteraLiderAnterior == null)
                    {
                        throw new NegocioException("La billetera del postor líder previo no pudo ser localizada.");
                    }

       
                    billeteraLiderAnterior.Liberar(pujaLiderAnterior.Monto);
                    await _billeteraRepository.ActualizarAsync(billeteraLiderAnterior);


                    var ledgerAnterior = new Transaccion_Ledger
                    {
                        BilleteraId = billeteraLiderAnterior.Id,
                        TipoMovimiento = TipoMovimiento.LIBERACION,
                        Monto = pujaLiderAnterior.Monto,
                        Fecha = DateTime.UtcNow,
                        SubastaId = subasta.Id
                    };
                    await _billeteraRepository.RegistrarLedgerAsync(ledgerAnterior);
                }


                var nuevaPuja = new Puja
                {
                    SubastaId = subasta.Id,
                    CompradorId = request.UsuarioId,
                    Monto = request.Monto,
                    FechaPuja = DateTime.UtcNow
                };
                await _subastaRepository.GuardarPujaAsync(nuevaPuja);


                double segundosAlCierre = (subasta.FechaFin - DateTime.UtcNow).TotalSeconds;
                if (segundosAlCierre > 0 && segundosAlCierre <= 60)
                {
                    DateTime fechaAnterior = subasta.FechaFin;
                    subasta.FechaFin = subasta.FechaFin.AddMinutes(2);

 
                    var logAntiSniping = new Auditoria_Log
                    {
                        Entidad = "Subasta",
                        EntidadId = subasta.Id,
                        Accion = "EXTENSION_TIEMPO",
                        detalle_json = $"Mecanismo anti-sniping gatillado por puja del usuario {request.UsuarioId}. Fecha de finalización extendida de {fechaAnterior:yyyy-MM-dd HH:mm:ss} a {subasta.FechaFin:yyyy-MM-dd HH:mm:ss}.",
                        Fecha = DateTime.UtcNow,
                        UsuarioId = request.UsuarioId
                    };
                    await _billeteraRepository.RegistrarAuditLogAsync(logAntiSniping);
                }

  
                await _subastaRepository.ActualizarAsync(subasta);


                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex) when (ex is not NegocioException)
            {
   
                await _unitOfWork.RollbackTransactionAsync();


                if (ex.Message.Contains("concurrency",StringComparison.OrdinalIgnoreCase) || ex.InnerException != null) 
                {

                    var logRechazo = new Auditoria_Log
                    {
                        Entidad = "Subasta",
                        EntidadId = request.SubastaId,
                        Accion = "RECHAZO_CONCURRENCIA",
                        detalle_json = $"Puja del usuario {request.UsuarioId} rechazada debido a conflicto de concurrencia optimista al intentar confirmar.",
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
    