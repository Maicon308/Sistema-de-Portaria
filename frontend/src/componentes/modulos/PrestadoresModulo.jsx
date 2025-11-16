import React, { useState, useEffect } from 'react';
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
        empresa: '',
        empresa_particular: '',
        nome_responsavel: '',
        num_cracha_prestador: '',
        categoria_servico: 'MANUTENCAO',
        tipo_servico: '',
        autorizador: '',
        setor_destino: '',
        autorizador_saida_material: '',
        setor_saida_material: '',
        veiculo_tipo_saida: 'NENHUM',
        veiculo_placa_saida: ''
    });
    
    const [acompanhantes, setAcompanhantes] = useState([]);
    const [novoAcompanhante, setNovoAcompanhante] = useState({ nome: '', documento: '' });
    
    const [empresas, setEmpresas] = useState([]);
    const [empresasParticulares, setEmpresasParticulares] = useState([]);
    const [autorizadores, setAutorizadores] = useState([]);
    const [setores, setSetores] = useState([]);
    const [tipoEmpresa, setTipoEmpresa] = useState('equatorial'); // 'equatorial' ou 'particular'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [empresasRes, autorizadoresRes, setoresRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/empresas/`),
                    axios.get(`${API_BASE_URL}/autorizadores/`),
                    axios.get(`${API_BASE_URL}/setores/`)
                ]);
                setEmpresas(empresasRes.data);
                setAutorizadores(autorizadoresRes.data);
                setSetores(setoresRes.data);
                
                // Separar empresas particulares (buscar as já cadastradas)
                const particulares = empresasRes.data.filter(emp => emp.tipo !== 'ENERGIA');
                setEmpresasParticulares(particulares);
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

    const adicionarAcompanhante = () => {
        if (novoAcompanhante.nome && novoAcompanhante.documento) {
            setAcompanhantes([...acompanhantes, novoAcompanhante]);
            setNovoAcompanhante({ nome: '', documento: '' });
        }
    };

    const removerAcompanhante = (index) => {
        setAcompanhantes(acompanhantes.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                ...formData,
                porteiro: porteiroMatricula,
                acompanhantes: acompanhantes
            };
            
            // Se for Equatorial, limpar empresa_particular
            if (tipoEmpresa === 'equatorial') {
                payload.empresa_particular = '';
            } else {
                // Se for particular, definir empresa como null ou primeira empresa
                payload.empresa = empresas[0]?.id || null;
            }
            
            // Se for MANUTENCAO, limpar campos de retirada
            if (formData.categoria_servico === 'MANUTENCAO') {
                payload.autorizador_saida_material = null;
                payload.setor_saida_material = null;
                payload.veiculo_tipo_saida = null;
                payload.veiculo_placa_saida = '';
            }

            await axios.post(`${API_BASE_URL}/prestadores/`, payload);
            setSuccess("✅ Prestador registrado com sucesso!");
            
            // Resetar formulário
            setFormData({
                empresa: '',
                empresa_particular: '',
                nome_responsavel: '',
                num_cracha_prestador: '',
                categoria_servico: 'MANUTENCAO',
                tipo_servico: '',
                autorizador: '',
                setor_destino: '',
                autorizador_saida_material: '',
                setor_saida_material: '',
                veiculo_tipo_saida: 'NENHUM',
                veiculo_placa_saida: ''
            });
            setAcompanhantes([]);
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
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="form-content">
                {/* Tipo de Empresa */}
                <div className="form-group">
                    <label>Tipo de Empresa *</label>
                    <select value={tipoEmpresa} onChange={(e) => setTipoEmpresa(e.target.value)} required>
                        <option value="equatorial">Equatorial (Pré-cadastrada)</option>
                        <option value="particular">Particular</option>
                    </select>
                </div>

                {/* Empresa Equatorial */}
                {tipoEmpresa === 'equatorial' && (
                    <div className="form-group">
                        <label>Empresa Prestadora *</label>
                        <select name="empresa" value={formData.empresa} onChange={handleChange} required>
                            <option value="">Selecione...</option>
                            {empresas.filter(emp => emp.tipo === 'ENERGIA').map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.nome}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Empresa Particular */}
                {tipoEmpresa === 'particular' && (
                    <div className="form-group">
                        <label>Nome da Empresa Particular *</label>
                        <input
                            type="text"
                            name="empresa_particular"
                            value={formData.empresa_particular}
                            onChange={handleChange}
                            placeholder="Digite o nome da empresa"
                            required
                            list="empresas-particulares"
                        />
                        <datalist id="empresas-particulares">
                            {empresasParticulares.map((emp, idx) => (
                                <option key={idx} value={emp.nome} />
                            ))}
                        </datalist>
                        <small>Digite ou selecione de empresas já cadastradas</small>
                    </div>
                )}

                {/* Nome do Responsável */}
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Nome do Responsável *</label>
                        <input
                            type="text"
                            name="nome_responsavel"
                            value={formData.nome_responsavel}
                            onChange={handleChange}
                            placeholder="Quem ficará com o cartão"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Número do Cartão *</label>
                        <input
                            type="text"
                            name="num_cracha_prestador"
                            value={formData.num_cracha_prestador}
                            onChange={handleChange}
                            placeholder="Ex: 001"
                            required
                        />
                    </div>
                </div>

                {/* Acompanhantes */}
                <div className="form-group">
                    <label>Acompanhantes</label>
                    <div style={{border: '1px solid #dfe6e9', padding: '15px', borderRadius: '8px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px'}}>
                            <input
                                type="text"
                                placeholder="Nome do acompanhante"
                                value={novoAcompanhante.nome}
                                onChange={(e) => setNovoAcompanhante({...novoAcompanhante, nome: e.target.value})}
                            />
                            <input
                                type="text"
                                placeholder="RG ou CPF"
                                value={novoAcompanhante.documento}
                                onChange={(e) => setNovoAcompanhante({...novoAcompanhante, documento: e.target.value})}
                            />
                            <button
                                type="button"
                                onClick={adicionarAcompanhante}
                                className="btn-entrada"
                                style={{padding: '10px 20px', width: 'auto'}}
                            >
                                ➕ Adicionar
                            </button>
                        </div>
                        
                        {acompanhantes.length > 0 && (
                            <div style={{marginTop: '10px'}}>
                                <strong>Acompanhantes ({acompanhantes.length}):</strong>
                                <ul style={{listStyle: 'none', padding: 0, marginTop: '8px'}}>
                                    {acompanhantes.map((acomp, index) => (
                                        <li key={index} style={{
                                            background: '#f8f9fa',
                                            padding: '8px 12px',
                                            marginBottom: '5px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span>{acomp.nome} - {acomp.documento}</span>
                                            <button
                                                type="button"
                                                onClick={() => removerAcompanhante(index)}
                                                style={{
                                                    background: '#e74c3c',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '4px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✕ Remover
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Categoria do Serviço */}
                <div className="form-group">
                    <label>Tipo de Serviço Prestado *</label>
                    <select name="categoria_servico" value={formData.categoria_servico} onChange={handleChange} required>
                        <option value="MANUTENCAO">Manutenção</option>
                        <option value="RETIRADA_MATERIAL">Retirada de Materiais</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Descrição do Serviço *</label>
                    <input
                        type="text"
                        name="tipo_servico"
                        value={formData.tipo_servico}
                        onChange={handleChange}
                        placeholder="Ex: Ar Condicionado, Pedreiro, Elétrica..."
                        required
                    />
                </div>

                {/* Autorização Entrada */}
                <div className="form-field-group-2-cols">
                    <div className="form-group">
                        <label>Quem Autorizou *</label>
                        <select name="autorizador" value={formData.autorizador} onChange={handleChange} required>
                            <option value="">Selecione...</option>
                            {autorizadores.map(aut => (
                                <option key={aut.id} value={aut.id}>{aut.nome} ({aut.setor_nome})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Setor de Destino</label>
                        <select name="setor_destino" value={formData.setor_destino} onChange={handleChange}>
                            <option value="">Selecione...</option>
                            {setores.map(set => (
                                <option key={set.id} value={set.id}>{set.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Campos específicos para RETIRADA DE MATERIAL */}
                {formData.categoria_servico === 'RETIRADA_MATERIAL' && (
                    <>
                        <h4 style={{color: '#00a88e', marginTop: '20px', marginBottom: '15px'}}>📦 Dados da Retirada de Material</h4>
                        
                        <div className="form-field-group-2-cols">
                            <div className="form-group">
                                <label>Quem Autorizou a Retirada *</label>
                                <select name="autorizador_saida_material" value={formData.autorizador_saida_material} onChange={handleChange} required>
                                    <option value="">Selecione...</option>
                                    {autorizadores.map(aut => (
                                        <option key={aut.id} value={aut.id}>{aut.nome} ({aut.setor_nome})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Setor *</label>
                                <select name="setor_saida_material" value={formData.setor_saida_material} onChange={handleChange} required>
                                    <option value="">Selecione...</option>
                                    {setores.map(set => (
                                        <option key={set.id} value={set.id}>{set.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-field-group-2-cols">
                            <div className="form-group">
                                <label>Tipo de Veículo *</label>
                                <select name="veiculo_tipo_saida" value={formData.veiculo_tipo_saida} onChange={handleChange} required>
                                    <option value="CARRO">Carro</option>
                                    <option value="MOTO">Moto</option>
                                    <option value="VAN">Van</option>
                                    <option value="BICICLETA">Bicicleta</option>
                                    <option value="CAMINHAO">Caminhão</option>
                                    <option value="NENHUM">Sem veículo</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Placa do Veículo</label>
                                <input
                                    type="text"
                                    name="veiculo_placa_saida"
                                    value={formData.veiculo_placa_saida}
                                    onChange={handleChange}
                                    placeholder="Ex: ABC-1234"
                                />
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className="btn-entrada" disabled={loading}>
                    {loading ? 'Registrando...' : '✅ Registrar Entrada'}
                </button>
            </form>
        </div>
    );
};

// Componente de Saída (simplificado)
const SaidaPrestador = ({ porteiroMatricula, updateConsulta }) => {
    const [numeroCracha, setNumeroCracha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Buscar prestador pelo número do crachá
            const response = await axios.get(`${API_BASE_URL}/prestadores/`, {
                params: { num_cracha: numeroCracha, sem_saida: true }
            });
            
            if (response.data.length === 0) {
                setError("❌ Nenhum prestador encontrado com este cartão.");
                return;
            }

            const prestador = response.data[0];
            
            // Registrar saída
            await axios.patch(`${API_BASE_URL}/prestadores/${prestador.id}/saida/`, {
                data_hora_saida: new Date().toISOString()
            });

            setSuccess(`✅ Saída registrada! Prestador: ${prestador.nome_responsavel}`);
            setNumeroCracha('');
            updateConsulta();
        } catch (err) {
            setError("❌ Erro ao registrar saída.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="saida-panel">
            <div className="panel-header">
                <h3 className="panel-title">📤 Registro de Saída - Prestador</h3>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="form-content form-saida-centralizado">
                <div className="form-group">
                    <label>Número do Cartão *</label>
                    <input
                        type="text"
                        value={numeroCracha}
                        onChange={(e) => setNumeroCracha(e.target.value)}
                        placeholder="Digite o número do cartão"
                        required
                        autoFocus
                    />
                </div>

                <button type="submit" className="btn-saida" disabled={loading}>
                    {loading ? 'Processando...' : '📤 Registrar Saída'}
                </button>
            </form>
        </div>
    );
};

// Componente de Consulta
const ConsultaPrestadores = ({ porteiroMatricula }) => {
    const [prestadores, setPrestadores] = useState([]);
    const [loading, setLoading] = useState(false);

    const carregarPrestadores = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/prestadores/`);
            setPrestadores(response.data);
        } catch (err) {
            console.error('Erro ao carregar prestadores:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarPrestadores();
    }, []);

    return (
        <div className="consulta-panel">
            <div className="panel-header">
                <h3 className="panel-title">📋 Consulta de Prestadores</h3>
                <button onClick={carregarPrestadores} className="btn-refresh" disabled={loading}>
                    {loading ? '🔄 Atualizando...' : '🔄 Atualizar'}
                </button>
            </div>

            {loading ? (
                <div className="loading-message">Carregando...</div>
            ) : prestadores.length === 0 ? (
                <div className="no-data">Nenhum registro encontrado.</div>
            ) : (
                <div className="table-responsive">
                    <table className="tabela-visitantes">
                        <thead>
                            <tr>
                                <th>Cartão</th>
                                <th>Empresa</th>
                                <th>Responsável</th>
                                <th>Categoria</th>
                                <th>Serviço</th>
                                <th>Entrada</th>
                                <th>Saída</th>
                                <th>Acompanhantes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestadores.map(prest => (
                                <tr key={prest.id}>
                                    <td data-label="Cartão">
                                        <span className="cracha-numero">{prest.num_cracha_prestador}</span>
                                    </td>
                                    <td data-label="Empresa">{prest.empresa_particular || prest.empresa_nome}</td>
                                    <td data-label="Responsável">{prest.nome_responsavel}</td>
                                    <td data-label="Categoria">{prest.categoria_servico}</td>
                                    <td data-label="Serviço">{prest.tipo_servico}</td>
                                    <td data-label="Entrada">{formatDate(prest.data_hora_entrada)}</td>
                                    <td data-label="Saída">
                                        {prest.data_hora_saida ? formatDate(prest.data_hora_saida) : <strong style={{color: '#00a88e'}}>EM ANDAMENTO</strong>}
                                    </td>
                                    <td data-label="Acompanhantes">
                                        {prest.acompanhantes?.length || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Componente Principal com Abas
const PrestadoresModulo = ({ porteiroMatricula }) => {
    const [abaAtiva, setAbaAtiva] = useState('entrada');
    const [refreshKey, setRefreshKey] = useState(0);

    const updateConsulta = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div>
            <div className="abas-container">
                <button 
                    className={`aba-btn ${abaAtiva === 'entrada' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('entrada')}
                >
                    📥 Entrada
                </button>
                <button 
                    className={`aba-btn ${abaAtiva === 'saida' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('saida')}
                >
                    📤 Saída
                </button>
                <button 
                    className={`aba-btn ${abaAtiva === 'consulta' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('consulta')}
                >
                    📋 Consulta
                </button>
            </div>

            <div className="conteudo-aba">
                {abaAtiva === 'entrada' && (
                    <EntradaPrestador porteiroMatricula={porteiroMatricula} updateConsulta={updateConsulta} />
                )}
                {abaAtiva === 'saida' && (
                    <SaidaPrestador porteiroMatricula={porteiroMatricula} updateConsulta={updateConsulta} />
                )}
                {abaAtiva === 'consulta' && (
                    <ConsultaPrestadores key={refreshKey} porteiroMatricula={porteiroMatricula} />
                )}
            </div>
        </div>
    );
};

export default PrestadoresModulo;
