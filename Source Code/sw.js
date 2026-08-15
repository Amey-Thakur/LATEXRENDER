/**
 * File: sw.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 26 2026
 * License: MIT
 *
 * Description:
 * Service worker for LATEXRENDER. Provides full offline use while making sure
 * a returning visitor still receives a new release.
 *
 * Two caches, because the two kinds of file want opposite strategies:
 *
 *   shell   index.html and the bundles. These change on every deploy, so they
 *           are network-first and fall back to the cache when offline. A
 *           cache-first shell can never update itself, which is what the
 *           earlier version of this file did.
 *
 *   assets  KaTeX, its fonts, icons and screenshots. These are effectively
 *           immutable, so they are cache-first, which is what makes the
 *           application start instantly and work with no connection.
 *
 * BUILD_ID is stamped by scripts/build_bundles.py from a hash of the built
 * output, so the cache name changes exactly when the application changes and
 * old caches are discarded on activation. It is not maintained by hand.
 */

const BUILD_ID = '6ab91d1f';

const SHELL_CACHE = `latexrender-shell-${BUILD_ID}`;
const ASSET_CACHE = `latexrender-assets-${BUILD_ID}`;
const CURRENT = [SHELL_CACHE, ASSET_CACHE];

/* Rebuilt on every release. Always fetched from the network when reachable. */
const SHELL = [
    './',
    './index.html',
    './manifest.json',
    './css/dist/bundle.css',
    './js/dist/bundle.js'
];

/* Stable between releases. Served from cache first. */
const ASSETS = [
    './favicon.ico',
    './favicon.svg',
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

const isShell = (url) => {
    const path = url.pathname.replace(/\/+$/, '/');
    return path.endsWith('/') ||
        path.endsWith('/index.html') ||
        path.endsWith('/manifest.json') ||
        path.endsWith('/css/dist/bundle.css') ||
        path.endsWith('/js/dist/bundle.js');
};

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const shell = await caches.open(SHELL_CACHE);
        const assets = await caches.open(ASSET_CACHE);
        // Individually, so one missing file cannot fail the whole install.
        await Promise.all([
            ...SHELL.map((u) => shell.add(u).catch(() => {})),
            ...ASSETS.map((u) => assets.add(u).catch(() => {}))
        ]);
        // Take over straight away rather than waiting for every tab to close.
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys.filter((k) => k.startsWith('latexrender-') && !CURRENT.includes(k))
                .map((k) => caches.delete(k))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Only same-origin GETs. Anything else goes straight to the network, which
    // keeps cross-origin font and analytics requests out of the cache.
    if (request.method !== 'GET') return;

    let url;
    try {
        url = new URL(request.url);
    } catch (e) {
        return;
    }
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate' || isShell(url)) {
        // Network first: a new release wins whenever the network is reachable.
        event.respondWith((async () => {
            try {
                const fresh = await fetch(request);
                const cache = await caches.open(SHELL_CACHE);
                cache.put(request, fresh.clone());
                return fresh;
            } catch (e) {
                const cached = await caches.match(request);
                return cached || caches.match('./index.html');
            }
        })());
        return;
    }

    // Cache first for everything else, populating the cache on a miss.
    event.respondWith((async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        const cache = await caches.open(ASSET_CACHE);
        cache.put(request, fresh.clone());
        return fresh;
    })());
});
