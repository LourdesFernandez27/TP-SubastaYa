import React, { useState } from "react";

import { CatalogoSubasta }  from "./components/CatalogoSubasta";
import { CrearSubasta}  from "./components/CrearSubasta";
import { SalasSubastaVivo }  from "./components/SalasSubastaVivo"; 
import { PanelBilletera }  from "./components/PanelBilletera";
import { MisActividades }  from "./components/MisActividades";
import { Login } from "./components/Login";

import "./App.css";

// Mapeo de IDs a emails del seed
const USUARIOS = [
  { id: 1, email: 'vendedor@test.com', label: 'Vendedor', rol: 'VENDEDOR' },
  { id: 2, email: 'comprador1@test.com', label: 'Comprador 1 ($150k)', rol: 'COMPRADOR' },
  { id: 3, email: 'comprador2@test.com', label: 'Comprador 2 ($200k)', rol: 'COMPRADOR' },
  { id: 4, email: 'sinfondos@test.com', label: 'Sin fondos ($500)', rol: 'COMPRADOR' },
];

function App() {
  const [vistaActual, setVistaActual] = useState("catalogo");
  const [subastaSeleccionadaId, setSubastaSeleccionadaId] = useState(null);
  const [cartelLogin, setCartelLogin] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuarioSubasta");
    return usuarioGuardado ? Number(usuarioGuardado) : null;
  });

  const handleLogin = (usuario) => {
    setUsuarioActual(usuario);
    localStorage.setItem("usuarioSubasta", JSON.stringify(usuario));
    setCartelLogin(false);
    if (subastaSeleccionadaId) {
      setUsuarioActual("sala");
    }
  };

  const handleLogOut= () => {
    setUsuarioActual(null);
    localStorage.removeItem("usuarioSubasta");
    setVistaActual("catalogo");
  };

  const handleIngresarASalaCatalogo = (idSubasta) => {
    setSubastaSeleccionadaId(idSubasta);
    if (!usuarioActual) {
      setCartelLogin(true);
    } else {
      setVistaActual("sala");
    }
  };

  const navegarA= (nuevaVista) => {
    const vistasProtegidas = ["crear", "sala", "actividades", "billetera"];
    if (vistasProtegidas.includes(nuevaVista) && !usuarioActual) {
      setCartelLogin(true);
      return;
    }
    setVistaActual(nuevaVista);
  };

  const usuarioActualId = usuarioActual?.id;
  const esVendedor = usuarioActual?.rol?.toUpperCase() === "VENDEDOR";

  return (
    <div className="app-main-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "15px" }}>
      <div style={{ background: '#fff3cd', padding: '10px', textAlign: 'center', marginBottom: '10px', borderRadius: '8px' }}>
  <strong>🧪 Modo Prueba: </strong>
  {usuarioActual ? (
  <>
  <select value={usuarioActualId} onChange={(e) => {
    const nuevo = USUARIOS.find(u => u.id === Number(e.target.value));
    if (nuevo) handleLogin(nuevo);}}
    style= {{padding: "4px 8px", borderRadius: "4px", fontWeight: "bold"}}>
    {USUARIOS.map(u => (<option key={u.id} value={u.id}>{u.label} ({u.rol}) </option>))}
  </select>
  <button 
    onClick= {handleLogOut} style= {{padding: "4px 10px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem"}}>
      Cerrar sesión
    </button>
    </> 
  ) : (
    <span> Modo invitado </span>
  )}
</div>
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
              (!usuarioActual || esVendedor) && (
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
          {!usuarioActual && (
            <button
              onClick={() => setCartelLogin(true)}
              style= {{ padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer",
                backgroundColor: "#198754", color: "#fff", marginLeft: "10px"}}>
                  Iniciar sesión
                </button>
          )}
        </nav>
      </header>
      
      {cartelLogin && (
        <div style= {{position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style= {{background: "hsl(204, 80%, 73%)", padding: "25px", borderRadius: "10px", width: "90%", maxWidth: "420px", position: "relative"}}>
              <button
                onClick = {() => setCartelLogin(false)}
                style= {{position: "absolute", top: "10px", right: "15px", border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer"}}>
                  ✕
                </button>
                <Login onLogin={handleLogin} />
            </div>
            </div> 
        )}
      
      <main>
        {vistaActual === "catalogo" && (
          <CatalogoSubasta alSeleccionarSubasta={handleIngresarASalaCatalogo} />
        )}

        {vistaActual === "crear" && usuarioActual && (
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

        {vistaActual === "sala" && usuarioActual && (
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

        {vistaActual === "billetera" && usuarioActual && (
          <PanelBilletera usuarioId={usuarioActualId} />
        )}

        {vistaActual === "actividades" && usuarioActual && (
          <MisActividades usuarioId={usuarioActualId} 
          esVendedor= {esVendedor}/>
        )}
      </main>
    </div>
  );
}

export default App;