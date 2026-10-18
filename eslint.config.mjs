import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import cypress from 'eslint-plugin-cypress';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores([
    'node_modules/**',
    'cypress/screenshots/**',
    'cypress/videos/**',
    'cypress/downloads/**',
    'cypress/reports/**',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ['cypress/**/*.ts'],
    extends: [cypress.configs.recommended],
    rules: {
      // Cypress commands extend the framework's global Chainable interface.
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    },
  },
  {
    files: ['cypress/e2e/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name=/^(it|describe|context|specify)$/][callee.property.name=/^(only|skip)$/]",
          message: 'Remove .only/.skip before committing; use --spec to select tests locally.',
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name=/^(it|describe|context|specify)$/][callee.property.value=/^(only|skip)$/]",
          message: 'Remove computed .only/.skip calls before committing.',
        },
        {
          selector:
            'CallExpression[callee.name=/^(xit|xdescribe|xcontext|xspecify|fit|fdescribe)$/]',
          message: 'Disabled tests must not be committed.',
        },
        {
          selector: 'CallExpression[callee.name=/^(it|specify)$/][arguments.length<2]',
          message: 'Tests must have an implementation; pending tests must not be committed.',
        },
      ],
    },
  },
  prettier,
]);
