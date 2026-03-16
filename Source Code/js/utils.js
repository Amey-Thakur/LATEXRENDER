// utils.js
// Shared helper functions used across the application.
// These are small, general-purpose utilities that don't belong
// to any specific module.


// Debounce
// Delays the execution of a function until a specified amount of time
// has passed since the last call. This is useful for preventing
// expensive operations (like rendering) from firing on every keystroke.

function debounce(func, delay) {
    let timer = null;

    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(function () {
            func.apply(this, args);
            timer = null;
        }, delay);
    };
}


// Generate Download
// Creates a temporary anchor element and triggers a file download
// in the browser. The blob is released from memory after the
// download starts.

function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();

    // Small delay before cleanup to make sure the download begins
    setTimeout(function () {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, 100);
}


// Sanitize Filename
// Removes characters that are not safe for filenames across
// different operating systems.

function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*]/g, "_").trim() || "equation";
}
