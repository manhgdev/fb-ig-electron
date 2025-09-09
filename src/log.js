const log = require('electron-log')
const {app} = require('electron')
const path = require('path')

log.transports.file.resolvePath  = () => path.resolve(app.getPath('userData'), 'main.log')

function logger(data) {

    if (app.isPackaged) {

        log.info(data)

    } else {

        console.log(data)

    }

}

module.exports = logger