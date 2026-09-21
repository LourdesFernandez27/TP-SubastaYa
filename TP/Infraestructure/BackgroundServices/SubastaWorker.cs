using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Domain.Entities;
using Domain.Enums;
using Infraestructure.Persistence;
using System.Linq.Expressions;

namespace Infraestructure.BackgroundServices
{
    public class SubastaWorker: BackgroundService
    {

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SubastaWorker> _logger;

        public SubastaWorker(IServiceScopeFactory scopeFactory, ILogger<SubastaWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SubastaWorker iniciado correctamente.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcesarSubastasExpiradasAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,"Error al ejecutar la liquidación en el Background Worker.");
                }

                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        private async Task ProcesarSubastasExpiradasAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var ahora = DateTime.UtcNow;

            var subastasVencidas = await context.Subastas
                .Include(s => s.Pujas)
                .Where(s => s.Estado == EstadoSubasta.ACTIVA && s.FechaFin <= ahora)
                .ToListAsync();

            if (!subastasVencidas.Any()) return;

            for (int i = 0; i < subastasVencidas.Count; i++)
            {
                var subasta = subastasVencidas[i];
                using var transaccion = await context.Database.BeginTransactionAsync();

                try
                {
                    if (subasta.Pujas != null && subasta.Pujas.Count > 0)
                    {
                        Puja? pujaGanadora = null;
                        decimal montoMaximo = 0;

                        for (int j = 0; j < subasta.Pujas.Count; j++)
                        {
                            var puja = subasta.Pujas[j];
                            if (puja.Monto > montoMaximo)
                            {
                                montoMaximo = puja.Monto;
                                pujaGanadora = puja;
                            }
                        }

                        if (pujaGanadora != null)
                        {
                            var billeteraComprador = await context.Billeteras
                                .FirstOrDefaultAsync(b => b.UsuarioId == pujaGanadora.CompradorId);

                            var billeteraVendedor = await context.Billeteras
                                .FirstOrDefaultAsync(b => b.UsuarioId == subasta.VendedorId);

                            if (billeteraComprador == null || billeteraVendedor == null)
                            {
                                throw new Exception("No se pudieron localizar las billeteras de los participantes de la transacción.");
                            }

                            if (billeteraComprador.SaldoRetenido < pujaGanadora.Monto)
                            {
                                billeteraComprador.SaldoRetenido = pujaGanadora.Monto;
                            }

                            billeteraComprador.ConfirmarDebito(pujaGanadora.Monto);
                            context.Billeteras.Update(billeteraComprador);

                            var ledgerComprador = new Transaccion_Ledger
                            {
                                BilleteraId = billeteraComprador.Id,
                                TipoMovimiento = TipoMovimiento.PAGO,
                                Monto = pujaGanadora.Monto,
                                Fecha = DateTime.UtcNow,
                                SubastaId = subasta.Id
                            };
                            await context.Transacciones.AddAsync(ledgerComprador);

                            billeteraVendedor.Depositar(pujaGanadora.Monto);
                            context.Billeteras.Update(billeteraVendedor);

                            var ledgerVendedor = new Transaccion_Ledger
                            {
                                BilleteraId = billeteraVendedor.Id,
                                TipoMovimiento = TipoMovimiento.COBRO,
                                Monto = pujaGanadora.Monto,
                                Fecha = DateTime.UtcNow,
                                SubastaId = subasta.Id
                            };
                            await context.Transacciones.AddAsync(ledgerVendedor);

                            subasta.Estado = EstadoSubasta.FINALIZADA;
                            context.Subastas.Update(subasta);

                            var logAdjudicacion = new Auditoria_Log
                            {
                                Entidad = "Subasta",
                                EntidadId = subasta.Id,
                                Accion = "CAMBIO_ESTADO",
                                detalle_json = $"Subasta finalizada exitosamente. Adjudicada al usuario {pujaGanadora.CompradorId} por un monto de {pujaGanadora.Monto}.",
                                Fecha = DateTime.UtcNow
                            };
                            await context.Auditorias.AddAsync(logAdjudicacion);
                        } 
                    }
                    else
                    {
                        subasta.Estado = EstadoSubasta.DESIERTA;
                        context.Subastas.Update(subasta);

                        var logDesierta = new Auditoria_Log
                        {
                            Entidad = "Subasta",
                            EntidadId = subasta.Id,
                            Accion = "CAMBIO_ESTADO",
                            detalle_json = "Subasta finalizada sin ofertas recibidas. Declarada en estado DESIERTA.",
                            Fecha = DateTime.UtcNow
                        };
                        await context.Auditorias.AddAsync(logDesierta);
                    }

                    await context.SaveChangesAsync();
                    await transaccion.CommitAsync();

                    _logger.LogInformation($"Subasta {subasta.Id} procesada exitosamente con estado {subasta.Estado}.");
                }
                catch (Exception ex)
                {
                    await transaccion.RollbackAsync();
                    _logger.LogError(ex, $"Falló la liquidación transaccional de la subasta {subasta.Id}. Realizando rollback.");
                }
            }
        }
    }

}

