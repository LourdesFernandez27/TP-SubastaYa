import React, { useState } from "react";
export const CrearSubasta = ({ vendedorId = 1, alCrearExitosa }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    urlImagen: "",
    categoriaId: 1,
    precioBase: "",
    incrementoMinimo: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [errorValidacion, setErrorValidacion] = useState("");
  const [cargando, setCargando] = useState(false);

  const categoriasDisponibles = [
    { id: 1, nombre: "Tecnología" },
    { id: 2, nombre: "Coleccionables" },
    { id: 3, nombre: "Indumentaria" },
    { id: 4, nombre: "Vehículos" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion("");

    const inicio = new Date(formData.fechaInicio);
    const fin = new Date(formData.fechaFin);
    const pBase = parseFloat(formData.precioBase);
    const incMin = parseFloat(formData.incrementoMinimo);

    if (isNaN(pBase) || pBase <= 0) {
      const msg = "El precio base debe ser un valor positivo.";
      console.error(msg);
      setErrorValidacion(msg);
      return;
    }

    if (isNaN(incMin) || incMin <= 0) {
      const msg = "El incremento mínimo debe ser mayor a cero.";
      console.error(msg);
      setErrorValidacion(msg);
      return;
    }

    if (fin <= inicio) {
      const msg = "La fecha de finalización debe ser posterior a la fecha de inicio.";
      console.error(msg);
      setErrorValidacion(msg);
      return;
    }

    try {
      setCargando(true);
      const payload = {
        ...formData,
        vendedorId: vendedorId,
        categoriaId: parseInt(formData.categoriaId),
        precioBase: pBase,
        incrementoMinimo: incMin
      };

      const response = await fetch("http://localhost:7009/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status})`);
      }

      alert("¡Subasta creada y publicada con éxito!");
      
      setFormData({ 
        titulo: "", 
        descripcion: "", 
        urlImagen: "", 
        categoriaId: 1, 
        precioBase: "", 
        incrementoMinimo: "", 
        fechaInicio: "", 
        fechaFin: "" 
        });
      
      if (alCrearExitosa) alCrearExitosa();
    } catch (err) {
      console.error("Falló la creación de la subasta:", err);
      setErrorValidacion("No se pudo conectar con el servidor para publicar la subasta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div data-sys-render="auto" className="card" style={{ maxWidth: "600px", margin: "20px auto" }}>
      <h2>➕ Publicar Nueva Subasta</h2>

      {errorValidacion && (
        <div style={{ background: "#f8d7da", color: "#842029", padding: "10px", borderRadius: "6px", marginBottom: "15px" }}>
          {errorValidacion}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <label>Título del Producto:</label>
          <input
            type="text"
            name="titulo"
            required
            value={formData.titulo}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label>Descripción Detallada:</label>
          <textarea
            name="descripcion"
            rows="3"
            required
            value={formData.descripcion}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label>URL de la Imagen:</label>
          <input
            type="url"
            name="urlImagen"
            placeholder="https://ejemplo.com/imagen.jpg"
            required
            value={formData.urlImagen}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label>Categoría:</label>
          <select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            {categoriasDisponibles.map((cat, i) => (
              <option key={cat.id || i} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label>Precio Base (\$):</label>
            <input
              type="number"
              name="precioBase"
              min="1"
              required
              value={formData.precioBase}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Incremento Mínimo (\$):</label>
            <input
              type="number"
              name="incrementoMinimo"
              min="1"
              required
              value={formData.incrementoMinimo}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label>Fecha/Hora Inicio:</label>
            <input
              type="datetime-local"
              name="fechaInicio"
              required
              value={formData.fechaInicio}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha/Hora Fin:</label>
            <input
              type="datetime-local"
              name="fechaFin"
              required
              value={formData.fechaFin}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            backgroundColor: "#198754",
            color: "#fff",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: cargando ? "not-allowed" : "pointer",
            marginTop: "10px"
          }}
        >
          {cargando ? "Publicando..." : "🚀 Publicar Subasta"}
        </button>
      </form>
    </div>
  );
};