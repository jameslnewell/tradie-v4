import * as path from 'path';
import { RawConfigFile } from "tslint/lib/configuration";

export function source(): RawConfigFile {
  return {
    extends: ['tslint:recommended', 'tslint-config-prettier'],
    rules: {
      'comment-format': false,
      'interface-name': false,
      'interface-over-type-literal': true, // enforcing this allows consuming devs to override and modify types as required
      'ordered-imports': false,
      'object-literal-sort-keys': false,
      'member-ordering': false,
      'member-access': [true, 'no-public'],
      'array-type': false,
      'variable-name': false,
      'unified-signatures': false,
      'mocha-avoid-only': true,
      'no-shadowed-variable': [true, {
        function: false
      }]
    },
    rulesDirectory: [
      path.dirname(require.resolve('tslint-microsoft-contrib'))
    ],
  };
}

export function example(): RawConfigFile {
  const config = source();
  return {
    ...config,
    rules: {
      ...config.rules,
      'no-console': false,
    }
  };
}

export function test(): RawConfigFile {
  return source();
}
