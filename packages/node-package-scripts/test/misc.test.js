import fs from 'fs-extra';
import {fixture, exec} from './utils';

describe('tradie', () => {
  it('should exit with a code of 1 when called with no command', async () => {
    const {code} = await exec('', {cwd: fixture('sum')});
    expect(code).toEqual(1);
  });
});