import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@router': path.resolve(__dirname, './src/router'),
            '@components': path.resolve(__dirname, './src/components'),
            '@components/layout': path.resolve(
                __dirname,
                './src/components/layout'
            ),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@t': path.resolve(__dirname, './src/types'),
            '@services': path.resolve(__dirname, './src/services'),
        },
    },
});
