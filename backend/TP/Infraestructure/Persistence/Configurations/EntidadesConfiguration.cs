using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestructure.Persistence.Configurations;
       public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
    {
        public void Configure(EntityTypeBuilder<Usuario> builder)
        {
            builder.ToTable("Usuarios");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Name).HasMaxLength(100).IsRequired();
            builder.Property(u => u.Email).HasMaxLength(150).IsRequired();

            builder.HasOne(u => u.Billetera)
                   .WithOne(b => b.Usuario)
                   .HasForeignKey<Billetera>(b => b.UsuarioId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.Auditoria)
                 .WithOne(a => a.Usuario)
                 .HasForeignKey(a => a.UsuarioId)
                 .IsRequired(false);
        }
    }
    public class BilleteraConfiguration : IEntityTypeConfiguration<Billetera>
    {
        public void Configure(EntityTypeBuilder<Billetera> builder)
        {
            builder.ToTable("Billeteras");
            builder.HasKey(b => b.Id);

            builder.Property(b => b.Version)
                   .IsConcurrencyToken();

            builder.Ignore(b => b.SaldoTotal);
        }
    }
public class SubastaConfiguration : IEntityTypeConfiguration<Subasta>
{
    public void Configure(EntityTypeBuilder<Subasta> builder)
    {
        builder.ToTable("Subastas");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Titulo).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Descripcion).HasMaxLength(1000);
        builder.Property(s => s.Version).IsConcurrencyToken();

        builder.HasMany(s => s.Pujas)
               .WithOne(p => p.Subasta)
               .HasForeignKey(p => p.SubastaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Transacciones)
               .WithOne(t => t.Subasta)
               .HasForeignKey(t => t.SubastaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Vendedor)
               .WithMany(u => u.Subastas)
               .HasForeignKey(s => s.VendedorId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Categoria)
               .WithMany(c => c.Subastas)
               .HasForeignKey(s => s.CategoriaId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
public class PujaConfiguration : IEntityTypeConfiguration<Puja>
{
    public void Configure(EntityTypeBuilder<Puja> builder)
    {
        builder.ToTable("Pujas");
        builder.HasKey(p => p.Id);

        builder.HasOne(p => p.Comprador)
               .WithMany(u => u.Pujas)
               .HasForeignKey(p => p.CompradorId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> builder)
    {
        builder.ToTable("Categorias");
        builder.HasKey(c => c.Id);
    }
}
public class TransaccionLedgerConfiguration : IEntityTypeConfiguration<Transaccion_Ledger>
{
    public void Configure(EntityTypeBuilder<Transaccion_Ledger> builder)
    {
        builder.ToTable("Transaccion_Ledger");
        builder.HasKey(t => t.Id);

        builder.HasOne(t => t.Billetera)
               .WithMany()
               .HasForeignKey(t => t.BilleteraId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Subasta).WithMany(s => s.Transacciones).HasForeignKey(t => t.SubastaId);
    }
}
public class AuditoriaLogConfiguration : IEntityTypeConfiguration<Auditoria_Log>
{
    public void Configure(EntityTypeBuilder<Auditoria_Log> builder)
    {
        builder.ToTable("Auditoria_Log");
        builder.HasKey(a => a.Id);

    }
}
