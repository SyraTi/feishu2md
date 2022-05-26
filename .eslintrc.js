module.exports = {
  'env': {
    browser: true,
    es2021: true,
    node: true,
  },
  'extends': [
    'airbnb-base',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'import/extensions': 'off',
    'max-len': 'off',
    'semi': ['error', 'never'],
    'quote-props': ['error', 'consistent'],
  },
  'overrides': [
    {
      'files': ['*.ts'],
      'rules': {
        'no-undef': 'off',
      },
    },
    {
      'files': ['*.d.ts'],
      'rules': {
        'no-unused-vars': 'off',
      },
    },
  ],
}
