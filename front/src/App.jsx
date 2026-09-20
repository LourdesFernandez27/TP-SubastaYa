import React, { useState } from "react";
import { PanelBilletera } from "./components/PanelBilletera"; 
export const App = () => { 
  // ID del usuario simulado en sesión (Ejemplo: ID 2 = comprador1) 
const [usuarioId, setUsuarioId] = useState(2); 
return ( 
  <div className = "app-container">
    <header> 
      <h2>SubastaYa - Panel de Control</h2> 
      {/* Selector de Usuario para pruebas */} 
      <div className= "usuario-selector"> 
        <label>Simular usuario: </label>
        <select value={usuarioId} onChange= {(e) => setUsuarioId(Number(e.target.value))}>
          <option value={1}>Vendedor (ID: 1)</option>
          <option value={2}>Comprador 1 (ID: 2)</option>
          <option value={3}>Comprador 2 (ID: 3)</option>
          <option value={4}>Sin Fondos (ID: 4)</option>
        </select>
      </div> 
    </header>
  
    <main> 
      {/* El panel recargará automáticamente el saldo al cambiar el ID */} 
      <PanelBilletera usuarioId={usuarioId} /> 
    </main> 
  </div> 
  ); 
};