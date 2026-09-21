using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.Metadata.Ecma335;
using Microsoft.EntityFrameworkCore;
using Application.DTOs;
using System;
using System.Threading.Tasks;
using Infraestructure.Persistence;

namespace TP_Subasta.Controllers
{
    [ApiController]
    [Route("api/wallet")]
    public class WalletController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WalletController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance([FromQuery] int usuarioId)
        {
            try
            {
                var billetera = await _context.Billeteras
                    .AsNoTracking()
                    .FirstOrDefaultAsync(b => b.UsuarioId == usuarioId);

                if (billetera == null)
                {
                    return NotFound(new { mensaje = $"No se encontró billetera para el usuario {usuarioId}" });
                }

                return Ok(new
                {
                    saldoTotal = billetera.SaldoTotal,
                    saldoRetenido = billetera.SaldoRetenido,
                    saldoDisponible = billetera.SaldoDisponible
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al procesar la solicitud", detalle = ex.Message });
            }
        }

        [HttpPost("deposit")]
        public async Task<IActionResult> Depositar([FromBody] DepositoRequest request)
        {
            try
            {
                var billetera = await _context.Billeteras
                    .FirstOrDefaultAsync(b => b.UsuarioId == request.UsuarioId);

                if (billetera == null)
                {
                    return NotFound(new { mensaje = $"No se encontró billetera para el usuario {request.UsuarioId}" });
                }

                billetera.SaldoDisponible += request.Monto;
                billetera.Version++;
                _context.Billeteras.Update(billetera);

                var ledger = new Transaccion_Ledger
                {
                    BilleteraId = billetera.Id,
                    TipoMovimiento = TipoMovimiento.DEPOSITO,
                    Monto = request.Monto,
                    Fecha = System.DateTime.UtcNow
                };
                await _context.Transacciones.AddAsync(ledger);

                var logAuditoria = new Auditoria_Log
                {
                    Entidad = "Billetera",
                    EntidadId = billetera.Id,
                    Accion = "CARGA_SALDO",
                    Fecha = System.DateTime.UtcNow,
                    UsuarioId = request.UsuarioId,
                    detalle_json = $"{{\"Monto\": {request.Monto}}}"
                };
                await _context.Auditorias.AddAsync(logAuditoria);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    mensaje = "Depósito realizado exitosamente",
                    saldoDisponible = billetera.SaldoDisponible,
                    saldoTotal = billetera.SaldoTotal
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al procesar la solicitud", detalle = ex.Message });
            }
        }
        [HttpGet("historial")]
        public async Task<IActionResult> GetHistorial([FromQuery] int usuarioId)
        {
            var billetera = await _context.Billeteras
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.UsuarioId == usuarioId);
            if (billetera == null)
                return NotFound("Billetera no encontrada");

            var historial = await _context.Transacciones
                .Where(t => t.BilleteraId == billetera.Id)
                .OrderByDescending(t => t.Fecha)
                .Select(t => new
                {
                    t.Id,
                    Tipo = t.TipoMovimiento.ToString(),
                    t.Monto,
                    t.Fecha,
                    t.SubastaId
                }).ToListAsync();
            return Ok(historial);
        }
    }
}

