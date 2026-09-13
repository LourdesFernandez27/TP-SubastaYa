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

        // Relación 1:1 con Billetera
        builder.HasOne(u => u.Billetera)
               .WithOne()
               .HasForeignKey<Billetera>(b => b.UsuarioId)
               .OnDelete(DeleteBehavior.Cascade);

    }
}

public class BilleteraConfiguration : IEntityTypeConfiguration<Billetera>
{
    public void Configure(EntityTypeBuilder<Billetera> builder)
    {
        builder.ToTable("Billeteras");
        builder.HasKey(b => b.Id);

        // Mapeamos Version como Concurrency Token para evitar colisiones de saldos
        builder.Property(b => b.Version)
               .IsConcurrencyToken();
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

        // Configuración para Optimistic Locking
        builder.Property(s => s.RowVersion).IsRowVersion();

        // Relación 1:N con Pujas
        builder.HasMany(s => s.Pujas)
               .WithOne(p => p.Subasta)
               .HasForeignKey(p => p.SubastaId)
               .OnDelete(DeleteBehavior.Cascade);

        // Relación de la subasta con su vendedor
        builder.HasOne(s => s.Vendedor)
               .WithMany()
               .HasForeignKey(s => s.VendedorId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
public class PujaConfiguration : IEntityTypeConfiguration<Puja>
{
    public void Configure(EntityTypeBuilder<Puja> builder)
    {
        builder.ToTable("Pujas");
        builder.HasKey(p => p.Id);

        builder.HasOne(p => p.Usuario)
               .WithMany()
               .HasForeignKey(p => p.UsuarioId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
