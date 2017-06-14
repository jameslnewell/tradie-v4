import {clear} from '.';

describe('clear()', () => {
  const originalProcess = process;

  beforeEach(() => {
    process = {
      env: {},
      stdout: {
        isTTY: true,
        write: jest.fn()
      },
    };
  });

  afterEach(() => {
    process = originalProcess;
  });

  it('should not clear the screen when CI=true ', () => {
    process.env.CI = true;
    clear();
    expect(process.stdout.write.mock.calls).toHaveLength(0);
  });

  it('should not clear the screen when isTTY=false ', () => {
    process.stdout.isTTY = false;
    clear();
    expect(process.stdout.write.mock.calls).toHaveLength(0);    
  });  

  it('should clear the screen when not CI=false and isTTY=true', () => {
    process.env.CI = false;
    process.stdout.isTTY = true;
    clear();
    expect(process.stdout.write.mock.calls).toHaveLength(2);
  });  

});
