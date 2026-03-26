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
