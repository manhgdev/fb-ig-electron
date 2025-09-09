const {zFetch} = require('./zquery.js')
const Db = require('./db.js')
const cheerio = require('cheerio')
const {resolveCaptcha, getTmMail, getTmMailInbox, getPhone, getPhoneCode, randomName, randomNumberRange} = require('./core.js')
const {taoPhoi} = require('./card.js')
const path = require('path')
const {app} = require('electron')
const fs = require('fs')
const twofactor = require('node-2fa')


class Insta {

    constructor (page, item, setting, pid) {
        this.page = page 
        this.item = item
        this.setting = setting
        this.pid = pid
    }

    login(message) {

        return new Promise(async (resolve, reject) => {

            let timeoutError = false

            let timeout = setTimeout(() => {

                timeoutError = true
                return reject('timeout')
                
            }, 60000)

            const page = this.page
            const item = this.item
            const z = new zFetch(page)

            try {
            
                await page.goto('https://www.instagram.com')
                
                await page.waitForSelector('[name="username"]')

                await page.type('[name="username"]', item.uid)

                await page.type('[name="password"]', item.password)

                try {

                    await Promise.all([
                        page.keyboard.press('Enter'),
                        page.waitForNavigation({
                            timeout: 5000
                        })
                    ])

                } catch {}

                for (let index = 0; index < 999; index++) {

                    try { process.kill(this.pid, 0) } catch { 
                        clearTimeout(timeout)
                        reject()
                        break 
                    }

                    if (timeoutError) {
                        reject()
                        break 
                    }

                    let error = false

                    try {

                        await page.waitForXPath('//div[contains(text(), "Sorry, your password")]', {
                            timeout: 1000
                        })
    
                        reject('Sai tài khoản hoặc mật khẩu')

                        error = true

                        break
    
                    } catch {}
    
                    try {
    
                        await page.waitForXPath('//div[contains(text(), "Your account has been disabled for violating our terms")]', {
                            timeout: 1000
                        })
    
                        reject('Tài khoản bị khóa')

                        error = true

                        break
    
    
                    } catch {}

                    const url = await page.url()

                    if (url.includes('/accounts/suspended/')) {

                        reject('282')
                        error = true

                        break

                    }


                    if (url.includes('/accounts/disabled/')) {

                        reject('disabled')
                        error = true

                        break

                    }

                    if (url.includes('/challenge/')) {

                        try {

                            await page.reload()

                            await page.waitForSelector('#recaptcha-iframe', {
                                timeout: 3000,
                            })

                            reject('captcha')
                            error = true

                            break

                        } catch {}
                    }


                    if (!error) {

                        try {

                            await page.waitForSelector('[name="te;"]', {
                                timeout: 1000
                            })

                            reject('add_phone')

                            break

                        } catch {}

                        try {

                            await page.waitForSelector('[role="button"][data-bloks-name="bk.components.Flexbox"]', {
                                timeout: 1000
                            })

                            await page.click('[role="button"][data-bloks-name="bk.components.Flexbox"]')

                        } catch {}

                        try {

                            await page.waitForSelector('select[title="Month:"]', {
                                timeout: 1000
                            })

                            const year = randomNumberRange(1989, 2003)
                            const month = randomNumberRange(1, 12)
                            const day = randomNumberRange(1, 12)

                            await page.select('select[title="Month:"]', month.toString())

                            await page.select('select[title="Day:"]', day.toString())

                            await page.select('select[title="Year:"]', year.toString())

                            const button = await page.$x('//div[text()="Next"]')

                            await button[0].click() 

                            const button2 = await page.$x('//button[text()="Yes"]')

                            await button2[0].click() 

                        } catch {}

                        try {


                            await page.waitForSelector('[name="verificationCode"]', {
                                timeout: 1000
                            })

                            error = true

                            const twoFaCode = twofactor.generateToken(item.twofa)

                            message('Đang nhập mã 2FA: '+twoFaCode.token)

                            await page.type('[name="verificationCode"]', twoFaCode.token)

                            await page.keyboard.press('Enter')

                        } catch {}

                        let dtsg = false
                        let instaId = false

                        try {

                            const res = await z.get("https://accountscenter.instagram.com/accounts/")
                            const dtsgMatch = res.match(/(?<=\"token\":\")[^\"]*/g)

                            if (dtsgMatch[1]) {
                                dtsg = dtsgMatch[1]
                            }

                        } catch (err) {
                        }

                        if (dtsg) {
                            
                            resolve({
                                dtsg, instaId
                            })

                            break
                        }

                    }

                }

            } catch {}

        })
    }

    giaiCaptcha(message) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const setting = this.setting
            const z = new zFetch(page)

            try {

                const url = await page.url()
                const html = await page.content()
                const locale = (html.match(/(?<=\"code\":\")[^\"]*/g))[0]

                const cookies = await page.cookies()
                const csrf = (cookies.filter(item => item.name === 'csrftoken'))[0].value
                
                const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?__cci=ig_captcha_iframe&compact=false&locale='+locale+'&referer=https%253A%252F%252Fwww.instagram.com'
                await page.goto(captchaUrl)
                await page.waitForSelector('.g-recaptcha')
                const siteKey = await page.$eval('.g-recaptcha', el => el.getAttribute('data-sitekey'))
                await page.goBack()

                let captchaSuccess = false

                for (let index = 0; index < 3; index++) {

                    try { process.kill(this.pid, 0) } catch { break }

                    if (index > 0) {
                        message('Đang thử giải lại captcha')
                    } else {
                        message('Đang tiến hành giải captcha')
                    }

                    try {
                        
                        const code = await resolveCaptcha(setting, siteKey, captchaUrl)

                        if (code) {

                            let postUrl = 'https://www.instagram.com/api/v1/challenge/web/action/'
                            let postBody = "g-recaptcha-response="+code+"&next=https%3A%2F%2Fwww.instagram.com%2F%3F__coig_challenged%3D1"

                            if (url.includes('challenge_context')) {

                                const Url = new URL(url)
                                const context = Url.searchParams.get('challenge_context')

                                const res = await z.get(url.replace('https://www.instagram.com/challenge/', 'https://www.instagram.com/api/v1/challenge/web/'), {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                        "x-asbd-id": "129477",
                                        "x-csrftoken": csrf,
                                        "x-ig-app-id": "936619743392459",
                                        "x-ig-www-claim": "hmac.AR1G9pf314ZjC6MtYnXcnn1zI2sRU-AmlcBqP8W_YdbjAXza",
                                        "x-instagram-ajax": "1010855697",
                                        "x-requested-with": "XMLHttpRequest"
                                    },
                                })

                                postUrl = 'https://www.instagram.com'+res.navigation.forward
                                postBody = "challenge_context="+context+"&g-recaptcha-response="+code

                            }

                            const res = await z.post(postUrl, {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                    "x-asbd-id": "129477",
                                    "x-csrftoken": csrf,
                                    "x-ig-app-id": "936619743392459",
                                    "x-ig-www-claim": "hmac.AR1G9pf314ZjC6MtYnXcnn1zI2sRU-AmlcBqP8W_YdbjAXza",
                                    "x-instagram-ajax": "1010855697",
                                    "x-requested-with": "XMLHttpRequest"
                                },
                                "body": postBody
                            })

                            if (res.type === 'CHALLENGE_REDIRECTION') {
                                captchaSuccess = true
                                break
                            }

                        }

                    } catch {}

                    await page.waitForTimeout(2000)
                    
                }

                if (captchaSuccess) {
                    await page.goto('https://www.instagram.com')
                    message('Giải captcha thành công')
                    resolve()
                } else {
                    message('Giải captcha thất bại')
                    reject()
                }

            } catch (err) {
                console.log(err)
                message('Giải captcha thất bại')
                reject()
            }
        })
    }

