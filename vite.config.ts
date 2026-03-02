import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/DolmaParmak/',   // GitHub Pages repo name
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
            manifest: {
                name: 'DolmaParmak — Türkçe Yazma Eğitimi',
                short_name: 'DolmaParmak',
                description: 'Profesyonel Türkçe klavye yazma hızı eğitim uygulaması',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                start_url: '/DolmaParmak/',
                icons: [
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: { '@': '/src' }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    recharts: ['recharts'],
                    router: ['react-router-dom'],
                }
            }
        }
    }
});
