const {BrowserWindow, app, dialog, ipcMain, shell} = require('electron')
const path = require('path')
const fs = require('fs-extra')
const moment = require('moment')
const gotTheLock = app.requestSingleInstanceLock()
const generator = require('generate-password')
const {machineId} = require('node-machine-id')

const {
    delayTimeout, 
    getSetting, 
    checkImap, 
    checkHacked, 
    getBackupLink, 
    saveSetting, 
    useProxy,
    checkLicense, 
    checkRef, 
    cleanTemp, 
    createCsv, 
    readCsv, 
    formatAdData, 
    getPrices, 
    randomPersion,
    getMProxy,
    checkAdsEmail,
    getPhoneCodeTemplate,
    getPhoneTemplate
} = require('./src/core.js')

const {getFonts, taoPhoi} = require('./src/card.js')
const Bm = require('./src/bm.js')
const run = require('./src/run.js')
const runAd = require('./src/runAd.js')
const runInsta = require('./src/runInsta.js')
const runApi = require('./src/runApi.js')

const si = require('systeminformation')
const kill = require('tree-kill')
const stringify = require('csv-stringify')
const { autoUpdater } = require('electron-updater')
const fetch = require('node-fetch')
const Db = require('./src/db.js')
const log = require('./src/log.js')
const IG = require('./src/insta.js')
const createInstagram = require('./src/createInsta.js')

const { Client, LocalAuth } = require('whatsapp-web.js')
const { v4: uuidv4 } = require('uuid')
const QRCode = require('qrcode')

const promiseLimit = require('promise-limit')
const { version } = require('os')
 
autoUpdater.autoDownload = false
autoUpdater.autoRunAppAfterInstall = true

process.setMaxListeners(0)
process.on('uncaughtException', e => { console.log(e) })


let updateWindow
let checkoutWindow
let mainWindow
let cardWindow
let previewPhoiWindow
let adManagerWindow
let instagramWindow

async function createCheckingWindow() {

    updateWindow = new BrowserWindow({
        width: 300,
        height: 300,
        resizable: false,
        transparent: true,
        frame: false,
        icon: path.join(__dirname, '/fbaio.ico'),
        webPreferences: {
            sandbox: false,
            devTools: !app.isPackaged,
            preload: path.join(__dirname, './preload.js'),
        }
    })

    updateWindow.setMenuBarVisibility(false)

    updateWindow.loadFile(path.join(__dirname, './template/checking.html'))

}

async function createMainWindow() {

    const license = await checkLicense()

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 700,
        minWidth: 1280,
        minHeight: 700,
        frame: false,
        icon: path.join(__dirname, '/fbaio.ico'),
        webPreferences: {
            sandbox: false,
            devTools: !app.isPackaged,
            preload: path.join(__dirname, './preload.js'),
        }
    })

    mainWindow.loadFile(path.join(__dirname, './template/index.html'))

    mainWindow.webContents.once('dom-ready', async () => {

        mainWindow.webContents.send('loadTitle', `[TOOLFB.VN] Facebook All In One v${app.getVersion()} - HSD: ${license.dayLeft}`)

        const releaseNode = await fs.promises.readFile(path.resolve(__dirname, './note.txt'), {encoding: 'utf-8'})

        mainWindow.webContents.send('checkVersion', {
            ver: app.getVersion(),
            note: releaseNode,
            key: license.key,
            exp: license.exp,
            soVip: license.soVip
        })

    })

    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('maximized')
    })

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('unmaximized')
    })

}

async function createCheckoutWindow(license) {

    const prices = await getPrices()

    checkoutWindow = new BrowserWindow({
        width: 550,
        height: 700,
        resizable: false,
        frame: false,
        icon: path.join(__dirname, '/fbaio.ico'),
        webPreferences: {
            sandbox: false,
            preload: path.join(__dirname, './preload.js'),
        }
    })

    checkoutWindow.setMenuBarVisibility(false)

    checkoutWindow.loadFile(path.join(__dirname, './template/checkout.html'))

    checkoutWindow.webContents.once('dom-ready', async () => {

        checkoutWindow.webContents.send('licenseData', license)
        checkoutWindow.webContents.send('loadPrices', prices)

    })

}



async function createWindow() {

    const logFolder = path.resolve(app.getPath('userData'), 'logs')
    const cardFolder = path.resolve(app.getPath('userData'), 'card')
    const phoiFolder = path.resolve(app.getPath('userData'), 'phoi')
    const faceFolder = path.resolve(app.getPath('userData'), 'face')
    const imageFolder = path.resolve(app.getPath('userData'), 'instaImage')
    const profileFolder = path.resolve(app.getPath('userData'), 'profile')
    const avatarFolder = path.resolve(app.getPath('userData'), 'avatar')

    try {

        const res = await fetch('https://gateway.smit.vn/public/usd-ratio-exchange')

        const data = await res.json()

        if (data.success) {

            await fs.promises.writeFile(path.resolve(app.getPath('userData'), 'rates.json'), JSON.stringify(data.rates), {
                encoding: 'utf-8'
            })
        }

    } catch (err) {
        console.log(err)
    }

    if (!fs.existsSync(path.resolve(app.getPath('userData'), 'toolfb.png'))) {
        fs.copyFileSync(path.resolve(__dirname, 'public/img/logo.png'), path.resolve(app.getPath('userData'), 'toolfb.png'))
    }

    if (!fs.existsSync(imageFolder)) {
        fs.mkdirSync(imageFolder)

        const data = await fs.promises.readdir(imageFolder) || []

        const defaultFolder = path.resolve(__dirname, './data/image')
        const defaultData = await fs.promises.readdir(defaultFolder) || []

        for (let index = 0; index < defaultData.length; index++) {
            if (!data.includes(defaultData[index])) {
                const src = path.resolve(defaultFolder, defaultData[index])
                const des = path.resolve(imageFolder, defaultData[index])
                
                await fs.promises.copyFile(src, des)
            }
        }
    }

    if (!fs.existsSync(faceFolder)) {
        fs.mkdirSync(faceFolder)
    }

    if (!fs.existsSync(avatarFolder)) {
        fs.mkdirSync(avatarFolder)
    }
    
    if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder)
    }

    if (!fs.existsSync(cardFolder)) {
        fs.mkdirSync(cardFolder)
    }

    if (!fs.existsSync(phoiFolder)) {
        fs.mkdirSync(phoiFolder)
    }

    if (!fs.existsSync(profileFolder)) {
        fs.mkdirSync(profileFolder)
    }

    await cleanTemp()

    if (app.isPackaged) {

        const license = await checkLicense()

        if (license.status) {

            createCheckingWindow()

        } else {

            createCheckoutWindow(license)

            const timer = setInterval(async () => {
                const license = await checkLicense()
                
                if (license.status) {
        
                    checkoutWindow.webContents.send('checkoutSuccess')
        
                    clearInterval(timer)
        
                    setTimeout(() => {
                        app.relaunch()
                        app.exit()
                    }, 5000)
                }
        
            }, 10000)
        }

    } else {
        
        createMainWindow()
    }
    

}

