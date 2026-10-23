using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public record PujarRequest(int SubastaId, int UsuarioId, decimal Monto); 
    
}
