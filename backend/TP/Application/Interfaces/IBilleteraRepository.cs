using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IBilleteraRepository
    {
        Task<Billetera?> ObtenerPorUsuarioIdAsync(int usuarioId);
        Task ActualizarAsync(Billetera billetera);
        Task RegistrarLedgerAsync(Transaccion_Ledger ledger);
        Task RegistrarAuditLogAsync(Auditoria_Log log);
    }
}
