/**
 * @file jest.config.js
 * @module api
 * @description Jest config for apps/api unit tests; moduleNameMapper for @api/* path aliases.
 * @author BharatERP
 * @created 2025-03-13
 * Run: npx nx run api:test
 */
module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  rootDir: '.',
  moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^@api/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@api/shared$': '<rootDir>/src/shared',
    '^@api/common/(.*)$': '<rootDir>/src/common/$1',
    '^@api/common$': '<rootDir>/src/common',
    '^@api/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@api/modules$': '<rootDir>/src/modules',
    '^@api/app/(.*)$': '<rootDir>/src/app/$1',
    '^@api/app$': '<rootDir>/src/app',
    '^@api/database/(.*)$': '<rootDir>/src/database/$1',
    '^@api/database$': '<rootDir>/src/database',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.app.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts'],
  coverageDirectory: '../../coverage/apps/api',
  passWithNoTests: true,
};
