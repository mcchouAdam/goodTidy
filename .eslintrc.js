module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jquery: true,
  },
  extends: 'eslint:recommended',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // 'object-curly-newline': ['error', 'always'],
    // 'camelcase': 'off',
    // 'no-plusplus': 'off',
  },
};
