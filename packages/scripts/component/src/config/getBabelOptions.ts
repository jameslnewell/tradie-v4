
export const getBabelOptions = () => ({
  cjs: {
    babelrc: false,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          ignoreBrowserslistConfig: true,
          modules: 'commonjs',
          targets: "> 0.25%, not dead",
          useBuiltIns: 'usage',
        }
      ],
      require.resolve('@babel/preset-typescript'),
      require.resolve('@babel/preset-react'),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      require.resolve('@babel/plugin-proposal-class-properties')
    ],
    sourceMaps: true
  },
  esm: {
    babelrc: false,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          ignoreBrowserslistConfig: true,
          modules: false,
          targets: "> 0.25%, not dead",
          useBuiltIns: 'usage'
        }
      ],
      require.resolve('@babel/preset-typescript'),
      require.resolve('@babel/preset-react'),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      require.resolve('@babel/plugin-proposal-class-properties')
    ],
    sourceMaps: true
  },
});
