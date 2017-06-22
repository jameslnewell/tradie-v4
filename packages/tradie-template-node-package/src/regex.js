//match files i.e. `**/*.{js,jsx}`
export const REGEX_FILES = /\.jsx?$/i;

//match mock and test files i.e. `**/__mocks__/**` and `**/*.test.{js,jsx}`
export const REGEX_TEST_FILES = /(\/__mocks__\/|\.test\.jsx?$)/i;
