import React, { useState } from "react";

import { CatalogoSubasta }  from "./components/CatalogoSubasta";
import { CrearSubasta}  from "./components/CrearSubasta";
import { SalasSubastaVivo }  from "./components/SalasSubastaVivo"; 
import { PanelBilletera }  from "./components/PanelBilletera";
import { MisActividades }  from "./components/MisActividades";
import { SelectorModoPrueba, USUARIOS_PRUEBA } from "./components/SelectorModoPrueba";

import "./App.css";

function App() {
  const [vistaActual, setVistaActual] = useState("catalogo");
  const [subastaSeleccionadaId, setSubastaSeleccionadaId] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(USUARIOS_PRUEBA[1]) 

  const handleIngresarASalaCatalogo = (idSubasta) => {
    setSubastaSeleccionadaId(idSubasta);
    setVistaActual("sala");
  };

  const navegarA= (nuevaVista) => {
    if (nuevaVista === "crear" && !esVendedor) {
      alert("⚠️ Acción no permitida: Solo el perfil VENDEDOR puede publicar subastas. Selecciona 'Vendedor' en el Modo Prueba.");
      return; 
    }
    setVistaActual(nuevaVista);
  };

  const usuarioActualId = usuarioActual?.id;
  const esVendedor = usuarioActual?.rol?.toUpperCase() === "VENDEDOR";

  return (
    <div className="app-main-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "15px" }}>
      <SelectorModoPrueba
      usuarioActual={usuarioActual}
      onCambiarUsuario={setUsuarioActual}
      />

      <header className="card" style={{ marginBottom: "20px", padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.8rem" }}>🔨</span>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#0d6efd", cursor: "pointer" }} onClick= {() =>
            setVistaActual("catalogo")}> SubastaYa</h1>
        </div>

        <nav style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => navegarA("catalogo")}
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
            {
              esVendedor && (
          <button
            onClick={() => navegarA("crear")}
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
            )}

          <button
            onClick={() => navegarA("sala")}
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
            onClick={() => navegarA("billetera")}
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
            onClick={() => navegarA("actividades")}
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
          <CatalogoSubasta alSeleccionarSubasta={handleIngresarASalaCatalogo} />
        )}

        {vistaActual === "crear" && (
          esVendedor ? (
          <CrearSubasta
            usuarioActualId= {usuarioActualId}
            usuarioActual={usuarioActual}
            alCrearExitosa={() => setVistaActual("catalogo")} 
          /> 
          ) : (
            <div classname= "card" style= {{ textAlign: "center", padding: "40px", margin: "20px auto", maxWidth: "500px"}}>
              <h3 style= {{color: "#dc3545" }}> Acceso restringido </h3>
              <p> Tu cuenta actual (<strong> {usuarioActual.email} </strong> no tiene el rol de VENDEDOR. </p>
              <button
                onClick= {() => setVistaActual("catalogo")}
                style= {{padding: "8px 16px", backgroundColor: "#0d6efd", color: "#fff", border: "none", borderRadius: "6px",
                  cursor: "pointer", marginTop: "10px"}}> Volver al catálogo </button>
            </div>
          )
        )}

        {vistaActual === "sala" && (
          <SalasSubastaVivo
            subastaId={subastaSeleccionadaId}
            usuarioActualId={usuarioActualId}
            usuarioId = {usuarioActual.id}
            usuarioActual= {usuarioActual}
            alVolver={() => {
              setSubastaSeleccionadaId(null);
              setVistaActual("catalogo");
            }}
            onSeleccionarSubasta={(id) => setSubastaSeleccionadaId(id)}
          />
        )}

        {vistaActual === "billetera" && (
          <PanelBilletera usuarioId={usuarioActualId} />
        )}

        {vistaActual === "actividades" && (
          <MisActividades usuarioId={usuarioActualId} 
          esVendedor= {esVendedor}/>
        )}
      </main>
    </div>
  );
}

export default App;