import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import pluginReactHooks from "eslint-plugin-react-hooks";
import nextjs from "@next/eslint-plugin-next";

export default defineConfig([
  // Base JavaScript configuration
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "prefer-template": "warn", // Will flag string concatenation
      "no-console": "warn", // Warn about console.log
      // "quotes": ["error", "single"], // Enforce single quotes
    }
  },
  // Environment globals
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025
      }
    }
  },
  // TypeScript support
  tseslint.configs.recommended,
  // React support
  pluginReact.configs.flat.recommended,
  // React-specific configuration
  {
    plugins: {
      react: pluginReact
    },
    rules: {
      "react/jsx-curly-brace-presence": ["error", "never"], // Throw error if curly braces are used unnecessarily
      "react/self-closing-comp": "error", // Throw error if JSX elements without children (so they don't need separate start and end tags) use start and end tags, as they should use self-closing tags, instead
    }
  },
  // React Hooks rules
  {
    plugins: {
      "react-hooks": pluginReactHooks
    },
    rules: pluginReactHooks.configs.recommended.rules
  },
  // Next.js specific rules
  {
    plugins: {
      "@next/next": nextjs
    },
    rules: {
      ...nextjs.configs.recommended.rules,
      "@next/next/no-img-element": "warn", // catches using <img> instead of <Image /> from next/image (performance improvement)
    }
  }
]);
