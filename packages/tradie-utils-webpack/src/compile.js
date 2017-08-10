import webpack from 'webpack';
import getWarningsAndErrors from './getWarningsAndErrors';

export type Result = {
  errors: {file?: string, message: string},
  warnings: {file?: string, message: string}
};

export default function(config): Promise<Result> {
  return new Promise((resolve, reject) => {
    if (!config) {
      resolve({
        errors: [],
        warnings: []
      });
    } else {
      webpack(config).run((error, stats) => {
        if (error) {
          reject(error);
        } else {
          const cwd = config.context;
          const json = stats.toJson();
          resolve(getWarningsAndErrors(cwd, json));
        }
      });
    }
  });
}
