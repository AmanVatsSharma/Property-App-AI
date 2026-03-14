/**
 * @file jest.preset.js
 * @description Minimal Jest preset for e2e and other Nx Jest projects; referenced by apps/api-e2e.
 */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
