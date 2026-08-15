/**
 * File: js/layout.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 *
 * Tech Stack: JavaScript (ES6), Pointer Events, LocalStorage API
 *
 * Description:
 * Workspace layout controller. Provides a draggable splitter between the
 * editor, the preview and the configuration panel, and a switch between the
 * side-by-side and stacked arrangements. Both the orientation and the pane
 * sizes persist, so the workspace a user arranges is the one they return to.
 */

const Layout = (function () {
    const STORAGE_KEY = 'LATEXRENDER_LAYOUT_V1';

    // Below this width the stylesheet stacks the panes for phones and tablets,
    // and a splitter would fight it. Dragging is a pointer affordance anyway.
    const MIN_WIDTH_FOR_SPLITTERS = 901;

    const MIN_PANE_PX = 220;

    let workspace = null;
    let editor = null;
    let preview = null;
    let controls = null;
    let toggleBtn = null;
    let settingsBtn = null;
    let controlsSplitter = null;

    let state = { orientation: 'row', editorSize: null, controlsSize: null, controlsCollapsed: false };

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) state = Object.assign(state, JSON.parse(raw));
        } catch (e) {
            /* defaults are fine */
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            /* layout is a convenience, never break the app over it */
        }
    }

    function isStacked() {
        return state.orientation === 'column';
    }

    function active() {
        return window.innerWidth >= MIN_WIDTH_FOR_SPLITTERS;
    }

    /* Build one splitter and wire its drag behaviour. */
    function makeSplitter(before, after, kind) {
        const bar = document.createElement('div');
        bar.className = 'pane-splitter';
        bar.setAttribute('role', 'separator');
        bar.setAttribute('tabindex', '0');
        bar.dataset.kind = kind;
        bar.setAttribute('aria-label',
            kind === 'editor' ? 'Resize the editor' : 'Resize the configuration panel');

        let dragging = false;

        const apply = (px) => {
            const vertical = isStacked();
            const total = vertical ? workspace.clientHeight : workspace.clientWidth;
            const size = Math.max(MIN_PANE_PX, Math.min(px, total - MIN_PANE_PX));
            if (kind === 'editor') {
                before.style.flex = '0 0 ' + size + 'px';
                state.editorSize = size;
            } else {
                after.style.flex = '0 0 ' + size + 'px';
                state.controlsSize = size;
            }
        };

        const fromEvent = (e) => {
            const r = workspace.getBoundingClientRect();
            const vertical = isStacked();
            if (kind === 'editor') {
                return vertical ? e.clientY - r.top : e.clientX - r.left;
            }
            return vertical ? r.bottom - e.clientY : r.right - e.clientX;
        };

        bar.addEventListener('pointerdown', (e) => {
            if (!active()) return;
            dragging = true;
            bar.setPointerCapture(e.pointerId);
            bar.classList.add('dragging');
            document.body.classList.add('is-resizing');
            e.preventDefault();
        });

        bar.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            apply(fromEvent(e));
        });

        const stop = (e) => {
            if (!dragging) return;
            dragging = false;
            try { bar.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
            bar.classList.remove('dragging');
            document.body.classList.remove('is-resizing');
            save();
        };
        bar.addEventListener('pointerup', stop);
        bar.addEventListener('pointercancel', stop);

        // Keyboard parity, so the splitter is not mouse-only.
        bar.addEventListener('keydown', (e) => {
            if (!active()) return;
            const step = e.shiftKey ? 40 : 12;
            const current = kind === 'editor'
                ? (isStacked() ? before.offsetHeight : before.offsetWidth)
                : (isStacked() ? after.offsetHeight : after.offsetWidth);
            const back = isStacked() ? 'ArrowUp' : 'ArrowLeft';
            const fwd = isStacked() ? 'ArrowDown' : 'ArrowRight';
            if (e.key === back) { apply(current - step * (kind === 'editor' ? 1 : -1)); }
            else if (e.key === fwd) { apply(current + step * (kind === 'editor' ? 1 : -1)); }
            else { return; }
            e.preventDefault();
            save();
        });

        return bar;
    }

    /* Collapsing hides the panel and the divider that resizes it, so the
       workspace does not keep a splitter that controls nothing. */
    function setControlsCollapsed(collapsed) {
        state.controlsCollapsed = !!collapsed;
        controls.classList.toggle('hidden', state.controlsCollapsed);
        if (controlsSplitter) controlsSplitter.classList.toggle('hidden', state.controlsCollapsed);
        if (settingsBtn) {
            settingsBtn.classList.toggle('active', !state.controlsCollapsed);
            settingsBtn.setAttribute('aria-expanded', String(!state.controlsCollapsed));
            settingsBtn.setAttribute('aria-controls', 'pane-controls');
            settingsBtn.setAttribute('data-tooltip',
                state.controlsCollapsed ? 'Show configuration' : 'Hide configuration');
            settingsBtn.setAttribute('aria-label',
                state.controlsCollapsed ? 'Show configuration panel' : 'Hide configuration panel');
        }
    }

    function applyOrientation() {
        const stacked = isStacked();
        workspace.classList.toggle('is-stacked', stacked);
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', String(stacked));
            toggleBtn.setAttribute('data-tooltip',
                stacked ? 'Switch to side by side' : 'Switch to top and bottom');
            toggleBtn.setAttribute('aria-label',
                stacked ? 'Switch to side by side layout' : 'Switch to top and bottom layout');
            const icon = toggleBtn.querySelector('svg');
            if (icon) icon.style.transform = stacked ? 'rotate(90deg)' : '';
        }
        // A size measured along one axis is meaningless on the other.
        editor.style.flex = '';
        controls.style.flex = '';
        restoreSizes();
    }

    function restoreSizes() {
        if (!active()) {
            editor.style.flex = '';
            controls.style.flex = '';
            return;
        }
        if (state.editorSize) editor.style.flex = '0 0 ' + state.editorSize + 'px';
        if (state.controlsSize) controls.style.flex = '0 0 ' + state.controlsSize + 'px';
    }

    function init() {
        workspace = document.querySelector('.workspace');
        editor = document.querySelector('.pane-editor');
        preview = document.querySelector('.pane-preview');
        controls = document.querySelector('.pane-controls');
        toggleBtn = document.getElementById('btn-layout-toggle');

        if (!workspace || !editor || !preview || !controls) return;

        load();

        workspace.insertBefore(makeSplitter(editor, preview, 'editor'), preview);
        controlsSplitter = makeSplitter(preview, controls, 'controls');
        workspace.insertBefore(controlsSplitter, controls);

        settingsBtn = document.getElementById('btn-settings-toggle');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                setControlsCollapsed(!state.controlsCollapsed);
                save();
            });
        }
        setControlsCollapsed(state.controlsCollapsed);

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                state.orientation = isStacked() ? 'row' : 'column';
                applyOrientation();
                save();
            });
        }

        applyOrientation();
        window.addEventListener('resize', restoreSizes);
    }

    return { init };
})();
