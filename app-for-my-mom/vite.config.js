import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        "name": "App for my Mom",
        "short_name": "AFMM",
        "theme_color": "#42b983",
        "background_color": "#ffffff",
        "display": "standalone",
        "scope": "/",
        "start_url": "/app-for-my-mom/",
      }
      })
  ],
  base: '/app-for-my-mom/'
})