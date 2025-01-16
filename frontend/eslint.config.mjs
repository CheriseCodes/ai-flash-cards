import eslint from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from "eslint-plugin-react";

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'babel.config.js'],
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...eslint.recommended,
      ...typescriptPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...typescriptPlugin.configs.recommended.rules,
       "@typescript-eslint/no-explicit-any": "off"
    },
  },
];
