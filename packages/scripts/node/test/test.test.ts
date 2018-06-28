import * as path from 'path';
import * as fs from 'fs-extra';
import {createFixture, exec, read, cleanFixtures} from './utils';

describe('tradie test', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  afterAll(() => cleanFixtures())

  it('should exit with a code of 0 when there are no errors', async () => {
    const fixtureDir = await createFixture('sum');
    const {code} = await exec('test', {cwd: fixtureDir});
    expect(code).toEqual(0);
  });

  it('should exit with a code of 1 when there are test errors', async () => {
    const fixtureDir = await createFixture('test-error');
    const {code, stdout, stderr} = await exec('test', {cwd: fixtureDir});
    expect(code).toEqual(1);
  });
});
