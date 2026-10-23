using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface ISubastaRepository
    {
        Task<Subasta?> ObtenerPorIdAsync(int id);
        Task ActualizarAsync(Subasta subasta);
        Task GuardarPujaAsync(Puja puja);
    }
}
