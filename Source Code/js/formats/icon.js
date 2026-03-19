// icon.js
// Handles generation of Windows ICO format binaries.
// Renders the equation into a centered 256x256 square canvas,
// then wraps the PNG payload inside the ICO directory structure.

const IconExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        const size = 256;
        const cssContent = await Capture.fetchKatexCSS();
        const rect = targetNode.getBoundingClientRect();

        const clone = targetNode.cloneNode(true);
        const svgString = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">`,
            `<style>${cssContent}</style>`,
            `<foreignObject width="100%" height="100%">`,
            `<div xmlns="http://www.w3.org/1999/xhtml">`,
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

        // Setup a strict 256x256 square canvas
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, size, size);
        }

        // Center the equation inside the icon frame
        const scale = Math.min((size - 40) / rect.width, (size - 40) / rect.height);
        const w = rect.width * scale;
        const h = rect.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        URL.revokeObjectURL(url);

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
