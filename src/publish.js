const config = require('./lib/config')
const { Publisher } = require('./lib/publishContracts')
const { getArgs, log: cLog, argKey } = require('@rsksmart/rsk-js-cli')
const { existsSync, statSync } = require('fs')
const { getFiles } = require('./lib/files')
const log = require('./lib/log')
const options = {
  HELP: 'help',
  SILENT: 'silent'
}
const target = process.argv[2] || config.out
const args = getArgs(options, process.argv)

if (args.HELP || !existsSync(target)) help()

publish(target)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(9)
  })

async function publish (target) {
  try {
    const stats = statSync(target)
    const isFile = stats.isFile()
    const files = isFile ? [target] : await getFiles(target)
    const options = isFile ? { log: cLog } : { log }
    if (args.SILENT) options.log = undefined
    const publisher = await Publisher(config, options)
    for (const index in files) {
      const file = files[index]
      const info = `${parseInt(index) + 1}/${files.length} - ${file}`
      if (args.SILENT) cLog.info(info)
      else log.debug(info)
      const result = await publisher.publishFile(file)
      if (args.SILENT) {
        for (const { msg, match, skipped } of result) {
          const l = (skipped) ? 'trace' : (match) ? 'info' : 'error'
          cLog[l](msg)
        }
      }
    }
  } catch (err) {
    console.log('Error', err)
    return Promise.reject(err)
  }
}

function help () {
  console.log()
  cLog.label('Usage:')
  cLog.info(`${process.argv[0]} ${process.argv[1]} [<folder>|<file>] [${argKey(options.HELP)} ${argKey(options.SILENT)}]`)
  console.log()
  cLog.info('<folder>: Payload folder.')
  cLog.info('<file>: Payload file')
  cLog.info(`If no argument are passed it uses: ${config.out}`)
  process.exit(0)
}
