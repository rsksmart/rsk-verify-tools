const Logger = require('./Logger')
const config = require('./config')
const { name } = require('../../package.json')
const log = Logger(name, config.log)
module.exports = log
