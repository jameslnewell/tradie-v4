const baseOptions = {
  babelrc: false,
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: true // TODO: should we make this configurable? based on engines but default to latest LTS?
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
};

export const getBabelOptions = () => ({
  sources: baseOptions,
  examples: baseOptions,
  tests: baseOptions
});
