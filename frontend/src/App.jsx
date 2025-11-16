import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:8000/api'

function App() {
  const [activeTab, setActiveTab] = useState('entrada')
  const [visitantesAtivos, setVisitantesAtivos] = useState([])
  const [todosRegistros, setTodosRegistros] = useState([])
  
  const [formEntrada, setFormEntrada] = useState({
    numero_cartao: '',
    nome_visitante: '',
    onde_vai: '',
    quem_autorizou: '',
    nome_porteiro: ''
  })
  
  const [numeroCartaoSaida, setNumeroCartaoSaida] = useState('')
  
  useEffect(() => {
    carregarDados()
  }, [])
  
  const carregarDados = async () => {
    try {
      const [ativosRes, todosRes] = await Promise.all([
        axios.get(`${API_URL}/registros/ativos/`),
        axios.get(`${API_URL}/registros/`)
      ])
      setVisitantesAtivos(ativosRes.data)
      setTodosRegistros(todosRes.data.results || todosRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao conectar com o servidor')
    }
  }
  
  const handleEntrada = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/registros/`, formEntrada)
      alert(`Entrada registrada! Cartão ${formEntrada.numero_cartao} entregue.`)
      setFormEntrada({
        numero_cartao: '',
        nome_visitante: '',
        onde_vai: '',
        quem_autorizou: '',
        nome_porteiro: ''
      })
      carregarDados()
    } catch (error) {
      console.error('Erro ao registrar entrada:', error)
      alert('Erro ao registrar entrada')
    }
  }
  
  const handleSaida = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_URL}/registros/registrar_saida/`, {
        numero_cartao: numeroCartaoSaida
      })
      alert(`Saída registrada!\nVisitante: ${response.data.nome_visitante}`)
      setNumeroCartaoSaida('')
      carregarDados()
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
      alert(error.response?.data?.error || 'Erro ao registrar saída')
    }
  }
  
  return (
    <div className="app">
      <header className="header">
        <h1>🏢 CONTROLE DE PORTARIA</h1>
        <p>Sistema de Registro de Visitantes</p>
      </header>
      
      <div className="tabs">
        <button 
          className={activeTab === 'entrada' ? 'active' : ''}
          onClick={() => setActiveTab('entrada')}
        >
          📥 Entrada
        </button>
        <button 
          className={activeTab === 'saida' ? 'active' : ''}
          onClick={() => setActiveTab('saida')}
        >
          📤 Saída
        </button>
        <button 
          className={activeTab === 'ativos' ? 'active' : ''}
          onClick={() => setActiveTab('ativos')}
        >
          👥 Ativos ({visitantesAtivos.length})
        </button>
        <button 
          className={activeTab === 'relatorio' ? 'active' : ''}
          onClick={() => setActiveTab('relatorio')}
        >
          📊 Relatório
        </button>
      </div>
      
      <div className="content">
        {activeTab === 'entrada' && (
          <div className="form-container">
            <h2>Registrar Entrada</h2>
            <form onSubmit={handleEntrada}>
              <div className="form-group">
                <label>Número do Cartão</label>
                <input
                  type="text"
                  required
                  value={formEntrada.numero_cartao}
                  onChange={(e) => setFormEntrada({...formEntrada, numero_cartao: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Nome do Visitante</label>
                <input
                  type="text"
                  required
                  value={formEntrada.nome_visitante}
                  onChange={(e) => setFormEntrada({...formEntrada, nome_visitante: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Onde Vai (Setor/Sala)</label>
                <input
                  type="text"
                  required
                  value={formEntrada.onde_vai}
                  onChange={(e) => setFormEntrada({...formEntrada, onde_vai: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Quem Autorizou</label>
                <input
                  type="text"
                  required
                  value={formEntrada.quem_autorizou}
                  onChange={(e) => setFormEntrada({...formEntrada, quem_autorizou: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Nome do Porteiro</label>
                <input
                  type="text"
                  required
                  value={formEntrada.nome_porteiro}
                  onChange={(e) => setFormEntrada({...formEntrada, nome_porteiro: e.target.value})}
                />
              </div>
              <button type="submit" className="btn-primary">Registrar Entrada</button>
            </form>
          </div>
        )}
        
        {activeTab === 'saida' && (
          <div className="form-container">
            <h2>Registrar Saída</h2>
            <form onSubmit={handleSaida}>
              <div className="form-group">
                <label>Número do Cartão Devolvido</label>
                <input
                  type="text"
                  required
                  value={numeroCartaoSaida}
                  onChange={(e) => setNumeroCartaoSaida(e.target.value)}
                  placeholder="Digite o número do cartão"
                />
              </div>
              <button type="submit" className="btn-primary">Registrar Saída</button>
            </form>
          </div>
        )}
        
        {activeTab === 'ativos' && (
          <div className="list-container">
            <h2>Visitantes Ativos ({visitantesAtivos.length})</h2>
            {visitantesAtivos.length === 0 ? (
              <p className="empty-message">Nenhum visitante no momento</p>
            ) : (
              <div className="cards">
                {visitantesAtivos.map(reg => (
                  <div key={reg.id} className="card active">
                    <div className="card-header">
                      <span className="badge">Cartão {reg.numero_cartao}</span>
                      <span className="status-badge">ATIVO</span>
                    </div>
                    <h3>{reg.nome_visitante}</h3>
                    <p><strong>Destino:</strong> {reg.onde_vai}</p>
                    <p><strong>Autorizado por:</strong> {reg.quem_autorizou}</p>
                    <p><strong>Entrada:</strong> {reg.data_entrada} às {reg.horario_entrada}</p>
                    <p><strong>Porteiro:</strong> {reg.nome_porteiro}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'relatorio' && (
          <div className="list-container">
            <h2>Relatório Completo</h2>
            {todosRegistros.length === 0 ? (
              <p className="empty-message">Nenhum registro encontrado</p>
            ) : (
              <div className="cards">
                {todosRegistros.map(reg => (
                  <div key={reg.id} className={`card ${reg.status}`}>
                    <div className="card-header">
                      <span className="badge">Cartão {reg.numero_cartao}</span>
                      <span className={`status-badge ${reg.status}`}>
                        {reg.status.toUpperCase()}
                      </span>
                    </div>
                    <h3>{reg.nome_visitante}</h3>
                    <p><strong>Destino:</strong> {reg.onde_vai}</p>
                    <p><strong>Autorizado por:</strong> {reg.quem_autorizou}</p>
                    <p><strong>Porteiro:</strong> {reg.nome_porteiro}</p>
                    <p><strong>Entrada:</strong> {reg.data_entrada} às {reg.horario_entrada}</p>
                    {reg.horario_saida && (
                      <p><strong>Saída:</strong> {reg.data_saida} às {reg.horario_saida}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
