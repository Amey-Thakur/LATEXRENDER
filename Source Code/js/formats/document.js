// document.js
// Handles PDF document exports natively.
// Implements a lightweight, hand-coded PDF 1.4 compiler that
// encapsulates the rendered equation as a JPEG image asset
// into a single-page document. Writes binary dictionary objects
// with correct cross-reference byte offsets.

const DocumentExport = (function() {

    // Core pipeline: DOM -> Canvas -> JPEG -> PDF binary
    async function process(targetNode, format, settings, baseFilename) {
        const { canvas } = await Capture.toCanvas(targetNode, 4.0, settings);

        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        // JPEG is simpler to embed than raw RGB in our lightweight PDF engine
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const pdfBlob = buildPDF(jpegDataUrl, width, height, canvas.width, canvas.height);

        triggerDownload(pdfBlob, baseFilename + ".pdf");
    }

    // Constructs a valid PDF 1.4 file with correct xref byte offsets.
    // Uses Uint8Array assembly to prevent encoding corruption of the JPEG stream.
    function buildPDF(jpegDataUrl, origWidth, origHeight, pixelWidth, pixelHeight) {
        const base64Data = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, "");
        const rawImageData = atob(base64Data);

        // PDF coordinates use points (1 pt = 1/72 inch)
        const ptWidth = origWidth * 0.75;
        const ptHeight = origHeight * 0.75;
        const pageWidth = ptWidth + 40;
        const pageHeight = ptHeight + 40;

        // Content stream positions the image with margins
        const stream = `q\n${ptWidth.toFixed(2)} 0 0 ${ptHeight.toFixed(2)} 20 20 cm\n/Im1 Do\nQ`;

        // Build all PDF object strings
        const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
        const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
        const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`;
        const obj4 = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
        const obj5Head = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${rawImageData.length} >>\nstream\n`;
        const obj5Tail = `\nendstream\nendobj\n`;

        // PDF header as raw bytes to preserve binary comment markers
        const header = new Uint8Array([
            0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A,
            0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A
        ]);

        const enc = new TextEncoder();
        const obj1Bytes = enc.encode(obj1);
        const obj2Bytes = enc.encode(obj2);
        const obj3Bytes = enc.encode(obj3);
        const obj4Bytes = enc.encode(obj4);
        const obj5HeadBytes = enc.encode(obj5Head);
        const obj5TailBytes = enc.encode(obj5Tail);

        // JPEG binary stream
        const imgBytes = new Uint8Array(rawImageData.length);
        for (let i = 0; i < rawImageData.length; i++) {
            imgBytes[i] = rawImageData.charCodeAt(i);
        }

        // Calculate exact byte offsets for each object
        let pos = header.length;
        const offsets = [];

        offsets.push(pos); pos += obj1Bytes.length;
        offsets.push(pos); pos += obj2Bytes.length;
        offsets.push(pos); pos += obj3Bytes.length;
        offsets.push(pos); pos += obj4Bytes.length;
        offsets.push(pos); pos += obj5HeadBytes.length + imgBytes.length + obj5TailBytes.length;

        const xrefOffset = pos;

        // Cross-reference table
        let xref = `xref\n0 6\n0000000000 65535 f \n`;
        offsets.forEach(o => {
            xref += `${o.toString().padStart(10, '0')} 00000 n \n`;
        });

        const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

        const xrefBytes = enc.encode(xref);
        const trailerBytes = enc.encode(trailer);

        // Assemble final binary payload
        const parts = [header, obj1Bytes, obj2Bytes, obj3Bytes, obj4Bytes, obj5HeadBytes, imgBytes, obj5TailBytes, xrefBytes, trailerBytes];
        const totalSize = parts.reduce((sum, p) => sum + p.length, 0);
        const finalBuffer = new Uint8Array(totalSize);
        let offset = 0;

        parts.forEach(part => {
            finalBuffer.set(part, offset);
            offset += part.length;
        });

        return new Blob([finalBuffer], { type: "application/pdf" });
    }

    return {
        process: process
    };
})();
