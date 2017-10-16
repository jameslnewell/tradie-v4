import fs from 'fs-extra';
import {fixture, exec} from './utils';

describe('tradie lint', () => {
  it('should exit with a code of 0 when there are no linting errors', async () => {
    const {code} = await exec('lint', {cwd: fixture('sum')});
    expect(code).toEqual(0);
  });

  it('should exit with a code of 1 when there are linting errors', async () => {
    const {code} = await exec('lint', {cwd: fixture('lint-error')});
    expect(code).toEqual(1);
  });
});