    khang282(message) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const setting = this.setting
            const z = new zFetch(page)

            try {
                const html = await page.content()
                const dtsgMatch = html.match(/(?<=\"f\":\")[^\"]*/g)

                if (dtsgMatch[0]) {

                    const dtsg = dtsgMatch[0]

                    const getState = () => {
                        return new Promise(async (resolve, reject) => {
                            const res = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.controller&type=app&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                },
                                "body": "__d=www&__user=0&__a=1&__req=1&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010654565&__s=m5z4xe%3A59ggbl%3Aotpm74&__hsi=7320062786796391003&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=hZR6EylkiOjQCppXhbt5BVFoyhcEmA_VoN7yEaoowhUKbxaJ150zxXGmczkdxbzE8VUOHxqubUjwFxy2Xw04Kag-2e01f-wLw4Ig0WK0iiOk0aX8Egg3EwbW1ng-2e&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26347&lsd=1xNk-m_OGw0bZdvI11OCs4&__spin_r=1010654565&__spin_b=trunk&__spin_t=1704334930&params=%7B%7D",
                            })

                            resolve(res)
                        })
                    }

                    let html = await getState()

                    const introStep = html.includes('com.bloks.www.checkpoint.ufac.complete_intro')

                    if (introStep) {
                        
                        html = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.complete_intro&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                            },
                            "body": "__d=www&__user=0&__a=1&__req=8&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010654565&__s=ipy3n6%3Amug09i%3Aux7db5&__hsi=7320066279506613406&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=hZR6EylkiOjQCppXhbt5BVFoyhcEmA_VoN7yEaoowhUKbxaJ150zxXGmczkdxbzE8VUOHxqubUjwFxy2Xw04Kag-2e01f-wLw4Ig0WK0iiOk0aX8Egg3EwbW1ng-2e&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26083&lsd=xZcKMQBLB1FteWrp8vf05X&__spin_r=1010654565&__spin_b=trunk&__spin_t=1704335743&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%221299903020100000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%221299903020100015%5C%22%7D%7D%22%7D",
                        })

                    }

                    const captChaStep = html.includes('com.bloks.www.checkpoint.ufac.bot_captcha.submit')

                    if (captChaStep) {

                        message('Đang giải captcha')

                        const part1 = html.replaceAll('\\', '').split('bk.action.array.Make, "').filter(item => item.startsWith('AZ'))
                        const persist = (part1[0].split('", (bk.action'))[0]
                        const content = await z.get('https://www.instagram.com/')
                        const locale = (content.match(/(?<=\"code\":\")[^\"]*/g))[0]
                        const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?__cci=ig_captcha_iframe&compact=false&locale='+locale+'&referer=https%253A%252F%252Fwww.instagram.com'
                        await page.goto(captchaUrl)

                        const $ = cheerio.load(await page.content())

                        const siteKey = $('.g-recaptcha').attr('data-sitekey')

                        await page.goto('https://www.instagram.com')

                        for (let index = 0; index < 3; index++) {

                            try { process.kill(this.pid, 0) } catch { break }

                            if (index > 0) {
                                message('Đang thử giải lại captcha')
                            }
    
                            try {
                                
                                const res = await resolveCaptcha(setting, siteKey, captchaUrl)
    
                                if (res) {

                                    const res1 = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.bot_captcha.submit&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                        },
                                        "body": "__d=www&__user=0&__a=1&__req=7&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=yvnffq%3A6jcms9%3Ax2bq5q&__hsi=7320085618821695684&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26072&lsd=5yBYpSvYWuzEhg-LZAwqh7&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704340246&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22persisted_data%5C%22%3A%5C%22"+persist+"%5C%22%2C%5C%22challenge_root_id%5C%22%3A%5C%22146198691500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22146198691500016%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22captcha_response%5C%22%3A%5C%22"+res+"%5C%22%7D%7D%22%7D",
                                    })

                                    if (res1.includes('com.bloks.www.checkpoint.ufac.set_contact_point.submit')) {

                                        html = res1

                                        message('Giải captcha thành công')

                                        break

                                    } else {

                                        return reject('Giải captha thất bại')
                                    }

                                }
    
                            } catch {}

                            await page.waitForTimeout(2000)
                            
                        }

                    }

                    const codeStep = html.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')

                    if (codeStep) {

                        message('Đang gỡ thông tin cũ')

                        const res = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.unset&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                            },
                            "body": "__d=www&__user=0&__a=1&__req=8&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=pqf7gs%3Azy2ice%3Aa0pbs7&__hsi=7320090189020903957&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26140&lsd=JiGeWpm2Q2s053q8T1Rock&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341310&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22150030877200000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22150059866100016%5C%22%7D%7D%22%7D",
                        })

                        if (res.includes('com.bloks.www.checkpoint.ufac.set_contact_point.submit')) {
                            message('Gỡ thông tin cũ thành công')
                            html = await getState()
                        } else {
                            return reject('Gỡ thông tin cũ thất bại')
                        }

                    }

                    const emailStep = html.includes('com.bloks.www.checkpoint.ufac.set_contact_point.submit') && !html.includes('ig.components.PhoneNumberInput')

                    if (emailStep) {
                        
                        const service = setting.tmMailService.value
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

                        const mailData = await getTmMail(service, domain)

                        message('Đang thêm email: '+mailData.address) 

                        const res = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.set_contact_point.submit&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                            },
                            "body": "__d=www&__user=0&__a=1&__req=7&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=fb9mg2%3Azy2ice%3Aa0pbs7&__hsi=7320090189020903957&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26140&lsd=JiGeWpm2Q2s053q8T1Rock&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341310&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22150030877200000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22150030877200015%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22contact_point%5C%22%3A%5C%22"+mailData.address+"%5C%22%7D%7D%22%7D",
                        })

                        let enterEmailSuccess = false

                        if (res.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')) {

                            message('Đang chờ mã kích hoạt email')

                            let code = false

                            await page.waitForTimeout(10000)

                            for (let index = 0; index < 99; index++) {

                                try { process.kill(this.pid, 0) } catch { break }
                                
                                try {

                                    const inbox = (await getTmMailInbox(mailData, service)).filter(item => item.from.includes('mail.instagram.com'))

                                    if (inbox[0].code) {
                                        code = inbox[0].code

                                        break
                                    }

                                } catch (er) {}

                                await page.waitForTimeout(1000)
                                
                            }
                            

                            if (code) {
                                message('Đang nhập mã kích hoạt email: '+code)

                                const res = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.submit_code&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                    },
                                    "body": "__d=www&__user=0&__a=1&__req=9&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=0ugmsw%3Ajsxq69%3A57lu3m&__hsi=7320093099675678385&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26281&lsd=_0VAKbPPU8wPmrqDUbvCpv&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341988&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22152471553000000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22153144509100021%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22captcha_code%5C%22%3A%5C%22"+code+"%5C%22%7D%7D%22%7D",
                                })

                                if (!res.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')) {

                                    message('Thêm email thành công')

                                    enterEmailSuccess = true 

                                    html = res
                                }

                            }

                        }

                        if (!enterEmailSuccess) {

                            await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.unset&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                },
                                "body": "__d=www&__user=0&__a=1&__req=8&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=pqf7gs%3Azy2ice%3Aa0pbs7&__hsi=7320090189020903957&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26140&lsd=JiGeWpm2Q2s053q8T1Rock&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341310&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22150030877200000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22150059866100016%5C%22%7D%7D%22%7D",
                            })

                            return reject('Thêm email thất bại')

                        }

                    }

                    const phoneStep = html.includes('ig.components.PhoneNumberInput')

                    if (phoneStep) {
                        let phoneStepSuccess = false

                        for (let index = 0; index < 6; index++) {

                            try { process.kill(this.pid, 0) } catch { break }

                            let phone = false
                            let addPhoneSuccess = false
                            let addCodeSuccess = false

                            for (let index = 0; index < 6; index++) {

                                try { process.kill(this.pid, 0) } catch { break }

                                html = await getState()

                                const phoneStep = html.includes('ig.components.PhoneNumberInput')

                                if (phoneStep) {
                                                                    
                                    if (index > 0) {
                                        message('Đang thử lấy số điện thoại khác')
                                    } else {
                                        message('Đang lấy số điện thoại')
                                    }

                                    try {

                                        phone = await getPhone(setting.phoneService.value, setting.phoneServiceKey.value, '', 'instagram')

                                        message('Đang thêm số điện thoại')

                                        const res = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.set_contact_point.submit&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                            "headers": {
                                              "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                            },
                                            "body": "__d=www&__user=0&__a=1&__req=7&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010660656&__s=5dzwqu%3A96t994%3Araushu&__hsi=7320111898954618919&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gxNdq999bLnlFG8mEASHCKKbBGZ4h8OUyHAAVo98pxm3i7Ey4F4dBBxmaAxGFFoWEkDy89EKexF5z8iKm3y48qxa00iVgw052Gaw4JBw3HE1aiet02rU24Bkw1Koby0&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26255&lsd=IzBDHqLngAXRrJnsfdjSjN&__spin_r=1010660656&__spin_b=trunk&__spin_t=1704346365&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22168227330500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22168227330500018%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22contact_point%5C%22%3A%5C%22VN+%2B"+phone.number+"%5C%22%7D%7D%22%7D",
                                        })
                                        
                                        if (res.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')) {
                                            
                                            addPhoneSuccess = true

                                            break
                                        }

                                        if (setting.phoneService.value === 'custom' && phone.id) {
    
                                            try {

                                                const phoneData = new Db('phone/instagram')
                                                const phoneItem = await phoneData.findById(phone.id)
    
                                                if (!addPhoneSuccess) {

                                                    const errorCount = phoneItem.errorCount
        
                                                    await phoneData.update(phone.id, {
                                                        errorCount: errorCount + 1,
                                                        running: false,
                                                    })

                                                }
    
                                            } catch (err) {}

                                        }

                                    } catch (err) { console.log(err) }


                                } else {
                                    return reject()
                                }

                            }

                            if (addPhoneSuccess && phone) {

                                html = await getState()

                                const codeStep = html.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')

                                if (codeStep) {

                                    message('Đang chờ mã kích hoạt số điện thoại')

                                    try {

                                        const code = await getPhoneCode(setting.phoneService.value, setting.phoneServiceKey.value, phone.id)

                                        message('Đang nhập mã kích hoạt số điện thoại: '+code)

                                        const res = await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.submit_code&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                            "headers": {
                                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                            },
                                            "body": "__d=www&__user=0&__a=1&__req=9&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=0ugmsw%3Ajsxq69%3A57lu3m&__hsi=7320093099675678385&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26281&lsd=_0VAKbPPU8wPmrqDUbvCpv&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341988&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22152471553000000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22153144509100021%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22captcha_code%5C%22%3A%5C%22"+code+"%5C%22%7D%7D%22%7D",
                                        })

                                        console.log(res)

                                        if (!res.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')) {

                                            message('Thêm số điện thoại thành công')

                                            addCodeSuccess = true
                                        }
                                        

                                    } catch (err) {}

                                    if (addCodeSuccess) {

                                        phoneStepSuccess = true

                                        break

                                    } else {

                                        await z.post("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.unset&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                            "headers": {
                                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                            },
                                            "body": "__d=www&__user=0&__a=1&__req=8&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=pqf7gs%3Azy2ice%3Aa0pbs7&__hsi=7320090189020903957&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26140&lsd=JiGeWpm2Q2s053q8T1Rock&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341310&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22150030877200000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22150059866100016%5C%22%7D%7D%22%7D",
                                        })
                                        
                                    }
                                }
                            }

                            if (setting.phoneService.value === 'custom' && phone.id) {
    
                                try {

                                    const phoneData = new Db('phone/instagram')
                                    const phoneItem = await phoneData.findById(phone.id)
                                    const count = phoneItem.count

                                    if (addCodeSuccess) {
                                        await phoneData.update(phone.id, {
                                            count: count + 1,
                                            running: false
                                        })
                                    } else {
                                        await phoneData.update(phone.id, {
                                            running: false
                                        })
                                    }

                                } catch (err) {}

                            }

                        }

                        if (phoneStepSuccess) {
                            html = await getState()
                        } else {
                            return reject('Thêm số điện thoại thất bại')
                        }
                    }

                    const photoStep = html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_identity_verification_photo') || html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_selfie')

                    if (photoStep) {

                        message('Đang tạo phôi')

                        try {

                            const phoiTemplate = path.resolve(app.getPath('userData'), 'phoi/'+setting.phoiTemplate.value)

                            if (!fs.existsSync(phoiTemplate)) {

                                return reject('Không thể load phôi')
                            }

                            const name = await randomName()

                            const genders = ["Male", "Female"]

                            const random = Math.floor(Math.random() * genders.length);
                            const gender = genders[random]

                            const textData = {
                                firstName: name.ho,
                                lastName: name.ten,
                                fullName: name.ho+' '+name.ten,
                                birthday: randomNumberRange(1, 25)+'/'+randomNumberRange(1, 12)+'/'+randomNumberRange(1990, 2005),
                                gender,
                            }
                        
                            const dest = path.resolve(app.getPath('userData'), 'card/'+this.item.uid.replaceAll('.', '')+'.png')

                            if (!fs.existsSync(dest)) {
                                await taoPhoi(textData, phoiTemplate, dest, false)
                            }

                            await page.reload()

                            await page.waitForSelector('[enctype="multipart/form-data"] button', {
                                timeout: 5000
                            })

                            const [fileChooser] = await Promise.all([
                                page.waitForFileChooser(),
                                page.click('[enctype="multipart/form-data"] button'),
                            ])

                            await fileChooser.accept([dest])

                            await page.waitForTimeout(5000)

                            message('Đang upload phôi')

                            await page.click('[aria-label="Submit"]')

                            for (let index = 0; index < 99; index++) {
                                
                                try { process.kill(this.pid, 0) } catch { break }

                                const html = await getState()

                                if (html.includes('awaiting_review_ui_state')) {

                                    message('Kháng 282 thành công')
                                    
                                    resolve()

                                    break

                                }

                            }

                            
                        } catch (err) {

                            console.log(err)

                            return reject('Upload phôi thất bại')
                        }

                    }

                    for (let index = 0; index < 9999; index++) {

                        try { process.kill(this.pid, 0) } catch { break }
                        
                        const reviewStep = html.includes('awaiting_review_ui_state')

                        if (reviewStep) {

                            message('Kháng 282 thành công')
                            resolve()
                            break
                        }

                        const redirect = await z.getRedirect('https://www.instagram.com/')

                        if (!redirect.includes('/accounts/suspended/')) {

                            message('Kháng 282 thành công')
                            resolve()
                            break

                        }
                        
                    }

                }

            } catch (err) {
                console.log(err)
            }

        })
    }

}

module.exports = Insta