import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['generated/**', 'node_modules/**', 'public/**'],
  },
  ...compat.config({
    env: {
      commonjs: false,
      es6: true,
      node: true,
    },
    extends: ['prettier', 'eslint:recommended', 'plugin:n/recommended'],
    plugins: ['prettier'],
    parserOptions: {
      ecmaVersion: 2020,
    },
    rules: {
      'prettier/prettier': 'error',
      'n/exports-style': ['error', 'module.exports'],
      'n/file-extension-in-import': ['error', 'always'],
      'n/prefer-global/buffer': ['error', 'always'],
      'n/prefer-global/console': ['error', 'always'],
      'n/prefer-global/process': ['error', 'always'],
      'n/prefer-global/url-search-params': ['error', 'always'],
      'n/prefer-global/url': ['error', 'always'],
      'n/prefer-promises/dns': 'error',
      'n/prefer-promises/fs': 'error',
      'no-useless-assignment': 'off',
    },
    overrides: [
      {
        files: ['**/*.ts'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
        },
        plugins: ['@typescript-eslint'],
        extends: ['plugin:@typescript-eslint/recommended'],
        rules: {
          'n/no-unsupported-features/es-syntax': 'off',
          'n/no-missing-import': 'off',
          'n/no-unpublished-import': 'off',
          'n/file-extension-in-import': 'off',
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/no-unused-vars': [
            'warn',
            {
              argsIgnorePattern: '^_',
              varsIgnorePattern: '^_',
            },
          ],
        },
      },
    ],
  }),
];
