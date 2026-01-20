import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      ...reactHooks.configs['recommended-latest'].rules,
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // 린트 제외
  {
    ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', '**/*.mjs'],
  },
  prettierConfig,
);
