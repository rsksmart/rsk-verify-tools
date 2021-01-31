const axios = require('axios')
const log = require('./log')

async function httpGet (url, payload) {
  try {
    let query = '?'
    for (const p in payload) {
      if (payload[p]) query += `${p}=${payload[p]}&`
    }
    const { data } = await axios.get(url + query)
    return data
  } catch (err) {
    log.debug(url, payload)
    return Promise.reject(err.error)
  }
}

async function httpPost (url, payload) {
  try {
    const { data } = await axios.post(url, payload)
    return data
  } catch (err) {
    log.error(err)
    return Promise.reject(err.error)
  }
}

module.exports = { httpGet, httpPost }
