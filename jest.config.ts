import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  testMatch: ['**/*.test.ts'],
  testTimeout: 15000,
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  moduleNameMapper: {
    '^otplib$': '<rootDir>/tests/__mocks__/otplib.ts',
    // Keeps tests off the real S3 bucket; CI has no AWS credentials.
    'services/fileStorageService$': '<rootDir>/tests/__mocks__/fileStorageService.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tests/tsconfig.json' }],
  },
};

export default config;