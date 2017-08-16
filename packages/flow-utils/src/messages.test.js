import stripAnsi from 'strip-ansi';
import {format} from './messages';

// src/index.js:5
//   5: debug(8);
//            ^ number. This type is incompatible with the expected param type of //bold
//   3: export default (msg: string): void => console.log(msg); //eslint-disable-line no-console
//                           ^^^^^^ string. See: src/debug.js:3 //bold

// ../@tradie/file-utils/src/index.test.js:52
//  52:       return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);
//                                        ^^^^^^^^ property `resolves`. Property not found in //bold
//  52:       return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);
//                   ^^^^^^^^^^^^^^^^^^^^ object type //bold

const result = {
  flowVersion: '0.48.0',
  errors: [
    {
      kind: 'infer',
      level: 'error',
      suppressions: [],
      message: [
        {
          context: 'debug(8);',
          descr: 'number',
          type: 'Blame',
          loc: {
            source: '/foo/bar/src/index.js',
            type: 'SourceFile',
            start: {
              line: 5,
              column: 7,
              offset: 67
            },
            end: {
              line: 5,
              column: 7,
              offset: 68
            }
          },
          path: '/foo/bar/src/index.js',
          line: 5,
          endline: 5,
          start: 7,
          end: 7
        },
        {
          context: null,
          descr: 'This type is incompatible with the expected param type of',
          type: 'Comment',
          path: '',
          line: 0,
          endline: 0,
          start: 1,
          end: 0
        },
        {
          context:
            'export default (msg: string): void => console.log(msg); //eslint-disable-line no-console',
          descr: 'string',
          type: 'Blame',
          loc: {
            source: '/foo/bar/src/debug.js',
            type: 'SourceFile',
            start: {
              line: 3,
              column: 22,
              offset: 31
            },
            end: {
              line: 3,
              column: 27,
              offset: 37
            }
          },
          path: '/foo/bar/src/debug.js',
          line: 3,
          endline: 3,
          start: 22,
          end: 27
        }
      ]
    },
    {
      kind: 'infer',
      level: 'error',
      suppressions: [],
      message: [
        {
          context:
            "      return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);",
          descr: 'property `resolves`',
          type: 'Blame',
          loc: {
            source: '/foo/bar/src/index.test.js',
            type: 'SourceFile',
            start: {
              line: 52,
              column: 35,
              offset: 1779
            },
            end: {
              line: 52,
              column: 42,
              offset: 1787
            }
          },
          path: '/foo/bar/src/index.test.js',
          line: 52,
          endline: 52,
          start: 35,
          end: 42
        },
        {
          context: null,
          descr: 'Property not found in',
          type: 'Comment',
          path: '',
          line: 0,
          endline: 0,
          start: 1,
          end: 0
        },
        {
          context:
            "      return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);",
          descr: 'object type',
          type: 'Blame',
          loc: {
            source: '/foo/bar/src/index.test.js',
            type: 'SourceFile',
            start: {
              line: 52,
              column: 14,
              offset: 1758
            },
            end: {
              line: 52,
              column: 33,
              offset: 1778
            }
          },
          path: '/foo/bar/src/index.test.js',
          line: 52,
          endline: 52,
          start: 14,
          end: 33
        }
      ]
    }
  ],
  passed: false
};

describe('messages', () => {
  describe('format()', () => {
    it('should format the message like #1', () => {
      const error = format('/foo/bar', result.errors[0]);

      expect(error).toMatchObject({
        file: '/foo/bar/src/index.js',
        line: 5,
        column: 7
      });

      expect(stripAnsi(error.message)).toMatch(
        ` 5:7   debug(8);
              ^ number. This type is incompatible with the expected param type of
  3:22  export default (msg: string): void => console.log(msg); //eslint-disable-line no-console
                             ^^^^^^ string. See: src/debug.js:3`
      );
    });

    it('should format the message like #2', () => {
      const error = format('/foo/bar', result.errors[1]);

      expect(error).toMatchObject({
        file: '/foo/bar/src/index.test.js',
        line: 52,
        column: 35
      });

      expect(stripAnsi(error.message)).toMatch(
        ` 52:35        return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);
                                          ^^^^^^^^ property \`resolves\`. Property not found in
 52:14        return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);
                     ^^^^^^^^^^^^^^^^^^^^ object type`
      );
    });
  });

  /*

//see https://github.com/facebook/flow/blob/master/src/common/errors/errors.ml
//see https://github.com/facebook/flow/blob/f10f8fa92a3081ec6c7a28877310fdcbabbfd89e/tsrc/flowResult.js

{
  "kind":"infer",
  "level":"error",
  "suppressions":[

  ],
  "message":[
    {
        "context":"  [path: string]: File",
        "descr":"property `contents` of object type",
        "type":"Blame",
        "loc":{
          "source":"/Users/james/code/tradie/tradie-v4/packages/@tradie/generator-utils/src/types.js",
          "type":"SourceFile",
          "start":{
              "line":8,
              "column":19,
              "offset":95
          },
          "end":{
              "line":8,
              "column":22,
              "offset":99
          }
        },
        "path":"/Users/james/code/tradie/tradie-v4/packages/@tradie/generator-utils/src/types.js",
        "line":8,
        "endline":8,
        "start":19,
        "end":22
    },
    {
        "context":null,
        "descr":"Property not found in",
        "type":"Comment",
        "path":"",
        "line":0,
        "endline":0,
        "start":1,
        "end":0
    },
    {
        "context":"    list(): string[] {",
        "descr":"function",
        "type":"Blame",
        "loc":{
          "source":"/Users/james/code/tradie/tradie-v4/packages/@tradie/generator-utils/src/vfs.js",
          "type":"SourceFile",
          "start":{
              "line":19,
              "column":9,
              "offset":357
          },
          "end":{
              "line":21,
              "column":5,
              "offset":410
          }
        },
        "path":"/Users/james/code/tradie/tradie-v4/packages/@tradie/generator-utils/src/vfs.js",
        "line":19,
        "endline":21,
        "start":9,
        "end":5
    }
  ]
},

src/types.js:8
  8:   [path: string]: File
                       ^^^^ property `contents` of object type. Property not found in
             v-------------
 19:     list(): string[] {
 20:       return Object.keys(files);
 21:     },
         ^ function. See: src/vfs.js:19
*/
});
