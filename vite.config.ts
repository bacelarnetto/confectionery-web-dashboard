import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Reteste 2026-09-28 (F1): stack trace do bundle minificado era ilegível. 'hidden' gera os .map
  // sem o comentário sourceMappingURL no .js; o nginx.conf responde 404 para *.map, então eles
  // ficam só na imagem (docker cp) para mapear um stack trace de produção, sem ir pro navegador.
  build: {
    sourcemap: 'hidden',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})