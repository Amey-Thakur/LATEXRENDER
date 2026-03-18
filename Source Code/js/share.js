// share.js
// Handles generating and copying shareable links for the current LaTeX formula.

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
        if (!latex.trim()) return;

        // Encode LaTeX to Base64 to keep URL clean
        const encoded = btoa(unescape(encodeURIComponent(latex)));
        const url = new URL(window.location.href);
        url.searchParams.set('formula', encoded);

        navigator.clipboard.writeText(url.toString()).then(() => {
            alert('Shareable link copied to clipboard!');
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
