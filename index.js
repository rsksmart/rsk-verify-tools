const config = require('./lib/config')
const { getContracts } = require('./lib/getContracts')
const log = require('./lib/log')
const { log: cLog, line } = require('@rsksmart/rsk-js-cli')
const action = process.argv[2]
const actions = {
  GET: 'get',
  PUSH: 'push',
  PULL: 'pull',
  VERIFY: 'verify'
}

const aHelp = {
  GET: 'Gets all verified contract from explorers',
  PUSH: 'Push new verified contracts to remote repo',
  PULL: 'Gets all contracts from remote repo',
  VERIFY: 'Verify contract payload'
}

const isAction = name => {
  const action = Object.entries(actions).find(([k, a]) => a === name)
  return action ? action[0] : undefined
}

if (!isAction(action)) help()

run(action)
  .then(() => process.exit(0))
  .catch(err => {
    log.error(err)
    process.exit(9)
  })

async function run (action) {
  try {
    const { explorers } = config
    switch (action) {
      case actions.GET:
        for (const explorer of explorers) {
          log.info(`Getting data from: ${explorer}`)
          await getContracts(explorer)
        }
        break

      case actions.PULL:
        console.log(action)
        break

      case actions.PUSH:
        console.log(action)
        break

      case actions.VERIFY:
        console.log(action)
        break
    }
  } catch (err) {
    log.error(err)
    process.exit(9)
  }
}

function help () {
  const params = Object.values(actions)
  const max = Math.max(...params.map(p => p.length))
  console.log(max)
  cLog.info('Usage:')
  cLog.info(`${process.argv[0]} ${process.argv[1]} [ ${params.join(' | ')} ]`)
  console.log()
  for (const p of params) {
    const key = isAction(p)
    cLog.info(`${p}`)
    cLog.example(`${line(' ', max + 1)}${aHelp[key]}`)
    console.log()
  }
  process.exit(0)
}
