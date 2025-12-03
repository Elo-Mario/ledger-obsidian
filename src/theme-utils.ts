/**
 * Detect if Obsidian is in dark mode by checking DOM class
 * @returns true if dark mode is active
 */
export function isDarkMode(): boolean {
    return document.body.classList.contains('theme-dark');
}

/**
 * Get chart colors dynamically based on current theme
 * IMPORTANT: Call this function every time you need colors, don't cache the result
 * @returns Object containing all theme-specific colors
 */
export function getChartColors() {
    const isDark = document.body.classList.contains('theme-dark');
    return {
        text: isDark ? '#eeeeee' : '#333333',      // Primary text color
        axis: isDark ? '#999999' : '#666666',      // Axis line color
        split: isDark ? '#444444' : '#e5e5e5',     // Split line / grid color
        bg: 'transparent',                          // Background (always transparent)
        muted: isDark ? '#aaaaaa' : '#888888',     // Muted/secondary text
    };
}

/**
 * Legacy compatibility functions
 */
export function getTextColor(): string {
    return getChartColors().text;
}

export function getAxisColor(): string {
    return getChartColors().axis;
}

export function getMutedTextColor(): string {
    return getChartColors().muted;
}

/**
 * Create a theme change observer that calls a callback when theme changes
 * @param callback Function to call when theme changes
 * @returns Cleanup function to disconnect the observer
 */
export function observeThemeChange(callback: () => void): () => void {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // Theme changed, trigger callback
                callback();
            }
        }
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
    });

    // Return cleanup function
    return () => observer.disconnect();
}
