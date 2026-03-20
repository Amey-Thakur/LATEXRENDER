// toolbar.js
// Provides an intuitive, categorized floating pop-up palette to quickly drop advanced LaTeX math symbols.
// Mimics high-end math editors with smooth tab transitions and cursor-aware insertions.

const Toolbar = (function() {
    // Advanced math categories loaded natively for fast rendering.
    const categories = [
        {
            name: "Calculus",
            symbols: [
                { char: "∑", tex: "\\sum_{i=1}^{n}", tip: "Summation" },
                { char: "∏", tex: "\\prod_{i=1}^{n}", tip: "Product" },
                { char: "∫", tex: "\\int_{a}^{b}", tip: "Integral" },
                { char: "∬", tex: "\\iint", tip: "Double Integral" },
                { char: "∮", tex: "\\oint", tip: "Contour Integral" },
                { char: "∂", tex: "\\frac{\\partial}{\\partial x}", tip: "Partial Derivative" },
                { char: "∇", tex: "\\nabla", tip: "Del / Gradient" },
                { char: "√", tex: "\\sqrt{x}", tip: "Square Root" },
                { char: "xⁿ", tex: "x^{n}", tip: "Superscript" },
                { char: "xₙ", tex: "x_{n}", tip: "Subscript" },
                { char: "∞", tex: "\\infty", tip: "Infinity" },
                { char: "lim", tex: "\\lim_{x \\to \\infty}", tip: "Limit" },
                { char: "d/dx", tex: "\\frac{d}{dx}", tip: "Derivative" },
                { char: "±", tex: "\\pm", tip: "Plus-Minus" },
                { char: "·", tex: "\\cdot", tip: "Dot Product" }
            ]
        },
        {
            name: "Matrices",
            symbols: [
                { char: "(⋅)", tex: "\\left(  \\right)", tip: "Auto-sizing Parentheses" },
                { char: "[⋅]", tex: "\\left[  \\right]", tip: "Auto-sizing Brackets" },
                { char: "{⋅}", tex: "\\left\\{  \\right\\}", tip: "Auto-sizing Braces" },
                { char: "|⋅|", tex: "\\left|  \\right|", tip: "Auto-sizing Abs Value" },
                { char: "frac", tex: "\\frac{num}{den}", tip: "Fraction" },
                { char: "binom", tex: "\\binom{n}{k}", tip: "Binomial Coefficient" },
                { char: "[■]", tex: "\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}", tip: "2x2 Matrix" },
                { char: "v⃗", tex: "\\vec{v}", tip: "Vector Notation" },
                { char: "{cases}", tex: "\\begin{cases}\nx & \\text{if } x > 0 \\\\\n0 & \\text{otherwise}\n\\end{cases}", tip: "Piecewise Function" },
                { char: "⋮", tex: "\\vdots", tip: "Vertical Dots" },
                { char: "⋯", tex: "\\cdots", tip: "Horizontal Dots" },
                { char: "⋱", tex: "\\ddots", tip: "Diagonal Dots" },
                { char: "T", tex: "^{T}", tip: "Transpose" },
                { char: "hat", tex: "\\hat{x}", tip: "Unit Vector (Hat)" }
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
                { char: "κ", tex: "\\kappa", tip: "Kappa" },
                { char: "λ", tex: "\\lambda", tip: "Lambda" },
                { char: "μ", tex: "\\mu", tip: "Mu" },
                { char: "π", tex: "\\pi", tip: "Pi" },
                { char: "ρ", tex: "\\rho", tip: "Rho" },
                { char: "σ", tex: "\\sigma", tip: "Sigma" },
                { char: "τ", tex: "\\tau", tip: "Tau" },
                { char: "φ", tex: "\\phi", tip: "Phi" },
                { char: "ω", tex: "\\omega", tip: "Omega" },
                { char: "Δ", tex: "\\Delta", tip: "Capital Delta" },
                { char: "Ω", tex: "\\Omega", tip: "Capital Omega" },
                { char: "Φ", tex: "\\Phi", tip: "Capital Phi" }
            ]
        },
        {
            name: "Relations",
            symbols: [
                { char: "≠", tex: "\\neq", tip: "Not Equal" },
                { char: "≈", tex: "\\approx", tip: "Approximately" },
                { char: "≤", tex: "\\leq", tip: "Less / Equal" },
                { char: "≥", tex: "\\geq", tip: "Greater / Equal" },
                { char: "≡", tex: "\\equiv", tip: "Equivalent" },
                { char: "∝", tex: "\\propto", tip: "Proportional" },
                { char: "∈", tex: "\\in", tip: "Element Of" },
                { char: "∉", tex: "\\notin", tip: "Not Element" },
                { char: "⊂", tex: "\\subset", tip: "Subset" },
                { char: "⊆", tex: "\\subseteq", tip: "Subset Equal" },
                { char: "∪", tex: "\\cup", tip: "Union" },
                { char: "∩", tex: "\\cap", tip: "Intersection" },
                { char: "∅", tex: "\\emptyset", tip: "Empty Set" },
                { char: "∀", tex: "\\forall", tip: "For All" },
                { char: "∃", tex: "\\exists", tip: "Exists" },
                { char: "ℝ", tex: "\\mathbb{R}", tip: "Real Numbers" },
                { char: "ℤ", tex: "\\mathbb{Z}", tip: "Integers" },
                { char: "ℕ", tex: "\\mathbb{N}", tip: "Natural Numbers" },
                { char: "ℂ", tex: "\\mathbb{C}", tip: "Complex Numbers" },
                { char: "∴", tex: "\\therefore", tip: "Therefore" }
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
        const nav = document.createElement('div');
        nav.className = 'palette-nav';
        
        const contentArea = document.createElement('div');
        contentArea.className = 'palette-content';
        
        categories.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = 'palette-tab' + (index === 0 ? ' active' : '');
            btn.innerText = cat.name.split(' ')[0]; // short tab names
            btn.setAttribute('data-tooltip', cat.name);
            
            const grid = document.createElement('div');
            grid.className = 'palette-grid' + (index === 0 ? ' active' : '');
            
            cat.symbols.forEach(sym => {
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
                nav.querySelectorAll('.palette-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                contentArea.querySelectorAll('.palette-grid').forEach(g => g.classList.remove('active'));
                grid.classList.add('active');
            });
            
            nav.appendChild(btn);
            contentArea.appendChild(grid);
        });
        
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