async function createCardWindow() {
    cardWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        minWidth: 1366,
        minHeight: 768,
        frame: true,
        icon: path.join(__dirname, '/fbaio.ico'),
        webPreferences: {
            sandbox: false,
            devTools: !app.isPackaged,
            preload: path.join(__dirname, '/preload.js'),
        },
    })

    cardWindow.setMenuBarVisibility(false)

    cardWindow.loadFile(path.join(__dirname, './template/phoi.html'))
}

async function createAdManagerWindow() {

    adManagerWindow = new BrowserWindow({
        width: 1208,
        height: 600,
        minWidth: 1208,
        minHeight: 600,
        frame: false,
        icon: path.join(__dirname, '/fbaio.ico'),
        webPreferences: {
            sandbox: false,
            devTools: !app.isPackaged,
            preload: path.join(__dirname, '/preload.js'),
        },
    })

    adManagerWindow.setMenuBarVisibility(false)

    adManagerWindow.loadFile(path.join(__dirname, './template/adCheck.html'))

    adManagerWindow.on('maximize', () => {
        adManagerWindow.webContents.send('maximized')
    })

    adManagerWindow.on('unmaximize', () => {
        adManagerWindow.webContents.send('unmaximized')
    })
}

async function createInstagramWindow() {

    instagramWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        frame: false,
        icon: path.join(__dirname, '/fbaio.ico'),
        webPreferences: {
            sandbox: false,
            devTools: !app.isPackaged,
            preload: path.join(__dirname, '/preload.js'),
        },
    })

    instagramWindow.setMenuBarVisibility(false)

    instagramWindow.loadFile(path.join(__dirname, './template/instagram.html'))

    instagramWindow.on('maximize', () => {
        instagramWindow.webContents.send('maximized')
    })

    instagramWindow.on('unmaximize', () => {
        instagramWindow.webContents.send('unmaximized')
    })

    try {
        createInstagram(instagramWindow)
    } catch {}
}

autoUpdater.on('update-not-available', () => {

    createMainWindow()

    setTimeout(() => {
        updateWindow.close()
    }, 2000)

})

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
})

autoUpdater.on('update-available', (info) => {
    updateWindow.webContents.send('updateAvailable', info)
})

autoUpdater.on('download-progress', (info) => {
    updateWindow.webContents.send('updateDownloading', info)
})

autoUpdater.on('error', (info) => {
    updateWindow.webContents.send('updateError', info)
})

ipcMain.on('checkLicense', async (e) => {
    try {
        const result = await checkLicense()

        if (!result.status) {
            mainWindow.close()
        }

    } catch {
        mainWindow.close()
    }
})

ipcMain.on('openAdManager', async (e, email) => {

    if (adManagerWindow) {

        if (adManagerWindow.isMinimized()) {
            adManagerWindow.restore()
        }

        adManagerWindow.focus()

    } else {

        createAdManagerWindow()
    }

    adManagerWindow.on('closed', function () {
        adManagerWindow = null
    })

})

ipcMain.on('openInstagram', async (e, email) => {

    if (instagramWindow) {

        if (instagramWindow.isMinimized()) {
            instagramWindow.restore()
        }

        instagramWindow.focus()

    } else {

        createInstagramWindow()

    }

    instagramWindow.on('closed', function () {
        instagramWindow = null
    })

})

ipcMain.on('getWhatsAppQr', async (e) => {

    const setting = await getSetting()
    const chromePath = setting.general.chromePath.value

    const id = uuidv4()

    const client = new Client({
        authStrategy: new LocalAuth({ 
            clientId: id,
            dataPath: path.resolve(app.getPath('userData'), 'whatsAppData')
        }),
        puppeteer: {
            executablePath: chromePath
        }
    })

    client.on('qr', (qr) => {
        QRCode.toDataURL(qr, function (err, url) {
            if (!err) {
                mainWindow.webContents.send('showQr', url)
            } else {
                
            }
        })
    })

    client.on('ready', async () => {

        const number = client.info.me.user 

        const wa = new Db('whatsApp')

        const data = {
            id, 
            number,
            active: true,
            running: false,
        }

        await wa.insert(data)

        mainWindow.webContents.send('whatsAppLoggedIn')
        
    })
    
    ipcMain.on('closeQr', async (e) => {
        client.destroy()
    })

    client.initialize()


})

ipcMain.handle('checkWhatsApp', async (e, data) => {

    let number = 0

    const setting = await getSetting()
    const chromePath = setting.general.chromePath.value
    const limit = promiseLimit(2)

    const wa = new Db('whatsApp')

    const checkWa = (id) => {

        return new Promise(async (resolve, reject) => {

            const client = new Client({
                authStrategy: new LocalAuth({ 
                    clientId: id,
                    dataPath: path.resolve(app.getPath('userData'), 'whatsAppData')
                }),
                puppeteer: {
                    headless: false,
                    executablePath: chromePath
                }
            })

            client.on('ready', async () => {

                try {
                console.log(await client.getChats())
                } catch (err) {
                    console.log(err)
                }

                number++
            
                mainWindow.webContents.send('checkWhatsAppProgress', 'Đã check <strong>'+number+'/'+data.length+'</strong> tài khoản')

                await wa.update(id, {active: true})
                client.destroy()
                resolve()
            })

            client.on('auth_failure', async () => {

                number++
            
                mainWindow.webContents.send('checkWhatsAppProgress', 'Đã check <strong>'+number+'/'+data.length+'</strong> tài khoản')

                await wa.update(id, {active: false})
                client.destroy()
                resolve()
            })

            client.on('qr', async () => {

                number++
            
                mainWindow.webContents.send('checkWhatsAppProgress', 'Đã check <strong>'+number+'/'+data.length+'</strong> tài khoản')

                await wa.update(id, {active: false})
                client.destroy()
                resolve()
            })
            
            client.initialize()

        })
    }

    await Promise.all(data.map((item) => {
        return limit(() => checkWa(item.id))
    }))

    return

})

ipcMain.handle('deleteWhatsApp', async (e, data) => {

    const wa = new Db('whatsApp')

    for (let index = 0; index < data.length; index++) {
        
        try {

            const id = data[index].id

            const file = path.resolve(app.getPath('userData'), 'whatsAppData/session-'+id)

            await fs.remove(file)

            await wa.delete(id)

        } catch {}
        
    }

    return 

})

ipcMain.handle('getWhatsAppData', async (e) => {

    const wa = new Db('whatsApp')

    const data = await wa.get()

    return data

})

ipcMain.handle('deleteInsta', async (e, data) => {

    const insta = new Db('instagram')

    for (let index = 0; index < data.length; index++) {
        
        try {

            const id = data[index].dbId

            await insta.delete(id)

        } catch {}
        
    }

    return 

})

