module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: `./tsconfig.json`
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': ['error', {
      'allowExpressions': true
    }],
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off'
  }
}
