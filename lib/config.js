const defaultConfig = require('./defaultConfig')
const path = require('path')
const fs = require('fs')

const config = Object.assign(defaultConfig, loadConfig())
if (!Array.isArray(config.explorers)) config.explorers = [config.explorers]
createDirs(config)

function loadConfig () {
  let config = {}
  try {
    const file = path.resolve(__dirname, '../../config.json')
    if (fs.existsSync(file)) config = JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    console.log(err)
    process.exit(8)
  }
  return config
}

function createDirs (config) {
  const { log } = config
  if (!fs.existsSync(config.out)) fs.mkdirSync(config.out)
  if (log.file) {
    const dir = path.dirname(log.file)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
}

module.exports = config
