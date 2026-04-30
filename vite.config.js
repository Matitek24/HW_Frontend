import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from "rollup-plugin-visualizer"; // <--- DODAJ TO

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true, // Automatycznie otworzy raport w przeglądarce po zakończeniu buildu
      filename: "stats.html", // Nazwa pliku z raportem
      gzipSize: true, // Pokaże ile pliki ważą po kompresji (to nas najbardziej interesuje)
      brotliSize: true,
    }),
  ],
  
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },

  optimizeDeps: {
    include: ['html2canvas']
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})