import React, { useState, useEffect } from "react";


const TarjetaSubastaCard = ({ subasta, alSeleccionarSubasta }) => {
  const [tiempoRestante, setTiempoRestante] = useState("");
  const [esCritico, setEsCritico] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  
  const id = subasta.id || subasta.Id;
  const titulo = subasta.titulo || subasta.Titulo || "Sin título";
  const uriImagen = subasta.uriImagen || subasta.UriImagen || "https://via.placeholder.com/300x180?text=SubastaYa";
  const estadoRaw = subasta.estado !== undefined && subasta.estado !== null ? subasta.estado : (subasta.Estado || "ACTIVA");
  const estado = estadoRaw.toString().toUpperCase();
  const categoriaId = Number(subasta.categoriaId || subasta.CategoriaId || 1);
  const precioBase = Number(subasta.precioBase || subasta.PrecioBase || 0);
  const fechaFin = subasta.fechaFin || subasta.FechaFin;
  const pujas = subasta.pujas || subasta.Pujas || [];
  const descripcion = subasta.descripcion || subasta.Descripcion || "Sin descripción";

  const totalOfertas = pujas.length;
  const ofertaMasAlta = totalOfertas > 0
    ? Math.max(...pujas.map((p) => Number(p.monto || p.Monto || 0)))
    : precioBase;

  useEffect(() => {
    const calcularTiempo = () => {
          if (!fechaFin) return;
    const fechaStr = fechaFin?.toString() || "";
    const fin = new Date(fechaStr.endsWith('Z') ? fechaStr : `${fechaStr}Z`).getTime();
    const ahora = new Date().getTime();
    const diferencia = fin - ahora;
      
    /*if (!fechaFin) return;
      const ahora = new Date().getTime();
      const fin = new Date(fechaFin).getTime();
      const diferencia = fin - ahora;*/

      if (diferencia <= 0) {
        setTiempoRestante("00:00");
        setFinalizado(true);
        setEsCritico(false);
      } else {
        const segsTotales = Math.floor(diferencia / 1000);
        const hrs = Math.floor(segsTotales/3600);
        const mins = Math.floor(segsTotales % 3600/60);
        const segs = segsTotales % 60;
        setTiempoRestante(`${hrs > 0 ? hrs +":":""} ${mins < 10? "0":""}${mins}:${segs < 10 ? "0" : ""}${segs}`);
        setEsCritico(segsTotales <= 60 && (estado === "ACTIVA" || estado === "1"));
        setFinalizado(false);
      }
    };

    calcularTiempo();
    const interval = setInterval(calcularTiempo, 1000);
    return () => clearInterval(interval);
  }, [fechaFin, estado]);

  const mapaCategorias = {
    1: "Tecnología",
    2: "Coleccionables",
    3: "Indumentaria",
    4: "Vehículos"
  };

  return (
    <div className="card subasta-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ position: "relative" }}>
          <img
            src={uriImagen}
            alt={titulo}
            style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }}
          />
          <span
            className={`badge badge-${estado.toLowerCase()}`}
            style={{ position: "absolute", top: "10px", right: "10px" }}
          >
            {estado === "1" ? "ACTIVA" : estado === "0" ? "PROGRAMADA" : estado}
          </span>
        </div>

        <div style={{ marginTop: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
            🏷️ {mapaCategorias[categoriaId] || `Categoría #${categoriaId}`}
          </span>

          <h3 style={{ margin: "6px 0 10px 0", fontSize: "1.2rem" }}>{titulo}</h3>
          <p style= {{ fontSize: "0.85rem", color: "#666", margin: "0 0 10px 0", lineHeight: "1.3", minHeight: "30px"}}> {descripcion} </p>

          <div style={{ marginBottom: "15px" }}>
            <small style={{ color: "#888", display: "block" }}>Tiempo Restante:</small>
            <div
              className={`badge ${esCritico ? "badge-critica" : "badge-activa"}`}
              style={{ fontSize: "0.95rem", marginTop: "4px", display: "inline-block" }}
            >
              ⏱️ {finalizado ? "TIEMPO FINALIZADO" : tiempoRestante}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "10px", borderRadius: "6px" }}>
            <div>
              <small style={{ color: "#666", display: "block" }}>Oferta Más Alta</small>
              <strong style={{ fontSize: "1.2rem", color: "#198754" }}> ${ofertaMasAlta}</strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <small style={{ color: "#666", display: "block" }}>Total Ofertas</small>
              <span style={{ fontWeight: "bold", fontSize: "1rem", color: "#0d6efd" }}>{totalOfertas} pujas</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (alSeleccionarSubasta) {
            alSeleccionarSubasta(subasta?.id || subasta?.Id); 
          } else {
            console.error("alSeleccionarSubasta es undefined en la tarjeta");}
          }}
        style={{
          width: "100%",
          backgroundColor: "#0d6efd",
          color: "#fff",
          border: "none",
          padding: "10px",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "4px"
        }}
      >
        🔨 Ver / Ingresar a la Sala
      </button>
    </div>
  );
};

