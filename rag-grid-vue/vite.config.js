import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Inline everything into one self-contained index.html
// so it opens correctly over file:// in any browser
export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  base: './',
})
