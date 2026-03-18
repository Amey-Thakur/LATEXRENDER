// modal.js
// Handles the custom confirmation modal for the application.

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
