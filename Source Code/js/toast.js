// toast.js
// Lightweight, premium notification system.
// Displays temporary messages near the bottom of the screen.

const Toast = (function() {
    let container = null;

    function init() {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    function show(message, iconName = 'check') {
        if (!container) init();

        const toast = document.createElement('div');
        toast.className = 'toast';
        
        // Simple SVG icon for success/info
        const svg = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;

        toast.innerHTML = `${svg}<span>${message}</span>`;
        container.appendChild(toast);

        // Auto-cleanup after animation ends (3s total per CSS)
        setTimeout(() => {
            if (toast.parentElement) {
                container.removeChild(toast);
            }
        }, 3100);
    }

    return {
        init: init,
        show: show
    };
})();
