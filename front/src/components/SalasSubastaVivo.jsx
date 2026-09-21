import React, { useState, useEffect } from "react";

export const SalasSubastaVivo = ({ subastaId = 1, usuarioActualId = 3 }) => {
  const [subasta, setSubasta] = useState(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState({ minutos: 0, segundos: 0, esCritico: false });
  const [notificacion, setNotificacion] = useState({ mensaje: "", tipo: "" });
  const [cargandoPuja, setCargandoPuja] = useState(false);

  const cargarDetalleSubasta = async () => {
    try {
      const res = await fetch(`http://localhost:7009/api/auctions/${subastaId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSubasta(data);
    } catch (err) {
      console.error("Falló al consultar el detalle de la subasta:", err);
    }
  };

  useEffect(() => {
    cargarDetalleSubasta();
    const interval = setInterval(cargarDetalleSubasta, 3000); 
    return () => clearInterval(interval);
  }, [subastaId]);

  useEffect(() => {
    if (!subasta || !subasta.fechaFin) return;

    const timer = setInterval(() => {
      const ahora = new Date().getTime();
      const fin = new Date(subasta.fechaFin).getTime();
      const diferencia = fin - ahora;

      if (diferencia <= 0) {
        setTiempoRestante({ minutos: 0, segundos: 0, esCritico: false, finalizado: true });
        clearInterval(timer);
      } else {
        const segsTotales = Math.floor(diferencia / 1000);
        const mins = Math.floor(segsTotales / 60);
        const segs = segsTotales % 60;
        const esCritico = segsTotales <= 60;
        setTiempoRestante({ minutos: mins, segundos: segs, esCritico, finalizado: false });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [subasta]);

  if (!subasta) return <div style={{ padding: "20px" }}>Cargando Sala de Subasta...</div>;

  const pujasOrdenadas = subasta.pujas 
    ? [...subasta.pujas].sort((a, b) => new Date(b.fechaPuja) - new Date(a.fechaPuja))
    : [];

  const ofertaMasAlta = pujasOrdenadas.length > 0 ? pujasOrdenadas.monto : subasta.precioBase;
  const pujaSugerida = ofertaMasAlta + subasta.incrementoMinimo;

  const esLiderActual = pujasOrdenadas.length > 0 && pujasOrdenadas.usuarioId === usuarioActualId;

  const ejecutarPuja = async (montoAOfertar) => {
    setNotificacion({ mensaje: "", tipo: "" });
    if (montoAOfertar <= ofertaMasAlta) {
      setNotificacion({
        mensaje: "El monto debe ser superior a la oferta actual.",
        tipo: "danger"
      });
      return;
    }

    try {
      setCargandoPuja(true);
      const res = await fetch(`http://localhost:7009/api/auctions/${subastaId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuarioActualId, monto: montoAOfertar })
      });

      const data = await res.json();

      if (!res.ok) {
        setNotificacion({
          mensaje: data.mensaje || "Fondos insuficientes en la billetera para cubrir la garantía.",
          tipo: "danger"
        });
      } else {
        setNotificacion({
          mensaje: "🎉 ¡Oferta confirmada con éxito! Has tomado el liderazgo.",
          tipo: "success"
        });
        setMontoPersonalizado("");
        cargarDetalleSubasta();
      }
    } catch (err) {
      console.error("Falló el envío de la oferta:", err);
      setNotificacion({
        mensaje: "Error de red al procesar la oferta.",
        tipo: "danger"
      });
    } finally {
      setCargandoPuja(false);
    }
  };

  return (
    <div data-sys-render="auto" className="sala-subasta-container" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
 
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{subasta.titulo}</h2>
          
          {/* Temporizador en Vivo */}
          <div className={`badge ${tiempoRestante.esCritico ? "badge-critica" : "badge-activa"}`} style={{ fontSize: "1.1rem" }}>
            ⏱️ {tiempoRestante.finalizado 
              ? "FINALIZADA" 
              : `${tiempoRestante.minutos}:${tiempoRestante.segundos < 10 ? "0" : ""}${tiempoRestante.segundos}`}
          </div>
        </div>

        <img
          src={subasta.urlImagen || "https://via.placeholder.com/400x220"}
          alt={subasta.titulo}
          style={{ width: "100%", height: "240px", objectFit: "cover", borderRadius: "8px", margin: "15px 0" }}
        />

        {notificacion.mensaje && (
          <div style={{
            background: notificacion.tipo === "success" ? "#d1e7dd" : "#f8d7da",
            color: notificacion.tipo === "success" ? "#0f5132" : "#842029",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontWeight: "bold"
          }}>
            {notificacion.mensaje}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          {esLiderActual ? (
            <div className="badge badge-lider" style={{ padding: "10px", width: "100%", textAlign: "center" }}>
              🟢 ¡Vas ganando esta subasta! Tu garantía está retenida en Escrow.
            </div>
          ) : (
            <div className="badge badge-superado" style={{ padding: "10px", width: "100%", textAlign: "center" }}>
              🔴 Fuiste superado (Outbid). Haz una oferta para tomar el liderazgo.
            </div>
          )}
        </div>

        <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
          <h4>Oferta Actual: <span style={{ color: "#198754" }}>\${ofertaMasAlta}</span></h4>
          <small style={{ color: "#666" }}>Incremento mínimo: \${subasta.incrementoMinimo}</small>

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              onClick={() => ejecutarPuja(pujaSugerida)}
              disabled={cargandoPuja || tiempoRestante.finalizado}
              style={{
                backgroundColor: "#0d6efd",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                flex: 1
              }}
            >
              ⚡ Ofertar Sugerida (\${pujaSugerida})
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              type="number"
              placeholder={`Monto superior a \$${ofertaMasAlta}`}
              value={montoPersonalizado}
              onChange={(e) => setMontoPersonalizado(e.target.value)}
              style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <button
              onClick={() => ejecutarPuja(parseFloat(montoPersonalizado))}
              disabled={cargandoPuja || !montoPersonalizado || tiempoRestante.finalizado}
              style={{
                backgroundColor: "#198754",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Enviar Puja
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>📜 Historial en Vivo</h3>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "15px" }}>
          {pujasOrdenadas.length === 0 ? (
            <li style={{ color: "#888" }}>Sin ofertas registradas.</li>
          ) : (
            pujasOrdenadas.map((puja, i) => (
              <li
                key={puja.id || i}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifySpace: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong>User #{puja.usuarioId}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    {new Date(puja.fechaPuja).toLocaleTimeString()}
                  </div>
                </div>
                <span style={{ fontWeight: "bold", color: "#198754" }}>\${puja.monto}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};