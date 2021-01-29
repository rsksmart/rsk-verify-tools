const { httpGet } = require('./http')

const MODS = {
  verifier: 'contractVerifier',
  addresses: 'addresses'
}

function Explorer (explorerUrl) {
  const url = `${explorerUrl}/api`

  const get = (module, action, params) => httpGet(url, Object.assign(params, { module, action }))

  const getInfo = () => httpGet(url)

  const getContract = address => get(MODS.verifier, 'isVerified', { address })

  const getAddress = address => get(MODS.addresses, 'getAddress', { address })

  const getList = async (next, result = []) => {
    const count = !next
    const { data, pages } = await get(MODS.verifier, 'getVerifiedContracts', { next, count })
    result = result.concat(data)
    if (pages.next) return getList(pages.next, result)
    result = [...new Set(result.map(v => v.address))]
    return result
  }
  return Object.freeze({ url, get, getInfo, getContract, getAddress, getList })
}

async function getExplorersInfo (explorers) {
  return Promise.all([...explorers].map(url => Explorer(url).getInfo().then(info => Object.assign(info, { url }))))
}

module.exports = { Explorer, getExplorersInfo }