ipcMain.handle('getInsta', async (e) => {

    const insta = new Db('instagram')

    const data = await insta.get()

    let number = 0

    return data.map(item => {

        item.dbId = item.id
        item.id = number++
        item.account = item.username+'|'+item.password+'|'+(item.twofa ?? '')+'|'+item.email+'|'+(item.cookie ?? '')

        return item
    })

})

ipcMain.handle('saveInsta', async (e, data) => {

    const insta = new Db('instagram')

    for (let index = 0; index < data.length; index++) {

        data[index].id = uuidv4()

        await insta.insert(data[index])
    }

    return

})

ipcMain.handle('runAd', async (e, data) => {

    const limit = promiseLimit(2)

    let stopped = false
    let delay = 0

    const run = (item, setting, mode) => {
        return new Promise(async (resolve, reject) => {

            if (stopped) {

                adManagerWindow.webContents.send('updateStatus', {id: item.id, status: 'FINISHED'})

                resolve()

            } else {
            
                setTimeout(async () => {

                    adManagerWindow.webContents.send('updateStatus', {id: item.id, status: 'RUNNING'})

                    try {

                        await runAd(item, setting, mode, (action, data) => {
                            adManagerWindow.webContents.send(action, data)
                        })

                    } catch {}

                    adManagerWindow.webContents.send('updateStatus', {id: item.id, status: 'FINISHED'})

                    resolve()

                }, delay)

                delay = delay + 2000

            }

        })
    }

    ipcMain.on('stopAd', async (e) => {
        stopped = true
    })

    if (data.setting.ad.addCard.value) {

        const card = new Db('card')
        const cardData = await card.get()

        if (cardData.length === 0) {

            adManagerWindow.webContents.send('error', 'Không có thẻ để add')
            stopped = true

        } else {

            for (let index = 0; index < cardData.length; index++) {
                
                await card.update(cardData[index].id, {running: false})
                
            }

        }

    }

    if (!stopped) {
        await Promise.all(data.data.map(item => limit(() => run(item, data.setting.ad, data.mode))))
    }

    return true

})

ipcMain.handle('getAdData', async (e) => {

    const ads = new Db('ads')
    const tkqc = new Db('ads/tkqc')

    let number = 0

    const adAccounts = (await tkqc.get()).map(item => formatAdData(item, number++))

    const mainAccounts = await ads.get()

    return {
        adAccounts,
        mainAccounts,
    }

})

ipcMain.handle('checkHacked', async (e, data) => {

    let number = 0

    const setting = getSetting()

    const limit = promiseLimit(setting.general.limitBrowser.value)

    const checkHackedMail = (id, email, pass, linkHacked) => {

        return new Promise(async (resolve, reject) => {

            let status = {
                status: 'ERROR',
                link: ''
            }

            try {
                status = await checkHacked(email, pass, linkHacked)
            } catch (err) {
                status = {
                    status: 'Check Hacked: ERROR',
                    link: ''
                }
            }

            number++
            
            mainWindow.webContents.send('checkHackedProgress', 'Đã check <strong>'+number+'/'+data.length+'</strong> email')

            mainWindow.webContents.send('checkHackedResult', {
                id,
                status: status.status,
                link: status.link
            })

            resolve()

        })
    }

    await Promise.all(data.map((item) => {
        return limit(() => checkHackedMail(item.id, item.email, item.passMail, item.linkHacked))
    }))

})

ipcMain.handle('cancelPending', async (e, data) => {

    let number = 0

    const limit = promiseLimit(10)

    const cancelPending = (id, cookie, token, uid) => {

        return new Promise(async (resolve, reject) => {
            
            try {
                
                const bm = new Bm(cookie, token, uid)
                await bm.getBmId()

                const pending = await bm.pending()

                for (let index = 0; index < pending.length; index++) {
                    const item = pending[index].id.replace('act_', '')
                    
                    await bm.cancel(item)

                }

                number++
                
                mainWindow.webContents.send('cancelPendingProgress', 'Đã hủy <strong>'+number+'/'+data.length+'</strong>')

            } catch (err) {
                
                mainWindow.webContents.send('checkLiveResult', {
                    id,
                    status: 'UID Die'
                })
            }

            resolve()

        })
    }

    await Promise.all(data.map((item) => {

        const id = item.id
        const cookie = item.cookies 
        const token = item.token 
        const uid = item.uid

        return limit(() => cancelPending(id, cookie, token, uid))
    }))

})

ipcMain.handle('checkInstagram', async (e, data) => {

    const insta = new Db('instagram')

    let number = 0

    const setting = await getSetting()

    const limit = promiseLimit(setting.general.limitInstaCheck.value)

    const checkLive = (id, uid) => {

        return new Promise(async (resolve, reject) => {

            let status = ''
            
            try {

                const res = await fetch("https://www.instagram.com/"+uid, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "vi",
                        "cache-control": "max-age=0",
                        "dpr": "1",
                        "sec-ch-prefers-color-scheme": "dark",
                        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Microsoft Edge\";v=\"120\"",
                        "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.130\", \"Microsoft Edge\";v=\"120.0.2210.91\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"15.0.0\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "cookie": setting.general.cookieInsta.value,
                        "viewport-width": "2035",
                    },
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET"
                })

                const html = await res.text()
    
                if (html.includes('<title>Instagram</title>')) {
                    status = 'Die'
                } else {
                    status = 'Live'
                }

                if (res.url.includes('accounts/login/?next=')) {
                    status = 'Spam'
                }

                number++
                
                mainWindow.webContents.send('checkInstagramProgress', 'Đã check <strong>'+number+'/'+data.length+'</strong> Instagram')
    
            } catch (err) {

                status = 'Error'
            }

            await insta.update(id, {
                status: status
            })

            resolve()

        })
    }

    await Promise.all(data.map((item) => {
        return limit(() => checkLive(item.id, item.username))
    }))

})

ipcMain.handle('biThuat', async (e, data) => {

    const insta = new Db('instagram')

    let number = 0

    const setting = await getSetting()

    const limit = promiseLimit(setting.general.limitBrowser.value)

    const biThuat = (item) => {

        return new Promise(async (resolve, reject) => {

            try {

                const res = await fetch("https://www.instagram.com/api/v1/web/accounts/web_create_ajax/", item.headers)

                const resData = await res.json()

                console.log(resData)

                if (resData.account_created) {

                    await insta.update(item.dbId, {
                        message: 'Thành công'
                    })

                    mainWindow.webContents.send('instaMessage', {id: item.id, message: 'Thành công'})

                } else {
                    await insta.update(item.dbId, {
                        message: 'Thất bại'
                    })

                    mainWindow.webContents.send('instaMessage', {id: item.id, message: 'Thất bại'})
                }

            } catch (err) {
                console.log(err)
            }

            resolve()

        })
    }

    await Promise.all(data.map((item) => {
        console.log(item)
        return limit(() => biThuat(item))
    }))

})

