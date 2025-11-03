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
// COMPONENTE: ENTRADA DE PRESTADOR
// ============================================================================
const EntradaPrestador = ({ porteiroMatricula, updateConsulta }) => {
    const [formData, setFormData] = useState({
        empresa: '', tipo_servico_energia: '', nome_responsavel: '',
        matricula_responsavel: '', documento_responsavel: '',
        acompanhantes: '', quem_solicitou: '', autorizador: '',
        tipo_servico: '', veiculo_tipo: 'NENHUM',
        veiculo_placa: '', veiculo_motorista: ''
    });
    
    const [empresas, setEmpresas] = useState([]);
    const [tiposServico, setTiposServico] = useState([]);
    const [autorizadores, setAutorizadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEnergiaCompany, setIsEnergiaCompany] = useState(false);

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [empresasRes, tiposRes, autorizadoresRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/empresas/`),
                    axios.get(`${API_BASE_URL}/tipos-servico-energia/`),
                    axios.get(`${API_BASE_URL}/autorizadores/`)
                ]);
                setEmpresas(empresasRes.data);
                setTiposServico(tiposRes.data);
                setAutorizadores(autorizadoresRes.data);
            } catch (err) {
                setError("Falha ao carregar dados.");
            }
        };
        fetchDependencies();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Verifica se é empresa de energia (CEEE/EQUATORIAL)
        if (name === 'empresa') {
            const empresaSelecionada = empresas.find(emp => emp.id === parseInt(value));
            setIsEnergiaCompany(empresaSelecionada?.tipo === 'ENERGIA');
        }
        
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = { ...formData, porteiro: porteiroMatricula };
            
            // Remove tipo_servico_energia se não for empresa de energia
            if (!isEnergiaCompany) {
                payload.tipo_servico_energia = null;
                payload.matricula_responsavel = null;
            }

            const response = await axios.post(`${API_BASE_URL}/prestadores/`, payload);
            setSuccess("✅ Prestador registrado com sucesso!");
            
            setFormData({
                empresa: '', tipo_servico_energia: '', nome_responsavel: '',
                matricula_responsavel: '', documento_responsavel: '',
                acompanhantes: '', quem_solicitou: '', autorizador: '',
                tipo_servico: '', veiculo_tipo: 'NENHUM',
                veiculo_placa: '', veiculo_motorista: ''
            });
            setIsEnergiaCompany(false);
            updateConsulta();
        } catch (err) {
            const errorData = err.response?.data;
            setError(errorData?.error || "❌ Erro ao registrar prestador.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="entrada-panel">
            <div className="panel-header">
                <h3 className="panel-title">🔧 Registro de Entrada - Prestador de Serviço</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="form-content">
                {/* EMPRESA E TIPO DE SERVIÇO */}
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Empresa Prestadora *</label>
                        <select name="empresa" value={formData.empresa} onChange={handleChange} required disabled={loading}>
                            <option value="">Selecione a Empresa</option>
                            {empresas.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.nome} ({emp.tipo})</option>
                            ))}
                        </select>
                    </div>
                    
                    {isEnergiaCompany && (
                        <div className="form-group">
                            <label>Tipo de Serviço (CEEE/EQUATORIAL) *</label>
                            <select name="tipo_servico_energia" value={formData.tipo_servico_energia} onChange={handleChange} required disabled={loading}>
                                <option value="">Selecione o Tipo</option>
                                {tiposServico
                                    .filter(tipo => tipo.empresa === parseInt(formData.empresa))
                                    .map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                                    ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* DADOS DO RESPONSÁVEL */}
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Nome do Responsável *</label>
                        <input type="text" name="nome_responsavel" value={formData.nome_responsavel} onChange={handleChange} required disabled={loading} placeholder="Ex: João Silva" />
                    </div>
                    <div className="form-group">
                        <label>RG/CPF do Responsável *</label>
                        <input type="text" name="documento_responsavel" value={formData.documento_responsavel} onChange={handleChange} required disabled={loading} placeholder="Ex: 123.456.789-00" />
                    </div>
                </div>

                {/* MATRÍCULA (SÓ PARA ENERGIA) */}
                {isEnergiaCompany && (
                    <div className="form-group">
                        <label>Matrícula (CEEE/EQUATORIAL)</label>
                        <input type="text" name="matricula_responsavel" value={formData.matricula_responsavel} onChange={handleChange} disabled={loading} placeholder="Ex: 12345" />
                    </div>
                )}

                {/* ACOMPANHANTES */}
                <div className="form-group">
                    <label>Acompanhantes (um por linha)</label>
                    <textarea name="acompanhantes" value={formData.acompanhantes} onChange={handleChange} rows="3" disabled={loading} placeholder="Ex:&#10;Maria Silva&#10;Pedro Santos"></textarea>
                </div>

                {/* SOLICITAÇÃO E AUTORIZAÇÃO */}
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Quem Solicitou o Serviço *</label>
                        <input type="text" name="quem_solicitou" value={formData.quem_solicitou} onChange={handleChange} required disabled={loading} placeholder="Ex: Gerente de TI" />
                    </div>
                    <div className="form-group">
                        <label>Quem Autorizou *</label>
                        <select name="autorizador" value={formData.autorizador} onChange={handleChange} required disabled={loading}>
                            <option value="">Selecione o Autorizador</option>
                            {autorizadores.map(aut => (
                                <option key={aut.id} value={aut.id}>{aut.nome} ({aut.setor_nome})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* TIPO DE SERVIÇO PRESTADO */}
                <div className="form-group">
                    <label>Tipo de Serviço Prestado *</label>
                    <input type="text" name="tipo_servico" value={formData.tipo_servico} onChange={handleChange} required disabled={loading} placeholder="Ex: Manutenção elétrica" />
                </div>

                {/* VEÍCULO */}
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Tipo de Veículo *</label>
                        <select name="veiculo_tipo" value={formData.veiculo_tipo} onChange={handleChange} disabled={loading}>
                            <option value="NENHUM">Sem veículo</option>
                            <option value="CARRO">Carro</option>
                            <option value="CAMINHAO">Caminhão</option>
                            <option value="MOTO">Moto</option>
                            <option value="VAN">Van</option>
                        </select>
                    </div>
                    
                    {formData.veiculo_tipo !== 'NENHUM' && (
                        <div className="form-group">
                            <label>Placa do Veículo</label>
                            <input type="text" name="veiculo_placa" value={formData.veiculo_placa} onChange={handleChange} disabled={loading} placeholder="Ex: ABC-1234" />
                        </div>
                    )}
                </div>

                {formData.veiculo_tipo !== 'NENHUM' && (
                    <div className="form-group">
                        <label>Nome do Motorista</label>
                        <input type="text" name="veiculo_motorista" value={formData.veiculo_motorista} onChange={handleChange} disabled={loading} placeholder="Ex: Carlos Souza" />
                    </div>
                )}

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
// COMPONENTE: SAÍDA DE PRESTADOR
// ============================================================================
const SaidaPrestador = ({ updateConsulta }) => {
    const [prestadores, setPrestadores] = useState([]);
    const [prestadorSelecionado, setPrestadorSelecionado] = useState('');
    const [formSaida, setFormSaida] = useState({
        retira_material: false,
        autorizador_saida: '',
        veiculo_saida_nome: '',
        veiculo_saida_modelo: '',
        veiculo_saida_placa: '',
        numero_nf_autorizacao: ''
    });
    const [autorizadores, setAutorizadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prestadoresRes, autorizadoresRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/prestadores/ativos/`),
                    axios.get(`${API_BASE_URL}/autorizadores/`)
                ]);
                setPrestadores(prestadoresRes.data);
                setAutorizadores(autorizadoresRes.data);
            } catch (err) {
                setError("Erro ao carregar dados.");
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.patch(`${API_BASE_URL}/prestadores/${prestadorSelecionado}/registrar_saida/`, formSaida);
            setSuccess("✅ Saída registrada com sucesso!");
            setPrestadorSelecionado('');
            setFormSaida({
                retira_material: false, autorizador_saida: '', veiculo_saida_nome: '',
                veiculo_saida_modelo: '', veiculo_saida_placa: '', numero_nf_autorizacao: ''
            });
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
                <h3 className="panel-title">🚪 Registrar Saída - Prestador</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="form-content">
                <div className="form-group">
                    <label>Selecione o Prestador *</label>
                    <select value={prestadorSelecionado} onChange={(e) => setPrestadorSelecionado(e.target.value)} required disabled={loading}>
                        <option value="">Selecione...</option>
                        {prestadores.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.empresa_nome} - {p.nome_responsavel}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="checkbox" 
                            checked={formSaida.retira_material} 
                            onChange={(e) => setFormSaida(prev => ({ ...prev, retira_material: e.target.checked }))}
                            disabled={loading}
                        />
                        Retira Material?
                    </label>
                </div>

                {formSaida.retira_material && (
                    <>
                        <div className="form-group">
                            <label>Quem Autorizou a Saída *</label>
                            <select 
                                value={formSaida.autorizador_saida} 
                                onChange={(e) => setFormSaida(prev => ({ ...prev, autorizador_saida: e.target.value }))} 
                                required 
                                disabled={loading}
                            >
                                <option value="">Selecione o Autorizador</option>
                                {autorizadores.map(aut => (
                                    <option key={aut.id} value={aut.id}>{aut.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field-group-2-cols">
                            <div className="form-group">
                                <label>Veículo de Saída (Nome)</label>
                                <input 
                                    type="text" 
                                    value={formSaida.veiculo_saida_nome} 
                                    onChange={(e) => setFormSaida(prev => ({ ...prev, veiculo_saida_nome: e.target.value }))} 
                                    disabled={loading}
                                    placeholder="Ex: Hilux, Strada"
                                />
                            </div>
                            <div className="form-group">
                                <label>Modelo</label>
                                <input 
                                    type="text" 
                                    value={formSaida.veiculo_saida_modelo} 
                                    onChange={(e) => setFormSaida(prev => ({ ...prev, veiculo_saida_modelo: e.target.value }))} 
                                    disabled={loading}
                                    placeholder="Ex: 2020, CD 4x4"
                                />
                            </div>
                        </div>

                        <div className="form-field-group-2-cols">
                            <div className="form-group">
                                <label>Placa</label>
                                <input 
                                    type="text" 
                                    value={formSaida.veiculo_saida_placa} 
                                    onChange={(e) => setFormSaida(prev => ({ ...prev, veiculo_saida_placa: e.target.value }))} 
                                    disabled={loading}
                                    placeholder="Ex: ABC-1234"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nº NF ou Autorização *</label>
                                <input 
                                    type="text" 
                                    value={formSaida.numero_nf_autorizacao} 
                                    onChange={(e) => setFormSaida(prev => ({ ...prev, numero_nf_autorizacao: e.target.value }))} 
                                    required
                                    disabled={loading}
                                    placeholder="Ex: 45252-1"
                                />
                            </div>
                        </div>
                    </>
                )}

                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="btn-saida" disabled={loading || !prestadorSelecionado}>
                    {loading ? "⏳ PROCESSANDO..." : "🚪 REGISTRAR SAÍDA"}
                </button>
            </form>
        </div>
    );
};

// ============================================================================
// COMPONENTE: CONSULTA DE PRESTADORES
// ============================================================================
const ConsultaPrestadores = ({ prestadores, updateConsulta, loading }) => {
    return (
        <div className="consulta-panel">
            <div className="panel-header">
                <h3 className="panel-title">🔧 Prestadores Ativos</h3>
                <button onClick={updateConsulta} className="btn-refresh" disabled={loading}>
                    {loading ? "⏳ Carregando..." : "🔄 Atualizar"}
                </button>
            </div>
            
            {loading ? (
                <p className="loading-message">⏳ Carregando...</p>
            ) : prestadores.length === 0 ? (
                <p className="no-data">✅ Nenhum prestador ativo no momento.</p>
            ) : (
                <div className="table-responsive">
                    <table className="tabela-visitantes">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Responsável</th>
                                <th>Serviço</th>
                                <th>Veículo</th>
                                <th>Entrada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestadores.map(p => (
                                <tr key={p.id}>
                                    <td data-label="Empresa"><strong>{p.empresa_nome}</strong></td>
                                    <td data-label="Responsável">{p.nome_responsavel}<br/><small>{p.documento_responsavel}</small></td>
                                    <td data-label="Serviço">{p.tipo_servico}</td>
                                    <td data-label="Veículo">{p.veiculo_tipo === 'NENHUM' ? 'Sem veículo' : `${p.veiculo_tipo} - ${p.veiculo_placa || 'S/P'}`}</td>
                                    <td data-label="Entrada">{formatDate(p.data_hora_entrada)}</td>
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
// COMPONENTE PRINCIPAL: MÓDULO PRESTADORES
// ============================================================================
const PrestadoresModulo = ({ porteiroMatricula }) => {
    const [abaAtiva, setAbaAtiva] = useState('entrada');
    const [prestadores, setPrestadores] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPrestadores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/prestadores/ativos/`);
            setPrestadores(response.data);
        } catch (error) {
            console.error("Erro ao carregar prestadores:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (abaAtiva === 'consulta') {
            fetchPrestadores();
        }
    }, [abaAtiva, fetchPrestadores]);

    const renderAba = () => {
        switch (abaAtiva) {
            case 'entrada':
                return <EntradaPrestador porteiroMatricula={porteiroMatricula} updateConsulta={fetchPrestadores} />;
            case 'saida':
                return <SaidaPrestador updateConsulta={fetchPrestadores} />;
            case 'consulta':
                return <ConsultaPrestadores prestadores={prestadores} updateConsulta={fetchPrestadores} loading={loading} />;
            default:
                return null;
        }
    };

    return (
        <div className="modulo-prestadores">
            <div className="abas-container">
                <button className={`aba-btn ${abaAtiva === 'entrada' ? 'active' : ''}`} onClick={() => setAbaAtiva('entrada')}>📝 ENTRADA</button>
                <button className={`aba-btn ${abaAtiva === 'saida' ? 'active' : ''}`} onClick={() => setAbaAtiva('saida')}>🚪 SAÍDA</button>
                <button className={`aba-btn ${abaAtiva === 'consulta' ? 'active' : ''}`} onClick={() => setAbaAtiva('consulta')}>🔧 CONSULTA</button>
            </div>

            <div className="conteudo-aba">
                {renderAba()}
            </div>
        </div>
    );
};

export default PrestadoresModulo;