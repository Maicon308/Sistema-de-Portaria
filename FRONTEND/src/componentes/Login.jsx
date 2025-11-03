import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import { API_BASE_URL } from '../config';  // ⭐ Importa da config

// A imagem será carregada pelo Vite
import imagemLogin from "./img/setup_login.jpg";

const Login = ({ onLogin }) => {
  // Estados
  const [matricula, setMatricula] = useState("");
  const [erro, setError] = useState("");
  const [carregando, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ URL Correta: Acessa a rota 'porteiros/login/'
      const response = await axios.post(`${API_BASE_URL}/porteiros/login/`, {
        matricula: matricula,
      });

      // Se a resposta for 200 OK e contiver os dados do porteiro, loga.
      if (response.data.porteiro) {
        onLogin(response.data.porteiro);
      } else {
        // Resposta OK, mas sem dados (Inesperado)
        setError("Matrícula não encontrada ou inválida. (Resposta Inesperada)");
      }
    } catch (err) {
      // 🚨 TRATAMENTO DE ERROS DO BACKEND (HTTP Status Codes)
      if (err.response) {
        const status = err.response.status;
        // Tenta pegar o detalhe do erro do backend, se disponível
        const detail = err.response.data.detail || err.response.data.error || "Erro desconhecido no servidor.";

        if (status === 400) {
          // Erro 400 - Ex: Matrícula inválida, campo vazio ou não encontrada
          setError(`Erro de Login: ${detail}`);
        } else if (status === 404) {
          // Erro 404 - Rota não encontrada.
          setError("Erro: A rota de login não foi encontrada no servidor (404). Verifique a URL.");
        } else {
          // Outros erros HTTP (500, etc.)
          setError(`Erro ${status}: Falha ao tentar logar. Tente novamente.`);
        }
      } else {
        // Erro de rede (ERR_CONNECTION_REFUSED)
        setError("Falha ao conectar com o servidor. Verifique se o backend está ativo.");
      }
      console.error("Erro de login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 1. SEÇÃO DA IMAGEM/LOGO */}
      <div className="login-image-section">
        <img src={imagemLogin} alt="Grupo SETUP Logo" className="login-logo" />
      </div>

      {/* 2. SEÇÃO DO FORMULÁRIO */}
      <div className="login-form-section">
        <h2 className="login-title">FILIAL <br></br>| BASE - RESTINGA</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="matricula">Matrícula:</label>
            <input
              type="text"
              id="matricula"
              placeholder="Ex: 98765"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          {erro && <p className="error-message">{erro}</p>}

          <button 
            type="submit" 
            className="login-btn" 
            disabled={carregando || !matricula}
          >
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;