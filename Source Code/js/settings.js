// settings.js
// Manages the global state for user-defined render settings.
// This allows the user to customize the appearance of the output
// before exporting.

const Settings = (function() {
    // Default configuration prioritizing a clean, scholarly look.
    let state = {
        theme: "dark",                // App theme (dark/light)
        fontFamily: "KaTeX_Main",     // Default serif font
        fontSize: "36px",             // Readable base size
        colorForeground: "#000000",   // True black text
        colorBackground: "#FFFFFF",   // True white paper
        isTransparent: false,         // Background visibility
        padding: "40px",              // Breathing room around the equation
        displayMode: true             // Centered vs inline equation style
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
