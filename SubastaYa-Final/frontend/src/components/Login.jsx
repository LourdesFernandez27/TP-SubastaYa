import React, { useState } from 'react';
const USUARIOS_PRUEBA =[
    { id: 1, email: "vendedor@test.com", password: "123", label: "Vendedor", rol: "VENDEDOR"},
    { id: 2, email: "comprador1@test.com", password: "123", label: "Comprador 1 ($150k)", rol: "COMPRADOR"},
    { id: 3, email: "comprador2@test.com", password: "123", label: "Comprador 2 ($200k)", rol: "COMPRADOR"},
    { id: 4, email: "sinfondos@test.com", password: "123", label: "Sin fondos ($500)", rol: "COMPRADOR"},
]; 

export const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError(''); 
        try {
            const usuario= USUARIOS_PRUEBA.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
            if (!usuario) {
                throw new Error ("Email o contraseña incorrectos");
            }
            onLogin(usuario);
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div
            style= {{ maxWidth: "400px", margin: "0 auto", padding:"10px" }}>
                <h2 style= {{textAlign: "center", marginBottom: "20px", color: "#212529"}}> Iniciar sesión </h2>
                    
                <div classename= "card"
                style= {{
                    backgroundColor: "#ffffff", padding: "25px", borderRadius: "10px", border: "1px solid #e0e0e0"
                }}>

                    <form onSubmit={handleSubmit}
                    style= {{display: "flex", flexDirection: "column", gap: "15px"}}>
                    <div>
                        <label style= {{fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "5px"}}>
                            Email:
                        </label>
                        <input
                            type= "email"
                            placeholder='ejemplo@test.com'
                            value= {email}
                            onChange= {(e) => setEmail(e.target.value)}
                            style= {{width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ccc"}} required />
                    </div>

                    <div>
                        <label style= {{fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "5px"}}>
                            Contraseña: 
                        </label>
                        <input 
                        type = "password"
                        placeholder='••••••'
                        value= {password}
                        onChange= {(e) => setPassword(e.target.value)}
                        style= {{width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ccc"}}required />
                    </div>

                    {error && <p style= {{ color: "#dc3545", margin: 0, fontSize: "0.85rem", fontWeight: "bold" }}> {error} </p>}
                    
                    <button
                        type= "submit"
                        disabled= {cargando}
                        style= {{width: "100%", padding: "12px", backgroundColor: "#0d6efd", borderRadius: "6px", color: "#fff", fontWeight: "bold", cursor: cargando ? "not-allowed" : "pointer"}}>
                        {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
            </form>
        </div>
    </div>
    );
};