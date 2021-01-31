const { httpGet, httpPost } = require('./http')

const MODS = {
  verifier: 'contractVerifier',
  addresses: 'addresses'
}

function Explorer (explorerUrl) {
  let info
  const url = `${explorerUrl}/api`

  const get = (module, action, params) => httpGet(url, Object.assign(params, { module, action }))

  const post = payload => httpPost(url, payload)

  const getInfo = async () => {
    if (info) return info
    info = await httpGet(url)
    if (!info.net) throw new Error(`Cannot get info from ${url}`)
    return info
  }

  const getContract = address => get(MODS.verifier, 'isVerified', { address }).catch(() => false)

  const getAddress = address => get(MODS.addresses, 'getAddress', { address })

  const verifyContract = request => {
    return post({ module: MODS.verifier, action: 'verify', params: { request } })
  }

  const isVerified = getContract

  const getList = async (next, result = []) => {
    const count = !next
    const { data, pages } = await get(MODS.verifier, 'getVerifiedContracts', { next, count })
    result = result.concat(data)
    if (pages.next) return getList(pages.next, result)
    result = [...new Set(result.map(v => v.address))]
    return result
  }
  return Object.freeze({ url, get, getInfo, getContract, getAddress, getList, verifyContract, isVerified })
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
