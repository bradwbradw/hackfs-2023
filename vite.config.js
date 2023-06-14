import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  //forward urls to /api to the server
  server: {
    https: true,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },

})
