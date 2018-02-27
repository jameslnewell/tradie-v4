/* eslint-disable import/no-commonjs */
module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: '2018',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true
    }
  },

  env: {
    es6: true
  },

  rules: {
    strict: 0
    // 'flowtype/define-flow-type': 'warn',
    // 'flowtype/require-valid-file-annotation': 'warn',
    // 'flowtype/use-flow-type': 'warn'
  },

  plugins: [
    // 'eslint-plugin-flowtype'
  ],

  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true
    }
  }
};
