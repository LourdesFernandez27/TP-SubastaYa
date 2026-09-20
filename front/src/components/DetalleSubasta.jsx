import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

export const DetalleSubasta = ({ subastaId, usuarioActualId }) => {
  const [subasta, setSubasta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [montoOferta, setMontoOferta] = useState("");
  const [mensajeEstado, setMensajeEstado] = useState(null);
  const [procesandoPuja, setProcesandoPuja] = useState(false);

  // Carga inicial y Short-Polling cada 2 segundos
  useEffect(() => {
    let estaMontado = true;

    const cargarDatosSubasta = async () => {
      try {
        const datos = await apiService.obtenerSubastaPorId(subastaId);
        if (estaMontado) {
          setSubasta(datos);
          setCargando(false);
        }
      } catch (error) {
        console.error("Falló el ciclo de polling de la subasta:", error);
      }
    };

    // Primera ejecución inmediata
    cargarDatosSubasta();

    // Short-polling cada 2000 ms (2 segundos)
    const intervalo = setInterval(() => {
      cargarDatosSubasta();
    }, 2000);

    return () => {
      estaMontado = false;
      clearInterval(intervalo);
    };
  }, [subastaId]);

  const manejarEnvioPuja = async (e) => {
    e.preventDefault();
    setMensajeEstado(null);

    const monto = parseFloat(montoOferta);
    if (isNaN(monto) || monto <= 0) {
      setMensajeEstado({ tipo: "error", texto: "Ingrese un monto de oferta válido y positivo." });
      return;
    }

    setProcesandoPuja(true);

    const resultado = await apiService.realizarPuja(subastaId, usuarioActualId, monto);

    setProcesandoPuja(false);

    if (resultado.success) {
      setMensajeEstado({ tipo: "exito", texto: "¡Puja realizada con éxito! Eres el postor líder." });
      setMontoOferta("");
      // Refrescar inmediatamente el estado local
      const datosActualizados = await apiService.obtenerSubastaPorId(subastaId);
      setSubasta(datosActualizados);
    } else {
      // Manejo específico de la respuesta 409 Conflict por concurrencia optimista
      if (resultado.status === 409) {
        setMensajeEstado({
          tipo: "conflicto",
          texto: "⚠️ " + resultado.mensaje
        });
      } else {
        setMensajeEstado({
          tipo: "error",
          texto: resultado.mensaje || "No se pudo procesar la oferta."
        });
      }
    }
  };

  if (cargando) {
    return (
      <div data-sys-render="auto" className="spinner-container">
        <p>Cargando datos de la subasta en vivo...</p>
      </div>
    );
  }

  if (!subasta) {
    return (
      <div data-sys-render="auto" className="error-container">
        <p>No se encontró la subasta solicitada.</p>
      </div>
    );
  }

  // Determinar la oferta líder y sugerencia del próximo valor
  const pujasOrdenadas = [...(subasta.pujas || [])].sort((a, b) => b.monto - a.monto);
  const ofertaMasAlta = pujasOrdenadas.length > 0 ? pujasOrdenadas.monto : subasta.precioBase;
  const esLiderActual = pujasOrdenadas.length > 0 && pujasOrdenadas.usuarioId === usuarioActualId;
  const proximaPujaSugerida = pujasOrdenadas.length === 0 ? subasta.precioBase : ofertaMasAlta + subasta.incrementoMinimo;
  return (
    <div data-sys-render="auto" className="subasta-detalle-card">
      <h2>{subasta.titulo}</h2>
      <p>{subasta.descripcion}</p>
      
      <div className="subasta-metrics">
        <div>
          <span>Estado:</span> <strong>{subasta.estado}</strong>
        </div>
        <div>
          <span>Oferta Actual:</span> <strong>\${ofertaMasAlta}</strong>
        </div>
        <div>
          <span>Cierre:</span> <strong>{new Date(subasta.fechaFin).toLocaleTimeString()}</strong>
        </div>
      </div>

      {esLiderActual && (
        <div className="alerta-lider">
          🟢 ¡Vas ganando esta subasta! Tu saldo en garantía cubre esta oferta.
        </div>
      )}

      {/* Formulario de Puja */}
      {subasta.estado === "ACTIVA" && (
        <form onSubmit={manejarEnvioPuja} className="form-puja">
          <label>Tu Oferta (\$):</label>
          <input
            type="number"
            step="0.01"
            value={montoOferta}
            placeholder={`Sugerido: $${proximaPujaSugerida}`}
            onChange={(e) => setMontoOferta(e.target.value)}
            disabled={procesandoPuja}
          />
          <button type="submit" disabled={procesandoPuja}>
            {procesandoPuja ? "Enviando..." : "Pujar Ahora"}
          </button>
        </form>
      )}

      {/* Alertas de Feedback UI */}
      {mensajeEstado && (
        <div className={`mensaje-box ${mensajeEstado.tipo}`}>
          {mensajeEstado.texto}
        </div>
      )}

      {/* Historial de Pujas */}
      <h3>Historial de Ofertas ({pujasOrdenadas.length})</h3>
      <ul className="lista-pujas">
        {pujasOrdenadas.map((puja, i) => (
          <li key={puja.id || i} className={puja.usuarioId === usuarioActualId ? "mi-puja" : ""}>
            <span>Usuario #{puja.usuarioId}</span>
            <strong>\${puja.monto}</strong>
            <small>{new Date(puja.fecha).toLocaleTimeString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};