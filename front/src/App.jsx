import React, { useState } from "react";

import { CatalogoSubasta } from "./components/CatalogoSubasta";
import { CrearSubasta } from "./components/CrearSubasta";
import { SalasSubastaVivo } from "./components/SalasSubastaVivo"; // También DetalleSubasta
import { PanelBilletera } from "./components/PanelBilletera";
import { MisActividades } from "./components/MisActividades";

import "./App.css";

function App() {
  const [vistaActual, setVistaActual] = useState("catalogo");
  
  const [subastaSeleccionadaId, setSubastaSeleccionadaId] = useState(1);

  // ID del usuario autenticado en la sesión (por defecto el comprador2 con ID 3)
  const usuarioActualId = 3;

  return (
    <div data-sys-render="auto" className="app-main-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "15px" }}>
      <header className="card" style={{ marginBottom: "20px", padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.8rem" }}>🔨</span>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#0d6efd" }}>SubastaYa</h1>
        </div>

        <nav style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setVistaActual("catalogo")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: vistaActual === "catalogo" ? "#0d6efd" : "#f8f9fa",
              color: vistaActual === "catalogo" ? "#fff" : "#212529"
            }}
          >
            🏬 Catálogo
          </button>

          <button
            onClick={() => setVistaActual("crear")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: vistaActual === "crear" ? "#0d6efd" : "#f8f9fa",
              color: vistaActual === "crear" ? "#fff" : "#212529"
            }}
          >
            ➕ Publicar
          </button>

          <button
            onClick={() => setVistaActual("sala")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: vistaActual === "sala" ? "#0d6efd" : "#f8f9fa",
              color: vistaActual === "sala" ? "#fff" : "#212529"
            }}
          >
            ⚡ Sala en Vivo
          </button>

          <button
            onClick={() => setVistaActual("billetera")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: vistaActual === "billetera" ? "#0d6efd" : "#f8f9fa",
              color: vistaActual === "billetera" ? "#fff" : "#212529"
            }}
          >
            💰 Billetera
          </button>

          <button
            onClick={() => setVistaActual("actividades")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: vistaActual === "actividades" ? "#0d6efd" : "#f8f9fa",
              color: vistaActual === "actividades" ? "#fff" : "#212529"
            }}
          >
            📋 Mis Actividades
          </button>
        </nav>
      </header>

      <main>
  
        {vistaActual === "catalogo" && (
          <CatalogoSubasta
            alSeleccionarSubasta={(idSubasta) => {
              setSubastaSeleccionadaId(idSubasta);
              setVistaActual("sala"); 
            }}
          />
        )}

        {vistaActual === "crear" && (
          <CrearSubasta
            vendedorId={1}
            alCrearExitosa={() => setVistaActual("catalogo")} 
          />
        )}

        {vistaActual === "sala" && (
          <SalasSubastaVivo
            subastaId={subastaSeleccionadaId}
            usuarioActualId={usuarioActualId}
          />
        )}

        {vistaActual === "billetera" && (
          <PanelBilletera usuarioId={usuarioActualId} />
        )}

        {vistaActual === "actividades" && (
          <MisActividades usuarioId={usuarioActualId} />
        )}
      </main>
    </div>
  );
}

export default App;