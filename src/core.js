const fs = require('fs-extra')
const path = require('path')
const {app} = require('electron')
const {machineId} = require('node-machine-id')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const imaps = require('imap-simple')
const quotedPrintable = require('quoted-printable')
const url = require('url')
const findChrome = require('chrome-finder')
const axios = require('axios')
const moment = require('moment')
const {stringify} = require('csv-stringify')
const {parse} = require('csv-parse')
const { Client, LocalAuth } = require('whatsapp-web.js')

const {zFetch} = require('./zquery.js')
const Db = require('./db.js')

const { ImapFlow } = require('imapflow')
const simpleParser = require('mailparser').simpleParser

const {HttpsProxyAgent} = require('https-proxy-agent')

const {generateUsername} = require('unique-username-generator')
const generator = require('generate-password')

function maskEmail(email) {

    const username = email.split('@')[0]
    const domain = '@' + email.split('@')[1]
    const start = username[0]
    const end = username[username.length - 1]

    let finalEmail = start

    for (let index = 0; index < (username.length - 2); index++) {
        finalEmail += '*'
    }

    finalEmail += end + domain

    return finalEmail
}

function getCookies(res) {

    try {

        const raw = res.headers.raw()['set-cookie']
    
        return raw.map(entry => {
            const parts = entry.split(';')
            const cookiePart = parts[0]
            return cookiePart
        }).join(';')

    } catch {
        return false
    }
}

function randomPersion() {

    return new Promise(async (resolve, reject) => {

        const gioitinh = randomNumberRange(1, 3)

        const hoTxt = await fs.promises.readFile(path.resolve(__dirname, '../data/ho.txt'), {encoding: 'utf-8'})
        const hoArray = hoTxt.split(/\r?\n|\r|\n/g)

        const tenNamTxt = await fs.promises.readFile(path.resolve(__dirname, '../data/ten_nam.txt'), {encoding: 'utf-8'})
        const tenNamArray = tenNamTxt.split(/\r?\n|\r|\n/g)

        const tenNuTxt = await fs.promises.readFile(path.resolve(__dirname, '../data/ten_nu.txt'), {encoding: 'utf-8'})
        const tenNuArray = tenNuTxt.split(/\r?\n|\r|\n/g)

        const randomHo = hoArray[Math.floor(Math.random() * hoArray.length)]
        const randomTenNam = tenNamArray[Math.floor(Math.random() * tenNamArray.length)]
        const randomTenNu = tenNuArray[Math.floor(Math.random() * tenNuArray.length)]

        const year = randomNumberRange(1980, 2005)
        const month = randomNumberRange(1, 12)
        const day = randomNumberRange(1, 12)
        const username = generateUsername('', 15).replaceAll('-', '')

        if (gioitinh === 1) {
            ten = randomTenNam
            gender = 'male'
        } else {
            ten = randomTenNu
            gender = 'female'
        }

        resolve({name: randomHo+' '+ten, year, month, day, gender, username})

    })

}

function capitalizeFLetter(string) {
    return string[0].toUpperCase() + string.slice(1)
}

function readCsv(file) {
    return new Promise(async (resolve, reject) => {

        const parser = parse({columns: true}, function (err, records) {

            if (err) {
                reject(err)
            } else {
                resolve(records)
            }

        })

        fs.createReadStream(file).pipe(parser)

    })
}

function createCsv(data, columns, dest) {

    return new Promise((resolve, reject) => {
        stringify(data, {
            header: true,
            columns
        }, async (err, output) => {
            if (err) {
                reject(err)
            } else {

                if (dest === false) {

                    resolve(output)

                } else {

                    await fs.promises.writeFile(dest, output)
                    resolve()

                }
            }
        })
    })
}

function randomName(gender) {

    return new Promise(async (resolve, reject) => {

        const hoTxt = await fs.promises.readFile(path.resolve(__dirname, '../data/ho.txt'), {encoding: 'utf-8'})
        const hoArray = hoTxt.split(/\r?\n|\r|\n/g)

        const tenNamTxt = await fs.promises.readFile(path.resolve(__dirname, '../data/ten_nam.txt'), {encoding: 'utf-8'})
        const tenNamArray = tenNamTxt.split(/\r?\n|\r|\n/g)

        const tenNuTxt = await fs.promises.readFile(path.resolve(__dirname, '../data/ten_nu.txt'), {encoding: 'utf-8'})
        const tenNuArray = tenNuTxt.split(/\r?\n|\r|\n/g)

        const randomHo = hoArray[Math.floor(Math.random() * hoArray.length)]
        const randomTenNam = tenNamArray[Math.floor(Math.random() * tenNamArray.length)]
        const randomTenNu = tenNuArray[Math.floor(Math.random() * tenNuArray.length)]

        let ten = ''

        if (gender === 'Male') {
            ten = randomTenNam
        } else {
            ten = randomTenNu
        }

        resolve({
            ho: randomHo,
            ten: ten
        })

    })

}

function randomNumber(length) {
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1))
}

function randomNumberRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function getSetting(name = 'settings') {

    const file = path.resolve(app.getPath('userData'), name+'.json')

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify({}), 'utf-8')
    }

    const data = JSON.parse(fs.readFileSync(file))

    if (!data.general?.chromePath?.value) {
        data.general = {
            chromePath: {
                value: findChrome(),
                type: 'text'
            }
        }
    }

    return data

}

function getTempEmail() {

    return new Promise(async (resolve, reject) => {

        try {

            const res = await axios.get('https://10minutemail.net/')

            const cookies = res.headers['set-cookie']

            const $ = cheerio.load(res.data)

            const address = $('#fe_text').val()

            resolve({address, cookies})

        } catch {}
    })
}

function getTempEmailInbox(cookie) {

    return new Promise(async (resolve, reject) => {

        try {

            const res = await axios.get('https://10minutemail.net/', {
                headers: {cookie}
            })

            const $ = cheerio.load(res.data)

            const inbox = []
            const email = $('#fe_text').val()

            $('#maillist').each(function() {
                const title = $(this).find('td:nth-child(1)').text()
                const content = $(this).find('td:nth-child(2)').text()

                inbox.push({title, content})
            })

            resolve({email, inbox})

        } catch {
            reject()
        }
    })
}

function cleanTemp() {
    return new Promise(async (resolve, reject) => {

        try {
            const temp = (await fs.promises.readdir(app.getPath('temp'))).filter(item => {
                return item.includes('profile_')
            })

            for (let index = 0; index < temp.length; index++) {
                await fs.remove(app.getPath('temp')+'/'+temp[index])
            }
        } catch {
        }

        resolve()
    })
}

function saveSetting(data, name = 'settings') {

    if (name === 'settings' && data.general && data.change && data.page && data.xmdt && data.bm) {

        const file = path.resolve(app.getPath('userData'), name+'.json')

        fs.writeFileSync(file, JSON.stringify(data), 'utf-8')

    } else {

        const file = path.resolve(app.getPath('userData'), name+'.json')

        fs.writeFileSync(file, JSON.stringify(data), 'utf-8')

    }

}

function checkLicense() {
    return new Promise(async (resolve, reject) => {

        const key = await machineId({original: true})

        try {

            const res = await fetch('https://toolfb.vn/checkLicense/1/'+key)
            const data = await res.json()

            data.key = key

            resolve(data)

        } catch (err) {


            reject()

        }

    })
}

function getPrices() {
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://toolfb.vn/getPrices/1/')
            const data = await res.json()

            resolve(data)

        } catch (err) {

            reject()

        }

    })
}

function checkRef(ref, keyId) {
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://toolfb.vn/checkRef/'+keyId+'/'+ref)
            const data = await res.json()

            resolve(data)

        } catch (err) {

            reject()

        }

    })
}

function checkLinked(email, message, ip = '') {

    return new Promise(async (resolve, reject) => {
        try {

            message('Đang check liên kết email')

            const agent = useProxy(ip)

            const res1 = await fetch('https://www.facebook.com/login/identify', {agent})
            const $ = cheerio.load(await res1.text())
            const jazoest = $('input[name="jazoest"]').val()
            const lsd = $('input[name="lsd"]').val()

            const res2 = await fetch("https://www.facebook.com/ajax/login/help/identify.php?ctx=recover", {
                agent,
                headers: {
                    "accept": "*/*",
                    "accept-language": "vi",
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-asbd-id": "129477",
                    "x-fb-lsd": lsd
                },
                body: "jazoest="+jazoest+"&lsd="+lsd+"&email="+email+"&did_submit=1&__user=0&__a=1&__req=5&__hs=19540.BP%3ADEFAULT.2.0..0.0&dpr=1.5&__ccg=GOOD&__rev=1007781386&__s=z08yp5%3A5gfrhm%3Ahner6x&__hsi=7251100562605273139&__dyn=7xeUmwkHg7ebwKBWo5O12wAxu13wqovzEdEc8uxa0CEbo1nEhwem0nCq1ewcG0KEswIwuo2awt81s8hwnU14E9k2C2218wc61uwZx-0z8jwae4Ueo2swkEbEaU2ewnE2Lx-0iS2S3qazo11E2ZwrU6C0L85C1Iw&__csr=&__spin_r=1007781386&__spin_b=trunk&__spin_t=1688278411",
                method: "POST",
            })

            const html = await res2.text()
            
            if (html.includes('redirectPageTo')) {
                resolve('Còn liên kết')
            } else {
                resolve('Mất liên kết')
            }

        } catch {
            resolve('Check liên kết lỗi')
        }
    })
}

function checkLive(uid) {

    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://graph2.facebook.com/v3.3/'+uid+'/picture?redirect=0')
            const data = await res.json()

            if (data.data.width && data.data.height) {
                resolve()
            } else {
                reject()
            }

        } catch {
            reject()
        }
    })

}

