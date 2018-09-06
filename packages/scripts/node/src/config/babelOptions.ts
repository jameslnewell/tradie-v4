
export default {
  babelrc: false,
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: true
        },
        useBuiltIns: 'usage',
        ignoreBrowserslistConfig: true
      }
    ],
    require.resolve('@babel/preset-typescript')
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-class-properties')
  ],
  sourceMaps: true
}
