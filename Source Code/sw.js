/**
 * File: sw.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 26 2026
 * License: MIT
 * 
 * Description:
 * Core service worker for LATEXRENDER for offline support and asset caching.
 * Implements a "Cache-First" strategy for static assets and mathematical engine components.
 */

const CACHE_NAME = 'latexrender-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './favicon.ico',
    './favicon.svg',
    './css/dist/bundle.css',
    './js/dist/bundle.js',
    './vendor/katex/katex.min.js',
    './vendor/katex/katex.min.css',
    './vendor/katex/fonts/KaTeX_Main-Regular.woff2',
    './vendor/katex/fonts/KaTeX_Main-Bold.woff2',
    './vendor/katex/fonts/KaTeX_Math-Italic.woff2',
    './vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
    './vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
    './vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
    './vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
    './assets/screenshots/social_identity_preview.png',
    './assets/screenshots/application_interface.png',
    './assets/screenshots/attention_mechanism_equation.png',
    './assets/screenshots/math_symbol_palette.png',
    './assets/screenshots/recent_history_tracking.png',
    './assets/screenshots/attention_formula_output.png',
    './assets/screenshots/attention_mechanism_variant.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});
