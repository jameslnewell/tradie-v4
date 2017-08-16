//@flow
import {formatLog, formatLogs} from './formatting';

const shortInfo = {
  level: 'info',
  message: 'Server started on http://localhost:3000',
  priority: 0
};
const longInfo = {
  level: 'info',
  message: 'Server started on http://localhost:3000\nblah blah blah',
  priority: 0
};
const longInfoWithFile = {
  level: 'info',
  message: 'Server started on http://localhost:3000\nblah blah blah',
  file: '/foo/bar.js',
  priority: 0
};

const shortWarn = {level: 'warn', message: 'That might not work!', priority: 0};
const longWarn = {
  level: 'warn',
  message: 'That might not work!\nblah blah blah',
  priority: 0
};
const longWarnWithFile = {
  level: 'warn',
  message: 'That might not work!\nblah blah blah',
  file: '/foo/bar.js',
  priority: 0
};

const shortError = {level: 'error', message: 'That did not work!', priority: 0};
const longError = {
  level: 'error',
  message: new Error('That did not work!').stack,
  priority: 0
};
const longErrorWithFile = {
  level: 'error',
  message: new Error('That did not work!').stack,
  file: '/foo/bar.js',
  priority: 0
};

describe('formatLog()', () => {
  it.skip('should render badge', () => {
    console.log(formatLog(shortInfo));
    console.log(formatLog(longInfo));
    console.log(formatLog(longInfoWithFile));

    console.log(formatLog(shortWarn));
    console.log(formatLog(longWarn));
    console.log(formatLog(longWarnWithFile));

    console.log(formatLog(shortError));
    console.log(formatLog(longError));
    console.log(formatLog(longErrorWithFile));
  });
});

describe('formatLogs()', () => {
  it.skip('should...', () => {
    const logs = [shortInfo, shortWarn, longErrorWithFile, shortError];
    console.log(formatLogs(logs));
  });
});
