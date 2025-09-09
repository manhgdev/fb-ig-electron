const IG = require('./insta.js')
const encPassword = require('./password.js')
const Db = require('./db.js')
const {ipcMain, app} = require('electron')
const promiseLimit = require('promise-limit')
const generator = require('generate-password')
const { v4: uuidv4 } = require('uuid')
const fetch = require('node-fetch')
const fs = require('fs-extra')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const cheerio = require('cheerio')

puppeteer.use(StealthPlugin())

const {
    delayTimeout, 
    getSetting, 
    getGmxInboxes,
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
    resolveCaptcha,
    randomPersion,
    useTmProxy, 
    useShopLikeProxy, 
    useTinProxy, 
    useProxyFb, 
    getTmMail,
    getTmMailInbox,
    randomUserAgent,
    getMProxy,
    randomNumberRange,
} = require('./core.js')
const { zFetch, zQuery } = require('./zquery.js')


module.exports = (instagramWindow) => {

    ipcMain.handle('runInsta', async (e, data) => {

        try {

            const setting = await getSetting()
            const instaSetting = await getSetting('instaSettings')
            const limit = promiseLimit(instaSetting.instagram.limit.value)

            let stopped = false
            let delay = 0

            let proxyIndex = 0

            let number = 1
            let successCount = 0
            let errorCount = 0
    
            while (!stopped) {

                const dataInsta = []

                if (setting.general.proxy.value === 'mProxy') {

                    data.proxy = await getMProxy(data.proxy[0])

                }
            
                for (let index = 0; index < 999999; index++) {
                    
                    const info = {}

                    info.proxy = data.proxy[proxyIndex]
                    info.id = number

                    dataInsta.push(info)

                    if (proxyIndex < data.proxy.length - 1) {
                        proxyIndex++
                    } else {
                        proxyIndex = 0
                    }

                    number++

                }

                const run = (item) => {

                    return new Promise(async (resolve, reject) => {

                        if (stopped) {

                            resolve()

                        } else {

                            try {

                                if (item.proxy && setting.general.proxy.value === 'mProxy') {

                                    const key = item.proxy.split(':')[4]
                                    const keyCode = item.proxy.split(':')[3]

                                    for (let index = 0; index < 99; index++) {

                                        try {
                                            const res = await fetch('https://mproxy.vn/capi/'+key+'/key/'+keyCode+'/resetIp')

                                            const data = await res.json()

                                            if (data.status === 1) {
                                                break
                                            }
                                            
                                            await delayTimeout(3000)
                                        } catch {}
                                        
                                    }

                                    setting.general.proxy.value === 'httpProxy'

                                }

                                if (instaSetting.instagram.mode.value === 'request') {

                                    await createInstagram(item, setting.general, (action, data) => {
                                        instagramWindow.webContents.send(action, data)
                                    })

                                } else if (instaSetting.instagram.mode.value === 'request2') {

                                    await createInstagram(item, setting.general, (action, data) => {
                                        instagramWindow.webContents.send(action, data)
                                    }, true)

                                } else if (instaSetting.instagram.mode.value === 'request3') {

                                    await createInstagram2(item, setting.general, (action, data) => {
                                        instagramWindow.webContents.send(action, data)
                                    }, true)

                                } else {

                                    await createInstagramBrowser(item, setting.general, (action, data) => {
                                        instagramWindow.webContents.send(action, data)
                                    })

                                }

                                successCount++
                                instagramWindow.webContents.send('updateSuccessCount', successCount)

                            } catch (err) {

                                console.log(err)

                                errorCount++
                                instagramWindow.webContents.send('updateErrorCount', errorCount)
                            }

                            resolve()

                        }

                    })
                }

                await Promise.all(dataInsta.map(item => limit(() => run(item))))
            
            }

            ipcMain.on('stopInsta', async (e) => {
                stopped = true
            })

        } catch (err) {
            console.log(err)
        }

        return true

    })

}

