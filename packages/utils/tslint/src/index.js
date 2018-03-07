import * as fs from 'fs';
import {Linter, Configuration} from 'tslint';
import {type Message} from '@tradie/reporter-utils';

export default function(options: Object) {
  const config = Configuration.parseConfigFile(
    options,
    process.cwd(),
    Configuration.readConfigurationFile
  );
  const linter = new Linter({
    fix: false,
    formatter: 'json'
  });
  let prevFailureCount = 0;
  return async (file: string): Message[] => {
    linter.lint(file, fs.readFileSync(file, 'utf8'), config);
    const result = linter.getResult();
    const messages = result.failures.slice(prevFailureCount).map(failure => {
      return {
        source: 'tslint',
        type: failure.ruleSeverity === 'error' ? 'error' : 'warning',
        file: failure.fileName,
        startPosition: {
          line: failure.startPosition.getLineAndCharacter().line + 1,
          column: failure.startPosition.getLineAndCharacter().character + 1
        },
        endPosition: {
          line: failure.endPosition.getLineAndCharacter().line + 1,
          column: failure.endPosition.getLineAndCharacter().character + 1
        },
        text: `${failure.ruleName}: ${failure.failure}`
      };
    }); //.filter(message => message.file === file)
    prevFailureCount = result.failures.length;
    return messages;
  };
}
