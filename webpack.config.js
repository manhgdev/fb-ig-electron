const path = require('path')
const fs = require('fs')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BytenodeWebpackPlugin = require('bytenode-webpack-plugin')

function getFolder(dir) {

    const data = {}

    fs.readdirSync(dir).forEach(file => {
        const filename = path.basename(file, path.extname(file))
        data[filename] = dir+'/'+file
    })

    return data

}

module.exports = {
    entry: getFolder('./src'),
    plugins: [
        new CleanWebpackPlugin(),
        new BytenodeWebpackPlugin()
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
}