function getEmail(key) {
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

function getCode(key, id) {
    return new Promise(async (resolve, reject) => {

        let code = false

        for (let index = 0; index < 12; index++) {

            try {

                const res = await fetch('https://boxreceive.com/DataMail/Mail/'+key+'/'+id)
                const data = await res.json()
                
                code = data.orders.otp

                if (code) {
                    break
                }

            } catch (err) { console.log(err) }

            await delayTimeout(5000)

        }

        if (code) {
            resolve(code)
        } else {
            reject()
        }

    })
}

const createInstagramBrowser = (ccc, setting, send) => {

    return new Promise(async (resolve, reject) => {

        const instaSetting = await getSetting('instaSettings')

        const randomPes = await randomPersion()
        const item = { 
            ...ccc,
            ...randomPes
        }

        item.username = item.username+randomNumberRange(11111, 99999)

        item.password = generator.generate({
            length: 12,
            numbers: true
        })

        send('insertAccount', item)

        try {

            const service = setting.tmMailService.value

            let ip = ''
            let error = false
            let stopped = false
            let email = false
            let success = false

            let ipUser = false
            let ipPass = false

            send('updateStatus', {id: item.id, status: 'RUNNING'})

            const insta = new Db('instagram')

            if (item.proxy && setting.proxy.value !== 'none') {

                try {

                    if (setting.proxy.value === 'httpProxy' || setting.proxy.value === 'sProxy') {

                        const proxyParts = item.proxy.split(':')

                        ip = proxyParts[0]+':'+proxyParts[1]

                        if (proxyParts.length >= 4) {

                            ipUser = proxyParts[2]
                            ipPass = proxyParts[3]

                        }

                    }
                    
                    if (setting.proxy.value === 'tmProxy') {
                        ip = await useTmProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'shopLike') {
                        ip = await useShopLikeProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'tinSoft') {
                        ip = await useTinProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'proxyFb') {
                        ip = await useProxyFb(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                } catch (err) {
                    error = true
                }
            }

            if (ip && !error && !stopped) {

                try {

                    let newIp = ''

                    if (ipUser && ipPass) {
                        newIp = ip+':'+ipUser+':'+ipPass
                    } else {
                        newIp = ip
                    }

                    const agent = useProxy(newIp)

                    try {
                        const res = await fetch('https://api.myip.com/', {agent})
                        data = await res.json()
                    } catch {
                        const res = await fetch('https://api.country.is', {agent})
                        data = await res.json()
                    }

                    if (data.ip) {

                        await send('message', {id: item.id, message: 'Sử dụng IP: '+data.ip})
                        await delayTimeout(1000)

                    } else {
                        error = true
                    }

                } catch (err) {

                    await send('message', {id: item.id, message: 'Lỗi proxy'})
                    error = true
                }

            }

            if (!error && !stopped) {

                try {

                    let domain = ''
        
                    if (service === 'emailfake.com') {
                        domain = setting.emailFakeDomain.value
                    }

                    if (service === 'generator.email') {
                        domain = setting.generatorEmailDomain.value
                    }

                    if (service === 'moakt.com') {
                        domain = setting.moaktDomain.value
                    }

                    await send('message', {id: item.id, message: 'Đang lấy email'})

                    for (let index = 0; index < 10; index++) {

                        if (index > 0) {
                            await send('message', {id: item.id, message: 'Đang thử lấy lại email'})
                        }

                        if (stopped) { break }
                        
                        try {

                            if (service === 'gmail.com') {
                                
                                email = await getEmail(setting.instaMailApi.value)

                            } else {

                                email = await getTmMail(service, domain)

                            }

                            break

                        } catch {}

                    }

                } catch (err) {

                    await send('message', {id: item.id, message: 'Không thể lấy email'})
                    
                    error = false
                }

            }

            if (email && !error && !stopped) {

                await send('updateData', {id: item.id, email: email.address})

                try {

                    const flags = [
                        '--disable-web-security',
                        '--force-device-scale-factor=0.9',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--disable-gpu',
                        '--disable-notifications',
                    ]

                    if (setting.hideImage.value) {
                        flags.push('--blink-settings=imagesEnabled=false')
                    }

                    if (ip) {
                        flags.push('--proxy-server='+ip)
                    }

                    let headless = false

                    if (setting.hideChrome.value) {
                        headless = true
                    }

                    const profilePath = app.getPath('temp')+'/fbaio_profile_'+Date.now()

                    const browser = await puppeteer.launch({
                        headless,
                        args: flags,
                        defaultViewport: null,
                        ignoreHTTPSErrors: true,
                        userDataDir: profilePath,
                        executablePath: setting.chromePath.value,
                    })

                    const page = await browser.newPage()

                    const userAgent = await randomUserAgent(setting.userAgent.value)

                    await page.setUserAgent(userAgent)

                    if (ipUser && ipPass) {
                        await page.authenticate({
                            username:ipUser, password:ipPass
                        })
                    }

                    try {

                        if (userAgent.includes('iPhone') || userAgent.includes('Android')) {

                            await page.goto('https://www.instagram.com/accounts/signup/email/')

                            try {

                                await page.waitForXPath('//*[contains(text(), "Allow all cookies")]', {
                                    timeout: 5000
                                })

                                const allowCookie = await page.$x('//*[contains(text(), "Allow all cookies")]')

                                await allowCookie[0].click()

                                await page.waitForTimeout(5000)
                            

                            } catch (err) {
                                console.log(err)
                            }

                            await page.waitForSelector('input[name="email"]')

                            await page.type('input[name="email"]', email.address)

                            const button = await page.$x('//button[text()="Next"]')

                            await button[0].click() 

                            await page.waitForSelector('[name="emailConfirmationCode"]')

                            await send('message', {id: item.id, message: 'Đang chờ mã kích hoạt'})

                            let code = false 
                    
                            for (let index = 0; index < 99; index++) {

                                if (stopped) { break }
                                
                                try {

                                    if (service === 'gmail.com') {

                                        for (let index = 0; index < 30; index++) {
                                            
                                            try {

                                                code = await getCode(setting.instaMailApi.value, email.id)

                                                break

                                            } catch {}

                                            await delayTimeout(2000)
                                            
                                        }

                                        if (code) {
                                            break
                                        }

                                    } else {

                                        const inbox = (await getTmMailInbox(email, service)).filter(item => item.from.includes('mail.instagram.com'))
                    
                                        if (inbox[0].code) {
                                            code = inbox[0].code
                    
                                            break
                                        }

                                    }
                
                                } catch (err) { console.log(err)}
                
                                await delayTimeout(1000)
                                
                            }
                
                            if (code) {
                                                    
                                await send('message', {id: item.id, message: 'Đang nhập mã: '+code})

                                await page.type('[name="emailConfirmationCode"]', code)

                                const submit = await page.$x('//button[text()="Next"]')        

                                await submit[0].click() 
                            }

                            await page.waitForSelector('[name="fullName"]')

                            await page.type('input[name="fullName"]', item.name)
                            await page.type('input[name="password"]', item.password)

                            const submit = await page.$x('//button[text()="Next"]')        

                            await submit[0].click()

                            await page.waitForSelector('select[title="Month:"]')

                            await page.select('select[title="Month:"]', item.month.toString())

                            await page.waitForTimeout(1000)

                            await page.select('select[title="Day:"]', item.day.toString())

                            await page.waitForTimeout(1000)

                            await page.select('select[title="Year:"]', item.year.toString())

                            await page.waitForTimeout(3000)
                            
                            const button2 = await page.$x('//button[text()="Next"]')

                            await button2[0].click() 

                            await page.waitForSelector('input[name="username"]')

                            const zq = new zQuery(page, 'input[name="username"]')

                            await zq.clearText()

                            await page.waitForTimeout(1000)

                            await page.type('input[name="username"]', item.username)

                            await send('updateData', {id: item.id, username: item.username})

                            const button3 = await page.$x('//button[text()="Next"]')

                            await button3[0].click()

                            await page.waitForTimeout(10000)

                            for (let index = 0; index < 99; index++) {

                                try {

                                    await page.waitForXPath('//*[contains(text(), "something went wrong creating your account")]', {
                                        timeout: 1000
                                    })

                                    await send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                                    if (!ip) {
                                        success = true
                                    }

                                    break 

                                } catch {}

                                try {

                                    await page.waitForXPath('//*[contains(text(), "The IP address you are using")]', {
                                        timeout: 1000
                                    })

                                    //await send('message', {id: item.id, message: 'IP Spam'})

                                    break 

                                } catch {}

                                const cookies = await page.cookies()

                                const checkId = cookies.filter(item => item.name === 'ds_user_id')
                    
                                if (checkId[0]) {

                                    await page.waitForTimeout(3000)

                                    const url = await page.url()

                                    if (!url.includes('/accounts/suspended')) {

                                        //success = true

                                        break

                                    } else {

                                        // success = true
                                        // await send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})
                                        break
                                        
                                    }

                                }

                                await page.waitForTimeout(1000)

                            }
                        

                        } else {

                            await page.goto('https://www.instagram.com/accounts/emailsignup/')

                            try {

                                await page.waitForXPath('//*[contains(text(), "Allow all cookies")]', {
                                    timeout: 5000
                                })

                                const allowCookie = await page.$x('//*[contains(text(), "Allow all cookies")]')

                                await allowCookie[0].click()

                                await page.waitForTimeout(5000)
                            

                            } catch (err) {
                            }

                            await page.waitForSelector('input[name="emailOrPhone"]')

                            await page.type('input[name="emailOrPhone"]', email.address)
                            await page.type('input[name="fullName"]', item.name)
                            await page.type('input[name="username"]', item.username)
                            await page.type('input[name="password"]', item.password)

                            await page.click('button[type="submit"]')

                            await page.waitForSelector('select[title="Month:"]')

                            await page.select('select[title="Month:"]', item.month.toString())

                            await page.waitForTimeout(1000)

                            await page.select('select[title="Day:"]', item.day.toString())

                            await page.waitForTimeout(1000)

                            await page.select('select[title="Year:"]', item.year.toString())

                            await page.waitForTimeout(3000)
                            
                            const button = await page.$x('//button[text()="Next"]')

                            await button[0].click() 

                            try {

                                await page.waitForSelector('#recaptcha-iframe', {
                                    timeout: 5000
                                })

                                try {

                                    await send('message', {id: item.id, message: 'Đang giải captcha'})

                                    const captchaUrl = "https://www.fbsbx.com/captcha/recaptcha/iframe/?__cci=ig_captcha_iframe&compact=false&locale=en_US&referer=https%253A%252F%252Fwww.instagram.com"

                                    const page2 = await browser.newPage()

                                    await page2.goto(captchaUrl)

                                    const $ = cheerio.load(await page2.content())

                                    const siteKey = $('[data-sitekey]').attr('data-sitekey')

                                    const result = await resolveCaptcha(setting, siteKey, captchaUrl)

                                    const z = new zFetch(page)

                                    let deviceId, csrf, mid

                                    (await page.cookies()).forEach(item => {

                                        if (item.name === 'ig_did') {
                                            deviceId = item.value
                                        }
                                        
                                        if (item.name === 'csrftoken') {
                                            csrf = item.value
                                        }

                                        if (item.name === 'mid') {
                                            mid = item.value
                                        }
                                        
                                    })

                                    const res = await z.post("https://www.instagram.com/api/v1/accounts/send_verify_email/", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                            "sec-ch-prefers-color-scheme": "light",
                                            "x-asbd-id": "129477",
                                            "x-csrftoken": csrf,
                                            "x-ig-app-id": "936619743392459",
                                            "x-ig-www-claim": "0",
                                            "x-instagram-ajax": "1013077871",
                                            "x-requested-with": "XMLHttpRequest",
                                            "x-web-device-id": deviceId
                                        },
                                        "body": "captcha_token="+result+"&device_id="+mid+"&email="+email.address,
                                    })

                                    if (res.email_sent) {

                                        await send('message', {id: item.id, message: 'Đang chờ mã kích hoạt'})

                                        let code = false 
                                
                                        for (let index = 0; index < 99; index++) {
                                            
                                            try {

                                                if (service === 'gmail.com') {

                                                    for (let index = 0; index < 30; index++) {
                                                        
                                                        try {

                                                            code = await getCode(setting.instaMailApi.value, email.id)

                                                            break

                                                        } catch {}

                                                        await delayTimeout(2000)
                                                        
                                                    }

                                                    if (code) {
                                                        break
                                                    }

                                                } else {

                                                    const inbox = (await getTmMailInbox(email, service)).filter(item => item.from.includes('mail.instagram.com'))
                                
                                                    if (inbox[0].code) {
                                                        code = inbox[0].code
                                
                                                        break
                                                    }

                                                }
                            
                                            } catch (err) { console.log(err)}
                            
                                            await delayTimeout(1000)
                                            
                                        }
                            
                                        if (code) {
                                                                
                                            await send('message', {id: item.id, message: 'Đang nhập mã: '+code})

                                            const res = await z.post("https://www.instagram.com/api/v1/accounts/check_confirmation_code/", {
                                                "headers": {
                                                    "content-type": "application/x-www-form-urlencoded",
                                                    "sec-ch-prefers-color-scheme": "light",
                                                    "x-asbd-id": "129477",
                                                    "x-csrftoken": csrf,
                                                    "x-ig-app-id": "936619743392459",
                                                    "x-ig-www-claim": "0",
                                                    "x-instagram-ajax": "1013077871",
                                                    "x-requested-with": "XMLHttpRequest",
                                                    "x-web-device-id": deviceId
                                                },
                                                "body": "code="+code+"&device_id="+mid+"&email="+encodeURIComponent(email.address),
                                            })
                            
                                            const signupCode = res.signup_code

                                            if (signupCode) {

                                                await send('message', {id: item.id, message: 'Đang tạo tài khoản'})
                            
                                                const res = await z.post("https://www.instagram.com/api/v1/web/accounts/web_create_ajax/", {
                                                    "headers": {
                                                        "content-type": "application/x-www-form-urlencoded",
                                                        "sec-ch-prefers-color-scheme": "light",
                                                        "x-asbd-id": "129477",
                                                        "x-csrftoken": csrf,
                                                        "x-ig-app-id": "936619743392459",
                                                        "x-ig-www-claim": "0",
                                                        "x-instagram-ajax": "1013077871",
                                                        "x-requested-with": "XMLHttpRequest",
                                                        "x-web-device-id": deviceId
                                                    },
                                                    "body": "enc_password="+encodeURIComponent("#PWD_INSTAGRAM_BROWSER:0:1111:"+item.password)+"&day="+item.day+"&email="+encodeURIComponent(email.address)+"&first_name="+encodeURIComponent(item.name)+"&month="+item.month+"&username="+item.username+"&year="+item.year+"&client_id="+mid+"&seamless_login_enabled=1&tos_version=row&force_sign_up_code="+signupCode,
                                                })

                                                // console.log(res)

                                                // if (res.account_created) {
                                                //     success = true            
                                                // }

                                            }

                                        }

                                    } else {
                                        await send('message', {id: item.id, message: 'Giải captcha thất bại'})
                                    }

                                } catch {}

                            } catch (err) {

                                await send('message', {id: item.id, message: 'Đang chờ mã kích hoạt'})

                                let code = false 
                        
                                for (let index = 0; index < 99; index++) {
                                    
                                    try {

                                        if (service === 'gmail.com') {

                                            for (let index = 0; index < 30; index++) {
                                                
                                                try {

                                                    code = await getCode(setting.instaMailApi.value, email.id)

                                                    break

                                                } catch {}

                                                await delayTimeout(2000)
                                                
                                            }

                                            if (code) {
                                                break
                                            }

                                        } else {

                                            const inbox = (await getTmMailInbox(email, service)).filter(item => item.from.includes('mail.instagram.com'))
                        
                                            if (inbox[0].code) {
                                                code = inbox[0].code
                        
                                                break
                                            }

                                        }
                    
                                    } catch (err) { console.log(err)}
                    
                                    await delayTimeout(1000)
                                    
                                }
                    
                                if (code) {
                                                        
                                    await send('message', {id: item.id, message: 'Đang nhập mã: '+code})

                                    await page.type('[name="email_confirmation_code"]', code)

                                    const submit = await page.$x('//div[text()="Next"]')        

                                    await submit[0].click() 
                                }

                                for (let index = 0; index < 99; index++) {

                                    try {
    
                                        await page.waitForXPath('//*[contains(text(), "The IP address you are using")]', {
                                            timeout: 1000
                                        })

                                        for (let index = 0; index < instaSetting.instagram.repeat.value; index++) {

                                            try {

                                                await page.waitForXPath('//*[contains(text(), "something went wrong creating your account")]', {
                                                    timeout: 500
                                                })

                                                break

                                            } catch {

                                                try {

                                                    const button = await page.$x('//*[contains(text(), "Next")]')

                                                    await button[0].click()

                                                } catch {}

                                                await page.waitForTimeout(500)
                                            }
                                            
                                        }
    
                                        //await send('message', {id: item.id, message: 'IP Spam'})
    
                                        break
    
                                    } catch {}
    
                                    try {
    
                                        await page.waitForXPath('//*[contains(text(), "something went wrong creating your account")]', {
                                            timeout: 1000
                                        })
    
                                        //await send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})
    
                                        //await page.waitForTimeout(2000)
        
                                        break
    
                                    } catch {}
    
    
                                    const cookies = await page.cookies()
    
                                    const checkId = cookies.filter(item => item.name === 'ds_user_id')
                        
                                    if (checkId[0]) {
    
                                        await page.waitForTimeout(3000)
    
                                        const url = await page.url()
    
                                        if (!url.includes('/accounts/suspended')) {
    
                                            //success = true
    
                                            break
    
                                        } else {
    
                                            // success = true
                                            // await send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                                            break
                                            
                                        }
    
                                    }
    
                                    await page.waitForTimeout(1000)
    
                                }

                                
                            }

                        }

                    } catch (err) {
                        console.log(err)
                    } finally {
                        await browser.close()

                        let clearTemp = setInterval(() => {
              
                            if (fs.existsSync(profilePath)) {
                                try { fs.removeSync(profilePath) } catch {}
                            } else {
                                clearInterval(clearTemp)
                            }
            
                        }, 1000)
                    }

                } catch (err) { 

                    console.log(err)
                }

            }

            const ig = new IG({
                proxy: ip,
                username: item.username, 
                password: item.password
            })

            try {

                await send('message', {id: item.id, message: 'Đang thử đăng nhập tài khoản'})

                await delayTimeout(2000)

                await ig.login()

                await send('message', {id: item.id, message: 'Tạo tài khoản thành công'})

                await insta.insert({
                    id: uuidv4(),
                    username: item.username,
                    password: item.password,
                    email: email.address,
                    status: 'Live',
                    cookie: ig.options.headers.cookie
                })

                await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})

                resolve()

            } catch (err) {

                if (err === '282') {

                    await send('message', {id: item.id, message: 'Tạo tài khoản thành công 282'})

                    await insta.insert({
                        id: uuidv4(),
                        username: item.username,
                        password: item.password,
                        email: email.address,
                        status: 'Die',
                        cookie: ig.options.headers.cookie
                    })

                    await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})

                    resolve()

                } else {

                    reject()

                    await send('message', {id: item.id, message: 'Tạo tài khoản thất bại'})

                }
            }

            // if (success) {

            //     await send('message', {id: item.id, message: 'Tạo tài khoản thành công'})
                                
            //     await insta.insert({
            //         id: uuidv4(),
            //         username: item.username,
            //         password: item.password,
            //         email: email.address,
            //         status: 'Live'
            //     })

            //     resolve()

            // } else {

            //     if (stopped) {
            //         await send('updateStatus', {id: item.id, status: 'STOPPED'})
            //     } else {
            //         await send('message', {id: item.id, message: 'Tạo tài khoản thất bại'})
            //     }

            //     reject()

            // }


        } catch (err) {

            reject()
        }

        await send('updateStatus', {id: item.id, status: 'FINISHED'})
        
    })
}

