using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infraestructure.Persistence
{
    public class Seed
    {
        public static void SeedDB(AppDbContext context)
        { // Evitamos duplicar datos si ya existen registros en la BD
            if (context.Usuarios.Any())
                { return; } 
            // 1\. Categorías obligatorias [1]
            var catTecnologia = new Categoria 
            {
                Nombre = "Tecnología", 
                Url_icono = "https://cdn-icons-png.flaticon.com/512/689/689307.png" 
            };

            var catColeccionables = new Categoria 
            {
                Nombre = "Coleccionables", 
                Url_icono = "https://cdn-icons-png.flaticon.com/512/2543/2543328.png" 
            };
            
            var catIndumentaria = new Categoria 
            {
                Nombre = "Indumentaria", 
                Url_icono = "https://cdn-icons-png.flaticon.com/512/3050/3050239.png" 
            };
            
            var catVehiculos = new Categoria 
            {
                Nombre = "Vehículos", 
                Url_icono = "https://cdn-icons-png.flaticon.com/512/741/741407.png" 
            };
            
            context.Categorias.AddRange(catTecnologia, catColeccionables, catIndumentaria, catVehiculos);
            context.SaveChanges(); 
            
            // 2\. Usuarios obligatorios [1]
            var vendedor = new Usuario 
            {
                Name = "Vendedor Test",
                Email = "vendedor@test.com",
                PasswordHash = "password123",
                FechaRegistro = DateTime.UtcNow.AddDays(-30)
            };
            
            var comprador1 = new Usuario 
            {
                Name = "Comprador Líder",
                Email = "comprador1@test.com",
                PasswordHash = "password123",
                FechaRegistro = DateTime.UtcNow.AddDays(-20) 
            };
            
            var comprador2 = new Usuario 
            {
                Name = "Comprador Habilitado",
                Email = "comprador2@test.com",
                PasswordHash = "password123",
                FechaRegistro = DateTime.UtcNow.AddDays(-10) 
            };
            
            var sinFondos = new Usuario 
            {
                Name = "Usuario Sin Fondos",
                Email = "sinfondos@test.com",
                PasswordHash = "password123",
                FechaRegistro = DateTime.UtcNow.AddDays(-5) 
            };
            
            context.Usuarios.AddRange(vendedor, comprador1, comprador2, sinFondos);
            context.SaveChanges(); 
            
            // 3\. Billeteras alineadas a los saldos obligatorios [1]
            var billeteraVendedor = new Billetera 
            {
                UsuarioId = vendedor.Id, 
                SaldoRetenido = 0, SaldoDisponible = 0, 
                Version = 1 
            };
            
            var billeteraComprador1 = new Billetera 
            {
                UsuarioId = comprador1.Id, 
                SaldoRetenido = 45000, SaldoDisponible = 150000, 
                Version = 1 
            };
            
            var billeteraComprador2 = new Billetera 
            {
                UsuarioId = comprador2.Id, 
                SaldoRetenido = 0, SaldoDisponible = 200000, 
                Version = 1 
            };
            
            var billeteraSinFondos = new Billetera 
            {
                UsuarioId = sinFondos.Id, 
                SaldoRetenido = 0, SaldoDisponible = 500, 
                Version = 1 
            };
            
            context.Billeteras.AddRange(billeteraVendedor, billeteraComprador1, billeteraComprador2, billeteraSinFondos);
            context.SaveChanges(); 
            
            // 4\. Subastas obligatorias (Casos de Prueba) [1]
            var ahora = DateTime.UtcNow; 
            // Caso 1: Activa estándar (Cierra en 25 min, con líder en $45.000)
            var subastaActivaEstandar = new Subasta 
            {
                VendedorId = vendedor.Id,
                CategoriaId = catTecnologia.Id,
                Titulo = "Notebook Gamer i7 16GB RAM",
                Descripcion = "Excelente estado, ideal para desarrollo y juegos.",
                UrlImagen = "https://picsum.photos/400/300?random=1",
                PrecioBase = 35000,
                IncrementoMinimo = 5000,
                FechaInicio = ahora.AddHours(-1),
                FechaFin = ahora.AddMinutes(25),
                Estado = Domain.Enums.EstadoSubasta.ACTIVA,
                Version = 1 
            }; 
            
            // Caso 2: Activa crítica (Cierra en 90 segundos para probar alertas y Anti-sniping)
            var subastaActivaCritica = new Subasta 
            {
                VendedorId = vendedor.Id,
                CategoriaId = catColeccionables.Id,
                Titulo = "Cómic Rareza Edición #1",
                Descripcion = "Reliquia de colección. Quedan menos de 2 minutos.",
                UrlImagen = "https://picsum.photos/400/300?random=2",
                PrecioBase = 10000,
                IncrementoMinimo = 1000,
                FechaInicio = ahora.AddHours(-2),
                FechaFin = ahora.AddSeconds(90),
                Estado = Domain.Enums.EstadoSubasta.ACTIVA, 
                Version = 1 
            }; 
            
            // Caso 3: Próxima (Inicio programado en +24 horas)
            var subastaProxima = new Subasta 
            {
                VendedorId = vendedor.Id,
                CategoriaId = catVehiculos.Id,
                Titulo = "Auto Deportivo 2020",
                Descripcion = "Subasta especial de prueba programada.",
                UrlImagen = "https://picsum.photos/400/300?random=3",
                PrecioBase = 500000,
                IncrementoMinimo = 50000,
                FechaInicio = ahora.AddHours(24),
                FechaFin = ahora.AddHours(48),
                Estado = Domain.Enums.EstadoSubasta.PROGRAMADA,
                Version = 1 
            };

            // Caso 4: Vencida con ganador (Fecha fin pasada + pujas registradas)
            var subastaVencidaGanador = new Subasta
            {
                VendedorId = vendedor.Id,
                CategoriaId = catIndumentaria.Id,
                Titulo = "Chaqueta de Cuero Vintage",
                Descripcion = "Lista para adjudicación y liquidación del Worker.",
                UrlImagen = "https://picsum.photos/400/300?random=4",
                PrecioBase = 15000,
                IncrementoMinimo = 2000,
                FechaInicio = ahora.AddDays(-2),
                FechaFin = ahora.AddHours(-1),
                Estado = Domain.Enums.EstadoSubasta.ACTIVA, //El worker la cambiará a FINALIZADA
                Version = 1
            };
            
            // Caso 5: Vencida desierta (Fecha fin pasada sin ofertas)
             var subastaVencidaDesierta = new Subasta 
             {
                VendedorId = vendedor.Id,
                CategoriaId = catColeccionables.Id,
                Titulo = "Reloj de Bolsillo Antiguo",
                Descripcion = "Sin ofertas para verificar paso a DESIERTA.",
                UrlImagen = "https://picsum.photos/400/300?random=5",
                PrecioBase = 80000,
                IncrementoMinimo = 5000,
                FechaInicio = ahora.AddDays(-3),
                FechaFin = ahora.AddHours(-2),
                Estado = Domain.Enums.EstadoSubasta.ACTIVA, // El worker la cambiará a DESIERTA
                 Version = 1 
             };

            context.Subastas.AddRange(subastaActivaEstandar, subastaActivaCritica, subastaProxima, subastaVencidaGanador, subastaVencidaDesierta); context.SaveChanges(); // 5\. Historial de Pujas previas [1] var puja1 = new Puja { SubastaId = subastaActivaEstandar.Id, CompradorId = comprador2.Id, Monto = 40000, FechaPuja = ahora.AddMinutes(-30) }; var puja2 = new Puja { SubastaId = subastaActivaEstandar.Id, CompradorId = comprador1.Id, Monto = 45000, FechaPuja = ahora.AddMinutes(-10) }; var pujaVencida = new Puja { SubastaId = subastaVencidaGanador.Id, CompradorId = comprador1.Id, Monto = 17000, FechaPuja = ahora.AddHours(-3) };
            
            //5. Historial de pujas previas [1]
            var puja1 = new Puja 
            { 
                SubastaId = subastaActivaEstandar.Id, 
                CompradorId = comprador2.Id, 
                Monto = 40000, 
                FechaPuja = ahora.AddMinutes(-30) 
            };
            var puja2 = new Puja 
            { 
                SubastaId = subastaActivaEstandar.Id, 
                CompradorId = comprador1.Id, 
                Monto = 45000, 
                FechaPuja = ahora.AddMinutes(-10) 
            };
            var pujaVencida = new Puja 
            { 
                SubastaId = subastaVencidaGanador.Id, 
                CompradorId = comprador1.Id, 
                Monto = 17000, 
                FechaPuja = ahora.AddHours(-3) 
            };

            context.Pujas.AddRange(puja1, puja2, pujaVencida);
            context.SaveChanges(); 
            
            // 6\. Registro Contable en el Libro Mayor (Ledger) [1]
            var transacciones = new List<Transaccion_Ledger>
            {
                new Transaccion_Ledger
                {
                    BilleteraId = billeteraComprador1.Id,
                    TipoMovimiento = (Domain.Enums.TipoMovimiento)1,
                    Monto = 150000,
                    Fecha = ahora.AddDays(-15)
                }, // Depósito

                new Transaccion_Ledger
                {
                    BilleteraId = billeteraComprador2.Id,
                    TipoMovimiento = (Domain.Enums.TipoMovimiento)1, 
                    Monto = 200000, 
                    Fecha = ahora.AddDays(-10)
                }, // Depósito

                new Transaccion_Ledger
                {
                    BilleteraId = billeteraSinFondos.Id,
                    TipoMovimiento = (Domain.Enums.TipoMovimiento)1, 
                    Monto = 500, 
                    Fecha = ahora.AddDays(-5)
                },// Depósito
                
                // Retención por la puja líder de $45.000 en la subasta activa
                new Transaccion_Ledger 
                { 
                    BilleteraId = billeteraComprador1.Id, 
                    TipoMovimiento = (Domain.Enums.TipoMovimiento)2, 
                    Monto = 45000, 
                    Fecha = ahora.AddMinutes(-10),
                    SubastaId = subastaActivaEstandar.Id 
                }
            };

            context.Transacciones.AddRange(transacciones);
            context.SaveChanges();
        }
    }
}
