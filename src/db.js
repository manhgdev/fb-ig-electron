const {app} = require('electron')
const path = require('path')
const fs = require('fs-extra')

class Db {

    constructor(collection) {

        const dataFolder = path.resolve(app.getPath('userData'), './Data')
        const collectionFolder = path.resolve(dataFolder, collection)

        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder)
        }

        if (!fs.existsSync(collectionFolder)) {
            fs.mkdirSync(collectionFolder)
        }

        this.path = collectionFolder

    }

    get(displayPath = false) { return new Promise(async (resolve, reject) => {

        try {
            const files = await fs.promises.readdir(this.path)
            const data = []
            
            for (let index = 0; index < files.length; index++) {

                const file = path.resolve(this.path, files[index])

                try {
            
                    if (file.includes('.json')) {

                        const json = JSON.parse(await fs.promises.readFile(file, {encoding: 'utf-8'}))

                        if (displayPath) {
                            json.path = file
                        }

                        data.push(json)

                    }

                } catch {}
                
            }


            resolve(data.sort((a, b) => a.id - b.id))

        } catch (err) {
            reject(err)
        }

    })}

    findById(id) { return new Promise(async (resolve, reject) => {

        try {
            const file = path.resolve(this.path, id+'.json')
            const data = JSON.parse(await fs.promises.readFile(file, {encoding: 'utf-8'}))

            resolve(data)

        } catch (err) {
            reject(err)
        }

    })}

    find(func) { return new Promise(async (resolve, reject) => {

        try {

            const data = await this.get()

            resolve(data.filter(func))

        } catch (err) {
            reject(err)
        }

    })}

    findOne(func) { return new Promise(async (resolve, reject) => {
        
        try {

            const data = await this.find(func)

            if (data[0]) {
                resolve(data[0])
            } else {
                reject()
            }

        } catch (err) {
            reject(err)
        }

    })}

    findRandom(func) { return new Promise(async (resolve, reject) => {
        
        try {

            const data = await this.find(func)
            
            const random = data[Math.floor(Math.random() * data.length)]

            if (random.id) {
                resolve(random)
            } else {
                reject()
            }

        } catch (err) {
            reject(err)
        }

    })}

    insert(data) { return new Promise(async (resolve, reject) => {

        try {

            let records = []

            if (Array.isArray(data)) {
                records = data
            } else {
                records = [data]
            }

            for (let index = 0; index < records.length; index++) {
                
                const item = records[index]
                const file = path.resolve(this.path, item.id+'.json')

                if (!fs.existsSync(file)) {
                    await fs.promises.writeFile(file, JSON.stringify(item))
                }
                
            }

            resolve()

        } catch (err) {
            reject(err)
        }

    })}

    update(id, data) { return new Promise(async (resolve, reject) => {
        
        try {

            const rawData = await this.findById(id)
            const file = path.resolve(this.path, id+'.json')

            const keys = Object.keys(data)

            for (let index = 0; index < keys.length; index++) {
                
                const key = keys[index]

                //if (typeof rawData[key] !== undefined) {
                    rawData[key] = data[key]
                //}
                
            }

            await fs.promises.writeFile(file, JSON.stringify(rawData))

            resolve(rawData)


        } catch (err) {
            reject(err)
        }

    })}

    delete(id) { return new Promise(async (resolve, reject) => {
        
        try {

            const file = path.resolve(this.path, id+'.json')

            await fs.promises.unlink(file)

            resolve()

        } catch (err) {
            reject(err)
        }

    })}

    clear() { return new Promise(async (resolve, reject) => {

        try {

            await fs.remove(this.path)

            resolve()

        } catch (err) {
            reject(err)
        }

    })}

    empty() { return new Promise(async (resolve, reject) => {

        try {

            await fs.emptyDir(this.path)

            resolve()

        } catch (err) {
            reject(err)
        }

    })}

}

module.exports = Db