const mock = jest.mock('fs-extra');
import * as fs from 'fs-extra';
import transpile from '.';

function run(src: string, dest: string) {
  return transpile(
    `${__dirname}/__fixtures__/${src}`,
    `${__dirname}/__fixtures__/${dest}`,
    {
      sourceMaps: true,
      presets: [require.resolve('@babel/preset-env')],
      plugins: [require.resolve('@babel/plugin-transform-typescript')]
    }
  );
}

describe('babel', () => {

  beforeEach(() => {
    mock.resetAllMocks();
  });

  it('should return no error messages and write a file to disk when transpilation succeeds', async () => {
    const messages = await run('sample.ts', 'sample.js');
    expect(messages).toHaveLength(0);
    expect(fs.writeFile).toBeCalledWith(
      expect.stringContaining('sample.js'),
      expect.stringContaining('function sum()')
    );
    expect(fs.writeFile).toBeCalledWith(expect.stringContaining('sample.js.map'), expect.stringContaining('{\"version\":3'));
  });

  it('should return an error message and not write to disk when transpilation fails', async () => {
    const messages = await run('syntax-error.ts', 'syntax-error.js');
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('$XY');
    expect(fs.writeFile).toHaveBeenCalledTimes(0)
  });

});
