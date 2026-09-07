using Domain.Entities;
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
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Subasta> Subastas { get; set; }
        public DbSet<Puja> Pujas { get; set; }

						protected override void OnModelCreating(ModelBuilder moderlBuilder)
						{
								modelBuilder.Entity<Subasta>(entity =>
								{
								entity.ToTable("Subasta");
								entity.HasKey(e => e.Id);
								entity.Property(e => e.Id).ValueGeneratedOnAdd();
								entity.HasMany(s => s.Pujas)
								.WithOne(p => p.Subasta)
								.HasForeignKey(p => p.SubastaId);
								});
								
								modelBuilder.Entity<Usuario>(entity =>
								{
								entity.ToTable("Usuario");
								entity.HasKey(e => e.Id);
								entity.HasOne(u => u.Billetera)
								.WithOne(b => b.Usuario)
								.HasForeignKey<Billetera>(b => b.UsuarioId);
								});
							
								modelBuilder.Entity<Puja>(entity =>
								{
								entity.ToTable("Puja");
								entity.HasKey(e => e.Id);
								entity.HasOne(p => p.Subasta)
								.WithMany(s => s.Pujas)
								.HasForeignKey(p => p.SubastaId);
								});							
						}
    }
}
