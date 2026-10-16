using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Auditoria_Log
    {
        public int Id { get; set; }
        public string Entidad { get; set; } = null!;
        public int EntidadId { get; set; }
        public string Accion { get; set; } = null!; 
        public DateTime Fecha { get; set; }
        public int? UsuarioId { get; set; }
        public string? detalle_json { get; set; }
        public Usuario? Usuario { get; set; }

    }
}
