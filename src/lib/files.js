const { writeFile, promises } = require('fs')
const { readdir, readFile } = promises
const { resolve } = require('path')

async function getFiles (dir) {
  dir = resolve(dir)
  const ds = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(ds.map((d) => {
    const res = resolve(dir, d.name)
    return d.isDirectory() ? getFiles(res) : res
  }))
  return Array.prototype.concat(...files)
}

async function getFile (file, jsonParse) {
  try {
    let content = await readFile(file)
    if (!content) throw new Error(`The file ${file} is empty`)
    content = content.toString()
    if (jsonParse) content = JSON.parse(content)
    return content
  } catch (err) {
    console.log(file, err)
    return Promise.reject(err)
  }
}

function saveFile (name, content) {
  return new Promise((resolve, reject) => {
    writeFile(name, content, (err, res) => {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

module.exports = { getFiles, getFile, saveFile }
