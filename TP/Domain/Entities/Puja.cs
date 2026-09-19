using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Puja
    {
        public int Id { get; set; }
        public int SubastaId { get; set; }
        public Subasta Subasta { get; set; } = null!;
        public int CompradorId { get; set; }
        public Usuario Comprador { get; set; } = null!;
        public decimal Monto { get; set; }
        public DateTime FechaPuja { get; set; }
    }
}
