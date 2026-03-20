// toolbar.js
// Provides an intuitive, categorized floating pop-up palette to quickly drop advanced LaTeX math symbols.
// Mimics high-end math editors with smooth tab transitions and cursor-aware insertions.

const Toolbar = (function() {
    const categories = [
        {
            name: "Basic",
            symbols: [
                { char: "+", tex: "+", tip: "Plus" },
                { char: "−", tex: "-", tip: "Minus" },
                { char: "×", tex: "\\times", tip: "Multiply (Cross)" },
                { char: "·", tex: "\\cdot", tip: "Multiply (Dot)" },
                { char: "÷", tex: "\\div", tip: "Divide" },
                { char: "±", tex: "\\pm", tip: "Plus-Minus" },
                { char: "∓", tex: "\\mp", tip: "Minus-Plus" },
                { char: "/", tex: "/", tip: "Fraction Slash" },
                { char: "frac", tex: "\\frac{num}{den}", tip: "Fraction" },
                { char: "√", tex: "\\sqrt{x}", tip: "Square Root" },
                { char: "∛", tex: "\\sqrt[3]{x}", tip: "Cube Root" },
                { char: "xⁿ", tex: "x^{n}", tip: "Superscript (Power)" },
                { char: "xₙ", tex: "x_{n}", tip: "Subscript (Index)" },
                { char: "log", tex: "\\log", tip: "Logarithm" },
                { char: "ln", tex: "\\ln", tip: "Natural Log" }
            ]
        },
        {
            name: "Calculus",
            symbols: [
                { char: "∑", tex: "\\sum_{i=1}^{n}", tip: "Summation" },
                { char: "∏", tex: "\\prod_{i=1}^{n}", tip: "Product" },
                { char: "∐", tex: "\\coprod", tip: "Coproduct" },
                { char: "∫", tex: "\\int_{a}^{b}", tip: "Integral" },
                { char: "∬", tex: "\\iint", tip: "Double Integral" },
                { char: "∭", tex: "\\iiint", tip: "Triple Integral" },
                { char: "∮", tex: "\\oint", tip: "Contour Integral" },
                { char: "∂", tex: "\\partial", tip: "Partial Derivative" },
                { char: "∇", tex: "\\nabla", tip: "Nabla / Gradient" },
                { char: "∞", tex: "\\infty", tip: "Infinity" },
                { char: "lim", tex: "\\lim_{x \\to \\infty}", tip: "Limit" },
                { char: "d/dx", tex: "\\frac{d}{dx}", tip: "Derivative wrt x" },
                { char: "Δ", tex: "\\Delta", tip: "Macroscopic Change" },
                { char: "dx", tex: "\\,dx", tip: "Differential (with space)" },
                { char: "max", tex: "\\max", tip: "Maximum" },
                { char: "min", tex: "\\min", tip: "Minimum" }
            ]
        },
        {
            name: "Logic",
            symbols: [
                { char: "∀", tex: "\\forall", tip: "For All (Universal Quantifier)" },
                { char: "∃", tex: "\\exists", tip: "Exists (Existential Quantifier)" },
                { char: "∄", tex: "\\nexists", tip: "Does Not Exist" },
                { char: "∴", tex: "\\therefore", tip: "Therefore" },
                { char: "∵", tex: "\\because", tip: "Because" },
                { char: "∧", tex: "\\land", tip: "Logical AND" },
                { char: "∨", tex: "\\lor", tip: "Logical OR" },
                { char: "¬", tex: "\\lnot", tip: "Logical NOT" },
                { char: "⊕", tex: "\\oplus", tip: "XOR / Direct Sum" },
                { char: "∈", tex: "\\in", tip: "Element Of" },
                { char: "∉", tex: "\\notin", tip: "Not Element Of" },
                { char: "⊂", tex: "\\subset", tip: "Proper Subset" },
                { char: "⊆", tex: "\\subseteq", tip: "Subset or Equal" },
                { char: "⊃", tex: "\\supset", tip: "Proper Superset" },
                { char: "⊇", tex: "\\supseteq", tip: "Superset or Equal" },
                { char: "∪", tex: "\\cup", tip: "Union" },
                { char: "∩", tex: "\\cap", tip: "Intersection" },
                { char: "∅", tex: "\\emptyset", tip: "Empty Set" },
                { char: "ℝ", tex: "\\mathbb{R}", tip: "Real Numbers" },
                { char: "ℤ", tex: "\\mathbb{Z}", tip: "Integers" },
                { char: "ℕ", tex: "\\mathbb{N}", tip: "Natural Numbers" },
                { char: "ℂ", tex: "\\mathbb{C}", tip: "Complex Numbers" },
                { char: "ℚ", tex: "\\mathbb{Q}", tip: "Rational Numbers" }
            ]
        },
        {
            name: "Relations",
            symbols: [
                { char: "=", tex: "=", tip: "Equals" },
                { char: "≠", tex: "\\neq", tip: "Not Equal" },
                { char: "≈", tex: "\\approx", tip: "Approximately Equal" },
                { char: "∼", tex: "\\sim", tip: "Similar To" },
                { char: "≡", tex: "\\equiv", tip: "Equivalent" },
                { char: "≤", tex: "\\leq", tip: "Less / Equal" },
                { char: "≥", tex: "\\geq", tip: "Greater / Equal" },
                { char: "≪", tex: "\\ll", tip: "Much Less Than" },
                { char: "≫", tex: "\\gg", tip: "Much Greater Than" },
                { char: "∝", tex: "\\propto", tip: "Proportional" },
                { char: "→", tex: "\\rightarrow", tip: "Right Arrow" },
                { char: "←", tex: "\\leftarrow", tip: "Left Arrow" },
                { char: "↔", tex: "\\leftrightarrow", tip: "Left Right Arrow" },
                { char: "⇒", tex: "\\Rightarrow", tip: "Implies (Right Double Arrow)" },
                { char: "⇐", tex: "\\Leftarrow", tip: "Implied By" },
                { char: "⇔", tex: "\\Leftrightarrow", tip: "If and Only If" },
                { char: "↦", tex: "\\mapsto", tip: "Maps To" }
            ]
        },
        {
            name: "Greek",
            symbols: [
                { char: "α", tex: "\\alpha", tip: "Alpha" },
                { char: "β", tex: "\\beta", tip: "Beta" },
                { char: "γ", tex: "\\gamma", tip: "Gamma" },
                { char: "δ", tex: "\\delta", tip: "Delta" },
                { char: "ε", tex: "\\epsilon", tip: "Epsilon" },
                { char: "ζ", tex: "\\zeta", tip: "Zeta" },
                { char: "η", tex: "\\eta", tip: "Eta" },
                { char: "θ", tex: "\\theta", tip: "Theta" },
                { char: "ι", tex: "\\iota", tip: "Iota" },
                { char: "κ", tex: "\\kappa", tip: "Kappa" },
                { char: "λ", tex: "\\lambda", tip: "Lambda" },
                { char: "μ", tex: "\\mu", tip: "Mu" },
                { char: "ν", tex: "\\nu", tip: "Nu" },
                { char: "ξ", tex: "\\xi", tip: "Xi" },
                { char: "π", tex: "\\pi", tip: "Pi" },
                { char: "ρ", tex: "\\rho", tip: "Rho" },
                { char: "σ", tex: "\\sigma", tip: "Sigma" },
                { char: "τ", tex: "\\tau", tip: "Tau" },
                { char: "υ", tex: "\\upsilon", tip: "Upsilon" },
                { char: "φ", tex: "\\phi", tip: "Phi" },
                { char: "χ", tex: "\\chi", tip: "Chi" },
                { char: "ψ", tex: "\\psi", tip: "Psi" },
                { char: "ω", tex: "\\omega", tip: "Omega" },
                { char: "Γ", tex: "\\Gamma", tip: "Capital Gamma" },
                { char: "Δ", tex: "\\Delta", tip: "Capital Delta" },
                { char: "Θ", tex: "\\Theta", tip: "Capital Theta" },
                { char: "Λ", tex: "\\Lambda", tip: "Capital Lambda" },
                { char: "Ξ", tex: "\\Xi", tip: "Capital Xi" },
                { char: "Π", tex: "\\Pi", tip: "Capital Pi" },
                { char: "Σ", tex: "\\Sigma", tip: "Capital Sigma" },
                { char: "Φ", tex: "\\Phi", tip: "Capital Phi" },
                { char: "Ψ", tex: "\\Psi", tip: "Capital Psi" },
                { char: "Ω", tex: "\\Omega", tip: "Capital Omega" }
            ]
        },
        {
            name: "Structures",
            symbols: [
                { char: "(⋅)", tex: "\\left(  \\right)", tip: "Auto-sizing Parentheses" },
                { char: "[⋅]", tex: "\\left[  \\right]", tip: "Auto-sizing Brackets" },
                { char: "{⋅}", tex: "\\left\\{  \\right\\}", tip: "Auto-sizing Braces" },
                { char: "|⋅|", tex: "\\left|  \\right|", tip: "Auto-sizing Abs Value" },
                { char: "‖⋅‖", tex: "\\left\\|  \\right\\|", tip: "Norm" },
                { char: "⟨⋅⟩", tex: "\\left\\langle  \\right\\rangle", tip: "Angle Brackets (Inner Product)" },
                { char: "⌊⋅⌋", tex: "\\lfloor  \\rfloor", tip: "Floor Function" },
                { char: "⌈⋅⌉", tex: "\\lceil  \\rceil", tip: "Ceiling Function" },
                { char: "binom", tex: "\\binom{n}{k}", tip: "Binomial Coefficient" },
                { char: "[■]", tex: "\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}", tip: "Square Matrix" },
                { char: "(■)", tex: "\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}", tip: "Parentheses Matrix" },
                { char: "|■|", tex: "\\begin{vmatrix}\na & b \\\\\nc & d\n\\end{vmatrix}", tip: "Determinant" },
                { char: "{cases}", tex: "\\begin{cases}\nx & \\text{if } x > 0 \\\\\n0 & \\text{otherwise}\n\\end{cases}", tip: "Piecewise Function" },
                { char: "align", tex: "\\begin{aligned}\na &= b + c \\\\\nx &= y - z\n\\end{aligned}", tip: "Aligned Equations" }
            ]
        },
        {
            name: "Formatting",
            symbols: [
                { char: "â", tex: "\\hat{a}", tip: "Hat" },
                { char: "ā", tex: "\\bar{a}", tip: "Bar" },
                { char: "a⃗", tex: "\\vec{a}", tip: "Vector Arrow" },
                { char: "ȧ", tex: "\\dot{a}", tip: "Dot (First Derivative)" },
                { char: "ä", tex: "\\ddot{a}", tip: "Double Dot" },
                { char: "ã", tex: "\\tilde{a}", tip: "Tilde" },
                { char: "text", tex: "\\text{word}", tip: "Plain Text in Math Mode" },
                { char: "bold", tex: "\\mathbf{A}", tip: "Bold Math" },
                { char: "cal", tex: "\\mathcal{L}", tip: "Calligraphic (Script)" },
                { char: "bb", tex: "\\mathbb{R}", tip: "Blackboard Bold" },
                { char: "rm", tex: "\\mathrm{x}", tip: "Roman (Upright)" },
                { char: "color", tex: "\\color{red}{x}", tip: "Colored Text" },
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

        const nav = document.createElement('div');
        nav.className = 'palette-nav';
        
        const contentArea = document.createElement('div');
        contentArea.className = 'palette-content';
        
        const searchGrid = document.createElement('div');
        searchGrid.className = 'palette-grid search-results-grid';
        contentArea.appendChild(searchGrid);
        
        const allGrids = [];
        const allTabs = [];
        const allSymbols = [];
        
        categories.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = 'palette-tab' + (index === 0 ? ' active' : '');
            btn.innerText = cat.name.split(' ')[0]; // short tab names
            btn.setAttribute('data-tooltip', cat.name);
            
            const grid = document.createElement('div');
            grid.className = 'palette-grid' + (index === 0 ? ' active' : '');
            
            cat.symbols.forEach(sym => {
                allSymbols.push(sym);
                const symBtn = document.createElement('button');
                symBtn.className = 'symbol-btn';
                symBtn.innerText = sym.char;
                symBtn.setAttribute('data-tooltip', sym.tip);
                
                symBtn.addEventListener('click', () => {
                    insertText(sym.tex);
                });
                
                grid.appendChild(symBtn);
            });
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Reset search on tab click
                searchInput.value = "";
                searchGrid.classList.remove('active');
                searchGrid.innerHTML = '';
                
                allTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                allGrids.forEach(g => g.classList.remove('active'));
                grid.classList.add('active');
            });
            
            allTabs.push(btn);
            allGrids.push(grid);
            nav.appendChild(btn);
            contentArea.appendChild(grid);
        });
        
        // Search Logic
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query === "") {
                searchGrid.classList.remove('active');
                searchGrid.innerHTML = '';
                nav.style.display = 'flex';
                // Restore active tab
                const activeIndex = allTabs.findIndex(t => t.classList.contains('active'));
                if(activeIndex >= 0) allGrids[activeIndex].classList.add('active');
                return;
            }
            
            // Hide standard UI
            nav.style.display = 'none';
            allGrids.forEach(g => g.classList.remove('active'));
            
            // Populate robust results
            searchGrid.innerHTML = '';
            searchGrid.classList.add('active');
            
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
                const symBtn = document.createElement('button');
                symBtn.className = 'symbol-btn';
                symBtn.innerText = sym.char;
                symBtn.setAttribute('data-tooltip', sym.tip);
                symBtn.addEventListener('click', () => { insertText(sym.tex); });
                searchGrid.appendChild(symBtn);
            });
            
            // Re-trigger tooltip scanning for dynamically populated search buttons
            if (typeof Tooltips !== 'undefined' && Tooltips.init) {
                // Not strictly needed if tooltip logic uses event delegation, 
                // but kept clean just in case.
            }
        });
        
        container.appendChild(searchContainer);
        container.appendChild(nav);
        container.appendChild(contentArea);
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
