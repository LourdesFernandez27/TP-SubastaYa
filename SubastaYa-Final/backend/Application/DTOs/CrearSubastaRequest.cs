using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CrearSubastaRequest
    {
        public string Titulo { get; set; }
        public string Descripcion { get; set; }
        public string UrlImagen { get; set; }
        public decimal PrecioBase { get; set; }
        public decimal IncrementoMinimo { get; set; }
        public DateTimeOffset FechaInicio { get; set; }
        public DateTimeOffset FechaFin { get; set; }
        public int VendedorId { get; set; }
        public int CategoriaId { get; set; }
    }
}
