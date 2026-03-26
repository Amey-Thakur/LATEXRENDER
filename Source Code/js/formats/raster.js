/**
 * File: js/formats/raster.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6)
 * 
 * Description:
 * High-performance raster export engine for the LATEXRENDER application.
 * Leverages the HTML5 Canvas API to generate high-resolution image
 * assets in standard web formats (PNG, JPG, WEBP, AVIF, GIF) while
 * providing custom binary encoders for uncompressed 32-bit BMP and
 * multi-channel TIFF files.
 */

const RasterExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        const { canvas, ctx } = await Capture.toCanvas(targetNode, 4.0, settings);
        const filename = `${baseFilename}.${format}`;

        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'webp': 'image/webp',
            'avif': 'image/avif',
            'gif': 'image/gif'
        };

        if (mimeTypes[format]) {
            // Native browser canvas export
            canvas.toBlob(function(blob) {
                if (!blob) throw new Error("Canvas export failed. Format may be unsupported by your browser.");
                triggerDownload(blob, filename);
            }, mimeTypes[format], 1.0);

        } else if (format === 'bmp') {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            triggerDownload(encodeBMP(imgData), filename);

        } else if (format === 'tiff') {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            triggerDownload(encodeTIFF(imgData), filename);
        }
    }

    // Encodes ImageData into a 32-bit (BGRA) uncompressed BMP file.
    // Structure: 14-byte File Header + 40-byte Info Header + raw pixels (top-down).
    function encodeBMP(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        const fileHeaderSize = 14;
        const infoHeaderSize = 40;
        const bytesPerPixel = 4;
        const pixelDataSize = width * height * bytesPerPixel;
        const fileSize = fileHeaderSize + infoHeaderSize + pixelDataSize;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);
        const u8 = new Uint8Array(buffer);

        // BMP File Header
        view.setUint16(0, 0x4D42, false);
        view.setUint32(2, fileSize, true);
        view.setUint32(6, 0, true);
        view.setUint32(10, fileHeaderSize + infoHeaderSize, true);

        // DIB Info Header (BITMAPINFOHEADER)
        view.setUint32(14, infoHeaderSize, true);
        view.setUint32(18, width, true);
        view.setInt32(22, -height, true);
        view.setUint16(26, 1, true);
        view.setUint16(28, 32, true);
        view.setUint32(30, 0, true);
        view.setUint32(34, pixelDataSize, true);
        view.setUint32(38, 2835, true);
        view.setUint32(42, 2835, true);
        view.setUint32(46, 0, true);
        view.setUint32(50, 0, true);

        // Pixel Data (RGBA -> BGRA)
        let offset = fileHeaderSize + infoHeaderSize;
        for (let i = 0; i < data.length; i += 4) {
            u8[offset++] = data[i + 2];
            u8[offset++] = data[i + 1];
            u8[offset++] = data[i + 0];
            u8[offset++] = data[i + 3];
        }

        return new Blob([buffer], { type: "image/bmp" });
    }

    // Encodes ImageData into an uncompressed RGBA TIFF file.
    // Uses a single-strip IFD structure for maximum compatibility.
    function encodeTIFF(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        const NUM_ENTRIES = 11;
        const headerSize = 8;
        const ifdSize = 2 + (NUM_ENTRIES * 12) + 4;

        // Extended values that exceed the 4-byte IFD slot
        const bitsPerSampleOffset = headerSize + ifdSize;
        const resolutionOffset = bitsPerSampleOffset + 8;
        const stripOffset = resolutionOffset + 16;
        const stripByteCounts = data.length;

        const buffer = new ArrayBuffer(stripOffset + stripByteCounts);
        const view = new DataView(buffer);

        // TIFF Header (Little Endian)
        view.setUint16(0, 0x4949, false);
        view.setUint16(2, 42, true);
        view.setUint32(4, headerSize, true);

        // IFD Directory
        let offset = headerSize;
        view.setUint16(offset, NUM_ENTRIES, true);
        offset += 2;

        function writeTag(tag, type, count, valueOrOffset) {
            view.setUint16(offset, tag, true);
            view.setUint16(offset + 2, type, true);
            view.setUint32(offset + 4, count, true);
            if (type === 3 && count === 1) {
                view.setUint16(offset + 8, valueOrOffset, true);
                view.setUint16(offset + 10, 0, true);
            } else {
                view.setUint32(offset + 8, valueOrOffset, true);
            }
            offset += 12;
        }

        writeTag(256, 4, 1, width);
        writeTag(257, 4, 1, height);
        writeTag(258, 3, 4, bitsPerSampleOffset);
        writeTag(259, 3, 1, 1);
        writeTag(262, 3, 1, 2);
        writeTag(273, 4, 1, stripOffset);
        writeTag(277, 3, 1, 4);
        writeTag(278, 4, 1, height);
        writeTag(279, 4, 1, stripByteCounts);
        writeTag(282, 5, 1, resolutionOffset);
        writeTag(283, 5, 1, resolutionOffset + 8);

        // Next IFD (end of list)
        view.setUint32(offset, 0, true);

        // BitsPerSample: 8, 8, 8, 8
        view.setUint16(bitsPerSampleOffset, 8, true);
        view.setUint16(bitsPerSampleOffset + 2, 8, true);
        view.setUint16(bitsPerSampleOffset + 4, 8, true);
        view.setUint16(bitsPerSampleOffset + 6, 8, true);

        // Resolution: 300 dpi
        view.setUint32(resolutionOffset, 300, true);
        view.setUint32(resolutionOffset + 4, 1, true);
        view.setUint32(resolutionOffset + 8, 300, true);
        view.setUint32(resolutionOffset + 12, 1, true);

        // Pixel data (direct RGBA copy)
        new Uint8Array(buffer, stripOffset).set(data);

        return new Blob([buffer], { type: "image/tiff" });
    }

    return {
        process: process
    };
})();
