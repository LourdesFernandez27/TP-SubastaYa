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
        public AppDbContext()
        {
        }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Billetera> Billeteras { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Subasta> Subastas { get; set; }
        public DbSet<Puja> Pujas { get; set; }
        public DbSet<Transaccion_Ledger> Transacciones { get; set; }
        public DbSet<Auditoria_Log> Auditorias { get; set; }

        /*
         * protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                modelBuilder.Entity<Usuario>(entity =>
                {
                    entity.ToTable("Usuario");
                    entity.HasKey(e => e.Id);

                    // 1 a 1: Usuario <-> Billetera
                    // En 1 a 1 se especifica el tipo dependiente en el genérico: HasForeignKey<Billetera>
                    entity.HasOne(u => u.Billetera)
                          .WithOne(b => b.Usuario)
                          .HasForeignKey<Billetera>(b => b.UsuarioId);

                    // 1 a Muchos: Usuario (Vendedor) <-> Subastas
                    // En 1 a Muchos NO lleva parámetro de tipo genérico en HasForeignKey
                    entity.HasMany(u => u.Subastas)
                          .WithOne(s => s.Vendedor)
                          .HasForeignKey(s => s.VendedorId)
                          .OnDelete(DeleteBehavior.Restrict);

                    // 1 a Muchos: Usuario (Comprador) <-> Pujas
                    entity.HasMany(u => u.Pujas)
                          .WithOne(p => p.Comprador)
                          .HasForeignKey(p => p.CompradorId)
                          .OnDelete(DeleteBehavior.Restrict);

                    // 1 a Muchos: Usuario <-> Auditoria
                    entity.HasMany(u => u.Auditoria)
                          .WithOne(a => a.Usuario)
                          .HasForeignKey(a => a.UsuarioId);
                });

                modelBuilder.Entity<Billetera>(entity =>
                {
                    entity.ToTable("Billetera");
                    entity.HasKey(e => e.Id);

                    // SaldoTotal es calculada (solo lectura)
                    entity.Ignore(b => b.SaldoTotal);
                });

                modelBuilder.Entity<Categoria>(entity =>
                {
                    entity.ToTable("Categoria");
                    entity.HasKey(e => e.Id);

                    // 1 a Muchos: Categoria <-> Subastas
                    entity.HasMany(c => c.Subastas)
                          .WithOne(s => s.Categoria)
                          .HasForeignKey(s => s.CategoriaId);
                });

                modelBuilder.Entity<Subasta>(entity =>
                {
                    entity.ToTable("Subasta");
                    entity.HasKey(e => e.Id);
                    entity.Property(e => e.Id).ValueGeneratedOnAdd();

                    // 1 a Muchos: Subasta <-> Pujas
                    entity.HasMany(s => s.Pujas)
                          .WithOne(p => p.Subasta)
                          .HasForeignKey(p => p.SubastaId);

                    // 1 a Muchos: Subasta <-> Transacciones
                    entity.HasMany(s => s.Transacciones)
                          .WithOne(t => t.Subasta)
                          .HasForeignKey(t => t.SubastaId);
                });

                modelBuilder.Entity<Puja>(entity =>
                {
                    entity.ToTable("Puja");
                    entity.HasKey(e => e.Id);
                });

                modelBuilder.Entity<Transaccion_Ledger>(entity =>
                {
                    entity.ToTable("Transaccion_Ledger");
                    entity.HasKey(e => e.Id);

                    // Muchos a 1: Transaccion <-> Billetera
                    entity.HasOne(t => t.Billetera)
                          .WithMany()
                          .HasForeignKey(t => t.BilleteraId);
                });

                modelBuilder.Entity<Auditoria_Log>(entity =>
                {
                    entity.ToTable("Auditoria_Log");
                    entity.HasKey(e => e.Id);
                });
            }
        */
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }

}
