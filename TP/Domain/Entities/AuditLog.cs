using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string Entidad { get; set; } = string.Empty;
        public int EntidadId { get; set; }
        public string Accion {  get; set; } = string.Empty;
        public string Detalle { get; set; } = string.Empty;
        public int? UsuarioId { get; set; }
        public DateTime Fecha { get; set; }



    }
}
