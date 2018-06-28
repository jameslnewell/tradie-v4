import * as path from 'path';
import * as fs from 'fs-extra';
import {createFixture, mkdir, exists, exec, cleanFixtures} from './utils';

describe('tradie clean', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  afterAll(() => cleanFixtures())

  it('should exit with a code of 0 when successful', async () => {
    const fixtureDir = await createFixture('sum');
    const {code} = await exec('clean', {cwd: fixtureDir});
    expect(code).toEqual(0);
  });

  it('should remove the ./lib and ./coverage folders', async () => {
    const fixtureDir = await createFixture('sum');
    const libDir = path.join(fixtureDir, 'lib');
    const coverageDir = path.join(fixtureDir, 'coverage');
    await mkdir(libDir);
    await mkdir(coverageDir);
    await exec('clean', {cwd: fixtureDir});
    expect(await exists(libDir)).toBeFalsy();
    expect(await exists(coverageDir)).toBeFalsy();
  });
});
