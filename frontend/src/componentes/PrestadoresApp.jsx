import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';

// Componentes dos 3 tipos
import TerceirizadoEquatorialForm from './prestadores/TerceirizadoEquatorialForm';
import FreelancerSetupForm from './prestadores/FreelancerSetupForm';
import ContratadoSetupForm from './prestadores/ContratadoSetupForm';

const PrestadoresApp = ({ porteiroMatricula, voltarParaSelecao }) => {
    const [tipoSelecionado, setTipoSelecionado] = useState(null);

    // TELA DE SELEÇÃO DE TIPO
    if (!tipoSelecionado) {
        return (
            <div className="app-prestadores">
                <div className="app-titulo">
                    <h2>🔧 PRESTADORES DE SERVIÇOS</h2>
                </div>

                <div className="selecao-tipo-prestador">
                    <h3 className="selecao-subtitulo">Escolha o tipo de prestador:</h3>
                    
                    <div className="tipos-container">
                        {/* TIPO 1: TERCEIRIZADO EQUATORIAL */}
                        <button 
                            className="tipo-card"
                            onClick={() => setTipoSelecionado('terceirizado')}
                        >
                            <div className="tipo-icon">🏢</div>
                            <h4 className="tipo-title">TERCEIRIZADO EQUATORIAL</h4>
                            <p className="tipo-description">
                                Empresas como ALTA, PROGEN, etc.<br/>
                                Entrada com veículo e acompanhantes<br/>
                                Saída com NF se retirar material
                            </p>
                        </button>

                        {/* TIPO 2: FREELANCER SETUP */}
                        <button 
                            className="tipo-card"
                            onClick={() => setTipoSelecionado('freelancer')}
                        >
                            <div className="tipo-icon">💼</div>
                            <h4 className="tipo-title">FREELANCER SETUP</h4>
                            <p className="tipo-description">
                                Manutenção de Pátio, Higienização<br/>
                                Recebe cartão na entrada<br/>
                                Devolve cartão na saída
                            </p>
                        </button>

                        {/* TIPO 3: CONTRATADO SETUP */}
                        <button 
                            className="tipo-card"
                            onClick={() => setTipoSelecionado('contratado')}
                        >
                            <div className="tipo-icon">🔧</div>
                            <h4 className="tipo-title">CONTRATADO SETUP</h4>
                            <p className="tipo-description">
                                Guincho, Hidráulica, Manutenção<br/>
                                Entrada com veículo e cartão<br/>
                                Saída com autorização ou NF
                            </p>
                        </button>
                    </div>

                    <button 
                        className="btn-voltar-selecao" 
                        onClick={voltarParaSelecao}
                        style={{ marginTop: '30px' }}
                    >
                        ⬅️ VOLTAR PARA SELEÇÃO PRINCIPAL
                    </button>
                </div>
            </div>
        );
    }

    // RENDERIZA O TIPO SELECIONADO
    const voltarParaTipos = () => {
        setTipoSelecionado(null);
    };

    return (
        <div className="app-prestadores">
            {tipoSelecionado === 'terceirizado' && (
                <TerceirizadoEquatorialForm 
                    porteiroMatricula={porteiroMatricula}
                    voltarParaTipos={voltarParaTipos}
                    voltarParaSelecao={voltarParaSelecao}
                />
            )}

            {tipoSelecionado === 'freelancer' && (
                <FreelancerSetupForm 
                    porteiroMatricula={porteiroMatricula}
                    voltarParaTipos={voltarParaTipos}
                    voltarParaSelecao={voltarParaSelecao}
                />
            )}

            {tipoSelecionado === 'contratado' && (
                <ContratadoSetupForm 
                    porteiroMatricula={porteiroMatricula}
                    voltarParaTipos={voltarParaTipos}
                    voltarParaSelecao={voltarParaSelecao}
                />
            )}
        </div>
    );
};

export default PrestadoresApp;