/* tslint:disable no-console */
import { formatMessages } from './formatting';
import { Message } from '.';

const shortInfo: Message = {
  type: 'info',
  text: 'Server started on http://localhost:3000',
};
const longInfo: Message = {
  type: 'info',
  text: 'Server started on http://localhost:3000\nblah blah blah',
};
const longInfoWithFile: Message = {
  type: 'info',
  text: 'Server started on http://localhost:3000\nblah blah blah',
  file: '/foo/bar.js',
};

const shortWarn: Message = {
  type: 'warn',
  text: 'That might not work!',
};
const longWarn: Message = {
  type: 'warn',
  text: 'That might not work!\nblah blah blah',
};
const longWarnWithFile: Message = {
  type: 'warn',
  text: 'That might not work!\nblah blah blah',
  file: '/foo/bar.js',
};

const error = new Error('That did not work!');
const shortError: Message = {
  type: 'error',
  text: error.message,
};
const longError: Message = {
  type: 'error',
  text: error.message,
  trace: error.stack
};
const longErrorWithFile: Message = {
  type: 'error',
  text: error.message,
  trace: error.stack,
  file: '/foo/bar.js',
};

describe('formatLogs()', () => {
  it('should...', () => {
    const logs: Message[] = [shortInfo, longInfo, longInfoWithFile, shortWarn, longWarn, longWarnWithFile, shortError, longError, longErrorWithFile];
    console.log(formatMessages(logs));
  });
});
