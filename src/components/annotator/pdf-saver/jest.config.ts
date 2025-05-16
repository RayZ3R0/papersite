import type { Config } from 'jest';

const config: Config = {
  displayName: 'PDF Saver Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    './__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json'
      }
    ]
  },
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/build/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/setup.ts'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};

export default config;