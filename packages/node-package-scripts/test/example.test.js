import path from 'path';
import fs from 'fs-extra';
import {fixture, exec, read} from './utils';

describe('tradie test', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  it('should exit with a code of 0 when there are no errors', async () => {
    const {code, stdout, stderr} = await exec('example one-plus-one', {
      cwd: fixture('sum')
    });
    expect(code).toEqual(0);
    expect({stdout, stderr}).toMatchSnapshot();
  });
});
