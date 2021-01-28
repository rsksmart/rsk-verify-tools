const { name } = require('../package.json')

module.exports = {
  explorers: [
    'https://backend.explorer.rsk.co',
    'https://backend.explorer.testnet.rsk.co'
  ],
  nodes: {
    30: 'https://public-node.rsk.co',
    31: 'https://public-node.testnet.rsk.co'
  },
  repository: 'https://github.com/rsksmart/rsk-verified-contracts.git',
  log: {},
  out: `/tmp/${name}-out`
}
