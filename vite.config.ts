import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ai-je-ete-augmente/',
  plugins: [
    vue(),
    VueI18nPlugin({
      compositionOnly: false,
      escapeHtml: false,
      include: [path.resolve(__dirname, './src/assets/translations/**')],
      runtimeOnly: false,
      strictMessage: false
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
