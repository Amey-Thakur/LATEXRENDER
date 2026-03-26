/**
 * File: js/utils.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Collection of shared utility functions for the LATEXRENDER application.
 * Includes performance-optimization tools like debouncing, browser-level
 * file download triggers, and string sanitization routines to ensure
 * cross-platform compatibility and efficient resource management.
 */


// Debounce
// Delays the execution of a function until a specified amount of time
// has passed since the last call. This is useful for preventing
// expensive operations (like rendering) from firing on every keystroke.

function debounce(func, delay) {
    let timer = null;

    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(function () {
            func.apply(this, args);
            timer = null;
        }, delay);
    };
}


// Generate Download
// Creates a temporary anchor element and triggers a file download
// in the browser. The blob is released from memory after the
// download starts.

function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();

    // Small delay before cleanup to make sure the download begins
    setTimeout(function () {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, 100);
}


// Sanitize Filename
// Removes characters that are not safe for filenames across
// different operating systems.

function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*]/g, "_").trim() || "equation";
}
/**
 * File: js/toast.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Toast notification controller for the LATEXRENDER application. Manages
 * the dynamic creation, display, and automated cleanup of lightweight
 * UI alerts, providing immediate visual feedback for user actions such
 * as successful exports and clipboard copies.
 */

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
/**
 * File: js/modal.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Modal dialog controller for the LATEXRENDER application. Manages the
 * display and lifecycle of custom confirmation dialogs, handling user
 * input via mouse and keyboard (Escape key) to facilitate secure state
 * changes within the interface.
 */

const Modal = (function() {
    let overlay = null;
    let titleEl = null;
    let messageEl = null;
    let btnConfirm = null;
    let btnCancel = null;
    let onConfirmCallback = null;

    function init() {
        overlay = document.getElementById("custom-modal");
        titleEl = document.getElementById("modal-title");
        messageEl = document.getElementById("modal-message");
        btnConfirm = document.getElementById("modal-confirm");
        btnCancel = document.getElementById("modal-cancel");

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                if (onConfirmCallback) onConfirmCallback();
                close();
            });
        }

        if (btnCancel) {
            btnCancel.addEventListener('click', close);
        }
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
                close();
            }
        });
    }

    function confirm(title, message, onConfirm) {
        if (!overlay) return;
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        onConfirmCallback = onConfirm;
        
        overlay.classList.remove('hidden');
    }

    function close() {
        if (overlay) overlay.classList.add('hidden');
        onConfirmCallback = null;
    }

    return {
        init: init,
        confirm: confirm
    };
})();
/**
 * File: js/settings.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Configuration state manager for the LATEXRENDER application. This module
 * maintains the global settings for typography, color schemes, and
 * document layout, providing a reactive interface that synchronizes
 * the UI control panel with the live rendering engine.
 */

const Settings = (function() {
    let state = {
        theme: "dark",                // Current UI theme (dark/light)
        fontFamily: "KaTeX_Main",     // Default LaTeX font
        fontSize: "36px",             // Base render scale
        colorForeground: "#000000",   // Equation ink color
        colorBackground: "#FFFFFF",   // Canvas background color
        isTransparent: false,         // Alpha channel toggle
        padding: "40px",              // Layout spacing
        displayMode: true             // Centered vs Inline rendering
    };

    let changeCallbacks = [];

    // Initializes UI listeners to automatically update state
    // when the user interacts with the control panel.
    function init() {
        bindInput("setting-font", "fontFamily");
        bindInput("setting-size", "fontSize", "px");
        bindInput("setting-color-fg", "colorForeground");
        bindInput("setting-color-bg", "colorBackground");
        bindInput("setting-padding", "padding", "px");
        
        // Theme Toggle handling
        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
                updateTheme(nextTheme);
            });
        }

        // Checkboxes need slightly different handling
        const transparentToggle = document.getElementById("setting-transparent");
        if (transparentToggle) {
            transparentToggle.addEventListener('change', (e) => {
                update("isTransparent", e.target.checked);
                
                // Disable BG color picker if transparent is true
                const bgColorPicker = document.getElementById("setting-color-bg");
                if (bgColorPicker) {
                    bgColorPicker.disabled = e.target.checked;
                    bgColorPicker.style.opacity = e.target.checked ? "0.5" : "1";
                }
            });
        }
        
        const displayToggle = document.getElementById("setting-displayMode");
        if (displayToggle) {
            displayToggle.addEventListener('change', (e) => {
                update("displayMode", e.target.checked);
            });
        }
    }

    // Helper to bind standard inputs (text, number, color, select)
    function bindInput(elementId, stateKey, suffix = "") {
        const el = document.getElementById(elementId);
        if (el) {
            el.addEventListener('input', (e) => {
                update(stateKey, e.target.value + suffix);
            });
        }
    }

    // Updates a specific state key and triggers a re-render
    function update(key, value) {
        if (state[key] !== value) {
            state[key] = value;
            notify();
        }
    }

    // Specific handler for theme updates to sync DOM attributes
    function updateTheme(newTheme) {
        state.theme = newTheme;
        document.documentElement.setAttribute("data-theme", newTheme);
        
        // Update icon visibility
        const sun = document.getElementById("theme-icon-sun");
        const moon = document.getElementById("theme-icon-moon");
        
        if (newTheme === 'light') {
            sun.classList.add('hidden');
            moon.classList.remove('hidden');
        } else {
            sun.classList.remove('hidden');
            moon.classList.add('hidden');
        }
        
        notify();
    }

    // Notifies subscribers (like the Renderer) that settings changed
    function notify() {
        changeCallbacks.forEach(callback => callback(state));
    }

    // Subscriber endpoint
    function onChange(callback) {
        if (typeof callback === 'function') {
            changeCallbacks.push(callback);
        }
    }

    // Read access to current state
    function getState() {
        return { ...state };
    }

    return {
        init: init,
        onChange: onChange,
        getState: getState,
        update: update
    };
})();
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
/**
 * File: js/tooltips.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Global tooltip controller for the LATEXRENDER application. Implements
 * a lightweight, event-delegated system that dynamically positions 
 * descriptive labels for any UI element possessing a 'data-tooltip'
 * attribute, ensuring enhanced clarity and accessibility across
 * the interface.
 */

const Tooltips = (function() {
    let tooltipEl = null;

    function init() {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';
        document.body.appendChild(tooltipEl);

        document.addEventListener('mouseenter', e => {
            const trg = e.target.closest('[data-tooltip]');
            if (trg) show(trg);
        }, true);
        
        document.addEventListener('mouseleave', e => {
            const trg = e.target.closest('[data-tooltip]');
            if (trg) hide();
        }, true);
    }

    function show(trg) {
        tooltipEl.innerText = trg.getAttribute('data-tooltip');
        tooltipEl.classList.add('visible');
        
        const r = trg.getBoundingClientRect();
        const tr = tooltipEl.getBoundingClientRect();
        
        let tp = r.top - tr.height - 8;
        let cls = 'pos-top';
        if (tp < 10) { tp = r.bottom + 8; cls = 'pos-bottom'; }
        
        let lf = r.left + (r.width/2) - (tr.width/2);
        lf = Math.max(10, Math.min(lf, window.innerWidth - tr.width - 10));
        
        tooltipEl.style.top = tp + 'px';
        tooltipEl.style.left = lf + 'px';
        tooltipEl.classList.remove('pos-top', 'pos-bottom');
        tooltipEl.classList.add(cls);
    }

    function hide() {
        if (tooltipEl) tooltipEl.classList.remove('visible');
    }

    init();
    return {};
})();
/**
 * File: js/toolbar.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), KaTeX, LocalStorage API
 * 
 * Description:
 * Interactive math symbol palette controller for the LATEXRENDER application.
 * Features categorized symbol libraries, a robust search engine, and
 * intelligent text insertion logic that anticipates cursor placement
 * within complex LaTeX structures like matrices and fractions.
 */

