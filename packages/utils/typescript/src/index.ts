/* tslint:disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import flowgen from 'flowgen';
import * as ts from 'typescript';
import { mkdir } from '@tradie/file-utils';
import { Message } from '@tradie/reporter-utils';

const defaultCompilerOptions = {
  forceConsistentCasingInFileNames: true,
  noFallthroughCasesInSwitch: true,
  noImplicitAny: true,
  noImplicitReturns: true,
  noImplicitThis: true,
  sourceMap: true,
  strict: true
};

// tslint:disable-next-line no-empty-interface
export interface TranspilerOptions {
};

export default function (options: TranspilerOptions) {
  const files: { [name: string]: { version: number } } = {};
  const config = ts.parseJsonConfigFileContent(
    { compilerOptions: options },
    ts.sys,
    path.resolve(process.cwd())
  );
  // TODO: check and throw config errors
  const service = ts.createLanguageService(
    {
      getScriptFileNames: () => Object.keys(files),
      getScriptVersion: (file: string) => files[file] && files[file].version.toString(),
      getScriptSnapshot: (file: string) => {
        if (!fs.existsSync(file)) {
          return;
        }
        return ts.ScriptSnapshot.fromString(fs.readFileSync(file).toString());
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => ({ ...defaultCompilerOptions, ...config.options }),
      getDefaultLibFileName: () =>
        ts.getDefaultLibFilePath({ ...defaultCompilerOptions, ...config.options }),
      fileExists: ts.sys.fileExists,
      directoryExists: ts.sys.directoryExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      getDirectories: ts.sys.getDirectories
    },
    ts.createDocumentRegistry()
  );

  const getMessages = (file: string): Message[] => {
    const diagnostics = service
      .getCompilerOptionsDiagnostics() // TODO: only show these when the other two don't return anything?
      .concat(service.getSyntacticDiagnostics(file))
      .concat(service.getSemanticDiagnostics(file));

    return diagnostics.map((diagnostic): Message => {
      const description = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0);
        return {
          source: 'typescript',
          type:
            diagnostic.category === 1 ? 'error' : diagnostic.category === 0 ? 'warn' : 'info',
          file: diagnostic.file.fileName,
          startPosition: {
            line: line + 1,
            column: character + 1
          },
          text: description
        };
      } else {
        return {
          source: 'typescript',
          type:
            diagnostic.category === 1 ? 'error' : diagnostic.category === 0 ? 'warn' : 'info',
          text: description
        };
      }
    });
  };

  return async (file: string) => {
    // mark the file as updated so the language service updates the file
    if (files[file]) {
      ++files[file].version;
    } else {
      files[file] = { version: 0 };
    }

    const output = service.getEmitOutput(file);
    const messages = getMessages(file);

    if (!output.emitSkipped) {
      const writeFile = util.promisify(fs.writeFile);
      await Promise.all(
        output.outputFiles.map(async (outputFile: ts.OutputFile) => {
          await mkdir(path.dirname(outputFile.name));
          await writeFile(outputFile.name, outputFile.text)

          //TODO: make async
          // write the flow types
          if (outputFile.name.endsWith('.d.ts')) {
            const flowName = `${path.dirname(outputFile.name)}/${path.basename(outputFile.name, '.d.ts')}.js.flow`;
            const flowdef = flowgen.compiler.compileDefinitionString(outputFile.text);
            await writeFile(flowName, flowdef)
          }
        })
      );
    }

    return messages;
  };
}
