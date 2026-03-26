/**
 * File: js/formats/icon.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * Windows Icon (ICO) export module for the LATEXRENDER application.
 * Renders mathematical expressions into high-resolution 256x256 square
 * canvases and encapsulates the resulting PNG payloads within a 
 * manually constructed ICO directory structure for system-level
 * compatibility.
 */

const IconExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        const size = 256;

        // Render the equation at standard scale first
        const { canvas: srcCanvas } = await Capture.toCanvas(targetNode, 2.0, settings);

        // Create a strict 256x256 square canvas
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, size, size);
        }

        // Center the equation inside the icon frame
        const scale = Math.min((size - 40) / srcCanvas.width, (size - 40) / srcCanvas.height);
        const w = srcCanvas.width * scale;
        const h = srcCanvas.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;

        ctx.drawImage(srcCanvas, x, y, w, h);

        // Extract PNG and wrap in ICO container
        canvas.toBlob(blob => {
            blob.arrayBuffer().then(pngBuffer => {
                const icoBlob = encodeICO(pngBuffer, size);
                triggerDownload(icoBlob, `${baseFilename}.ico`);
            });
        }, "image/png");
    }

    // Wraps a PNG payload inside a Windows Icon directory structure.
    function encodeICO(pngBuffer, size) {
        const headerSize = 6;
        const directorySize = 16;
        const fileSize = headerSize + directorySize + pngBuffer.byteLength;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        // ICO Header
        view.setUint16(0, 0, true);
        view.setUint16(2, 1, true);
        view.setUint16(4, 1, true);

        // Directory Entry
        view.setUint8(6, size === 256 ? 0 : size);
        view.setUint8(7, size === 256 ? 0 : size);
        view.setUint8(8, 0);
        view.setUint8(9, 0);
        view.setUint16(10, 1, true);
        view.setUint16(12, 32, true);
        view.setUint32(14, pngBuffer.byteLength, true);
        view.setUint32(18, headerSize + directorySize, true);

        // PNG payload
        new Uint8Array(buffer, headerSize + directorySize).set(new Uint8Array(pngBuffer));

        return new Blob([buffer], { type: "image/x-icon" });
    }

    return {
        process: process
    };
})();
