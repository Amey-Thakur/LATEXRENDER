// exporter.js
// The central dispatcher for the export pipeline.
// Reads the selected format and routes the DOM rendering task
// to the appropriate format module (Raster, Vector, or Document).

const Exporter = (function() {
    
    // Attaches the click listener to the export button.
    function init(buttonSelector, formatSelector, targetSelector) {
        const btn = document.querySelector(buttonSelector);
        const formatDropdown = document.querySelector(formatSelector);
        const targetNode = document.querySelector(targetSelector);

        if (!btn || !formatDropdown || !targetNode) {
            console.error("Exporter init failed: selectors missing");
            return;
        }

        btn.addEventListener("click", () => {
            const format = formatDropdown.value;
            const settings = Settings.getState();
            
            // Briefly disable the button and show loading state
            const originalText = btn.innerText;
            btn.innerText = "Processing...";
            btn.disabled = true;

            // Route execution based on format classification
            setTimeout(() => {
                executeExport(targetNode, format, settings)
                    .catch(err => {
                        console.error("Export Engine Exception:", err);
                        alert("Export failed: " + err.message);
                    })
                    .finally(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                    });
            }, 50); // Small timeout to allow UI to update to "Processing..."
        });
    }

    // Core routing logic
    async function executeExport(node, format, settings) {
        const rasterFormats = ['png', 'jpg', 'webp', 'avif', 'gif', 'bmp', 'tiff'];
        const vectorFormats = ['svg', 'eps', 'ps'];
        const documentFormats = ['pdf', 'ico', 'emf', 'wmf']; // ICO, EMF, WMF pending Phase 4

        const filename = sanitizeFilename(Editor.getValue().substring(0, 20) || "equation");

        if (rasterFormats.includes(format)) {
            // Check if Raster module is loaded (Phase 3)
            if (typeof RasterExport !== 'undefined') {
                await RasterExport.process(node, format, settings, filename);
            } else {
                throw new Error("Raster export module not found.");
            }
        } else if (vectorFormats.includes(format)) {
            // Pending Phase 4
            alert(`Vector export (${format.toUpperCase()}) is scheduled for Phase 4 deployment.`);
            // if (typeof VectorExport !== 'undefined') { ... } 
        } else if (documentFormats.includes(format)) {
            // Pending Phase 4
            alert(`Document/Legacy export (${format.toUpperCase()}) is scheduled for Phase 4 deployment.`);
        } else {
            throw new Error(`Unsupported export format: ${format}`);
        }
    }

    return {
        init: init
    };
})();
