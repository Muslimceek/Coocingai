import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This is CRITICAL to prevent "process is not defined" white screen errors
    'process.env': process.env || {} 
  }
})