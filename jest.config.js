module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/config/**',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'clover'],
  verbose: true,
  // Setup files run before setupFilesAfterEnv
  // This ensures AppDataSource is mocked before any modules are imported
  setupFiles: ['<rootDir>/src/__tests__/mock-data-source.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000,
  // Set NODE_ENV to 'test' for all tests
  globals: {
    'process.env.NODE_ENV': 'test',
  },
  // Execute tests serially to avoid database race conditions
  // When tests share the same database, parallel execution causes conflicts
  maxWorkers: 1,
};

