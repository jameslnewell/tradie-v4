import * as rollup from 'rollup';
import Reporter, {Message} from '@tradie/reporter-utils';
import CancelablePromise from '@jameslnewell/cancelable-promise';

export interface Options {
  watch?: boolean;
  input: rollup.InputOptions;
  output: rollup.OutputOptions;
  reporter: Reporter;
}

function isRollupError(error: any): error is rollup.RollupError {
  return typeof error.id === 'string';
}

function convertRollupErrorToMessage(error: rollup.RollupError): Message {
  return {
    type: 'error',
    file: error.loc && error.loc.file,
    text: `${error.message}\n${error.frame}`,
    startPosition: error.loc && ({
      line: error.loc.line,
      column: error.loc.column,
    }),
    trace: error.stack
  };
}

export default function(options: Options): CancelablePromise<void> {
  const {watch, input, output, reporter} = options;
  const onwarn = (warning: string | rollup.RollupWarning) => {
    reporter.log({
      type: 'warn',
      file: (warning as any).loc && (warning as any).loc.file,
      text: (typeof warning === 'string' ? warning : `${warning.message}\n${warning.frame}`) || '',
      startPosition: (warning as any).loc && ({
        line: (warning as any).loc.line,
        column: (warning as any).loc.column,
      }),
    });
  };
  return new CancelablePromise<void>((resolve) => {
    if (watch) {
      const watcher = rollup.watch([
        {
          ...input,
          output,
          onwarn
        }
      ]);
      watcher.on('event', event => {
        switch (event.code) {
          case 'START':
            reporter.started();
            break;
          case 'end':
            reporter.finished();
            break;
          case 'error':
            reporter.failed(event.error);
            break;
          case 'fatal':
            reporter.failed(event.error);
            break;
        }
      });
      return () => (watcher as any).close();
    } else {
      rollup.rollup({
        ...(input as any),
        onwarn
      }).then(
        (bundle) => bundle.write(output).then(() => resolve()),
      ).catch(error => {
        if (isRollupError(error)) {
          reporter.failed(convertRollupErrorToMessage(error));
          resolve();
        } else {
          reporter.failed(error);
          resolve()
        }
      });
      return () => {/* do nothing */}
    }
  });
}


