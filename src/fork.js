
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

module.exports = (file) => {

    let cwd = path.join(__dirname, '..')

    const forked = cp.fork(file, [], {cwd})

    return forked

}

class Run {

    contac

}