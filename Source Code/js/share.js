/**
 * File: js/share.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), Web Clipboard API
 * 
 * Description:
 * URL-based formula sharing module for the LATEXRENDER application.
 * Encodes mathematical expressions into Base64 strings to generate
 * shareable links, while providing the logic to automatically decode
 * and load formulas from URL parameters upon application initialization.
 */

const Share = (function() {
    function init(buttonSelector) {
        const btn = document.querySelector(buttonSelector);
        if (btn) {
            btn.addEventListener('click', () => {
                copyShareLink();
            });
        }
        
        // Check for share data in URL on load
        checkUrlParams();
    }

    function copyShareLink() {
        const latex = Editor.getValue();
        const url = new URL(window.location.href);
        const originalUrl = `${window.location.origin}${window.location.pathname}`;
        
        const logoHtml = '<span class="brand-inline"><span class="latex">L<span class="a">A</span>T<span class="e">E</span>X</span><span class="render">RENDER</span></span>';

        if (!latex.trim()) {
            // If empty, just share the clean website URL
            navigator.clipboard.writeText(originalUrl).then(() => {
                Toast.show(`${logoHtml} link copied!`);
            });
            return;
        }

        // Encode LaTeX to Base64 to keep URL clean
        const encoded = btoa(unescape(encodeURIComponent(latex)));
        url.searchParams.set('formula', encoded);

        navigator.clipboard.writeText(url.toString()).then(() => {
            Toast.show(`Copied ${logoHtml} formula link!`);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const encodedFormula = params.get('formula');
        
        if (encodedFormula) {
            try {
                const decoded = decodeURIComponent(escape(atob(encodedFormula)));
                // Wait for Editor to be ready
                setTimeout(() => {
                    Editor.setValue(decoded);
                }, 100);
            } catch (e) {
                console.error("Failed to decode formula from URL", e);
            }
        }
    }

    return {
        init: init
    };
})();
