import {min} from './index';

describe('min()', () => {
  it('single version', () => {
    expect(min('^3')).toEqual('3.0.0');
  });

  it('multiple versions with a logical-or', () => {
    expect(min('^3 || ^4')).toEqual('3.0.0');
  });

  it.skip('multiple versions with a logical-or', () => {
    expect(min('<5')).toEqual('4.0.0');
  });
});