function deleteInbox(user, password) {

    return new Promise(async (resolve, reject) => {

        try {

            const config = {
                imap: {
                    user: user.trim(),
                    password: password.trim(),
                    host: 'imap-mail.outlook.com',
                    port: 993,
                    tls: true,
                    authTimeout: 10000
                }
            }
    
            const searchCriteria = ['UNSEEN']
        
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: true
            }
    
            const connection = await imaps.connect(config)

            await connection.openBox('INBOX')
            
            const results = await connection.search(searchCriteria, fetchOptions)
                    
            const subjects = results.map(function (res) {
        
                const header =  res.parts.filter(function (part) {
                    return part.which === 'HEADER'
                })
        
                const body =  res.parts.filter(function (part) {
                    return part.which === 'TEXT'
                })
        
                const contentRaw = quotedPrintable.decode(body[0].body.replace(/=\r\n/g, "").replace(/\r\n/g, ""))

                const content = contentRaw.match(/<html>(.*?)<\/html>/g)
                
                return {
                    uid: res.attributes.uid,
                    from: header[0].body.from[0],
                    title: header[0].body.subject[0],
                    content: content ? content[0] : ''
                }
                
            }).filter(item => item.content.includes('https://www.facebook.com/hacked/disavow')).map(item => item.uid)

            for (let index = 0; index < subjects.length; index++) {
                
                await connection.deleteMessage(subjects[index])
                
            }

            resolve()

        } catch {
            reject()
        }

    })

}

function checkImap(user, password) {

    return new Promise(async (resolve, reject) => {
        const config = {
            imap: {
                user: user.trim(),
                password: password.trim(),
                host: 'imap-mail.outlook.com',
                port: 993,
                tls: true,
                authTimeout: 10000
            }
        }

        let status = false

        try {
    
            await imaps.connect(config)
            
            status = true

        } catch (err) {
        }

        resolve(status)

    })

}

function getBackupLink(user, password, mode) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const client = new ImapFlow({
                host: 'imap-mail.outlook.com',
                port: 993,
                secure: true,
                logger: false,
                auth: {
                    user: user,
                    pass: password
                }
            })

            let search = { seen: false }

            if (mode === 'all') {
                search = { all: true }
            }

            await client.connect()

            let lock = await client.getMailboxLock('INBOX')

            await client.messageFlagsSet({seen: false}, ['\\Seen'])

            let messages = []

            try {
                    
                for await (let message of client.fetch(search, { 
                    envelope: true,
                    source: true,
                    
                })) {
        
                    const content = await simpleParser(message.source)
        
                    messages.push({
                        uid: message.uid,
                        from: message.envelope.from[0].address,
                        title: message.envelope.subject,
                        content: content.html,
                    })
                }

            } finally {
                lock.release()
            }

            await client.logout()

            const result = []

            for (let index = 0; index < messages.length; index++) {

                const $ = cheerio.load(messages[index].content)

                const link = $('a[href^="https://fb.me/"]').attr('href')
                const mail = $('a[href^="mailto:"]').attr('href')
                const user = mail.split('@')[0]
                const bmId = user.split('-')[1]

                if (link) {
                    result.push(bmId+'|'+link)
                }
            }

            resolve(result)

        } catch (err) {
            console.log(err)
            reject()
        }

    })
}

function checkAdsEmail(user, password) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const config = {
                imap: {
                    user,
                    password,
                    host: 'imap-mail.outlook.com',
                    port: 993,
                    tls: true,
                    authTimeout: 10000
                }
            }

            let searchCriteria = ['ALL']
                
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: true
            }

    
            const connection = await imaps.connect(config)
        
            await connection.openBox('INBOX')
        
            const results = await connection.search(searchCriteria, fetchOptions)
                    
            const subjects = results.map(function (res) {
        
                const header =  res.parts.filter(function (part) {
                    return part.which === 'HEADER'
                })
        
                const body =  res.parts.filter(function (part) {
                    return part.which === 'TEXT'
                })
        
                const contentRaw = quotedPrintable.decode(body[0].body.replace(/=\r\n/g, "").replace(/\r\n/g, ""))

                const content = contentRaw.match(/<html>(.*?)<\/html>/g)
                
                return {
                    uid: res.attributes.uid,
                    from: header[0].body.from[0],
                    title: header[0].body.subject[0],
                    content: content ? content[0] : ''
                }
                
            })

            const result = subjects.filter(item => item.from.includes('advertise-noreply@support.facebook.com'))

            if (result[0]) {
                resolve(true)
            } else {
                resolve(false)
            }

        } catch (err) {

            console.log(err)

            reject()
        }

    })
}

function checkHacked(user, password, linkHacked) {

    return new Promise(async (resolve, reject) => {

        let timer = setTimeout(reject, 60000)

        let success = false
        let link = ''

        try {

            if (linkHacked) {

                const res = await fetch(linkHacked)
                const html = await res.text()

                if (!html.includes('name="email"')) {

                    success = true
                    link = linkHacked
                } else {
                    success = false
                    link = linkHacked
                }

            } else {

                const config = {
                    imap: {
                        user,
                        password,
                        host: 'imap-mail.outlook.com',
                        port: 993,
                        tls: true,
                        authTimeout: 10000
                    }
                }
            
                const searchCriteria = ['ALL']
            
                const fetchOptions = {
                    bodies: ['HEADER', 'TEXT'],
                    markSeen: true
                }

            
                const connection = await imaps.connect(config)
            
                await connection.openBox('INBOX')
            
                const results = await connection.search(searchCriteria, fetchOptions)
                        
                const subjects = results.map(function (res) {
            
                    const header =  res.parts.filter(function (part) {
                        return part.which === 'HEADER'
                    })
            
                    const body =  res.parts.filter(function (part) {
                        return part.which === 'TEXT'
                    })
            
                    const contentRaw = quotedPrintable.decode(body[0].body.replace(/=\r\n/g, "").replace(/\r\n/g, ""))

                    const content = contentRaw.match(/<html>(.*?)<\/html>/g)
                    
                    return {
                        uid: res.attributes.uid,
                        from: header[0].body.from[0],
                        title: header[0].body.subject[0],
                        content: content ? content[0] : ''
                    }
                    
                }).filter(item => item.content.includes('https://www.facebook.com/hacked/disavow')).map(item => {

                    const $ = cheerio.load(item.content)

                    return $('a[href^="https://www.facebook.com/hacked/disavow"]').attr('href')

                }).reverse()

                for (let index = 0; index < subjects.length; index++) {
                    
                    const res = await fetch(subjects[index])
                    const html = await res.text()

                    if (!html.includes('name="email"')) {

                        link = subjects[index]
                        success = true

                        break
                    }
                    
                }    

            }

            clearTimeout(timer)

            if (success) {
                resolve({
                    status: 'Check Hacked: OK',
                    link
                })
            } else {
                resolve({
                    status: 'Check Hacked: FAILED',
                    link
                })
            }  

        } catch {
            clearTimeout(timer)
            reject()
        }

    })
}

function readMailInbox(user, password) {
    return new Promise(async (resolve, reject) => {
        const config = {
            imap: {
                user,
                password,
                host: 'imap-mail.outlook.com',
                port: 993,
                tls: true,
                authTimeout: 10000
            }
        }
    
        const searchCriteria = ['UNSEEN']
    
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: true
        }

        try {
    
            const connection = await imaps.connect(config)
        
            await connection.openBox('INBOX')
        
            const results = await connection.search(searchCriteria, fetchOptions)
                    
            const subjects = results.map(function (res) {
        
                const header =  res.parts.filter(function (part) {
                    return part.which === 'HEADER'
                })
        
                const body =  res.parts.filter(function (part) {
                    return part.which === 'TEXT'
                })
        
                const contentRaw = quotedPrintable.decode(body[0].body.replace(/=\r\n/g, "").replace(/\r\n/g, ""))

                const content = contentRaw.match(/<html>(.*?)<\/html>/g)
                
                return {
                    from: header[0].body.from[0],
                    title: header[0].body.subject[0],
                    content: content ? content[0] : body[0].body
                }
                
            })

            subjects.reverse()

            if (subjects.length) {
                resolve(subjects)
            } else {
                reject()
            }
           

        } catch (err) {
            reject(err)
        }
    })
}

function getMailInboxes(user, password, service = 'facebook') {

    return new Promise(async (resolve, reject) => {
        const config = {
            imap: {
                user,
                password,
                host: 'imap-mail.outlook.com',
                port: 993,
                tls: true,
                authTimeout: 10000
            }
        }
    
        const searchCriteria = ['UNSEEN']
    
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: true
        }

        try {
    
            const connection = await imaps.connect(config)
        
            await connection.openBox('INBOX')
        
            const results = await connection.search(searchCriteria, fetchOptions)
                    
            const subjects = results.map(function (res) {
        
                const header =  res.parts.filter(function (part) {
                    return part.which === 'HEADER'
                })
        
                const body =  res.parts.filter(function (part) {
                    return part.which === 'TEXT'
                })
        
                const contentRaw = quotedPrintable.decode(body[0].body.replace(/=\r\n/g, "").replace(/\r\n/g, ""))

                const content = contentRaw.match(/<html>(.*?)<\/html>/g)
                
                return {
                    from: header[0].body.from[0],
                    title: header[0].body.subject[0],
                    content: content ? content[0] : ''
                }
                
            }).filter(item => {
                return item.from.includes(service)
            }).map(item => {

                let code = null
                let link = null

                if (service === 'instagram') {

                    const codeMatches = item.content.match(/([0-9]{6,8})/)

                    if (codeMatches[0]) {
                        code = codeMatches[0]
                    } 

                } else {

                    const codeMatches1 = item.content.match(/<center>([0-9]{6,8})<\/center>/)
                    const codeMatches2 = item.title.match(/([0-9]{6,8})/)
                    const codeMatches3 = item.content.match(/<span[^>]*>([0-9]{8})<\/span>/)

                    const $ = cheerio.load(item.content)

                    link = $('a[href^="https://www.facebook.com/confirmcontact.php"]').attr('href') || null

                    if (link) {
                        code = url.parse(link, true).query.c
                    } else if (codeMatches1) {
                        code = codeMatches1[1]
                    } else if (codeMatches2) {
                        code = codeMatches2[1]
                    } else if (codeMatches3) {
                        code = codeMatches3[1]
                    }

                }

                return {link, code}

            }).filter(item => {
                return item.link || item.code
            })

            subjects.reverse()

            if (subjects.length) {
                resolve(subjects[0])
            } else {
                reject()
            }
           

        } catch (err) {

            console.log(err)

            reject(err)
        }
    })
}