export const CatalogoSubasta = ({ alSeleccionarSubasta}) => {
  const [subastas, setSubastas] = useState([]);
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [ordenamiento, setOrdenamiento] = useState("TIEMPO_MENOR");
  const [cargando, setCargando] = useState(true);

  const cargarSubastas = async () => {
    try {
      setCargando(true);
      
      const res = await fetch("https://localhost:7009/api/auctions?page=1&pageSize=50");
      if (!res.ok) {
        throw new Error(`Error HTTP al obtener catálogo: ${res.status}`);
      }
      
      const raw = await res.json();
      
      let lista = [];
      if (Array.isArray(raw)) {
        lista = raw;
      } else if (raw.items) {
        lista = Array.isArray(raw.items) ? raw.items : (raw.items.$values || []);
      } else if (raw.data?.items) {
        lista = Array.isArray(raw.data.items) ? raw.data.items : (raw.data.items.$values || []);
      } else if (raw.$values) {
        lista = raw.$values;
      } else if (raw.data?.$values) {
        lista = raw.data.$values;
      } else if (Array.isArray(raw.data)) {
        lista = raw.data;
      }
      
      setSubastas(lista);

    } catch (err) {
      console.error("Falló la carga del catálogo:", err);
      const guardadas = JSON.parse(
        localStorage.getItem("subastas") || localStorage.getItem("misSubastas") || "[]"
      );
      setSubastas(guardadas);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSubastas();
  }, []);
    const subastasFiltradas = subastas
    .filter((subasta) => {
      const titulo = (subasta.titulo || subasta.Titulo || "").toLowerCase();
      const descripcion = (subasta.descripcion || subasta.Descripcion || "").toLowerCase();
      const categoriaId = Number(subasta.categoriaId || subasta.CategoriaId);

      const parseUTC = (f) => {
  const s = (f || "").toString();
  return new Date(s.endsWith('Z') ? s : `${s}Z`).getTime();
};
const fechaInicio = parseUTC(subasta.fechaInicio || subasta.FechaInicio || subasta.fechaInicio);
const fechaFin = parseUTC(subasta.fechaFin || subasta.FechaFin);
const ahora = new Date().getTime();

     /* const fechaInicio = new Date(subasta.fechaInicio || subasta.FechaInicio || subasta.fecha_inicio).getTime();
      const fechaFin = new Date(subasta.fechaFin || subasta.FechaFin).getTime();
      const ahora = new Date().getTime();*/

      const coincideTexto =
        !busquedaTexto ||
        titulo.includes(busquedaTexto.toLowerCase()) ||
        descripcion.includes(busquedaTexto.toLowerCase());

      // Filtramos por tiempo real
      let coincideEstado = false;
      if (filtroEstado === "TODOS") {
        coincideEstado = true;
      } else if (filtroEstado === "ACTIVA") {
        coincideEstado = ahora >= fechaInicio && ahora <= fechaFin;
      } else if (filtroEstado === "PROGRAMADA") {
        coincideEstado = ahora < fechaInicio;
      } else if (filtroEstado === "FINALIZADA") {
        coincideEstado = ahora > fechaFin;
      }

      const coincideCategoria =
        filtroCategoria === "TODAS" || categoriaId === Number(filtroCategoria);

      return coincideTexto && coincideEstado && coincideCategoria;
    })
    .sort((a, b) => {
      if (ordenamiento === "TIEMPO_MENOR") {
        const finA = new Date(a.fechaFin || a.FechaFin).getTime();
        const finB = new Date(b.fechaFin || b.FechaFin).getTime();
        return finA - finB;
      }
      if (ordenamiento === "PUJA_MAYOR") {
        const pujasA = a.pujas || a.Pujas || [];
        const pujasB = b.pujas || b.Pujas || [];
        const maxA = pujasA.length > 0 ? Math.max(...pujasA.map((p) => Number(p.monto || p.Monto))) : Number(a.precioBase || a.PrecioBase || 0);
        const maxB = pujasB.length > 0 ? Math.max(...pujasB.map((p) => Number(p.monto || p.Monto))) : Number(b.precioBase || b.PrecioBase || 0);
        return maxB - maxA;
      }
      return 0;
    });

  /*const subastasFiltradas = subastas
    .filter((subasta) => {
      const titulo = (subasta.titulo || subasta.Titulo || "").toLowerCase();
      const descripcion = (subasta.descripcion || subasta.Descripcion || "").toLowerCase();
      const estado = (subasta.estado !== undefined && subasta.estado !== null ? subasta.estado : subasta.Estado || "").toString().toUpperCase();
      const categoriaId = Number(subasta.categoriaId || subasta.CategoriaId);

      const coincideTexto =
        !busquedaTexto ||
        titulo.includes(busquedaTexto.toLowerCase()) ||
        descripcion.includes(busquedaTexto.toLowerCase());

      const coincideEstado =
        filtroEstado === "TODOS" ||
        estado === filtroEstado ||
        (filtroEstado === "ACTIVA" && (estado === "ACTIVA" || estado === "ACTIVO" || estado === "1")) ||
        (filtroEstado === "PROGRAMADA" && (estado === "PROGRAMADA" || estado === "PROXIMA" || estado === "0")) ||
        (filtroEstado === "FINALIZADA" && (estado === "FINALIZADA" || estado === "DESIERTA" || estado === "2"));

      const coincideCategoria =
        filtroCategoria === "TODAS" || categoriaId === Number(filtroCategoria);

      return coincideTexto && coincideEstado && coincideCategoria;
    })
    .sort((a, b) => {
      if (ordenamiento === "TIEMPO_MENOR") {
        const finA = new Date(a.fechaFin || a.FechaFin).getTime();
        const finB = new Date(b.fechaFin || b.FechaFin).getTime();
        return finA - finB;
      }
      if (ordenamiento === "PUJA_MAYOR") {
        const pujasA = a.pujas || a.Pujas || [];
        const pujasB = b.pujas || b.Pujas || [];
        const maxA = pujasA.length > 0 ? Math.max(...pujasA.map((p) => p.monto || p.Monto)) : (a.precioBase || a.PrecioBase);
        const maxB = pujasB.length > 0 ? Math.max(...pujasB.map((p) => p.monto || p.Monto)) : (b.precioBase || b.PrecioBase);
        return maxB - maxA;
      }
      return 0;
    });*/

  return (
    <div data-sys-render="auto" className="catalogo-container" style={{ padding: "10px" }}>
      <div className="card" style={{ marginBottom: "25px", padding: "18px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "15px" }}>🏬 Catálogo de Subastas</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              🔍 Buscar por título:
            </label>
            <input
              type="text"
              placeholder="Ej. Laptop, Auto, Reloj..."
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              📌 Estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVA">Activas (en curso)</option>
              <option value="PROGRAMADA">Próximas (programadas)</option>
              <option value="FINALIZADA">Finalizadas</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              🏷️ Categoría:
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="TODAS">Todas las categorías</option>
              <option value="1">Tecnología</option>
              <option value="2">Coleccionables</option>
              <option value="3">Indumentaria</option>
              <option value="4">Vehículos</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "5px" }}>
              📊 Ordenar por:
            </label>
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="TIEMPO_MENOR">⏱️ Menor tiempo restante</option>
              <option value="PUJA_MAYOR">💰 Mayor puja actual</option>
            </select>
          </div>
        </div>
      </div>

      {cargando && <p style={{ textAlign: "center", padding: "20px" }}>Cargando catálogo en vivo...</p>}

      {!cargando && (
        <>
          {subastasFiltradas.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
              No se encontraron subastas que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="grid-catalogo" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "35px",justifyContent:"center" }}>
              {subastasFiltradas.map((subasta, i) => (
                <TarjetaSubastaCard
                  key={subasta.id || subasta.Id || i}
                  subasta={subasta}
                  alSeleccionarSubasta={alSeleccionarSubasta}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};