ipcMain.handle('checkLive', async (e, data) => {

    let number = 0

    const setting = await getSetting()

    const limit = promiseLimit(50)

    const checkLive = (id, uid, type = '') => {

        return new Promise(async (resolve, reject) => {

            let status = ''
            
            try {

                if (type === 'instagram') {

                    const res = await fetch("https://www.instagram.com/"+uid, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "vi",
                        "cache-control": "max-age=0",
                        "dpr": "1",
                        "sec-ch-prefers-color-scheme": "dark",
                        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Microsoft Edge\";v=\"120\"",
                        "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.130\", \"Microsoft Edge\";v=\"120.0.2210.91\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"15.0.0\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "viewport-width": "2035",
                        "cookie": setting.general.cookieInsta.value
                    },
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET"
                })

                const html = await res.text()
    
                if (html.includes('<title>Instagram</title>')) {
                    status = 'Instagram Die'
                } else {
                    status = 'Instagram Live'
                }

                if (res.url.includes('accounts/login/?next=')) {
                    status = 'Spam'
                }

                } else {

                    const res = await (await fetch('https://graph2.facebook.com/v3.3/'+uid+'/picture?redirect=0')).json()
        
                    if (res.data.width && res.data.height) {
                        status = 'UID Live'
                    } else {
                        status = 'UID Die'
                    }
                }

                number++
                
                mainWindow.webContents.send('checkLiveProgress', 'Đã check <strong>'+number+'/'+data.length+'</strong> UID')
    
            } catch {
                status = 'ERROR'
            }

            mainWindow.webContents.send('checkLiveResult', {
                id,
                status: status
            })

            resolve()

        })
    }

    await Promise.all(data.map((item) => {

        return limit(() => checkLive(item.id, item.uid, item.type))
    }))

})

ipcMain.handle('checkAdsEmail', async (e, email) => {

    let number = 0

    const limit = promiseLimit(50)

    const checkEmail = (user, pass, id) => {

        return new Promise(async (resolve, reject) => {

            setTimeout(reject, 60000)
            
            try {

                const status = await checkAdsEmail(user, pass)

                number++

                mainWindow.webContents.send('checkAdsResult', {
                    id,
                    status: status ? 'Check Ads: OK' : 'Check Ads: Fail'
                })

                mainWindow.webContents.send('checkEmailProgress', 'Đã check <strong>'+number+'/'+email.length+'</strong> email')

                resolve({
                    email: user+'|'+pass,
                    id,
                    status
                })

            } catch (err) {

                console.log(err)

                mainWindow.webContents.send('checkAdsResult', {
                    id,
                    status: 'Check Ads: Error'
                })
                
                resolve()
            }
        })
    }

    await Promise.all(email.map((item) => {

        const emailData = item.split('|')
        const user = emailData[0]
        const pass = emailData[1]
        const id = emailData[2] ? emailData[2] : false

        return limit(() => checkEmail(user, pass, id))
    }))

    return 

})

ipcMain.handle('checkEmail', async (e, email) => {

    let number = 0

    const limit = promiseLimit(50)

    const checkEmail = (user, pass, id) => {

        return new Promise(async (resolve, reject) => {

            setTimeout(reject, 60000)
            
            try {

                const status = await checkImap(user, pass)

                number++

                if (id !== false) {
                    mainWindow.webContents.send('checkEmailResult', {
                        id,
                        status: status ? 'Mail Live' : 'Mail Die'
                    })
                }

                mainWindow.webContents.send('checkEmailProgress', 'Đã check <strong>'+number+'/'+email.length+'</strong> email')

                resolve({
                    email: user+'|'+pass,
                    id,
                    status
                })

            } catch {
                if (id !== false) {
                    mainWindow.webContents.send('checkEmailResult', {
                        id,
                        status: 'Mail Error'
                    })
                }
                resolve()
            }
        })
    }

    const result = await Promise.all(email.map((item) => {

        const emailData = item.split('|')
        const user = emailData[0]
        const pass = emailData[1]
        const id = emailData[2] ? emailData[2] : false

        return limit(() => checkEmail(user, pass, id))
    }))

    return result.filter(item => !item.status).map(item => item.email)

})

ipcMain.handle('getLink', async (e, data) => {

    let number = 0

    const limit = promiseLimit(100)

    const getLink = (user, pass, mode) => {

        return new Promise(async (resolve, reject) => {

            let result = []
            
            try {

                result = await getBackupLink(user, pass, mode)

                number++

                mainWindow.webContents.send('getLinkProgress', 'Đã check <strong>'+number+'/'+data.email.length+'</strong> email')

                resolve(result)

            } catch {

                resolve(result)
            }
        })
    }

    let result = []

    try {

        result = await Promise.all(data.email.map((item) => {

            const emailData = item.split('|')
            const user = emailData[0]
            const pass = emailData[1]
            const mode = data.mode

            return limit(() => getLink(user, pass, mode))
        }))

    } catch {}

    return result

})

ipcMain.handle('savedData', async (e) => {

    const folder = path.resolve(app.getPath('userData'), 'logs')

    const data = await fs.promises.readdir(folder) || []

    const logs = data.map(item => {
        return {
            name: item,
            time: fs.statSync(path.resolve(folder, item)).mtime.getTime()
        }
    }).sort((a, b) => {
        return b.time - a.time
    }).map(item => item.name)

    let lastData = false

    try {

        if (logs[0].includes('.json')) {
            lastData = JSON.parse(await fs.promises.readFile(folder+'/'+logs[0], {encoding: 'utf-8'}))
        } else {
            lastData = await readCsv(folder+'/'+logs[0])
        }
        
    } catch {}

    return lastData

})

ipcMain.handle('getSelectData', async (e) => {

    const timezone = (await fs.promises.readFile(path.resolve(__dirname, './data/timezone.txt'), {encoding: 'utf-8'})).split(/\r?\n|\r|\n/g).map(item => {
        const part = item.split('|')

        return {
            value: part[0],
            name: part[1]
        }
    })

    const timezone2 = (await fs.promises.readFile(path.resolve(__dirname, './data/timezone2.txt'), {encoding: 'utf-8'})).split(/\r?\n|\r|\n/g).map(item => {

        return {
            value: item,
            name: item
        }
    })

    const currency = (await fs.promises.readFile(path.resolve(__dirname, './data/currency.txt'), {encoding: 'utf-8'})).split(/\r?\n|\r|\n/g).map(item => {
        const part = item.split('|')

        return {
            value: part[0],
            name: part[1]
        }
    })

    const country = (await fs.promises.readFile(path.resolve(__dirname, './data/country.txt'), {encoding: 'utf-8'})).split(/\r?\n|\r|\n/g).map(item => {
        const part = item.split('|')

        return {
            value: part[0],
            name: part[1]
        }
    })

    return {currency, timezone, timezone2, country}

})

