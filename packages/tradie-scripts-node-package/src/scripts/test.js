import runJest from 'tradie-utils-jest';

export default function({jest}) {
  //TODO: do linting and type checking of tests
  return runJest(jest);
}
