const path = require('node:path')

module.exports = {
  rootDir: path.resolve(__dirname),
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testMatch: ['<rootDir>/**/*.e2e.js'],
}
