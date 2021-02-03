const { ExplorerList } = require('./explorer')
const { checkPayload } = require('./verifyContracts')
const { icons, reset } = require('@rsksmart/rsk-js-cli')

async function Publisher (config, { log }) {
  log = log || new Proxy({}, {
    get () { return () => { } }
  })
  try {
    const explorers = await ExplorerList(config)

    const waitForVerification = async (id, explorer, { started } = {}) => {
      const timeout = 90000
      try {
        if (!id) throw new Error('Missing verification id')
        started = started || Date.now()
        const elapsed = Date.now() - started
        if (elapsed > timeout) throw new Error('Timeout')
        const res = await explorer.getVerificationResult(id)
        if (res.data && res.data.result) {
          const { data } = res
          return { data, started }
        } else {
          return new Promise((resolve, reject) => {
            setTimeout(() => resolve(waitForVerification(id, explorer, { started })), 1000)
          })
        }
      } catch (err) {
        return Promise.reject(err)
      }
    }

    const publishContract = async payload => {
      try {
        const { net, address } = payload
        const netExplorers = explorers[net.id]
        if (!netExplorers || !netExplorers.length) throw new Error(`Missing explorers for net:${net.id}`)
        const results = []

        for (const explorer of netExplorers) {
          const { url } = explorer
          log.info(`${address}/${net.id} -> ${url}`)
          const { data } = await explorer.isVerified(address)
          const space = ' '.repeat(4)

          if (data && data.match) {
            const msg = `${space}[${address}/${net.id}] - it was already verified on ${explorer.url}`
            log.trace(msg)
            results.push({ net, address, url, msg, skipped: true })
          } else {
            const request = await explorer.verifyContract(payload)
            const id = request.data._id
            log.debug(`${space}Waiting for verification, ID: ${id}`)
            const { data, started } = await waitForVerification(id, explorer)
            if (!data) throw new Error('Missing verification result')
            const { match } = data
            const icon = (match) ? icons.ok : icons.error
            const st = (match) ? 'info' : 'warn'
            const e = (match) ? 'Done' : 'Verification Failed'
            const elapsed = Date.now() - started
            const seconds = Math.floor(elapsed / 1000)
            const msg = `${space}${e}: ${address}/${explorer.url} ${icon} ${seconds}s ${reset}`
            log[st](msg)
            results.push({ net, address, url, match, seconds, msg })
          }
        }
        return results
      } catch (err) {
        return Promise.reject(err)
      }
    }

    const publishFile = async file => {
      const payload = await checkPayload(file)
      return publishContract(payload)
    }

    return Object.freeze({ publishFile, publishContract })
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = { Publisher }
