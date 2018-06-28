import {groupMessagesByFileAndSortMessagesByStartPosition} from './groupMessagesByFileAndSortMessagesByStartPosition';

describe('groupMessagesByFileAndSortMessagesByStartPosition()', () => {

  it('should group messages by file', () => {
    const groupedAndSortedMessages = groupMessagesByFileAndSortMessagesByStartPosition([
      {
        type: 'error',
        file: './1',
        text: 'file #1'
      },
      {
        type: 'error',
        file: './2',
        text: 'file #2'
      },
      {
        type: 'error',
        text: 'no file'
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1'
      }
    ]);
    expect(groupedAndSortedMessages).toEqual([
      {
        type: 'error',
        text: 'no file'
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1'
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1'
      },
      {
        type: 'error',
        file: './2',
        text: 'file #2'
      },
    ]);
  });

  it('should sort messages by start position', () => {
    const groupedAndSortedMessages = groupMessagesByFileAndSortMessagesByStartPosition([
      {
        type: 'error',
        file: './1',
        text: 'file #1',
        startPosition: {
          line: 1,
          column: 5
        },
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1',
        startPosition: {
          line: 0,
          column: 5
        },
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1',
        startPosition: {
          line: 1,
          column: 4
        },
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1',
      }
    ]);
    expect(groupedAndSortedMessages).toEqual([
      {
        type: 'error',
        file: './1',
        text: 'file #1',
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1',
        startPosition: {
          line: 0,
          column: 5
        },
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1',
        startPosition: {
          line: 1,
          column: 4
        },
      },
      {
        type: 'error',
        file: './1',
        text: 'file #1',
        startPosition: {
          line: 1,
          column: 5
        },
      },
    ]);
  });

});
