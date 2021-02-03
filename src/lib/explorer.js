const { httpGet, httpPost } = require('./http')

const MODS = {
  verifier: 'contractVerifier',
  addresses: 'addresses'
}

function Explorer (explorerUrl) {
  let info
  const url = `${explorerUrl}/api`

  const get = (module, action, params) => httpGet(url, Object.assign(params, { module, action }))

  const post = (module, action, params, options = {}) => httpPost(url, Object.assign(options, { module, action, params }))

  const getInfo = async () => {
    if (info) return info
    info = await httpGet(url)
    if (!info.net) throw new Error(`Cannot get info from ${url}`)
    return info
  }

  const getContract = address => get(MODS.verifier, 'isVerified', { address })

  const getAddress = address => get(MODS.addresses, 'getAddress', { address })

  const verifyContract = payload => {
    const { source, imports, libraries, constructorArguments, encodedConstructorArguments, address, settings, version, name } = payload
    const request = { address, settings, version, name, source, imports, libraries, constructorArguments, encodedConstructorArguments }
    return post(MODS.verifier, 'verify', { request }, { getDelayed: true })
  }

  const getVerificationResult = id => post(MODS.verifier, 'getVerificationResult', { id })

  const isVerified = address => post(MODS.verifier, 'isVerified', { address, fields: { address: 1, match: 1 } })
    .catch(() => false)

  const getList = async (next, result = []) => {
    const count = !next
    const { data, pages } = await get(MODS.verifier, 'getVerifiedContracts', { next, count })
    result = result.concat(data)
    if (pages.next) return getList(pages.next, result)
    result = [...new Set(result.map(v => v.address))]
    return result
  }
  return Object.freeze({ url, get, getInfo, getContract, getAddress, getList, verifyContract, isVerified, getVerificationResult })
}

async function ExplorerList ({ explorers: urls }) {
  const explorers = urls.map(url => Explorer(url))
  const info = await Promise.all(explorers.map(e => e.getInfo()))
  const list = info.map(({ net }) => net.id).reduce((v, a) => {
    v[a] = []
    return v
  }, {})
  for (const explorer of explorers) {
    const { net } = await explorer.getInfo()
    list[net.id].push(explorer)
  }
  return list
}

module.exports = { Explorer, ExplorerList }
