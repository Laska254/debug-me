import { Color } from "three";

/**
 * Dark IDE neon palette shared by the scene and the HTML overlays.
 */
export const palette = {
    background: 0x1e1f22,
    text: 0xbcbec4,
    grid: 0x2b2d30,
    gridAccent: 0x3574f0,
    neon: 0x56d6c9,
};

/**
 * Sets every palette entry as a kebab-case CSS custom property, e.g. `gridAccent` -> `--grid-accent: #3574f0`.
 */
export function exposePaletteToCss(style = document.documentElement.style) {
    for (const [name, value] of Object.entries(palette)) {
        const property = `--${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
        style.setProperty(property, `#${new Color(value).getHexString()}`);
    }
}