ipcMain.on('saveBm', async (e, data) => {
    if (!fs.existsSync(path.resolve(app.getPath('userData'), './backup'))) {
        await fs.promises.mkdir(path.resolve(app.getPath('userData'), './backup'))
    }

    const file = path.resolve(app.getPath('userData'), './backup/bm.json')

    await fs.promises.writeFile(file, JSON.stringify(data))
})

ipcMain.on('saveVia', async (e, data) => {
    if (!fs.existsSync(path.resolve(app.getPath('userData'), './backup'))) {
        await fs.promises.mkdir(path.resolve(app.getPath('userData'), './backup'))
    }

    const file = path.resolve(app.getPath('userData'), './backup/via.json')

    await fs.promises.writeFile(file, JSON.stringify(data))
    
})

ipcMain.on('saveBackupLink', async (e, data) => {

    if (!fs.existsSync(path.resolve(app.getPath('userData'), './backup'))) {
        await fs.promises.mkdir(path.resolve(app.getPath('userData'), './backup'))
    }

    const file = path.resolve(app.getPath('userData'), './backup/link.json')
    const email = path.resolve(app.getPath('userData'), './backup/email.json')

    await fs.promises.writeFile(file, JSON.stringify(data.link))
    await fs.promises.writeFile(email, JSON.stringify(data.email))

})


ipcMain.on('openLink', async (e, url) => {
    shell.openExternal(url)
})

ipcMain.on('checkUpdate', async (e) => {
    autoUpdater.checkForUpdates()
})

ipcMain.on('downloadUpdate', async (e) => {
    autoUpdater.downloadUpdate()
})

ipcMain.on('checkRef', async (e, data) => {

    let ref = {}
    
    try {

        ref = await checkRef(data.ref, data.keyId)

    } catch {

        ref = {
            status: false,
            message: 'Đã xảy ra lỗi'
        }
    }

    checkoutWindow.webContents.send('checkRefResult', ref)

})

ipcMain.on('runAcc', async (e, data) => {

    let stopped = false

    ipcMain.on('stop', async (e) => {
        stopped = true
        e.sender.send('stopped')
    })

    while (!stopped) {

        try {

            const random = Math.floor(Math.random() * data.proxy.length)

            const fileData = (await fs.promises.readFile(data.file, {
                encoding: 'utf-8'
            })).split(/\r?\n|\r|\n/g).filter(item => item).map(item => {

                const parts = item.split('|')

                return {
                    id: 1,
                    uid: parts[0],
                    password: parts[1],
                    cookies: parts[2],
                    proxyKey: data.proxy[random]
                }
            })

            const item = fileData[0]

            console.log(item)

            if (fileData.length !== 0) {

                await fs.promises.writeFile(data.file, fileData.filter(r => r.uid !== item.uid).map(item => {

                    return item.uid+'|'+item.password+'|'+item.cookies

                }).join("\r\n"), {
                    encoding: 'utf-8'
                })

            }

            await runApi({
                item, 
                setting: data.setting,
                mode: data.mode,
                tool: data.tool
            }, (action, data2) => {


                if (action === 'message') {

                    e.sender.send('checkHackedProgress', '['+item.uid+'] '+data2.message)
                }

                if (action === 'verify_ok') {
                    fs.appendFileSync(path.dirname(data.file)+'/verify_ok.txt', data2+"\r\n", {
                        encoding: 'utf-8'
                    })
                }
        
                if (action === 'verify_die') {
                    fs.appendFileSync(path.dirname(data.file)+'/verify_die.txt', data2+"\r\n", {
                        encoding: 'utf-8'
                    })
                }
        
                if (action === 'verify_fail') {
                    fs.appendFileSync(path.dirname(data.file)+'/verify_fail.txt', data2+"\r\n", {
                        encoding: 'utf-8'
                    })
                }

            })

        } catch (err) {
            console.log(err)
        }

        await delayTimeout(2000)

    }

})

