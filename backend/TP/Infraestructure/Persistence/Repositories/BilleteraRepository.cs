using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence.Repositories
{
    public class BilleteraRepository : IBilleteraRepository
    {
        private readonly AppDbContext _context;

        public BilleteraRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Billetera?> ObtenerPorUsuarioIdAsync(int usuarioId)
        {
            return await _context.Billeteras
                .FirstOrDefaultAsync(b => b.UsuarioId == usuarioId);
        }

        public async Task ActualizarAsync(Billetera billetera)
        {
            _context.Billeteras.Update(billetera);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarLedgerAsync(Transaccion_Ledger ledger)
        {
            await _context.Transacciones.AddAsync(ledger);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarAuditLogAsync(Auditoria_Log log)
        {
            await _context.Auditorias.AddAsync(log);
            await _context.SaveChangesAsync();
        }

    }
}
