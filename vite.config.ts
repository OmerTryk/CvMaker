import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Raise the warning limit slightly — we know gzip is 147 kB which is fine
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // State & validation
          'vendor-state': ['zustand', 'zod'],

          // UI libraries
          'vendor-ui': [
            'lucide-react',
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
          ],

          // CV templates — heavy, loaded separately
          'templates': [
            './src/templates/ModernTemplate.tsx',
            './src/templates/ClassicTemplate.tsx',
            './src/templates/MinimalTemplate.tsx',
            './src/templates/ExecutiveTemplate.tsx',
            './src/templates/CreativeTemplate.tsx',
            './src/templates/TechnicalTemplate.tsx',
            './src/templates/TimelineTemplate.tsx',
            './src/templates/ElegantTemplate.tsx',
            './src/templates/CompactTemplate.tsx',
            './src/templates/TemplateRenderer.tsx',
          ],

          // PDF import — only loaded when user imports a PDF
          'vendor-pdf': ['pdfjs-dist'],

          // AI panel — only needed when user opens AI drawer
          'ai': [
            './src/features/ai/AIPanel.tsx',
            './src/features/ai/ApiKeySetup.tsx',
            './src/features/ai/SummaryAI.tsx',
            './src/features/ai/ExperienceAI.tsx',
            './src/features/ai/AchievementAI.tsx',
            './src/features/ai/AnalysisAI.tsx',
          ],
        },
      },
    },
  },
})
