#!/usr/bin/env node
const { cacheSolc } = require('@rsksmart/rsk-contract-verifier')
const config = require('./lib/config')
const log = require('./lib/log')
const releasesOnly = !!process.argv[2]

cacheSolc(config, { log, releasesOnly }).then(() => {
  log.info('Done!')
  process.exit(0)
}).catch(err => {
  log.error(err)
  process.exit(9)
})
