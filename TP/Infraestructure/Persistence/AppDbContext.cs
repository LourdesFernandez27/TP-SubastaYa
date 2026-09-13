using Domain.Entities;
using Infraestructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Infraestructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Billetera> Billeteras => Set<Billetera>();
        public DbSet<Categoria> Categorias => Set<Categoria>();
        public DbSet<Subasta> Subastas => Set<Subasta>();
        public DbSet<Puja> Pujas => Set<Puja>();
        public DbSet<TransaccionLedger> LedgerEntries => Set<TransaccionLedger>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Aplicamos configuraciones individuales por entidad
            modelBuilder.ApplyConfiguration(new UsuarioConfiguration());
            modelBuilder.ApplyConfiguration(new BilleteraConfiguration());
            modelBuilder.ApplyConfiguration(new SubastaConfiguration());
            modelBuilder.ApplyConfiguration(new PujaConfiguration());
        }
    }


}
