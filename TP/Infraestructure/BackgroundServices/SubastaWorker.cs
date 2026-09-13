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

                // Esperar 10 segundos antes del siguiente ciclo
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        private async Task ProcesarSubastasExpiradasAsync()
        {
            // Al ser un Singleton, creamos un Scope para resolver el DbContext (Scoped)
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var ahora = DateTime.UtcNow;

            // Buscamos subastas activas cuyo límite de tiempo haya pasado
            var subastasVencidas = await context.Subastas
                .Include(s => s.Pujas)
                .Where(s => s.Estado == EstadoSubasta.ACTIVA && s.FechaFin <= ahora)
                .ToListAsync();

            if (!subastasVencidas.Any()) return;

            for (int i = 0; i < subastasVencidas.Count; i++)
            {
                var subasta = subastasVencidas[i];

                // Iniciamos transacción individual por cada subasta para aislar fallas
                using var transaccion = await context.Database.BeginTransactionAsync();

                try
                {
                    if (subasta.Pujas != null && subasta.Pujas.Count > 0)
                    {
                        // 1. Encontrar la oferta líder utilizando bucle tradicional
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
                            // 2. Resolver billeteras de comprador y vendedor
                            var billeteraComprador = await context.Billeteras
                                .FirstOrDefaultAsync(b => b.UsuarioId == pujaGanadora.UsuarioId);

                            var billeteraVendedor = await context.Billeteras
                                .FirstOrDefaultAsync(b => b.UsuarioId == subasta.VendedorId);

                            if (billeteraComprador == null || billeteraVendedor == null)
                            {
                                throw new Exception("No se pudieron localizar las billeteras de los participantes de la transacción.");
                            }

                            // 3. Confirmar débito al comprador (elimina del saldo retenido definitivamente)
                            billeteraComprador.ConfirmarDebito(pujaGanadora.Monto);
                            context.Billeteras.Update(billeteraComprador);

                            // Registrar movimiento del comprador (Débito/Pago)
                            var ledgerComprador = new TransaccionLedger
                            {
                                BilleteraId = billeteraComprador.Id,
                                TipoMovimiento = TipoMovimiento.PAGO,
                                Monto = pujaGanadora.Monto,
                                Fecha = DateTime.UtcNow,
                                SubastaId = subasta.Id
                            };
                            await context.LedgerEntries.AddAsync(ledgerComprador);

                            // 4. Depositar saldo final al vendedor
                            billeteraVendedor.Depositar(pujaGanadora.Monto);
                            context.Billeteras.Update(billeteraVendedor);

                            // Registrar movimiento del vendedor (Crédito/Cobro)
                            var ledgerVendedor = new TransaccionLedger
                            {
                                BilleteraId = billeteraVendedor.Id,
                                TipoMovimiento = TipoMovimiento.COBRO,
                                Monto = pujaGanadora.Monto,
                                Fecha = DateTime.UtcNow,
                                SubastaId = subasta.Id
                            };
                            await context.LedgerEntries.AddAsync(ledgerVendedor);

                            // 5. Cambiar estado de la subasta a FINALIZADA
                            subasta.Estado = EstadoSubasta.FINALIZADA;
                            context.Subastas.Update(subasta);

                            // 6. Auditoría inmutable de adjudicación exitosa
                            var logAdjudicacion = new AuditLog
                            {
                                Entidad = "Subasta",
                                EntidadId = subasta.Id,
                                Accion = "CAMBIO_ESTADO",
                                Detalle = $"Subasta finalizada exitosamente. Adjudicada al usuario {pujaGanadora.UsuarioId} por un monto de {pujaGanadora.Monto}.",
                                Fecha = DateTime.UtcNow
                            };
                            await context.AuditLogs.AddAsync(logAdjudicacion);
                        }
                    }
                    else
                    {
                        // No tuvo ofertas, pasa a ser DESIERTA
                        subasta.Estado = EstadoSubasta.DESIERTA;
                        context.Subastas.Update(subasta);

                        // Auditoría de estado desierto
                        var logDesierta = new AuditLog
                        {
                            Entidad = "Subasta",
                            EntidadId = subasta.Id,
                            Accion = "CAMBIO_ESTADO",
                            Detalle = "Subasta finalizada sin ofertas recibidas. Declarada en estado DESIERTA.",
                            Fecha = DateTime.UtcNow
                        };
                        await context.AuditLogs.AddAsync(logDesierta);
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

