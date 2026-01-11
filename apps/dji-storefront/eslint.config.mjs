// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js"
import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import globals from "globals"

const baseRules = {
  ...js.configs.recommended.rules,
  ...tsPlugin.configs.recommended.rules,
  ...reactPlugin.configs.recommended.rules,
  ...reactPlugin.configs["jsx-runtime"].rules,
  ...reactHooksPlugin.configs.recommended.rules,
}

export default [{
  ignores: ["node_modules", ".next", "dist", "next-env.d.ts"],
}, {
  files: ["**/*.{js,jsx,ts,tsx}", "**/*.cjs"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
      project: false,
    },
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
      React: true,
    },
  },
  plugins: {
    "@typescript-eslint": tsPlugin,
    react: reactPlugin,
    "react-hooks": reactHooksPlugin,
  },
  settings: {
    react: { version: "detect" },
  },
    rules: {
      ...baseRules,
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@medusajs/ui",
            message: "Use the DJI storefront UI kit instead of medusa/ui components.",
          },
          {
            name: "@medusajs/icons",
            message: "Use lucide-react or DJI icons instead of medusa/icons.",
          },
        ],
      },
    ],
  },
}, ...storybook.configs["flat/recommended"]];
