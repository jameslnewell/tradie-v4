import * as ts from 'typescript';

export default function(options) {
  return {
    process(sourceText /*, sourcePath, config*/) {
      const result = ts.transpileModule(sourceText, {
        compilerOptions: {
          sourceMap: true,
          ...options
        }
      });
      return {code: result.outputText, map: result.sourceMapText};
    }
    // getCacheKey(
    //   fileData,
    //   filePath,
    //   jestConfigStr,
    //   transformOptions) {
    //   return String(Math.random() * 1000);
    // }
  };
}
