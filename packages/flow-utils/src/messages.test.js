import stripAnsi from 'strip-ansi';
import {formatResult, formatError, formatMessage} from './messages';

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
  flowVersion: '0.53.1',
  errors: [
    {
      kind: 'infer',
      level: 'error',
      suppressions: [],
      message: [
        {
          context: ') => ReactClass<*>;',
          descr: 'identifier `ReactClass`',
          type: 'Blame',
          loc: {
            source:
              '/Users/james/code/tradie/tradie-v4/packages/react-component-example/flow-typed/npm/styled-components_v2.x.x.js',
            type: 'LibFile',
            start: {
              line: 15,
              column: 6,
              offset: 464
            },
            end: {
              line: 15,
              column: 18,
              offset: 477
            }
          },
          path:
            '/Users/james/code/tradie/tradie-v4/packages/react-component-example/flow-typed/npm/styled-components_v2.x.x.js',
          line: 15,
          endline: 15,
          start: 6,
          end: 18
        },
        {
          context: null,
          descr: 'Could not resolve name',
          type: 'Comment',
          path: '',
          line: 0,
          endline: 0,
          start: 1,
          end: 0
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
            'class Npm$StyledComponents$ThemeProvider extends React$Component {',
          descr: 'identifier `React$Component`',
          type: 'Blame',
          loc: {
            source:
              '/Users/james/code/tradie/tradie-v4/packages/react-component-example/flow-typed/npm/styled-components_v2.x.x.js',
            type: 'LibFile',
            start: {
              line: 27,
              column: 50,
              offset: 838
            },
            end: {
              line: 27,
              column: 64,
              offset: 853
            }
          },
          path:
            '/Users/james/code/tradie/tradie-v4/packages/react-component-example/flow-typed/npm/styled-components_v2.x.x.js',
          line: 27,
          endline: 27,
          start: 50,
          end: 64
        },
        {
          context: null,
          descr: 'Too few type arguments. Expected at least 1',
          type: 'Comment',
          path: '',
          line: 0,
          endline: 0,
          start: 1,
          end: 0
        },
        {
          context: 'declare class React$Component<Props, State = void> {',
          descr: 'See type parameters of definition here',
          type: 'Blame',
          loc: {
            source: '/private/tmp/flow/flowlib_369ecc23/react.js',
            type: 'LibFile',
            start: {
              line: 29,
              column: 31,
              offset: 744
            },
            end: {
              line: 29,
              column: 42,
              offset: 756
            }
          },
          path: '/private/tmp/flow/flowlib_369ecc23/react.js',
          line: 29,
          endline: 29,
          start: 31,
          end: 42
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
            'class Npm$StyledComponents$StyleSheetManager extends React$Component {',
          descr: 'identifier `React$Component`',
          type: 'Blame',
          loc: {
            source:
              '/Users/james/code/tradie/tradie-v4/packages/react-component-example/flow-typed/npm/styled-components_v2.x.x.js',
            type: 'LibFile',
            start: {
              line: 35,
              column: 54,
              offset: 1036
            },
            end: {
              line: 35,
              column: 68,
              offset: 1051
            }
          },
          path:
            '/Users/james/code/tradie/tradie-v4/packages/react-component-example/flow-typed/npm/styled-components_v2.x.x.js',
          line: 35,
          endline: 35,
          start: 54,
          end: 68
        },
        {
          context: null,
          descr: 'Too few type arguments. Expected at least 1',
          type: 'Comment',
          path: '',
          line: 0,
          endline: 0,
          start: 1,
          end: 0
        },
        {
          context: 'declare class React$Component<Props, State = void> {',
          descr: 'See type parameters of definition here',
          type: 'Blame',
          loc: {
            source: '/private/tmp/flow/flowlib_369ecc23/react.js',
            type: 'LibFile',
            start: {
              line: 29,
              column: 31,
              offset: 744
            },
            end: {
              line: 29,
              column: 42,
              offset: 756
            }
          },
          path: '/private/tmp/flow/flowlib_369ecc23/react.js',
          line: 29,
          endline: 29,
          start: 31,
          end: 42
        }
      ]
    }
  ],
  passed: false
};

describe('messages', () => {
  it('should', () => {
    const errorsByFile = formatResult('/foo/bar', result);
    Object.keys(errorsByFile).forEach(
      file =>
        console.log(file) ||
        errorsByFile[file].forEach(error => console.log(error))
    );
  });
});

// describe('messages', () => {
//   describe('format()', () => {
//     it('should format the message like #1', () => {
//       const error = formatError('/foo/bar', result.errors[0]);

//       expect(error).toMatchObject({
//         file: '/foo/bar/src/index.js',
//         line: 5,
//         column: 7
//       });

//       expect(stripAnsi(error.message)).toMatch(
//         ` 5:7   debug(8);
//               ^ number. This type is incompatible with the expected param type of
//   3:22  export default (msg: string): void => console.log(msg); //eslint-disable-line no-console
//                              ^^^^^^ string. See: src/debug.js:3`
//       );
//     });

//     it('should format the message like #2', () => {
//       const error = formatError('/foo/bar', result.errors[1]);

//       expect(error).toMatchObject({
//         file: '/foo/bar/src/index.test.js',
//         line: 52,
//         column: 35
//       });

//       expect(stripAnsi(error.message)).toMatch(
//         ` 52:35        return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);
//                                           ^^^^^^^^ property \`resolves\`. Property not found in
//  52:14        return expect(files.list()).resolves.toEqual(['/foo/bar/src/index.js']);
//                      ^^^^^^^^^^^^^^^^^^^^ object type`
//       );
//     });
//   });

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
// });