const createInstagram = (ccc, setting, send, cc = false) => {

    return new Promise(async (resolve, reject) => {

        const instaSetting = await getSetting('instaSettings')

        const UA = await randomUserAgent(setting.userAgent.value)

        const randomPes = await randomPersion()
        const item = { 
            ...ccc,
            ...randomPes
        }

        item.username = item.username+randomNumberRange(11111, 99999)

        item.password = generator.generate({
            length: 12,
            numbers: true
        })

        send('insertAccount', item)

        const service = setting.tmMailService.value

        let ip = ''
        let error = false
        let stopped = false
        let email = false
        let success = false

        const lastMessages = []

        try {

            send('updateStatus', {id: item.id, status: 'RUNNING'})

            if (item.proxy && setting.proxy.value !== 'none') {

                try {

                    if (setting.proxy.value === 'httpProxy' || setting.proxy.value === 'sProxy') {
                        ip = item.proxy
                    }
                    
                    if (setting.proxy.value === 'tmProxy') {
                        ip = await useTmProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'shopLike') {
                        ip = await useShopLikeProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'tinSoft') {
                        ip = await useTinProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'proxyFb') {
                        ip = await useProxyFb(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                } catch (err) {
                    error = true
                }
            }

            if (ip && !error && !stopped) {

                try {

                    const agent = useProxy(ip)

                    try {
                        const res = await fetch('https://api.myip.com/', {agent})
                        data = await res.json()
                    } catch {
                        const res = await fetch('https://api.country.is', {agent})
                        data = await res.json()
                    }

                    if (data.ip) {

                        await send('message', {id: item.id, message: 'Sử dụng IP: '+data.ip})
                        await delayTimeout(1000)

                    } else {
                        error = true
                    }

                } catch (err) {

                    await send('message', {id: item.id, message: 'Lỗi proxy'})
                    error = true
                }

            }

            if (!error && !stopped) {

                try {

                    let domain = ''
        
                    if (service === 'emailfake.com') {
                        domain = setting.emailFakeDomain.value
                    }

                    if (service === 'generator.email') {

                        if (setting.customDomain.value) {
                            domain = setting.customDomain.value
                        } else {
                            domain = setting.generatorEmailDomain.value
                        }
                    }

                    if (service === 'moakt.com') {
                        domain = setting.moaktDomain.value
                    }

                    await send('message', {id: item.id, message: 'Đang lấy email'})

                    for (let index = 0; index < 10; index++) {

                        if (index > 0) {
                            await send('message', {id: item.id, message: 'Đang thử lấy lại email'})
                        }

                        if (stopped) { break }
                        
                        try {

                            if (service === 'gmail.com') {
                                
                                email = await getEmail(setting.instaMailApi.value)

                            } else {

                                email = await getTmMail(service, domain)

                            }

                            break

                        } catch (err) {
                            console.log(err)
                        }

                    }

                } catch (err) {

                    await send('message', {id: item.id, message: 'Không thể lấy email'})
                    
                    error = false
                }

            }

            let headers = false
            let agent = false

            if (email && !error && !stopped) {

                try {

                    if (service === 'gmx.live') {

                        try {

                            const res = await fetch("https://gmx.live/login/api.php?login="+email.address+"|"+email.passMail)
                            const $ = cheerio.load(await res.text())

                            $('a').each(function() {
                                lastMessages.push($(this).attr('href'))
                            })

                        } catch (err) {
                            
                        }

                        console.log(lastMessages)

                    }

                    agent = useProxy(ip)
                
                    const ig = new IG({
                        proxy: ip,
                        username: item.username, 
                        password: item.password
                    })

                    const instaData = await ig.getData()

                    headers = {
                        "accept": "/",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "1",
                        "viewport-width": "716",
                        "x-asbd-id": "129477",
                        "x-csrftoken": instaData.csrf,
                        "x-ig-app-id": "1217981644879628",
                        "x-ig-www-claim": "0",
                        "x-instagram-ajax": "1016926547",
                        "x-requested-with": "XMLHttpRequest",
                        "Referer": "https://www.instagram.com/accounts/signup/email/",
                        "Referrer-Policy": "strict-origin-when-cross-origin",
                        "User-Agent": UA,
                    }

                    // const headers = {
                    //     "accept": "*/*",
                    //     "accept-language": "vi",
                    //     "content-type": "application/x-www-form-urlencoded",
                    //     "dpr": "1",
                    //     "viewport-width": "716",
                    //     "x-asbd-id": "129477",
                    //     "x-csrftoken": instaData.csrf,
                    //     "x-ig-app-id": "936619743392459",
                    //     "x-ig-www-claim": "0",
                    //     "x-instagram-ajax": "1010771618",
                    //     "x-requested-with": "XMLHttpRequest",
                    //     "Referer": "https://www.instagram.com/accounts/signup/email/",
                    //     "Referrer-Policy": "strict-origin-when-cross-origin",
                    //     "User-Agent": UA,
                    // }

                    headers.cookies = instaData.cookies

                    await send('message', {id: item.id, message: 'Đang nhập email: '+email.address})

                    await send('updateData', {id: item.id, email: email.address})

                    const res = await fetch("https://www.instagram.com/api/v1/accounts/send_verify_email/", {
                        "headers": headers,
                        "agent": agent,
                        "body": "device_id="+instaData.device+"&email="+encodeURIComponent(email.address),
                        "method": "POST"
                    })

            
                    const resData = await res.json()

                    await delayTimeout(2000)
            
                    if (resData.email_sent && !stopped) {
            
                        await send('message', {id: item.id, message: 'Đang chờ mã kích hoạt'})

                        let code = false 
                
                        for (let index = 0; index < 99; index++) {

                            if (stopped) { break }
                            
                            try {

                                if (service === 'gmail.com') {

                                    for (let index = 0; index < 30; index++) {
                                        
                                        try {

                                            code = await getCode(setting.instaMailApi.value, email.id)

                                            break

                                        } catch {}

                                        await delayTimeout(2000)
                                        
                                    }

                                    if (code) {
                                        break
                                    }

                                } else if (service === 'gmx.live') {

                                    const inbox = (await getGmxInboxes(email, lastMessages)).filter(item => item.from.includes('mail.instagram.com'))

                                    if (inbox[0].code) {
                                        code = inbox[0].code
                
                                        break
                                    }

                                } else {

                                    const inbox = (await getTmMailInbox(email, service)).filter(item => item.from.includes('mail.instagram.com'))
                
                                    if (inbox[0].code) {
                                        code = inbox[0].code
                
                                        break
                                    }

                                }
            
                            } catch (err) { }
            
                            await delayTimeout(1000)
                            
                        }
            
                        if (code && !stopped) {
            
                            await send('message', {id: item.id, message: 'Đang nhập mã kích hoạt: '+code})

                            const res = await fetch("https://www.instagram.com/api/v1/accounts/check_confirmation_code/", {
                                "headers": headers,
                                "agent": agent,
                                "body": "code="+code+"&device_id="+instaData.device+"&email="+encodeURIComponent(email.address),
                                "method": "POST"
                            })
            
                            const resData = await res.json()

                            await delayTimeout(1000)

                            const signupCode = resData.signup_code

                            if (signupCode) {

                                if (cc) {

                                    success = true

                                    const insta = new Db('instagram')

                                    await insta.insert({
                                        id: uuidv4(),
                                        username: item.username,
                                        password: item.password,
                                        email: email.password ? email.address+'|'+email.password : email.address,
                                        status: 'Die',
                                        headers: {
                                            "headers": headers,
                                            "agent": agent,
                                            "body": "enc_password="+encodeURIComponent("#PWD_INSTAGRAM_BROWSER:0:1111:"+item.password)+"&day="+item.day+"&email="+encodeURIComponent(email.address)+"&first_name="+encodeURIComponent(item.name)+"&month="+item.month+"&username="+item.username+"&year="+item.year+"&client_id="+instaData.device+"&seamless_login_enabled=1&tos_version=row&force_sign_up_code="+signupCode,
                                            "method": "POST"
                                        }
                                    })

                                } else {

                                    for (let index = 0; index < instaSetting.instagram.repeat.value; index++) {

                                        if (index === 0) {
                                            await send('message', {id: item.id, message: 'Đang tạo tài khoản'})
                                        } else {
                                            await send('message', {id: item.id, message: 'Thử lại lần '+index})
                                        }

                                        try {
                            
                                            const res = await fetch("https://www.instagram.com/api/v1/web/accounts/web_create_ajax/", {
                                                "headers": headers,
                                                "agent": agent,
                                                "body": "enc_password="+encodeURIComponent("#PWD_INSTAGRAM_BROWSER:0:1111:"+item.password)+"&day="+item.day+"&email="+encodeURIComponent(email.address)+"&first_name="+encodeURIComponent(item.name)+"&month="+item.month+"&username="+item.username+"&year="+item.year+"&client_id="+instaData.device+"&seamless_login_enabled=1&tos_version=row&force_sign_up_code="+signupCode,
                                                "method": "POST"
                                            })

                                            const resData = await res.json()

                                            if (resData.account_created) {
                                                
                                                break

                                            }

                                        } catch (err) {
                                            console.log(err)
                                        }

                                        await delayTimeout(1000)

                                    }
                                }

                            } else {
                                message('Mã kích hoạt không chính xác')
                            }

                        } else {
                            await send('message', {id: item.id, message: 'Không nhận được mã kích hoạt'})
                        }

                    } else {

                        if (email && service === 'gmx.live') {

                            try {
            
                                const res = await fetch('https://clonefbig.vn/api/importAccount.php?code=66e657245b081&api_key=f15cc3865e11c324151ffccdfc01f9da&account='+email.address+'|'+email.password+'&filter=1')
            
                                console.log(await res.text())
            
                            } catch {}
            
                        }

                        await send('message', {id: item.id, message: 'Thêm email thất bại'})
                    }

                } catch (err) { 

                    console.log(err)
                }

            }

            if (success) {

                await send('message', {id: item.id, message: 'Tạo tài khoản thành công'})
                resolve()

            } else {

                const insta = new Db('instagram')

                const ig = new IG({
                    UA: UA,
                    proxy: ip,
                    username: item.username, 
                    password: item.password
                })

                try {

                    await send('message', {id: item.id, message: 'Đang thử đăng nhập tài khoản'})

                    await delayTimeout(2000)
    
                    await ig.login()
    
                    await send('message', {id: item.id, message: 'Tạo tài khoản thành công'})
    
                    await insta.insert({
                        id: uuidv4(),
                        username: item.username,
                        password: item.password,
                        email: email.password ? email.address+'|'+email.password : email.address,
                        status: 'Live',
                        cookie: ig.options.headers.cookie
                    })

                    await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                    resolve()
    
                } catch (err) {
    
                    if (err === '282') {
    
                        await send('message', {id: item.id, message: 'Tạo tài khoản thành công 282'})
    
                        await insta.insert({
                            id: uuidv4(),
                            username: item.username,
                            password: item.password,
                            email: email.password ? email.address+'|'+email.password : email.address,
                            status: '282',
                            cookie: ig.options.headers.cookie
                        })

                        await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                        resolve()

                    } else if (err === 'mail') {

                        await send('message', {id: item.id, message: 'Tạo tài khoản thành công CP mail'})
    
                        await insta.insert({
                            id: uuidv4(),
                            username: item.username,
                            password: item.password,
                            email: email.password ? email.address+'|'+email.password : email.address,
                            status: 'CP Mail',
                            cookie: ig.options.headers.cookie
                        })

                        await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                        resolve()
    
                    }else if (err === 'mail2') {

                        await send('message', {id: item.id, message: 'Tạo tài khoản thành công CP mail2'})
    
                        await insta.insert({
                            id: uuidv4(),
                            username: item.username,
                            password: item.password,
                            email: email.password ? email.address+'|'+email.password : email.address,
                            status: 'CP Mail2',
                            cookie: ig.options.headers.cookie
                        })

                        await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                        resolve()
    
                    } else {

                        if (email && service === 'gmx.live') {

                            try {
            
                                const res = await fetch('https://clonefbig.vn/api/importAccount.php?code=66e657245b081&api_key=f15cc3865e11c324151ffccdfc01f9da&account='+email.address+'|'+email.password+'&filter=1')
            
                                console.log(await res.text())
            
                            } catch {}
            
                        }
    
                        reject()
    
                        await send('message', {id: item.id, message: 'Tạo tài khoản thất bại'})
    
                    }
                }

            }


        } catch (err) {

            if (email && service === 'gmx.live') {

                try {

                    const res = await fetch('https://clonefbig.vn/api/importAccount.php?code=66e657245b081&api_key=f15cc3865e11c324151ffccdfc01f9da&account='+email.address+'|'+email.password+'&filter=1')

                    console.log(await res.text())

                } catch {}

            }


            reject()
        }

        await send('updateStatus', {id: item.id, status: 'FINISHED'})
        
    })
}

const createInstagram2 = (ccc, setting, send, cc = false) => {

    return new Promise(async (resolve, reject) => {

        const instaSetting = await getSetting('instaSettings')

        const UA = await randomUserAgent(setting.userAgent.value)

        const randomPes = await randomPersion()
        const item = { 
            ...ccc,
            ...randomPes
        }

        item.username = item.username+randomNumberRange(11111, 99999)

        item.password = generator.generate({
            length: 12,
            numbers: true
        })

        send('insertAccount', item)

        const service = setting.tmMailService.value

        let ip = ''
        let error = false
        let stopped = false
        let email = false
        let success = false

        const lastMessages = []

        try {


            send('updateStatus', {id: item.id, status: 'RUNNING'})

            if (item.proxy && setting.proxy.value !== 'none') {

                try {

                    if (setting.proxy.value === 'httpProxy' || setting.proxy.value === 'sProxy') {
                        ip = item.proxy
                    }
                    
                    if (setting.proxy.value === 'tmProxy') {
                        ip = await useTmProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'shopLike') {
                        ip = await useShopLikeProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'tinSoft') {
                        ip = await useTinProxy(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'proxyFb') {
                        ip = await useProxyFb(item.proxy, async msg => {
                            await send('message', {id: item.id, message: msg})
                        })
                    }

                } catch (err) {
                    error = true
                }
            }

            if (ip && !error && !stopped) {

                try {

                    const agent = useProxy(ip)

                    try {
                        const res = await fetch('https://api.myip.com/', {agent})
                        data = await res.json()
                    } catch {
                        const res = await fetch('https://api.country.is', {agent})
                        data = await res.json()
                    }

                    if (data.ip) {

                        await send('message', {id: item.id, message: 'Sử dụng IP: '+data.ip})
                        await delayTimeout(1000)

                    } else {
                        error = true
                    }

                } catch (err) {

                    await send('message', {id: item.id, message: 'Lỗi proxy'})
                    error = true
                }

            }

            if (!error && !stopped) {

                try {

                    let domain = ''
        
                    if (service === 'emailfake.com') {
                        domain = setting.emailFakeDomain.value
                    }

                    if (service === 'generator.email') {

                        if (setting.customDomain.value) {
                            domain = setting.customDomain.value
                        } else {
                            domain = setting.generatorEmailDomain.value
                        }
                    }

                    if (service === 'moakt.com') {
                        domain = setting.moaktDomain.value
                    }

                    await send('message', {id: item.id, message: 'Đang lấy email'})

                    for (let index = 0; index < 10; index++) {

                        if (index > 0) {
                            await send('message', {id: item.id, message: 'Đang thử lấy lại email'})
                        }

                        if (stopped) { break }
                        
                        try {

                            if (service === 'gmail.com') {
                                
                                email = await getEmail(setting.instaMailApi.value)

                            } else {

                                email = await getTmMail(service, domain)

                            }

                            await send('message', {id: item.id, message: 'Lấy email thành công'})

                            break

                        } catch (err) {
                            console.log(err)
                        }

                    }

                } catch (err) {

                    await send('message', {id: item.id, message: 'Không thể lấy email'})
                    
                    error = false
                }

            }

            let headers = false
            let agent = false

            if (email && !error && !stopped) {

                try {

                    if (service === 'gmx.live') {

                        try {

                            const res = await fetch("https://gmx.live/login/api.php?login="+email.address+"|"+email.passMail)
                            const $ = cheerio.load(await res.text())

                            $('a').each(function() {
                                lastMessages.push($(this).attr('href'))
                            })

                        } catch (err) {
                            
                        }

                        console.log(lastMessages)

                    }

                    agent = useProxy(ip)
                
                    const ig = new IG({
                        proxy: ip,
                        username: item.username, 
                        password: item.password
                    })

                    const instaData = await ig.getData()

                    const res0 = await fetch("https://www.instagram.com/api/graphql", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "priority": "u=1, i",
                            "sec-ch-prefers-color-scheme": "light",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-asbd-id": "129477",
                            "x-csrftoken": instaData.csrf,
                            "x-fb-friendly-name": "IGMAAWebBloksFullPageRootQuery",
                            "x-fb-lsd": instaData.lsd,
                            "x-ig-app-id": "1217981644879628",
                            "cookie": instaData.cookies,
                            "Referer": "https://www.instagram.com/accounts/login/",
                            "Referrer-Policy": "strict-origin-when-cross-origin",
                            "User-Agent": UA,
                        },
                        "agent": agent,
                        "body": "av=0&__d=www&__user=0&__a=1&__req=1&__hs=20033.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=3&__ccg=GOOD&__rev=1017967501&__s=rhlr5k%3Azr2wcn%3A7f0esu&__hsi=7434010502259148098&__dyn=7xeUjG1mwt8K2Wmh0no6u5U4e0yoW3q32360CEbo1nEhw2nVE4W0qa0FE2awt81s8hwnU6a3a1YwBgao6C0Mo2swaO4U2zxe2GewGw9a361qw8Xwn82Lx-0lK3qazo7u1xwIwbS1LwTwKG0hq1Iwqo5q1IQp1yU5Oi2K7E5yq1kwcOEy9x6&__csr=hQAasBlsBjjjmKWZSAvWBK4qhoZGrFQl-p3vrS9yFe598OECexu2KexG4oOGBK5u7uES-7HzawwxWEcWK9x244K2eum3l3o-Fo9obE9ox0WBy801ft8G1Fw0O2w2SpoXg0Eghc0sWbm1ca0o2QIMnCwb20ue1vCDg3zw4Wg07VC&__comet_req=7&lsd="+instaData.lsd+"&jazoest="+instaData.jazoest+"&__spin_r=1017967501&__spin_b=trunk&__spin_t=1730865450&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=IGMAAWebBloksFullPageRootQuery&variables=%7B%22input%22%3A%7B%22appid%22%3A%22com.bloks.www.caa.login.igmweb.delegate%22%2C%22bloks_versioning_id%22%3A%22"+instaData.versionId+"%22%2C%22params%22%3A%22%7B%5C%22next_uri%5C%22%3A%5C%22%5C%5C%2F%5C%22%7D%22%7D%7D&server_timestamps=true&doc_id=7765850536785467",
                        "method": "POST"
                    })

                    const data0 = await res0.text()

                    const waterfallId = data0.split('(bk.action.array.Make)), false, ')[1].split('")')[0].replace(/\\/g, '').replace('"', '').trim()
                    const flowId = data0.split('registration_flow_id')[1].split('",')[0].replace(/\\/g, '').replace('":"', '').trim()

                    const res1 = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.bloks.caa.reg.contactpoint_email&type=app&__bkv="+instaData.versionId, {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                            "priority": "u=1, i",
                            "sec-ch-prefers-color-scheme": "light",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "cookie": instaData.cookies,
                            "User-Agent": UA,
                            "Referer": "https://www.instagram.com/accounts/login/",
                            "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "agent": agent,
                        "body": "__d=www&__user=0&__a=1&__req=7&__hs=20033.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=3&__ccg=EXCELLENT&__rev=1017971080&__s=ywld8k%3Aaz4dnc%3Ayy376r&__hsi=7434019156881073445&__dyn=7xeUjG1mwt8K2Wmh0no6u5U4e0yoW3q32360CEbo1nEhw2nVE4W0qa0FE2awt81s8hwnU6a3a1YwBgao6C0Mo2swaO4U2zxe2GewGw9a361qw8Xwn82Lx-0lK3qazo7u1xwIwbS1LwTwKG0hq1Iwqo5q1IQp1yU5Oi2K7E5yq1kwcOEy9x6&__csr=jg_cycjOYjuZtRFF9eaXy9pFogAFdJGFtAh4FAWmqmii799UnhUkwPxbwFBioR2WU8ElWxTz8iz8iwgUpBgKm29KVEdEW8VVomwWxa5Ueagjxu00jRyfwpo0cB80K2e80a1IAWx60ra55whFnw5XVLc210aq0uG1v80YE1eA01-tw&__comet_req=7&lsd="+instaData.lsd+"&jazoest="+instaData.jazoest+"&__spin_r=1017971080&__spin_b=trunk&__spin_t=1730867465&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22device_id%5C%22%3A%5C%22"+instaData.device+"%5C%22%2C%5C%22waterfall_id%5C%22%3A%5C%22"+waterfallId+"%5C%22%2C%5C%22is_platform_login%5C%22%3A0%2C%5C%22is_from_logged_out%5C%22%3A0%2C%5C%22access_flow_version%5C%22%3A%5C%22F2_FLOW%5C%22%2C%5C%22root_screen_id%5C%22%3A%5C%22bloks.caa.reg.contactpoint_phone%5C%22%2C%5C%22reg_info%5C%22%3A%5C%22%7B%5C%5C%5C%22first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22contactpoint%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ar_contactpoint%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22contactpoint_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_using_unified_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22unified_cp_screen_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_cp_auto_confirmed%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_cp_auto_confirmable%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22birthday%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22did_use_age%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22use_custom_gender%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22custom_gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_password%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username_prefill%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_conf_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22device_id%5C%5C%5C%22%3A%5C%5C%5C%22"+instaData.device+"%5C%5C%5C%22%2C%5C%5C%5C%22ig4a_qe_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22family_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22nta_eligibility_reason%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_nta_test_group%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_response%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_upload_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22avatar%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token_no_contact_perm%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_tokens%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_two_step_conf%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22openid_tokens_for_testing%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn_for_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22cached_headers_safetynet_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_headers_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22was_headers_prefill_available%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sso_enabled%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22existing_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22used_ig_birthday%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sync_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22create_new_to_app_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_session_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_nonce%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_save_password%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22horizon_synced_username%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_access_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22horizon_synced_profile_pic%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_identity_synced%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_msplit_reg%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id_of_msplit_creator%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22dma_data_combination_consent_given%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22xapp_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_nta_upsell%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22big_blue_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_sync_step_nta%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22caa_reg_flow_source%5C%5C%5C%22%3A%5C%5C%5C%22login_home_native_integration_point%5C%5C%5C%22%2C%5C%5C%5C%22ig_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_sheet_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22crypted_user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_caa_perf_enabled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_preform%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22ignore_suma_check%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_from_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_after_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22suggested_first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_full_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22replace_id_sync_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_redirect_from_nta_replace_id_sync_variant%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22frl_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22post_form_errors%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_step_without_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_exact_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_fuzzy_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_oauth_exists%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code_send_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_too_young%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22source_account_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22whatsapp_installed_on_client%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_medium%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_credentials_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_cuid%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22soap_creation_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_type_to_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22registration_flow_id%5C%5C%5C%22%3A%5C%5C%5C%22"+flowId+"%5C%5C%5C%22%2C%5C%5C%5C%22should_skip_youth_tos%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_youth_regulation_flow_complete%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_on_cold_start%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_prefilled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22cp_confirmed_by_auto_conf%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22auto_conf_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22in_sowa_experiment%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22youth_regulation_config%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_allow_back_nav_after_change_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_bouncing_cliff_screen_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_show_bouncing_cliff%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22eligible_to_flash_call_in_ig4a%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22flash_call_permissions_status%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22request_data_and_challenge_nonce_string%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22confirmed_cp_and_code%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22notification_callback_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22reg_suma_state%5C%5C%5C%22%3A0%2C%5C%5C%5C%22is_msplit_neutral_choice%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22msg_previous_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ntp_import_source_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22youth_consent_decision_time%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username_screen_experience%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22reduced_tos_test_group%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22should_show_spi_before_conf%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22google_oauth_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_reg_request_from_ig_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_igios_spc_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22device_emails%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_toa_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_threads_public%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22spc_import_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22caa_play_integrity_attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22flash_call_provider%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22name_prefill_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22spc_birthday_input%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22failed_birthday_year_count%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_presented_medium_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_opted_out_of_ntp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_from_registration_reminder%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22show_youth_reg_in_ig_spc%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22fb_suma_combined_landing_candidate_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22fb_suma_is_high_confidence%5C%5C%5C%22%3Anull%7D%5C%22%2C%5C%22flow_info%5C%22%3A%5C%22%7B%5C%5C%5C%22flow_name%5C%5C%5C%22%3A%5C%5C%5C%22new_to_family_ig_default%5C%5C%5C%22%2C%5C%5C%5C%22flow_type%5C%5C%5C%22%3A%5C%5C%5C%22ntf%5C%5C%5C%22%7D%5C%22%2C%5C%22current_step%5C%22%3A0%2C%5C%22INTERNAL_INFRA_screen_id%5C%22%3A%5C%22CAA_REG_CONTACT_POINT_EMAIL%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22lois_settings%5C%22%3A%7B%5C%22lois_token%5C%22%3A%5C%22%5C%22%2C%5C%22lara_override%5C%22%3A%5C%22%5C%22%7D%7D%7D%22%7D",
                        "method": "POST"
                    })

                    const data1 = await res1.text()

                    const requestId = data1.replace(/\\/g, '').split('"INTERNAL_INFRA_THEME"), (bk.action.array.Make, "')[1].split('"')[0]
                    const inputId = data1.split('0, 0, (bk.action.i64.Const, ')[1].split(')')[0]
                    const markerid = data1.replace(/\\/g, '').split('"flow_type":"ntf"}", 0, ')[1].split(', (bk.action.i64.Cons')[0]

                    const instanceId = data1.replace(/\\/g, '').split('"flow_type":"ntf"}"')[1].split(')')[0].split('(bk.action.i64.Const, ')[1]

                    await send('message', {id: item.id, message: 'Đang nhập email: '+email.address})

                    await send('updateData', {id: item.id, email: email.address})

                    const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.bloks.caa.reg.async.contactpoint_email.async&type=action&__bkv="+instaData.versionId, {
                        "headers": {
                          "accept": "*/*",
                          "accept-language": "en-US,en;q=0.9",
                          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                          "priority": "u=1, i",
                          "sec-ch-prefers-color-scheme": "light",
                          "sec-fetch-dest": "empty",
                          "sec-fetch-mode": "cors",
                          "sec-fetch-site": "same-origin",
                          "cookie": instaData.cookies,
                          "User-Agent": UA,
                          "Referer": "https://www.instagram.com/accounts/login/",
                          "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "agent": agent,
                        "body": "__d=www&__user=0&__a=1&__req=a&__hs=20033.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=3&__ccg=GOOD&__rev=1017973646&__s=vxmfab%3Aaz4dnc%3Aw7326a&__hsi=7434040138847536712&__dyn=7xeUjG1mwt8K2Wmh0no6u5U4e0yoW3q32360CEbo1nEhw2nVE4W0qa0FE2awt81s8hwnU6a3a1YwBgao6C0Mo2swaO4U2zxe2GewGw9a361qw8Xwn82Lx-0lK3qazo7u1xwIwbS1LwTwKG0hq1Iwqo5q1IQp1yU5Oi2K7E5yq1kwcOEy9x6&__csr=hYcZF8QjbieROZ4rBOz9oG9AyrAaH8nm9Bl5F4mczJ1amm6Qqq2i3Z29qzFt3ER1q8GVV8mxnxy7Eix-2CEWumq549hofEOHAx2i1ryE-48bWDx600jSl0to0cG80IO9Ao0D-reEhgjU1Doko4mvo1qpFQaqo8Q0FE1VU5SS0YU1089U07Xa&__comet_req=7&lsd="+instaData.lsd+"&jazoest="+instaData.jazoest+"&__spin_r=1017973646&__spin_b=trunk&__spin_t=1730872350&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22event_request_id%5C%22%3A%5C%22"+requestId+"%5C%22%2C%5C%22cp_funnel%5C%22%3A0%2C%5C%22cp_source%5C%22%3A0%2C%5C%22text_input_id%5C%22%3A%5C%22"+inputId+"%5C%22%2C%5C%22reg_info%5C%22%3A%5C%22%7B%5C%5C%5C%22first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22contactpoint%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ar_contactpoint%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22contactpoint_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_using_unified_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22unified_cp_screen_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_cp_auto_confirmed%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_cp_auto_confirmable%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22birthday%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22did_use_age%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22use_custom_gender%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22custom_gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_password%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username_prefill%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_conf_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22device_id%5C%5C%5C%22%3A%5C%5C%5C%22"+instaData.device+"%5C%5C%5C%22%2C%5C%5C%5C%22ig4a_qe_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22family_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22nta_eligibility_reason%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_nta_test_group%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_response%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_upload_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22avatar%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token_no_contact_perm%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_tokens%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_two_step_conf%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22openid_tokens_for_testing%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn_for_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22cached_headers_safetynet_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_headers_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22was_headers_prefill_available%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sso_enabled%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22existing_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22used_ig_birthday%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sync_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22create_new_to_app_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_session_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_nonce%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_save_password%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22horizon_synced_username%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_access_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22horizon_synced_profile_pic%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_identity_synced%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_msplit_reg%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id_of_msplit_creator%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22dma_data_combination_consent_given%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22xapp_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_nta_upsell%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22big_blue_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_sync_step_nta%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22caa_reg_flow_source%5C%5C%5C%22%3A%5C%5C%5C%22login_home_native_integration_point%5C%5C%5C%22%2C%5C%5C%5C%22ig_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_sheet_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22crypted_user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_caa_perf_enabled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_preform%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22ignore_suma_check%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_from_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_after_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22suggested_first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_full_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22replace_id_sync_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_redirect_from_nta_replace_id_sync_variant%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22frl_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22post_form_errors%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_step_without_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_exact_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_fuzzy_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_oauth_exists%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code_send_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_too_young%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22source_account_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22whatsapp_installed_on_client%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_medium%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_credentials_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_cuid%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22soap_creation_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_type_to_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22registration_flow_id%5C%5C%5C%22%3A%5C%5C%5C%22"+flowId+"%5C%5C%5C%22%2C%5C%5C%5C%22should_skip_youth_tos%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_youth_regulation_flow_complete%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_on_cold_start%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_prefilled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22cp_confirmed_by_auto_conf%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22auto_conf_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22in_sowa_experiment%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22youth_regulation_config%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_allow_back_nav_after_change_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_bouncing_cliff_screen_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_show_bouncing_cliff%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22eligible_to_flash_call_in_ig4a%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22flash_call_permissions_status%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22request_data_and_challenge_nonce_string%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22confirmed_cp_and_code%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22notification_callback_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22reg_suma_state%5C%5C%5C%22%3A0%2C%5C%5C%5C%22is_msplit_neutral_choice%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22msg_previous_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ntp_import_source_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22youth_consent_decision_time%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username_screen_experience%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22reduced_tos_test_group%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22should_show_spi_before_conf%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22google_oauth_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_reg_request_from_ig_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_igios_spc_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22device_emails%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_toa_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_threads_public%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22spc_import_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22caa_play_integrity_attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22flash_call_provider%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22name_prefill_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22spc_birthday_input%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22failed_birthday_year_count%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_presented_medium_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_opted_out_of_ntp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_from_registration_reminder%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22show_youth_reg_in_ig_spc%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22fb_suma_combined_landing_candidate_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22fb_suma_is_high_confidence%5C%5C%5C%22%3Anull%7D%5C%22%2C%5C%22flow_info%5C%22%3A%5C%22%7B%5C%5C%5C%22flow_name%5C%5C%5C%22%3A%5C%5C%5C%22new_to_family_ig_default%5C%5C%5C%22%2C%5C%5C%5C%22flow_type%5C%5C%5C%22%3A%5C%5C%5C%22ntf%5C%5C%5C%22%7D%5C%22%2C%5C%22current_step%5C%22%3A0%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A"+markerid+"%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22"+instanceId+"%5C%22%2C%5C%22device_id%5C%22%3A%5C%22"+instaData.device+"%5C%22%2C%5C%22family_device_id%5C%22%3Anull%2C%5C%22waterfall_id%5C%22%3A%5C%22"+waterfallId+"%5C%22%2C%5C%22offline_experiment_group%5C%22%3Anull%2C%5C%22layered_homepage_experiment_group%5C%22%3Anull%2C%5C%22is_platform_login%5C%22%3A0%2C%5C%22is_from_logged_in_switcher%5C%22%3A0%2C%5C%22is_from_logged_out%5C%22%3A0%2C%5C%22access_flow_version%5C%22%3A%5C%22F2_FLOW%5C%22%2C%5C%22INTERNAL_INFRA_THEME%5C%22%3A%5C%22harm_f%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22device_id%5C%22%3A%5C%22"+instaData.device+"%5C%22%2C%5C%22family_device_id%5C%22%3A%5C%22%5C%22%2C%5C%22email%5C%22%3A%5C%22"+encodeURIComponent(email.address)+"%5C%22%2C%5C%22email_prefilled%5C%22%3A0%2C%5C%22accounts_list%5C%22%3A%5B%5D%2C%5C%22fb_ig_device_id%5C%22%3A%5B%5D%2C%5C%22confirmed_cp_and_code%5C%22%3A%7B%7D%2C%5C%22is_from_device_emails%5C%22%3A0%2C%5C%22msg_previous_cp%5C%22%3A%5C%22%5C%22%2C%5C%22switch_cp_first_time_loading%5C%22%3A1%2C%5C%22switch_cp_have_seen_suma%5C%22%3A0%2C%5C%22lois_settings%5C%22%3A%7B%5C%22lois_token%5C%22%3A%5C%22%5C%22%2C%5C%22lara_override%5C%22%3A%5C%22%5C%22%7D%7D%7D%22%7D",
                        "method": "POST"
                    })
            
                    const resData = await res.text()
            
                    if (resData.includes(email.address.split('@')[0]) && !stopped) {
            
                        await send('message', {id: item.id, message: 'Đang chờ mã kích hoạt'})

                        let code = false 
                
                        for (let index = 0; index < 99; index++) {

                            if (stopped) { break }
                            
                            try {

                                if (service === 'gmail.com') {

                                    for (let index = 0; index < 30; index++) {
                                        
                                        try {

                                            code = await getCode(setting.instaMailApi.value, email.id)

                                            break

                                        } catch {}

                                        await delayTimeout(2000)
                                        
                                    }

                                    if (code) {
                                        break
                                    }

                                } else if (service === 'gmx.live') {

                                    const inbox = (await getGmxInboxes(email, lastMessages)).filter(item => item.from.includes('mail.instagram.com'))

                                    if (inbox[0].code) {
                                        code = inbox[0].code
                
                                        break
                                    }

                                } else {

                                    const inbox = (await getTmMailInbox(email, service)).filter(item => item.from.includes('mail.instagram.com'))
                
                                    if (inbox[0].code) {
                                        code = inbox[0].code
                
                                        break
                                    }

                                }
            
                            } catch (err) { }
            
                            await delayTimeout(1000)
                            
                        }
            
                        if (code && !stopped) {
            
                            await send('message', {id: item.id, message: 'Đang nhập mã kích hoạt: '+code})

                            const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.bloks.caa.reg.confirmation.async&type=action&__bkv=a2e134f798301e28e517956976df910b8fa9c85f9187c2963f77cdd733f46130", {
                                "headers": {
                                    "accept": "*/*",
                                    "accept-language": "en-US,en;q=0.9",
                                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                    "priority": "u=1, i",
                                    "sec-ch-prefers-color-scheme": "light",
                                    "sec-fetch-dest": "empty",
                                    "sec-fetch-mode": "cors",
                                    "sec-fetch-site": "same-origin",
                                    "cookie": instaData.cookies,
                                    "User-Agent": UA,
                                    "Referer": "https://www.instagram.com/accounts/login/",
                                    "Referrer-Policy": "strict-origin-when-cross-origin"
                                },
                                "agent": agent,
                                "body": "__d=www&__user=0&__a=1&__req=21&__hs=20033.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=3&__ccg=GOOD&__rev=1017973646&__s=awxtfu%3Aaz4dnc%3Aw7326a&__hsi=7434040138847536712&__dyn=7xeUjG1mwt8K2Wmh0no6u5U4e0yoW3q32360CEbo1nEhw2nVE4W0qa0FE2awt81s8hwnU6a3a1YwBgao6C0Mo2swaO4U2zxe2GewGw9a361qw8Xwn82Lx-0lK3qazo7u1xwIwbS1LwTwKG0hq1Iwqo5q1IQp1yU5Oi2K7E5yq1kwcOEy9x6&__csr=hYcZF8QjbieROZ4rBOz9oG9AyrAaH8nm9Bl5F4mczJ1amm6Qqq2i3Z29qzFt3ER1q8GVV8mxnxy7Eix-2CEWumq549hofEOHAx2i1ryE-48bWDx600jSl0to0cG80IO9Ao0D-reEhgjU1Doko4mvo1qpFQaqo8Q0FE1VU5SS0YU1089U07Xa&__comet_req=7&lsd="+instaData.lsd+"&jazoest="+instaData.jazoest+"&__spin_r=1017973646&__spin_b=trunk&__spin_t=1730872350&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22event_request_id%5C%22%3A%5C%22"+requestId+"%5C%22%2C%5C%22text_input_id%5C%22%3A%5C%22"+inputId+"%5C%22%2C%5C%22sms_retriever_started_prior_step%5C%22%3A0%2C%5C%22wa_timer_id%5C%22%3A%5C%22wa_retriever%5C%22%2C%5C%22reg_info%5C%22%3A%5C%22%7B%5C%5C%5C%22first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22contactpoint%5C%5C%5C%22%3A%5C%5C%5C%22"+email.address.split('@')[0]+"%5C%5C%5C%5Cu0040"+email.address.split('@')[1]+"%5C%5C%5C%22%2C%5C%5C%5C%22ar_contactpoint%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22contactpoint_type%5C%5C%5C%22%3A%5C%5C%5C%22email%5C%5C%5C%22%2C%5C%5C%5C%22is_using_unified_cp%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22unified_cp_screen_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_cp_auto_confirmed%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_cp_auto_confirmable%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22birthday%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22did_use_age%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22use_custom_gender%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22custom_gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_password%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username_prefill%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_conf_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22device_id%5C%5C%5C%22%3A%5C%5C%5C%22"+instaData.device+"%5C%5C%5C%22%2C%5C%5C%5C%22ig4a_qe_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22family_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22nta_eligibility_reason%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_nta_test_group%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_response%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_upload_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22avatar%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token_no_contact_perm%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_tokens%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_two_step_conf%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22openid_tokens_for_testing%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn_for_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22cached_headers_safetynet_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_headers_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22was_headers_prefill_available%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sso_enabled%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22existing_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22used_ig_birthday%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sync_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22create_new_to_app_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_session_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_nonce%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_save_password%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22horizon_synced_username%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_access_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22horizon_synced_profile_pic%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_identity_synced%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_msplit_reg%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id_of_msplit_creator%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22dma_data_combination_consent_given%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22xapp_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_nta_upsell%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22big_blue_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_sync_step_nta%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22caa_reg_flow_source%5C%5C%5C%22%3A%5C%5C%5C%22login_home_native_integration_point%5C%5C%5C%22%2C%5C%5C%5C%22ig_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_sheet_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22crypted_user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_caa_perf_enabled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_preform%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22ignore_suma_check%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_from_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_after_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22suggested_first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_full_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22replace_id_sync_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_redirect_from_nta_replace_id_sync_variant%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22frl_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22post_form_errors%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_step_without_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_exact_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_fuzzy_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_oauth_exists%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code_send_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_too_young%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22source_account_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22whatsapp_installed_on_client%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_medium%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_credentials_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_cuid%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22soap_creation_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_type_to_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22registration_flow_id%5C%5C%5C%22%3A%5C%5C%5C%22"+flowId+"%5C%5C%5C%22%2C%5C%5C%5C%22should_skip_youth_tos%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_youth_regulation_flow_complete%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_on_cold_start%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_prefilled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22cp_confirmed_by_auto_conf%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22auto_conf_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22in_sowa_experiment%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22youth_regulation_config%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_allow_back_nav_after_change_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_bouncing_cliff_screen_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_show_bouncing_cliff%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22eligible_to_flash_call_in_ig4a%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22flash_call_permissions_status%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22request_data_and_challenge_nonce_string%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22confirmed_cp_and_code%5C%5C%5C%22%3A%5B%5D%2C%5C%5C%5C%22notification_callback_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22reg_suma_state%5C%5C%5C%22%3A0%2C%5C%5C%5C%22is_msplit_neutral_choice%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22msg_previous_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ntp_import_source_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22youth_consent_decision_time%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username_screen_experience%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22reduced_tos_test_group%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22should_show_spi_before_conf%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22google_oauth_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_reg_request_from_ig_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_igios_spc_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22device_emails%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_toa_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_threads_public%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22spc_import_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22caa_play_integrity_attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22flash_call_provider%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22name_prefill_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22spc_birthday_input%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22failed_birthday_year_count%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_presented_medium_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_opted_out_of_ntp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_from_registration_reminder%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22show_youth_reg_in_ig_spc%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22fb_suma_combined_landing_candidate_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22fb_suma_is_high_confidence%5C%5C%5C%22%3Anull%7D%5C%22%2C%5C%22flow_info%5C%22%3A%5C%22%7B%5C%5C%5C%22flow_name%5C%5C%5C%22%3A%5C%5C%5C%22new_to_family_ig_default%5C%5C%5C%22%2C%5C%5C%5C%22flow_type%5C%5C%5C%22%3A%5C%5C%5C%22ntf%5C%5C%5C%22%7D%5C%22%2C%5C%22current_step%5C%22%3A3%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A"+markerid+"%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22"+instanceId+"%5C%22%2C%5C%22device_id%5C%22%3A%5C%22"+instaData.device+"%5C%22%2C%5C%22family_device_id%5C%22%3Anull%2C%5C%22waterfall_id%5C%22%3A%5C%22"+waterfallId+"%5C%22%2C%5C%22offline_experiment_group%5C%22%3Anull%2C%5C%22layered_homepage_experiment_group%5C%22%3Anull%2C%5C%22is_platform_login%5C%22%3A0%2C%5C%22is_from_logged_in_switcher%5C%22%3A0%2C%5C%22is_from_logged_out%5C%22%3A0%2C%5C%22access_flow_version%5C%22%3A%5C%22F2_FLOW%5C%22%2C%5C%22INTERNAL_INFRA_THEME%5C%22%3A%5C%22harm_f%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22code%5C%22%3A%5C%22"+code+"%5C%22%2C%5C%22fb_ig_device_id%5C%22%3A%5B%5D%2C%5C%22confirmed_cp_and_code%5C%22%3A%7B%7D%2C%5C%22lois_settings%5C%22%3A%7B%5C%22lois_token%5C%22%3A%5C%22%5C%22%2C%5C%22lara_override%5C%22%3A%5C%22%5C%22%7D%7D%7D%22%7D",
                                "method": "POST"
                            })
            
                            const resData = await res.text()

                            if (resData.includes('com.bloks.www.bloks.caa.reg.password')) {

                                const confirm =  resData.replace(/\\/g, '').split('"confirmation_code":"')[1].split('"')[0]

                                for (let index = 0; index < instaSetting.instagram.repeat.value; index++) {

                                    if (index === 0) {
                                        await send('message', {id: item.id, message: 'Đang tạo tài khoản'})
                                    } else {
                                        await send('message', {id: item.id, message: 'Thử lại lần '+index})
                                    }

                                    try {
                        
                                        const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.bloks.caa.reg.create.account.async&type=action&__bkv="+instaData.versionId, {
                                            "headers": {
                                                "accept": "*/*",
                                                "accept-language": "en-US,en;q=0.9",
                                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                                "priority": "u=1, i",
                                                "sec-ch-prefers-color-scheme": "light",
                                                "sec-fetch-dest": "empty",
                                                "sec-fetch-mode": "cors",
                                                "sec-fetch-site": "same-origin",
                                                "cookie": instaData.cookies,
                                                "User-Agent": UA,
                                                "Referer": "https://www.instagram.com/accounts/login/",
                                                "Referrer-Policy": "strict-origin-when-cross-origin"
                                            },
                                            "agent": agent,
                                            "body": "__d=www&__user=0&__a=1&__req=16&__hs=20033.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=3&__ccg=UNKNOWN&__rev=1017973646&__s=ebxw08%3Aaz4dnc%3Asj8kj6&__hsi=7434056668799077665&__dyn=7xeUjG1mwt8K2Wmh0no6u5U4e0yoW3q32360CEbo1nEhw2nVE4W0qa0FE2awt81s8hwnU6a3a1YwBgao6C0Mo2swaO4U2zxe2GewGw9a361qw8Xwn82Lx-0lK3qazo7u1xwIwbS1LwTwKG0hq1Iwqo5q1IQp1yU5Oi2K7E5yq1kwcOEy9x6&__csr=hYcZF8QjbieROZ4rBOz9oG9AyrAaH8nm9Bl5F4mczJ1amm6Qqq2i3Z29qzFt3ER1q8GVV8mxnxy7Eix-2CEWumq549hofEOHAx2i1ryE-48bWDx600jSl0to0cG80IO9Ao0D-reEhgjU1Doko4mvo1qpFQaqo8Q0FE1VU5SS0YU1089U07Xa&__comet_req=7&lsd="+instaData.lsd+"&jazoest="+instaData.jazoest+"&__spin_r=1017973646&__spin_b=trunk&__spin_t=1730876199&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22event_request_id%5C%22%3A%5C%22"+requestId+"%5C%22%2C%5C%22reg_info%5C%22%3A%5C%22%7B%5C%5C%5C%22first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_name%5C%5C%5C%22%3A%5C%5C%5C%22Hung+Nguyen%5C%5C%5C%22%2C%5C%5C%5C%22contactpoint%5C%5C%5C%22%3A%5C%5C%5C%22"+email.address.split('@')[0]+"%5C%5C%5C%5Cu0040"+email.address.split('@')[1]+"%5C%5C%5C%22%2C%5C%5C%5C%22ar_contactpoint%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22contactpoint_type%5C%5C%5C%22%3A%5C%5C%5C%22email%5C%5C%5C%22%2C%5C%5C%5C%22is_using_unified_cp%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22unified_cp_screen_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_cp_auto_confirmed%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_cp_auto_confirmable%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code%5C%5C%5C%22%3A%5C%5C%5C%22"+confirm+"%5C%5C%5C%22%2C%5C%5C%5C%22birthday%5C%5C%5C%22%3A%5C%5C%5C%22"+item.day+"-"+item.month+"-"+item.year+"%5C%5C%5C%22%2C%5C%5C%5C%22did_use_age%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22use_custom_gender%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22custom_gender%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_password%5C%5C%5C%22%3A%5C%5C%5C%22"+encodeURIComponent("#PWD_INSTAGRAM_BROWSER:0:1111:"+item.password)+"%5C%5C%5C%22%2C%5C%5C%5C%22username%5C%5C%5C%22%3A%5C%5C%5C%22"+item.username+"%5C%5C%5C%22%2C%5C%5C%5C%22username_prefill%5C%5C%5C%22%3A%5C%5C%5C%22"+email.address.split('@')[0]+"%5C%5C%5C%22%2C%5C%5C%5C%22fb_conf_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22device_id%5C%5C%5C%22%3A%5C%5C%5C%22"+instaData.device+"%5C%5C%5C%22%2C%5C%5C%5C%22ig4a_qe_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22family_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22nta_eligibility_reason%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_nta_test_group%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22safetynet_response%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22profile_photo_upload_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22avatar%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token_no_contact_perm%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22email_oauth_tokens%5C%5C%5C%22%3A%5B%5D%2C%5C%5C%5C%22should_skip_two_step_conf%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22openid_tokens_for_testing%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22encrypted_msisdn_for_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22cached_headers_safetynet_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_headers_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_last_infra_flow_id_safetynet%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22headers_flow_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22was_headers_prefill_available%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sso_enabled%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22existing_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22used_ig_birthday%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22sync_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22create_new_to_app_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_session_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ck_nonce%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_save_password%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22horizon_synced_username%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_access_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22horizon_synced_profile_pic%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_identity_synced%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_msplit_reg%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_id_of_msplit_creator%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22dma_data_combination_consent_given%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22xapp_accounts%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22fb_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_device_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ig_machine_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22should_skip_nta_upsell%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22big_blue_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_sync_step_nta%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22caa_reg_flow_source%5C%5C%5C%22%3A%5C%5C%5C%22login_home_native_integration_point%5C%5C%5C%22%2C%5C%5C%5C%22ig_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22full_sheet_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22crypted_user_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_caa_perf_enabled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_preform%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22ignore_suma_check%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_from_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22ignore_existing_login_after_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22suggested_first_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_last_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22suggested_full_name%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22replace_id_sync_variant%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_redirect_from_nta_replace_id_sync_variant%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22frl_authorization_token%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22post_form_errors%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22skip_step_without_errors%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_exact_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22existing_account_fuzzy_match_checked%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_oauth_exists%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_code_send_error%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_too_young%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22source_account_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22whatsapp_installed_on_client%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22confirmation_medium%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_credentials_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_cuid%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22soap_creation_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22source_account_type_to_reg_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22registration_flow_id%5C%5C%5C%22%3A%5C%5C%5C%22"+flowId+"%5C%5C%5C%22%2C%5C%5C%5C%22should_skip_youth_tos%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_youth_regulation_flow_complete%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_on_cold_start%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22email_prefilled%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22cp_confirmed_by_auto_conf%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22auto_conf_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22in_sowa_experiment%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22youth_regulation_config%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_allow_back_nav_after_change_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_bouncing_cliff_screen_type%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22conf_show_bouncing_cliff%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22eligible_to_flash_call_in_ig4a%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22flash_call_permissions_status%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22request_data_and_challenge_nonce_string%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22confirmed_cp_and_code%5C%5C%5C%22%3A%5B%5D%2C%5C%5C%5C%22notification_callback_id%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22reg_suma_state%5C%5C%5C%22%3A0%2C%5C%5C%5C%22is_msplit_neutral_choice%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22msg_previous_cp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22ntp_import_source_info%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22youth_consent_decision_time%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22username_screen_experience%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22reduced_tos_test_group%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22should_show_spi_before_conf%5C%5C%5C%22%3Atrue%2C%5C%5C%5C%22google_oauth_account%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_reg_request_from_ig_suma%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_igios_spc_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22device_emails%5C%5C%5C%22%3A%5B%5D%2C%5C%5C%5C%22is_toa_reg%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22is_threads_public%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22spc_import_flow%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22caa_play_integrity_attestation_result%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22flash_call_provider%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22name_prefill_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22spc_birthday_input%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22failed_birthday_year_count%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_presented_medium_source%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22user_opted_out_of_ntp%5C%5C%5C%22%3Anull%2C%5C%5C%5C%22is_from_registration_reminder%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22show_youth_reg_in_ig_spc%5C%5C%5C%22%3Afalse%2C%5C%5C%5C%22fb_suma_combined_landing_candidate_variant%5C%5C%5C%22%3A%5C%5C%5C%22control%5C%5C%5C%22%2C%5C%5C%5C%22fb_suma_is_high_confidence%5C%5C%5C%22%3Anull%7D%5C%22%2C%5C%22flow_info%5C%22%3A%5C%22%7B%5C%5C%5C%22flow_name%5C%5C%5C%22%3A%5C%5C%5C%22new_to_family_ig_default%5C%5C%5C%22%2C%5C%5C%5C%22flow_type%5C%5C%5C%22%3A%5C%5C%5C%22ntf%5C%5C%5C%22%7D%5C%22%2C%5C%22current_step%5C%22%3A10%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A"+markerid+"%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22"+instanceId+"%5C%22%2C%5C%22device_id%5C%22%3A%5C%22"+instaData.device+"%5C%22%2C%5C%22family_device_id%5C%22%3Anull%2C%5C%22waterfall_id%5C%22%3A%5C%22"+waterfallId+"%5C%22%2C%5C%22offline_experiment_group%5C%22%3Anull%2C%5C%22layered_homepage_experiment_group%5C%22%3Anull%2C%5C%22is_platform_login%5C%22%3A0%2C%5C%22is_from_logged_in_switcher%5C%22%3A0%2C%5C%22is_from_logged_out%5C%22%3A0%2C%5C%22access_flow_version%5C%22%3A%5C%22F2_FLOW%5C%22%2C%5C%22INTERNAL_INFRA_THEME%5C%22%3A%5C%22harm_f%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22device_id%5C%22%3A%5C%22"+instaData.device+"%5C%22%2C%5C%22waterfall_id%5C%22%3A%5C%22"+waterfallId+"%5C%22%2C%5C%22machine_id%5C%22%3A%5C%22%5C%22%2C%5C%22ck_error%5C%22%3A%5C%22%5C%22%2C%5C%22ck_id%5C%22%3A%5C%22%5C%22%2C%5C%22ck_nonce%5C%22%3A%5C%22%5C%22%2C%5C%22encrypted_msisdn%5C%22%3A%5C%22%5C%22%2C%5C%22headers_last_infra_flow_id%5C%22%3A%5C%22%5C%22%2C%5C%22reached_from_tos_screen%5C%22%3A1%2C%5C%22no_contact_perm_email_oauth_token%5C%22%3A%5C%22%5C%22%2C%5C%22failed_birthday_year_count%5C%22%3A%5C%22%7B%7D%5C%22%2C%5C%22lois_settings%5C%22%3A%7B%5C%22lois_token%5C%22%3A%5C%22%5C%22%2C%5C%22lara_override%5C%22%3A%5C%22%5C%22%7D%7D%7D%22%7D",
                                            "method": "POST"
                                        })

                                        const resData = await res.text()

                                        if (resData.includes('create_success')) {
                                            
                                            break

                                        }

                                    } catch (err) {
                                        console.log(err)
                                    }

                                    await delayTimeout(1000)

                                }
                

                            } else {
                                await send('message', {id: item.id, message: 'Mã kích hoạt không chính xác'})
                            }

                        } else {
                            await send('message', {id: item.id, message: 'Không nhận được mã kích hoạt'})
                        }

                    } else {

                        await send('message', {id: item.id, message: 'Thêm email thất bại'})

                        if (email && service === 'gmx.live') {

                            try {
            
                                const res = await fetch('https://clonefbig.vn/api/importAccount.php?code=66e657245b081&api_key=f15cc3865e11c324151ffccdfc01f9da&account='+email.address+'|'+email.password+'&filter=1')
            
                                console.log(await res.text())
            
                            } catch {}
            
                        }
                    }

                } catch (err) { 

                    console.log(err)
                }

            }

            if (success) {

                await send('message', {id: item.id, message: 'Tạo tài khoản thành công'})
                resolve()

            } else {

                const insta = new Db('instagram')

                const ig = new IG({
                    UA: UA,
                    proxy: ip,
                    username: item.username, 
                    password: item.password
                })

                try {

                    await send('message', {id: item.id, message: 'Đang thử đăng nhập tài khoản'})

                    await delayTimeout(2000)
    
                    await ig.login()
    
                    await send('message', {id: item.id, message: 'Tạo tài khoản thành công'})


    
                    await insta.insert({
                        id: uuidv4(),
                        username: item.username,
                        password: item.password,
                        email: email.password ? email.address+'|'+email.password : email.address,
                        status: 'Live',
                        cookie: ig.options.headers.cookie
                    })

                    await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                    resolve()
    
                } catch (err) {
    
                    if (err === '282') {
    
                        await send('message', {id: item.id, message: 'Tạo tài khoản thành công 282'})
    
                        await insta.insert({
                            id: uuidv4(),
                            username: item.username,
                            password: item.password,
                            email: email.password ? email.address+'|'+email.password : email.address,
                            status: '282',
                            cookie: ig.options.headers.cookie
                        })

                        await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                        resolve()

                    } else if (err === 'mail') {

                        await send('message', {id: item.id, message: 'Tạo tài khoản thành công CP mail'})
    
                        await insta.insert({
                            id: uuidv4(),
                            username: item.username,
                            password: item.password,
                            email: email.password ? email.address+'|'+email.password : email.address,
                            status: 'CP Mail',
                            cookie: ig.options.headers.cookie
                        })

                        await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                        resolve()
    
                    }else if (err === 'mail2') {

                        await send('message', {id: item.id, message: 'Tạo tài khoản thành công CP mail2'})
    
                        await insta.insert({
                            id: uuidv4(),
                            username: item.username,
                            password: item.password,
                            email: email.password ? email.address+'|'+email.password : email.address,
                            status: 'CP Mail2',
                            cookie: ig.options.headers.cookie
                        })

                        await send('updateData', {id: item.id, cookie: ig.options.headers.cookie})
    
                        resolve()
    
                    } else {

                        if (email && service === 'gmx.live') {

                            try {
            
                                const res = await fetch('https://clonefbig.vn/api/importAccount.php?code=66e657245b081&api_key=f15cc3865e11c324151ffccdfc01f9da&account='+email.address+'|'+email.password+'&filter=1')
            
                                console.log(await res.text())
            
                            } catch {}
            
                        }
    
                        reject()
    
                        await send('message', {id: item.id, message: 'Tạo tài khoản thất bại'})
    
                    }
                }

            }


        } catch (err) {

            console.log(err)

            if (email && service === 'gmx.live') {

                try {

                    const res = await fetch('https://clonefbig.vn/api/importAccount.php?code=66e657245b081&api_key=f15cc3865e11c324151ffccdfc01f9da&account='+email.address+'|'+email.password+'&filter=1')

                    console.log(await res.text())

                } catch {}

            }

            reject()
        }

        await send('updateStatus', {id: item.id, status: 'FINISHED'})
        
    })
}