const Toolbar = (function() {
    const categories = [
        {
            name: "Common",
            symbols: [
                { char: "frac", tex: "\\frac{num}{den}", tip: "Fraction" },
                { char: "xⁿ", tex: "x^{n}", tip: "Power/Superscript" },
                { char: "xₙ", tex: "x_{n}", tip: "Index/Subscript" },
                { char: "√", tex: "\\sqrt{x}", tip: "Square Root" },
                { char: "∛", tex: "\\sqrt[3]{x}", tip: "Cube Root" },
                { char: "d/dx", tex: "\\frac{\\mathrm{d}}{\\mathrm{d}x}", tip: "Derivative d/dx" },
                { char: "∂/∂x", tex: "\\frac{\\partial}{\\partial x}", tip: "Partial Derivative" },
                { char: "lim", tex: "\\lim_{x \\to 0}", tip: "Limit" },
                { char: "log", tex: "\\log", tip: "Logarithm" },
                { char: "ln", tex: "\\ln", tip: "Natural Log" },
                { char: "∑", tex: "\\sum_{i=1}^{n}", tip: "Summation ∑" },
                { char: "∏", tex: "\\prod_{i=1}^{n}", tip: "Product ∏" },
                { char: "∫", tex: "\\int_{a}^{b}", tip: "Single integral ∫" },
                { char: "∬", tex: "\\iint", tip: "Double integral ∬" },
                { char: "∭", tex: "\\iiint", tip: "Triple integral ∭" },
                { char: "∮", tex: "\\oint", tip: "Contour integral ∮" }
            ]
        },
        {
            name: "Greek",
            symbols: [
                { char: "α", tex: "\\alpha", tip: "alpha" }, { char: "β", tex: "\\beta", tip: "beta" },
                { char: "γ", tex: "\\gamma", tip: "gamma" }, { char: "δ", tex: "\\delta", tip: "delta" },
                { char: "ε", tex: "\\epsilon", tip: "epsilon" }, { char: "ζ", tex: "\\zeta", tip: "zeta" },
                { char: "η", tex: "\\eta", tip: "eta" }, { char: "θ", tex: "\\theta", tip: "theta" },
                { char: "ι", tex: "\\iota", tip: "iota" }, { char: "κ", tex: "\\kappa", tip: "kappa" },
                { char: "λ", tex: "\\lambda", tip: "lambda" }, { char: "μ", tex: "\\mu", tip: "mu" },
                { char: "ν", tex: "\\nu", tip: "nu" }, { char: "ξ", tex: "\\xi", tip: "xi" },
                { char: "π", tex: "\\pi", tip: "pi" }, { char: "ρ", tex: "\\rho", tip: "rho" },
                { char: "σ", tex: "\\sigma", tip: "sigma" }, { char: "τ", tex: "\\tau", tip: "tau" },
                { char: "υ", tex: "\\upsilon", tip: "upsilon" }, { char: "φ", tex: "\\phi", tip: "phi" },
                { char: "χ", tex: "\\chi", tip: "chi" }, { char: "ψ", tex: "\\psi", tip: "psi" },
                { char: "ω", tex: "\\omega", tip: "omega" }, { char: "Γ", tex: "\\Gamma", tip: "Gamma" },
                { char: "Δ", tex: "\\Delta", tip: "Delta" }, { char: "Θ", tex: "\\Theta", tip: "Theta" },
                { char: "Λ", tex: "\\Lambda", tip: "Lambda" }, { char: "Ξ", tex: "\\Xi", tip: "Xi" },
                { char: "Π", tex: "\\Pi", tip: "Pi" }, { char: "Σ", tex: "\\Sigma", tip: "Sigma" },
                { char: "Φ", tex: "\\Phi", tip: "Phi" }, { char: "Ψ", tex: "\\Psi", tip: "Psi" },
                { char: "Ω", tex: "\\Omega", tip: "Capital Omega" }
            ]
        },
        {
            name: "Relations",
            symbols: [
                { char: "=", tex: "=", tip: "Equal" }, { char: "≠", tex: "\\neq", tip: "Not equal" },
                { char: "≡", tex: "\\equiv", tip: "Equivalent" }, { char: "≈", tex: "\\approx", tip: "Approximately ≈" },
                { char: "∼", tex: "\\sim", tip: "Similar ∼" }, { char: "≃", tex: "\\simeq", tip: "Similar equal ≃" },
                { char: "≅", tex: "\\cong", tip: "Congruent ≅" }, { char: "∝", tex: "\\propto", tip: "Proportional ∝" },
                { char: "<", tex: "<", tip: "Less than" }, { char: ">", tex: ">", tip: "Greater than" },
                { char: "≤", tex: "\\leq", tip: "Less than or equal" }, { char: "≥", tex: "\\geq", tip: "Greater than or equal" },
                { char: "≪", tex: "\\ll", tip: "Much less than" }, { char: "≫", tex: "\\gg", tip: "Much greater than" },
                { char: "∈", tex: "\\in", tip: "Element of ∈" }, { char: "∉", tex: "\\notin", tip: "Not element of ∉" },
                { char: "⊂", tex: "\\subset", tip: "Subset ⊂" }, { char: "⊆", tex: "\\subseteq", tip: "Subset or equal ⊆" },
                { char: "⊃", tex: "\\supset", tip: "Superset ⊃" }, { char: "⊇", tex: "\\supseteq", tip: "Superset or equal ⊇" },
                { char: "⊢", tex: "\\vdash", tip: "Proves ⊢" }, { char: "⊨", tex: "\\models", tip: "Models ⊨" },
                { char: "⊥", tex: "\\perp", tip: "Perpendicular ⊥" }, { char: "∥", tex: "\\parallel", tip: "Parallel ∥" }
            ]
        },
        {
            name: "Operators",
            symbols: [
                { char: "+", tex: "+", tip: "Plus +" }, { char: "−", tex: "-", tip: "Minus −" },
                { char: "±", tex: "\\pm", tip: "Plus minus ±" }, { char: "∓", tex: "\\mp", tip: "Minus plus ∓" },
                { char: "×", tex: "\\times", tip: "Times ×" }, { char: "÷", tex: "\\div", tip: "Division ÷" },
                { char: "⋅", tex: "\\cdot", tip: "Center dot ⋅" }, { char: "∗", tex: "\\ast", tip: "Asterisk ∗" },
                { char: "∘", tex: "\\circ", tip: "Circle ∘" }, { char: "∙", tex: "\\bullet", tip: "Bullet ∙" },
                { char: "∧", tex: "\\wedge", tip: "Wedge/AND ∧" }, { char: "∨", tex: "\\vee", tip: "Vee/OR ∨" },
                { char: "∩", tex: "\\cap", tip: "Intersection ∩" }, { char: "∪", tex: "\\cup", tip: "Union ∪" },
                { char: "⊕", tex: "\\oplus", tip: "Circled plus ⊕" }, { char: "⊖", tex: "\\ominus", tip: "Circled minus ⊖" },
                { char: "⊗", tex: "\\otimes", tip: "Circled times ⊗" }, { char: "⊘", tex: "\\oslash", tip: "Circled slash ⊘" },
                { char: "⊙", tex: "\\odot", tip: "Circled dot ⊙" }, { char: "∖", tex: "\\setminus", tip: "Set minus ∖" },
                { char: "mod", tex: "\\pmod{n}", tip: "Modulo (mod n)" }
            ]
        },
        {
            name: "Symbols",
            symbols: [
                { char: "∞", tex: "\\infty", tip: "Infinity ∞" }, { char: "∇", tex: "\\nabla", tip: "Nabla ∇" },
                { char: "∅", tex: "\\emptyset", tip: "Empty set ∅" }, { char: "∂", tex: "\\partial", tip: "Partial ∂" },
                { char: "∀", tex: "\\forall", tip: "For all ∀" }, { char: "∃", tex: "\\exists", tip: "Exists ∃" },
                { char: "∄", tex: "\\nexists", tip: "Does not exist ∄" }, { char: "¬", tex: "\\neg", tip: "Logical NOT ¬" },
                { char: "ℝ", tex: "\\mathbb{R}", tip: "Real numbers ℝ" }, { char: "ℤ", tex: "\\mathbb{Z}", tip: "Integers ℤ" },
                { char: "ℕ", tex: "\\mathbb{N}", tip: "Natural numbers ℕ" }, { char: "ℚ", tex: "\\mathbb{Q}", tip: "Rational numbers ℚ" },
                { char: "ℂ", tex: "\\mathbb{C}", tip: "Complex numbers ℂ" }, { char: "ℙ", tex: "\\mathbb{P}", tip: "Probability ℙ" },
                { char: "ℓ", tex: "\\ell", tip: "Script ℓ" }, { char: "ℜ", tex: "\\Re", tip: "Real part ℜ" },
                { char: "ℑ", tex: "\\Im", tip: "Imaginary part ℑ" }, { char: "ℏ", tex: "\\hbar", tip: "h-bar ℏ" },
                { char: "∴", tex: "\\therefore", tip: "Therefore ∴" }, { char: "∵", tex: "\\because", tip: "Because ∵" },
                { char: "△", tex: "\\triangle", tip: "Triangle △" }, { char: "□", tex: "\\square", tip: "Square □" },
                { char: "∠", tex: "\\angle", tip: "Angle ∠" }, { char: "°", tex: "\\degree", tip: "Degree °" }
            ]
        },
        {
            name: "Arrows",
            symbols: [
                { char: "→", tex: "\\rightarrow", tip: "Right arrow" }, { char: "←", tex: "\\leftarrow", tip: "Left arrow" },
                { char: "↔", tex: "\\leftrightarrow", tip: "Left-right arrow" }, { char: "⇒", tex: "\\Rightarrow", tip: "Implies" },
                { char: "⇐", tex: "\\Leftarrow", tip: "Implied by" }, { char: "⇔", tex: "\\Leftrightarrow", tip: "If and only if" },
                { char: "↑", tex: "\\uparrow", tip: "Up arrow" }, { char: "↓", tex: "\\downarrow", tip: "Down arrow" },
                { char: "↕", tex: "\\updownarrow", tip: "Up-down arrow" }, { char: "↦", tex: "\\mapsto", tip: "Maps to" },
                { char: "⇌", tex: "\\rightleftharpoons", tip: "Right-left harpoons" }, { char: "⇝", tex: "\\leadsto", tip: "Leads to" }
            ]
        },
        {
            name: "Matrices",
            symbols: [
                { char: "(⋅)", tex: "\\left(  \\right)", tip: "Auto-sizing Parentheses" },
                { char: "[⋅]", tex: "\\left[  \\right]", tip: "Auto-sizing Brackets" },
                { char: "{⋅}", tex: "\\left\\{  \\right\\}", tip: "Auto-sizing Braces" },
                { char: "|⋅|", tex: "\\left|  \\right|", tip: "Auto-sizing Abs Value" },
                { char: "‖⋅‖", tex: "\\left\\|  \\right\\|", tip: "Norm" },
                { char: "⟨⋅⟩", tex: "\\left\\langle  \\right\\rangle", tip: "Angle Brackets ⟨ ⟩" },
                { char: "⌊⋅⌋", tex: "\\lfloor  \\rfloor", tip: "Floor Function" },
                { char: "⌈⋅⌉", tex: "\\lceil  \\rceil", tip: "Ceiling Function" },
                { char: "binom", tex: "\\binom{n}{k}", tip: "Binomial Coefficient" },
                { char: "cases", tex: "\\begin{cases}\nx & \\text{if } x > 0 \\\\\n0 & \\text{otherwise}\n\\end{cases}", tip: "Piecewise Function" },
                { char: "[■]", tex: "\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}", tip: "Square Matrix [ ]" },
                { char: "(■)", tex: "\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}", tip: "Parentheses Matrix ( )" },
                { char: "|■|", tex: "\\begin{vmatrix}\na & b \\\\\nc & d\n\\end{vmatrix}", tip: "Determinant | |" }
            ]
        },
        {
            name: "Fonts & Colors",
            symbols: [
                { char: "Ab", tex: "\\mathrm{Ab}", tip: "Roman (Upright)" },
                { char: "Ab", tex: "\\mathit{Ab}", tip: "Italic" },
                { char: "AB", tex: "\\mathbf{AB}", tip: "Bold Math" },
                { char: "Ab", tex: "\\mathsf{Ab}", tip: "Sans Serif" },
                { char: "Ab", tex: "\\mathtt{Ab}", tip: "Monospace" },
                { char: "AB", tex: "\\mathbb{AB}", tip: "Blackboard Bold" },
                { char: "AB", tex: "\\mathcal{AB}", tip: "Calligraphic (Script)" },
                { char: "AB", tex: "\\mathscr{AB}", tip: "Script font" },
                { char: "Ab", tex: "\\mathfrak{Ab}", tip: "Fraktur / Gothic" },
                { char: "text", tex: "\\text{word}", tip: "Plain Text in Math" },
                { char: "red", tex: "\\color{red}{x}", tip: "Red Text" },
                { char: "blue", tex: "\\color{blue}{x}", tip: "Blue Text" },
                { char: "green", tex: "\\color{green}{x}", tip: "Green Text" },
                { char: "yellow", tex: "\\color{yellow}{x}", tip: "Yellow Text" },
                { char: "purple", tex: "\\color{purple}{x}", tip: "Purple Text" }
            ]
        },
        {
            name: "Shapes",
            symbols: [
                { char: "♣", tex: "\\clubsuit", tip: "Club" },
                { char: "♢", tex: "\\diamondsuit", tip: "Diamond" },
                { char: "♡", tex: "\\heartsuit", tip: "Heart" },
                { char: "♠", tex: "\\spadesuit", tip: "Spade" },
                { char: "✠", tex: "\\maltese", tip: "Maltese Cross" },
                { char: "★", tex: "\\star", tip: "Star" },
                { char: "☆", tex: "\\bigstar", tip: "Big Star" },
                { char: "◁", tex: "\\triangleleft", tip: "Triangle Left" },
                { char: "▷", tex: "\\triangleright", tip: "Triangle Right" },
                { char: "▲", tex: "\\blacktriangle", tip: "Black Triangle" },
                { char: "▼", tex: "\\blacktriangledown", tip: "Black Triangle Down" },
                { char: "□", tex: "\\square", tip: "Square" },
                { char: "■", tex: "\\blacksquare", tip: "Black Square" },
                { char: "△", tex: "\\triangle", tip: "Triangle Outline" },
                { char: "▽", tex: "\\triangledown", tip: "Triangle Down" },
                { char: "◀", tex: "\\blacktriangleleft", tip: "Black Triangle Left" },
                { char: "▶", tex: "\\blacktriangleright", tip: "Black Triangle Right" },
                { char: "◊", tex: "\\lozenge", tip: "Lozenge / Diamond outline" },
                { char: "♦", tex: "\\blacklozenge", tip: "Black Lozenge" },
                { char: "©", tex: "\\copyright", tip: "Copyright" },
                { char: "®", tex: "\\circledR", tip: "Registered trademark" },
                { char: "…", tex: "\\dots", tip: "Ellipsis/Dots" },
                { char: "⋮", tex: "\\vdots", tip: "Vertical Dots" },
                { char: "⋯", tex: "\\cdots", tip: "Horizontal Dots" },
                { char: "⋱", tex: "\\ddots", tip: "Diagonal Dots" }
            ]
        }
    ];

    let isVisible = false;
    let container = null;
    let editor = null;
    let btnToggle = null;

    function init() {
        editor = document.getElementById('latex-editor');
        btnToggle = document.getElementById('btn-toggle-symbols');
        container = document.getElementById('symbol-palette-container');
        
        if (!btnToggle || !container || !editor) return;
        
        btnToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePalette();
            // hide tooltip explicitly if active to prevent clashing UI
            const tooltip = document.querySelector('.tooltip.visible');
            if (tooltip) tooltip.classList.remove('visible');
        });
        
        buildPalette();
        
        // Auto-close on outside click
        document.addEventListener('click', (e) => {
            if (isVisible && !container.contains(e.target) && !btnToggle.contains(e.target)) {
                hidePalette();
            }
        });
    }

    function togglePalette() {
        isVisible = !isVisible;
        if (isVisible) {
            container.classList.remove('hidden');
            btnToggle.classList.add('active'); // Style sync
        } else {
            container.classList.add('hidden');
            btnToggle.classList.remove('active');
        }
    }

    function hidePalette() {
        isVisible = false;
        container.classList.add('hidden');
        if(btnToggle) btnToggle.classList.remove('active');
    }

    let recentSymbols = [];
    try {
        const stored = localStorage.getItem('latexrender_recent_symbols');
        if (stored) recentSymbols = JSON.parse(stored);
    } catch(e) {}

    function saveRecent(sym) {
        recentSymbols = recentSymbols.filter(s => s.tex !== sym.tex);
        recentSymbols.unshift(sym);
        if (recentSymbols.length > 24) recentSymbols.pop();
        try { localStorage.setItem('latexrender_recent_symbols', JSON.stringify(recentSymbols)); } catch(e) {}
        if (window.renderRecentGrid) window.renderRecentGrid();
    }

    function createSymbolBtn(sym) {
        const symBtn = document.createElement('button');
        symBtn.className = 'symbol-btn';
        symBtn.setAttribute('data-tooltip', sym.tip);
        
        if (typeof katex !== 'undefined') {
            try {
                const renderTex = sym.tex.includes('num') || sym.tex.includes('bmatrix') || sym.tex.includes('cases') || sym.tex.includes('aligned') 
                    ? sym.char // fallback nicely for complex structures
                    : sym.tex;
                symBtn.innerHTML = katex.renderToString(renderTex, { throwOnError: false, displayMode: false });
            } catch (e) {
                symBtn.innerText = sym.char;
            }
        } else {
            symBtn.innerText = sym.char;
        }
        
        symBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            insertText(sym.tex);
            saveRecent(sym);
        });
        
        return symBtn;
    }

    function buildPalette() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'palette-search-container';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'palette-search';
        searchInput.placeholder = 'Search limit, alpha, matrix...';
        
        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search search-icon';
        
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);

        const mainArea = document.createElement('div');
        mainArea.className = 'palette-main';
        
        const contentArea = document.createElement('div');
        contentArea.className = 'palette-content';
        
        const bottomNav = document.createElement('div');
        bottomNav.className = 'palette-bottom-nav';
        
        const searchGrid = document.createElement('div');
        searchGrid.className = 'palette-grid search-results-grid';
        contentArea.appendChild(searchGrid);
        
        // Recent Section
        const recentTitle = document.createElement('div');
        recentTitle.className = 'palette-section-title';
        recentTitle.innerText = 'Recent';
        recentTitle.id = 'cat-Recent';
        
        const recentGrid = document.createElement('div');
        recentGrid.className = 'palette-grid';
        
        window.renderRecentGrid = () => {
            recentGrid.innerHTML = '';
            if(recentSymbols.length === 0) {
               recentGrid.style.display = 'none';
               recentTitle.style.display = 'none';
            } else {
               recentGrid.style.display = 'grid';
               recentTitle.style.display = 'block';
               recentSymbols.forEach(sym => {
                   recentGrid.appendChild(createSymbolBtn(sym));
               });
            }
        };

        const standardContainers = [];
        contentArea.appendChild(recentTitle);
        contentArea.appendChild(recentGrid);
        window.renderRecentGrid();

        const allSymbols = [];
        
        // Bottom Nav setup
        const navIcons = [
            { id: 'cat-Recent', tex: "\\clock" }, // Fallback icon
            { id: 'cat-Common', tex: "\\Sigma" },
            { id: 'cat-Greek', tex: "\\alpha" },
            { id: 'cat-Relations', tex: "\\neq" },
            { id: 'cat-Operators', tex: "\\times" },
            { id: 'cat-Symbols', tex: "\\infty" },
            { id: 'cat-Arrows', tex: "\\rightarrow" },
            { id: 'cat-Matrices', tex: "[ \\cdot ]" },
            { id: 'cat-Fonts & Colors', tex: "\\text{Ab}" },
            { id: 'cat-Shapes', tex: "\\star" }
        ];

        navIcons.forEach(nav => {
            const anchor = document.createElement('button');
            anchor.className = 'palette-nav-icon';
            const rawTitle = nav.id.replace('cat-', '');
            anchor.setAttribute('data-tooltip', rawTitle);

            if (nav.id === 'cat-Recent') {
                anchor.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'; 
            } else {
                if (typeof katex !== 'undefined') {
                    try { anchor.innerHTML = katex.renderToString(nav.tex, { throwOnError: false }); } 
                    catch(e) { anchor.innerText = nav.tex; }
                } else {
                    anchor.innerText = nav.tex;
                }
            }
            anchor.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = document.getElementById(nav.id);
                if (target) {
                    // With position:relative, offsetTop perfectly tracks internal scroll heights!
                    contentArea.scrollTo({ top: target.offsetTop - 12, behavior: 'smooth' });
                }
            });
            bottomNav.appendChild(anchor);
        });
        
        categories.forEach(cat => {
            const title = document.createElement('div');
            title.className = 'palette-section-title';
            title.innerText = cat.name;
            title.id = 'cat-' + cat.name;
            
            const grid = document.createElement('div');
            grid.className = 'palette-grid';
            
            cat.symbols.forEach(sym => {
                allSymbols.push(sym);
                grid.appendChild(createSymbolBtn(sym));
            });
            
            standardContainers.push(title, grid);
            contentArea.appendChild(title);
            contentArea.appendChild(grid);
        });
        
        // Search Logic
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query === "") {
                searchGrid.classList.remove('active');
                searchGrid.innerHTML = '';
                window.renderRecentGrid();
                standardContainers.forEach(el => el.style.display = '');
                bottomNav.style.display = 'flex';
                return;
            }
            
            // Hide standard UI
            recentTitle.style.display = 'none';
            recentGrid.style.display = 'none';
            standardContainers.forEach(el => el.style.display = 'none');
            bottomNav.style.display = 'none';
            
            // Populate robust results
            searchGrid.innerHTML = '';
            searchGrid.style.display = 'grid'; // ensure visible
            
            const matched = allSymbols.filter(s => 
                s.tip.toLowerCase().includes(query) || 
                s.tex.toLowerCase().includes(query) || 
                s.char.toLowerCase().includes(query)
            );
            
            if (matched.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.style.gridColumn = "1 / -1";
                emptyMsg.style.textAlign = "center";
                emptyMsg.style.color = "var(--text-secondary)";
                emptyMsg.style.padding = "24px";
                emptyMsg.style.fontFamily = "var(--font-ui)";
                emptyMsg.style.fontSize = "0.85rem";
                emptyMsg.innerText = "No symbols found.";
                searchGrid.appendChild(emptyMsg);
                return;
            }
            
            matched.forEach(sym => {
                searchGrid.appendChild(createSymbolBtn(sym));
            });
        });
        
        mainArea.appendChild(contentArea);
        
        container.appendChild(searchContainer);
        container.appendChild(mainArea);
        container.appendChild(bottomNav);
    }

    function insertText(tex) {
        if (!editor) return;
        
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;
        const before = text.substring(0, start);
        const after  = text.substring(end, text.length);
        
        editor.value = (before + tex + after);
        
        // Trigger generic input event so standard renderer logic runs
        editor.dispatchEvent(new Event('input'));
        
        // Cursor positioning intelligence
        let newPos = start + tex.length;
        
        // Find empty blocks to jump cursor straight into the actionable code
        const braceMatch = tex.match(/\{\s*\}/);
        if (braceMatch) {
            newPos = start + braceMatch.index + 1;
        } else if (tex.includes('left(')) {
            newPos = start + 6; // Move cursor right between ()
        } else if (tex.includes('bmatrix')) {
            newPos = start + tex.indexOf('a');
            editor.setSelectionRange(newPos, newPos + 1);
            editor.focus();
            return;
        }
        
        editor.setSelectionRange(newPos, newPos);
        editor.focus();
    }

    return { init };
})();

