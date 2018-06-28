import sum from '.';

describe('sum()', () => {
  it('should sum 1+1', () => {
    expect(sum(1, 1)).toEqual(2);
  });
});

