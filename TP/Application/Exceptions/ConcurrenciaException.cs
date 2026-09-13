using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Exceptions
{
    public class ConcurrenciaException : Exception
    {
        public ConcurrenciaException(string mensaje) : base(mensaje) { }

    }
}
