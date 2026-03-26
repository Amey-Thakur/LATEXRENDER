/**
 * File: js/capture.js
 * Author: Amey Thakur
 * GitHub: https://github.com/Amey-Thakur
 * Repository: https://github.com/Amey-Thakur/LATEXRENDER
 * Release Date: March 16 2026
 * License: MIT
 * 
 * Tech Stack: JavaScript (ES6), Canvas 2D API
 * 
 * Description:
 * High-fidelity rendering pipeline for the LATEXRENDER export system.
 * This module utilizes the HTML5 Canvas 2D API to recursively traverse
 * the live KaTeX DOM tree and paint mathematical expressions onto an
 * offscreen canvas, bypassing cross-origin SVG restrictions for 
 * seamless image generation.
 */

const Capture = (function() {
    let katexCSSCache = null;

    // Fetches and caches the KaTeX stylesheet for SVG-based exports.
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
        const rect = targetNode.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        ctx.scale(scale, scale);

        // Fill background
        if (!settings.isTransparent) {
            ctx.fillStyle = settings.colorBackground;
            ctx.fillRect(0, 0, width, height);
        }

        // Walk the DOM and draw each visible element directly
        renderNode(ctx, targetNode, rect.left, rect.top);

        return { canvas, ctx, width, height };
    }

    // Recursively traverses the DOM tree and draws each visual element.
    // Text is drawn with ctx.fillText, lines/rules with ctx.fillRect.
    function renderNode(ctx, node, originX, originY) {
        if (node.nodeType === Node.TEXT_NODE) {
            drawTextNode(ctx, node, originX, originY);
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const style = window.getComputedStyle(node);

        // Skip hidden or non-visual elements
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (node.classList.contains('katex-mathml')) return;

        const rect = node.getBoundingClientRect();

        // Draw background color (used by some KaTeX rule elements)
        drawBackground(ctx, style, rect, originX, originY);

        // Draw border-based rules (fraction bars, sqrt lines)
        drawBorders(ctx, style, rect, originX, originY);

        // Recurse into children
        for (const child of node.childNodes) {
            renderNode(ctx, child, originX, originY);
        }
    }

    // Draws a text node at its exact screen position using Canvas 2D text API.
    function drawTextNode(ctx, textNode, originX, originY) {
        const text = textNode.textContent;
        if (!text.trim()) return;

        const parent = textNode.parentElement;
        if (!parent) return;

        const style = window.getComputedStyle(parent);

        // Build the CSS font shorthand for canvas
        const fontStyle = style.fontStyle || 'normal';
        const fontWeight = style.fontWeight || 'normal';
        const fontSize = style.fontSize || '16px';
        const fontFamily = style.fontFamily || 'serif';

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
        ctx.fillStyle = style.color;

        // Use character-by-character positioning for accuracy
        const range = document.createRange();
        range.selectNodeContents(textNode);
        const clientRects = range.getClientRects();

        if (clientRects.length === 0) return;

        // For single-rect text nodes, draw all at once
        if (clientRects.length === 1) {
            const r = clientRects[0];
            ctx.textBaseline = 'top';
            ctx.fillText(text, r.left - originX, r.top - originY);
            return;
        }

        // For multi-rect text (line wraps), draw each segment
        let charIndex = 0;
        for (const r of clientRects) {
            const segmentLength = Math.ceil(text.length / clientRects.length);
            const segment = text.substring(charIndex, charIndex + segmentLength);
            ctx.textBaseline = 'top';
            ctx.fillText(segment, r.left - originX, r.top - originY);
            charIndex += segmentLength;
        }
    }

    // Fills background color if the element has one
    function drawBackground(ctx, style, rect, originX, originY) {
        const bg = style.backgroundColor;
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return;

        ctx.fillStyle = bg;
        ctx.fillRect(
            rect.left - originX,
            rect.top - originY,
            rect.width,
            rect.height
        );
    }

    // Draws borders as filled rectangles (fraction bars, overlines, underlines)
    function drawBorders(ctx, style, rect, originX, originY) {
        const x = rect.left - originX;
        const y = rect.top - originY;
        const w = rect.width;
        const h = rect.height;

        const borders = [
            { width: parseFloat(style.borderTopWidth), color: style.borderTopColor, draw: () => ctx.fillRect(x, y, w, parseFloat(style.borderTopWidth)) },
            { width: parseFloat(style.borderBottomWidth), color: style.borderBottomColor, draw: () => ctx.fillRect(x, y + h - parseFloat(style.borderBottomWidth), w, parseFloat(style.borderBottomWidth)) },
            { width: parseFloat(style.borderLeftWidth), color: style.borderLeftColor, draw: () => ctx.fillRect(x, y, parseFloat(style.borderLeftWidth), h) },
            { width: parseFloat(style.borderRightWidth), color: style.borderRightColor, draw: () => ctx.fillRect(x + w - parseFloat(style.borderRightWidth), y, parseFloat(style.borderRightWidth), h) }
        ];

        for (const border of borders) {
            if (border.width > 0 && border.color && border.color !== 'transparent') {
                ctx.fillStyle = border.color;
                border.draw();
            }
        }
    }

    return {
        toCanvas: toCanvas,
        fetchKatexCSS: fetchKatexCSS
    };
})();
