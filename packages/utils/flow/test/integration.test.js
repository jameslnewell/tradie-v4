import path from 'path';
import stripAnsi from 'strip-ansi';
import Flow from '../src';

const configuredDir = path.join(__dirname, '__fixtures__', 'configured');
const notConfiguredDir = path.join(__dirname, '__fixtures__', 'not-configured');

describe('integration', () => {
  afterEach(async () => {
    const flow1 = new Flow(configuredDir);
    await flow1.stop();
    const flow2 = new Flow(notConfiguredDir);
    await flow2.stop();
  });

  describe('.configured()', () => {
    it('should return true', async () => {
      const flow = new Flow(configuredDir);
      const isConfigured = await flow.configured();
      expect(isConfigured).toEqual(true);
    });

    it('should return false', async () => {
      const flow = new Flow(notConfiguredDir);
      const isConfigured = await flow.configured();
      expect(isConfigured).toEqual(false);
    });
  });

  describe('.annotated()', () => {
    it('should return true', async () => {
      const flow = new Flow(configuredDir);
      const isAnnotated = await flow.annotated(path.join(configuredDir, './is-annotated.js'));
      expect(isAnnotated).toEqual(true);
    });

    it('should return false', async () => {
      const flow = new Flow(configuredDir);
      const isAnnotated = await flow.annotated(path.join(configuredDir, './is-not-annotated.js'));
      expect(isAnnotated).toEqual(false);
    });
  });

  describe('.check()', () => {
    it('should return errors', async () => {
      const flow = new Flow(configuredDir);
      const result = await flow.status();
      result.errors.forEach(error => {
        expect(error.file).toEqual(
          '/Users/james/code/tradie/tradie-v4/packages/flow-utils/test/__fixtures__/configured/is-error.js'
        );
        expect(stripAnsi(error.message)).toEqual(
          `  3:26  export const a: number = 'string';\n                                 ^^^^^^^^ string. This type is incompatible with\n  3:17  export const a: number = 'string';\n                        ^^^^^^ number`
        );
      });
      expect(result.warnings).toEqual([]);
    });
  });
});