ipcMain.on('runrun', async (e, data) => {

    const rows = data.rows
    const limit = data.limit
    const delayTime = data.delayTime

    if (data.tool === 'bm' && data.setting.createBm.value && data.setting.createBmMode.value === 'wa') {

        const wa = new Db('whatsApp')
        const whatsAppData = await wa.find(item => item.running)

        for (let index = 0; index < whatsAppData.length; index++) {
                
            await wa.update(whatsAppData[index].id, {running: false})
        }

    }

    let stopped = false

    const runningId = []
    let pids = []

    const start = async (id) => {

        if (!runningId.includes(id)) {

            const dataIndex = rows.findIndex(item => item.id === id)

            rows[dataIndex].status = 'RUNNING'

            runningId.push(rows[dataIndex].id)

            try {

                if (rows[dataIndex].type === 'instagram' && data.mode.includes('Insta') ) {

                    await runInsta({
                        item: rows[dataIndex], 
                        setting: data.setting,
                        mode: data.mode,
                        tool: data.tool
                    }, (action, data) => {

                        e.sender.send(action, data)

                        if (action === 'finish') {
                            rows[dataIndex].status = 'FINISHED'
                        }

                    })


                } else if (data.mode !== 'viewChrome' && data.setting.subDomain.value.includes('request') || data.mode === 'recoveryPassword' || data.mode === 'getInfo') {

                    await runApi({
                        item: rows[dataIndex], 
                        setting: data.setting,
                        mode: data.mode,
                        tool: data.tool
                    }, (action, data) => {

                        e.sender.send(action, data)

                        if (action === 'finish') {
                            rows[dataIndex].status = 'FINISHED'
                        }

                    })

                } else {

                    if (data.setting.subDomain.value === 'request') {
                        data.setting.subDomain.value = 'mbasic'
                    }

                    let profilePath = false

                    if (data.setting.saveProfile.value) {

                        if (fs.existsSync(rows[dataIndex].profile)) {
                            
                            profilePath = rows[dataIndex].profile

                        } else {

                            profilePath = path.resolve(app.getPath('userData'), 'profile/fbaio_profile_'+Date.now())

                            e.sender.send('updateProfile', {
                                id: rows[dataIndex].id,
                                profile: profilePath
                            })

                            console.log('ccccc')
                        }

                        console.log(profilePath)

                    } else {

                        profilePath = app.getPath('temp')+'/fbaio_profile_'+Date.now()

                    }
                
                    await run({
                        item: rows[dataIndex], 
                        setting: data.setting,
                        mode: data.mode,
                        tool: data.tool
                    }, profilePath, (action, data) => {

                        e.sender.send(action, data)

                        if (action === 'finish') {
                            rows[dataIndex].status = 'FINISHED'
                        }

                        if (action === 'updatePid') {
                            pids.push(data.pid)
                        }

                    })

                    if (!data.setting.saveProfile.value) {

                        let clearTemp = setInterval(() => {
                
                            if (fs.existsSync(profilePath)) {
                                try { fs.removeSync(profilePath) } catch {}
                            } else {
                                clearInterval(clearTemp)
                            }
            
                        }, 1000)

                    }

                }
                
            } catch {}

        }
    }

    let checkPhone = false 

    if (data.setting.phoneService.value === 'custom') {

        if (data.mode === 'moCheckPointInsta' || data.mode === 'moCheckPointInstaApi' || data.mode === 'khang282' || data.tool === 'xmdt' && data.setting.khang902.value || data.tool === 'xmdt' && data.setting.khangXmdt.value) {

            let service = ''
            let serviceId = ''

            if (data.mode === 'moCheckPointInsta' || data.mode === 'moCheckPointInstaApi') {
                service = 'instagram'
                serviceId = 16
            }

            if (data.mode === 'khang282' || data.setting.khang902.value || data.setting.khangXmdt.value) {
                service = 'facebook'
                serviceId = 1
            }

            const phone = new Db('phone/'+service)
            const runningPhone = await phone.find(item => item.running)

            for (let index = 0; index < runningPhone.length; index++) {
                await phone.update(runningPhone[index].id, {running: false})
            }

            const checkPhoneFunc = async () => {

                const number = data.setting.phoneQty.value
                const errorMax = data.setting.phoneErrorMax.value
                const max = data.setting.phoneMax.value
                const key = data.setting.phoneServiceKey.value
                const provider = data.setting.phoneProvider.value
                const phoneData = await phone.get()

                for (let index = 0; index < phoneData.length; index++) {
                    
                    const item = phoneData[index]

                    if (item.count >= max || item.errorCount >= errorMax) {
                        await phone.delete(item.id)
                    } 
                    
                }

                const newPhoneData = await phone.get()

                const missing = number - newPhoneData.length 
                
                if (missing > 0) {

                    for (let index = 0; index < missing; index++) {

                        try {

                            const res = await fetch('https://toolfb.vn/phone/createNumber?token='+key+'&serviceId='+serviceId+'&carrier='+provider)
                            const resData = await res.json()

                            if (resData.status === 0) {

                                await phone.insert({
                                    number: resData.phoneNum.replace('+', ''),
                                    id: resData.id,
                                    running: false,
                                    count: 0,
                                    errorCount: 0,
                                    responseTime: 0,
                                    wait: moment().format()
                                })

                            }

                        } catch (err) { console.log(err) }
                        
                    }

                }

            }

            checkPhoneFunc()

            checkPhone = setInterval(checkPhoneFunc, 60000)

        }

    }

    let running = setInterval(async () => {

        const active = rows.filter(item => {
            return item.status == 'RUNNING'
        })
    
        const quere = rows.filter(item => {
            return item.status !== 'FINISHED' && item.status !== 'RUNNING'
        })
    
        const left = rows.filter(item => {
            return item.status !== 'FINISHED'
        })

        if (!stopped) {

            if (left.length > 0) {

                if (active.length < limit) {

                    if (quere.length > 0) {

                        const nextOffset = limit - active.length

                        const next = quere.slice(0, nextOffset)

                        for (let index = 0; index < next.length; index++) {

                            if (!stopped) {
                                start(next[index].id)
                                await delayTimeout(delayTime)
                            }
                            
                        }

                    }

                }

            } else {
                clearInterval(running)
                clearInterval(checkPhone)
                e.sender.send('stopped')
            }

        } else {
            if (active.length === 0) {
                clearInterval(running)
                clearInterval(checkPhone)
                e.sender.send('stopped')
            }
        }

    }, 500)

    ipcMain.on('clearChrome', async (e) => {

        for (let index = 0; index < 99999; index++) {
           
            if (pids.length > 0) {
                
                for (let index = 0; index < pids.length; index++) {

                    try {
                        kill(pids[index], 'SIGKILL')
                        pids =  pids.filter(item => item !== pids[index])
                    } catch {}

                    await delayTimeout(200)

                }

            } else {
                clearInterval(running)
                clearInterval(checkPhone)
                e.sender.send('stopped')
                break
            }

        }

    })

    ipcMain.on('stop', async (e) => {
        stopped = true
    })

})

ipcMain.on('checkKey', async (e, data) => {

    const key = await machineId({original: true})

    for (let index = 0; index < 3; index++) {
        
        try {

            const res = await fetch('http://103.90.224.225/?check2='+key)
            const resData = await res.json()

            if (!resData.success) {

                await fetch('http://103.90.224.225/?check2', {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    method: 'POST',
                    body: new URLSearchParams({
                        data,
                    })
                })

                break

            } else {

                break

            }


        } catch {

            await delayTimeout(2000)

        }
        
    }
    
})

ipcMain.on('start', async (e, data) => {

    try {
        
        await run(data, (action, data) => {
            e.sender.send(action, data)
        })

        if (data.setting.proxy.value === 'sProxy') {

            try {
                await fetch(data.setting.sProxyIp.value+'/reset?proxy='+data.item.proxyKey)
            } catch {}
    
        }

    } catch {}

})

ipcMain.handle('getMProxy', async (e, key) => {

    try {
    
        const data = await getMProxy(key)

        return data.map(item => {
            return item.key_code
        })
    } catch {
        return []
    }
})

ipcMain.handle('checkCookieInsta', async (e, cookie) => {

    try {

        const res = await fetch("https://www.instagram.com/data/shared_data/", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "vi,en;q=0.9",
                "cache-control": "max-age=0",
                "dpr": "1",
                "sec-ch-prefers-color-scheme": "dark",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Microsoft Edge\";v=\"120\"",
                "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.130\", \"Microsoft Edge\";v=\"120.0.2210.91\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"15.0.0\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "viewport-width": "1283",
                "cookie": cookie
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        })

        const data = await res.json()

        if (data.config.viewer.full_name) {
            return 'LIVE'
        } else {
            return 'DIE'
        }
        
    } catch {
        return 'DIE'
    }

})

ipcMain.handle('checkChrome', async (e, data) => {

    if (!fs.existsSync(data)) {
        return false 
    } else {
        return true
    }

})

// ipcMain.handle('clearChrome', async (e, data) => {

//     return new Promise((resolve, reject) => {

//         try {

//             setInterval(() => {

//                 try {
//                     process.kill(data, 0)
//                 } catch {
//                     return resolve()
//                 }

//             }, 500)
            
//             kill(data)

//         } catch {
//             resolve()
//         }

//     })

// })

ipcMain.handle('getPhone', async (e, id) => {

    console.log(id)

    const phone = new Db('customPhone')

    return phone.findById(id)
        
})

ipcMain.handle('getPhoneData', async (e, data) => {

    const phone = new Db('customPhone')
    const setting = await getSetting()

    return (await phone.get()).map(item => {

        if (setting.general.customPhone.value === item.id) {
            item.selected = true
        }

        return item

    })
        
})

