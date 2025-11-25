// FRONTEND/src/App.jsx

import React, { useState, useEffect } from 'react';
import Login from './componentes/Login';
import PortariaPanel from './componentes/PortariaPanel'; 
import './App.css'; 

const LOCAL_STORAGE_KEY = 'porteiroData';

const App = () => {
    const [porteiroLogado, setPorteiroLogado] = useState(null); 
    
    // 1. PERSISTÊNCIA: Carrega os dados do porteiro ao iniciar (refresh/abrir)
    useEffect(() => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                // Validação mínima
                if (data && data.matricula) { 
                    setPorteiroLogado(data); 
                } else {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                }
            } catch (e) {
                console.error("Erro ao carregar dados do porteiro do localStorage:", e);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        }
    }, []); 
    
    // 2. LOGIN: Salva no estado e no localStorage
    const handleLogin = (porteiroData) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(porteiroData));
        setPorteiroLogado(porteiroData);
    };

    // 3. LOGOUT: Limpa o localStorage e o estado (Botão SAIR)
    const handleLogout = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setPorteiroLogado(null);
    };

    if (porteiroLogado) {
        // Renderiza o Painel com o porteiro logado e a função de sair
        return (
            <PortariaPanel 
                porteiro={porteiroLogado} 
                onLogout={handleLogout} 
            />
        );
    }

    // Renderiza a Tela de Login
    return (
        <div className="login-screen-wrapper">
            <Login onLogin={handleLogin} /> 
        </div>
    );
};

export default App;