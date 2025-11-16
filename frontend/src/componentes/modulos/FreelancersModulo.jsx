import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { API_BASE_URL } from '../../config';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch (e) {
        return 'Formato Inválido';
    }
};

// ============================================================================
// COMPONENTE: ENTRADA DE FREELANCER
// ============================================================================
const EntradaFreelancer = ({ porteiroMatricula, updateConsulta }) => {
    const [formData, setFormData] = useState({
        nome: '',
        documento: '',
        funcao: ''
    });
    
    const [funcoes, setFuncoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchFuncoes = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/funcoes-freelancer/`);
                setFuncoes(response.data);
            } catch (err) {
                setError("Falha ao carregar funções.");
            }
        };
        fetchFuncoes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.post(`${API_BASE_URL}/freelancers/`, {
                ...formData,
                porteiro: porteiroMatricula
            });
            
            setSuccess(`✅ Freelancer ${formData.nome} registrado com sucesso!`);
            setFormData({ nome: '', documento: '', funcao: '' });
            updateConsulta();
        } catch (err) {
            const errorData = err.response?.data;
            setError(errorData?.error || "❌ Erro ao registrar freelancer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="entrada-panel">
            <div className="panel-header">
                <h3 className="panel-title">💼 Registro de Entrada - Freelancer/Diarista</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="form-content">
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Nome Completo *</label>
                        <input 
                            type="text" 
                            name="nome" 
                            value={formData.nome} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            placeholder="Ex: Maria Silva"
                        />
                    </div>
                    <div className="form-group">
                        <label>RG ou CPF *</label>
                        <input 
                            type="text" 
                            name="documento" 
                            value={formData.documento} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            placeholder="Ex: 123.456.789-00"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Função *</label>
                    <select 
                        name="funcao" 
                        value={formData.funcao} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    >
                        <option value="">Selecione a Função</option>
                        {funcoes.map(func => (
                            <option key={func.id} value={func.id}>{func.nome}</option>
                        ))}
                    </select>
                </div>

                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="btn-entrada" disabled={loading}>
                    {loading ? "⏳ REGISTRANDO..." : "✅ REGISTRAR ENTRADA"}
                </button>
            </form>
        </div>
    );
};

// ============================================================================
// COMPONENTE: SAÍDA DE FREELANCER
// ============================================================================
const SaidaFreelancer = ({ updateConsulta }) => {
    const [freelancers, setFreelancers] = useState([]);
    const [freelancerSelecionado, setFreelancerSelecionado] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/freelancers/ativos/`);
                setFreelancers(response.data);
            } catch (err) {
                setError("Erro ao carregar freelancers ativos.");
            }
        };
        fetchFreelancers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.patch(`${API_BASE_URL}/freelancers/${freelancerSelecionado}/registrar_saida/`);
            setSuccess("✅ Saída registrada com sucesso!");
            setFreelancerSelecionado('');
            
            // Atualiza lista
            const response = await axios.get(`${API_BASE_URL}/freelancers/ativos/`);
            setFreelancers(response.data);
            updateConsulta();
        } catch (err) {
            setError(err.response?.data?.error || "❌ Erro ao registrar saída.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="saida-panel">
            <div className="panel-header">
                <h3 className="panel-title">🚪 Registrar Saída - Freelancer</h3>
            </div>
            <p className="panel-subtitle">Selecione o freelancer para dar baixa:</p>
            
            <form onSubmit={handleSubmit} className="form-content form-saida-centralizado">
                <div className="form-group">
                    <label>Selecione o Freelancer *</label>
                    <select 
                        value={freelancerSelecionado} 
                        onChange={(e) => setFreelancerSelecionado(e.target.value)} 
                        required 
                        disabled={loading}
                    >
                        <option value="">Selecione...</option>
                        {freelancers.map(f => (
                            <option key={f.id} value={f.id}>
                                {f.nome} - {f.funcao_nome}
                            </option>
                        ))}
                    </select>
                </div>

                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="btn-saida" disabled={loading || !freelancerSelecionado}>
                    {loading ? "⏳ PROCESSANDO..." : "🚪 REGISTRAR SAÍDA"}
                </button>
            </form>
        </div>
    );
};

// ============================================================================
// COMPONENTE: CONSULTA DE FREELANCERS
// ============================================================================
const ConsultaFreelancers = ({ freelancers, updateConsulta, loading }) => {
    return (
        <div className="consulta-panel">
            <div className="panel-header">
                <h3 className="panel-title">💼 Freelancers/Diaristas Ativos</h3>
                <button onClick={updateConsulta} className="btn-refresh" disabled={loading}>
                    {loading ? "⏳ Carregando..." : "🔄 Atualizar"}
                </button>
            </div>
            
            {loading ? (
                <p className="loading-message">⏳ Carregando...</p>
            ) : freelancers.length === 0 ? (
                <p className="no-data">✅ Nenhum freelancer ativo no momento.</p>
            ) : (
                <div className="table-responsive">
                    <table className="tabela-visitantes">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Documento</th>
                                <th>Função</th>
                                <th>Entrada</th>
                                <th>Porteiro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {freelancers.map(f => (
                                <tr key={f.id}>
                                    <td data-label="Nome"><strong>{f.nome}</strong></td>
                                    <td data-label="Documento">{f.documento}</td>
                                    <td data-label="Função"><span className="cracha-numero">{f.funcao_nome}</span></td>
                                    <td data-label="Entrada">{formatDate(f.data_hora_entrada)}</td>
                                    <td data-label="Porteiro">{f.porteiro_nome}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// COMPONENTE PRINCIPAL: MÓDULO FREELANCERS
// ============================================================================
const FreelancersModulo = ({ porteiroMatricula }) => {
    const [abaAtiva, setAbaAtiva] = useState('entrada');
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFreelancers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/freelancers/ativos/`);
            setFreelancers(response.data);
        } catch (error) {
            console.error("Erro ao carregar freelancers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (abaAtiva === 'consulta') {
            fetchFreelancers();
        }
    }, [abaAtiva, fetchFreelancers]);

    const renderAba = () => {
        switch (abaAtiva) {
            case 'entrada':
                return <EntradaFreelancer porteiroMatricula={porteiroMatricula} updateConsulta={fetchFreelancers} />;
            case 'saida':
                return <SaidaFreelancer updateConsulta={fetchFreelancers} />;
            case 'consulta':
                return <ConsultaFreelancers freelancers={freelancers} updateConsulta={fetchFreelancers} loading={loading} />;
            default:
                return null;
        }
    };

    return (
        <div className="modulo-freelancers">
            <div className="abas-container">
                <button className={`aba-btn ${abaAtiva === 'entrada' ? 'active' : ''}`} onClick={() => setAbaAtiva('entrada')}>📝 ENTRADA</button>
                <button className={`aba-btn ${abaAtiva === 'saida' ? 'active' : ''}`} onClick={() => setAbaAtiva('saida')}>🚪 SAÍDA</button>
                <button className={`aba-btn ${abaAtiva === 'consulta' ? 'active' : ''}`} onClick={() => setAbaAtiva('consulta')}>💼 CONSULTA</button>
            </div>

            <div className="conteudo-aba">
                {renderAba()}
            </div>
        </div>
    );
};

export default FreelancersModulo;