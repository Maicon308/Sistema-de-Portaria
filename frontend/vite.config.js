// FRONTEND/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ⭐ Isso permite acesso de outros dispositivos na rede
    port: 5173,
    strictPort: true, // Garante que sempre use a porta 5173
    open: false, // Não abre o navegador automaticamente
  }
})