// Attach globally
document.addEventListener('DOMContentLoaded', Toolbar.init);
/**
 * File: js/capture.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), Canvas 2D API
 * 
 * Description:
 * High-fidelity rendering pipeline for the LATEXRENDER export system.
 * This module utilizes the HTML5 Canvas 2D API to recursively traverse
 * the live KaTeX DOM tree and paint mathematical expressions onto an
 * offscreen canvas, bypassing cross-origin SVG restrictions for 
 * seamless image generation.
 */

const Capture = (function() {
    let katexCSSCache = null;

    // Fetches and caches the KaTeX stylesheet for SVG-based exports.
    async function fetchKatexCSS() {
        if (katexCSSCache !== null) return katexCSSCache;
        try {
            const response = await fetch("vendor/katex/katex.min.css");
            katexCSSCache = await response.text();
        } catch (e) {
            katexCSSCache = "";
        }
        return katexCSSCache;
    }

    // Renders a DOM node onto a Canvas at the specified scale factor.
    // Returns { canvas, ctx, width, height } where width and height
    // are the original unscaled pixel dimensions.
    async function toCanvas(targetNode, scale, settings) {
        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        ctx.scale(scale, scale);

        // Fill background
        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, width, height);
        }

        // Walk the DOM and draw each visible element directly
        renderNode(ctx, targetNode, rect.left, rect.top);

        return { canvas, ctx, width, height };
    }

    // Recursively traverses the DOM tree and draws each visual element.
    // Text is drawn with ctx.fillText, lines/rules with ctx.fillRect.
    function renderNode(ctx, node, originX, originY) {
        if (node.nodeType === Node.TEXT_NODE) {
            drawTextNode(ctx, node, originX, originY);
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const style = window.getComputedStyle(node);

        // Skip hidden or non-visual elements
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (node.classList.contains('katex-mathml')) return;

        const rect = node.getBoundingClientRect();

        // Draw background color (used by some KaTeX rule elements)
        drawBackground(ctx, style, rect, originX, originY);

        // Draw border-based rules (fraction bars, sqrt lines)
        drawBorders(ctx, style, rect, originX, originY);

        // Recurse into children
        for (const child of node.childNodes) {
            renderNode(ctx, child, originX, originY);
        }
    }

    // Draws a text node at its exact screen position using Canvas 2D text API.
    function drawTextNode(ctx, textNode, originX, originY) {
        const text = textNode.textContent;
        if (!text.trim()) return;

        const parent = textNode.parentElement;
        if (!parent) return;

        const style = window.getComputedStyle(parent);

        // Build the CSS font shorthand for canvas
        const fontStyle = style.fontStyle || 'normal';
        const fontWeight = style.fontWeight || 'normal';
        const fontSize = style.fontSize || '16px';
        const fontFamily = style.fontFamily || 'serif';

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
        ctx.fillStyle = style.color;

        // Use character-by-character positioning for accuracy
        const range = document.createRange();
        range.selectNodeContents(textNode);
        const clientRects = range.getClientRects();

        if (clientRects.length === 0) return;

        // For single-rect text nodes, draw all at once
        if (clientRects.length === 1) {
            const r = clientRects[0];
            ctx.textBaseline = 'top';
            ctx.fillText(text, r.left - originX, r.top - originY);
            return;
        }

        // For multi-rect text (line wraps), draw each segment
        let charIndex = 0;
        for (const r of clientRects) {
            const segmentLength = Math.ceil(text.length / clientRects.length);
            const segment = text.substring(charIndex, charIndex + segmentLength);
            ctx.textBaseline = 'top';
            ctx.fillText(segment, r.left - originX, r.top - originY);
            charIndex += segmentLength;
        }
    }

    // Fills background color if the element has one
    function drawBackground(ctx, style, rect, originX, originY) {
        const bg = style.backgroundColor;
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return;

        ctx.fillStyle = bg;
        ctx.fillRect(
            rect.left - originX,
            rect.top - originY,
            rect.width,
            rect.height
        );
    }

    // Draws borders as filled rectangles (fraction bars, overlines, underlines)
    function drawBorders(ctx, style, rect, originX, originY) {
        const x = rect.left - originX;
        const y = rect.top - originY;
        const w = rect.width;
        const h = rect.height;

        const borders = [
            { width: parseFloat(style.borderTopWidth), color: style.borderTopColor, draw: () => ctx.fillRect(x, y, w, parseFloat(style.borderTopWidth)) },
            { width: parseFloat(style.borderBottomWidth), color: style.borderBottomColor, draw: () => ctx.fillRect(x, y + h - parseFloat(style.borderBottomWidth), w, parseFloat(style.borderBottomWidth)) },
            { width: parseFloat(style.borderLeftWidth), color: style.borderLeftColor, draw: () => ctx.fillRect(x, y, parseFloat(style.borderLeftWidth), h) },
            { width: parseFloat(style.borderRightWidth), color: style.borderRightColor, draw: () => ctx.fillRect(x + w - parseFloat(style.borderRightWidth), y, parseFloat(style.borderRightWidth), h) }
        ];

        for (const border of borders) {
            if (border.width > 0 && border.color && border.color !== 'transparent') {
                ctx.fillStyle = border.color;
                border.draw();
            }
        }
    }

    return {
        toCanvas: toCanvas,
        fetchKatexCSS: fetchKatexCSS
    };
})();
/**
 * File: js/formats/raster.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * High-performance raster export engine for the LATEXRENDER application.
 * Leverages the HTML5 Canvas API to generate high-resolution image
 * assets in standard web formats (PNG, JPG, WEBP, AVIF, GIF) while
 * providing custom binary encoders for uncompressed 32-bit BMP and
 * multi-channel TIFF files.
 */

const RasterExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        const { canvas, ctx } = await Capture.toCanvas(targetNode, 4.0, settings);
        const filename = `${baseFilename}.${format}`;

        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'webp': 'image/webp',
            'avif': 'image/avif',
            'gif': 'image/gif'
        };

        if (mimeTypes[format]) {
            // Native browser canvas export
            canvas.toBlob(function(blob) {
                if (!blob) throw new Error("Canvas export failed. Format may be unsupported by your browser.");
                triggerDownload(blob, filename);
            }, mimeTypes[format], 1.0);

        } else if (format === 'bmp') {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            triggerDownload(encodeBMP(imgData), filename);

        } else if (format === 'tiff') {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            triggerDownload(encodeTIFF(imgData), filename);
        }
    }

    // Encodes ImageData into a 32-bit (BGRA) uncompressed BMP file.
    // Structure: 14-byte File Header + 40-byte Info Header + raw pixels (top-down).
    function encodeBMP(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        const fileHeaderSize = 14;
        const infoHeaderSize = 40;
        const bytesPerPixel = 4;
        const pixelDataSize = width * height * bytesPerPixel;
        const fileSize = fileHeaderSize + infoHeaderSize + pixelDataSize;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);
        const u8 = new Uint8Array(buffer);

        // BMP File Header
        view.setUint16(0, 0x4D42, false);
        view.setUint32(2, fileSize, true);
        view.setUint32(6, 0, true);
        view.setUint32(10, fileHeaderSize + infoHeaderSize, true);

        // DIB Info Header (BITMAPINFOHEADER)
        view.setUint32(14, infoHeaderSize, true);
        view.setUint32(18, width, true);
        view.setInt32(22, -height, true);
        view.setUint16(26, 1, true);
        view.setUint16(28, 32, true);
        view.setUint32(30, 0, true);
        view.setUint32(34, pixelDataSize, true);
        view.setUint32(38, 2835, true);
        view.setUint32(42, 2835, true);
        view.setUint32(46, 0, true);
        view.setUint32(50, 0, true);

        // Pixel Data (RGBA -> BGRA)
        let offset = fileHeaderSize + infoHeaderSize;
        for (let i = 0; i < data.length; i += 4) {
            u8[offset++] = data[i + 2];
            u8[offset++] = data[i + 1];
            u8[offset++] = data[i + 0];
            u8[offset++] = data[i + 3];
        }

        return new Blob([buffer], { type: "image/bmp" });
    }

    // Encodes ImageData into an uncompressed RGBA TIFF file.
    // Uses a single-strip IFD structure for maximum compatibility.
    function encodeTIFF(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        const NUM_ENTRIES = 11;
        const headerSize = 8;
        const ifdSize = 2 + (NUM_ENTRIES * 12) + 4;

        // Extended values that exceed the 4-byte IFD slot
        const bitsPerSampleOffset = headerSize + ifdSize;
        const resolutionOffset = bitsPerSampleOffset + 8;
        const stripOffset = resolutionOffset + 16;
        const stripByteCounts = data.length;

        const buffer = new ArrayBuffer(stripOffset + stripByteCounts);
        const view = new DataView(buffer);

        // TIFF Header (Little Endian)
        view.setUint16(0, 0x4949, false);
        view.setUint16(2, 42, true);
        view.setUint32(4, headerSize, true);

        // IFD Directory
        let offset = headerSize;
        view.setUint16(offset, NUM_ENTRIES, true);
        offset += 2;

        function writeTag(tag, type, count, valueOrOffset) {
            view.setUint16(offset, tag, true);
            view.setUint16(offset + 2, type, true);
            view.setUint32(offset + 4, count, true);
            if (type === 3 && count === 1) {
                view.setUint16(offset + 8, valueOrOffset, true);
                view.setUint16(offset + 10, 0, true);
            } else {
                view.setUint32(offset + 8, valueOrOffset, true);
            }
            offset += 12;
        }

        writeTag(256, 4, 1, width);
        writeTag(257, 4, 1, height);
        writeTag(258, 3, 4, bitsPerSampleOffset);
        writeTag(259, 3, 1, 1);
        writeTag(262, 3, 1, 2);
        writeTag(273, 4, 1, stripOffset);
        writeTag(277, 3, 1, 4);
        writeTag(278, 4, 1, height);
        writeTag(279, 4, 1, stripByteCounts);
        writeTag(282, 5, 1, resolutionOffset);
        writeTag(283, 5, 1, resolutionOffset + 8);

        // Next IFD (end of list)
        view.setUint32(offset, 0, true);

        // BitsPerSample: 8, 8, 8, 8
        view.setUint16(bitsPerSampleOffset, 8, true);
        view.setUint16(bitsPerSampleOffset + 2, 8, true);
        view.setUint16(bitsPerSampleOffset + 4, 8, true);
        view.setUint16(bitsPerSampleOffset + 6, 8, true);

        // Resolution: 300 dpi
        view.setUint32(resolutionOffset, 300, true);
        view.setUint32(resolutionOffset + 4, 1, true);
        view.setUint32(resolutionOffset + 8, 300, true);
        view.setUint32(resolutionOffset + 12, 1, true);

        // Pixel data (direct RGBA copy)
        new Uint8Array(buffer, stripOffset).set(data);

        return new Blob([buffer], { type: "image/tiff" });
    }

    return {
        process: process
    };
})();
/**
 * File: js/formats/document.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), PDF 1.4 Specification
 * 
 * Description:
 * Specialized document export module for the LATEXRENDER application.
 * Implements a lightweight, native PDF 1.4 compiler that encapsulates
 * rendered LaTeX expressions as JPEG assets within structured binary
 * objects, calculating precise cross-reference byte offsets to
 * generate standards-compliant PDF files without external dependencies.
 */

