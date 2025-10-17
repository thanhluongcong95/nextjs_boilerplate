import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  collectCoverageFrom: [
    '!src/**/index.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/types/**',
    '!src/**/constants/**',
    '!src/**/mocks/**',
    '!src/**/config/**',
    '!src/test-utils/**',
    '!src/**/atoms/**',
  ],

  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },

  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/cypress/'],
  transformIgnorePatterns: ['node_modules/(?!(axios|uuid|lodash-es)/)'],
  coverageDirectory: '<rootDir>/coverage',
};

export default createJestConfig(customJestConfig);
