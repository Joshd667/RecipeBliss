// Shared helper utilities

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Untrusted string
 * @returns {string} - Escaped string safe for innerHTML
 */
export function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Get the display amount based on the user's metric preference
 * @param {Object} item - Item with `amount` and `amountMetric` properties
 * @param {boolean} useMetric - Whether metric is enabled
 * @returns {string} - The appropriate amount string
 */
export function getDisplayAmount(item, useMetric) {
    return useMetric ? item.amountMetric : item.amount;
}

/**
 * Set a safe background image on an element, handling both absolute and relative URLs
 * @param {HTMLElement} el - Target element
 * @param {string} imageUrl - Image URL or data URI
 * @param {string} [gradientOverlay] - Optional CSS gradient to layer on top
 */
export function setBackgroundImage(el, imageUrl, gradientOverlay) {
    if (!imageUrl) return;

    let isSafe = false;
    try {
        const url = new URL(imageUrl, window.location.href);
        if (['http:', 'https:', 'data:'].includes(url.protocol)) isSafe = true;
    } catch (_) {
        // Relative paths or data URIs that fail URL parsing
        if (
            imageUrl.startsWith('data:image/') ||
            imageUrl.startsWith('/') ||
            imageUrl.startsWith('./') ||
            !imageUrl.match(/^[a-zA-Z]+:/)
        ) {
            isSafe = true;
        }
    }

    if (!isSafe) return;

    const escaped = CSS.escape(imageUrl);
    el.style.backgroundImage = gradientOverlay
        ? `${gradientOverlay}, url("${escaped}")`
        : `url("${escaped}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
}
