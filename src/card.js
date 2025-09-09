const fontList = require('font-list')
const fs = require('fs')
const sharp = require('sharp')
const fetch = require('node-fetch')
const path = require('path')
const generator = require('generate-password')
const {randomNumberRange, getSetting} = require('./core.js')

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getFonts() {
    return new Promise(async (resolve, reject) => {

        const fonts = await fontList.getFonts()

        resolve(fonts.map(font => {
            return font.replaceAll('"', '')
        }))

    })
}



function getRandomFace(des, server = 'sv1', sex = '') {
    return new Promise(async (resolve, reject) => {
        
        try {

            if (!sex) {
                sex = Math.floor(Math.random() * ['female', 'male'].length)
            }

            let url

            if (server === 'sv2') {
            
                const res = await fetch('https://100k-faces.glitch.me/random-image-url')
                const data = await res.json()

                url = data.url

            }

            if (server === 'sv1') {
            
                const res = await fetch('https://this-person-does-not-exist.com/new?gender='+sex+'&age=19-25&etnic=asian')
                const data = await res.json()

                url = 'https://this-person-does-not-exist.com'+data.src

            }


            if (url) {
                
                const res2 = await fetch(url)

                await fs.promises.writeFile(des, Buffer.from(await res2.arrayBuffer()))

                const image = await sharp(des)
                const metadata = await image.metadata()
                const width = metadata.width
                const height = metadata.height
                const rand = getRandom(5, 10)
                const finalWidth = Math.floor(width + (width * rand / 100))
                
                const notruoi = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKBAMAAAB/HNKOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAB5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtyhvagAAAAp0Uk5TAAVcyvPIfvn/9Xa219cAAAAvSURBVHicY2BUdgkSYBCr6GhPZFDv6OgoYrAAkq0MM4BkC5SMAItAZCEqGVWBugBXxhQnlKJs/wAAAABJRU5ErkJggg==', 'base64')

                const output = await sharp(des)
                                    .resize({width: finalWidth})
                                    .composite([{ 
                                        input: notruoi,
                                        top: Math.floor(getRandom((height/3), (height/2))),
                                        left: Math.floor(getRandom((width/3), (width/2)))
                                    }])
                                    .flop()
                                    .toBuffer()
                
                await fs.promises.writeFile(des, output)

                resolve()


            } else {
                reject()
            }
        } catch (err) {
            console.log(err)
            reject(err)
        }
        
    })
}

function getFace(width, height, server, sex = '') {
    
    return new Promise(async (resolve, reject) => {
        
        try {

            if (!sex) {
                sex = Math.floor(Math.random() * ['female', 'male'].length)
            }


            let url

            if (server === 'sv2') {
            
                const res = await fetch('https://100k-faces.glitch.me/random-image-url')
                const data = await res.json()

                url = data.url

            }

            if (server === 'sv1') {
            
                const res = await fetch('https://this-person-does-not-exist.com/new?gender='+sex+'&age=19-25&etnic=asian')
                const data = await res.json()

                url = 'https://this-person-does-not-exist.com'+data.src

            }

            if (url) {
                
                const res2 = await fetch(url)

                const buffer = Buffer.from(await res2.arrayBuffer())

                const notruoi = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKBAMAAAB/HNKOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAB5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtyhvagAAAAp0Uk5TAAVcyvPIfvn/9Xa219cAAAAvSURBVHicY2BUdgkSYBCr6GhPZFDv6OgoYrAAkq0MM4BkC5SMAItAZCEqGVWBugBXxhQnlKJs/wAAAABJRU5ErkJggg==', 'base64')

                const output = await sharp(buffer).composite([{ 
                    input: notruoi,
                    top: Math.floor(getRandom((height/3), (height/2))),
                    left: Math.floor(getRandom((width/3), (width/2)))
                }]).resize({width, height, fit: 'cover'}).flop().toBuffer()

                resolve(output)

            }
        } catch {
            
        }
    })
}

function taoPhoi(textData, template, dest, preview = false, server = 'sv1', json = false) {

    return new Promise(async (resolve, reject) => {

        const setting = await getSetting()
    
        try {

            let data 

            if (!json) {
    
                const file = await fs.promises.readFile(template)
                data = JSON.parse(file)

            } else {
                data = template
            }
        
            const buffer = Buffer.from(data.src.split(';base64,').pop(), 'base64')
        
            const image = await sharp(buffer)
        
            const elms = Object.keys(data.data) 
            
            const composite = []

            const face = await getFace(800, 800, server)
        
            for (let index = 0; index < elms.length; index++) {
                const elm = data.data[index].type
                const elmData = data.data[index]
        
                if (elm === 'seal') {
        
                    if (elmData.src.length) {
        
                        const seal = await sharp(Buffer.from(elmData.src.split(';base64,').pop(), 'base64')).resize({width: elmData.width, height: elmData.height}).toBuffer()

                        composite.push({ 
                            input: seal,
                            top: elmData.top,
                            left: elmData.left
                        })
        
                    }
        
                }
        
                if (elm === 'image') {

                    const avatar = await sharp(face).resize({width: elmData.width, height: elmData.height}).toBuffer()
        
                    composite.push({ 
                        input: avatar,
                        top: elmData.top,
                        left: elmData.left
                    })
                }

                if (elm === 'random') {
                    textData[elm] = generator.generate({
                        length: randomNumberRange(7, 9),
                        numbers: true,
                        uppercase: true,
                        lowercase: false,
                        symbols: false,
                    })
                }
        
                if (elm !== 'image' && elm !== 'seal' && textData[elm].length > 0) {
                    
                    elmData.family = elmData.family ? elmData.family.replaceAll('"', '') : ''
                    
                    const fontStyle = elmData.style === '700' ? 'font-weight="bold"' : ''
        
                    const textBuffer = Buffer.from(`
                        <svg>
                            <rect width="${elmData.width}" height="${elmData.height}" fill="rgb(0 0 0 / 0%)"></rect>
                            <text x="0%" y="50%" ${fontStyle} font-size="${elmData.size}px" font-family="${elmData.family}" text-anchor="start" fill="${elmData.color}">${textData[elm]}</text>
                        </svg>
                    `);
                    
        
                    composite.push({ 
                        input: textBuffer,
                        top: elmData.top,
                        left: elmData.left
                    })
        
                }
        
            }

            image.composite(composite)

            if (setting.general.chuyenAnhDenTrang.value) {

                image.greyscale()
                image.linear(1, 1)
                image.png({colors:2})

            }

            if (preview) { 

                const buffer = await image.toBuffer()

                resolve('data:image/png;base64,'+buffer.toString('base64'))

            } else {

                const temp = dest.replace('.png', '_tmp.png')
            
                await image.toFile(temp)

                const image2 = await sharp(temp)

                const imageData = await image2.metadata()
                const width = imageData.width

                const rand = Math.random() * (5 - 1) + 1;
                const finalWidth = Math.floor(width + (width * rand / 100))

                image2.resize({width: finalWidth})

                await image2.toFile(dest)

                fs.rmSync(temp)

                resolve()

            }

        } catch (err) {
            reject(err)
        }

    })

}

module.exports = {getFonts, getFace, getRandomFace, taoPhoi}