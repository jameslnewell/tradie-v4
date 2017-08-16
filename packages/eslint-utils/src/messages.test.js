import chalk from 'chalk';
import {getErrors} from './messages';

const report = {
  results: [
    {
      filePath:
        '/Users/james/code/tradie/packages/@tradie/eslint-utils/src/index.js',
      messages: [
        {
          ruleId: 'import/no-commonjs',
          severity: 2,
          message: 'Expected "import" instead of "require()"',
          line: 2,
          column: 14,
          nodeType: 'Identifier',
          source: "const path = require('path');"
        },
        {
          ruleId: 'no-undef',
          severity: 2,
          message: "'message' is not defined.",
          line: 13,
          column: 23,
          nodeType: 'Identifier',
          source: '        chalk.bold(`${message.line}:${message.column}`),'
        }
      ],
      errorCount: 11,
      warningCount: 0,
      fixableErrorCount: 1,
      fixableWarningCount: 0,
      source:
        "const fs = require('fs');\nconst path = require('path');\nconst CLIEngine = require('eslint').CLIEngine;\n\nvar a = 1*3;\n\nconsole.log('test')\n\nclass Linter {\n\n  constructor(src, config = {}) {\n    this.src = src;\n    this.engine = new CLIEngine({\n      cwd: this.src,\n      ignore: false,\n      useEslintrc: false,\n      baseConfig: config\n    });\n  }\n\n  lint(file) {\n    return new Promise((resolve, reject) => {\n      fs.readFile(path.join(this.src, file), (readError, text) => {\n        if (readError) {\n          reject(readError);\n          return;\n        } else {}\n        const report = this.engine.executeOnText(text.toString(), file);\n        console.log(file, report);\n        resolve(report);\n      });\n    });\n  }\n\n}\n\nmodule.exports = Linter;"
    }
  ],
  errorCount: 11,
  warningCount: 0,
  fixableErrorCount: 1,
  fixableWarningCount: 0
};

describe('getErrors()', () => {
  it('should be formatted', () => {
    const line1 = ` ${chalk.bold(
      '2:14'
    )}  import/no-commonjs  Expected \"import\" instead of \"require()\"`;
    const line2 = `${chalk.bold(
      '13:23'
    )}  no-undef            \'message\' is not defined.`;

    expect(getErrors(report)).toEqual({
      '/Users/james/code/tradie/packages/@tradie/eslint-utils/src/index.js': `${line1}\n${line2}`
    });
  });
});