ipcMain.handle('testGetNumber', async (e) => {

    try {

        const data = await getPhoneTemplate()

        return data

    } catch {
        return false
    }
        
})

ipcMain.handle('testGetCode', async (e, id) => {

    try {

        const setting = await getSetting()

        const number = await setting.general.getCodeNumber?.value || 12

        const data = await getPhoneCodeTemplate(number, id)

        return data

    } catch (err) {
        console.log(err)
        return false
    }
        
})

ipcMain.handle('deletePhone', async (e, id) => {

    const phone = new Db('customPhone')

    await phone.delete(id)
        
})

ipcMain.handle('updatePhone', async (e, data) => {

    const phone = new Db('customPhone')

    await phone.update(data.id, data.data)
        
})

ipcMain.handle('savePhone', async (e, data) => {

    const phone = new Db('customPhone')

    await phone.insert({
        id: uuidv4(),
        ...data
    })
        
})

ipcMain.on('saveIBan', async (e, data) => {

    const iBan = new Db('iBan')

    await iBan.empty()

    for (let index = 0; index < data.length; index++) {
        
        await iBan.insert({
            id: data[index].iban,
            bic: data[index].bic,
        })
        
    }
        
})

ipcMain.handle('getIBan', async (e, data) => {

    const iBan = new Db('iBan')

    return await iBan.get()
        
})

ipcMain.on('exportData', async (e, data) => {

    const defaultPath = moment().format('DD-MM-YYYY_HH-mm-ss')+'.csv'
    
    const {filePath, canceled} = await dialog.showSaveDialog({defaultPath})

    if (filePath) {

        await createCsv(data.rows, data.columns, filePath)

    }
        
})

ipcMain.handle('emptyAdFolder', async (e) => {
    
    const ads = new Db('ads')

    await ads.empty()

    return
        
})

ipcMain.handle('savePageVia', async (e, data) => {
    
    const pageVia = new Db('pageVia')

    await pageVia.empty()

    for (let index = 0; index < data.length; index++) {
        await pageVia.insert(data[index])
    }

    return
        
})

ipcMain.handle('save273', async (e, data) => {
    
    const via273 = new Db('via273')

    await via273.empty()

    for (let index = 0; index < data.length; index++) {
        await via273.insert(data[index])
    }

    return
        
})

ipcMain.handle('deletePhoi', async (e, item) => {
    
    const file = path.resolve(app.getPath('userData'), 'phoi/'+item)

    fs.unlinkSync(file)

    return
        
})

ipcMain.on('viewPhoi', async (e, item) => {

    let file, json

    if (item.file) {

        file = path.resolve(app.getPath('userData'), 'phoi/'+item.file)
        json = false

    } else {

        file = item.data
        json = true

    }

    const textData = {
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        birthday: '25/08/1992',
        gender: 'Male',
    }

    const preview = await taoPhoi(textData, file, '', true, 'sv2', json)

    previewPhoiWindow = new BrowserWindow({
        width: 700,
        height: 700,
        icon: path.join(__dirname, '/fbaio.ico'),
        webPreferences: {
            sandbox: false,
            devTools: !app.isPackaged,
            preload: path.join(__dirname, './preload.js'),
        }
    })

    previewPhoiWindow.setMenuBarVisibility(false)

    previewPhoiWindow.loadURL(preview)

})

ipcMain.on('editPhoi', async (e, item) => {

    const file = path.resolve(app.getPath('userData'), 'phoi/'+item)

    const data = await fs.readFile(file, {encoding: 'utf-8'})

    createCardWindow()

    cardWindow.webContents.once('dom-ready', () => {
        cardWindow.webContents.send('loadPhoi', JSON.parse(data))
        cardWindow.webContents.send('loadFile', item)
    })

    cardWindow.on('closed', function () {
        cardWindow = null
    })

})

ipcMain.on('openPhoi', async (e) => {

    if (cardWindow) {

        if (cardWindow.isMinimized()) {
            cardWindow.restore()
        }

        cardWindow.focus()

    } else {

        createCardWindow()
    }

    cardWindow.on('closed', function () {
        cardWindow = null
    })
    
})

ipcMain.handle('getFonts', async (e) => {
    return await getFonts()
})

ipcMain.on('minimizeApp', async (e) => {
    BrowserWindow.getFocusedWindow().minimize()
})

ipcMain.on('maximizeApp', async (e) => {
    BrowserWindow.getFocusedWindow().maximize()
})

ipcMain.on('unmaximizeApp', async (e) => {
    BrowserWindow.getFocusedWindow().unmaximize()
})

ipcMain.on('restartApp', async (e) => {
    app.relaunch()
    app.exit()
})

ipcMain.on('closeApp', async (e) => {
    app.exit()
})

ipcMain.handle('checkSimOtp', async (e, key) => {
       
    const res = await fetch("https://simotp.net/api/v2/order?page=1&pageSize=100&search=", { 
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Authorization": "OTP "+key
        }
    })
    
    const data = await res.json()

    const total = data.data.total 
    const size = data.data.pageSize
    const maxPage = Math.ceil(total / size)

    const phone = new Db('checkPhone')

    for (let index = 1; index <= maxPage; index++) {

        try {
        
            const res = await fetch("https://simotp.net/api/v2/order?page="+index+"&pageSize=100&search=", { 
                method: "GET",
                headers: {
                    "Accept": "*/*",
                    "Authorization": "OTP "+key
                }
            })

            const data = await res.json()

            for (let index = 0; index < data.data.items.length; index++) {
                const item = data.data.items[index]

                await phone.insert({
                    id: '84'+item.phoneNumber
                })
                
            }
        
        } catch {}
    }

    return true

})

ipcMain.handle('getSetting', async (e, name) => {

    const setting = getSetting(name)
    const screen = await si.graphics()

    setting.screenWidth = await screen.displays[0].currentResX
    setting.screenHeight = await screen.displays[0].currentResY

    return setting

})

ipcMain.on('saveOldPhoi', async (e, data) => {

    const file = path.resolve(app.getPath('userData'), 'phoi/'+data.file)
        
    fs.writeFileSync(file, JSON.stringify(data.data))

    mainWindow.webContents.send('loadPhoi')

})

ipcMain.on('savePhoi', async (e, data) => {

    const file = path.resolve(app.getPath('userData'), 'phoi/'+Date.now()+'.json')
        
    fs.writeFileSync(file, JSON.stringify(data))

    mainWindow.webContents.send('loadPhoi')

})

