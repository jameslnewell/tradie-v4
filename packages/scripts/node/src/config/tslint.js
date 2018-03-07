export function source() {
  return {
    extends: ['tslint:recommended', 'tslint-config-prettier']
  };
}

export function example() {
  return {
    ...source(),
    rules: {
      'no-console': false
    }
  };
}

export function test() {
  return source();
}
