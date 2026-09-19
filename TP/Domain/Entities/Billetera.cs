using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Billetera
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public decimal SaldoDisponible { get; set; }
        public decimal SaldoRetenido { get; set; }
        public decimal SaldoTotal
        {
            get { return SaldoDisponible + SaldoRetenido; }
        }
        public uint Version { get; set; }
        public Usuario Usuario { get; set; } = null!;
        public void Depositar(decimal monto)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto a depositar debe ser mayor a cero.");
            }
            SaldoDisponible += monto;
        }

             public void Retener(decimal monto)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto a retener debe ser mayor a cero.");
            }
            if (SaldoDisponible < monto)
            {
                throw new InvalidOperationException("Saldo disponible insuficiente para realizar la retención.");
            }
            SaldoDisponible -= monto;
            SaldoRetenido += monto;
        }

        public void Liberar(decimal monto)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto a liberar debe ser mayor a cero.");
            }
            if (SaldoRetenido < monto)
            {
                throw new InvalidOperationException("No se puede liberar más saldo del que está retenido.");
            }
            SaldoRetenido -= monto;
            SaldoDisponible += monto;
        }

        public void ConfirmarDebito(decimal monto)
        {
            if (monto <= 0)
            {
                throw new ArgumentException("El monto del débito debe ser mayor a cero.");
            }
            if (SaldoRetenido < monto)
            {
                throw new InvalidOperationException("No hay suficiente saldo retenido para confirmar el débito.");
            }
            SaldoRetenido -= monto;
        }
    }

}

