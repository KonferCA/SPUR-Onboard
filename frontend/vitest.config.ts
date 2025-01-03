import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules',
                'src/test/setup.ts',
                'vite.config.ts',
                'eslint.config.js',
                'vitest.config.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@components': path.resolve(__dirname, './src/components'),
            '@components/layout': path.resolve(
                __dirname,
                './src/components/layout'
            ),
            '@templates': path.resolve(__dirname, './src/templates'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@services': path.resolve(__dirname, './src/services'),
        },
    },
});
