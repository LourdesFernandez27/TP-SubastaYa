using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Categoria
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
<<<<<<< HEAD
=======
        public string Url_icono { get; set; }
        public ICollection<Subasta> Subastas { get; set; }
>>>>>>> origin/Endpoints
    }
}
