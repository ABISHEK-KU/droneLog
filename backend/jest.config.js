module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/**/?(*.)+(spec|test).ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!node_modules/**',
    '!tests/**',
    '!**/*.d.ts',
  ],
  roots: ['<rootDir>'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
