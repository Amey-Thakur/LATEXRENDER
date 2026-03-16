# LATEXRENDER

LATEXRENDER is a high-performance, future-proof LaTeX rendering engine designed for complete independence from external dependencies. It leverages a locally vendored KaTeX engine to provide instantaneous client-side equation rendering, ensuring rapid visual feedback without network latency.

## Architecture and Design

The software architecture is strictly compartmentalized into modular JavaScript and CSS components. It relies exclusively on native DOM manipulation and stable browser APIs, strictly avoiding external frameworks, dynamic script injection, and third-party content delivery networks (CDNs). 

All engine operations occur entirely on the client, isolating user data and guaranteeing continuity of operation regardless of external service availability.

## System Capabilities

### Phase 3 System State
- **Instantaneous Rendering Segment:** A low-latency text area coupled to a KaTeX parsing thread, rendering standard mathematical notation directly to the DOM.
- **Dynamic Configuration Layer:** A real-time controls state manager modifying typography, resolution, padding, and layout parameters.
- **Raster Export Engine:** A 100% dependency-free rendering pipeline utilizing `SVG foreignObject` and high-DPI canvas buffering. Extracts native raster formats (PNG, JPG, WEBP, AVIF, GIF) directly from the browser matrix, and utilizes custom-written, hand-rolled binary encoders for legacy bit-maps (BMP) and tagged graphics (TIFF).
- **Debounced Subsystem:** Real-time visual parsing operates on a 150-millisecond debounce block.
- **Compartmentalized Assets:** All assets are sandboxed in the `Source Code` directory utilizing vanilla ES6.

## Setup and Operation
Because LATEXRENDER requires zero build tools or package managers, deployment is trivial:

1. Clone the repository.
2. Initialize any standard local web server from the `Source Code` directory (e.g., `python -m http.server`).
3. Load `index.html`.

*(Note: While it can open directly as a `file://` protocol, a local server is recommended to ensure specific browser security policies regarding font loading are bypassed.)*

## Development Stack
- **Engine:** KaTeX (Vendored v0.16.38)
- **Logic:** Vanilla ES6 JavaScript
- **Styling:** Vanilla CSS3
- **Markup:** HTML5