const DocumentExport = (function() {

    // Core pipeline: DOM -> Canvas -> JPEG -> PDF binary
    async function process(targetNode, format, settings, baseFilename) {
        const { canvas } = await Capture.toCanvas(targetNode, 4.0, settings);

        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        // JPEG is simpler to embed than raw RGB in our lightweight PDF engine
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const pdfBlob = buildPDF(jpegDataUrl, width, height, canvas.width, canvas.height);

        triggerDownload(pdfBlob, baseFilename + ".pdf");
    }

    // Constructs a valid PDF 1.4 file with correct xref byte offsets.
    // Uses Uint8Array assembly to prevent encoding corruption of the JPEG stream.
    function buildPDF(jpegDataUrl, origWidth, origHeight, pixelWidth, pixelHeight) {
        const base64Data = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, "");
        const rawImageData = atob(base64Data);

        // PDF coordinates use points (1 pt = 1/72 inch)
        const ptWidth = origWidth * 0.75;
        const ptHeight = origHeight * 0.75;
        const pageWidth = ptWidth + 40;
        const pageHeight = ptHeight + 40;

        // Content stream positions the image with margins
        const stream = `q\n${ptWidth.toFixed(2)} 0 0 ${ptHeight.toFixed(2)} 20 20 cm\n/Im1 Do\nQ`;

        // Build all PDF object strings
        const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
        const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
        const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`;
        const obj4 = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
        const obj5Head = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${rawImageData.length} >>\nstream\n`;
        const obj5Tail = `\nendstream\nendobj\n`;

        // PDF header as raw bytes to preserve binary comment markers
        const header = new Uint8Array([
            0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A,
            0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A
        ]);

        const enc = new TextEncoder();
        const obj1Bytes = enc.encode(obj1);
        const obj2Bytes = enc.encode(obj2);
        const obj3Bytes = enc.encode(obj3);
        const obj4Bytes = enc.encode(obj4);
        const obj5HeadBytes = enc.encode(obj5Head);
        const obj5TailBytes = enc.encode(obj5Tail);

        // JPEG binary stream
        const imgBytes = new Uint8Array(rawImageData.length);
        for (let i = 0; i < rawImageData.length; i++) {
            imgBytes[i] = rawImageData.charCodeAt(i);
        }

        // Calculate exact byte offsets for each object
        let pos = header.length;
        const offsets = [];

        offsets.push(pos); pos += obj1Bytes.length;
        offsets.push(pos); pos += obj2Bytes.length;
        offsets.push(pos); pos += obj3Bytes.length;
        offsets.push(pos); pos += obj4Bytes.length;
        offsets.push(pos); pos += obj5HeadBytes.length + imgBytes.length + obj5TailBytes.length;

        const xrefOffset = pos;

        // Cross-reference table
        let xref = `xref\n0 6\n0000000000 65535 f \n`;
        offsets.forEach(o => {
            xref += `${o.toString().padStart(10, '0')} 00000 n \n`;
        });

        const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

        const xrefBytes = enc.encode(xref);
        const trailerBytes = enc.encode(trailer);

        // Assemble final binary payload
        const parts = [header, obj1Bytes, obj2Bytes, obj3Bytes, obj4Bytes, obj5HeadBytes, imgBytes, obj5TailBytes, xrefBytes, trailerBytes];
        const totalSize = parts.reduce((sum, p) => sum + p.length, 0);
        const finalBuffer = new Uint8Array(totalSize);
        let offset = 0;

        parts.forEach(part => {
            finalBuffer.set(part, offset);
            offset += part.length;
        });

        return new Blob([finalBuffer], { type: "application/pdf" });
    }

    return {
        process: process
    };
})();
/**
 * File: js/formats/vector.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), PostScript Specification
 * 
 * Description:
 * Scalable vector export module for the LATEXRENDER application.
 * Implements SVG serialization with inlined CSS for web-ready equations,
 * while providing a native PostScript Level 2 encoder to generate EPS
 * and PS files with hex-encoded RGB image operators for high-fidelity
 * integration into specialized design software.
 */

const VectorExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        if (format === 'svg') {
            await exportSVG(targetNode, baseFilename);
        } else {
            await exportPostScript(targetNode, format, settings, baseFilename);
        }
    }

    // SVG export with foreignObject HTML embedding
    async function exportSVG(targetNode, baseFilename) {
        const cssContent = await Capture.fetchKatexCSS();
        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        const clone = targetNode.cloneNode(true);
        clone.style.margin = "0";

        const svgString = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
            `<style>${cssContent}</style>`,
            `<foreignObject width="100%" height="100%">`,
            `<div xmlns="http://www.w3.org/1999/xhtml">`,
            clone.outerHTML,
            `</div>`,
            `</foreignObject>`,
            `</svg>`
        ].join("");

        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        triggerDownload(blob, `${baseFilename}.svg`);
    }

    // EPS and PS export with hex-encoded raster image data
    async function exportPostScript(targetNode, format, settings, baseFilename) {
        const { canvas, ctx } = await Capture.toCanvas(targetNode, 4.0, settings);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const psContent = buildPostScript(imageData, canvas.width, canvas.height, format === 'eps');

        const blob = new Blob([psContent], { type: "application/postscript" });
        triggerDownload(blob, `${baseFilename}.${format}`);
    }

    // Builds a valid PostScript document with hex-encoded RGB image data.
    // Uses the standard Level 2 colorimage operator.
    function buildPostScript(imageData, pixelWidth, pixelHeight, isEPS) {
        const data = imageData.data;
        const ptWidth = Math.round(pixelWidth * 0.75);
        const ptHeight = Math.round(pixelHeight * 0.75);

        // Convert RGBA pixel data to hex-encoded RGB
        const hexChunks = [];
        let lineBuffer = "";

        for (let i = 0; i < data.length; i += 4) {
            lineBuffer += toHex(data[i]) + toHex(data[i + 1]) + toHex(data[i + 2]);
            if (lineBuffer.length >= 78) {
                hexChunks.push(lineBuffer);
                lineBuffer = "";
            }
        }
        if (lineBuffer) hexChunks.push(lineBuffer);

        const lines = [];

        if (isEPS) {
            lines.push("%!PS-Adobe-3.0 EPSF-3.0");
            lines.push(`%%BoundingBox: 0 0 ${ptWidth} ${ptHeight}`);
        } else {
            lines.push("%!PS-Adobe-3.0");
        }

        lines.push("%%Creator: LATEXRENDER");
        lines.push("%%EndComments");
        lines.push("");
        lines.push("gsave");
        lines.push(`${ptWidth} ${ptHeight} scale`);
        lines.push(`${pixelWidth} ${pixelHeight} 8`);
        lines.push(`[${pixelWidth} 0 0 -${pixelHeight} 0 ${pixelHeight}]`);
        lines.push("{currentfile exch readhexstring pop}");
        lines.push("false 3 colorimage");
        lines.push(hexChunks.join("\n"));
        lines.push("grestore");

        if (!isEPS) lines.push("showpage");
        lines.push("%%EOF");

        return lines.join("\n");
    }

    function toHex(byte) {
        return byte.toString(16).padStart(2, '0');
    }

    return {
        process: process
    };
})();
/**
 * File: js/formats/icon.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Windows Icon (ICO) export module for the LATEXRENDER application.
 * Renders mathematical expressions into high-resolution 256x256 square
 * canvases and encapsulates the resulting PNG payloads within a 
 * manually constructed ICO directory structure for system-level
 * compatibility.
 */

const IconExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        const size = 256;

        // Render the equation at standard scale first
        const { canvas: srcCanvas } = await Capture.toCanvas(targetNode, 2.0, settings);

        // Create a strict 256x256 square canvas
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, size, size);
        }

        // Center the equation inside the icon frame
        const scale = Math.min((size - 40) / srcCanvas.width, (size - 40) / srcCanvas.height);
        const w = srcCanvas.width * scale;
        const h = srcCanvas.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;

        ctx.drawImage(srcCanvas, x, y, w, h);

        // Extract PNG and wrap in ICO container
        canvas.toBlob(blob => {
            blob.arrayBuffer().then(pngBuffer => {
                const icoBlob = encodeICO(pngBuffer, size);
                triggerDownload(icoBlob, `${baseFilename}.ico`);
            });
        }, "image/png");
    }

    // Wraps a PNG payload inside a Windows Icon directory structure.
    function encodeICO(pngBuffer, size) {
        const headerSize = 6;
        const directorySize = 16;
        const fileSize = headerSize + directorySize + pngBuffer.byteLength;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        // ICO Header
        view.setUint16(0, 0, true);
        view.setUint16(2, 1, true);
        view.setUint16(4, 1, true);

        // Directory Entry
        view.setUint8(6, size === 256 ? 0 : size);
        view.setUint8(7, size === 256 ? 0 : size);
        view.setUint8(8, 0);
        view.setUint8(9, 0);
        view.setUint16(10, 1, true);
        view.setUint16(12, 32, true);
        view.setUint32(14, pngBuffer.byteLength, true);
        view.setUint32(18, headerSize + directorySize, true);

        // PNG payload
        new Uint8Array(buffer, headerSize + directorySize).set(new Uint8Array(pngBuffer));

        return new Blob([buffer], { type: "image/x-icon" });
    }

    return {
        process: process
    };
})();
/**
 * File: js/formats/metafile.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), Windows GDI Specification
 * 
 * Description:
 * Windows Metafile (EMF and WMF) export module for the LATEXRENDER 
 * application. Implements a native binary encoder that translates 
 * rendered LaTeX bitmaps into GDI-compliant metafile records, 
 * incorporating high-resolution DIB (Device Independent Bitmap) 
 * payloads and precise memory structures for lossless integration 
 * into desktop publishing environments.
 */

const MetafileExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        const { canvas, ctx } = await Capture.toCanvas(targetNode, 4.0, settings);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (format === 'emf') {
            const blob = encodeEMF(imageData, canvas.width, canvas.height);
            triggerDownload(blob, `${baseFilename}.emf`);
        } else {
            const blob = encodeWMF(imageData, canvas.width, canvas.height);
            triggerDownload(blob, `${baseFilename}.wmf`);
        }
    }

    // Builds a valid EMF file: EMR_HEADER + EMR_STRETCHDIBITS + EMR_EOF.
    // Embeds pixel data as a 24-bit BGR Device Independent Bitmap.
    function encodeEMF(imageData, width, height) {
        const pixels = imageData.data;

        // DIB layout: 24-bit BGR with row padding to 4-byte boundaries
        const rowSize = width * 3;
        const rowPadding = (4 - (rowSize % 4)) % 4;
        const paddedRowSize = rowSize + rowPadding;
        const dibDataSize = paddedRowSize * height;
        const dibHeaderSize = 40;

        // EMF record sizes
        const emrHeaderSize = 108;
        const stretchFixedSize = 80;
        const stretchRecordSize = stretchFixedSize + dibHeaderSize + dibDataSize;
        const eofSize = 20;
        const totalSize = emrHeaderSize + stretchRecordSize + eofSize;

        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        let offset = 0;

        // EMR_HEADER (Type = 1)
        view.setUint32(offset, 1, true); offset += 4;
        view.setUint32(offset, emrHeaderSize, true); offset += 4;
        // rclBounds (device units)
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, width - 1, true); offset += 4;
        view.setInt32(offset, height - 1, true); offset += 4;
        // rclFrame (0.01mm units)
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, Math.round(width * 26.46), true); offset += 4;
        view.setInt32(offset, Math.round(height * 26.46), true); offset += 4;
        // Signature
        view.setUint32(offset, 0x464D4520, true); offset += 4;
        // Version 1.0
        view.setUint32(offset, 0x00010000, true); offset += 4;
        // Total file size
        view.setUint32(offset, totalSize, true); offset += 4;
        // Number of records
        view.setUint32(offset, 3, true); offset += 4;
        // Number of handles
        view.setUint16(offset, 1, true); offset += 2;
        // Reserved
        view.setUint16(offset, 0, true); offset += 2;
        // nDescription, offDescription, nPalEntries
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        // szlDevice (reference device pixels)
        view.setUint32(offset, 1920, true); offset += 4;
        view.setUint32(offset, 1080, true); offset += 4;
        // szlMillimeters (reference device mm)
        view.setUint32(offset, 508, true); offset += 4;
        view.setUint32(offset, 286, true); offset += 4;
        // Pad remaining header bytes to 108
        while (offset < emrHeaderSize) {
            view.setUint8(offset, 0); offset++;
        }

        // EMR_STRETCHDIBITS (Type = 81)
        view.setUint32(offset, 81, true); offset += 4;
        view.setUint32(offset, stretchRecordSize, true); offset += 4;
        // rclBounds
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, width - 1, true); offset += 4;
        view.setInt32(offset, height - 1, true); offset += 4;
        // xDest, yDest
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        // xSrc, ySrc
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        // cxSrc, cySrc
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;
        // offBmiSrc (BITMAPINFO offset from record start)
        view.setUint32(offset, stretchFixedSize, true); offset += 4;
        // cbBmiSrc
        view.setUint32(offset, dibHeaderSize, true); offset += 4;
        // offBitsSrc (pixel data offset from record start)
        view.setUint32(offset, stretchFixedSize + dibHeaderSize, true); offset += 4;
        // cbBitsSrc
        view.setUint32(offset, dibDataSize, true); offset += 4;
        // iUsageSrc (DIB_RGB_COLORS)
        view.setUint32(offset, 0, true); offset += 4;
        // dwRop (SRCCOPY)
        view.setUint32(offset, 0x00CC0020, true); offset += 4;
        // cxDest, cyDest
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;

        // BITMAPINFOHEADER (40 bytes)
        view.setUint32(offset, dibHeaderSize, true); offset += 4;
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 24, true); offset += 2;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, dibDataSize, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;

        // Pixel data (RGBA -> BGR, bottom-up row order)
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * 4;
                view.setUint8(offset++, pixels[srcIdx + 2]);
                view.setUint8(offset++, pixels[srcIdx + 1]);
                view.setUint8(offset++, pixels[srcIdx]);
            }
            for (let p = 0; p < rowPadding; p++) {
                view.setUint8(offset++, 0);
            }
        }

        // EMR_EOF (Type = 14)
        view.setUint32(offset, 14, true); offset += 4;
        view.setUint32(offset, eofSize, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, eofSize, true); offset += 4;

        return new Blob([buffer], { type: "image/emf" });
    }

    // Builds a Placeable WMF file with META_STRETCHDIB record.
    // Uses the Aldus header for coordinate mapping.
    function encodeWMF(imageData, width, height) {
        const pixels = imageData.data;

        // DIB layout: 24-bit BGR with row padding
        const rowSize = width * 3;
        const rowPadding = (4 - (rowSize % 4)) % 4;
        const paddedRowSize = rowSize + rowPadding;
        const dibDataSize = paddedRowSize * height;
        const dibHeaderSize = 40;
        const dibTotalSize = dibHeaderSize + dibDataSize;

        // Placeable WMF header: 22 bytes
        const placeableSize = 22;
        // WMF header: 18 bytes
        const wmfHeaderSize = 18;
        // META_STRETCHDIB fixed fields: 28 bytes + DIB
        const stretchFixedSize = 28;
        const stretchRecordSize = stretchFixedSize + dibTotalSize;
        // Ensure record size is even (WMF uses WORD-sized records)
        const stretchRecordSizeWords = Math.ceil(stretchRecordSize / 2);
        const stretchRecordSizeBytes = stretchRecordSizeWords * 2;
        // EOF record: 6 bytes (3 words)
        const eofSize = 6;

        const wmfDataSize = wmfHeaderSize + stretchRecordSizeBytes + eofSize;
        const totalSize = placeableSize + wmfDataSize;

        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        let offset = 0;

        // Placeable WMF Header (Aldus)
        view.setUint32(offset, 0x9AC6CDD7, true); offset += 4;
        view.setUint16(offset, 0, true); offset += 2;
        // BBox
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, width, true); offset += 2;
        view.setInt16(offset, height, true); offset += 2;
        // Units per inch
        view.setUint16(offset, 96, true); offset += 2;
        // Reserved
        view.setUint32(offset, 0, true); offset += 4;

        // Checksum (XOR of first 10 words)
        const checkView = new DataView(buffer, 0, 20);
        let checksum = 0;
        for (let i = 0; i < 10; i++) {
            checksum ^= checkView.getUint16(i * 2, true);
        }
        view.setUint16(offset, checksum, true); offset += 2;

        // WMF Header
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 9, true); offset += 2;
        view.setUint16(offset, 0x0300, true); offset += 2;
        // File size in words
        view.setUint32(offset, wmfDataSize / 2, true); offset += 4;
        // Number of objects
        view.setUint16(offset, 0, true); offset += 2;
        // Max record size in words
        view.setUint32(offset, stretchRecordSizeWords, true); offset += 4;
        // Number of members
        view.setUint16(offset, 0, true); offset += 2;

        // META_STRETCHDIB (Function = 0x0F43)
        view.setUint32(offset, stretchRecordSizeWords, true); offset += 4;
        view.setUint16(offset, 0x0F43, true); offset += 2;
        // dwRop (SRCCOPY)
        view.setUint32(offset, 0x00CC0020, true); offset += 4;
        // ColorUsage (DIB_RGB_COLORS)
        view.setUint16(offset, 0, true); offset += 2;
        // SrcHeight, SrcWidth
        view.setInt16(offset, height, true); offset += 2;
        view.setInt16(offset, width, true); offset += 2;
        // YSrc, XSrc
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, 0, true); offset += 2;
        // DestHeight, DestWidth
        view.setInt16(offset, height, true); offset += 2;
        view.setInt16(offset, width, true); offset += 2;
        // YDest, XDest
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, 0, true); offset += 2;

        // BITMAPINFOHEADER
        view.setUint32(offset, dibHeaderSize, true); offset += 4;
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 24, true); offset += 2;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, dibDataSize, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;

        // Pixel data (RGBA -> BGR, bottom-up)
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * 4;
                view.setUint8(offset++, pixels[srcIdx + 2]);
                view.setUint8(offset++, pixels[srcIdx + 1]);
                view.setUint8(offset++, pixels[srcIdx]);
            }
            for (let p = 0; p < rowPadding; p++) {
                view.setUint8(offset++, 0);
            }
        }

        // Pad record to even size if needed
        while (offset < placeableSize + wmfHeaderSize + stretchRecordSizeBytes) {
            view.setUint8(offset++, 0);
        }

        // META_EOF (Function = 0x0000)
        view.setUint32(offset, 3, true); offset += 4;
        view.setUint16(offset, 0x0000, true); offset += 2;

        return new Blob([buffer], { type: "image/wmf" });
    }

    return {
        process: process
    };
})();
/**
 * File: js/exporter.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Central export dispatcher for the LATEXRENDER application. This module
 * orchestrates the conversion of rendered LaTeX expressions into various
 * file formats by routing tasks to specialized raster, vector, and document
 * export sub-modules based on user selection.
 */

