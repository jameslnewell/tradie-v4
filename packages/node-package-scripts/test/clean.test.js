import path from 'path';
import fs from 'fs-extra';
import {fixture, mkdir, exists, exec} from './utils';

describe('tradie clean', () => {
  it('should exit with a code of 0 when successful', async () => {
    const {code} = await exec('clean', {cwd: fixture('sum')});
    expect(code).toEqual(0);
  });

  it('should remove the ./lib and ./coverage folders', async () => {
    const libDir = path.join(fixture('sum'), 'lib');
    const coverageDir = path.join(fixture('sum'), 'lib');
    await mkdir(libDir);
    await mkdir(coverageDir);
    await exec('clean', {cwd: fixture('sum')});
    expect(await exists(libDir)).toBeFalsy();
    expect(await exists(coverageDir)).toBeFalsy();
  });
});
