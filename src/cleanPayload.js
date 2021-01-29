const { getFile, saveFile } = require('./lib/files')
const { log: cLog } = require('@rsksmart/rsk-js-cli')

const file = process.argv[2]
if (!file) help()
clean(file).then(() => process.exit(0))

async function clean (file) {
  try {
    let content = await getFile(file)
    content = JSON.parse(content)
    const { address, net, name, settings, version, source, imports, libraries, creationData, constructorArguments, encodedConstructorArguments } = content
    let newContent = { address, net, name, settings, version, source, imports, libraries, creationData, constructorArguments, encodedConstructorArguments }
    newContent = JSON.stringify(newContent, null, 2)
    await saveFile(file, newContent)
  } catch (err) {
    cLog(err)
    process.exit(9)
  }
}

function help () {
  console.log()
  cLog.info('Usage:')
  cLog.info(`${process.argv[0]} ${process.argv[1]} <payload path>`)
  process.exit(0)
}
