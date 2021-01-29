const config = require('./config')
const fs = require('fs')
const { saveFile } = require('./files')
const log = require('./log')
const { Explorer } = require('./explorer')

function getContractsDir (chainId) {
  return `${config.out}/${chainId}`
}

function getContractName (address, chainId) {
  return `${getContractsDir(chainId)}/${address}.json`
}

function contractExists (address, chainId) {
  return fs.existsSync(getContractName(address, chainId))
}

async function saveContract (address, contractData, { net }, creationData) {
  const { name, settings, version, source, imports, libraries, constructorArguments, encodedConstructorArguments } = contractData
  const dir = getContractsDir(net.id)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  const file = getContractName(address, net.id)
  const content = { address, net, name, settings, version, source, imports, libraries, constructorArguments, encodedConstructorArguments, creationData }
  log.info(`Saving ${file}`)
  await saveFile(file, JSON.stringify(content, null, 4))
}

async function getContracts (url) {
  try {
    const explorer = Explorer(url)
    const explorerInfo = await explorer.getInfo()
    const { net } = explorerInfo
    log.debug(JSON.stringify(explorerInfo, null, 2))
    const list = await explorer.getList()
    log.info(`Contracts in list: ${list.length}`)
    for (const address of list) {
      if (!contractExists(address, net.id)) {
        const response = await explorer.getAddress(address).catch(err => log.error(address, err))
        if (!response) throw new Error(`Empty response for ${address}`)
        const { data: content } = response
        const { verification, destroyedByTx } = content
        let { hash, transactionHash, blockHash, blockNumber, timestamp } = content.createdByTx
        transactionHash = transactionHash || hash
        if (verification && verification.match) {
          await saveContract(address, verification.request, explorerInfo, { blockHash, blockNumber, transactionHash, timestamp })
        } else {
          if (!destroyedByTx) {
            log.warn(`Missing verification ${address}`)
          } else {
            log.info(`Contract: ${address} self-destructed`)
            log.debug(JSON.stringify(destroyedByTx, null, 2))
          }
        }
      } else {
        log.info(`The ${address} was skipped`)
      }
    }
  } catch (err) {
    log.error(err)
  }
}

module.exports = { getContracts }
