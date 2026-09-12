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
        public int VendedorId { get; set; }
        public int CategoriaId { get; set; }
        public string Titulo { get; set; }
        public string Descripcion { get; set; }
        public string Url_imagen { get; set; }
        public decimal PrecioBase { get; set; }
        public decimal IncrementoMinimo { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public string Estado { get; set; }
        public int Version { get; set; }
        [Timestamp] public byte [] RowVersion { get; set; }
        public Categoria Categoria { get; set; }
        public Usuario Usuario { get; set; }
        public ICollection<Puja> Pujas { get; set; }
        public ICollection<Transaccion_Ledger> Transacciones { get; set; }
    }
}
