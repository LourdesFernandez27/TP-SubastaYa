using Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Domain.Entities
{
    public class Subasta
    {
        public int Id { get; set; }
        public int CategoriaId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string UrlImagen { get; set; } = string.Empty;
        public decimal PrecioBase { get; set; }
        public decimal IncrementoMinimo { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
       
        [ConcurrencyCheck]
        public int Version { get; set; }
        public Categoria Categoria { get; set; }
        public List<Transaccion_Ledger> Transacciones { get; set; }
        public EstadoSubasta Estado { get; set; } = EstadoSubasta.PROGRAMADA;
        public int VendedorId { get; set; }
        public Usuario Vendedor { get; set; } = null!;
        public List<Puja> Pujas { get; set; } = new();

        public Puja Pujar(int compradorId, decimal monto)
        {
            if (Estado != EstadoSubasta.ACTIVA)
                throw new Domain.Exceptions.NegocioException("La subasta no se encuentra en estado ACTIVA para recibir ofertas.");
            if (DateTime.UtcNow >= FechaFin)
                throw new Domain.Exceptions.NegocioException("La subasta ha alcanzado su límite de tiempo y no admite nuevas ofertas.");
            if (VendedorId == compradorId)
                throw new Domain.Exceptions.NegocioException("El propietario de la subasta no está autorizado a ofertar en ella.");

            decimal ofertaMasAlta = ObtenerOfertaMasAlta();
            decimal minimo = Pujas.Count == 0 ? PrecioBase : ofertaMasAlta + IncrementoMinimo;

            if (monto < minimo)
                throw new Domain.Exceptions.NegocioException($"El monto ofertado debe alcanzar o superar el incremento mínimo requerido de {minimo}.");

            Version++;

            return new Puja
            {
                SubastaId = Id,
                CompradorId = compradorId,
                Monto = monto,
                FechaPuja = DateTime.UtcNow
            };
        }

        public decimal ObtenerOfertaMasAlta()
        {
            if (Pujas == null || Pujas.Count == 0)
                return PrecioBase;
            return Pujas.Max(p => p.Monto);
        }
    }
}

/*public decimal ObtenerOfertaMasAlta()
{
    if (Pujas == null || Pujas.Count == 0)
    {
        return PrecioBase;
    }

    decimal maxPuja = PrecioBase;
    for (int i = 0; i < Pujas.Count; i++)
    {
        if (Pujas[i].Monto > maxPuja)
        {
            maxPuja = Pujas[i].Monto;
        }
    }
    return maxPuja;
}
}
}*/

