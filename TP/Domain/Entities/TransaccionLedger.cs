using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Entities
{
    public class TransaccionLedger
    {
        public int Id { get; set; }
        public int BilleteraId { get; set; }
        public Billetera Billetera { get; set; } = null!;
        public TipoMovimiento TipoMovimiento { get; set; } 
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }
        public int? SubastaId { get; set; }
    }
}

            
            
    

