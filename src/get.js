#!/usr/bin/env node
const config = require('./lib/config')
const { getAllContracts } = require('./lib/getContracts')
const log = require('./lib/log')
const explorer = process.argv[2]
const explorers = explorer ? [explorer] : config.explorers

getAllContracts({ explorers })
  .then(() => process.exit(0))
  .catch(err => {
    log.error(err)
    process.exit(9)
  })
