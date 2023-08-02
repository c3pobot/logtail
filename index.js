'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level;
log.setLevel(logLevel);
process.on('unhandledRejection', (error) => {
  log.error(error)
});
global.baseDir = __dirname;
require('./src')
