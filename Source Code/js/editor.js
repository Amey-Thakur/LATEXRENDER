// editor.js
// Handles the text input area where the user types LaTeX code.
// Includes debouncing to prevent excessive rendering calls and
// basic text area behaviors like auto-resizing or tab handling
// if needed in the future.

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

    // Expose public API
    return {
        init: init,
        onChange: onChange,
        getValue: getValue
    };
})();
