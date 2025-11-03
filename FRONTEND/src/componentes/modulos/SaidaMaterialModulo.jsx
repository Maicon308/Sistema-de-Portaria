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
// COMPONENTE: REGISTRAR SAÍDA DE MATERIAL
// ============================================================================
const RegistroSaidaMaterial = ({ porteiroMatricula, updateConsulta }) => {
    const [formData, setFormData] = useState({
        numero_nf_almox: '',
        autorizador: '',
        prestador: '',
        observacao: ''
    });
    
    const [autorizadores, setAutorizadores] = useState([]);
    const [prestadores, setPrestadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [autorizadoresRes, prestadoresRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/autorizadores/`),
                    axios.get(`${API_BASE_URL}/prestadores/ativos/`)
                ]);
                setAutorizadores(autorizadoresRes.data);
                setPrestadores(prestadoresRes.data);
            } catch (err) {
                setError("Falha ao carregar dados.");
            }
        };
        fetchDependencies();
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
            const payload = {
                ...formData,
                prestador: formData.prestador || null, // Se vazio, envia null
                porteiro: porteiroMatricula
            };

            await axios.post(`${API_BASE_URL}/saidas-material/`, payload);
            
            setSuccess(`✅ Saída de material registrada! NF: ${formData.numero_nf_almox}`);
            setFormData({
                numero_nf_almox: '',
                autorizador: '',
                prestador: '',
                observacao: ''
            });
            updateConsulta();
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                const errorMessages = Object.keys(errorData).map(key => {
                    const messages = Array.isArray(errorData[key]) ? errorData[key] : [errorData[key]];
                    return `${key.toUpperCase()}: ${messages.join(', ')}`;
                }).join('; ');
                setError(`❌ Erro: ${errorMessages}`);
            } else {
                setError("❌ Erro ao registrar saída de material.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="entrada-panel">
            <div className="panel-header">
                <h3 className="panel-title">📦 Registrar Saída de Material</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="form-content">
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Nº NF do Almoxarifado *</label>
                        <input 
                            type="text" 
                            name="numero_nf_almox" 
                            value={formData.numero_nf_almox} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            placeholder="Ex: 45252-1"
                        />
                        <small style={{ color: '#7f8c8d', fontSize: '0.85em' }}>
                            ℹ️ Informe o número da NF fornecido pelo almoxarifado
                        </small>
                    </div>
                    <div className="form-group">
                        <label>Quem Autorizou a Saída *</label>
                        <select 
                            name="autorizador" 
                            value={formData.autorizador} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                        >
                            <option value="">Selecione o Autorizador</option>
                            {autorizadores.map(aut => (
                                <option key={aut.id} value={aut.id}>
                                    {aut.nome} ({aut.setor_nome})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Prestador Relacionado (Opcional)</label>
                    <select 
                        name="prestador" 
                        value={formData.prestador} 
                        onChange={handleChange} 
                        disabled={loading}
                    >
                        <option value="">Nenhum (Saída avulsa)</option>
                        {prestadores.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.empresa_nome} - {p.nome_responsavel}
                            </option>
                        ))}
                    </select>
                    <small style={{ color: '#7f8c8d', fontSize: '0.85em' }}>
                        ℹ️ Vincule a um prestador se a saída for para ele
                    </small>
                </div>

                <div className="form-group">
                    <label>Observações</label>
                    <textarea 
                        name="observacao" 
                        value={formData.observacao} 
                        onChange={handleChange} 
                        rows="3" 
                        disabled={loading}
                        placeholder="Ex: Material para manutenção elétrica"
                    ></textarea>
                </div>

                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="btn-entrada" disabled={loading}>
                    {loading ? "⏳ REGISTRANDO..." : "📦 REGISTRAR SAÍDA"}
                </button>
            </form>
        </div>
    );
};

// ============================================================================
// COMPONENTE: CONSULTA DE SAÍDAS DE MATERIAL
// ============================================================================
const ConsultaSaidasMaterial = ({ saidas, updateConsulta, loading }) => {
    return (
        <div className="consulta-panel">
            <div className="panel-header">
                <h3 className="panel-title">📦 Histórico de Saídas de Material</h3>
                <button onClick={updateConsulta} className="btn-refresh" disabled={loading}>
                    {loading ? "⏳ Carregando..." : "🔄 Atualizar"}
                </button>
            </div>
            
            {loading ? (
                <p className="loading-message">⏳ Carregando...</p>
            ) : saidas.length === 0 ? (
                <p className="no-data">📋 Nenhuma saída de material registrada hoje.</p>
            ) : (
                <div className="table-responsive">
                    <table className="tabela-visitantes">
                        <thead>
                            <tr>
                                <th>Nº NF Almox</th>
                                <th>Autorizador</th>
                                <th>Prestador</th>
                                <th>Data/Hora</th>
                                <th>Porteiro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {saidas.map(s => (
                                <tr key={s.id}>
                                    <td data-label="Nº NF Almox">
                                        <span className="cracha-numero">{s.numero_nf_almox}</span>
                                    </td>
                                    <td data-label="Autorizador"><strong>{s.autorizador_nome}</strong></td>
                                    <td data-label="Prestador">
                                        {s.prestador ? (
                                            <span>Vinculado (ID: {s.prestador})</span>
                                        ) : (
                                            <em style={{ color: '#7f8c8d' }}>Saída avulsa</em>
                                        )}
                                    </td>
                                    <td data-label="Data/Hora">{formatDate(s.data_hora_saida)}</td>
                                    <td data-label="Porteiro">{s.porteiro_nome}</td>
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
// COMPONENTE PRINCIPAL: MÓDULO SAÍDA DE MATERIAL
// ============================================================================
const SaidaMaterialModulo = ({ porteiroMatricula }) => {
    const [abaAtiva, setAbaAtiva] = useState('registro');
    const [saidas, setSaidas] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSaidas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/saidas-material/`);
            // Pega apenas as saídas de hoje
            const hoje = new Date().toISOString().split('T')[0];
            const saidasHoje = response.data.filter(s => 
                s.data_hora_saida.startsWith(hoje)
            );
            setSaidas(saidasHoje);
        } catch (error) {
            console.error("Erro ao carregar saídas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (abaAtiva === 'consulta') {
            fetchSaidas();
        }
    }, [abaAtiva, fetchSaidas]);

    const renderAba = () => {
        switch (abaAtiva) {
            case 'registro':
                return <RegistroSaidaMaterial porteiroMatricula={porteiroMatricula} updateConsulta={fetchSaidas} />;
            case 'consulta':
                return <ConsultaSaidasMaterial saidas={saidas} updateConsulta={fetchSaidas} loading={loading} />;
            default:
                return null;
        }
    };

    return (
        <div className="modulo-saida-material">
            <div className="abas-container">
                <button 
                    className={`aba-btn ${abaAtiva === 'registro' ? 'active' : ''}`} 
                    onClick={() => setAbaAtiva('registro')}
                >
                    📦 REGISTRAR SAÍDA
                </button>
                <button 
                    className={`aba-btn ${abaAtiva === 'consulta' ? 'active' : ''}`} 
                    onClick={() => setAbaAtiva('consulta')}
                >
                    📋 CONSULTA (HOJE)
                </button>
            </div>

            <div className="conteudo-aba">
                {renderAba()}
            </div>
        </div>
    );
};

export default SaidaMaterialModulo;