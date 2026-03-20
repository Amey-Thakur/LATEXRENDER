// tooltips.js
// Shared globally.

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
