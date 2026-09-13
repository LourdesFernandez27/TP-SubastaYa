using Application.Interfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Infraestructure.Persistence;

namespace Infraestructure.Persistence.Repositories
{
    public class SubastaRepository : ISubastaRepository
    {
        private readonly AppDbContext _context;

        public SubastaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Subasta?>ObtenerPorIdAsync(int id)
       
        {
            // Cargamos la subasta con sus pujas asociadas de forma eagerly
            return await _context.Subastas
                .Include(s => s.Pujas)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
        public async Task ActualizarAsync(Subasta subasta)
        {
            _context.Subastas.Update(subasta);
            await _context.SaveChangesAsync();
        }

        public async Task GuardarPujaAsync(Puja puja)
        {
            await _context.Pujas.AddAsync(puja);
            await _context.SaveChangesAsync();
        }
    }
}
