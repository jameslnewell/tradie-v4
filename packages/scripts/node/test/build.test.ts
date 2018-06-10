import * as path from 'path';
import * as fs from 'fs-extra';
import {createFixture, exec, read, cleanFixtures} from './utils';

describe('tradie build', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  afterAll(() => cleanFixtures())

  it('should exit with a code of 0 when there are no errors', async () => {
    const fixtureDir = await createFixture('sum');
    const {code, stdout, stderr} = await exec('build', {cwd: fixtureDir});
    expect(code).toEqual(0);
  });

  it('should transpile source when there are no errors', async () => {
    const fixtureDir = await createFixture('sum');
    const {code} = await exec('build', {cwd: fixtureDir});
    expect(code).toEqual(0);
    expect(await read(path.join(fixtureDir, 'lib/index.js'))).toMatchSnapshot();
  });

  it('should export types when there are no errors', async () => {
    const fixtureDir = await createFixture('sum');
    const {code} = await exec('build', {cwd: fixtureDir});
    expect(code).toEqual(0);
    expect(await read(path.join(fixtureDir, 'lib/index.d.ts'))).toMatchSnapshot();
    expect(await read(path.join(fixtureDir, 'lib/index.js.flow'))).toMatchSnapshot();
  });

  it('should copy other files', async () => {
    const fixtureDir = await createFixture('sum');
    const {code} = await exec('build', {cwd: fixtureDir});
    expect(code).toEqual(0);
    expect(await read(path.join(fixtureDir, 'lib/data.json'))).toMatchSnapshot();
  });

  it('should exit with a code of 1 when there are lint errors', async () => {
    const fixtureDir = await createFixture('lint-error');
    const {code} = await exec('build', {cwd: fixtureDir});
    expect(code).toEqual(1);
  });

  it('should exit with a code of 1 when there are syntax errors', async () => {
    const fixtureDir = await createFixture('syntax-error');
    const {code} = await exec('build', {cwd: fixtureDir});
    expect(code).toEqual(1);
  });

  it('should exit with a code of 1 when there are type errors', async () => {
    const fixtureDir = await createFixture('type-error');
    const {code} = await exec('build', {cwd: fixtureDir});
    expect(code).toEqual(1);
  });
});
