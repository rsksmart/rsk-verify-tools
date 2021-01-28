const config = require('./config')
const axios = require('axios')
const fs = require('fs')
const log = require('./log')

function saveFile (name, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(name, content, (err, res) => {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

async function httpGet (url, payload) {
  try {
    let query = '?'
    for (const p in payload) {
      if (payload[p]) query += `${p}=${payload[p]}&`
    }
    const { data } = await axios.get(url + query)
    return data
  } catch (err) {
    log.error(err.error)
    return Promise.reject(err.error)
  }
}

async function getList (explorerUrl, next, result = []) {
  const module = 'contractVerifier'
  const action = 'getVerifiedContracts'
  const count = !next
  const { data, pages } = await httpGet(explorerUrl, { module, action, next, count })
  if (pages.total) log.info(`Contracts ${pages.total}`)
  result = result.concat(data)
  if (pages.next) return getList(explorerUrl, pages.next, result)
  result = [...new Set(result.map(v => v.address))]
  return result
}

function getContract (explorerUrl, address) {
  const module = 'contractVerifier'
  const action = 'isVerified'
  return httpGet(explorerUrl, { module, action, address })
}

function getAddress (explorerUrl, address) {
  const module = 'addresses'
  const action = 'getAddress'
  return httpGet(explorerUrl, { module, action, address })
}

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
  const { name, settings, version, source, imports, libraries, constructorArguments, bytecode } = contractData
  const dir = getContractsDir(net.id)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  const file = getContractName(address, net.id)
  const content = { address, net, name, settings, version, source, imports, libraries, constructorArguments, creationData, bytecode }
  log.info(`Saving ${file}`)
  await saveFile(file, JSON.stringify(content, null, 4))
}

async function getContracts (explorer) {
  try {
    const explorerUrl = `${explorer}/api`
    const explorerInfo = await httpGet(explorerUrl)
    const { net } = explorerInfo
    log.debug(JSON.stringify(explorerInfo, null, 2))
    const list = await getList(explorerUrl)
    log.info(`Contracts in list: ${list.length}`)
    for (const address of list) {
      if (!contractExists(address, net.id)) {
        const response = await getAddress(explorerUrl, address).catch(err => log.error(address, err))
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

module.exports = { getContracts, getContract, getList }