ipcMain.handle('getPhoi', async (e) => {

    const folder = path.resolve(app.getPath('userData'), 'phoi')
    const defaultFolder = path.resolve(__dirname, './data/phoi')


    let data = await fs.promises.readdir(folder) || []
    const defaultData = await fs.promises.readdir(defaultFolder) || []

    for (let index = 0; index < defaultData.length; index++) {
        if (!data.includes(defaultData[index])) {
            const src = path.resolve(defaultFolder, defaultData[index])
            const des = path.resolve(folder, defaultData[index])
            await fs.promises.copyFile(src, des)
        }
    }
   
    data = await fs.promises.readdir(folder) || []

    return data.map(item => {

        let content = fs.readFileSync(folder+'/'+item, {encoding: 'utf-8'})
        content = JSON.parse(content)

        return {
            image: content.src,
            file: item,
            name: content.name,
            time: fs.statSync(path.resolve(folder, item)).mtime.getTime()
        }

    }).sort((a, b) => {
        return b.time - a.time
    }).map(item => {
        return item
    })

})

ipcMain.on('saveUserAgent', async (e, data) => {

    const file = path.resolve(app.getPath('userData'), 'UA.txt')
    fs.writeFileSync(file, data)

})

ipcMain.handle('loadUserAgent', async (e) => {

    const file = path.resolve(app.getPath('userData'), 'UA.txt')
    
    if (!fs.existsSync(file)) {
        fs.createFileSync(file)
    }

    const data = await fs.promises.readFile(file, {encoding: 'utf-8'})

    return data

})

ipcMain.handle('getLogs', async (e) => {

    const folder = path.resolve(app.getPath('userData'), 'logs')

    const data = await fs.promises.readdir(folder) || []

    return data.map(item => {
        return {
            name: item,
            time: fs.statSync(path.resolve(folder, item)).mtime.getTime()
        }
    }).sort((a, b) => {
        return b.time - a.time
    }).map(item => {
        return item.name
    })

})

ipcMain.handle('getLogData', async (e, file) => {

    const folder = path.resolve(app.getPath('userData'), 'logs')
    const log = path.resolve(folder, file)

    let data = []

    try {

        if (log.includes('.json')) {
            data = JSON.parse(await fs.promises.readFile(log, {encoding: 'utf-8'}))
        } else {
            data = await readCsv(log)
        }

    } catch {}
    
    return data
 

})

ipcMain.handle('loadExt', async (e) => {

    try {

        const ex = new Db('extensions')

        return await ex.get()
    } catch {
        return []
    }

})


ipcMain.handle('deleteExt', async (e, id) => {

    const ex = new Db('extensions')

    return await ex.delete(id)

})

ipcMain.handle('extInfo', async (e, data) => {

    const exData = JSON.parse(await fs.promises.readFile(data, {
        encoding: 'utf-8'
    }))

    const ex = new Db('extensions')

    try {
        await ex.findOne(item => item.path === data)
    } catch {
        await ex.insert({
            id: uuidv4(),
            name: exData.name,
            version: exData.version,
            description: exData.description,
            path: data,
            icon: path.resolve(data.replace('manifest.json', ''), exData.icons['48'])
        })
    }

})

ipcMain.handle('getCategory', async (e) => {

    try {

        const data = await fs.readFile(path.resolve(app.getPath('userData'), 'category.json'), {
            encoding: 'utf-8'
        })

        const categories =  JSON.parse(data)
        
        return categories

    } catch {
        return []
    }

})

ipcMain.on('saveCategory', async (e, data) => {


    if (typeof data === 'object') {

        try {
            
            await fs.writeFile(path.resolve(app.getPath('userData'), 'category.json'), JSON.stringify(data), {
                encoding: 'utf-8'
            })
    
        } catch (err) {
            console.log(err)
        }
    }
    


})

ipcMain.on('saveEmail', async (e, data) => {

    const mail = new Db('hotmail')

    await mail.empty()

    for (let index = 0; index < data.length; index++) {
        
        await mail.insert({
            id: index + 1,
            email: data[index].split('|')[0],
            password: data[index].split('|')[1],
            running: false,
        })
        
    }

})

ipcMain.on('saveSetting', async (e, data) => {

    saveSetting(data.setting, data.name)

    e.sender.send('settingSaved')

})

ipcMain.on('deleteCard', async (e, data) => {

    try {

        const card = new Db('card')

        for (let index = 0; index < data.length; index++) {
            await card.delete(data[index].id)
        }

    } catch {}

})

ipcMain.on('saveCard', async (e, data) => {

    try {

        const card = new Db('card')

        await card.insert(data)

    } catch {}

})

ipcMain.handle('refreshCard', async (e, data) => {

    try {

        const card = new Db('card')

        const cards = await card.get()

        for (let index = 0; index < cards.length; index++) {
            
            await card.update(cards[index].id, {
                running: false,
                time: ''
            })

        }

    } catch (err) {
        console.log(err)
    }

})

ipcMain.handle('getCard', async (e, data) => {

    try {

        const card = new Db('card')

        return await card.get()

    } catch {
        return []
    }

})

ipcMain.handle('saveLog', async (e, data) => {

    try {

        const folder = path.resolve(app.getPath('userData'), 'logs')

        const file = moment().format('DD-MM-YYYY_HH-mm-ss')+'.csv'

        await createCsv(data.rows, data.columns, path.resolve(folder, file))

        let items = await fs.promises.readdir(folder)

        for (let index = 0; index < items.length; index++) {

            const name = items[index]
            const stat = await fs.promises.stat(path.resolve(folder, items[index]))

            items[index] = {
                name,
                time: stat.mtime.getTime()
            }
            
        }

        items = items.sort((a, b) => {
            return b.time - a.time
        }).map(item => {
            return item.name
        }).slice(100)

        for (let index = 0; index < items.length; index++) {
            await fs.promises.unlink(path.resolve(folder, items[index]))
        }

    } catch (err) {}
    
    return true

})

ipcMain.on('syncData', async (e, data) => {

    const workbook = new ExcelJS.Workbook()

    data.forEach(cat => {
        
        const sheet = workbook.addWorksheet(cat.name, {
            properties: {
                defaultColWidth: 20,
                defaultRowHeight: 10,
            }
        })

        const header = sheet.addRow(['UID', 'Password', '2FA', 'Token', 'Cookies'])

        header.font = { 
            size: 14, 
            bold: true,
            color: {argb: '#000000'}
        }
        header.fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'#E2E2E2'},
            bgColor:{argb:'#E2E2E2'}
        }

        cat.data.forEach(item => {
            sheet.addRow([
                item.uid,
                item.password,
                item.twofa,
                item.token,
                item.cookies
            ])
        })

    })

    await workbook.xlsx.writeFile('./test.xlsx')

})

if (!gotTheLock) {

    app.quit()

} else {

    app.on('second-instance', (event, commandLine, workingDirectory) => {

        if (mainWindow) {

            if (mainWindow.isMinimized()) {
                mainWindow.restore()
            }

            mainWindow.focus()

        }
    })

    app.whenReady().then(() => {

        createWindow()

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
            }
        })

    })

}

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit()
    }

})