import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //forward urls to /api to the server
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }

})
