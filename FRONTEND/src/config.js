// FRONTEND/src/config.js

/**
 * ⭐ CONFIGURAÇÃO AUTOMÁTICA DA API ⭐
 * 
 * Este arquivo detecta automaticamente o IP/hostname onde o frontend está rodando
 * e configura a URL da API do backend para o mesmo IP.
 * 
 * EXEMPLO:
 * - Se você abrir: http://localhost:5173 → API: http://localhost:8000/api
 * - Se você abrir: http://192.168.0.104:5173 → API: http://192.168.0.104:8000/api
 */

// Pega o hostname atual (ex: 192.168.0.104, localhost, 127.0.0.1)
const currentHost = window.location.hostname;

// Define a URL da API baseada no host detectado
export const API_BASE_URL = `http://${currentHost}:8000/api`;

// ⭐ ALTERNATIVA: Use um IP FIXO se preferir (descomente a linha abaixo)
// export const API_BASE_URL = 'http://192.168.0.104:8000/api';

// Log para debug (aparece no console do navegador)
console.log('🌐 API Backend conectada em:', API_BASE_URL);
console.log('📱 Frontend rodando em:', window.location.origin);

// Exporta também a URL base (sem /api) caso precise
export const API_HOST = `http://${currentHost}:8000`;