function getMailCode(email, pass) {

    return new Promise(async (resolve, reject) => {

        let timer = setTimeout(() => {
            return reject()
        }, 200000)

        let data = false

        for (let index = 0; index < 99999; index++) {
            
            try {

                const inboxes = await getMailInboxes(email, pass)

                if (inboxes.link || inboxes.code) {

                    data = inboxes

                    break
                }

            } catch {

            }

            await delayTimeout(2000)
            
        }

        clearTimeout(timer)

        if (data) {
            resolve(data)
        } else {
            reject()
        }

    })

}

function delayTimeout(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time)
    })
}

function getCodeBrowser(page, newMailId) {
    
    return new Promise(async (resolve, reject) => {

        const z = new zFetch(page)
        
        try {

            let newId = newMailId
            let code = ''

            for (let index = 0; index < 999; index++) {
                
                try {

                    const email = await z.getInbox(page)

                    const codeMatch = email.content.match(/([0-9]{6,8})/)

                    if (newId && email.id !== newId && codeMatch[0] && email.from.includes('facebook')) {

                        code = codeMatch[0]

                        break
                    } else {
                        newId = email.id
                    }

                } catch {}

                await page.waitForTimeout(1000)
                
            }

            if (code) {
                resolve(code)
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
            reject()
        }
    
    })
}

function checkGetnadaInbox(email) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await fetch('https://getnada.com/api/v1/inboxes/'+email)
            const inbox = await res.json()

            const recoverInbox = inbox.msgs.filter(item => {
                return item.fe == 'account-security-noreply@accountprotection.microsoft.com'
            })

            if (recoverInbox[0]) {

                const resContent = await fetch('https://getnada.com/api/v1/messages/html/'+recoverInbox[0].uid)

                const html = await resContent.text()

                const code = html.replaceAll(/<\/?[^>]+(>|$)/gi, "").replace(email, '').match(/\d+/)

                if (code[0]) {
                    resolve(code[0])
                } else {
                    reject()
                }

            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

function useProxy(proxy) {

    try {

        const parts = proxy ? proxy.split(':') : []

        let agent = false

        if (parts[0] && parts[1]) {

            if (parts[2] && parts[3]) {
                agent = new HttpsProxyAgent(`http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`)
            } else {
                agent = new HttpsProxyAgent(`http://${parts[0]}:${parts[1]}`)
            }

        }

        return agent

    } catch {
        return false
    }

}

function getTmMail(service, domain = '', proxy = '') {

    return new Promise(async (resolve, reject) => {

        let timeout = setTimeout(reject, 30000)

        try {

            if (service === 'mail.tm') {
                resolve(await getMailTm(proxy))
            }

            if (service === 'emailfake.com') {
                resolve(await createFakeEmail('emailfake', domain, proxy))
            }

            if (service === 'generator.email') {

                resolve(await createFakeEmail('generator', domain, proxy))
            }

            if (service === 'moakt.com') {
                resolve(await getMoAktMail(domain, proxy))
            }

            if (service === 'gmail.com') {

                const setting = await getSetting()
                const key = setting.general.instaMailApi.value

                resolve(await getGmail(key, proxy))

            }

            if (service === 'gmx.live') {

                const setting = await getSetting()
                const key = setting.general.emailKey.value

                resolve(await getGmxMail(key, proxy))
            }

            if (service === 'hotmail.com') {

                const mail = new Db('hotmail')

                const data = await mail.findRandom(item => item)

                await mail.update(data.id, {running: true})

                resolve({
                    id: data.id,
                    address: data.email,
                    password: data.password
                })

            }

        } catch (err) {

            console.log(err)

            reject(err)
        }

        clearTimeout(timeout)
    })
}

function getTmMailInbox(emailData, service, proxy = '') {

    return new Promise(async (resolve, reject) => {
        try {

            if (service === 'mail.tm') {
                resolve(await getMailTmInbox(emailData))
            }

            if (service === 'emailfake.com') {
                resolve(await getFakeMailInbox('emailfake', emailData, proxy))
            }

            if (service === 'generator.email') {
                resolve(await getFakeMailInbox('generator', emailData, proxy))
            }

            if (service === 'moakt.com') {
                resolve(await getMoAktMailInbox(emailData, proxy))
            }

            if (service === 'gmail.com') {

                const setting = await getSetting()
                const key = setting.general.instaMailApi.value

                resolve(await getGmailInbox(key, emailData))

            }

            if (service === 'hotmail.com') {

                const code = await getMailInboxes(emailData.address, emailData.password, 'instagram')

                const mail = new Db('hotmail')

                await mail.delete(emailData.id)

                resolve([{
                    from: 'mail.instagram.com', 
                    code: code[0].code
                }])

            }

        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

function getGmail(key) {
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://boxreceive.com/DataMail/Mail/'+key+'/Instagram')
            const data = await res.json()

            resolve({
                address: data.orders.gmail,
                id: data.orders.order_id
            })

        } catch {
            reject()
        }
        
    })
}

function getGmailInbox(key, emailData) {
    return new Promise(async (resolve, reject) => {

        let code = false

        for (let index = 0; index < 12; index++) {

            try {

                const res = await fetch('https://boxreceive.com/DataMail/Mail/'+key+'/'+emailData.id)
                const data = await res.json()
                
                code = data.orders.otp

                if (code) {
                    break
                }

            } catch (err) { console.log(err) }

            await delayTimeout(5000)

        }

        if (code) {
            resolve([{
                from: 'mail.instagram.com', 
                code: code
            }])
        } else {
            reject()
        }

    })
}

function getMoAktMail2(email, agent) {
    return new Promise(async (resolve, reject) => {

        try {
            const username = email.split('@')[0]
            const domainName = email.split('@')[1]

            const res = await fetch("https://moakt.com/vi/inbox", {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "content-type": "application/x-www-form-urlencoded",
                },
                "agent": agent,
                "redirect": "manual",
                "body": "domain="+domainName+"&username="+username+"&setemail=T%E1%BA%A1o+m%E1%BB%9Bi&preferred_domain=disbox.net",
                "method": "POST"
            })

            const cookie = getCookies(res)

            const res2 = await fetch("https://moakt.com/vi/inbox", {
				"headers": {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					"cookie": cookie,
				},
                "agent": agent,
				"body": null,
				"method": "GET"
			})

			const $ = cheerio.load(await res2.text())

			const address = $('#email-address').text()

            if (address) {
                resolve({address, cookie})
            } else {
                reject()
            }

        } catch (err) {
            reject(err)
        }

    })
}

function getMoAktMail(domain = 'random', proxy, email = false) {
	return new Promise(async (resolve, reject) => {
		try {

            const domains = [
                'teml.net',
                'tmpeml.com',
                'tmpbox.net',
                'moakt.cc',
                'disbox.net',
                'tmpmail.org',
                'tmpmail.net',
                'tmails.net',
                'disbox.org',
                'moakt.co',
                'moakt.ws',
                'tmail.ws',
                'bareed.ws',
            ]

            let domainName = false
        
            if (domain === 'random') {
                const random = Math.floor(Math.random() * domains.length);
                
                domainName = domains[random]
            } else {

                
                domainName = domain

            }

            const setting = await getSetting()

            if (setting.general.customSubDomain.value) {

                const sub = generator.generate({
                    length: 6,
                    numbers: true,
                    uppercase: false
                })

                domainName = sub+'.'+domainName
            }
        
            const agent = useProxy(proxy)

            const username = generateUsername('', 15).replaceAll('-', '')+randomNumberRange(11111, 99999)

			const res = await fetch("https://moakt.com/vi/inbox", {
				"headers": {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					"content-type": "application/x-www-form-urlencoded",
				},
                "agent": agent,
				"redirect": "manual",
				"body": "domain="+domainName+"&username="+username+"&setemail=T%E1%BA%A1o+m%E1%BB%9Bi&preferred_domain=disbox.net",
				"method": "POST"
			})

			const cookie = getCookies(res)

			const res2 = await fetch("https://moakt.com/vi/inbox", {
				"headers": {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					"cookie": cookie,
				},
                "agent": agent,
				"body": null,
				"method": "GET"
			})

			const $ = cheerio.load(await res2.text())

			let address = $('#email-address').text()

            if (email) {
                
                const res = await fetch("https://moakt.com/vi/inbox/change", {
                    "headers": {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest",
                        "cookie": cookie,
                        "Referer": "https://moakt.com/vi/inbox",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": "username="+email,
                    "method": "POST"
                })

                const data = await res.json()

                address = data.data.address.email

                console.log(data.data.address.email)

            }

			resolve({address, cookie})

		} catch (err) {

            console.log(err)

			reject()
		}
	})
}

function getGmxMail(key, proxy) {
    return new Promise(async (resolve, reject) => {

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://clonefbig.vn/api/buy_product', {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                "agent": agent,
                "body": "action=buyProduct&id=543&amount=1&coupon=&api_key="+key,
                "method": "POST"
            })
            
            const data = await res.json()

            resolve({
                address: data.data[0].split('|')[0],
                password: data.data[0].split('|')[1],
            })

        } catch (err) {
            reject(err)
        }
        
    })
}

