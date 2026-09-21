import React, { useState, useEffect } from "react";

export const MisActividades = ({ usuarioId = 3 }) => {
  const [pestanaActiva, setPestanaActiva] = useState("compras");
  const [subastasParticipadas, setSubastasParticipadas] = useState([]);
  const [misPublicaciones, setMisPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarMisActividades = async () => {
    try {
      setCargando(true);
      const res = await fetch("http://localhost:7009/api/auctions");
      if (!res.ok) {
        throw new Error(`Error HTTP al consultar subastas: ${res.status}`);
      }
      const todasSubastas = await res.json();

      const participadas = todasSubastas.filter((subasta) =>
        subasta.pujas && subasta.pujas.some((puja) => puja.usuarioId === usuarioId)
      );
      setSubastasParticipadas(participadas);

      const publicaciones = todasSubastas.filter(
        (subasta) => subasta.vendedorId === usuarioId
      );
      setMisPublicaciones(publicaciones);
    } catch (err) {
      console.error("Falló la carga del panel Mis Actividades:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMisActividades();
  }, [usuarioId]);

  return (
    <div data-sys-render="auto" className="card" style={{ maxWidth: "900px", margin: "20px auto" }}>
      <h2>📋 Mis Actividades</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <button
          onClick={() => setPestanaActiva("compras")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: pestanaActiva === "compras" ? "#0d6efd" : "#e9ecef",
            color: pestanaActiva === "compras" ? "#fff" : "#495057"
          }}
        >
          🛒 Mis Compras / Pujas ({subastasParticipadas.length})
        </button>
        <button
          onClick={() => setPestanaActiva("publicaciones")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: pestanaActiva === "publicaciones" ? "#0d6efd" : "#e9ecef",
            color: pestanaActiva === "publicaciones" ? "#fff" : "#495057"
          }}
        >
          📦 Mis Publicaciones ({misPublicaciones.length})
        </button>
      </div>

      {cargando && <p>Cargando información del panel...</p>}

      {!cargando && pestanaActiva === "compras" && (
        <div>
          {subastasParticipadas.length === 0 ? (
            <p style={{ color: "#666" }}>No has participado con ofertas en ninguna subasta todavía.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {subastasParticipadas.map((subasta, i) => {
                const pujasOrdenadas = [...(subasta.pujas || [])].sort((a, b) => b.monto - a.monto);
                const ofertaLider = pujasOrdenadas.length > 0 ? pujasOrdenadas : null;
                const esLider = ofertaLider && ofertaLider.usuarioId === usuarioId;

                const misPujas = (subasta.pujas || []).filter((p) => p.usuarioId === usuarioId);
                const miMayorOferta = misPujas.length > 0 ? [...misPujas].sort((a, b) => b.monto - a.monto) : null;

                let estadoResultado = "";
                let claseBadge = "";

                if (subasta.estado === "FINALIZADA") {
                  if (esLider) {
                    estadoResultado = "🏆 GANADOR DE LA SUBASTA";
                    claseBadge = "badge-lider";
                  } else {
                    estadoResultado = "❌ Finalizada - No Adjudicada";
                    claseBadge = "badge-superado";
                  }
                } else if (subasta.estado === "ACTIVA") {
                  if (esLider) {
                    estadoResultado = "🟢 Liderando oferta";
                    claseBadge = "badge-lider";
                  } else {
                    estadoResultado = "🔴 Oferta superada (Outbid)";
                    claseBadge = "badge-superado";
                  }
                } else {
                  estadoResultado = `Estado: ${subasta.estado}`;
                  claseBadge = "badge-activa";
                }

                return (
                  <div
                    key={subasta.id || i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "15px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      gap: "15px"
                    }}
                  >
                    <img
                      src={subasta.urlImagen || "https://via.placeholder.com/100"}
                      alt={subasta.titulo}
                      style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "6px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 5px 0" }}>{subasta.titulo}</h4>
                      <small style={{ color: "#666" }}>
                        Tu mayor oferta: <strong>\${miMayorOferta ? miMayorOferta.monto : 0}</strong> | Oferta actual: <strong>\${ofertaLider ? ofertaLider.monto : subasta.precioBase}</strong>
                      </small>
                    </div>
                    <div>
                      <span className={`badge ${claseBadge}`}>{estadoResultado}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!cargando && pestanaActiva === "publicaciones" && (
        <div>
          {misPublicaciones.length === 0 ? (
            <p style={{ color: "#666" }}>No has creado ninguna publicación como vendedor.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {misPublicaciones.map((pub, i) => {
                const pujasOrdenadas = [...(pub.pujas || [])].sort((a, b) => b.monto - a.monto);
                const ofertaLider = pujasOrdenadas.length > 0 ? pujasOrdenadas : null;
                const recaudacion = ofertaLider ? ofertaLider.monto : 0;

                return (
                  <div
                    key={pub.id || i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "15px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      gap: "15px"
                    }}
                  >
                    <img
                      src={pub.urlImagen || "https://via.placeholder.com/100"}
                      alt={pub.titulo}
                      style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "6px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 5px 0" }}>{pub.titulo}</h4>
                      <small style={{ color: "#666" }}>
                        Precio Base: \${pub.precioBase} | Total de Ofertas: {pub.pujas ? pub.pujas.length : 0}
                      </small>
                      <div style={{ fontSize: "0.95rem", marginTop: "5px" }}>
                        Métrica de Recaudación: <strong style={{ color: "#198754" }}>\${recaudacion}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`badge badge-${pub.estado ? pub.estado.toLowerCase() : "activa"}`}>
                        {pub.estado}
                      </span>
                      {pub.estado === "FINALIZADA" && ofertaLider && (
                        <div style={{ fontSize: "0.8rem", color: "#0f5132", marginTop: "5px" }}>
                          Adjudicada a Usuario #{ofertaLider.usuarioId}
                        </div>
                      )}
                      {pub.estado === "DESIERTA" && (
                        <div style={{ fontSize: "0.8rem", color: "#842029", marginTop: "5px" }}>
                          Finalizada sin ofertas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};