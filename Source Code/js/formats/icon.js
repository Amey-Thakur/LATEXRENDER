// icon.js
// Handles generation of Windows ICO format binaries.
// Encapsulates a standard 256x256 PNG payload into the ICO directory structure.

const IconExport = (function() {
    
    // Core pipeline
    async function process(targetNode, format, settings, baseFilename) {
        
        // Render identical to Raster module, but strictly scaled and boxed to a perfect square.
        const size = 256; 
        const rect = targetNode.getBoundingClientRect();
        
        // Force KaTeX CSS embedding
        const cssContent = await fetchKatexCSS();
        
        const clone = targetNode.cloneNode(true);
        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
                <style>${cssContent}</style>
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml">
                        ${clone.outerHTML}
                    </div>
                </foreignObject>
            </svg>
        `;

        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        // Setup a strict 256x256 framing canvas
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, size, size);
        }

        // Center the mathematical output inside the icon box
        const scale = Math.min((size - 40) / rect.width, (size - 40) / rect.height);
        const w = rect.width * scale;
        const h = rect.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        URL.revokeObjectURL(url);

        // Native extraction to standard PNG array buffer
        canvas.toBlob(blob => {
            blob.arrayBuffer().then(pngBuffer => {
                const icoBlob = encodeICO(pngBuffer, size);
                triggerDownload(icoBlob, `${baseFilename}.ico`);
            });
        }, "image/png");
    }

    async function fetchKatexCSS() {
        try { return await fetch("vendor/katex/katex.min.css").then(r => r.text()); } catch (e) { return ""; }
    }

    // Wrap a standard PNG into a Windows Icon directory payload (native ICO magic)
    function encodeICO(pngBuffer, size) {
        const directorySize = 16;
        const headerSize = 6;
        const fileSize = headerSize + directorySize + pngBuffer.byteLength;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        // ICO Header (6 bytes)
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // Image type (1 = ICO)
        view.setUint16(4, 1, true); // Number of images

        // Directory Entry (16 bytes)
        view.setUint8(6, size === 256 ? 0 : size); // Width (0 means 256px)
        view.setUint8(7, size === 256 ? 0 : size); // Height
        view.setUint8(8, 0); // Palette color count
        view.setUint8(9, 0); // Reserved
        view.setUint16(10, 1, true); // Color planes
        view.setUint16(12, 32, true); // Bits per pixel
        view.setUint32(14, pngBuffer.byteLength, true); // Size of image data
        view.setUint32(18, headerSize + directorySize, true); // Offset of image data

        // Splice PNG payload into final binary blob
        new Uint8Array(buffer, headerSize + directorySize).set(new Uint8Array(pngBuffer));

        return new Blob([buffer], { type: "image/x-icon" });
    }

    return {
        process: process
    };
})();
