// eslint.config.js
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['*.ts'],
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      quotes: ['error', 'single'],
      indent: ['error', 2],
      '@typescript-eslint/no-explicit-any': 'off',
      'max-len': ['error', { code: 120 }],
    },
  },
  {
    files: ['*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
