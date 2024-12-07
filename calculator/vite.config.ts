import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  resolve: {
      alias: {
          '@': path.resolve(__dirname, './src'), // Alias for the src directory
      },
  },
  server: {
      fs: {
          allow: ['..'], // Allow importing files outside the root directory
      },
  },
});