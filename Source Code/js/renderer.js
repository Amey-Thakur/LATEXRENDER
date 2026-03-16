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
    // Respects the current configuration from Settings module.
    function render(latexString) {
        if (!outputContainer) return;
        
        // Fetch current active settings
        const settings = Settings.getState();
        
        // Clear previous state
        errorContainer.textContent = "";
        errorContainer.style.display = "none";
        
        if (latexString.trim() === "") {
            outputContainer.innerHTML = "";
            return;
        }

        try {
            // KaTeX render string directly to HTML string
            const html = katex.renderToString(latexString, {
                displayMode: settings.displayMode,
                throwOnError: true,
                strict: false
            });
            
            // Apply structural HTML
            outputContainer.innerHTML = html;
            
            // Apply stylistic settings directly to the container logic
            outputContainer.style.fontFamily = settings.fontFamily;
            outputContainer.style.fontSize = settings.fontSize;
            outputContainer.style.color = settings.colorForeground;
            outputContainer.style.padding = settings.padding;

            // Handle background transparency vs solid color
            if (settings.isTransparent) {
                outputContainer.style.backgroundColor = "transparent";
                outputContainer.style.backgroundImage = "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)";
                outputContainer.style.backgroundSize = "20px 20px";
                outputContainer.style.backgroundPosition = "0 0, 0 10px, 10px -10px, -10px 0px";
                outputContainer.style.boxShadow = "none";
            } else {
                outputContainer.style.backgroundColor = settings.colorBackground;
                outputContainer.style.backgroundImage = "none";
                outputContainer.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.2)";
            }

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
