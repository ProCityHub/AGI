import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isLinux = process.platform === 'linux';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.CUDA_VISIBLE_DEVICES': JSON.stringify(env.CUDA_VISIBLE_DEVICES || '0'),
        'process.env.CUDA_HOME': JSON.stringify(env.CUDA_HOME || '/usr/local/cuda'),
        '__IS_LINUX__': isLinux,
        '__GPU_ENABLED__': true
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@gpu': path.resolve(__dirname, './src/gpu'),
          '@src': path.resolve(__dirname, './src')
        }
      },
      build: {
        target: 'esnext',
        rollupOptions: {
          external: isLinux ? [] : ['@tensorflow/tfjs-node-gpu'],
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules/@tensorflow')) {
                return 'tensorflow';
              }
              if (id.includes('src/gpu')) {
                return 'gpu-acceleration';
              }
              if (id.includes('src/hypercube_connector')) {
                return 'hypercube-core';
              }
              if (id.includes('node_modules/three')) {
                return 'three';
              }
            }
          }
        },
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        }
      },
      optimizeDeps: {
        include: [
          '@tensorflow/tfjs',
          'three',
          'framer-motion',
          'zustand'
        ],
        exclude: isLinux ? [] : ['@tensorflow/tfjs-node-gpu']
      },
      esbuild: {
        target: 'esnext',
        platform: isLinux ? 'node' : 'browser'
      }
    };
});
