/**
 * File: js/history.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), LocalStorage API
 * 
 * Description:
 * Session history manager for the LATEXRENDER application. Handles the
 * persistence of previously rendered LaTeX equations using the browser's
 * LocalStorage API, enabling users to review, re-render, or delete recent
 * formulas within a dedicated sidebar interface.
 */

const History = (function() {
    const STORAGE_KEY = "LATEXRENDER_HISTORY_V2";
    const MAX_HISTORY = 20;
    let history = [];
    let historyBody = null;

    function init(buttonSelector, paneSelector) {
        load();
        
        const btnToggle = document.querySelector(buttonSelector);
        const pane = document.querySelector(paneSelector);
        const btnClear = pane ? pane.querySelector("#btn-history-clear") : null;
        historyBody = document.querySelector(".history-body");

        if (btnToggle && pane) {
            btnToggle.addEventListener('click', () => {
                const isOpening = pane.classList.toggle('hidden');
                btnToggle.classList.toggle('active', !isOpening);
                if (!isOpening) renderHistoryList();
            });
        }

        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (history.length > 0) {
                    Modal.confirm(
                        "Clear History", 
                        "Are you sure you want to permanently delete all your recent renderings? This action cannot be undone.",
                        () => clearAll()
                    );
                }
            });
        }

        renderHistoryList();
    }

    function clearAll() {
        history = [];
        save();
        renderHistoryList();
    }

    function add(latex) {
        if (!latex || !latex.trim()) return;

        // Don't add duplicate of the most recent item
        if (history.length > 0 && history[0].latex === latex) return;

        const entry = {
            id: Date.now(),
            latex: latex.trim(),
            timestamp: new Date().toISOString()
        };

        history.unshift(entry);
        if (history.length > MAX_HISTORY) history.pop();

        save();
        renderHistoryList();
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

    function remove(id) {
        history = history.filter(item => item.id !== id);
        save();
        renderHistoryList();
    }

    function renderHistoryList() {
        if (!historyBody) return;

        if (history.length === 0) {
            historyBody.innerHTML = `
                <div class="empty-state">
                    <p>No recent formulas.</p>
                </div>
            `;
            return;
        }

        historyBody.innerHTML = history.map(item => {
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="item-meta">
                        <span>${dateStr} at ${timeStr}</span>
                    </div>
                    <div class="item-content">${escapeHTML(item.latex)}</div>
                    <button class="btn-delete" data-id="${item.id}" title="Remove from history">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
        }).join("");

        // Attach listeners to items
        historyBody.querySelectorAll(".history-item").forEach(item => {
            item.addEventListener('click', (e) => {
                const id = parseInt(item.dataset.id);
                const entry = history.find(h => h.id === id);
                if (entry) {
                    Editor.setValue(entry.latex);
                }
            });
        });

        // Attach listeners to delete buttons
        historyBody.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger restore
                const id = parseInt(btn.dataset.id);
                remove(id);
            });
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m];
        });
    }

    return {
        init: init,
        add: add
    };
})();
