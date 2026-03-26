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
