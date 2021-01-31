#!/usr/bin/env node
const config = require('./lib/config')
const { getAllContracts } = require('./lib/getContracts')
const log = require('./lib/log')

getAllContracts(config)
  .then(() => process.exit(0))
  .catch(err => {
    log.error(err)
    process.exit(9)
  })
