// raster.js
// High-performance raster rendering engine.
// Uses DOM-to-SVG-to-Canvas pipeline to capture the mathematical
// equation at high resolution (4x scale), and exports to
// standard browser formats (PNG, JPG, WEBP, AVIF) and
// custom binary formats (BMP, TIFF, GIF fallback).

const RasterExport = (function() {
    
    // Core pipeline function: DOM -> SVG -> Canvas -> Blob/File
    async function process(targetNode, format, settings, baseFilename) {
        
        // Ensure KaTeX CSS is fetched and inlined for the SVG context
        const cssContent = await fetchKatexCSS();
        
        // Compute bounding box and scaling
        const scale = 4.0; // Retina / high-DPI quality multiplier
        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);
        
        // Deep clone the node to isolate styling
        const clone = targetNode.cloneNode(true);
        
        // Reset the clone's position but keep its explicit styling
        clone.style.margin = "0";
        clone.style.width = width + "px";
        clone.style.height = height + "px";

        // Build the standalone SVG wrapper
        // The foreignObject acts as a portal for HTML rendering inside SVG
        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}">
                <style>${cssContent}</style>
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(${scale}); transform-origin: top left;">
                        ${clone.outerHTML}
                    </div>
                </foreignObject>
            </svg>
        `;

        // Create an Image element and load the SVG data URI into it
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        // Prepare the offscreen Canvas for rasterization
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // If not transparent, fill the canvas with the background color
        // before dropping the SVG on it.
        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw the high-res SVG onto the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Clean up object URL
        URL.revokeObjectURL(url);

        // Branch into specific format encodings
        const filename = `${baseFilename}.${format}`;
        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'webp': 'image/webp',
            'avif': 'image/avif',
            'gif': 'image/gif' // Note: Most browsers fall back to PNG for GIF canvas export
        };

        if (['png', 'jpg', 'webp', 'avif', 'gif'].includes(format)) {
            // Native Browser Exports
            // We force quality to 1.0 for lossy formats to preserve crisp math edges
            canvas.toBlob(function(blob) {
                if (!blob) {
                    throw new Error("Canvas export failed. Format may be unsupported by your browser.");
                }
                triggerDownload(blob, filename);
            }, mimeTypes[format], 1.0);
            
        } else if (format === 'bmp') {
            // Custom BMP Binary Encoder
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const bmpBlob = encodeBMP(imgData);
            triggerDownload(bmpBlob, filename);
            
        } else if (format === 'tiff') {
            // Custom TIFF Binary Encoder
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const tiffBlob = encodeTIFF(imgData);
            triggerDownload(tiffBlob, filename);
        }
    }

    // Fetches the KaTeX CSS. We need this because the SVG foreignObject
    // operates in an isolated environment and doesn't inherit page stylesheets.
    async function fetchKatexCSS() {
        try {
            const response = await fetch("vendor/katex/katex.min.css");
            return await response.text();
        } catch (e) {
            console.warn("Failed to fetch KaTeX CSS for embedding. Export may look unstyled.");
            return "";
        }
    }

    // --- Custom Binary Encoders --- //

    // Encodes ImageData into a 32-bit (BGRA) uncompressed BMP file payload.
    // BMP is a simple structural format: a 14-byte File Header, a 40-byte Info Header,
    // followed directly by the raw pixel array, painted bottom-up.
    function encodeBMP(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        // File structure sizes
        const fileHeaderSize = 14;
        const infoHeaderSize = 40;
        const bytesPerPixel = 4; // 32-bit BMP (BGRA)
        const pixelDataSize = width * height * bytesPerPixel;
        const fileSize = fileHeaderSize + infoHeaderSize + pixelDataSize;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);
        const u8 = new Uint8Array(buffer);

        // 1. BMP File Header
        view.setUint16(0, 0x4D42, false);   // Signature 'BM'
        view.setUint32(2, fileSize, true);  // File size
        view.setUint32(6, 0, true);         // Reserved
        view.setUint32(10, fileHeaderSize + infoHeaderSize, true); // Image data offset

        // 2. DIB Info Header (BITMAPINFOHEADER)
        view.setUint32(14, infoHeaderSize, true); // Info header size
        view.setUint32(18, width, true);          // Width
        view.setInt32(22, -height, true);         // Height (negative means top-down, meaning we don't have to flip our image array)
        view.setUint16(26, 1, true);              // Color planes
        view.setUint16(28, 32, true);             // Bits per pixel
        view.setUint32(30, 0, true);              // Compression (0 = None / BI_RGB)
        view.setUint32(34, pixelDataSize, true);  // Image data size
        view.setUint32(38, 2835, true);           // X resolution (72dpi)
        view.setUint32(42, 2835, true);           // Y resolution (72dpi)
        view.setUint32(46, 0, true);              // Colors in palette
        view.setUint32(50, 0, true);              // Important colors

        // 3. Pixel Data Conversion (RGBA -> BGRA)
        let offset = fileHeaderSize + infoHeaderSize;
        for (let i = 0; i < data.length; i += 4) {
            u8[offset++] = data[i + 2]; // B
            u8[offset++] = data[i + 1]; // G
            u8[offset++] = data[i + 0]; // R
            u8[offset++] = data[i + 3]; // A
        }

        return new Blob([buffer], { type: "image/bmp" });
    }

    // Encodes ImageData into an uncompressed RGBA TIFF file.
    // TIFF uses an Image File Directory (IFD) linked list structure.
    // Extremely verbose but lossless and widely compatible in scholarly publishing.
    function encodeTIFF(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        // Number of directory entries required to define the image
        const NUM_ENTRIES = 11;
        
        // Memory block calculations
        const headerSize = 8;
        const ifdSize = 2 + (NUM_ENTRIES * 12) + 4; // count(2) + entries(12ea) + nextIfdOffset(4)
        
        // Extended values that don't fit in the 4-byte IFD value slot need their own space
        const bitsPerSampleOffset = headerSize + ifdSize;
        const resolutionOffset = bitsPerSampleOffset + 8; // 4 shorts = 8 bytes
        
        // Where the actual pixel strip begins
        const stripOffset = resolutionOffset + 16; // 2 rationals (8 bytes ea) = 16 bytes
        const stripByteCounts = data.length;

        // Total Buffer Allocation
        const buffer = new ArrayBuffer(stripOffset + stripByteCounts);
        const view = new DataView(buffer);

        // 1. TIFF Header (Little Endian 'II')
        view.setUint16(0, 0x4949, false); // 'II'
        view.setUint16(2, 42, true);      // The magic number 42
        view.setUint32(4, headerSize, true); // Offset to 0th IFD (right after header)

        // 2. Write the 0th IFD Directory
        let offset = headerSize;
        view.setUint16(offset, NUM_ENTRIES, true);
        offset += 2;

        // Helper to consistently write identical 12-byte IFD tagged entries
        function writeTag(tag, type, count, valueOrOffset) {
            view.setUint16(offset, tag, true);
            view.setUint16(offset + 2, type, true);
            view.setUint32(offset + 4, count, true);
            if (type === 3 && count === 1) {
                // Short values are left-aligned in the 4-byte field
                view.setUint16(offset + 8, valueOrOffset, true);
                view.setUint16(offset + 10, 0, true);
            } else {
                view.setUint32(offset + 8, valueOrOffset, true);
            }
            offset += 12;
        }

        // Tag Types: 3=Short, 4=Long, 5=Rational
        writeTag(256, 4, 1, width);                        // ImageWidth
        writeTag(257, 4, 1, height);                       // ImageLength
        writeTag(258, 3, 4, bitsPerSampleOffset);          // BitsPerSample (Points to [8,8,8,8] block)
        writeTag(259, 3, 1, 1);                            // Compression (1 = Uncompressed)
        writeTag(262, 3, 1, 2);                            // PhotometricInterpretation (2 = RGB)
        writeTag(273, 4, 1, stripOffset);                  // StripOffsets (Points to image data)
        writeTag(277, 3, 1, 4);                            // SamplesPerPixel (4 = RGBA)
        writeTag(278, 4, 1, height);                       // RowsPerStrip (All in one strip)
        writeTag(279, 4, 1, stripByteCounts);              // StripByteCounts
        writeTag(282, 5, 1, resolutionOffset);             // XResolution
        writeTag(283, 5, 1, resolutionOffset + 8);         // YResolution

        // Next IFD Offset (0 = End of list)
        view.setUint32(offset, 0, true);

        // 3. Write Extended Values Block
        // BitsPerSample: 8, 8, 8, 8
        view.setUint16(bitsPerSampleOffset, 8, true);
        view.setUint16(bitsPerSampleOffset + 2, 8, true);
        view.setUint16(bitsPerSampleOffset + 4, 8, true);
        view.setUint16(bitsPerSampleOffset + 6, 8, true); // Alpha channel

        // Resolution Definitions: 300 / 1 dpi
        view.setUint32(resolutionOffset, 300, true);
        view.setUint32(resolutionOffset + 4, 1, true);
        view.setUint32(resolutionOffset + 8, 300, true);
        view.setUint32(resolutionOffset + 12, 1, true);

        // 4. Dump Pixel Array Data
        // Directly copy the RGBA uint8 stream to the target buffer
        new Uint8Array(buffer, stripOffset).set(data);

        return new Blob([buffer], { type: "image/tiff" });
    }

    return {
        process: process
    };
})();
