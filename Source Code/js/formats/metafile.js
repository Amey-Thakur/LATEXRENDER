// metafile.js
// Support for Windows Metafile formats (EMF, WMF).
// Embeds a high-resolution bitmap raster into the metafile
// container using standard GDI record structures with
// raw BGR pixel data.

const MetafileExport = (function() {

    async function process(targetNode, format, settings, baseFilename) {
        const { canvas, ctx } = await Capture.toCanvas(targetNode, 4.0, settings);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (format === 'emf') {
            const blob = encodeEMF(imageData, canvas.width, canvas.height);
            triggerDownload(blob, `${baseFilename}.emf`);
        } else {
            const blob = encodeWMF(imageData, canvas.width, canvas.height);
            triggerDownload(blob, `${baseFilename}.wmf`);
        }
    }

    // Builds a valid EMF file: EMR_HEADER + EMR_STRETCHDIBITS + EMR_EOF.
    // Embeds pixel data as a 24-bit BGR Device Independent Bitmap.
    function encodeEMF(imageData, width, height) {
        const pixels = imageData.data;

        // DIB layout: 24-bit BGR with row padding to 4-byte boundaries
        const rowSize = width * 3;
        const rowPadding = (4 - (rowSize % 4)) % 4;
        const paddedRowSize = rowSize + rowPadding;
        const dibDataSize = paddedRowSize * height;
        const dibHeaderSize = 40;

        // EMF record sizes
        const emrHeaderSize = 108;
        const stretchFixedSize = 80;
        const stretchRecordSize = stretchFixedSize + dibHeaderSize + dibDataSize;
        const eofSize = 20;
        const totalSize = emrHeaderSize + stretchRecordSize + eofSize;

        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        let offset = 0;

        // EMR_HEADER (Type = 1)
        view.setUint32(offset, 1, true); offset += 4;
        view.setUint32(offset, emrHeaderSize, true); offset += 4;
        // rclBounds (device units)
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, width - 1, true); offset += 4;
        view.setInt32(offset, height - 1, true); offset += 4;
        // rclFrame (0.01mm units)
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, Math.round(width * 26.46), true); offset += 4;
        view.setInt32(offset, Math.round(height * 26.46), true); offset += 4;
        // Signature
        view.setUint32(offset, 0x464D4520, true); offset += 4;
        // Version 1.0
        view.setUint32(offset, 0x00010000, true); offset += 4;
        // Total file size
        view.setUint32(offset, totalSize, true); offset += 4;
        // Number of records
        view.setUint32(offset, 3, true); offset += 4;
        // Number of handles
        view.setUint16(offset, 1, true); offset += 2;
        // Reserved
        view.setUint16(offset, 0, true); offset += 2;
        // nDescription, offDescription, nPalEntries
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        // szlDevice (reference device pixels)
        view.setUint32(offset, 1920, true); offset += 4;
        view.setUint32(offset, 1080, true); offset += 4;
        // szlMillimeters (reference device mm)
        view.setUint32(offset, 508, true); offset += 4;
        view.setUint32(offset, 286, true); offset += 4;
        // Pad remaining header bytes to 108
        while (offset < emrHeaderSize) {
            view.setUint8(offset, 0); offset++;
        }

        // EMR_STRETCHDIBITS (Type = 81)
        view.setUint32(offset, 81, true); offset += 4;
        view.setUint32(offset, stretchRecordSize, true); offset += 4;
        // rclBounds
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, width - 1, true); offset += 4;
        view.setInt32(offset, height - 1, true); offset += 4;
        // xDest, yDest
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        // xSrc, ySrc
        view.setInt32(offset, 0, true); offset += 4;
        view.setInt32(offset, 0, true); offset += 4;
        // cxSrc, cySrc
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;
        // offBmiSrc (BITMAPINFO offset from record start)
        view.setUint32(offset, stretchFixedSize, true); offset += 4;
        // cbBmiSrc
        view.setUint32(offset, dibHeaderSize, true); offset += 4;
        // offBitsSrc (pixel data offset from record start)
        view.setUint32(offset, stretchFixedSize + dibHeaderSize, true); offset += 4;
        // cbBitsSrc
        view.setUint32(offset, dibDataSize, true); offset += 4;
        // iUsageSrc (DIB_RGB_COLORS)
        view.setUint32(offset, 0, true); offset += 4;
        // dwRop (SRCCOPY)
        view.setUint32(offset, 0x00CC0020, true); offset += 4;
        // cxDest, cyDest
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;

        // BITMAPINFOHEADER (40 bytes)
        view.setUint32(offset, dibHeaderSize, true); offset += 4;
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 24, true); offset += 2;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, dibDataSize, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;

        // Pixel data (RGBA -> BGR, bottom-up row order)
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * 4;
                view.setUint8(offset++, pixels[srcIdx + 2]);
                view.setUint8(offset++, pixels[srcIdx + 1]);
                view.setUint8(offset++, pixels[srcIdx]);
            }
            for (let p = 0; p < rowPadding; p++) {
                view.setUint8(offset++, 0);
            }
        }

        // EMR_EOF (Type = 14)
        view.setUint32(offset, 14, true); offset += 4;
        view.setUint32(offset, eofSize, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, eofSize, true); offset += 4;

        return new Blob([buffer], { type: "image/emf" });
    }

    // Builds a Placeable WMF file with META_STRETCHDIB record.
    // Uses the Aldus header for coordinate mapping.
    function encodeWMF(imageData, width, height) {
        const pixels = imageData.data;

        // DIB layout: 24-bit BGR with row padding
        const rowSize = width * 3;
        const rowPadding = (4 - (rowSize % 4)) % 4;
        const paddedRowSize = rowSize + rowPadding;
        const dibDataSize = paddedRowSize * height;
        const dibHeaderSize = 40;
        const dibTotalSize = dibHeaderSize + dibDataSize;

        // Placeable WMF header: 22 bytes
        const placeableSize = 22;
        // WMF header: 18 bytes
        const wmfHeaderSize = 18;
        // META_STRETCHDIB fixed fields: 28 bytes + DIB
        const stretchFixedSize = 28;
        const stretchRecordSize = stretchFixedSize + dibTotalSize;
        // Ensure record size is even (WMF uses WORD-sized records)
        const stretchRecordSizeWords = Math.ceil(stretchRecordSize / 2);
        const stretchRecordSizeBytes = stretchRecordSizeWords * 2;
        // EOF record: 6 bytes (3 words)
        const eofSize = 6;

        const wmfDataSize = wmfHeaderSize + stretchRecordSizeBytes + eofSize;
        const totalSize = placeableSize + wmfDataSize;

        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        let offset = 0;

        // Placeable WMF Header (Aldus)
        view.setUint32(offset, 0x9AC6CDD7, true); offset += 4;
        view.setUint16(offset, 0, true); offset += 2;
        // BBox
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, width, true); offset += 2;
        view.setInt16(offset, height, true); offset += 2;
        // Units per inch
        view.setUint16(offset, 96, true); offset += 2;
        // Reserved
        view.setUint32(offset, 0, true); offset += 4;

        // Checksum (XOR of first 10 words)
        const checkView = new DataView(buffer, 0, 20);
        let checksum = 0;
        for (let i = 0; i < 10; i++) {
            checksum ^= checkView.getUint16(i * 2, true);
        }
        view.setUint16(offset, checksum, true); offset += 2;

        // WMF Header
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 9, true); offset += 2;
        view.setUint16(offset, 0x0300, true); offset += 2;
        // File size in words
        view.setUint32(offset, wmfDataSize / 2, true); offset += 4;
        // Number of objects
        view.setUint16(offset, 0, true); offset += 2;
        // Max record size in words
        view.setUint32(offset, stretchRecordSizeWords, true); offset += 4;
        // Number of members
        view.setUint16(offset, 0, true); offset += 2;

        // META_STRETCHDIB (Function = 0x0F43)
        view.setUint32(offset, stretchRecordSizeWords, true); offset += 4;
        view.setUint16(offset, 0x0F43, true); offset += 2;
        // dwRop (SRCCOPY)
        view.setUint32(offset, 0x00CC0020, true); offset += 4;
        // ColorUsage (DIB_RGB_COLORS)
        view.setUint16(offset, 0, true); offset += 2;
        // SrcHeight, SrcWidth
        view.setInt16(offset, height, true); offset += 2;
        view.setInt16(offset, width, true); offset += 2;
        // YSrc, XSrc
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, 0, true); offset += 2;
        // DestHeight, DestWidth
        view.setInt16(offset, height, true); offset += 2;
        view.setInt16(offset, width, true); offset += 2;
        // YDest, XDest
        view.setInt16(offset, 0, true); offset += 2;
        view.setInt16(offset, 0, true); offset += 2;

        // BITMAPINFOHEADER
        view.setUint32(offset, dibHeaderSize, true); offset += 4;
        view.setInt32(offset, width, true); offset += 4;
        view.setInt32(offset, height, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, 24, true); offset += 2;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, dibDataSize, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 2835, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;
        view.setUint32(offset, 0, true); offset += 4;

        // Pixel data (RGBA -> BGR, bottom-up)
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * 4;
                view.setUint8(offset++, pixels[srcIdx + 2]);
                view.setUint8(offset++, pixels[srcIdx + 1]);
                view.setUint8(offset++, pixels[srcIdx]);
            }
            for (let p = 0; p < rowPadding; p++) {
                view.setUint8(offset++, 0);
            }
        }

        // Pad record to even size if needed
        while (offset < placeableSize + wmfHeaderSize + stretchRecordSizeBytes) {
            view.setUint8(offset++, 0);
        }

        // META_EOF (Function = 0x0000)
        view.setUint32(offset, 3, true); offset += 4;
        view.setUint16(offset, 0x0000, true); offset += 2;

        return new Blob([buffer], { type: "image/wmf" });
    }

    return {
        process: process
    };
})();
