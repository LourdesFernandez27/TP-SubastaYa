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

            // 1:1 con Billetera
            builder.HasOne(u => u.Billetera)
                   .WithOne(b => b.Usuario)
                   .HasForeignKey<Billetera>(b => b.UsuarioId)
                   .OnDelete(DeleteBehavior.Cascade);

            // 1:N con Auditoria_Log
            builder.HasMany(u => u.Auditoria)
                   .WithOne(a => a.Usuario)
                   .HasForeignKey(a => a.UsuarioId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.Cascade);

            // Las relaciones con Subasta (Vendedor) y Puja (Comprador)
            // se configuran del lado de SubastaConfiguration y PujaConfiguration,
            // pero como ahí usamos .WithMany(u => u.Subastas/Pujas), quedan
            // correctamente atadas a estas colecciones igual.
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

            // SaldoTotal es calculada (solo lectura), no se mapea a columna
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

        // 1:N con Pujas
        builder.HasMany(s => s.Pujas)
               .WithOne(p => p.Subasta)
               .HasForeignKey(p => p.SubastaId)
               .OnDelete(DeleteBehavior.Cascade);

        // 1:N con Transacciones
        builder.HasMany(s => s.Transacciones)
               .WithOne(t => t.Subasta)
               .HasForeignKey(t => t.SubastaId)
               .OnDelete(DeleteBehavior.Cascade);

        // N:1 con Vendedor (Usuario)
        builder.HasOne(s => s.Vendedor)
               .WithMany(u => u.Subastas)
               .HasForeignKey(s => s.VendedorId)
               .OnDelete(DeleteBehavior.Restrict);

        // N:1 con Categoria
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

        // La relación 1:N con Subastas queda configurada
        // del lado de SubastaConfiguration (HasOne(s => s.Categoria).WithMany(...)).
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

        // Subasta -> Transacciones ya se configura en SubastaConfiguration,
        // pero si Transaccion_Ledger tiene navegación a Subasta, agregala acá también:
        builder.HasOne(t => t.Subasta).WithMany(s => s.Transacciones).HasForeignKey(t => t.SubastaId);
    }
}
public class AuditoriaLogConfiguration : IEntityTypeConfiguration<Auditoria_Log>
{
    public void Configure(EntityTypeBuilder<Auditoria_Log> builder)
    {
        builder.ToTable("Auditoria_Log");
        builder.HasKey(a => a.Id);

        // La relación con Usuario ya se configura en UsuarioConfiguration
        // (HasMany(u => u.Auditoria).WithOne(a => a.Usuario)...)
    }
}
