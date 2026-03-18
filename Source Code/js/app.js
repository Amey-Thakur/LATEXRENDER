// app.js
// Application bootstrap and initialization sequence.
// Connects the editor events to the renderer output.
// EnsuresDOM is fully loaded before binding listeners to elements.

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize core modules with DOM selectors
    Settings.init();
    Editor.init("#latex-editor");
    Renderer.init("#preview-container", "#error-message");
    Exporter.init("#btn-export", "#export-format", "#preview-container");
    Share.init("#btn-share");
    History.init("#btn-history", ".pane-history");

    // Settings Panel Toggle
    const settingsToggle = document.getElementById("btn-settings-toggle");
    const settingsPane = document.querySelector(".pane-controls");
    if (settingsToggle && settingsPane) {
        settingsToggle.addEventListener('click', () => {
            const isHidden = settingsPane.classList.toggle('hidden');
            settingsToggle.classList.toggle('active', !isHidden);
        });
    }

    // 2. Connect the editor's change event direct to the renderer
    let historyTimeout;
    Editor.onChange(function(newLatexString) {
        Renderer.render(newLatexString);
        
        // Add to history if the user stops typing for 2 seconds
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
            History.add(newLatexString);
        }, 2000);
    });

    // 3. Connect the settings changes to trigger a re-render
    //    with the existing editor value.
    Settings.onChange(function(newState) {
        Renderer.render(Editor.getValue());
    });

    console.log("LATEXRENDER Initialized: Editor & Renderer linked.");
});
