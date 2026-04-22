import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'build/**'] },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      // Classic hooks baseline; React Compiler rules (immutability, preserve-manual-memoization,
      // purity, etc.) are introduced by eslint-plugin-react-hooks v7 — deferred until the
      // codebase is TypeScript-native (Epic 2) and can be refactored safely.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // prop-types: TypeScript provides prop type-checking
      'react/prop-types': 'off',
      // Unescaped apostrophes/quotes in JSX are valid and render correctly
      'react/no-unescaped-entities': 'off',
    },
  },
  // TypeScript-specific rules for .ts/.tsx files
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ['src/**/*.{ts,tsx}'],
  })),
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Prefer explicit types on exported APIs but don't require them on every local
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // TS handles undefined-variable detection; base rule conflicts with TS types
      'no-unused-vars': 'off',
    },
  },
  prettier,
]
