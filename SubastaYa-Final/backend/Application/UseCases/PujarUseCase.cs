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
                if (subasta == null) throw new NegocioException("La subasta no existe.");

                // Auto-activación (esto sí queda en UseCase)
                if (subasta.FechaInicio <= DateTime.UtcNow && subasta.Estado == EstadoSubasta.PROGRAMADA)
                {
                    subasta.Estado = EstadoSubasta.ACTIVA;
                }

                // 1. TODO EL DOMINIO DE SUBASTA EN UNA SOLA LÍNEA - ya valida estado, fecha, vendedor, monto y hace Version++
                var nuevaPuja = subasta.Pujar(request.UsuarioId, request.Monto);

                // 2. Billetera nuevo pujador
                var billeteraNuevo = await _billeteraRepository.ObtenerPorUsuarioIdAsync(request.UsuarioId);
                billeteraNuevo.Retener(request.Monto); // ya valida saldo y hace Version++

                // 3. Buscar líder anterior para liberarle
                var pujaLiderAnterior = subasta.Pujas.OrderByDescending(p => p.Monto).FirstOrDefault();
                if (pujaLiderAnterior != null)
                {
                    var billeteraAnterior = await _billeteraRepository.ObtenerPorUsuarioIdAsync(pujaLiderAnterior.CompradorId);
                    billeteraAnterior.Liberar(pujaLiderAnterior.Monto);

                    await _billeteraRepository.RegistrarLedgerAsync(new Transaccion_Ledger
                    {
                        BilleteraId = billeteraAnterior.Id,
                        TipoMovimiento = TipoMovimiento.LIBERACION,
                        Monto = pujaLiderAnterior.Monto,
                        Fecha = DateTime.UtcNow,
                        SubastaId = subasta.Id
                    });
                    await _billeteraRepository.ActualizarAsync(billeteraAnterior);
                }

                await _billeteraRepository.RegistrarLedgerAsync(new Transaccion_Ledger
                {
                    BilleteraId = billeteraNuevo.Id,
                    TipoMovimiento = TipoMovimiento.RETENCION,
                    Monto = request.Monto,
                    Fecha = DateTime.UtcNow,
                    SubastaId = subasta.Id
                });

                await _billeteraRepository.ActualizarAsync(billeteraNuevo);
                await _subastaRepository.GuardarPujaAsync(nuevaPuja);

                // Anti-sniping
                if ((subasta.FechaFin - DateTime.UtcNow).TotalSeconds is > 0 and <= 60)
                {
                    subasta.FechaFin = subasta.FechaFin.AddMinutes(2);
                }

                await _subastaRepository.ActualizarAsync(subasta);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex) when (ex is not NegocioException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                if (ex.InnerException?.Message.Contains("concurrency", StringComparison.OrdinalIgnoreCase) == true
                    || ex.Message.Contains("concurrency", StringComparison.OrdinalIgnoreCase))
                {
                    throw new ConcurrenciaException("Conflicto de concurrencia. Otro pujó antes. Intentá de nuevo.");
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
    
    