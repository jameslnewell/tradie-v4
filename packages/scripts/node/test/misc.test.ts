import * as fs from 'fs-extra';
import {createFixture, exec, cleanFixtures} from './utils';

describe('tradie', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  afterAll(() => cleanFixtures())

  it('should exit with a code of 1 when called with no command', async () => {
    const fixtureDir = await createFixture('sum');
    const {code} = await exec('', {cwd: fixtureDir});
    expect(code).toEqual(1);
  });
});
