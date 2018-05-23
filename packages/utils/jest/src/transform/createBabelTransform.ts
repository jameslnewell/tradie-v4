import { transform } from 'babel-core';

export default function (options: {}) {
  return {
    process(sourceText: string, sourcePath: string, config: any) {
      const { code, map } = transform(
        sourceText,
        Object.assign({}, options, {
          filename: sourcePath,
          sourceRoot: config.rootDir,
          retainLines: true, //FIXME: column numbers aren't working and soure maps don't work without this
          sourceMaps: true
        })
      );
      return { code, map };
    }
  };
}
