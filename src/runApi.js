const moment = require('moment')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const generator = require('generate-password')
const path = require('path')
const fs = require('fs')
const {app, ipcMain} = require('electron')
const FB = require('./loginApi.js')
const { v4: uuidv4 } = require('uuid')
const Db = require('./db.js')
const IG = require('./insta.js')
const log = require('./log.js')

const { 
    useTmProxy, 
    useShopLikeProxy, 
    useTinProxy, 
    useProxyFb, 
    useProxy,
    getCookies, 
    checkImap, 
    delayTimeout, 
    getMailCode,
    getPhone,
    getPhoneCode,
    randomUserAgent,
    checkLive,
    randomNumber,
    getBackupLink,
    randomNumberRange,
    randomPersion,
    getTmMail,
    getTmMailInbox,
} = require('./core.js')

const Change = require('./api/changeApi.js')
const promiseLimit = require('promise-limit')

module.exports = (data, send) => {
    return new Promise(async (resolve, reject) => {

        const setting = data.setting
        const tool = data.tool
        const item = data.item
        const mode = data.mode

        let ip = ''
        let error = false 
        let stopped = false 
        let agent = false

        const timer = setTimeout(() => {

            stopped = true

            send('updateStatus', {id: item.id, status: 'Timeout'})

            throw 'timeOut'

        }, (setting.timeout.value * 100))

        ipcMain.on('stop', async (e) => {
            stopped = true
            throw 'stopped'
        })

        try {

            send('running', item.id)

            if (item.proxyKey && !error && !stopped) {

                try {

                    if (setting.proxy.value === 'httpProxy' || setting.proxy.value === 'sProxy') {
                        ip = item.proxyKey
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

            if (ip && !error && !stopped) {

                try {

                    agent = useProxy(ip)

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

                    console.log(err)

                    await send('message', {id: item.id, message: 'Lỗi proxy'})
                    error = true
                }

            }

            if (!error && !stopped) {

                const userAgent = await randomUserAgent(setting.userAgent.value)
                let cookie = false 

                if (setting.useCookie.value && item.cookies) {
                    cookie = item.cookies
                }
                
                if (mode === 'recoveryPassword') {

                    try {

                        send('message', {id: item.id, message: 'Đang reset mật khẩu'})

                        let cookie = false

                        const res = await fetch("https://mbasic.facebook.com/login/identify/?ctx=recover&c&multiple_results=0&from_login_screen=0&_rdr", {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "user-agent": userAgent,
                            },
                            "agent": agent,
                            "body": null,
                            "method": "GET"
                        })

                        cookie = await getCookies(res)

                        const $ = cheerio.load(await res.text())

                        const lsd = $('input[name="lsd"]').val()

                        const res2 = await fetch("https://mbasic.facebook.com/login/identify/?ctx=recover&c=%2Flogin%2F&search_attempts=1&alternate_search=0&show_friend_search_filtered_list=0&birth_month_search=0&city_search=0", {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "content-type": "application/x-www-form-urlencoded",
                                "cookie": cookie,
                                "user-agent": userAgent,
                            },
                            "agent": agent,
                            "body": "lsd="+lsd+"&jazoest=21039&email="+item.email+"&did_submit=T%C3%ACm+ki%E1%BA%BFm",
                            "redirect": "manual",
                            "method": "POST"
                        })

                        let url = res2.headers.get('location')

                        if (url && url.includes('login/device-based/ar/login/?ldata=')) {

                                cookie += ';'+await getCookies(res2)

                                const res3 = await fetch(url, {
                                    "headers": {
                                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                        "cookie": cookie,
                                        "user-agent": userAgent,
                                    },
                                    "agent": agent,
                                    "body": null,
                                    "method": "GET"
                                })

                                const res4 = await fetch("https://mbasic.facebook.com/ajax/recover/initiate/?c=%2Flogin%2F&ctx=initate_view&sr=0", {
                                    "headers": {
                                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                        "content-type": "application/x-www-form-urlencoded",
                                        "cookie": cookie,
                                        "user-agent": userAgent,
                                    },
                                    "agent": agent,
                                    "body": "lsd="+lsd+"&jazoest=2950&recover_method=send_email&reset_action=Ti%E1%BA%BFp+t%E1%BB%A5c",
                                    "method": "POST"
                                })

                                const resData4 = await res4.text()

                                if (resData4.includes('/recover/code/')) {

                                    const status = await checkImap(item.email, item.passMail)

                                    if (status) {

                                        send('message', {id: item.id, message: 'Đang chờ mã kích hoạt'})

                                        await delayTimeout(10000)

                                        let code = false

                                        try {

                                            const data = await getMailCode(item.email, item.passMail)
                                            code = data.code 

                                        } catch {}

                                        if (code) {

                                            send('message', {id: item.id, message: 'Đang nhập mã kích hoạt: '+code})

                                            const res = await fetch("https://mbasic.facebook.com/recover/code/?em%5B0%5D="+item.email+"&rm=send_email&spc=0&fl=default_recover&try=1&c=%2Flogin%2F", {
                                                "headers": {
                                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                    "content-type": "application/x-www-form-urlencoded",
                                                    "cookie": cookie,
                                                    "user-agent": userAgent,
                                                },
                                                "agent": agent,
                                                "body": "lsd="+lsd+"&jazoest=2976&n="+code+"&reset_action=Ti%E1%BA%BFp+t%E1%BB%A5c",
                                                "redirect": "manual",
                                                "method": "POST"
                                            })

                                            const url = res.headers.get('location')

                                            if (url && url.includes('/recover/password/')) {

                                                const newPwd = 'A@!'+generator.generate({
                                                    length: 10,
                                                    numbers: true
                                                })


                                                send('message', {id: item.id, message: 'Đang đổi mật khẩu'})

                                                const res = await fetch("https://mbasic.facebook.com/recover/password/write/?u="+item.uid+"&n="+code+"&fl=default_recover&c=%2Flogin%2F&shown_session_invalidation_survey=0&rm=send_email", {
                                                    "headers": {
                                                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                        "content-type": "application/x-www-form-urlencoded",
                                                        "cookie": cookie,
                                                        "user-agent": userAgent,
                                                    },
                                                    "agent": agent,
                                                    "body": "lsd="+lsd+"&jazoest=2945&password_new="+newPwd,
                                                    "redirect": "manual",
                                                    "method": "POST"
                                                })

                                                const url2 = res.headers.get('location')

                                                const cookie2 = await getCookies(res)

                                                console.log(await res.text())
                                                console.log(cookie2)
                                                console.log(url2)

                                                if (cookie2 && cookie2.includes('c_user=') || url2 && url2.includes('/checkpoint/')) {

                                                    send('message', {id: item.id, message: 'Đổi mật khẩu thành công'})

                                                    send('updatePassword', {
                                                        id: item.id,
                                                        new: newPwd
                                                    })

                                                } else {
                                                    
                                                    const res = await fetch(url2)
                                                    const $ = cheerio.load(await res.text())

                                                    const text = $('span.w').text() ? ': '+$('span.w').text() : ''

                                                    send('message', {id: item.id, message: 'Đổi mật khẩu thất bại'+text})

                                                }
                                                

                                            } else {
                                                send('message', {id: item.id, message: 'Mã không chính xác'})
                                            }

                                        } else {
                                            send('message', {id: item.id, message: 'Không về mã'})
                                        }
        
        
                                    } else {
        
                                        send('message', {id: item.id, message: 'Mail die'})
        
                                    }

                                } else {

                                    const $ = cheerio.load(resData4)

                                    console.log($.html())

                                    send('message', {id: item.id, message: $('span.r').text()})

                                }

                        } else {

                            send('message', {id: item.id, message: 'Không tìm thấy email'})

                        }

                    } catch (err) {
                        console.log(err)
                    }
                    
                } else {

                    const fb = new FB({
                        uid: item.uid,
                        password: item.password,
                        twofa: item.twofa,
                        cookie: cookie,
                        agent: agent,
                        UA: userAgent
                    })

                    let data = false

                    if (setting.subDomain.value === 'request2') {
                
                        data = await fb.login3(msg => {
                            send('message', {id: item.id, message: msg})
                        })

                    } else {

                        data = await fb.login2(msg => {
                            send('message', {id: item.id, message: msg})
                        })

                    }

                    if (data.checkPoint) {
                        send('updateStatus', {id: item.id, status: data.checkPoint})
                    }

                    if (data.status) {

                        const account = item.uid+'|'+item.password+'|'+item.cookies

                        send('verify_ok', account)

                        

                        if (mode === 'getInfo' && setting.getInfo.value) {
                            
                            let error = false
                            let adData = {}

                            if (setting.infoTkqc.value && !error) {

                                try {

                                    send('message', {id: item.id, message: 'Đang lấy thông tin TKQC'})

                                    let adAccounts = await fb.getAdAccounts()

                                    if (adAccounts.length > 0) {

                                        let adAccountId = false

                                        try {

                                            adAccountId = await fb.getMainAdAccount()

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

                                            if (stopped) { break }

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

                                                    adAccount2.push({
                                                        id: adAccounts[index].id,
                                                        role: adAccounts[index].role,
                                                        status: adAccounts[index].status,
                                                        currency: adAccounts[index].currency,
                                                        threshold: adAccounts[index].threshold,
                                                        limit: adAccounts[index].limit,
                                                        remain: adAccounts[index].threshold - adAccounts[index].balance
                                                    })

                                                }

                                            }
                                            
                                        }

                                        const account273 = []

                                        for (let index = 0; index < accountStatus2.length; index++) {

                                            if (stopped) { break }

                                            const item = accountStatus2[index]
                                            const status = await fb.check273(item)

                                            if (status) {
                                                account273.push(item)
                                            }

                                        }

                                        // let bestAcc = false

                                        // console.log(adAccount2)

                                        // if (adAccount2.length > 0) {

                                        //     bestAcc = adAccount2.reduce((accumulator, current) => {
                                        //         return accumulator.threshold > current.threshold ? accumulator : current
                                        //     })

                                        //     bestAcc.threshold = Math.ceil(bestAcc.threshold)
                                        //     bestAcc.remain = Math.ceil(bestAcc.remain)

                                        // }

                                        adData.remain = adData.threshold - adData.balance

                                        adData.limit = (new Intl.NumberFormat('en-US').format(adData.limit)).replace('NaN', '') || adData.limit
                                        adData.spend = (new Intl.NumberFormat('en-US').format(adData.spend)).replace('NaN', '') || adData.spend
                                        adData.remain = (new Intl.NumberFormat('en-US').format(adData.remain)).replace('NaN', '') || adData.remain
                                        adData.balance = (new Intl.NumberFormat('en-US').format(adData.balance)).replace('NaN', '') || adData.balance
                                        adData.threshold = (new Intl.NumberFormat('en-US').format(adData.threshold)).replace('NaN', '') || adData.threshold
                                        // bestAcc.threshold = (new Intl.NumberFormat('en-US').format(bestAcc.threshold)).replace('NaN', '') || bestAcc.threshold
                                        // bestAcc.remain = (new Intl.NumberFormat('en-US').format(bestAcc.remain)).replace('NaN', '') || bestAcc.remain

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

                                        const checkHold = await fb.checkHold(adAccountId)

                                        if (checkHold.status) {
                                            statusText = 'HOLD'
                                        }


                                        if (adAccount2.length > 0) {

                                            adData.bestAcc = adAccount2.filter(item => item.threshold && item.remain).map(item => {

                                                item.threshold = (new Intl.NumberFormat('en-US').format(item.threshold)).replace('NaN', '') || item.threshold
                                                item.remain = (new Intl.NumberFormat('en-US').format(item.remain)).replace('NaN', '') || item.remain

                                                return item.remain+'/'+item.threshold+' ( '+item.limit+' ) '+item.currency+' - '+item.role+' - '+item.id

                                            }).join(' | ')

                                        }
                                        console.log(adData.threshold)
                                        if(adData.threshold == 0 ){

                                            adData.limit = adData.limit+' '+adData.currency + ' - ' + statusText + ' - ' + adData.id + ' - Adszin ' 

                                        }else {

                                            adData.limit = adData.limit+' '+adData.currency + ' - ' + statusText + ' - ' + adData.id 

                                        }


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

                                    console.log(err)

                                    error = true

                                    send('message', {id: item.id, message: 'Lấy thông tin TKQC thất bại'})

                                }

                            }

                            adData.id = item.id

                            if (setting.infoQuality.value && !error) {

                                send('message', {id: item.id, message: 'Đang lấy thông tin trạng thái TK'})

                                try {
                                    
                                    const accountQuality = await fb.getAccountQuality()
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

                                        accBm = await fb.getBm()

                                    } catch {}

                                    if (accBm.length > 0) {
                                    
                                        const bmStatus = await fb.getBmStatus()

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

                                            if (stopped) { break }
                                            
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
                                                        accBm[index].limit = await fb.getBmLimit(accBm[index].id)
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

                                    error = true

                                    send('message', {id: item.id, message: 'Lấy thông tin BM thất bại'})
                                }
                            }

                            if (setting.infoPage.value && !error) {
                                try {

                                    send('message', {id: item.id, message: 'Đang lấy thông tin page'})

                                    const checkPage = await fb.checkPage()

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

                                    const pages = await fb.checkPageMessage(setting.pageMessage.value)

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

                                    const userData = await fb.getUserData()

                                    adData.birthday = userData.birthday

                                    adData.name = userData.name
                                    adData.gender = userData.gender
                                    adData.firstName = userData.first_name
                                    adData.lastName = userData.last_name
                                    adData.country = userData.locale.split('_')[1]

                                    token = userData.accessToken


                                } catch (err) {

                                    console.log(err)

                                    error = true

                                    send('message', {id: item.id, message: 'Lấy thông tin cá nhân thất bại'})
                                }
                            }

                            if (setting.checkSupport.value && !error) {

                                send('message', {id: item.id, message: 'Đang kiểm tra trạng thái chat SP'})

                                adData.support = await fb.checkSupport()

                            }

                            if (setting.infoFriend.value && !error) {

                                try {

                                    send('message', {id: item.id, message: 'Đang lấy thông tin bạn bè'})

                                    adData.friends = await fb.getFriends()

                                } catch {

                                    error = true

                                    send('message', {id: item.id, message: 'Lấy thông tin bạn bè thất bại'})
                                }
                            }
                            
                            if (setting.infoDating.value && !error) {

                                try {

                                    send('message', {id: item.id, message: 'Đang lấy thông tin hẹn hò'})

                                    adData.dating = await fb.checkDating()

                                } catch (err) {

                                    error = true

                                    send('message', {id: item.id, message: 'Lấy thông tin hẹn hò thất bại'})
                                }
                            }

                            send('updateInfo', adData)
                            
                            if (setting.infoCookie.value && !error) {

                                try {

                                    send('message', {id: item.id, message: 'Đang lấy cookie'})

                                    send('updateCookie', {
                                        id: item.id,
                                        cookies: fb.cookie,
                                    })


                                } catch (err) { 
                                    
                                    error = true
                                    
                                    send('message', {id: item.id, message: 'Lấy cookie thất bại'})
                                }
                            }

                            if (setting.infoToken.value && !error) {

                                try {

                                    send('message', {id: item.id, message: 'Đang lấy token'})

                                    send('updateToken', {
                                        id: item.id,
                                        token: fb.accessToken,
                                    })

                                } catch (err) { 
                                    
                                    error = true
                                    
                                    send('message', {id: item.id, message: 'Lấy token thất bại'})
                                }
                            }

                            if (!error) {
                                send('message', {id: item.id, message: 'Lấy thông tin tài khoản thành công'})
                            }

                        } else {

                            if (mode === 'checkLimit') {

                                try {

                                    send('message', {id: item.id, message: 'Đang check limit'})

                                    const accounts = await fb.getAdAccounts()
                                    const id = await fb.getMainAdAccount2()
                                    const mainData = accounts.filter(item => item.id === id)[0]
                                    const limit = mainData.limit
                                    const currency = mainData.currency.split('-')[0]

                                    const res = await fs.promises.readFile(path.resolve(app.getPath('userData'), 'rates.json'), {
                                        encoding: 'utf-8'
                                    })


                                    const rates = JSON.parse(res)

                                    console.log(rates)

                                    const converted = (Number((limit / rates[currency]).toFixed(2)))

                                    if (converted >= 200) {
                                        send('message', {id: item.id, message: 'Tài khoản 250$'})
                                    } else {

                                        send('message', {id: item.id, message: 'Đang đóng tài khoản'})

                                        try {

                                            await fb.deactiveAdAccount(id)

                                            send('message', {id: item.id, message: 'Đã đóng tài khoản'})

                                        } catch {
                                            send('message', {id: item.id, message: 'Đóng tài khoản thất bại'})
                                        }

                                    }

                                } catch (err) {
                                    send('message', {id: item.id, message: 'Check limit thất bại'})
                                }

                            } else {

                                if (tool === 'change') {

                                    const change = new Change(item, setting, data)

                                    if (setting.changePassword.value) {

                                        const newPassword = await change.changePassword(message => {
                                            send('message', {id: item.id, message})
                                        })

                                        console.log(newPassword)

                                        if (newPassword) {

                                            send('updatePassword', {
                                                id: item.id,
                                                new: newPassword
                                            })

                                            //item.password = newPassword

                                        }

                                    }

                                }

                                if (tool === 'bm') {

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

                                        for (let index = 0; index < number; index++) {

                                            if (stopped) {
                                                break
                                            }
                                            
                                            try {

                                                await fb.createBm(type, setting.bmName.value)

                                                createBmSuccess++

                                            } catch {}

                                            await delayTimeout(2000)

                                        }

                                        send('message', {id: item.id, message: 'Đã tạo thành công '+createBmSuccess+'/'+number+' BM'})

                                    }

                                    if (setting.renameBm.value) {
                                                
                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.renameBmMode.value === 'all') {

                                                listBm = (await fb.getBmStatus()).filter(item => item.type === setting.renameBmType.value)

                                            }

                                            if (setting.renameBmMode.value === '350') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.renameBmType.value && bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.renameBmMode.value === '50') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.renameBmType.value && bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.renameBmMode.value === 'nolimit') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.renameBmType.value && bmData.sharing_eligibility_status !== 'disabled_due_to_trust_tier' && bmData.sharing_eligibility_status !== 'enabled'
                                                })

                                            }


                                            if (setting.renameBmMode.value === 'id') {

                                                const bmStatus = await fb.getBmStatus()
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


                                            const res = await fetch('https://graph.facebook.com/v15.0/me/businesses?fields=sharing_eligibility_status,allow_page_management_in_www,owned_ad_accounts.limit(1)%7Baccount_status,currency%7D&limit=99999&access_token='+fb.accessToken, {
                                                "headers": {
                                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                    "accept-language": "en-US,en;q=0.9",
                                                    "cache-control": "max-age=0",
                                                    "dpr": "0.8999999761581421",
                                                    "priority": "u=0, i",
                                                    "sec-fetch-dest": "document",
                                                    "sec-fetch-mode": "navigate",
                                                    "sec-fetch-site": "none",
                                                    "sec-fetch-user": "?1",
                                                    "upgrade-insecure-requests": "1",
                                                    "cookie": fb.cookie,
                                                    "user-agent": fb.UA
                                                },
                                                "agent": fb.agent,
                                            })

                                            const data = (await res.json()).data

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

                                                    if (stopped) { break }

                                                    const bm = listBm[index]
                                                    
                                                    try {

                                                        await fb.renameBm(bm.id, setting.newNameBm.value)

                                                        renameBmSuccess++

                                                    } catch (err) {
                                                        
                                                    }

                                                    send('message', {id: item.id, message: 'Đã đổi tên thành công '+renameBmSuccess+'/'+listBm.length+' BM'})
                                                }

                                            } else {
                                                send('message', {id: item.id, message: 'Không có BM'})
                                            }

                                        } catch (err) {
                                            console.log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
                                    }

                                    if (setting.backupBm.value) {
                                                
                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.backupBmMode.value === 'all') {

                                                listBm = (await fb.getBmStatus())

                                            }

                                            if (setting.backupBmMode.value === '350') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.backupBmMode.value === '50') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.backupBmMode.value === 'nolimit') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bmData.sharing_eligibility_status !== 'disabled_due_to_trust_tier' && bmData.sharing_eligibility_status !== 'enabled'
                                                })

                                            }


                                            if (setting.backupBmMode.value === 'id') {

                                                const bmStatus = await fb.getBmStatus()
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


                                            const res = await fetch('https://graph.facebook.com/v15.0/me/businesses?fields=sharing_eligibility_status,allow_page_management_in_www,owned_ad_accounts.limit(1)%7Baccount_status,currency%7D&limit=99999&access_token='+fb.accessToken, {
                                                "headers": {
                                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                    "accept-language": "en-US,en;q=0.9",
                                                    "cache-control": "max-age=0",
                                                    "dpr": "0.8999999761581421",
                                                    "priority": "u=0, i",
                                                    "sec-fetch-dest": "document",
                                                    "sec-fetch-mode": "navigate",
                                                    "sec-fetch-site": "none",
                                                    "sec-fetch-user": "?1",
                                                    "upgrade-insecure-requests": "1",
                                                    "cookie": fb.cookie,
                                                    "user-agent": fb.UA
                                                },
                                                "agent": fb.agent,
                                            })

                                            const data = (await res.json()).data

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

                                                const bmStatus = await fb.getBmStatus()

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

                                                    if (stopped) {break}

                                                    const bm = listBm[index]
                                                    
                                                    try {

                                                        await fb.backupBm(bm.id, item.backupEmail, setting.linkLimit.value, setting.backupBmRole.value, setting.backupBmDelay.value)

                                                        backupBmSuccess++

                                                    } catch (err) {
                                                        console.log(err)
                                                    }

                                                    send('message', {id: item.id, message: 'Đã backup thành công '+backupBmSuccess+'/'+listBm.length+' BM'})
                                                }

                                            } else {
                                                send('message', {id: item.id, message: 'Không có BM'})
                                            }

                                        } catch (err) {
                                            console.log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
                                    }

                                    if (setting.getLinkBm.value) {

                                        const file = path.resolve(app.getPath('userData'), './backup/link.json')
                                        const emailFile = path.resolve(app.getPath('userData'), './backup/email.json')
                                        const number = setting.getLinkBmNumber.value
                                        const delay = setting.getLinkBmDelay.value
                                        const mode = setting.getLinkReadMode.value

                                        let acceptSuccess = 0

                                        const nhanLink = (link) => {
                                            return new Promise(async (resolve, reject) => {
                                                
                                                const id = link.split('|')[0]
                                                const acpLInk = link.split('|')[1]

                                                try {

                                                    const res = await fetch(acpLInk, {
                                                        "headers": {
                                                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                            "accept-language": "en-US,en;q=0.9",
                                                            "cache-control": "max-age=0",
                                                            "dpr": "0.8999999761581421",
                                                            "priority": "u=0, i",
                                                            "sec-fetch-dest": "document",
                                                            "sec-fetch-mode": "navigate",
                                                            "sec-fetch-site": "none",
                                                            "sec-fetch-user": "?1",
                                                            "upgrade-insecure-requests": "1",
                                                            "cookie": fb.cookie,
                                                            "user-agent": fb.UA
                                                        },
                                                        "redirect": "manual",
                                                        "agent": fb.agent,
                                                    })

                                                    const url = res.headers.get('location')

                                                    if (url.includes('https://business.facebook.com/invitation/?token=')) {

                                                        const params = new URL(url).searchParams

                                                        const token = params.get('token')

                                                        const res = await fetch("https://business.facebook.com/business/invitation/login/", {
                                                            "headers": {
                                                                "content-type": "application/x-www-form-urlencoded",
                                                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                                "accept-language": "en-US,en;q=0.9",
                                                                "cache-control": "max-age=0",
                                                                "dpr": "0.8999999761581421",
                                                                "priority": "u=0, i",
                                                                "sec-fetch-dest": "document",
                                                                "sec-fetch-mode": "navigate",
                                                                "sec-fetch-site": "none",
                                                                "sec-fetch-user": "?1",
                                                                "upgrade-insecure-requests": "1",
                                                                "cookie": fb.cookie,
                                                                "user-agent": fb.UA
                                                            },
                                                            "agent": fb.agent,
                                                            "method": "POST",
                                                            "body": "first_name=Toolfb&last_name="+randomNumber(11111, 99999)+"&invitation_token="+token+"&receive_marketing_messages=false&user_preferred_business_email&__user="+item.uid+"&__a=1&__req=2&__hs=19664.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009675755&__s=voml6w%3Aorwnqa%3A3cyaaa&__hsi=7297248857485608221&__dyn=7xeUmwkHgydwn8K2WnFwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3Bw5VCwjE3awbG78b87C1xwEwlU-0nS4o5-1uwbe2l0Fwwwi85W0_Ugw9KfwbK0RE5a1qwqU8E5W0HUvw5rwSxy0gq0Lo6-1FwbO0NE1rE&__csr=&fb_dtsg="+fb.dtsg+"&jazoest=25503&lsd=VjWEsSvVwDyPvLUmreGFgG&__spin_r=1009675755&__spin_b=trunk&__spin_t=1699023148&__jssesw=1",
                                                        })

                                                        const data = await res.text()

                                                        if (data.includes('"payload":null') && !data.includes('error')) {

                                                            acceptSuccess++

                                                            send('updateLinkSuccess', link)

                                                            send('message', {id: item.id, message: 'Nhận thành công '+acceptSuccess+' link'})

                                                        } else {

                                                            send('updateLinkError', link)

                                                        }

                                                    }

                                                } catch (err) {
                                                    console.log(err)
                                                }

                                                resolve()
                                            })
                                        }


                                        if (mode === 'file') {

                                            send('message', {id: item.id, message: 'Đang tiến hành nhận link'})

                                            while (true) {

                                                if (acceptSuccess < number) {

                                                    const list = (await fs.promises.readFile(setting.linkFilePath.value, {encoding: 'utf-8'})).split(/\r?\n|\r|\n/g).filter(item => item)

                                                    if (list.length > 0) {
                    
                                                        const left = list.slice(0, number - acceptSuccess)
                                        
                                                        const final = list.filter(c => !left.includes(c))
                                        
                                                        await fs.promises.writeFile(setting.linkFilePath.value, final.join("\r\n"), {
                                                            encoding: 'utf-8'
                                                        })

                                                        const limit = promiseLimit(setting.getLinkBmLimit.value)
                                                        
                                                        await Promise.all(left.map(item => {
                                                            return limit(() => nhanLink(item))
                                                        }))

                                                    }

                                                } else {

                                                    break
                                                }

                                                await delayTimeout(3000)
                                                
                                            }

                                        } else {

                                            for (let index = 0; index < number; index++) {

                                                if (stopped) {break}
                                                
                                                let link = ''

                                                while (true) {

                                                    if (stopped) {break}

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

                                                    await delayTimeout(5000)
                                                    
                                                }

                                                if (link) {

                                                    await nhanLink(link)
                                                    
                                                }


                                                await delayTimeout(delay * 100)
                                                
                                            }

                                            send('message', {id: item.id, message: 'Đã nhận thành công '+acceptSuccess+' link'})

                                        }

                                    }

                                    if (setting.createAdAccount.value) {
                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.createAdAccountMode.value === 'all') {

                                                listBm = (await fb.getBmStatus()).filter(item => item.type === setting.createAdAccountType.value)

                                            }

                                            if (setting.createAdAccountMode.value === '350') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.createAdAccountType.value && bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.createAdAccountMode.value === '50') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.createAdAccountType.value && bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.createAdAccountMode.value === 'nolimit') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === setting.createAdAccountType.value && bmData.sharing_eligibility_status !== 'disabled_due_to_trust_tier' && bmData.sharing_eligibility_status !== 'enabled'
                                                })

                                            }


                                            if (setting.createAdAccountMode.value === 'id') {

                                                const bmStatus = await fb.getBmStatus()
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

                                                    if (stopped) { break }

                                                    const bm = listBm[index]
                                                    
                                                    try {

                                                        await fb.createAdAccount(bm.id, setting.tkqcCurency.value, setting.tkqcTimezone.value, setting.nameTkqc.value)

                                                        createAccountSuccess++

                                                    } catch (err) {
                                                        console.log(err)
                                                    }

                                                    send('message', {id: item.id, message: 'Đã tạo thành công '+createAccountSuccess+'/'+listBm.length+' TKQC'})
                                                }


                                            } else {
                                                send('message', {id: item.id, message: 'Không có BM'})
                                            }

                                        } catch (err) {
                                            console.log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }
                                    }

                                    if (setting.createPageBm.value) {

                                        send('message', {id: item.id, message: 'Đang tạo Page'})

                                        try {

                                            const name = setting.pageNameBm.value || 'Toolfb'

                                            const pageId = await fb.createPage(name)

                                            send('message', {id: item.id, message: 'Tạo thành công Page: '+pageId})
                                            
                                            await delayTimeout(3000)

                                            send('message', {id: item.id, message: 'Đang thêm Page vào BM'})

                                            try {

                                                send('message', {id: item.id, message: 'Đang thêm Page vào BM'})

                                                await fb.applyPage(pageId)

                                                send('message', {id: item.id, message: 'Thêm Page vào BM thành công'})

                                            } catch {
                                                send('message', {id: item.id, message: 'Không thể thêm Page vào BM'})
                                            }

                                        } catch (err) {
                                            send('message', {id: item.id, message: 'Tạo Page thất bại'})
                                        }

                                    }

                                    if (setting.removeInstagram.value) {

                                        try {


                                            let removed = 0

                                            const removeInstagram = (id) => {
                                                return new Promise(async (resolve, reject) => {
                                                    try {

                                                        const res = await fetch("https://graph.facebook.com/v17.0/"+id+"/owned_instagram_accounts?access_token="+fb.accessToken+"&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Fowned_instagram_accounts&_reqSrc=BusinessConnectedOwnedInstagramAccountsStore.brands&date_format=U&fields=%5B%22id_v2%22%2C%22username%22%2C%22profile_pic%22%2C%22owner_business%22%2C%22is_professional%22%2C%22is_reauth_required_for_permissions%22%2C%22is_ig_app_message_toggle_enabled%22%2C%22is_mv4b_profile_locked%22%5D&limit=25&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f8a7bc4b52c89b1ad&_flowletID=2683&_triggerFlowletID=2683", {
                                                            "headers": {
                                                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                                "accept-language": "en-US,en;q=0.9",
                                                                "cache-control": "max-age=0",
                                                                "dpr": "0.8999999761581421",
                                                                "priority": "u=0, i",
                                                                "sec-fetch-dest": "document",
                                                                "sec-fetch-mode": "navigate",
                                                                "sec-fetch-site": "none",
                                                                "sec-fetch-user": "?1",
                                                                "upgrade-insecure-requests": "1",
                                                                "cookie": fb.cookie,
                                                                "user-agent": fb.UA
                                                            },
                                                            "agent": fb.agent,
                                                        })
                                                        const resData = await res.json()
                                        
                                                        const deleteInsta = (instaId) => {
                                                            return new Promise(async (resolve, reject) => {
                                                                try {
                                            
                                                                    const res = await fetch("https://graph.facebook.com/v17.0/"+id+"/instagram_accounts?access_token="+fb.accessToken+"&_flowletID=5310&_triggerFlowletID=5310", {
                                                                        "headers": {
                                                                            "content-type": "application/x-www-form-urlencoded",
                                                                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                                            "accept-language": "en-US,en;q=0.9",
                                                                            "cache-control": "max-age=0",
                                                                            "dpr": "0.8999999761581421",
                                                                            "priority": "u=0, i",
                                                                            "sec-fetch-dest": "document",
                                                                            "sec-fetch-mode": "navigate",
                                                                            "sec-fetch-site": "none",
                                                                            "sec-fetch-user": "?1",
                                                                            "upgrade-insecure-requests": "1",
                                                                            "cookie": fb.cookie,
                                                                            "user-agent": fb.UA
                                                                        },
                                                                        "agent": fb.agent,
                                                                        "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Finstagram_accounts&_reqSrc=InstagramAccountActions.brands&instagram_account="+instaId+"&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&xref=f1408f332e8171391",
                                                                        "method": "POST",
                                                                    })
                                            
                                                                    const data = await res.json()
                                            
                                                                    if (data.success) {
                                                                        removed++
                                                                    }
                                            
                                                                } catch (err) {
                                                                    console.log(err)
                                                                }
                                        
                                                                resolve()
                                                            })
                                                        }

                                                        const promises = []

                                                        for (let index = 0; index < resData.data.length; index++) {

                                                            const insta = resData.data[index]
                                        
                                                            promises.push(deleteInsta(insta.id_v2))
                                        
                                                        }
                                        
                                                        await Promise.all(promises)

                                                    } catch (err) {
                                                        console.log(err)
                                                    }

                                                    resolve()
                                                })
                                            }

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            const accBm = (await fb.getBm()).map(item => item.id)

                                            for (let index = 0; index < accBm.length; index++) {

                                                const id = accBm[index]

                                                send('message', {id: item.id, message: 'Đang xóa tài khoản IG: BM '+id})

                                                await removeInstagram(id)
                                                
                                            }

                                            send('message', {id: item.id, message: 'Đã xóa '+removed+' tài khoản IG'})


                                        } catch (err) {
                                            log(err)
                                            send('message', {id: item.id, message: 'Không thể lấy thông tin BM'})
                                        }

                                    }

                                    if (setting.removeAdmin.value) {

                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let accBm = (await fb.getBm()).map(item => item.id)

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

                                            send('message', {id: item.id, message: 'Đang xóa quản trị viên'})

                                            for (let index = 0; index < accBm.length; index++) {

                                                if (stopped) {break}
                                                
                                                try {

                                                    const main = await fb.getMainBmAccounts(accBm[index])
                                                    const accounts = await fb.getBmAccounts(accBm[index])

                                                    if (accounts.length > 1 && accounts.includes(main)) {

                                                        const removeAccounts = accounts.filter(item => item !== main)

                                                        removeAccounts.forEach(async item => {
                                                            promises.push(fb.removeAccount(accBm[index], item))
                                                        })

                                                    }

                                                } catch (err) {
                                                    console.log(err)
                                                }
                                                
                                            }

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

                                            let accBm = (await fb.getBm()).map(item => item.id)

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

                                                    let outBmSuccess = 0

                                                    for (let index = 0; index < accBm.length; index++) {

                                                        if (stopped) {break}
                                                        
                                                        try {

                                                            send('message', {id: item.id, message: 'Đang thoát BM '+accBm[index]})

                                                            await fb.outBm(accBm[index])
                                                            
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

                                    if (setting.khangBm.value) {

                                        try {

                                            send('message', {id: item.id, message: 'Đang lấy thông tin BM'})

                                            let listBm = []

                                            if (setting.khangMode.value === 'all') {

                                                listBm = (await fb.getBmStatus()).filter(item => item.type === 'DIE')

                                            }

                                            if (setting.khangMode.value === 'bmDieVv') {

                                                listBm = (await fb.getBmStatus()).filter(item => item.type === 'DIE_VV')

                                            }

                                            if (setting.khangMode.value === 'bm350') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === 'DIE' && bmData.sharing_eligibility_status === 'enabled'
                                                })

                                            }

                                            if (setting.khangMode.value === 'bm50') {

                                                const accBm = await fb.getBm()

                                                listBm = (await fb.getBmStatus()).filter(bm => {

                                                    const bmData = (accBm.filter(item => item.id === bm.id))[0]

                                                    return bm.type === 'DIE' && bmData.sharing_eligibility_status === 'disabled_due_to_trust_tier'
                                                })

                                            }

                                            if (setting.khangMode.value === 'id') {

                                                const bmStatus = await fb.getBmStatus()
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

                                                            await fb.khang902(msg => {
                                                                send('message', {id: item.id, message: msg})
                                                            }, '902', bm.id)

                                                        }

                                                        if (bm.restriction_type === 'PREHARM') {

                                                            await fb.khangXmdt(msg => {
                                                                send('message', {id: item.id, message: msg})
                                                            }, 'xmdt', bm.id)

                                                        }

                                                        send('message', {id: item.id, message: 'Kháng BM '+bm.id+' thành công'})

                                                        lastMsg = 'Kháng BM '+bm.id+' thành công'

                                                        khangSuccess++

                                                    } catch {

                                                        error = true

                                                        send('message', {id: item.id, message: 'Kháng BM '+bm.id+' thất bại'})

                                                        lastMsg = 'Kháng BM '+bm.id+' thất bại'

                                                    }

                                                    await delayTimeout(2000)

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

                                }

                                if (tool === 'tut') {

                                    if (setting.createInstagram.value) {

                                        const insta = new Db('instagram')

                                        let pages = await fb.getPage()

                                        if (pages.length === 0) {

                                            send('message', {id: item.id, message: 'Chưa có page, đang tạo page mới'})

                                            const pageId = await fb.createPage2('Toolfb')

                                            pages = await fb.getPage()

                                        }

                                        if (pages.length > 0) {

                                            const page = pages[0]

                                            let success = 0
                                            let dungLai = false

                                            if (setting.createInstagramMode.value === 'regIg') {

                                                send('message', {id: item.id, message: 'Đang ngắt kết nối IG'})

                                                await fb.unlinkIg(page.additional_profile_id, page.id)

                                                try {

                                                    send('message', {id: item.id, message: 'Đang làm sạch page'})

                                                    await fb.removeBmPage(page.additional_profile_id, page.id)

                                                    send('message', {id: item.id, message: 'Làm sạch page thành công'})

                                                } catch {

                                                }

                                            }

                                            if (!dungLai) {

                                                for (let index = 0; index < setting.maxInsta.value; index++) {

                                                    try {

                                                        if (setting.createInstagramMode.value === 'regBm') {

                                                            send('message', {id: item.id, message: 'Đang ngắt kết nối IG'})

                                                            await fb.unlinkIg(page.additional_profile_id, page.id)

                                                            try {

                                                                send('message', {id: item.id, message: 'Đang làm sạch page'})
                
                                                                await fb.removeBmPage(page.additional_profile_id, page.id)
                
                                                                send('message', {id: item.id, message: 'Làm sạch page thành công'})
                
                                                            } catch {
                
                                                                send('message', {id: item.id, message: 'Làm sạch page thất bại'})
                
                                                                dungLai = true
                                                                
                                                            }

                                                        }

                                                        send('message', {id: item.id, message: 'Đang tạo tài khoản IG'})
                                                        
                                                        const info = await randomPersion()

                                                        info.username = info.username+randomNumberRange(11111, 99999)

                                                        info.password = generator.generate({
                                                            length: 12,
                                                            numbers: true
                                                        })

                                                        const service = setting.tmMailService.value

                                                        let email = false

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

                                                            console.log(err)
                                        
                                                            await send('message', {id: item.id, message: 'Không thể lấy email'})
                                                            
                                                        }

                                                        let error = true

                                                        if (email) {

                                                            const parts = generator.generateMultiple(3, {
                                                                length: 6,
                                                                numbers: true,
                                                                uppercase: false
                                                            })

                                                            const pageCookie = fb.cookie+';i_user='+page.additional_profile_id
                                                            const deviceId = parts[0]+':'+parts[1]+':'+parts[2]

                                                            const res = await fetch("https://business.facebook.com/api/graphql/?_callFlowletID=11028&_triggerFlowletID=11023", {
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
                                                                    "x-fb-friendly-name": "igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation",
                                                                    "x-fb-lsd": "bJBfWFybhvQ1DqPe3vqR81",
                                                                    "cookie": pageCookie,
                                                                    "user-agent": fb.UA,
                                                                },
                                                                agent: fb.agent,
                                                                "body": "av="+page.id+"&__usid=6-Tsnrnd11w4t438%3APsnrnd9iffmur%3A0-Asnrnd1r7aewt-RV%3D6%3AF%3D&__aaid=0&__user="+fb.uid+"&__a=1&__req=q&__hs=20057.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1018533759&__s=18hhts%3Azz9h1s%3Ajcfl5b&__hsi=7443067055801362343&__dyn=7AzHJ16Aexp2u7-5k1ryUbFp62Gim2q3K2K5U4e2C1vzEdEnxiUco5S3O6Uhw8-E2iwUx60xU8E3Qwb-qbx6321Zm19wdu2O1VwwAwXwEwpUO0iS12x62G3i1ywOwv89kbxS1FwnE4K5E663G48W2a4p89HK2efK2W1vxi4UaEW2G1NwwwJK14xm4E5yexfxm16wUwtEkz8cE3BwMzUdEGdwzwea0Lo6-3u36i2G2B0LwNwNwDwr86C13wwwbe1wxW1owmUaEbU6q22&__csr=g4z8yijnf93Ard4PhsYKIy959jHb6Jn258_AbvZEZlEAYIHJF8GvtFl8HFpnlbAZlYTGl5rjjlpF-FcOASBiniFnuBFvXmAh9d9nGVbV4iRBnQAVp5hVFKG8OahqlaAV58it6KXBBBDQl_8FGzlOpeUGHAylyaWHmjWJaeAiBF2bDHAmV8wxFmq8hbjKUzAJdedUGla4oCqJmKhCGaAKdBmeyGgLDjCCLKmm9KFaDDKqiaLxerK-Fd3WBGVk9LgmhKQu5aCQeKmFoyaGidxK48h-aUymuc-iczUrzqxpaAmWV8Obp8-11ADyoy2mEKq4qAG7WHBCg9rG3Scxa5UsG4oRkEKHxe4awRzoe4rwzwkUG6Ee9Ue8jw6uG54bU24VQdG0oyfx6dw2vo6hyUV07NG480-61Lwa6iA2y1rwKwcDiw29E4q0q05gk5Nk2Dg7S2F0aK2GgAg1442Gw2NK0i22K1JzU16aw2Bag22y5EuE3ww2vK2u0ZU1lE6El802420wk017Tw4dOwi4fw3CS0U80a9Esw3z-awn0G4B1e0pKOG05bUF06ww2Rywc60kOw5e1apUl4N009bFz5wBwh8jyE410XIElwgUrw2So08TpYw-2u2Kdw1X9wgVE5ow1gU0D25vrIE3fw1Jq0pSlU0QWcO0824U0K1UgV9Caz8og9Qewm205Nxm0pq0iy0IoeE13rxacw17i1Uw&__comet_req=11&fb_dtsg="+fb.dtsg+"&jazoest=25434&lsd=bJBfWFybhvQ1DqPe3vqR81&__spin_r=1018533759&__spin_b=trunk&__spin_t=1732974093&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation&variables=%7B%22device_id%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(deviceId)+"%22%7D%2C%22email%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(email.address)+"%22%7D%2C%22username%22%3A%7B%22sensitive_string_value%22%3A%22"+info.username+"%22%7D%2C%22ig_name%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(info.name)+"%22%7D%2C%22enc_password%22%3A%7B%22sensitive_string_value%22%3A%22"+info.password+"%22%7D%2C%22birthday%22%3A%7B%22sensitive_string_value%22%3A%22"+info.year+"-"+info.month+"-"+info.day+"%22%7D%7D&server_timestamps=true&doc_id=6151962731595562",
                                                                "method": "POST"
                                                            })

                                                            const resData = await res.text()

                                                            if (resData.includes('"is_available":true')) {

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

                                                                    const res = await fetch("https://business.facebook.com/api/graphql/?_callFlowletID=12539&_triggerFlowletID=12534", {
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
                                                                            "x-fb-friendly-name": "igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation",
                                                                            "x-fb-lsd": "bJBfWFybhvQ1DqPe3vqR81",
                                                                            "cookie": pageCookie,
                                                                            "user-agent": fb.UA,
                                                                        },
                                                                        agent: fb.agent,
                                                                        "body": "av="+page.id+"&__usid=6-Tsnrzk61u7r3w%3APsnrzlbu5l263%3A0-Asnrzk3isfeu7-RV%3D6%3AF%3D&__aaid=0&__user="+fb.uid+"&__a=1&__req=17&__hs=20057.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1018534390&__s=fi5c6r%3Ampsnx6%3A6ooe89&__hsi=7443135095846752657&__dyn=7AzHJ16Aexp2u7-5k1ryUbFp62Gim2q3K2K5U4e2C1vzEdEnxiUco5S3O6Uhw8-E2iwUx60xU8E3Qwb-qbx6321Zm19wdu2O1VwwAwXwEwpUO0iS12x62G3i1ywOwv89kbxS1FwnE4K5E663G48W2a4p89HK2efK2W1vxi4UaEW2G1NwwwJK14xm4E5yexfxm16wUwtEkz8cE3BwMzUdEGdwzwea0Lo6-3u36i2G2B0LwNwNwDwr86C13wwwbe1wxW1owmUaEbU6q22&__csr=g4z8yhYYAegF4MBfbHb7FjHb6Jn258_AbvZEZi8AaXqiaDTqliaWmlRh9flvdRBhmQyRmqvGjcFdFkGQGlTTFvXmAh9d9nGVbVpbmlnijBAl7V9KG8OahqlaAV58it6KXBBBDQl_8FGzlOpeUGHAylyaWHmjWJaeAiBF2bDHAmV8wxFmq8hbjKUzAJdedUGla4oCqJmKhCGaAKdAueyGgLDjCCLKmm9KF8GuVF8G-4VKXWAQfGmHBgCZ1p6XhUkGrgWVqBy8GF8S6Ugx7UHy9pUPV8OfxKdG5AGhrHAz8JAzU46iu9y89qyVEhGiEvGKmp0BKEfry8ixu7ax6dlabGUjx2EdoS3x6U8U5eaxG3yu3y4U1DGxh2-0xet3qw68zUhzo0DS1AoKeg1Yqx20fxwrU2xAF0EwmUbE39QE0yq16w6w1k51sl0FQ1ZwGg2HwGA940h10GE0Irw4wwHwro-0hyE0FiA0wExq7G0U80DXwDwfu0lq1G5i00x0w8500hZU13sE4x3U0VJwe202yq780U_yE5Max9gjw6rIGw1i-ag1E80JoE31w5cE1jwiCu5hcg02iWoNo9o4i4UG10geXa5o4e6U0JC02dSv8fwDwHzo0uOo4eq1m80ke09MxnSXa0PU0rmw6tBu0dezcw20xe0bwu4eipyEO642t3E5ww1solw6mw4Ewb63G0gSUiz80hQwu8&__comet_req=11&fb_dtsg="+fb.dtsg+"&jazoest=25721&lsd=gDVRShN4u-7zVfyGqbXbB1&__spin_r=1018534390&__spin_b=trunk&__spin_t=1732989935&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=igCreationAndLoginMutationsVerifyUserByEmailMutation&variables=%7B%22confirmation_code%22%3A%7B%22sensitive_string_value%22%3A%22"+code+"%22%7D%2C%22device_id%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(deviceId)+"%22%7D%2C%22email%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(email.address)+"%22%7D%7D&server_timestamps=true&doc_id=6951261901578319",
                                                                        "method": "POST",
                                                                    })

                                                                    const resData = await res.json()

                                                                    if (resData.data.verify_user_by_email.is_verified) {

                                                                        await send('message', {id: item.id, message: 'Đang tạo tài khoản IG'})

                                                                        const signupCode = resData.data.verify_user_by_email.signup_code

                                                                        const res = await fetch("https://business.facebook.com/api/graphql/?_callFlowletID=13924&_triggerFlowletID=13919", {
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
                                                                                "x-fb-friendly-name": "igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation",
                                                                                "x-fb-lsd": "bJBfWFybhvQ1DqPe3vqR81",
                                                                                "cookie": pageCookie,
                                                                                "user-agent": fb.UA,
                                                                            },
                                                                            agent: fb.agent,
                                                                            "body": "av="+page.id+"&__usid=6-Tsnspvv8nmty5%3APsnspvu16hce0k%3A0-Asnspv6uralh-RV%3D6%3AF%3D&__aaid=0&__user="+fb.uid+"&__a=1&__req=z&__hs=20058.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=MODERATE&__rev=1018536265&__s=b60cue%3Ajnmpyq%3A6x6ak7&__hsi=7443281443041799010&__dyn=7AzHJ16Aexp2u7-5k1ryUbFp62Gim2q3K2K5U4e2C1vzEdEnxiUco5S3O6Uhw8-E2iwUx60xU8E3Qwb-qbx6321Zm19wdu2O1VwwAwXwEwpUO0iS12x62G3i1ywOwv89kbxS1FwnE4K5E663G48W2a4p89HK2efK2W1vxi4UaEW2G1NwwwJK14xm4E5yexfxm16wUwtEkz8uxe0Voc8-q2-azo8U3ywbS1LwTwNAwGwFgbUcoco9U6O1FwgU882Pwo8uwjUy2-2K2G2-1Cwww&__csr=g4h6OMTax5iMzf24lljnkAh7qfdkgyld8ydEjtIgBdbPl9QBbdXKyaGWh4yHj5tIG9K_kxeYzijlr-J4WiAt7kIAZOrgOQTiKy6alKvQ9uJDsyh-XqAVmVV2lloN4AKGQJ6OqytrEwzuWWyUOqjLCamiHyqKFbAGpaVbVFECAXBhVaVKlfyujAGmht2pamvBKjKunWyaKFFVGxyiGKaGlBzLBUZuqmny4XK8xjy9UCaAJ4CG9qLGhfyojWJ2Z3AbBBKqicGiexymiay9ohXAx1eFmajhFoTxamaCxpCGUpy49CyEth8ryGg-8ABwuUqUK9RCy9UK6U4ehuV8J1K5GzV4bXg-fwDgmzU6a78K2uu78e8swmoco0zS0KQ4ARQU3et6jgypxfc0tabg0BoMcU0_x9045y8GWwM85U22Bg3_Cw10q0v51hgHd4AcFQ3IAr2kEj4yDlPl1fb7ws81Co7CE1iV81eE0giw21HwdB04tx23i09M4Pw5cwiA01j1wOBy80t3o1624Dw2yaw14K06cFYg5UCaDwPk1i10yxa0im040U1b40Gyw2E45k3l0Hg1pU1E0k8-82E5-8gcU2Ww0xphz3U6eu2G8gfIE-1uwtU0h2w1PuIC2edw1TJ0kO04rw2cVAC2_a05582Qa097w8u04HVE1mSmubw2a-mu8ylBoLwcZ02Xo10Q0nfg30wUo0jew4MAw&__comet_req=11&fb_dtsg="+fb.dtsg+"&jazoest=25665&lsd=ZnYN-uCo5UmgTteHdPs3vP&__spin_r=1018536265&__spin_b=trunk&__spin_t=1733024009&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=igCreationAndLoginMutationsIGPersonalMutation&variables=%7B%22username%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(info.username)+"%22%7D%2C%22full_name%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(info.name)+"%22%7D%2C%22fb_page_id%22%3A%7B%22sensitive_string_value%22%3A%22"+page.id+"%22%7D%2C%22email_or_phone%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(email.address)+"%22%7D%2C%22birthday%22%3A%7B%22sensitive_string_value%22%3A%22"+info.day+"-"+info.month+"-"+info.year+"%22%7D%2C%22enc_password%22%3A%7B%22sensitive_string_value%22%3A%22"+info.password+"%22%7D%2C%22signup_code%22%3A%7B%22sensitive_string_value%22%3A%22"+signupCode+"%22%7D%2C%22device_id%22%3A%7B%22sensitive_string_value%22%3A%22"+encodeURIComponent(deviceId)+"%22%7D%7D&server_timestamps=true&doc_id=7098874926875973",
                                                                            "method": "POST"
                                                                        })

                                                                        const resData2 = await res.json()

                                                                        const idToken = resData2.data.bizkit_mbs_create_personal_ig_account.ig_oidc_id_token

                                                                        if (idToken) {

                                                                            let cookie = '' 

                                                                            for (let index = 0; index < 3; index++) {
                                                                                
                                                                                try {

                                                                                    const ig = new IG({
                                                                                        proxy: ip,
                                                                                        username: info.username,
                                                                                        password: info.password,
                                                                                        UA: fb.UA,
                                                                                    })
                
                                                                                    await ig.login()
                
                                                                                    cookie = ig.options.headers.cookie

                                                                                    break
                
                                                                                } catch (err) {
                                                                                    if (err !== 'error') {
                                                                                        break
                                                                                    }
                                                                                }
                                                                                
                                                                            }

                                                                            await insta.insert({
                                                                                id: uuidv4(),
                                                                                username: info.username,
                                                                                password: info.password,
                                                                                email: email.address,
                                                                                cookie: cookie,
                                                                                status: 'Live',
                                                                            })

                                                                            if (setting.createInstagramMode.value === 'regBm') {

                                                                                await send('message', {id: item.id, message: 'Đang chuyển sang tài khoản công việc'})

                                                                                const res = await fetch("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=14225", {
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
                                                                                        "x-fb-friendly-name": "igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation",
                                                                                        "x-fb-lsd": "bJBfWFybhvQ1DqPe3vqR81",
                                                                                        "cookie": pageCookie,
                                                                                        "user-agent": fb.UA,
                                                                                    },
                                                                                    agent: fb.agent,
                                                                                    "body": "av="+page.id+"&__usid=6-Tsnsqmr1x9qxt3%3APsnsqmqxo2vd9%3A0-Asnsqmr1psyuzx-RV%3D6%3AF%3D&__aaid=0&__user="+fb.uid+"&__a=1&__req=14&__hs=20058.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1018536265&__s=rd11wc%3Aaw4vp1%3Ay6i89w&__hsi=7443285604159388496&__dyn=7AzHJ16Aexp2u7-5k1ryUbFp62Gim2q3K2K5U4e2C1vzEdEnxiUco5S3O6Uhw8-E2iwUx60xU8E3Qwb-qbx6321Zm19wdu2O1VwwAwXwEwpUO0iS12x62G3i1ywOwv89kbxS1FwnE4K5E663G48W2a4p89HK2efK2W1vxi4UaEW2G1NwwwJK14xm4E5yexfxm16wUwtEkz8uxe0Voc8-q2-azo8U3ywbS1LwTwNAwGwFgbUcoco9U6O1FwgU882Pwo8uwjUy2-2K2G2-1Cwww&__csr=g4h6OMTax5iMzf24lljnkAh7qfdkgyld8ydEjtIgBdbPl9QBbdXKyaGWh4yHj5tIG9K_kxeYzijlr-J4WiAt7kIAZOrgOQTiKy6alKvQ9uJDsyh-XqAVmVV2lloN4AKGQJ6OqytrEwzuWWyUOqjLCamiHyqKFbAGpaVbVFECAXBhVaVKlfyujAGmht2pamvBKjKunWyaKFFVGxyiGKaGlBzLBUZuqmny4XK8xjy9UCaAJ4CG9qLGhfyojWJ2Z3AbBBKqicGiexymiay9ohXAx1eFmajhFoTxamaCxpCGUpy49CyEth8ryGg-8ABwuUqUK9RCy9UK6U4ehuV8J1K5GzV4bXg-fwDgmzU6a78K2uu78e8swmoco0zS0KQ4ARQU3et6jgypxfc0tabg0BoMcU0_x9045y8GWwM85U22Bg3_Cw10q0v51hgHd4AcFQ3IAr2kEj4yDlPl1fb7ws81Co7CE1iV81eE0giw21HwdB04tx23i09M4Pw5cwiA01j1wOBy80t3o1624Dw2yaw14K06cFYg5UCaDwPk1i10yxa0im040U1b40Gyw2E45k3l0Hg1pU1E0k8-82E5-8gcU2Ww0xphz3U6eu2G8gfIE-1uwtU0h2w1PuIC2edw1TJ0kO04rw2cVAC2_a05582Qa097w8u04HVE1mSmubw2a-mu8ylBoLwcZ02Xo10Q0nfg30wUo0jew4MAw&__comet_req=11&fb_dtsg="+fb.dtsg+"&jazoest=25739&lsd=C-IaWf0kuA8oT3YzT-pD2t&__spin_r=1018536265&__spin_b=trunk&__spin_t=1733024978&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=igCreationAndLoginMutationsIGProConvertMutation&variables=%7B%22ig_oidc_id_token%22%3A%7B%22sensitive_string_value%22%3A%22"+idToken+"%22%7D%2C%22pro_type%22%3A%7B%22sensitive_string_value%22%3A%22Doanh%20nghi%E1%BB%87p%22%7D%2C%22pro_category_id%22%3A%7B%22sensitive_string_value%22%3A%222201%22%7D%2C%22show_category%22%3A%7B%22sensitive_string_value%22%3A%22false%22%7D%2C%22igdm_waverly_toggle%22%3A%7B%22sensitive_string_value%22%3A%22true%22%7D%2C%22device_id%22%3A%7B%22sensitive_string_value%22%3A%22"+deviceId+"%22%7D%7D&server_timestamps=true&doc_id=7115872818527669",
                                                                                    "method": "POST",
                                                                                })
                                                                                
                                                                                const resData = await res.json()

                                                                                const idToken2 = resData.data.bizkit_mbs_convert_ig_to_pro.ig_oidc_id_token

                                                                                if (idToken2) {

                                                                                    await send('message', {id: item.id, message: 'Đang kết nối với page'})

                                                                                    const res = await fetch("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=14225", {
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
                                                                                            "x-fb-friendly-name": "igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation",
                                                                                            "x-fb-lsd": "bJBfWFybhvQ1DqPe3vqR81",
                                                                                            "cookie": pageCookie,
                                                                                            "user-agent": fb.UA,
                                                                                        },
                                                                                        agent: fb.agent,
                                                                                        "body": "av="+page.id+"&__usid=6-Tsnsqmr1x9qxt3%3APsnsqmqxo2vd9%3A0-Asnsqmr1psyuzx-RV%3D6%3AF%3D&__aaid=0&__user="+fb.uid+"&__a=1&__req=15&__hs=20058.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1018536265&__s=rd11wc%3Aaw4vp1%3Ay6i89w&__hsi=7443285604159388496&__dyn=7AzHJ16Aexp2u7-5k1ryUbFp62Gim2q3K2K5U4e2C1vzEdEnxiUco5S3O6Uhw8-E2iwUx60xU8E3Qwb-qbx6321Zm19wdu2O1VwwAwXwEwpUO0iS12x62G3i1ywOwv89kbxS1FwnE4K5E663G48W2a4p89HK2efK2W1vxi4UaEW2G1NwwwJK14xm4E5yexfxm16wUwtEkz8uxe0Voc8-q2-azo8U3ywbS1LwTwNAwGwFgbUcoco9U6O1FwgU882Pwo8uwjUy2-2K2G2-1Cwww&__csr=g4h6OMTax5iMzf24lljnkAh7qfdkgyld8ydEjtIgBdbPl9QBbdXKyaGWh4yHj5tIG9K_kxeYzijlr-J4WiAt7kIAZOrgOQTiKy6alKvQ9uJDsyh-XqAVmVV2lloN4AKGQJ6OqytrEwzuWWyUOqjLCamiHyqKFbAGpaVbVFECAXBhVaVKlfyujAGmht2pamvBKjKunWyaKFFVGxyiGKaGlBzLBUZuqmny4XK8xjy9UCaAJ4CG9qLGhfyojWJ2Z3AbBBKqicGiexymiay9ohXAx1eFmajhFoTxamaCxpCGUpy49CyEth8ryGg-8ABwuUqUK9RCy9UK6U4ehuV8J1K5GzV4bXg-fwDgmzU6a78K2uu78e8swmoco0zS0KQ4ARQU3et6jgypxfc0tabg0BoMcU0_x9045y8GWwM85U22Bg3_Cw10q0v51hgHd4AcFQ3IAr2kEj4yDlPl1fb7ws81Co7CE1iV81eE0giw21HwdB04tx23i09M4Pw5cwiA01j1wOBy80t3o1624Dw2yaw14K06cFYg5UCaDwPk1i10yxa0im040U1b40Gyw2E45k3l0Hg1pU1E0k8-82E5-8gcU2Ww0xphz3U6eu2G8gfIE-1uwtU0h2w1PuIC2edw1TJ0kO04rw2cVAC2_a05582Qa097w8u04HVE1mSmubw2a-mu8ylBoLwcZ02Xo10Q0nfg30wUo0jew4MAw&__comet_req=11&fb_dtsg="+fb.dtsg+"&jazoest=25739&lsd=C-IaWf0kuA8oT3YzT-pD2t&__spin_r=1018536265&__spin_b=trunk&__spin_t=1733024978&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BusinessCometPageIGLinkingMutation&variables=%7B%22pageID%22%3A%22"+page.id+"%22%2C%22igOIDCParams%22%3A%7B%22app_id%22%3A%2217951132926087090%22%2C%22id_token%22%3A%7B%22sensitive_string_value%22%3A%22"+idToken2+"%22%7D%7D%2C%22surfaceParams%22%3A%7B%22entry_point%22%3A%22UNIFIED_INBOX_IG_DIRECT_V2%22%2C%22link_flow_source%22%3A%22BIZ_WEB%22%7D%2C%22shouldSignSPToS%22%3Afalse%2C%22termsOfService%22%3A%22FB_IG_LINKING_PAGE_SETTINGS_WITH_IG_DIRECT_MESSAGES%22%2C%22bplErrorBehavior%22%3Anull%2C%22businessPortfolioTransparencyDisclosure%22%3Anull%2C%22overrideAllIgLinks%22%3Afalse%2C%22linkOverrideClientSupport%22%3A%22SUPPORTS_IG_LINK_OVERRIDE%22%7D&server_timestamps=true&doc_id=26176307035350033",
                                                                                        "method": "POST",
                                                                                    })

                                                                                    try {

                                                                                        const resData = await res.json()
                                                                                        console.log(resData)

                                                                                        const bmId = resData.data.link_page_to_instagram_account.page.owner_business.id

                                                                                        if (bmId) {

                                                                                            send('message', {id: item.id, message: 'Đang gỡ page'})

                                                                                            await fb.unlinkIg(page.additional_profile_id, page.id)

                                                                                            const res = await fetch("https://business.facebook.com/api/graphql/?_callFlowletID=7618&_triggerFlowletID=7613", {
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
                                                                                                    "x-fb-friendly-name": "igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation",
                                                                                                    "x-fb-lsd": "bJBfWFybhvQ1DqPe3vqR81",
                                                                                                    "cookie": fb.cookie,
                                                                                                    "user-agent": fb.UA,
                                                                                                },
                                                                                                agent: fb.agent,
                                                                                                "body": "av="+fb.uid+"&__usid=6-Tsnt6ij1mb07mk%3APsnt6iu95dbpc%3A0-Asnt6ij2a975p-RV%3D6%3AF%3D&__aaid=0&__bid="+bmId+"&__user="+fb.uid+"&__a=1&__req=1a&__hs=20058.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1018536926&__s=02ssob%3A5j9svn%3Aohb2rn&__hsi=7443374064069541853&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw5MypU5-0Bo7O2l0Fwqo5W1yw9O48comwkE-UbE7i4UaEW2G261fwwwJK1qxa1ozEjU4Wdwoo4S5ayocE3jwgE-2-qaUK0gq0Lo6-3u36iU9E2cwNwDwjouwqo4e220hi7E5y1rwGw9q22&__csr=gN1578hEmytNspkhRkJRX8BuhsBqnfF8y9d8yRiaBtJQWpqGhB9laJqlQ-VdFkVaGQpRJEF2F-GqmaFlmCrEEDmtCz29qhVQhlWnJfBRiHt7l4hiORJaVkV4mWGsxnykEFUKQAySjjOlV22ah2eBUF7gSFbgC9QGKc-q8CVF4leiFdUCfAKKECmiGjxqAhTVCZDBG-HgBJoCdCVbn_DCVFF-mGCGfyeqQi9ye58WVGmu9Hyd2pQHy9bx6UnKqi4axi6ECdzR_CU-FrKEkx6u4EZ0BBxl7iGGByonwzwCxeczonzEGWxq4Euy8gwLxrxGq78K9zQm2yiq19ws41JzoeUqxOVVU4i6o2lwNw2fo2Xgijnjwe22a0M816URw2z80Sm084y0CaBqwjA5xN89wa8jwl9E0g6w7Yw4bw5yw4YG0kKi0jG0kl02OU0wqU1yo60yxy3i0FU1tVZwh48Bw0uVE0eo2a4E2ZK04PUgw5va0bfDxp01dS025B6cfw9q8gfIE-056o0sTH9w0w280dfCw4Nw1dcE0Au0xU08oFUy9mly-0PQ0fNg1poG0_S0ii5o0Ve0j2i&__comet_req=11&fb_dtsg="+fb.dtsg+"&jazoest=25495&lsd=3fJWZDbouWKtI7CzuGTtfJ&__spin_r=1018536926&__spin_b=trunk&__spin_t=1733045574&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitSettingsRemovePageMutation&variables=%7B%22businessID%22%3A%22"+bmId+"%22%2C%22pageID%22%3A%22"+page.id+"%22%7D&server_timestamps=true&doc_id=4726666260714535",
                                                                                                "method": "POST"
                                                                                            })

                                                                                            const resData = await res.text()

                                                                                            if (resData.includes('removed_page_id')) {

                                                                                                success++

                                                                                                error = false
                                                                                            } else {

                                                                                                send('message', {id: item.id, message: 'Tạo BM thất bại'})

                                                                                                await delayTimeout(2000)

                                                                                            }
                                                                                        } else {
                                                                                            dungLai = true
                                                                                        }

                                                                                    } catch {

                                                                                        dungLai = true

                                                                                    }

                                                                                }

                                                                            } else {

                                                                                success++

                                                                                error = false

                                                                            }

                                                                        }

                                                                    }

                                                                }

                                                            }

                                                        }

                                                        if (!error) {

                                                            await send('message', {id: item.id, message: 'Tạo IG thành công'})

                                                        } else {

                                                            await send('message', {id: item.id, message: 'Tạo IG thất bại'})

                                                        }

                                                    } catch (err) {

                                                        console.log(err)

                                                        await send('message', {id: item.id, message: 'Tạo IG thất bại'})

                                                    }

                                                    await delayTimeout(2000)

                                                    if (setting.createInstagramMode.value === 'regBm') {

                                                        await send('message', {id: item.id, message: 'Tạo thành công: '+success+' BM'})

                                                    } else {

                                                        await send('message', {id: item.id, message: 'Tạo thành công: '+success+' IG'})

                                                    }

                                                    if (dungLai) {
                                                        break
                                                    }

                                                    await delayTimeout(2000)

                                                }

                                            }

                                        }

                                    }

                                }

                            }

                        }

                    } else {

                        if (data.checkPoint === 'Checkpoint Verify' && tool === 'change' && setting.verifyPhone.value) {

                            let addPhoneSuccess = false
                            let enterPhoneSuccess = false
                            let enterPhoneData = false
                            let phone = false
                            let error = false

                            for (let index = 0; index < 6; index++) {

                                if (stopped) { break }

                                try {

                                    if (index > 0) {
                                        send('message', {id: item.id, message: 'Đang thử lấy số điện thoại khác'})
                                    } else {
                                        send('message', {id: item.id, message: 'Đang lấy số điện thoại'})
                                    }

                                    phone = await getPhone(setting.phoneService.value, setting.phoneServiceKey.value)
                                    // const phone = {
                                    //     number: '84592370170',
                                    //     id: '84592370170'
                                    // }

                                    send('message', {id: item.id, message: 'Đang nhập số điện thoại'})

                                    send('updateInfo', {id: item.id, limit: phone.number})

                                    console.log(setting.addCodeMode.value)

                                    if (setting.addPhoneMode.value === 'm') {

                                        const res4 = await fetch("https://m.facebook.com/setphone?new="+phone.number+"&old_phone=&reason=5&source=bounce", {
                                            "headers": {
                                                "accept": "*/*",
                                                "accept-language": "en-US,en;q=0.9",
                                                "content-type": "application/x-www-form-urlencoded",
                                                "sec-fetch-dest": "empty",
                                                "sec-fetch-mode": "cors",
                                                "sec-fetch-site": "same-origin",
                                                "cookie": data.cookie,
                                                "user-agent": setting.UAaddPhone.value,
                                            },
                                            agent,
                                            "body": "fb_dtsg="+data.dtsg+"&jazoest=25359&lsd=X1JbBwm78ijt6RCha6SUEQ&__dyn=1KQdAG1mws8-t0BBBzE4W12wAxu13wqobEdEc8uwaS6Uhw5ux60Vo1a852q1ew65xO0FE6S082x60na2l0FwGwcq0RE2IwcK0iC1qw8W1uwa-7U881soow46wbS1LwqobU1kU1UU7u1rw&__csr=&__req=2&__fmt=1&__a=AYlt77bf1DzCdc2dBF5neQcAGFqVXOyYOFj24q3lr7D9mMlUCWackvaV-gOaTPXBBcOmr26MzsUKOD7ubwFr1eG0bWuJiaCMA1EXLwf7GVPOtQ&__user="+item.uid,
                                            "method": "POST"
                                        })
                                        
                                        const resData4 = await res4.text()

                                        console.dir(resData4, {depth: null})

                                        if (resData4.includes('confirmemail.php?email_changed')) {
                                            enterPhoneSuccess = true
                                        } 

                                    } else if (setting.addCodeMode.value === 'www') {

                                        const res = await fetch("https://www.facebook.com/add_contactpoint/dialog/submit/", {
                                            "headers": {
                                                "accept": "*/*",
                                                "accept-language": "en-US,en;q=0.9",
                                                "content-type": "application/x-www-form-urlencoded",
                                                "priority": "u=1, i",
                                                "sec-fetch-dest": "empty",
                                                "sec-fetch-mode": "cors",
                                                "sec-fetch-site": "same-origin",
                                                "cookie": data.cookie,
                                                "user-agent": setting.UAaddPhone.value,
                                            },
                                            agent,
                                            "body": "jazoest=25597&fb_dtsg="+data.dtsg+"&next=&contactpoint="+phone.number+"&__user="+item.uid+"&__a=1&__req=5&__hs=19942.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1015471330&__s=02y9cx%3A596gix%3Anu1l0d&__hsi=7400356723096754359&__dyn=7xeUmBwjbg7ebwKBAg5S3G2O5U4e1Fx-ewSwMxW0DUS2S0im4E9ohwem0nCq1ew8y11wbG782Cwn-2y1Qw5Mx61vwnE2PwBgao1O82IwcK0RE5a1qw8W1uwa-7U1AEow46wbS1Lwqo1wU1UU7u1rw&__csr=&lsd=_bNCKzsIjPzYDowOhoHBB5&__spin_r=1015471330&__spin_b=trunk&__spin_t=1723029819",
                                            "method": "POST"
                                        })

                                        const resData = await res.text()

                                        if (!resData.includes('1549001')) {
                                            enterPhoneSuccess = true
                                        }

                                    } else {

                                        const res = await fetch("https://mbasic.facebook.com/", {
                                            "headers": {
                                                "accept": "*/*",
                                                "accept-language": "en-US,en;q=0.9",
                                                "sec-fetch-dest": "empty",
                                                "sec-fetch-mode": "cors",
                                                "sec-fetch-site": "same-origin",
                                                "cookie": data.cookie,
                                                "user-agent": setting.UAaddPhone.value,
                                            },
                                            agent,
                                        })

                                        const $ = cheerio.load(await res.text())

                                        const action = 'https://mbasic.facebook.com'+$('form[action^="/setphone?eav="]').attr('action')
                                        const oldPhone = $('input[name="old_phone"]').val()
                                        const country = $('input[name="country"]')

                                        const res2 = await fetch(action, {
                                            "headers": {
                                                "accept": "*/*",
                                                "accept-language": "en-US,en;q=0.9",
                                                "content-type": "application/x-www-form-urlencoded",
                                                "sec-fetch-dest": "empty",
                                                "sec-fetch-mode": "cors",
                                                "sec-fetch-site": "same-origin",
                                                "cookie": data.cookie,
                                                "user-agent": setting.UAaddPhone.value,
                                            },
                                            agent,
                                            "body": "fb_dtsg="+data.dtsg+"&jazoest=25599&old_phone="+oldPhone+"&country="+country+"&source=bounce&new="+phone.number+"&submit_new_number=C%E1%BA%ADp+nh%E1%BA%ADt+s%E1%BB%91+di+%C4%91%E1%BB%99ng",
                                            "method": "POST"
                                        })

                                        enterPhoneData = await res2.text()

                                        console.dir(enterPhoneData, {depth: null})

                                        if (enterPhoneData.includes('name="c"')) {

                                            enterPhoneSuccess = true

                                        }

                                    }

                                    if (enterPhoneSuccess) {

                                        try {

                                            if (setting.addCodeMode.value === 'm') {


                                                await fetch("https://m.facebook.com/confirmation_cliff/?type=resend&resend_type=message&is_soft_cliff=false&contact="+phone.number+"&sent_message_phone_params[0]=5&sent_message_phone_params[1]=Vietnam", {
                                                    "headers": {
                                                        "accept": "*/*",
                                                        "accept-language": "en-US,en;q=0.9",
                                                        "content-type": "application/x-www-form-urlencoded",
                                                        "sec-fetch-dest": "empty",
                                                        "sec-fetch-mode": "cors",
                                                        "sec-fetch-site": "same-origin",
                                                        "cookie": data.cookie,
                                                        "user-agent": setting.UAresend.value,
                                                    },
                                                    "body": "fb_dtsg="+data.dtsg+"&jazoest=25498&lsd=4aOVtQ41gGi8tnCt7M2vIR&__dyn=1KQdAG1mws8-t0BBBzE4W12wAxu13wqobEdEc8uwaS6Uhw8-0PEhwem0iy1gCwjE1xoswaq1Jw20Ehw5OwBgaoaE36wdq0H83bw4FwmE2ewnE2Lx-220n66811E2ZwrU6C2-0le0ue1TwmU&__csr=&__req=5&__fmt=1&__a=AYkq_eFIcSUUJzh-xHQP1BM2peYJ5_bEdKibGNFwM2vsDVMGLskHLQWoJCeyqZ2LVwcG50aNwoe3z4v5wSKSH9g1nXZUac2BlK70eeNEly1Zsw&__user="+item.uid,
                                                    "method": "POST"
                                                })
                                                
    
                                            } else if (setting.addCodeMode.value === 'mbasic') {
                                                
                                                const $ = cheerio.load(enterPhoneData)

                                                const action = 'https://mbasic.facebook.com'+$('form[action^="/confirmemail.php?msite_source_surface=hard_cliff&resend"]').attr('action')

                                                await fetch(action, {
                                                    "headers": {
                                                        "accept": "*/*",
                                                        "accept-language": "en-US,en;q=0.9",
                                                        "content-type": "application/x-www-form-urlencoded",
                                                        "sec-fetch-dest": "empty",
                                                        "sec-fetch-mode": "cors",
                                                        "sec-fetch-site": "same-origin",
                                                        "cookie": data.cookie,
                                                        "user-agent": setting.UAresend.value,
                                                    },
                                                    "body": "fb_dtsg="+data.dtsg+"&jazoest=25606",
                                                    "method": "POST"
                                                })
    
                                            } else {
    
                                                await fetch("https://www.facebook.com/confirm/resend_code/?cp="+phone.number, {
                                                    "headers": {
                                                        "accept": "*/*",
                                                        "accept-language": "en-US,en;q=0.9",
                                                        "content-type": "application/x-www-form-urlencoded",
                                                        "sec-fetch-dest": "empty",
                                                        "sec-fetch-mode": "cors",
                                                        "sec-fetch-site": "same-origin",
                                                        "cookie": data.cookie,
                                                        "user-agent": setting.UAresend.value,
                                                    },
                                                    "body": "cp="+phone.number+"&__asyncDialog=1&__user="+item.uid+"&__a=1&__req=2&__hs=19947.BP%3ADEFAULT.2.0..0.0&dpr=2&__ccg=EXCELLENT&__rev=1015585701&__s=dveeb0%3Ai80p6x%3A7gibau&__hsi=7402176270408816041&__dyn=7xeUmBwjbg7ebwKBAg5S3G2O5U4e1Fx-ewSwMxW0DUS2S0im4E9ohwem0nCq1ew8y11wbG782Cwn-2y1Qw5Mx61vwnE2PwBgao1O82IwcK0RE5a1qw8W1uwa-7U1AEow46wbS1Lwqo1wU1UU7u1rw&__csr=&fb_dtsg="+data.dtsg+"&jazoest=25513&lsd=qgK2CiIVIpxOHiT-9tUdKN&__spin_r=1015585701&__spin_b=trunk&__spin_t=1723453465&__jssesw=1",
                                                    "method": "POST"
                                                })
    
                                            }
    
                                        } catch {}

                                        send('message', {id: item.id, message: 'Đang chờ mã kích hoạt'})

                                        await delayTimeout(5000)

                                        const code = await getPhoneCode(setting.phoneService.value, setting.phoneServiceKey.value, phone.id)

                                        send('message', {id: item.id, message: 'Đang nhập mã kích hoạt: '+code})

                                        if (setting.addCodeMode.value === 'm') {

                                            const res = await fetch("https://m.facebook.com/confirmation_cliff/?contact="+phone.number+"&type=submit&is_soft_cliff=false&medium=sms&code="+code, {
                                                "headers": {
                                                    "accept": "*/*",
                                                    "accept-language": "en-US,en;q=0.9",
                                                    "content-type": "application/x-www-form-urlencoded",
                                                    "priority": "u=1, i",
                                                    "sec-fetch-dest": "empty",
                                                    "sec-fetch-mode": "cors",
                                                    "sec-fetch-site": "same-origin",
                                                    "x-asbd-id": "129477",
                                                    "x-fb-lsd": "pRjxjxE1m_DA0NrMiPMdVc",
                                                    "cookie": data.cookie,
                                                    "user-agent": setting.UAaddCode.value,
                                                },
                                                agent,
                                                "body": "fb_dtsg="+data.dtsg+"&jazoest=25577&lsd=wC8VD1vG7hO_rYAD4ie-oL&__dyn=1KQdAG1mws8-t0BBBwno4a2i5U4e1FwKwSwMxW0Horx60zU3ex60Vo1a852q1ew65wce09Mx60na2l0FwGw6twaO0OU1ao5G0zE5W0HUvwww5Nxy0gq0Lo6-1FwLw5jw7zwtU5K&__csr=&__req=3&__fmt=1&__a=AYl_Bz965RtL1SClYXWtBvW_JqGT4U94PYmIoaYuuvws0gViIeb_NxgdJsO48OdyWaTomZvCjdc2vl8fLsxyMt55HAffcUPQ4ECwzwPBXuGV2Q&__user="+item.uid,
                                                "method": "POST",
                                            })

                                        } else if (setting.addCodeMode.value === 'www') {

                                            const res = await fetch("https://www.facebook.com/confirm_code/dialog/submit/?next=https%3A%2F%2Fwww.facebook.com%2F&cp=%2B"+phone.number+"&from_cliff=1&conf_surface=hard_cliff&event_location=cliff", {
                                                "headers": {
                                                    "accept": "*/*",
                                                    "accept-language": "en-US,en;q=0.9",
                                                    "content-type": "application/x-www-form-urlencoded",
                                                    "priority": "u=1, i",
                                                    "sec-fetch-dest": "empty",
                                                    "sec-fetch-mode": "cors",
                                                    "sec-fetch-site": "same-origin",
                                                    "x-asbd-id": "129477",
                                                    "x-fb-lsd": "pRjxjxE1m_DA0NrMiPMdVc",
                                                    "cookie": data.cookie,
                                                    "user-agent": setting.UAaddCode.value,
                                                },
                                                "referrerPolicy": "origin-when-cross-origin",
                                                "body": "jazoest=25459&fb_dtsg="+data.dtsg+"&code="+code+"&source_verified=www_reg&confirm=1&__user="+item.uid+"&__a=1&__req=3&__hs=19942.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1015471330&__s=h1xc8o%3Ajkr57v%3Aqmwsan&__hsi=7400391765493628193&__dyn=7xeUmBwjbg7ebwKh941twWwIxu13wqovAyodEc8uxa0z8S2S0im4E9ohwem0Ko2_CwjE28wgo2WxO0FE5_wEwt81s8hwnU5W0IU9kbxS0sy0H83bwdq1iwmE2ewnE2Lx-220n66811E2ZwrU6C0oe0ue1TwmU&__csr=&lsd=pRjxjxE1m_DA0NrMiPMdVc&__spin_r=1015471330&__spin_b=trunk&__spin_t=1723037978",
                                                "method": "POST",
                                            })

                                        } else {

                                            const $ = cheerio.load(enterPhoneData)

                                            const action = 'https://mbasic.facebook.com'+$('form[action^="/confirmemail.php?msite_source_surface=hard_cliff"]').attr('action')

                                            const res = await fetch(action, {
                                                "headers": {
                                                    "accept": "*/*",
                                                    "accept-language": "en-US,en;q=0.9",
                                                    "content-type": "application/x-www-form-urlencoded",
                                                    "priority": "u=1, i",
                                                    "sec-fetch-dest": "empty",
                                                    "sec-fetch-mode": "cors",
                                                    "sec-fetch-site": "same-origin",
                                                    "x-asbd-id": "129477",
                                                    "x-fb-lsd": "pRjxjxE1m_DA0NrMiPMdVc",
                                                    "cookie": data.cookie,
                                                    "user-agent": setting.UAaddCode.value,
                                                },
                                                agent,
                                                "body": "fb_dtsg="+data.dtsg+"&jazoest=25279&c="+code+"&submit%5Bconfirm%5D=X%C3%A1c+nh%E1%BA%ADn",
                                                "method": "POST",
                                            })

                                        }

                                    }
                                    
                                    try {

                                        await checkLive(item.uid)

                                        const res2 = await fetch("https://mbasic.facebook.com/", {
                                            "headers": {
                                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                                "accept-language": "en-US,en;q=0.9",
                                                "cache-control": "max-age=0",
                                                "dpr": "0.8999999761581421",
                                                "priority": "u=0, i",
                                                "sec-fetch-dest": "document",
                                                "sec-fetch-mode": "navigate",
                                                "sec-fetch-site": "none",
                                                "sec-fetch-user": "?1",
                                                "upgrade-insecure-requests": "1",
                                                "cookie": data.cookie,
                                                "user-agent": userAgent,
                                            },
                                            agent,
                                            "referrerPolicy": "strict-origin-when-cross-origin",
                                            "body": null,
                                            "method": "GET"
                                        })

                                        if (res2.url === 'https://mbasic.facebook.com/') {
                                            addPhoneSuccess = true

                                            break
                                        }

                                    } catch (err) {

                                        console.log(err)

                                        const account = item.uid+'|'+item.password+'|'+item.cookies+'|'+phone.number

                                        send('verify_die', account)

                                        error = 'UID Die'

                                        break

                                    }

                                } catch (err) {
                                    console.log(err)
                                }

                            }

                            if (addPhoneSuccess) {

                                const account = item.uid+'|'+item.password+'|'+item.cookies+'|'+phone.number

                                send('verify_ok', account)

                                send('message', {id: item.id, message: 'Thêm số điện thoại thành công'})

                                if (setting.upLenSite.value) {
                                    try {

                                        send('message', {id: item.id, message: 'Đang up lên site'})

                                        const account = item.uid+'|'+item.password+'|'+item.twofa+'|'+item.cookies+'|'+phone.number

                                        console.log(account)

                                        const res = await fetch(setting.upLenSiteUrl.value+account)
                                        const resData = await res.json()

                                        console.log(resData)

                                        if (resData.status === 'success') {
                                            send('message', {id: item.id, message: 'Up lên site thành công'})
                                        } else {
                                            send('message', {id: item.id, message: 'Up lên site thất bại'})
                                        }

                                    } catch (err) {
                                        send('message', {id: item.id, message: 'Up lên site thất bại'})
                                    }
                                }

                            } else {

                                const account = item.uid+'|'+item.password+'|'+item.cookies+'|'+phone.number

                                send('verify_fail', account)

                                if (error) {
                                    send('message', {id: item.id, message: 'Thêm số điện thoại thất bại: '+error})
                                } else {
                                    send('message', {id: item.id, message: 'Thêm số điện thoại thất bại'})
                                }
                            }
        
                        } else {
                            const account = item.uid+'|'+item.password+'|'+item.cookies

                            send('verify_fail', account)
                        }

                    }

                }

            }

        } catch (err) {

            console.log(err)

        } finally {

            const time = moment().format('DD/MM/YYYY - H:m:s')

            send('finish', {item, time})

            clearInterval(timer)

        }

        resolve()

    })
}