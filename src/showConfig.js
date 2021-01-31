#!/usr/bin/env node
const config = require('./lib/config')
const prop = process.argv[2]
if (prop) {
  console.log(config[prop])
} else {
  console.log(JSON.stringify(config, null, 2))
}

process.exit(0)
