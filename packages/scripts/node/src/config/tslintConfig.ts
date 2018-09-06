import * as config from '../../tslint.json';
import { RawConfigFile } from "tslint/lib/configuration";

export function source(): RawConfigFile {
  return config as any;
}

export function example(): RawConfigFile {
  const sourceConfig = source();
  return {
    ...sourceConfig,
    rules: {
      ...sourceConfig.rules,
      'no-console': false,
    }
  };
}

export function test(): RawConfigFile {
  return source();
}
