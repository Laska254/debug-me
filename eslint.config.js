import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.js"],
        extends: [js.configs.recommended, prettier],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.browser,
        },
    },
    {
        files: ["*.config.js"],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