const Exporter = (function() {
    
    // Attaches the click listener to the export button.
    function init(buttonSelector, formatSelector, targetSelector) {
        const btn = document.querySelector(buttonSelector);
        const formatDropdown = document.querySelector(formatSelector);
        const targetNode = document.querySelector(targetSelector);

        if (!btn || !formatDropdown || !targetNode) {
            console.error("Exporter init failed: selectors missing");
            return;
        }

        btn.addEventListener("click", () => {
            const format = formatDropdown.value;
            const settings = Settings.getState();
            
            // Briefly disable the button and show loading state
            const originalText = btn.innerText;
            btn.innerText = "Processing...";
            btn.disabled = true;

            // Route execution based on format classification
            setTimeout(() => {
                executeExport(targetNode, format, settings)
                    .then(() => {
                        Toast.show(`Exported as ${format.toUpperCase()} successfully.`);
                    })
                    .catch(err => {
                        console.error("Export Engine Exception:", err);
                        Toast.show("Export failed: " + err.message);
                    })
                    .finally(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                    });
            }, 50);
        });
    }

    // Core routing logic
    async function executeExport(node, format, settings) {
        const rasterFormats = ['png', 'jpg', 'webp', 'avif', 'gif', 'bmp', 'tiff'];
        const vectorFormats = ['svg', 'eps', 'ps'];
        const documentFormats = ['pdf', 'ico', 'emf', 'wmf'];

        const filename = sanitizeFilename(Editor.getValue().substring(0, 20) || "equation");

        if (rasterFormats.includes(format)) {
            if (typeof RasterExport !== 'undefined') {
                await RasterExport.process(node, format, settings, filename);
            } else throw new Error("Raster export module missing.");
        } else if (vectorFormats.includes(format)) {
            if (typeof VectorExport !== 'undefined') {
                await VectorExport.process(node, format, settings, filename);
            } else throw new Error("Vector export module missing.");
        } else if (documentFormats.includes(format)) {
            if (format === 'pdf' && typeof DocumentExport !== 'undefined') {
                await DocumentExport.process(node, format, settings, filename);
            } else if (format === 'ico' && typeof IconExport !== 'undefined') {
                await IconExport.process(node, format, settings, filename);
            } else if (['emf', 'wmf'].includes(format) && typeof MetafileExport !== 'undefined') {
                await MetafileExport.process(node, format, settings, filename);
            } else throw new Error(`Document export module missing for ${format}.`);
        } else {
            throw new Error(`Unsupported export format: ${format}`);
        }
    }

    return {
        init: init
    };
})();
/**
 * File: js/editor.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * LaTeX source editor controller for the LATEXRENDER application.
 * Manages the text input interface, implements debounced change
 * detection for optimized rendering performance, and provides
 * an observable interface for state synchronization across
 * the workspace.
 */

const Editor = (function() {
    let inputArea = null;
    let changeCallbacks = [];

    // Initializes the editor module by binding to the DOM element
    // and setting up the input event listener.
    function init(selector) {
        inputArea = document.querySelector(selector);
        
        if (!inputArea) {
            console.error("Editor init failed: element not found", selector);
            return;
        }

        // We use the debounce utility from utils.js to wait 150ms
        // after the user stops typing before triggering a render.
        // This keeps the UI responsive even with complex equations.
        inputArea.addEventListener('input', debounce(handleInput, 150));
        
        // Trigger an initial render for the placeholder text
        handleInput();
    }

    // Called when the user types in the editor.
    // Notifies all registered callbacks with the new content.
    function handleInput() {
        const content = inputArea.value;
        changeCallbacks.forEach(callback => callback(content));
    }

    // Allows other modules (like the renderer) to subscribe to
    // text changes from the editor.
    function onChange(callback) {
        if (typeof callback === 'function') {
            changeCallbacks.push(callback);
        }
    }

    // Returns the current raw string in the editor.
    function getValue() {
        return inputArea ? inputArea.value : "";
    }

    // Programmatically updates the editor content and triggers 
    // a re-render by calling handleInput.
    function setValue(content) {
        if (inputArea) {
            inputArea.value = content;
            handleInput();
        }
    }

    // Expose public API
    return {
        init: init,
        onChange: onChange,
        getValue: getValue,
        setValue: setValue
    };
})();
/**
 * File: js/renderer.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), KaTeX
 * 
 * Description:
 * Core rendering engine integration for the LATEXRENDER application.
 * This module interface with the vendored KaTeX library to transform
 * raw LaTeX strings into structured HTML, applying real-time stylistic
 * configurations and handling synchronous error reporting for invalid
 * mathematical syntax.
 */

const Renderer = (function() {
    let outputContainer = null;
    let errorContainer = null;

    // Initializes the renderer by binding output containers.
    function init(outputSelector, errorSelector) {
        outputContainer = document.querySelector(outputSelector);
        errorContainer = document.querySelector(errorSelector);

        if (!outputContainer) {
            console.error("Renderer init failed: output element not found", outputSelector);
        }
    }

    // Synchronously renders the LaTeX string using KaTeX.
    // Updates the DOM on success, or displays an error message on failure.
    // Respects the current configuration from Settings module.
    function render(latexString) {
        if (!outputContainer) return;
        
        // Fetch current active settings
        const settings = Settings.getState();
        
        // Clear previous state
        errorContainer.textContent = "";
        errorContainer.style.display = "none";
        
        if (latexString.trim() === "") {
            outputContainer.innerHTML = "";
            return;
        }

        try {
            // KaTeX render string directly to HTML string
            const html = katex.renderToString(latexString, {
                displayMode: settings.displayMode,
                throwOnError: true,
                strict: false
            });
            
            // Apply structural HTML
            outputContainer.innerHTML = html;
            
            // Apply stylistic settings directly to the container logic
            outputContainer.style.fontFamily = settings.fontFamily;
            outputContainer.style.fontSize = settings.fontSize;
            outputContainer.style.color = settings.colorForeground;
            outputContainer.style.padding = settings.padding;

            // Handle background transparency vs solid color
            if (settings.isTransparent) {
                outputContainer.style.backgroundColor = "transparent";
                outputContainer.style.backgroundImage = "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)";
                outputContainer.style.backgroundSize = "20px 20px";
                outputContainer.style.backgroundPosition = "0 0, 0 10px, 10px -10px, -10px 0px";
                outputContainer.style.boxShadow = "none";
            } else {
                outputContainer.style.backgroundColor = settings.colorBackground;
                outputContainer.style.backgroundImage = "none";
                outputContainer.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.2)";
            }

        } catch (error) {
            // If KaTeX encounters a syntax error, it throws an exception.
            // We catch it, hide the broken output, and show the error string.
            outputContainer.innerHTML = "";
            errorContainer.textContent = error.message.replace("KaTeX parse error: ", "");
            errorContainer.style.display = "block";
        }
    }

    // Expose public API
    return {
        init: init,
        render: render
    };
})();
/**
 * File: js/app.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Application bootstrap and orchestration script for LATEXRENDER.
 * Initializes core modules including the editor, renderer, history,
 * and settings, while establishing the event-driven communication
 * between the UI components and the rendering engine.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize core modules with DOM selectors
    Modal.init();
    Toast.init();
    Settings.init();
    Editor.init("#latex-editor");
    Renderer.init("#preview-container", "#error-message");
    Exporter.init("#btn-export", "#export-format", "#preview-container");
    Share.init("#btn-share");
    History.init("#btn-history", ".pane-history");

    // Settings Panel Toggle
    const settingsToggle = document.getElementById("btn-settings-toggle");
    const settingsPane = document.querySelector(".pane-controls");
    if (settingsToggle && settingsPane) {
        settingsToggle.addEventListener('click', () => {
            const isHidden = settingsPane.classList.toggle('hidden');
            settingsToggle.classList.toggle('active', !isHidden);
        });
    }

    // 2. Connect the editor's change event direct to the renderer
    let historyTimeout;
    Editor.onChange(function(newLatexString) {
        Renderer.render(newLatexString);
        
        // Add to history if the user stops typing for 2 seconds
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
            History.add(newLatexString);
        }, 2000);
    });

    // 3. Connect the settings changes to trigger a re-render
    //    with the existing editor value.
    Settings.onChange(function(newState) {
        Renderer.render(Editor.getValue());
    });

    console.log("LATEXRENDER Initialized: Editor & Renderer linked.");
});
