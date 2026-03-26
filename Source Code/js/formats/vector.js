/**
 * File: js/formats/vector.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), PostScript Specification
 * 
 * Description:
 * Scalable vector export module for the LATEXRENDER application.
 * Implements SVG serialization with inlined CSS for web-ready equations,
 * while providing a native PostScript Level 2 encoder to generate EPS
 * and PS files with hex-encoded RGB image operators for high-fidelity
 * integration into specialized design software.
 */

const VectorExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        if (format === 'svg') {
            await exportSVG(targetNode, baseFilename);
        } else {
            await exportPostScript(targetNode, format, settings, baseFilename);
        }
    }

    // SVG export with foreignObject HTML embedding
    async function exportSVG(targetNode, baseFilename) {
        const cssContent = await Capture.fetchKatexCSS();
        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        const clone = targetNode.cloneNode(true);
        clone.style.margin = "0";

        const svgString = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
            `<style>${cssContent}</style>`,
            `<foreignObject width="100%" height="100%">`,
            `<div xmlns="http://www.w3.org/1999/xhtml">`,
            clone.outerHTML,
            `</div>`,
            `</foreignObject>`,
            `</svg>`
        ].join("");

        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        triggerDownload(blob, `${baseFilename}.svg`);
    }

    // EPS and PS export with hex-encoded raster image data
    async function exportPostScript(targetNode, format, settings, baseFilename) {
        const { canvas, ctx } = await Capture.toCanvas(targetNode, 4.0, settings);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const psContent = buildPostScript(imageData, canvas.width, canvas.height, format === 'eps');

        const blob = new Blob([psContent], { type: "application/postscript" });
        triggerDownload(blob, `${baseFilename}.${format}`);
    }

    // Builds a valid PostScript document with hex-encoded RGB image data.
    // Uses the standard Level 2 colorimage operator.
    function buildPostScript(imageData, pixelWidth, pixelHeight, isEPS) {
        const data = imageData.data;
        const ptWidth = Math.round(pixelWidth * 0.75);
        const ptHeight = Math.round(pixelHeight * 0.75);

        // Convert RGBA pixel data to hex-encoded RGB
        const hexChunks = [];
        let lineBuffer = "";

        for (let i = 0; i < data.length; i += 4) {
            lineBuffer += toHex(data[i]) + toHex(data[i + 1]) + toHex(data[i + 2]);
            if (lineBuffer.length >= 78) {
                hexChunks.push(lineBuffer);
                lineBuffer = "";
            }
        }
        if (lineBuffer) hexChunks.push(lineBuffer);

        const lines = [];

        if (isEPS) {
            lines.push("%!PS-Adobe-3.0 EPSF-3.0");
            lines.push(`%%BoundingBox: 0 0 ${ptWidth} ${ptHeight}`);
        } else {
            lines.push("%!PS-Adobe-3.0");
        }

        lines.push("%%Creator: LATEXRENDER");
        lines.push("%%EndComments");
        lines.push("");
        lines.push("gsave");
        lines.push(`${ptWidth} ${ptHeight} scale`);
        lines.push(`${pixelWidth} ${pixelHeight} 8`);
        lines.push(`[${pixelWidth} 0 0 -${pixelHeight} 0 ${pixelHeight}]`);
        lines.push("{currentfile exch readhexstring pop}");
        lines.push("false 3 colorimage");
        lines.push(hexChunks.join("\n"));
        lines.push("grestore");

        if (!isEPS) lines.push("showpage");
        lines.push("%%EOF");

        return lines.join("\n");
    }

    function toHex(byte) {
        return byte.toString(16).padStart(2, '0');
    }

    return {
        process: process
    };
})();
