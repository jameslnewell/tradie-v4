export default function(isForATestFile) {
  return {
    extends: ['jameslnewell/es'],
    env: {node: true, jest: isForATestFile},
    rules: {
      'no-console': 1
    }
  };
}
