import * as tsconfig from '../../tsconfig.json';

export function sources() {
  return {
    ...tsconfig,
    compilerOptions: {
      ...tsconfig.compilerOptions,
      emitDeclarationOnly: true
    }
  };
}

export function tests() {
  return {
    ...tsconfig,
    compilerOptions: {
      ...tsconfig.compilerOptions,
      noEmit: true
    }
  };
}
