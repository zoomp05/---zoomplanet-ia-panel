// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
      swcPlugins: [],
      swcOptions: {
        jsc: {
          parser: {
            syntax: 'ecmascript',
            jsx: true,
            decorators: true
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true
          },
          target: 'es2022'
        }
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
      interval: 500, // Reducido de 1000ms a 500ms para mayor responsividad
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    hmr: {
      port: 3000,
    },
  },
  define: {
    'global': 'window'
  },
  resolve: {
    alias: {
      '@swc/core/jsx-dev-runtime': 'react/jsx-dev-runtime',
      '@src': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@sites': path.resolve(__dirname, './src/sites'),
      '@config': path.resolve(__dirname, './src/config'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/zoom/hooks'),
      '@utils': path.resolve(__dirname, './src/zoom/utils'),
      '@routes': path.resolve(__dirname, './src/routes'),
  '@zoom': path.resolve(__dirname, './src/zoom'),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      }
    }
  }
});