function getGmxInboxes(emailData, lastMessages) {

    return new Promise(async (resolve, reject) => {
		try {
        
			let code = false

			for (let index = 0; index < 30; index++) {

                try {

                    const messages = []

                    const res = await fetch("https://gmx.live/login/api.php?login="+emailData.address+"|"+emailData.password)
                    const $ = cheerio.load(await res.text())

                    $('a').each(function() {
                        messages.push($(this).attr('href'))
                    })

                    const message = messages.filter(item => !lastMessages.includes(item))

                    if (message[0]) {

                        const res = await fetch(message[0])
                        const data = await res.text()

                        try {

                            const codeMatch = data.match(/(?<=>)(\d+)(?=<)/g)
    
                            code = codeMatch[0]
    
                            break
    
                        } catch {}

                    }

                } catch {
                    await delayTimeout(3000)
                }

			}

			if (code) {

				resolve([{
                    from: 'mail.instagram.com', 
                    code: code
                }])

			} else {
				reject()
			}

		} catch (err) {
			console.log(err)
			reject()
		}
	})

}

function getMoAktMailInbox(emailData, proxy) {
    
	return new Promise(async (resolve, reject) => {
		try {

            const agent = useProxy(proxy)

			let code = false

			for (let index = 0; index < 30; index++) {

                try {

                    let res = await fetch("https://moakt.com/vi/inbox", {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "cookie": emailData.cookie,
                        },
                        "agent": agent,
                        "body": null,
                        "method": "GET"
                    })

                    let $ = cheerio.load(await res.text())

                    const emails = []

                    $('td:not(#email-control):not(#email-sender) > a:not(.is_read)').each(function() {
                        const url = $(this).attr('href')

                        emails.push('https://moakt.com'+url+'/content')
                        
                    })
                        
                    const email = emails[0]

                    res = await fetch(email, {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "cookie": emailData.cookie,
                        },
                        "agent": agent,
                        "body": null,
                        "method": "GET"
                    })

                    const content = await res.text()

                    try {

                        const codeMatch = content.match(/(?<=>)(\d+)(?=<)/g)

                        code = codeMatch[0]

                        break

                    } catch {}

                } catch {
                    await delayTimeout(3000)
                }

			}

			if (code) {

				resolve([{
                    from: 'mail.instagram.com', 
                    code: code
                }])

			} else {
				reject()
			}

		} catch (err) {
			console.log(err)
			reject()
		}
	})
}

function createFakeEmail(service, domain = 'random', proxy) {

    return new Promise(async (resolve, reject) => {

        let domains = []
        let host = ''

        if (service === 'emailfake') {

            host = 'https://emailfake.com/'

            domains = [
                'naveganas.com',
                'mancoprosthetics.com',
                '54.mk',
                'packmein.life',
                'boranora.com',
                'thinhmin.com',
                'evgeniyvis.website',
                '4xunit.com',
                'bimbetka.com',
                'code-gmail.com',
                '24hinbox.com',
                'gmailvn.com',
                'anio.site',
                'adsensekorea.com',
                'hieu.in',
            ]
        } else {

            host = 'https://generator.email/'

            domains = [
                'hotmail.red',
                'otpku.com',
                'xbox-zik.com',
                'warunkpedia.com',
                'poilkj.xyz',
                'taikhoanfb.shop',
                '24hinbox.com',
                'jerryscot.site',
                'tubidu.com',
                'boranora.com',
                'naveganas.com',
                'sievid.com',
                'plexvenet.com',
                'rtrwebsites.com',
                'gmailos.com',
            ]
        }
        
        try {
    
            let domainName = false
        
            if (domain === 'random') {
                const random = Math.floor(Math.random() * domains.length);
                
                domainName = domains[random]
            } else {
                domainName = domain
            }
        
            const user = generateUsername('.', 10)

            const agent = useProxy(proxy)
            
            const res = await fetch(host, {
                "headers": {
                    "cookie": "surl="+domainName+"/"+user+";"
                },
                "agent": agent,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })
        
            const $ = cheerio.load(await res.text())
        
            const email = $('#email_ch_text').text()

            if (email === user+'@'+domainName) {

                const postId = (/{ recieved: "(.*)"}\).done\(function\( data \) { rec_offline/g.exec($.html()))[1]

                const res = await fetch(host+"del_mail.php", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                    "body": "dellall="+postId,
                    "method": "POST",
                })

                resolve({
                    address: email,
                    password: ''
                })
            }

        } catch (err) {
            reject(err)
        }
     
    })
    
}

function deleteFakeEmailInbox(service, data, proxy) {
    return new Promise(async (resolve, reject) => {
        const domainName = (data.address.split('@'))[1]
        const user = (data.address.split('@'))[0]

        let host = ''

        if (service === 'emailfake') {
            host = 'https://emailfake.com/'
        } else {
            host = 'https://generator.email/'
        }
        
        try {

            const agent = useProxy(proxy)

            const res = await fetch(host, {
                "headers": {
                    "cookie": "surl="+domainName+"/"+user+";"
                },
                "agent": agent,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })

            const resData = await res.text()
            const del = resData.split(';jQuery.post( "//generator.email/del_mail.php", { recieved: "')[1].split(`"}).done(function( data )`)[0]

            await fetch("https://generator.email/del_mail.php", {
                "headers": {
                    "accept": "*/*",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "cookie": "surl="+domainName+"/"+user+";"
                },
                "agent": agent,
                "body": "delll="+del,
                "method": "POST"
            })

            await fetch("https://generator.email/del_mail.php", {
                "headers": {
                    "accept": "*/*",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "cookie": "surl="+domainName+"/"+user+";"
                },
                "agent": agent,
                "body": "dellall="+del,
                "method": "POST"
            })

            resolve()

        } catch (err) {
            reject(err)
        }
    })
}

function getFakeMailInbox(service, data, proxy) {

    return new Promise(async (resolve, reject) => {

        const domainName = (data.address.split('@'))[1]
        const user = (data.address.split('@'))[0]

        let host = ''

        if (service === 'emailfake') {
            host = 'https://emailfake.com/'
        } else {
            host = 'https://generator.email/'
        }
        
        try {

            const agent = useProxy(proxy)

            const res = await fetch(host, {
                "headers": {
                    "cookie": "surl="+domainName+"/"+user+";"
                },
                "agent": agent,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })

            const $ = cheerio.load(await res.text())

            const from = $('#email-table div[class*="from_div_"]').text()
            const content = $('.mess_bodiyy').html()

            let code = false

            try {

                const codeMatch = content.match(/(?<=>)(\d+)(?=<)/g)

                code = codeMatch[0]

            } catch {}


            resolve([{
                from,
                code,
            }])


        } catch (err) {
            reject(err)
        }

    })
}

