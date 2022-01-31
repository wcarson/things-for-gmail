module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  ignorePatterns: ['node_modules', 'dist'],
  rules: {
    'prettier/prettier': 'error',
    'no-undef': 'off',
    'no-unused-vars': 'error',
    'no-var': 'error'
  }
};
