import { defineConfig } from "vite";

export default defineConfig({
    // Served from https://laska254.github.io/debug-me/, so every asset path is prefixed with the repository name.
    base: "/debug-me/",
    build: {
        // Three.js alone is ~530 kB minified (~135 kB gzipped); the real budget is checked in the polish issue.
        chunkSizeWarningLimit: 700,
    },
});
