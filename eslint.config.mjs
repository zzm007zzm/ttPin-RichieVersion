import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.vite/**',
      '**/coverage/**',
      '**/*.min.*',
      '**/src-tauri/target/**',
      '**/src-tauri/gen/**',
    ],
  },

  // Base JS rules (kept gentle so existing code doesn't start failing CI).
  {
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
    },
  },

  // TypeScript / TSX
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // Disable core rules that don't understand TS semantics.
      'no-undef': 'off',
      'no-unused-vars': 'off',

      // TS equivalents (warn only to avoid breaking the build right now).
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',

      // React hooks hygiene (keep deps as warn to avoid noisy failures).
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
