const { BcSearch } = require('@rsksmart/rsk-contract-parser')
const { Nod3 } = require('@rsksmart/nod3')
const config = require('./config')
const { ExplorerList } = require('./explorer')
const debug = process.env.DEBUG

function createSearch (chainId) {
  const url = config.nodes[chainId]
  const nod3 = new Nod3(new Nod3.providers.HttpProvider(url), { debug })
  const search = BcSearch(nod3)
  return { url, nod3, search }
}

async function getBytecodeFromNode (address, chainId, blockNumber) {
  try {
    const { search, url } = createSearch(chainId)
    const { tx, internalTx, receipt } = await search.deploymentTx(address, { blockNumber })
      .catch(error => { throw new Error(`${error} (${url})`) })
    let contractAddress, code
    if (tx && receipt) {
      contractAddress = receipt.contractAddress
      code = tx.input
    }
    if (internalTx && internalTx.type && internalTx.type === 'create') {
      contractAddress = internalTx.result.address
      code = internalTx.action.init
    }
    return (contractAddress === address) ? code : undefined
  } catch (err) {
    return Promise.reject(err)
  }
}

async function getBytecodeFromExplorer (address, chainId) {
  try {
    const explorers = await ExplorerList(config)
    const explorer = explorers[chainId][0]
    const { data } = await explorer.getAddress(address)
    const { deployedCode } = data
    return deployedCode
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = { getBytecodeFromNode, getBytecodeFromExplorer }