function getMailTm(proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            for (let index = 0; index < 999; index++) {

                const address = generateUsername('-', 10)+'@desertsundesigns.com'

                const password = generator.generate({
                    length: 12,
                    numbers: true
                })

                const auth = JSON.stringify({
                    address, password
                })

                const agent = useProxy(proxy)

                const res = await fetch('https://api.mail.tm/accounts', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    body: auth,
                    agent,
                    method: 'POST',
                })

                const data = await res.json()

                if (data.address) {

                    const res = await fetch('https://api.mail.tm/token', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': '*/*'
                        },
                        agent,
                        body: auth,
                        method: 'POST',
                    })

                    const data = await res.json()

                    if (data.token) {
                        return resolve({
                            token: data.token,
                            address,
                            password
                        })
                    }

                }

            }

        } catch (err) {
            reject(err)
        }

    })
}

function getMailTmInbox(authData, proxy = '') {

    return new Promise(async (resolve, reject) => {
        
        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://api.mail.tm/messages', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': 'Bearer '+authData.token,
                },
                agent
            })

            const result = await res.json()

            if (result['hydra:member']) {

                const inbox = result['hydra:member']

                const data = []

                for (let index = 0; index < inbox.length; index++) {
                    
                    if (!inbox[index].seen) {

                        await fetch('https://api.mail.tm/messages/'+inbox[index].id, {
                            headers: {
                                'Content-Type': 'application/merge-patch+json',
                                'Accept': '*/*',
                                'Authorization': 'Bearer '+authData.token,
                            },
                            agent,
                            body: JSON.stringify({seen: true}),
                            method: 'PATCH'
                        })

                        const res = await fetch('https://api.mail.tm/messages/'+inbox[index].id, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': '*/*',
                                'Authorization': 'Bearer '+authData.token,
                            },
                            agent
                        })

                        const result = await res.json()

                        let code = false

                        try {
                            code = result.html[0].split('<span style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:22px;line-height:22px;font-weight:bold;letter-spacing:5px;">')[1].split('</span></p></p></div></span></td>')[0]

                        } catch {}

                        try {
                            code = result.html[0].split('<td style="padding:10px;color:#565a5c;font-size:32px;font-weight:500;text-align:center;padding-bottom:25px;">')[1].split('</td></td></tr><td')[0]
                        } catch {}

                        if (code) {

                            data.push({
                                from: result.from.address,
                                date: result.retentionDate,
                                code
                            })

                        }

                    }
                    
                }

                resolve(data)

            }

        } catch (err) {
            console.log(err)
            reject()
        }
    })
}

function getPhone(service, key, proxy = '', simService = 'facebook') {

    return new Promise(async (resolve, reject) => {

        let phone = ''

        for (let index = 0; index < 99; index++) {
            
            try {

                if (service === 'chothuesimcode') {
                    phone = await getPhoneChoThueSimCode(key, proxy, simService)
                }
    
                if (service === 'viotp') {
                    phone = await getPhoneViOtp(key, proxy, simService)
                }
    
                if (service === 'xotp') {
                    phone = await getPhoneXotp(key, proxy, simService)
                }
    
                if (service === 'otponline') {
                    phone = await getPhoneOtpOnline(key, proxy, simService)
                }
    
                if (service === 'sim24') {
                    phone = await getPhoneSim24(key, proxy, simService)
                }

                if (service === '233io9') {
                    phone = await getPhone233(key, proxy, simService)
                }

                if (service === 'simotp') {
                    phone = await getPhoneSimOtp(key, proxy, simService)
                }

                if (service === 'usotp') {
                    phone = await getPhoneUsOtp(key, proxy, simService)
                }

                if (service === 'bossotp') {
                    phone = await getPhoneBossOtp(key, proxy, simService)
                }

                if (service === 'custom') {
                    phone = await getPhoneCustom(key, proxy, simService)
                }

                if (service === 'vip') {
                    phone = await getPhoneVip()
                }

                if (service === 'otpusnews') {
                    phone = await getPhoneOtpUs(key, proxy, simService)
                }

                if (service === 'otptextnow') {
                    phone = await getPhoneOtpText(key, proxy, simService)
                }

                if (service === 'template') {
                    phone = await getPhoneTemplate(proxy)
                }
                

                break
    
            } catch (err) {
                console.log(err)
            }
            
        }

        if (phone) {
            resolve(phone)
        } else {
            reject()
        }

    })

}

function getPhoneCode(service, key, id, proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            let code = ''

            const setting = await getSetting()

            const number = await setting.general.getCodeNumber?.value || 12

            if (service === 'chothuesimcode') {
                code = await getPhoneCodeChoThueSimCode(number, key, id, proxy)
            }

            if (service === 'viotp') {
                code = await getPhoneCodeViOtp(number, key, id, proxy)
            }

            if (service === 'xotp') {
                code = await getPhoneCodeXotp(number, key, id, proxy)
            }

            if (service === 'otponline') {
                code = await getPhoneCodeOnlineOtp(number, key, id, proxy)
            }

            if (service === 'sim24') {
                code = await getPhoneCodeSim24(number, key, id, proxy)
            }

            if (service === '233io9') {
                code = await getPhoneCode233(number, key, id, proxy)
            }

            if (service === 'simotp') {
                code = await getPhoneCodeSimOtp(number, key, id, proxy)
            }

            if (service === 'usotp') {
                code = await getPhoneCodeUsOtp(number, key, id, proxy)
            }

            if (service === 'bossotp') {
                code = await getPhoneCodeBossOtp(number, key, id, proxy)
            }

            if (service === 'custom') {
                code = await getPhoneCodeCustom(number, key, id, proxy)
            }

            if (service === 'vip') {
                code = await getPhoneCodeVip(number, id)
            }

            if (service === 'otpusnews') {
                code = await getPhoneCodeOtpUs(number, key, id, proxy)
            }

            if (service === 'otptextnow') {
                code = await getPhoneCodeOtpText(number, key, id, proxy)
            }

            if (service === 'template') {
                code = await getPhoneCodeTemplate(number, id, proxy)
            }


            if (code) {
                resolve(code)
            } else {
                reject()
            }

        } catch (err) {

            reject(err)
        }

    })

}

function getObjPath(obj,is, value) {
    if (typeof is == 'string')
        return getObjPath(obj,is.split('.'), value);
    else if (is.length==1 && value!==undefined)
        return obj[is[0]] = value;
    else if (is.length==0)
        return obj;
    else
        return getObjPath(obj[is[0]],is.slice(1), value);
}

function getPhoneTemplate(proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            const setting = await getSetting()

            const id = setting.general.customPhone.value 

            const phone = new Db('customPhone')

            const data = await phone.findById(id)

            const agent = useProxy(proxy)

            const res = await fetch(data.apiGetPhone, {agent})

            const resData = await res.json()

            const number = getObjPath(resData, data.phoneValue)
            const phoneId = getObjPath(resData, data.idValue)
            const prefix = data.phonePrefix ?? ''

            if (number && phoneId) {

                if (data.phoneDelay) {
                    await delayTimeout(data.phoneDelay * 100)
                }

                resolve({
                    number: prefix + number,
                    id: phoneId,
                })
                
            } else {
                reject('Không thể lấy số điện thoại')
            }
            

        } catch (err) {
            console.log(err)
            reject('Không thể lấy số điện thoại')
        }

        

    })

}

function getPhoneCodeTemplate(number, id, proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            const setting = await getSetting()

            const phoneId = setting.general.customPhone.value 

            const phone = new Db('customPhone')

            const data = await phone.findById(phoneId)

            const agent = useProxy(proxy)

            let code = false

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)

                try {
                
                    const res = await fetch(data.apiGetCode.replace('{id}', id), {agent})
                    
                    const resData = await res.json()

                    code = getObjPath(resData, data.codeValue).match(/\d+/)[0]

                    if (code && code != '00000') {

                        resolve(code)

                        break
                    }

                } catch (err) {
                }

                
            }

            if (!code) {
                reject()
            }
            

        } catch (err) {
            console.log(err)
            reject()
        }

        

    })

}

function getPhoneOtpText(key, proxy = '', service = 'facebook') {
    return new Promise(async (resolve, reject) => {

        const setting = await getSetting()

        try {

            const agent = useProxy(proxy)

            for (let index = 0; index < 12; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('http://otptextnow.com/api/?key='+key+'&action=get_code&id='+id, {agent})
                
                const data = await res.json()

                code = data.otp_code

                if (code) {
                    resolve(code)

                    break
                }

                
            }

            if (!code) {
                reject()
            }

        } catch (err) {

            console.log(err)
            reject()
        } 
    })
}

function getPhoneCodeOtpText(number, key, id, proxy = '') {
    return new Promise(async (resolve, reject) => {

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('http://otptextnow.com/api/?key='+key+'&action=get_code&id='+id, {agent})
                
                const data = await res.json()

                code = data.otp_code

                if (code) {
                    resolve(code)

                    break
                }

                
            }

            if (!code) {
                reject()
            }
        } catch (err) {
            console.log(err)


            reject(err)
        }

    })
}

function getPhoneOtpUs(key, proxy = '', service = 'facebook') {
    return new Promise(async (resolve, reject) => {

        let id = 0

        if (service === 'instagram') {
            id = 7
        }

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://otpusnews.top/api/order/'+id+'/user/'+key, {agent})

            const data = await res.json()

            if (data.status === 'success') {
                resolve({
                    number: data.phone_number,
                    id: data.order_code,
                })
            } else {
                reject(data.message)
            }
        } catch (err) {
            reject('Không thể lấy số điện thoại')
        } 
    })
}

function getPhoneCodeOtpUs(number, key, id, proxy = '') {
    return new Promise(async (resolve, reject) => {

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://otpusnews.top/api/getOtp/'+id, {agent})
                
                const data = await res.json()

                code = data.code_otp

                if (code) {
                    resolve(code)

                    break
                }

                
            }

            if (!code) {
                reject()
            }
        } catch (err) {
            console.log(err)

            reject(err)
        }

    })
}

function getPhoneSimOtp(key, proxy = '', service = 'facebook') {
    return new Promise(async (resolve, reject) => {
        

        let id = 15

        if (service === 'instagram') {
            id = 29
        }

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://simotp.net/api/v1/order', {
                method: 'POST',
                headers: {
                    'Authorization': 'OTP '+key,
                    'Content-Type': 'application/json'
                },
                agent,
                body: JSON.stringify({
                    'service': id
                })
            })

            const data = await res.json()

            if (data.data) {
                resolve({
                    number: '84'+data.data.phoneNumber,
                    id: data.data.id,
                })
            } else {
                reject(data.error.message)
            }
        } catch (err) {
            reject('Không thể lấy số điện thoại')
        } 
    })
}

function getPhoneCodeSimOtp(number, key, id, proxy = '') {
    return new Promise(async (resolve, reject) => {

        const getOTP = (str) => {
            let match = str.match(/\b\d{6}\b/)
            return match && match[0]
        }

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://simotp.net/api/v1/order/'+id, {
                    headers: {
                        'Authorization': 'OTP '+key,
                    },
                    agent,
                })
                
                const data = await res.json()

                if (data.data) {
                    code = getOTP(data.data.content)

                    if (code) {
                        resolve(code)

                        break
                    }

                }
                
            }

            if (!code) {
                reject()
            }
        } catch (err) {
            reject(err)
        }

    })
}

function getPhoneSimOtp(key, proxy = '', service = 'facebook') {
    return new Promise(async (resolve, reject) => {

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://api.usotp.xyz/create-request?apikey='+key+'&service='+service, {agent})

            const data = await res.json()

            if (data.status === 'active') {

                resolve({
                    number: '1'+data.phone,
                    id: data.id,
                })

            } else {
                reject('Không thể lấy số điện thoại')
            }
        } catch (err) {
            reject('Không thể lấy số điện thoại')
        } 
    })
}

function getPhoneCodeUsOtp(number, key, id, proxy = '') {
    return new Promise(async (resolve, reject) => {

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://api.usotp.xyz/get-request?apikey='+key+'&id='+id, {agent})
                
                const data = await res.json()

                if (data.code) {

                    code = data.code
                    resolve(code)
                    break

                }
                
            }

            if (!code) {
                reject()
            }
            
        } catch (err) {
            reject(err)
        }

    })
}

function getPhone233(key, proxy = '', service = 'facebook') {
    return new Promise(async (resolve, reject) => {

        let id = 9

        if (service === 'instagram') {
            id = 15
        }

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://api.233io9.info/api/dangkysim?api_key='+key+'&appId='+id, {agent})
            const data = await res.json()

            if (data.ResponseCode == 200) {
                resolve({
                    number: '84'+data.Result.number,
                    id: data.Result.id,
                })
            } else {
                reject(data.Msg)
            }
        } catch (err) {
            reject(err)
        } 
    })
}

function getPhoneCode233(number, key, id, proxy = '') {
    return new Promise(async (resolve, reject) => {

        try {
            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://api.233io9.info/api/layotpByID?api_key='+key+'&id='+id, {agent})
                const data = await res.json()

                if (data.ResponseCode == 200) {
                    code = data.Result[0].otp

                    resolve(code)

                    break

                }
                
            }

            if (!code) {
                reject()
            }
        } catch (err) {
            reject(err)
        }

    })
}


async function getPhoneVip() {

    return new Promise(async (resolve, reject) => {

        try {

            const key = await machineId({original: true})

            const res = await fetch('https://toolfb.vn/getNumber/'+key)
            const data = await res.json()

            if (data.status) {
                resolve({
                    number: data.number,
                    id: data.id,
                })
            } else {
                reject()
            }
    
        } catch (err) {
            reject(err)
        }

    })

}

function getPhoneCodeVip(number, id) {
    return new Promise(async (resolve, reject) => {

        try {

            const key = await machineId({original: true})

            let code = null

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                try {
                    const res = await fetch('https://toolfb.vn/getCode/'+key+'/'+id)
                    console.log('https://toolfb.vn/getCode/'+key+'/'+id)
                    const data = await res.json()

                    if (data.status) {
                        code = data.code[0]

                        break
                    }
                } catch {}
                
            }

            if (code) {

                resolve(code)

            } else {

                reject('cccccc')
            }
    
        } catch (err) {
            reject(err)
        }

    })
}

function getPhoneCustom(key, proxy = '', service = 'facebook') {
    
    return new Promise(async (resolve, reject) => {

        try {

            const setting = await getSetting()
            const max = setting.general.phoneMax.value
            const errorMax = setting.general.phoneErrorMax.value

            const randomDelay = randomNumberRange(1000, 5000)

            await delayTimeout(randomDelay)

            const phone = new Db('phone/'+service)

            const number = await phone.findRandom(item => !item.running && item.count < max && item.errorCount <= errorMax)

            const wait = setting.general.phoneWait.value

            const data = number.wait ?? moment().subtract((wait / 10), 'seconds').format()
            const last = moment(data)
            const now = moment(moment().format())
            const duration = moment.duration(now.diff(last)).asSeconds()

            if (duration >= (wait / 10)) {

                const res = await fetch('https://toolfb.vn/phone/getCode?token='+key+'&requestId='+number.id)

                const resData = await res.json()

                await phone.update(number.id, {
                    running: true,
                    responseTime: resData.responseTime, 
                })

                resolve({
                    number: number.number,
                    id: number.id,
                })

            } else {
                await delayTimeout(5000)

                reject()
            }

        } catch (err) {
            console.log(err)
            reject(err)
        } 
    })
}

function getPhoneCodeCustom(number, key, id, proxy = '') {
    
    return new Promise(async (resolve, reject) => {

        try {

            const phoneInsta = await (new Db('phone/instagram')).get(true)
            const phoneFacebook = await (new Db('phone/facebook')).get(true)

            const data = phoneInsta.concat(phoneFacebook)

            const number = (data.filter(item => item.id === id))

            let code = false

            if (number[0]) {

                for (let index = 0; index < 12; index++) {

                    await delayTimeout(5000)

                    const res = await fetch('https://toolfb.vn/phone/getCode?token='+key+'&requestId='+id)
                    const resData = await res.json()

                    if (resData.id === id && resData.responseTime !== number[0].responseTime) {

                        const newData = {
                            responseTime: resData.responseTime,
                            running: false,
                            count: (number[0].count + 1),
                            wait: moment().format(),
                            number: number[0].number,
                            id: number[0].id,
                            errorCount: number[0].errorCount,
                        }

                        await fs.promises.writeFile(number[0].path, JSON.stringify(newData))

                        code = resData.code

                        break

                    } else {

                        const newData = {
                            responseTime: resData.responseTime,
                            running: number[0].running,
                            count: number[0].count,
                            wait: number[0].wait,
                            number: number[0].number,
                            id: number[0].id,
                            errorCount: number[0].errorCount,
                        }

                        await fs.promises.writeFile(number[0].path, JSON.stringify(newData))
                    }

                    if (resData.id === null) {
                        await fs.promises.unlink(number[0].path)
                    }

                }

            }

            if (code) {
                resolve(code)
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
            reject(err)
        } 
    })
}

function getPhoneSim24(key, proxy = '', service = 'facebook') {
    
    return new Promise(async (resolve, reject) => {

        try {

            const agent = useProxy(proxy)
            const setting = await getSetting()
            let carrier = ''
            
            if (setting.general.carrierSim24.value) {
                carrier = '&operator='+setting.general.carrierSim24.value
            } else {
                carrier = '&no_operator'
            }

            const res = await fetch('https://funotp.com/api?action=number&service='+service+carrier+'&apikey='+key, {agent})
            const data = await res.json()

            if (data.ResponseCode == 0) {
                resolve({
                    number: data.Result.number,
                    id: data.Result.id,
                })
            } else {
                reject()
            }

        } catch (err) {
            reject(err)
        } 
    })
}

function getPhoneCodeSim24(number, key, id, proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < 12; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://funotp.com/api?action=code&id='+id+'&apikey='+key, {agent})
                const data = await res.json()

                console.log(data)

                if (data.ResponseCode == 0) {
                    code = data.Result.otp

                    break
                }
                
            }

            if (code) {

                resolve(code)

            } else {

                reject()
            }

        } catch (err) {
            reject(err)
        }

    })
}

function getPhoneBossOtp(key, proxy = '', service) {
    
    return new Promise(async (resolve, reject) => {

        try {

            let id = '66186e4d0d423d199e1b0bd7'
            let prefix = ''

            if (service === 'instagram') {
                id = '662b547dc4f6b646b1110804'
                prefix = '84'
            }

            const agent = useProxy(proxy)

            const res = await fetch('https://bossotp.com/api/v4/rents/create?service_id='+id+'&api_token='+key, {agent})
            const data = await res.json()

            await delayTimeout(3000)

            if (data.number) {

                resolve({
                    number: prefix+data.number,
                    id: data.rent_id,
                })

            } else {
                reject()
            }

        } catch (err) {

            await delayTimeout(3000)

            reject(err)
        }
    })
}

function getPhoneCodeBossOtp(number, key, id, proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://bossotp.com/api/v4/rents/check?_id='+id+'&api_token='+key, {agent})
                const data = await res.json()

                if (data.status === 'SUCCESS') {
                    code = data.otp

                    break
                }
                
            }

            if (code) {

                resolve(code)

            } else {

                reject()
            }

        } catch (err) {
            reject(err)
        }

    })
}

function getPhoneChoThueSimCode(key, proxy = '', service) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const setting = await getSetting()
            const carrier = setting.general.carrier.value

            let id = '1001'
            let prefix = ''

            if (service === 'instagram') {
                id = '1010'
                prefix = '84'
            }

            const agent = useProxy(proxy)

            const res = await fetch('https://chaycodeso3.com/api?act=number&apik='+key+'&appId='+id+'&carrier='+carrier, {agent})
            const data = await res.json()

            if (data.ResponseCode == 0) {

                resolve({
                    number: prefix+data.Result.Number,
                    id: data.Result.Id,
                })
            } else {
                reject()
            }

        } catch (err) {

            reject(err)
        }
    })
}

function getPhoneCodeChoThueSimCode(number, key, id, proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://chaycodeso3.com/api?act=code&apik='+key+'&id='+id, {agent})
                const data = await res.json()

                if (data.ResponseCode == 0) {
                    code = data.Result.Code

                    break
                }
                
            }

            if (code) {

                resolve(code)

            } else {

                await fetch('https://yuenanka.com/api?act=expired&apik='+key+'&id='+id, {agent})

                reject()
            }

        } catch (err) {
            reject(err)
        }

    })
}

function getPhoneOtpOnline(key, proxy = '') {
    
    return new Promise(async (resolve, reject) => {

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://api.server-otponline.xyz/api/public/user/sim/buy/v2?appId=34&apiKey='+key, {agent})
            const data = await res.json()

            if (data.isSuccessed) {
                resolve({
                    number: data.resultObj.value.number,
                    id: data.resultObj.value.id,
                })
            } else {
                reject(data.message)
            }

        } catch (err) {

            reject(err)
        } 
    })
}

function getPhoneCodeOnlineOtp(number, key, id, proxy = '') {

    return new Promise(async (resolve, reject) => {

        try {

            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://api.server-otponline.xyz/api/public/user/sim/v2?orderId='+id+'&apiKey='+key, {agent})
                const data = await res.json()

                if (data.isSuccessed && data.resultObj.status == '2') {
                    code = data.resultObj.code

                    break
                }

                if (data.resultObj.status == '3' || data.resultObj.status == '4') {
                    break
                }
                
            }

            if (code) {

                resolve(code)

            } else {

                reject()
            }

        } catch (err) {
            reject(err)
        }

    })
}

function getPhoneViOtp(key, proxy = '', service = 'facebook') {
    return new Promise(async (resolve, reject) => {

        let id = 7

        if (service === 'microsoft') {
            id = 5
        }

        if (service === 'instagram') {
            id = 36
        }

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://api.viotp.com/request/getv2?token='+key+'&serviceId='+id, {agent})
            const data = await res.json()

            if (data.success) {
                resolve({
                    number: data.data.phone_number,
                    id: data.data.request_id,
                })
            } else {
                reject(data.message)
            }
        } catch (err) {
            reject(err)
        } 
    })
}

function getPhoneCodeViOtp(number, key, id, proxy = '') {
    return new Promise(async (resolve, reject) => {

        try {
            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://api.viotp.com/session/getv2?requestId='+id+'&token='+key, {agent})
                const data = await res.json()

                if (data.success) {

                    if (data.data.Code !== null) {
                        code = data.data.Code

                        resolve(code)
                    }

                } else {
                    reject(data.message)
                }
                
            }

            if (!code) {
                reject()
            }
        } catch (err) {
            reject(err)
        }

    })
}

function getPhoneXotp(key, proxy = '', service = 'facebook') {
    return new Promise(async (resolve, reject) => {

        try {

            const agent = useProxy(proxy)

            const res = await fetch('https://xotp.pro/api/v1/create-request?apikey='+key+'&service='+service, {agent})
            const data = await res.json()

            if (!data.error) {
                resolve({
                    number: data.phone,
                    id: data.id,
                })
            } else {
                reject(data.error)
            }

        } catch (err) {
            reject(err)
        } 
    })
}

function getPhoneCodeXotp(number, key, id, proxy = '') {
    return new Promise(async (resolve, reject) => {

        try {
            let code = null

            const agent = useProxy(proxy)

            for (let index = 0; index < number; index++) {

                await delayTimeout(5000)
                
                const res = await fetch('https://xotp.pro/api/v1/get-request?apikey='+key+'&id='+id, {agent})
                
                const data = await res.json()

                if (data.code) {
                    code = data.code

                    break
                }
                
            }

            if (code) {

                resolve(code)

            } else {

                await fetch('https://xotp.pro/api/v1/cancel-request?apikey='+key+'&id='+id, {agent})

                reject()
            }
        } catch (err) {
            reject(err)
        }

    })
}

function getNewShopLikeIp(key) {

    return new Promise(async (resolve, reject) => {
        try {

            const res = await fetch('http://proxy.shoplike.vn/Api/getNewProxy?access_token='+key)

            const data = await res.json()

            resolve(data)
        } catch (err) {
            reject(err)
        }
    })
}

function getCurrentShopLikeIp(key) {
    return new Promise(async (resolve, reject) => {
        try {

            const res = await fetch('http://proxy.shoplike.vn/Api/getCurrentProxy?access_token='+key)

            const data = await res.json()

            resolve(data)
        } catch (err) {
            reject(err)
        }
    })
}

function useShopLikeProxy(key, message) {

    return new Promise(async (resolve, reject) => {

        const proxyKey = key.trim()

        message('Đang lấy IP mới')

        try {

            const res = await getNewShopLikeIp(proxyKey)

            if (res.status === 'success') {

                resolve(res.data.proxy)

            } else if (res.mess.includes('giay de get proxy moi')) {

                message('Đang lấy IP hiện tại')

                const current = await getCurrentShopLikeIp(proxyKey)

                if (current.status) {

                    resolve(current.data.proxy)

                } else {
                    message(current.mess)

                    reject()
                }

            } else {
                
                message(res.mess)

                reject()
            }

        } catch (err) {

            console.log(err)

            message('Không thể lấy IP')

            reject()
        }
    })

}

function getNewTmIp(key) {

    return new Promise(async (resolve, reject) => {
        try {

            const res = await fetch('https://tmproxy.com/api/proxy/get-new-proxy', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: `{"api_key":"${key}"}`
            })

            const data = await res.json()

            resolve(data)
        } catch (err) {
            reject(err)
        }
    })
}

function getCurrentTmIp(key) {
    return new Promise(async (resolve, reject) => {
        try {

            const res = await fetch('https://tmproxy.com/api/proxy/get-current-proxy', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: `{"api_key":"${key}"}`
            })

            const data = await res.json()

            resolve(data)
        } catch (err) {
            reject(err)
        }
    })
}

function useTmProxy(key, message) {

    return new Promise(async (resolve, reject) => {

        const proxyKey = key.trim()

        message('Đang lấy IP mới')

        try {

            const res = await getNewTmIp(proxyKey)

            if (res.code === 0) {
                resolve(res.data.https)
            } else if (res.code === 5) {

                message('Đang lấy IP hiện tại')

                const current = await getCurrentTmIp(proxyKey)

                if (current.code === 0) {

                    resolve(current.data.https)

                } else {
                    message(current.message)

                    reject()
                }
            } else {
                
                message(res.message)

                reject()
            }

        } catch (err) {

            console.log(err)

            message('Không thể lấy IP')

            reject()
        }
    })

}

function useTinProxy(key, message) {

    return new Promise(async (resolve, reject) => {

        const proxyKey = key.trim()

        try {

            message('Đang lấy IP mới')

            const res = await fetch('https://proxy.tinsoftsv.com/api/changeProxy.php?key='+proxyKey)

            const data = await res.json()

            if (data.success) {
                
                resolve(data.proxy)

            } else {

                message('Đang lấy IP hiện tại')

                const res = await fetch('https://proxy.tinsoftsv.com/api/getProxy.php?key='+proxyKey)

                const data = await res.json()

                if (data.success) {
                    resolve(data.proxy)
                } else {

                    message(data.description)

                    reject()
                }

            }

        } catch (err) {

            message('Không thể lấy IP')

            reject()
        }

    })
}

function useProxyFb(key, message) {

    return new Promise(async (resolve, reject) => {

        const proxyKey = key.trim()

        try {

            message('Đang lấy IP mới')

            const res = await fetch('http://api.proxyfb.com/api/changeProxy.php?key='+proxyKey)

            const data = await res.json()

            if (data.success) {
                
                resolve(data.proxy)

            } else {

                message('Đang lấy IP hiện tại')

                const res = await fetch('http://api.proxyfb.com/api/getProxy.php?key='+proxyKey)

                const data = await res.json()

                if (data.success) {
                    resolve(data.proxy)
                } else {

                    message(data.message)

                    reject()
                }

            }

        } catch (err) {

            message('Không thể lấy IP')

            reject()
        }

    })
}

function randomUserAgent(type) {

    return new Promise(async (resolve, reject) => {

        let file = ''

        if (type === 'custom') {
            file = path.resolve(app.getPath('userData'), 'UA.txt')
        } else {
            file = path.resolve(__dirname, '../data/UA.txt')
        }

        const data = (await fs.promises.readFile(file, {encoding: 'utf-8'})).split(/\r?\n|\r|\n/g).filter(item => item)
        
        resolve(data[Math.floor(Math.random() * data.length)])
    })

}

function changeLanguage(page, lang) {

    return new Promise(async (resolve, reject) => {

        try {

            const z = new zFetch(page)

            const res = await z.get('https://mbasic.facebook.com/language')

            const $ = cheerio.load(res)

            const dtsg = $('input[name="fb_dtsg"]').val()

            await z.post("https://mbasic.facebook.com/intl/save_locale/?loc=vi_VN&href=https%3A%2F%2Fmbasic.facebook.com%2Fsettings%2Flanguage%2F&ls_ref=m_basic_locale_selector&paipv=0&eav=AfbQnh2tC6JfMbXgsBuTZyei9AQuiubPRCVMO18ZhMUunrP0NuGT8km965M1wDf7ysU", {
                "headers": {
                  "content-type": "application/x-www-form-urlencoded",
                },
                "body": "fb_dtsg="+dtsg+"&jazoest=25340",
            })

            resolve()

        } catch (err) {
            reject(err)
        }
    })

}

function resolveCaptcha1st(apiKey, siteKey, url) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.1stcaptcha.com/recaptchav2_enterprise?apikey='+apiKey+'&sitekey='+siteKey+'&siteurl='+url)

            const data = await res.json()

            if (data.Code === 0) {

                const taskId = +data.TaskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {
                    
                    try {
                        const res = await fetch('https://api.1stcaptcha.com/getresult?apikey='+apiKey+'&taskid='+taskId)
                        const data = await res.json()

                        if (data.Status === 'SUCCESS') {
                            captchaResponse = data.Data.Token
                            break
                        } else if (data.Status === 'ERROR') {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            reject('Không thể giải captcha')
        }

    })
}

function resolveCaptchaCapMonster(apiKey, siteKey, url) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.capmonster.cloud/createTask', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    clientKey: apiKey,
                    task: {
                        type: "RecaptchaV2EnterpriseTaskProxyless",
                        websiteURL: url,
                        websiteKey: siteKey,
                
                    }
                })
            })

            const data = await res.json()

            if (data.taskId) {

                const taskId = +data.taskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {

                    try {
                    
                        const res = await fetch('https://api.capmonster.cloud/getTaskResult', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                clientKey: apiKey,
                                taskId,
                            })
                        })

                        const data = await res.json()

                        if (data.status === 'ready') {
                            captchaResponse = data.solution.gRecaptchaResponse
                            break
                        } else if (data.errorCode != 0) {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            reject('Không thể giải captcha')
        }

    })
}

function resolve2Captcha(apiKey, siteKey, url) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.2captcha.com/createTask', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    clientKey: apiKey,
                    task: {
                        type: "RecaptchaV2EnterpriseTaskProxyless",
                        websiteURL: url,
                        websiteKey: siteKey,
                    }
                })
            })

            const data = await res.json()

            if (data.taskId) {

                const taskId = +data.taskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {

                    try {
                    
                        const res = await fetch('https://api.2captcha.com/getTaskResult', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                clientKey: apiKey,
                                taskId,
                            })
                        })

                        const data = await res.json()

                        if (data.status === 'ready') {
                            captchaResponse = data.solution.gRecaptchaResponse
                            break
                        } else if (data.errorId != 0) {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            console.log(err)
            reject('Không thể giải captcha')
        }

    })
}

function resolveCaptchaEz(apiKey, siteKey, url) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.ez-captcha.com/createTask', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    clientKey: apiKey,
                    task: {
                        type: "RecaptchaV2EnterpriseTaskProxyless",
                        websiteURL: url,
                        websiteKey: siteKey,
                    }
                })
            })

            const data = await res.json()

            console.log(data)

            if (data.taskId) {

                const taskId = data.taskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {

                    try {
                    
                        const res = await fetch('https://api.ez-captcha.com/getTaskResult', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                clientKey: apiKey,
                                taskId,
                            })
                        })

                        const data = await res.json()

                        if (data.status === 'ready') {
                            captchaResponse = data.solution.gRecaptchaResponse
                            break
                        } else if (data.errorId != 0) {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            console.log(err)
            reject('Không thể giải captcha')
        }

    })
}

function resolveCaptcha(setting, siteKey, url) {

    return new Promise(async (resolve, reject) => {

        const apiKey = setting.captchaServiceKey.value

        try {

            if (setting.captchaService.value === '1stcaptcha') {
                resolve(await resolveCaptcha1st(apiKey, siteKey, url))
            }

            
            if (setting.captchaService.value === '2captcha') {
                resolve(await resolve2Captcha(apiKey, siteKey, url))
            }

            if (setting.captchaService.value === 'capmonster') {
                resolve(await resolveCaptchaCapMonster(apiKey, siteKey, url))
            }

            if (setting.captchaService.value === 'ezcaptcha') {

                resolve(await resolveCaptchaEz(apiKey, siteKey, url))

            }

        } catch (err) {
            reject(err)
        }

    })
    
}

function resolveImageCaptcha1st(apiKey, base64) {
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.1stcaptcha.com/recognition', {
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Apikey: apiKey,
                    Type: "imagetotext",
                    Image: base64,
                    Customize: "FACEBOOK"
                }),
                method: 'POST'
            })

            const data = await res.json()

            if (data.Code === 0) {

                const taskId = data.TaskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {
                    
                    try {
                        const res = await fetch('https://api.1stcaptcha.com/getresult?apikey='+apiKey+'&taskid='+taskId)
                        const data = await res.json()

                        if (data.Status === 'SUCCESS') {
                            captchaResponse = data.Data
                            break
                        } else if (data.Status === 'ERROR') {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            reject('Không thể giải captcha')
        }

    })
}

function resolveImageCaptchaCapMonster(apiKey, base64) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.capmonster.cloud/createTask', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    clientKey: apiKey,
                    task: {
                        type: "ImageToTextTask",
                        body: base64,
                    }
                })
            })

            const data = await res.json()

            if (data.taskId) {

                const taskId = data.taskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {

                    try {
                    
                        const res = await fetch('https://api.capmonster.cloud/getTaskResult', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                clientKey: apiKey,
                                taskId,
                            })
                        })

                        const data = await res.json()

                        if (data.status === 'ready') {
                            captchaResponse = data.solution.text
                            break
                        } else if (data.errorCode != 0) {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            reject('Không thể giải captcha')
        }

    })
}

function resolveImage2Captcha(apiKey, base64) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.2captcha.com/createTask', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    clientKey: apiKey,
                    task: {
                        type: "ImageToTextTask",
                        body: base64,
                    }
                })
            })

            const data = await res.json()

            if (data.taskId) {

                const taskId = data.taskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {

                    try {
                    
                        const res = await fetch('https://api.2captcha.com/getTaskResult', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                clientKey: apiKey,
                                taskId,
                            })
                        })

                        const data = await res.json()

                        if (data.status === 'ready') {
                            captchaResponse = data.solution.text
                            break
                        } else if (data.errorId != 0) {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            
            reject('Không thể giải captcha')
        }

    })
}

function resolveImage2Captcha(apiKey, base64) {
    
    return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch('https://api.2captcha.com/createTask', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    clientKey: apiKey,
                    task: {
                        type: "ImageToTextTask",
                        body: base64,
                    }
                })
            })

            const data = await res.json()

            if (data.taskId) {

                const taskId = +data.taskId
                let captchaResponse

                for (let index = 0; index < 10; index++) {

                    try {
                    
                        const res = await fetch('https://api.2captcha.com/getTaskResult', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify({
                                clientKey: apiKey,
                                taskId,
                            })
                        })

                        const data = await res.json()

                        if (data.status === 'ready') {
                            captchaResponse = data.solution.text
                            break
                        } else if (data.errorId != 0) {
                            break
                        }

                    } catch {}

                    await delayTimeout(5000)
                    
                }

                if (captchaResponse) {
                    resolve(captchaResponse)
                } else {
                    reject('Không thể giải captcha')
                }

            } else {
                reject(data.Message)
            }

        } catch (err) {
            
            reject('Không thể giải captcha')
        }

    })
}

function resolveCaptchaImage(setting, base64) {

    return new Promise(async (resolve, reject) => {

        const apiKey = setting.captchaServiceKey.value

        try {

            if (setting.captchaService.value === '1stcaptcha') {
                resolve(await resolveImageCaptcha1st(apiKey, base64))
            }

            if (setting.captchaService.value === '2captcha') {
                resolve(await resolveImage2Captcha(apiKey, base64))
            }

            if (setting.captchaService.value === 'capmonster') {
                resolve(await resolveImageCaptchaCapMonster(apiKey, base64))
            }

        } catch (err) {
            console.log(err)
            reject(err)
        }

    })
    
}

function formatAdData(account, number = 0) {
    
    try {
        const reasons = {
            0: '',
            1: 'ADS_INTEGRITY_POLICY',
            2: 'ADS_IP_REVIEW',
            3: 'RISK_PAYMENT',
            4: 'GRAY_ACCOUNT_SHUT_DOWN',
            5: 'ADS_AFC_REVIEW',
            6: 'BUSINESS_INTEGRITY_RAR',
            7: 'PERMANENT_CLOSE',
            8: 'UNUSED_RESELLER_ACCOUNT',
        }

        const nextBillDate = moment(account.nextBillDate)
        const now = moment()
        const nextBillDay = nextBillDate.diff(now, 'days')

        const convert = ['EUR', 'BRL', 'USD', 'CNY', 'MYR', 'UAH', 'QAR', 'THB', 'THB', 'TRY', 'GBP', 'PHP', 'INR']

        if (convert.includes(account.currency)) {
            account.balance = (parseInt(account.balance) / 100)
            account.threshold = (parseInt(account.threshold) / 100)
        }

        account.remain = (account.threshold - account.balance)
        
        account.limit = (new Intl.NumberFormat('en-US').format(account.limit)).replace('NaN', '')
        account.spend = (new Intl.NumberFormat('en-US').format(account.spend)).replace('NaN', '')
        account.remain = (new Intl.NumberFormat('en-US').format(account.remain)).replace('NaN', '')
        account.balance = (new Intl.NumberFormat('en-US').format(account.balance)).replace('NaN', '')
        account.threshold = (new Intl.NumberFormat('en-US').format(account.threshold)).replace('NaN', '')

        if (!account.cards) {
            account.cards = []
        }

        const admin = account.users.filter(item => item.role === 1001)

        return {
            id: number,
            status: account.status,
            type: account.ownerBusiness ? 'Business' : 'Cá nhân',
            reason: reasons[account.disableReason],
            account: account.name,
            adId: account.id,
            limit: account.limit,
            spend: account.spend,
            remain: account.remain,
            adminNumber: admin.length,
            nextBillDate: nextBillDate.format('DD/MM/YYYY'),
            nextBillDay: nextBillDay < 0 ? 0 : nextBillDay,
            createdTime: moment(account.createdTime).format('DD/MM/YYYY'),
            timezone: account.timezoneName,
            currency: account.currency+'-'+account.prePay,
            country: account.country,
            threshold: account.threshold,
            role: account.role,
            balance: account.balance,
            payment: JSON.stringify(account.cards.filter(item => item.credential.__typename !== 'StoredBalance')),
            bm: account.ownerBusiness,
            uid: account.uid
        }

    } catch (err) {
        console.log(err)
        return {}
    }

}

function loginWhatsApp(id, headless = true) {
    return new Promise(async (resolve, reject) => {

        const setting = await getSetting()
        const chromePath = setting.general.chromePath.value

        const client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: id,
                dataPath: path.resolve(app.getPath('userData'), 'whatsAppData')
            }),
            puppeteer: {
                headless,
                executablePath: chromePath
            }
        })

        setTimeout(() => {

            client.destroy()
            reject()
            
        }, 120000)

        client.on('ready', async () => {
            resolve(client)
        })

        client.on('auth_failure', () => {
            client.destroy()
            reject()
        })

        client.on('qr', () => {
            client.destroy()
            reject()
        })
        
        client.initialize()
    })
}

function getMProxy(key) {
    return new Promise(async (resolve, reject) => {
        const res = await fetch('https://mproxy.vn/capi/'+key+'/keys')
        const data = await res.json()

        if (data.status === 1) {

            resolve(data.data.map(item => {
                return item.proxy.split('@')[1]+':'+item.user+':'+item.key_code+':'+key
            }))

        } else {
            reject(data.message)
        }
    })
}

function shuffle(array) {

    let currentIndex = array.length,  randomIndex
  
    while (currentIndex > 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
  
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
  
    return array
}

module.exports = {
    capitalizeFLetter,
    readCsv,
    createCsv,
    cleanTemp,
    getSetting, 
    saveSetting, 
    checkLicense, 
    getPrices,
    checkRef, 
    checkLive,
    checkLinked, 
    checkHacked,
    getBackupLink,
    checkImap,
    deleteInbox,
    getMailCode, 
    readMailInbox,
    delayTimeout, 
    getCodeBrowser,
    getMailInboxes,
    getPhone,
    getPhoneCode,
    useTmProxy,
    getTmMail,
    getTmMailInbox,
    useShopLikeProxy,
    useTinProxy,
    useProxyFb,
    useProxy,
    randomUserAgent,
    changeLanguage,
    randomNumber,
    randomNumberRange,
    resolveCaptcha,
    resolveCaptchaImage,
    getTempEmail,
    getTempEmailInbox,
    randomName,
    formatAdData,
    loginWhatsApp,
    randomPersion,
    getMProxy,
    getMoAktMail,
    getMoAktMailInbox,
    shuffle,
    checkAdsEmail,
    getCookies,
    maskEmail,
    getPhoneTemplate,
    getPhoneCodeTemplate,
    deleteFakeEmailInbox,
    getMoAktMail2,
    getGmxInboxes
}