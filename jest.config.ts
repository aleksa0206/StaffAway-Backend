import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  testMatch: ['**/*.test.ts'],
  testTimeout: 15000,
  moduleNameMapper: {
    '^otplib$': '<rootDir>/tests/__mocks__/otplib.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tests/tsconfig.json' }],
  },
};

export default config;