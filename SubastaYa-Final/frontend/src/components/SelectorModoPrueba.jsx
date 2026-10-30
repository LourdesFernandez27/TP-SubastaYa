import React, { useState } from 'react';
export const USUARIOS_PRUEBA =[
    { id: 1, email: "vendedor@test.com", label: "Vendedor", rol: "VENDEDOR"},
    { id: 2, email: "comprador1@test.com", label: "Comprador 1 ($150k)", rol: "COMPRADOR"},
    { id: 3, email: "comprador2@test.com", label: "Comprador 2 ($200k)", rol: "COMPRADOR"},
    { id: 4, email: "sinfondos@test.com", label: "Sin fondos ($500)", rol: "COMPRADOR"},
]; 

export const SelectorModoPrueba = ({ usuarioActual, onCambiarUsuario }) => {
    const handleChange = (e) => {
        const idSeleccionado = Number(e.target.value);
        const usuarioEncontrado = USUARIOS_PRUEBA.find((u) => u.id === idSeleccionado);
        if (usuarioEncontrado) {
            onCambiarUsuario(usuarioEncontrado);
        }
    };

    return (
        <div style= {{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', backgroundColor: '#e6c8b3',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '8px', padding: '8px 16px', textAlign: 'center', marginBottom: '20px', justifyContent: 'center'}}>
            
            <span style= {{fontWeight: 'bold', fontSize: '0.95rem', color: '#1a1a1a', alignItems: 'center', gap: '6px'}}>
                🧪 Modo prueba: 
            </span>
            <select 
                value= {usuarioActual?.id || 1}
                onChange= {handleChange}
                style= {{ padding: '5px 10px', backgroundColor: '#ffffff', outline: 'none', color: '#212529', border: '1px solid #ced4da',
                borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer'}}>
                {USUARIOS_PRUEBA.map((u) => (
                    <option key= {u.id} value= {u.id}>
                        {u.label}
                    </option>
                ))}
            </select>
        </div>
    );
};