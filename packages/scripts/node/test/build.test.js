import path from 'path';
import fs from 'fs-extra';
import {fixture, exec, read} from './utils';

describe('tradie build', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  it('should exit with a code of 0 when there are no errors', async () => {
    const {code} = await exec('build', {cwd: fixture('sum')});
    expect(code).toEqual(0);
  });

  it('should transpile source when there are no errors', async () => {
    const {code} = await exec('build', {cwd: fixture('sum')});
    expect(code).toEqual(0);
    expect(await read(path.join(fixture('sum'), 'lib/index.js'))).toMatchSnapshot();
  });

  it('should export types when there are no errors', async () => {
    const {code} = await exec('build', {cwd: fixture('sum')});
    expect(code).toEqual(0);
    expect(await read(path.join(fixture('sum'), 'lib/index.js.flow'))).toMatchSnapshot();
  });

  it('should copy other files when there are no errors', async () => {
    const {code} = await exec('build', {cwd: fixture('sum')});
    expect(code).toEqual(0);
    expect(await read(path.join(fixture('sum'), 'lib/data.json'))).toMatchSnapshot();
  });

  it('should exit with a code of 1 when there are lint errors', async () => {
    const {code} = await exec('build', {cwd: fixture('lint-error')});
    expect(code).toEqual(1);
  });

  it('should exit with a code of 1 when there are syntax errors', async () => {
    const {code} = await exec('build', {cwd: fixture('syntax-error')});
    expect(code).toEqual(1);
  });

  it('should exit with a code of 1 when there are type errors', async () => {
    const {code} = await exec('build', {cwd: fixture('type-error')});
    expect(code).toEqual(1);
  });
});
