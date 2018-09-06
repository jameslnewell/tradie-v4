import sum from '.';

describe('sum()', () => {
  it.only('should sum 1+1', () => {
    expect(sum(1, 1)).toEqual(2);
  });
});
