/**
 * File: js/exporter.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Central export dispatcher for the LATEXRENDER application. This module
 * orchestrates the conversion of rendered LaTeX expressions into various
 * file formats by routing tasks to specialized raster, vector, and document
 * export sub-modules based on user selection.
 */

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
                    .then(() => {
                        Toast.show(`Exported as ${format.toUpperCase()} successfully.`);
                    })
                    .catch(err => {
                        console.error("Export Engine Exception:", err);
                        Toast.show("Export failed: " + err.message);
                    })
                    .finally(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                    });
            }, 50);
        });
    }

    // Core routing logic
    async function executeExport(node, format, settings) {
        const rasterFormats = ['png', 'jpg', 'webp', 'avif', 'gif', 'bmp', 'tiff'];
        const vectorFormats = ['svg', 'eps', 'ps'];
        const documentFormats = ['pdf', 'ico', 'emf', 'wmf'];

        const filename = sanitizeFilename(Editor.getValue().substring(0, 20) || "equation");

        if (rasterFormats.includes(format)) {
            if (typeof RasterExport !== 'undefined') {
                await RasterExport.process(node, format, settings, filename);
            } else throw new Error("Raster export module missing.");
        } else if (vectorFormats.includes(format)) {
            if (typeof VectorExport !== 'undefined') {
                await VectorExport.process(node, format, settings, filename);
            } else throw new Error("Vector export module missing.");
        } else if (documentFormats.includes(format)) {
            if (format === 'pdf' && typeof DocumentExport !== 'undefined') {
                await DocumentExport.process(node, format, settings, filename);
            } else if (format === 'ico' && typeof IconExport !== 'undefined') {
                await IconExport.process(node, format, settings, filename);
            } else if (['emf', 'wmf'].includes(format) && typeof MetafileExport !== 'undefined') {
                await MetafileExport.process(node, format, settings, filename);
            } else throw new Error(`Document export module missing for ${format}.`);
        } else {
            throw new Error(`Unsupported export format: ${format}`);
        }
    }

    return {
        init: init
    };
})();
