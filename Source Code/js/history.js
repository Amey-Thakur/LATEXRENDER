// history.js
// Manages a local session history of rendered LaTeX equations.
// Uses LocalStorage to persist between refreshes.

const History = (function() {
    const STORAGE_KEY = "LATEXRENDER_HISTORY";
    const MAX_HISTORY = 10;
    let history = [];

    function init(buttonSelector) {
        load();
        
        const btn = document.querySelector(buttonSelector);
        if (btn) {
            btn.addEventListener('click', () => {
                showHistory();
            });
        }
    }

    function add(latex) {
        // Only store unique, non-empty latex strings
        if (!latex.trim() || history.includes(latex)) return;

        // Keep it lean
        history.unshift(latex);
        if (history.length > MAX_HISTORY) history.pop();

        save();
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    function load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                history = JSON.parse(stored);
            } catch (e) {
                history = [];
            }
        }
    }

    function showHistory() {
        if (history.length === 0) {
            alert("No render history found.");
            return;
        }

        // Just use a prompt/alert for now for minimal clutter
        // or a custom dropdown if the user asks.
        // Let's create a simple HTML list in the UI.
        const output = history.join("\n\n");
        alert("Recent History:\n\n" + output);
    }

    return {
        init: init,
        add: add
    };
})();
