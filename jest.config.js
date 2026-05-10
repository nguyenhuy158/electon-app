module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/domain/**/*.ts', 'src/application/use-cases/**/*.ts'],
  coveragePathIgnorePatterns: [
    'src/application/use-cases/AuthUseCase.ts',
    'src/domain/i18n/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      functions: 100,
      lines: 100,
    },
  },
};
