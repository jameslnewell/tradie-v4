class AsyncAssetPlugin {
  apply(compiler) {
    compiler.plugin('compilation', compilation => {

      const publicPath = compilation.outputOptions.publicPath;

      compiler.plugin('done', stats => {
        const json = stats.toJson();

        let asyncChunks = json.chunks
            .filter(chunk => !chunk.initial)//TODO: exclude /\.hot-update\.js$/
            .map(chunk => chunk.files)
          ;

        asyncChunks = asyncChunks.concat.apply([], asyncChunks)
          .map(asyncChunk => `${publicPath}${asyncChunk}`)
        ;

        fs.writeFileSync(path.join(dest, 'async-scripts.json'), JSON.stringify(asyncChunks));

      });
    });
  }
}