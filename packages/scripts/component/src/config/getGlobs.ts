
export const getGlobs = () => ({
  FILES: 'src/**', // TODO: exclude *.ts and *.tsx
  SOURCES: 'src/**/*.{ts,tsx}', // TODO: exclude *.d.ts"
  TYPES: ['types/**/*.d.ts', 'typings/**/*.d.ts'],
  EXAMPLES: 'examples/**/*.{ts,tsx}',
  TESTS: '{src,test}/**/*.test.{ts,tsx}',
  MOCKS: '{src,test}/**/__mocks__/**/*.{ts,tsx}',
  FIXTURES: '{src,test}/**/__fixtures__/**/*'
});
