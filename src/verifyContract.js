const { verify } = require('./lib/verify')
const { log: cLog } = require('@rsksmart/rsk-js-cli')
const config = require('./lib/config')
const file = process.argv[2]
const fileIndex = process.argv[3] || ''
const files = process.argv[4]

if (!file) help()

verify(file, { config, fileIndex, files })
  .then(verification => {
    const { error, tryThis, msg } = verification
    console.log(msg)
    if (error) {
      cLog.error(error)
      if (tryThis) {
        cLog.info('Try adding some of these parameters:')
        console.log(JSON.stringify(tryThis, null, 2))
      }
    }
    process.exit(error ? 9 : 0)
  })
  .catch(err => {
    cLog.error(err)
    process.exit(9)
  })

function help () {
  console.log()
  cLog.info('Usage:')
  cLog.info(`${process.argv[0]} ${process.argv[1]} <payload path>`)
  process.exit(0)
}
