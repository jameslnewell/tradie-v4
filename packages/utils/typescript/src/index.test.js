import * as path from 'path';
import transpiler from '.';

describe('Typescript', () => {
  describe('transpiler()', () => {
    it('should transpile', async () => {
      const transpile = transpiler({});
      const messages = await transpile(path.resolve('src/__fixtures__/Foo.ts'));
      console.log(messages);
    });
  });
});
