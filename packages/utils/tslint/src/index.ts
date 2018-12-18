import * as fs from 'fs';
import { Linter, Configuration } from 'tslint';
import { Message } from '@tradie/reporter-utils';

export function readConfigFile(configFilePath: string): Configuration.RawConfigFile {
  return Configuration.readConfigurationFile(configFilePath);
}

export default function (configOrConfigFilePath: string | Configuration.RawConfigFile) {
  let config: Configuration.IConfigurationFile;
  if (typeof configOrConfigFilePath === 'string') {
    config = Configuration.loadConfigurationFromPath(configOrConfigFilePath);
  } else {
    config = Configuration.parseConfigFile(
      configOrConfigFilePath,
      process.cwd(),
      Configuration.readConfigurationFile
    );
  }
  const linter = new Linter({
    fix: false,
    formatter: 'json'
  });
  let prevFailureCount = 0;
  return async (file: string): Promise<Message[]> => {
    linter.lint(file, fs.readFileSync(file, 'utf8'), config);
    const result = linter.getResult();
    const messages = result.failures.slice(prevFailureCount).map((failure): Message => {
      return {
        source: 'tslint',
        type: failure.getRuleSeverity() === 'error' ? 'error' : 'warn',
        file: failure.getFileName(),
        startPosition: {
          line: failure.getStartPosition().getLineAndCharacter().line + 1,
          column: failure.getStartPosition().getLineAndCharacter().character + 1
        },
        endPosition: {
          line: failure.getEndPosition().getLineAndCharacter().line + 1,
          column: failure.getEndPosition().getLineAndCharacter().character + 1
        },
        text: `${failure.getRuleName()}: ${failure.getFailure()}`
      };
    }); //.filter(message => message.file === file)
    prevFailureCount = result.failures.length;
    return messages;
  };
}
