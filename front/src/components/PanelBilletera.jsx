import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

export const PanelBilletera = ({ usuarioId }) => {
  const [balance, setBalance] = useState(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const [montoDeposito, setMontoDeposito] = useState("");
  const [mensaje, setMensaje] = useState(null);

  const cargarBalance = async () => {
    setErrorCarga(false);
    try {
      const datos = await apiService.obtenerBalanceBilletera(usuarioId);
      setBalance(datos);
    } catch (error) {
      console.error("Error al actualizar el panel de billetera:", error);
        setErrorCarga(true);
    }
  };

  useEffect(() => {
    cargarBalance();
  }, [usuarioId]);

  const manejarDeposito = async (e) => {
    e.preventDefault();
    setMensaje(null);

    const monto = parseFloat(montoDeposito);
    if (isNaN(monto) || monto <= 0) {
      setMensaje({ tipo: "error", texto: "Ingrese un monto de depósito positivo." });
      return;
    }

    const res = await apiService.realizarDeposito(usuarioId, monto);
    if (res.success) {
      setMensaje({ tipo: "exito", texto: "¡Carga de saldo simulada exitosa!" });
      setMontoDeposito("");
      cargarBalance();
    } else {
      setMensaje({ tipo: "error", texto: res.mensaje });
    }
  };

  if (!balance) return <p data-sys-render="auto">Cargando billetera...</p>;
  if (errorCarga){
    return <p className= "error carga"> No se pudo conectar con la Web API </p>
  }

  return (
    <div data-sys-render="auto" className="billetera-panel">
      <h3>Mi Billetera Virtual</h3>
      <div className="saldos-grid">
        <div className="saldo-card total">
          <span>Saldo Total</span>
          <strong>\${balance.saldoTotal}</strong>
        </div>
        <div className="saldo-card retenido">
          <span>En Garantía (Escrow)</span>
          <strong>\${balance.saldoRetenido}</strong>
        </div>
        <div className="saldo-card disponible">
          <span>Saldo Disponible</span>
          <strong>\${balance.saldoDisponible}</strong>
        </div>
      </div>

      <form onSubmit={manejarDeposito} className="form-deposito">
        <h4>Acreditar Fondos Simulados</h4>
        <input
          type="number"
          placeholder="Monto a ingresar"
          value={montoDeposito}
          onChange={(e) => setMontoDeposito(e.target.value)}
        />
        <button type="submit">Cargar Saldo</button>
      </form>

      {mensaje && <p className={`feedback ${mensaje.tipo}`}>{mensaje.texto}</p>}
    </div>
  );

};