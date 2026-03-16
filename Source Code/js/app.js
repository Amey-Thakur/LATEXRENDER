// app.js
// Application bootstrap and initialization sequence.
// Connects the editor events to the renderer output.
// EnsuresDOM is fully loaded before binding listeners to elements.

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize core modules with DOM selectors
    Editor.init("#latex-editor");
    Renderer.init("#preview-container", "#error-message");

    // 2. Connect the editor's change event directly to the renderer's
    //    render method. When the user types, the string gets passed along.
    //    Debouncing is handled inside the Editor module.
    Editor.onChange(function(newLatexString) {
        Renderer.render(newLatexString);
    });

    console.log("LATEXRENDER Initialized: Editor & Renderer linked.");
});
