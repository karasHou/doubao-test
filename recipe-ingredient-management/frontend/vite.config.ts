import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 忽略类型检查的 Vite 配置
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // 忽略类型警告
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT' || warning.code === 'CIRCULAR_DEPENDENCY') {
          return
        }
        warn(warning)
      },
    },
    // 禁用类型检查以加快构建
    minify: 'esbuild',
  },
})
