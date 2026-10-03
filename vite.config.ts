import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Публичные API Polymarket отдают access-control-allow-origin: *, поэтому
// запросы идут на них напрямую и одинаково работают и в dev, и на GitHub Pages.
// base нужен для project-сайта: страница живёт в /poly-dashboard/.
export default defineConfig({
  base: '/poly-dashboard/',
  plugins: [react(), tailwindcss()],
})
