module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleDirectories: ['node_modules', 'src'],
  rootDir: '.',
  testRegex: '.*\\.test\\.(t|j)s$',
  transform: {
    '^.+\\.(t|j)s$': '@swc/jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  globalSetup: './test/jest.setup.ts',
  globalTeardown: './test/jest.teardown.ts',
  setupFilesAfterEnv: ['./test/jest.setupAfterEnv.ts'],
};
