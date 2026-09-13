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
       // public int UsuarioId { get; set; }
       // public int CategoriaId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string UriImagen { get; set; } = string.Empty;
        public decimal PrecioBase { get; set; }
        public decimal IncrementoMinimo { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public EstadoSubasta Estado { get; set; } = EstadoSubasta.PROGRAMADA;
        public int VendedorId { get; set; }
        public Usuario Vendedor { get; set; } = null!;

        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;

        public List<Puja> Pujas { get; set; } = new();

        public decimal ObtenerOfertaMasAlta()
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
}

