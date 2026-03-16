// renderer.js
// Integrates with the vendored KaTeX library. Takes raw LaTeX string
// input and injects the rendered HTML into the preview stage DOM node.

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
    function render(latexString) {
        if (!outputContainer) return;
        
        // Clear previous state
        errorContainer.textContent = "";
        errorContainer.style.display = "none";
        
        if (latexString.trim() === "") {
            outputContainer.innerHTML = "";
            return;
        }

        try {
            // KaTeX render string directly to HTML string
            // We use displayMode: true as the default to center equations
            // and format them for standalone viewing. Throwing errors is enabled
            // so we can catch and display them below.
            const html = katex.renderToString(latexString, {
                displayMode: true,
                throwOnError: true,
                strict: false
            });
            
            outputContainer.innerHTML = html;
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
