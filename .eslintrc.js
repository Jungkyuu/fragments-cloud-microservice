/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    // Do not fail build on unused variables (just warn)
    'no-unused-vars': 'warn',

    // Allow up to 2 consecutive empty lines
    'no-multiple-empty-lines': ['warn', { max: 2 }],

    // Do not enforce operator linebreak style (e.g., || at start/end of line)
    'operator-linebreak': 'off',

    // Allow for-of and other restricted syntax
    'no-restricted-syntax': 'off',

    // Allow await inside loops
    'no-await-in-loop': 'off',

    // Allow console.log for debugging
    'no-console': 'off',

    // Do not complain about dev dependencies in imports
    'import/no-extraneous-dependencies': 'off',

    // Allow require() anywhere
    'global-require': 'off',

    // Allow identifiers starting with underscore
    'no-underscore-dangle': 'off',

    // Do not force all functions to always return a value
    'consistent-return': 'off',

    // Allow anonymous functions
    'func-names': 'off',

    // Allow ++ operator
    'no-plusplus': 'off',

    // ----------------------------------------------------------------
    // Extra rules disabled to satisfy current project code style
    // ----------------------------------------------------------------

    // Do not enforce import ordering or position (fixes @jest/globals issue)
    'import/order': 'off',
    'import/first': 'off',

    // Do not force object curly newlines (fixes "Expected a line break ..." in imports)
    'object-curly-newline': 'off',

    // Do not force const for variables that could be constant
    'prefer-const': 'off',

    // Ignore unexpected multiline warnings around line breaks
    'no-unexpected-multiline': 'off',

    'implicit-arrow-linebreak': 'off',
  },
};
