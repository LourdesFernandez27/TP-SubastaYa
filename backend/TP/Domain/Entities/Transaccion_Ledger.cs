using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Domain.Entities
{
    public class Transaccion_Ledger
    {
        public int Id { get; set; }
        public int BilleteraId { get; set; }
        public TipoMovimiento TipoMovimiento { get; set; } 
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }
        public int? SubastaId { get; set; }
        public Billetera Billetera { get; set; } = null!;
        public Subasta? Subasta { get; set; }
    }
}
