import React, { useState, useEffect, useCallback, use } from "react";
import * as signalR from "@microsoft/signalr";
const calcularTiempoRestante = (fechaFin) => {
  if (!fechaFin) return {finalizado: false, horas: "--", minutos: "--", segundos: "--", esCritico: false};
  
  const ahora = new Date().getTime();
  const fechaStr = fechaFin.toString();
  const fin = new Date(fechaStr.endsWith('Z') ? fechaStr: `${fechaStr}Z`).getTime();
  const diferencia = fin - ahora;

  if (diferencia <=0) {
    return {finalizado: true, horas: 0, minutos: 0, segundos: 0, esCritico: true};
  }
  const totalSegundos = Math.floor(diferencia  / 1000);
  const horas = String(Math.floor(totalSegundos / 3600)).padStart(2,'0');
  const minutos = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2,'0');
  const segundos = String(totalSegundos % 60).padStart(2, '0');

  const esCritico = totalSegundos <= 60;
  return {finalizado: false, horas, minutos, segundos, esCritico};
};

const TemporizadorBadge= ({fechaFin}) => {
  const [tiempo, setTiempo] = useState(() => calcularTiempoRestante(fechaFin));
  
  useEffect(() => {
    if (!fechaFin) return;
    setTiempo(calcularTiempoRestante(fechaFin));

    const intervalo = setInterval(() => {
      setTiempo(calcularTiempoRestante(fechaFin));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [fechaFin]);

  return (
    <div className={`badge ${tiempo.esCritico ? "badge-critica" : "badge-activa"}`}
    style= {{display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', padding: '4px 10px', borderRadius: '14px', 
      fontWeight: 'bold', userSelect: 'none'}}>
    <span> ⏱️ </span>
    <span> {tiempo.finalizado ? "FINALIZADA" : `${tiempo.horas}:${tiempo.minutos}:${tiempo.segundos}`}
      </span>
    </div>
  );
};

export const SalasSubastaVivo = ({ subastaId, alVolver, usuarioActualId, usuarioId, UsuarioActual, onSeleccionarSubasta }) => {
  const [subasta, setSubasta] = useState(null);
  const [subastasActivas, setSubastasActivas] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [montoPersonalizado, setMontoPersonalizado] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState({ horas: 0 ,minutos: 0, segundos: 0, esCritico: false, finalizado: false });
  const [, setTick] = useState(0);
  const [notificacion, setNotificacion] = useState({ mensaje: "", tipo: "" });
  const [cargandoPuja, setCargandoPuja] = useState(false);
  const idUsuarioActivo = usuarioActualId || usuarioId || UsuarioActual?.id;

  const cargarDetalleSubasta = useCallback(async () => {
  try {
    const res = await fetch(`https://localhost:7009/api/auctions/${subastaId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();

    let data = raw;
    if (raw.$values) data = raw.$values[0] || raw.$values;
    if (data.pujas?.$values) data.pujas = data.pujas.$values;
    if (data.Pujas?.$values) data.Pujas = data.Pujas.$values;

    setSubasta(data);
  } catch (err) {
    console.error("Falló detalle:", err);
  }
}, [subastaId] );
  
  useEffect(() => {
    if (!subastaId) {
      const cargarSubastasActivas = async () => {
        try {
          setCargandoLista(true);
          const res = await fetch("https://localhost:7009/api/auctions?estado=ACTIVA&pageSize=100");
          if (!res.ok) throw new Error("Error al consultar subastas.");
          const data = await res.json();
          const todasSubastas = data.items || data.value || (Array.isArray(data)? data : []);
          const ahora = new Date();
          const activas = todasSubastas.filter((s) => {
            const estado = s.estado ?? s.Estado;
            const fechaFin = new Date(s.fechaFin ?? s.FechaFin);
            const esActivo = estado === "ACTIVA" || estado === 1 || fechaFin > ahora;
            const esVigente = fechaFin > ahora;
            return esActivo && esVigente;
          });
          setSubastasActivas(activas);
        } catch (err) {
          console.error("Falló la carga de subastas activas:", err);
        } finally {
          setCargandoLista(false);
        }
      };
      cargarSubastasActivas();
    }
    }, [subastaId]);

useEffect(() => {
  if (!subastaId) return;

  cargarDetalleSubasta();

  let isCancelled = false;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7009/auctionHub") 
    .withAutomaticReconnect()
    .build();

  connection.on("NuevaOfertaRecibida", () => {
    if (!isCancelled) {
      cargarDetalleSubasta();
    }
  });

  connection
    .start()
    .then(() => {
      if (!isCancelled) {
      connection.invoke("UnirseASubasta", subastaId.toString()).catch(console.error);
      } else {
        connection.stop();
      }
    })
    .catch((err) => {
      if (!isCancelled)
        {
          console.error("Falló la conexión con SignalR:", err);
        }
    });

  return () => {
    isCancelled = true;
    if (connection.state === signalR.HubConnectionState.Connected) {
      connection.invoke("SalirDeSubasta", subastaId.toString()).catch(() => {});
      connection.stop();
    } else {
      connection.stop().catch(() => {});
    }
  };
}, [subastaId, cargarDetalleSubasta]);

  useEffect(() => {
    if (subasta) return;
    const timerLista = setInterval (() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(timerLista);
  }, [subasta]);

  useEffect(() => {
    if (!subasta || !subasta.fechaFin) return;

    const timer = setInterval(() => {
      const resultado = calcularTiempoRestante(subasta.fechaFin);
        setTiempoRestante(resultado);
        if (resultado.finalizado) {
          clearInterval(timer);
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [subasta]);

  if (!subasta) {return (
    <div className= "salas-en-vivo-container" style= {{padding: "20px"}}>
    <h2> Sala de Subasta en vivo activas </h2>
    <p> Selecciona una subasta para ingresar a su sala en tiempo real:</p>
      {cargandoLista ? (
        <p>Cargando subastas activas...</p>
        ) : subastasActivas.length === 0 ? (
        <div style = {{padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px", marginTop: "15px"}}>
          <p> En este momento no hay subastas en vivo activas. </p>
          <button onClick={alVolver}> Volver al catálogo </button>
        </div>
        ) : (
        <div style= {{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "20px"}}>
          {subastasActivas.map((s) => (
               <div key= {s.id || s.Id} 
                style= {{
                  border: "2px solid #e02424", borderRadius: "10px", padding: "15px", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"}}>
                  
                <div style= {{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
                  <span style= {{backgroundColor: "#e02424", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold"}}>
                    EN VIVO
                  </span>
                <TemporizadorBadge fechaFin = {s.fechaFin || s.FechaFin} />
               </div>

               <h3 style= {{ marginTop: "10px"}}> 
                {s.titulo || s.Titulo} </h3>
                <p style= {{margin: "5px 0 15px 0"}}>
                  Precio base: <strong>${s.precioBase || s.PrecioBase}</strong>
                </p>
                <button onClick= {() => onSeleccionarSubasta(s.id || s.Id)}
                style= {{width: "100%", padding: "10px", backgroundColor: "#183bd4", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"}}>
                  Ingresar a la sala
                </button>
                </div>
          ))}
        </div>
      )}
    </div> );
    };

    const ejecutarPuja = async (monto) => {
    const montoNum = Number(monto);
    if (!montoNum || isNaN(montoNum) || montoNum <= 0){
      setNotificacion({mensaje: "Ingresa un monto válido superior a la oferta actual.", tipo: "error"});
      return;
    }

    if (montoNum <= ofertaMasAlta) {
      setNotificacion({mensaje: 'La oferta debe ser superior a la oferta más alta actual.', tipo: "error"});
      return;
    }

    if (!idUsuarioActivo) {
      setNotificacion({mensaje: "No se identificó el usuario actual. Inicia sesión nuevamente.", tipo: "error"});
      return;
    }
    
    try {
      setCargandoPuja(true);
      setNotificacion({mensaje: "Enviando oferta...", tipo: "info"});
      const res = await fetch(`https://localhost:7009/api/auctions/${subastaId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: idUsuarioActivo, monto: montoNum })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotificacion({mensaje: "¡Puja realizada con éxito!", tipo: "success"});
        setMontoPersonalizado("");
        await cargarDetalleSubasta();
      } else {
        const errData = await res.json().catch(() => ({}));
        setNotificacion({mensaje: errData.mensaje || `Error HTTP ${res.status}: No se pudo procesar la puja.`, tipo: "error"});
      }
    } catch (err) {
      console.error("Error al ofertar:", err);
      setNotificacion ({mensaje: "No se pudo conectar con el servidor.", tipo: "error"});
    } finally {
      setCargandoPuja(false);
    }
  };

  if (!subasta) return <div style= {{padding: "20px"}}> Cargando sala de subasta en vivo...</div>;
  const pujas = subasta?.pujas || subasta?.Pujas || [];
  const pujasOrdenadas = [...pujas].sort((a, b) => Number(b.monto ?? b.Monto ?? 0) - Number(a.monto ?? a.Monto ?? 0));
  
  const idsUnicos = [... new Set(pujasOrdenadas.map(p => p.usuarioId ?? p.compradorId).filter(Boolean))].sort((a,b) => Number(a) - Number(b));
  const mapaCompradores = Object.fromEntries(idsUnicos.map((id,i) => [id, `Comprador ${i+1}`]));
  
  const getNombreAuditoria = (puja) => {
    const id = puja.usuarioId ?? puja.compradorId;
    if (!id) return "Comprador ?";
    return mapaCompradores[id] || `Comprador ${id}`;
  };

  const ofertaMasAlta = pujasOrdenadas.length > 0 ? Number(pujasOrdenadas[0]?.monto || pujasOrdenadas[0]?.Monto || 0) : Number(subasta?.precioBase || subasta?.PrecioBase || 0);
  const pujaSugerida = ofertaMasAlta + Number(subasta?.incrementoMinimo || 2000);
  const compradorLider = pujasOrdenadas.length > 0 ? Number(pujasOrdenadas[0]?.usuarioId ?? pujasOrdenadas[0]?.UsuarioId ?? 0) : 0; 
  const esLiderActual = compradorLider === Number(usuarioActualId);
  const handleVolver = () => {
    setSubasta(null);
    if (typeof onSeleccionarSubasta === "function") {
      onSeleccionarSubasta(null);
    }
  };

  return (
    <div className= "sala-individual-container" style= {{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}> 
      <button onClick= {handleVolver} style= {{marginBottom: '15px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer'}}>
         Volver a la lista de salas en vivo
      </button>

      <div className= "sala-subasta-container" style= {{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start'}}>
        <div className="card" style= {{background: '#fff', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08'}}>

          <div style= {{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <h2 style={{margin: 0, color: '#000'}}> {subasta.titulo || subasta.Titulo} </h2>
        <div className= {`badge ${tiempoRestante.esCritico ? 'badge-critica' : 'badge-activa'}`} 
        style= {{fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
          ⏱️{tiempoRestante.finalizado ? "FINALIZADA" : `${tiempoRestante.horas}:${String(tiempoRestante.minutos).padStart(2,'0')}:${String(tiempoRestante.segundos).padStart(2,'0')}`}
      </div>
      </div>

      <div style={{ margin: "10px 0", lineHeight: "1.4" }}>
          <p style={{ margin: "8px 0" }}>
            <strong>Descripción:</strong> {subasta.descripcion || subasta.description || "Sin descripción"}
          </p>
          {subasta.condicion && (
            <p style={{ margin: "4px 0", color: "#555" }}>
              <strong>Estado:</strong> {subasta.condicion}
            </p>
          )}
          {subasta.categoria && (
            <p style={{ margin: "4px 0", color: "#555" }}>
              <strong>Categoría:</strong> {subasta.categoria}
            </p>
          )}
        </div>
      
      <p> Oferta más alta actual: <strong> ${ofertaMasAlta}</strong> </p>
      {esLiderActual && (<p style= {{color: "green", fontWeight: "bold"}}> ¡Vas ganando esta subasta! </p>)}

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

        <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
          <h4>Oferta Actual: <span style={{ color: "#198754" }}>${ofertaMasAlta}</span></h4>
          <small style={{ color: "#666" }}>Incremento mínimo: ${subasta.incrementoMinimo || 2000}</small>

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              type= "button"
              onMouseDown={(e) => {
                e.preventDefault();
                if (!cargandoPuja && !tiempoRestante.finalizado) {
                  ejecutarPuja(pujaSugerida);
                }
              }}
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
              {cargandoPuja ? "⏳ Enviando..." : `⚡ Oferta Sugerida ($${pujaSugerida})`}
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
              onClick={() => ejecutarPuja(Number(montoPersonalizado))}
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
              {cargandoPuja ? "⏳ Enviando..." : "Enviar Puja"}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style= {{background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
        <h3 style= {{marginTop: 0}}>📜 Historial en Vivo</h3>
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
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong> {getNombreAuditoria(puja)}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    {new Date(puja.fechaPuja + 'Z').toLocaleString('es-AR',{timeZone: 'America/Argentina/Buenos_Aires'})}
                  </div>
                </div>
                <span style={{ fontWeight: "bold", color: "#198754" }}>${puja.monto}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
    </div>
  );
};