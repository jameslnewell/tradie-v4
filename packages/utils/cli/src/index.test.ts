import { clear } from '.';

describe('clear()', () => {
  const originalProcess = process;

  beforeEach(() => {
    process.env = {};
    process.stdout.isTTY = true;
    process.stdout.write = jest.fn();
  });

  afterEach(() => {
    process = originalProcess;
  });

  it('should not clear the screen when running on CI', () => {
    process.env.CI = '1';
    clear();
    expect(process.stdout.write).toHaveBeenCalledTimes(0);
  });

  it('should not clear the screen when not running on a text terminal ', () => {
    process.stdout.isTTY = undefined;
    clear();
    expect(process.stdout.write).toHaveBeenCalledTimes(0);
  });

  it('should clear the screen when not running on CI and is running on a text terminal', () => {
    process.env.CI = undefined;
    process.stdout.isTTY = true;
    clear();
    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });
});
