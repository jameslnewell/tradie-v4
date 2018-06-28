jest.mock('@tradie/file-utils');
jest.mock('@tradie/reporter-utils');

import processor from '.';
import Reporter, {Message} from '@tradie/reporter-utils';

describe('processor', () => {

  it('should call changed tasks when a file is listed', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{changed: [task]}],
      {reporter}
    );
    await processing;
    expect(task).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it.skip('should call changed tasks when a file is created', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{changed: [task]}],
      {reporter, isWatching: true}
    );
    await processing;
    expect(task).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it.skip('should call changed tasks when a file is updated', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{changed: [task]}],
      {reporter, isWatching: true}
    );
    await processing;
    expect(task).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it.skip('should call removed tasks when a file is removed', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{removed: [task]}],
      {reporter, isWatching: true}
    );
    await processing;
    expect(task).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it('should call changed for every single file listed when no include or exclude filter is provided', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{changed: [task]}],
      {reporter}
    );
    await processing;
    expect(task).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it('should call changed for files that match the provided include filter', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{
        include: '**/*.ts',
        changed: [task]
      }],
      {reporter}
    );
    await processing;
    expect(task).not.toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it('should call changed for files that do not match the provided exclude filter', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{
        exclude: '**/*.ts',
        changed: [task]
      }],
      {reporter}
    );
    await processing;
    expect(task).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).not.toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).not.toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it('should call changed for files that match the provided include filter but do not the provided exclude filter', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{
        include: '**/*.ts',
        exclude: '**/*.test.ts',
        changed: [task]
      }],
      {reporter}
    );
    await processing;
    expect(task).not.toHaveBeenCalledWith(expect.stringContaining('package.json'));
    expect(task).toHaveBeenCalledWith(expect.stringContaining('src/index.ts'));
    expect(task).not.toHaveBeenCalledWith(expect.stringContaining('src/index.test.ts'));
  });

  it('should report messages', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{
        changed: [() => Promise.resolve<Message[]>([
          {
            type: 'error',
            text: '😵'
          }
        ])]
      }],
      {reporter}
    );
    await processing;
    expect(reporter.log).toBeCalledWith([
      {
        type: 'error',
        text: '😵'
      }
    ]);
  });

  it('should report failures', async () => {
    const task = jest.fn();
    const reporter = new Reporter();
    const processing = processor(
      '.',
      [{
        changed: [() => Promise.reject(new Error('😵'))]
      }],
      {reporter}
    );
    await processing;
    expect(reporter.failed).toBeCalledWith(new Error('😵'));
  });

});
