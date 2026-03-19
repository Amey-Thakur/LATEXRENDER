// capture.js
// Shared rendering pipeline for the export system.
// Converts a live DOM node into a high-resolution Canvas
// through the SVG foreignObject technique.

const Capture = (function() {
    let katexCSSCache = null;

    // Fetches and caches the KaTeX stylesheet for SVG embedding.
    // The foreignObject context is isolated from the page styles,
    // so all CSS must be inlined into the SVG wrapper.
    async function fetchKatexCSS() {
        if (katexCSSCache !== null) return katexCSSCache;
        try {
            const response = await fetch("vendor/katex/katex.min.css");
            katexCSSCache = await response.text();
        } catch (e) {
            katexCSSCache = "";
        }
        return katexCSSCache;
    }

    // Renders a DOM node onto a Canvas at the specified scale factor.
    // Returns { canvas, ctx, width, height } where width and height
    // are the original unscaled pixel dimensions.
    async function toCanvas(targetNode, scale, settings) {
        const cssContent = await fetchKatexCSS();

        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        const clone = targetNode.cloneNode(true);
        clone.style.margin = "0";
        clone.style.width = width + "px";
        clone.style.height = height + "px";

        const svgString = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}">`,
            `<style>${cssContent}</style>`,
            `<foreignObject width="100%" height="100%">`,
            `<div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(${scale}); transform-origin: top left;">`,
            clone.outerHTML,
            `</div>`,
            `</foreignObject>`,
            `</svg>`
        ].join("");

        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        return { canvas, ctx, width, height };
    }

    return {
        toCanvas: toCanvas,
        fetchKatexCSS: fetchKatexCSS
    };
})();
