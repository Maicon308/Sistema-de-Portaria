import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import './PortariaPanel.css';

// Componentes dos módulos
import VisitantesModulo from './modulos/VisitantesModulo';
import PrestadoresModulo from './modulos/PrestadoresModulo';
import FreelancersModulo from './modulos/FreelancersModulo';
import SaidaMaterialModulo from './modulos/SaidaMaterialModulo';

const FILIAL_ATUAL = 'Restinga';

const PortariaPanelCompleto = ({ porteiro, onLogout }) => {
    const [moduloAtivo, setModuloAtivo] = useState('visitantes');

    const handleLogout = () => {
        if (window.confirm("Deseja realmente sair do Painel da Portaria?")) {
            onLogout();
        }
    };

    const renderModulo = () => {
        switch (moduloAtivo) {
            case 'visitantes':
                return <VisitantesModulo porteiroMatricula={porteiro.matricula} />;
            case 'prestadores':
                return <PrestadoresModulo porteiroMatricula={porteiro.matricula} />;
            case 'freelancers':
                return <FreelancersModulo porteiroMatricula={porteiro.matricula} />;
            case 'saida-material':
                return <SaidaMaterialModulo porteiroMatricula={porteiro.matricula} />;
            default:
                return <div>Selecione um módulo.</div>;
        }
    };

    return (
        <div className="portaria-panel">
            {/* CABEÇALHO */}
            <div className="portaria-header">
                <div className="header-title-section">
                    <h2 className="header-title">🏢 PAINEL DA PORTARIA</h2>
                    <p className="header-subtitle">FILIAL | BASE - {FILIAL_ATUAL.toUpperCase()}</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">🚪 SAIR</button>
            </div>

            {/* INFO PORTEIRO */}
            <div className="info-porteiro">
                👤 Porteiro(a): <strong>{porteiro.nome}</strong> | Matrícula: <strong>{porteiro.matricula}</strong>
            </div>

            {/* MÓDULOS PRINCIPAIS */}
            <div className="modulos-container">
                <button 
                    className={`modulo-btn ${moduloAtivo === 'visitantes' ? 'active' : ''}`}
                    onClick={() => setModuloAtivo('visitantes')}
                >
                    👥 VISITANTES
                </button>
                <button 
                    className={`modulo-btn ${moduloAtivo === 'prestadores' ? 'active' : ''}`}
                    onClick={() => setModuloAtivo('prestadores')}
                >
                    🔧 PRESTADORES
                </button>
                <button 
                    className={`modulo-btn ${moduloAtivo === 'freelancers' ? 'active' : ''}`}
                    onClick={() => setModuloAtivo('freelancers')}
                >
                    💼 FREELANCERS
                </button>
                <button 
                    className={`modulo-btn ${moduloAtivo === 'saida-material' ? 'active' : ''}`}
                    onClick={() => setModuloAtivo('saida-material')}
                >
                    📦 SAÍDA MATERIAL
                </button>
            </div>

            {/* CONTEÚDO DO MÓDULO */}
            <div className="modulo-content">
                {renderModulo()}
            </div>
        </div>
    );
};

export default PortariaPanelCompleto;