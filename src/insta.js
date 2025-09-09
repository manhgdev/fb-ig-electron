const {useProxy, delayTimeout, getTmMail, getGmxInboxes, getTmMailInbox, deleteFakeEmailInbox, getMoAktMail2, getSetting, getPhoneCode, getPhone, randomName, randomNumberRange, resolveCaptcha, getMoAktMail, getMailInboxes, getMoAktMailInbox} = require('./core.js')
const {taoPhoi} = require('./card.js')
const Db = require('./db.js')
const encPassword = require('./password.js')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const path = require('path')
const {app} = require('electron')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const mime = require('mime')
const FormData = require('form-data')
const sharp = require('sharp')
const twofactor = require('node-2fa')

class IG {

    constructor(auth) {

        this.username = auth.username
        this.proxy = auth.proxy
        this.password = auth.password
        this.email = auth.email
        this.passMail = auth.passMail
        this.twofa = auth.twofa

        this.UA = auth.UA 
        this.UA1 = auth.UA1 || "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
        this.UA2 = auth.UA2 || "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"

        this.options = {
            "headers": {
                "accept": "*/*",
                "accept-language": "vi",
                "cache-control": "max-age=0",
                "user-agent": this.UA,
                "dpr": "1",
                "sec-ch-prefers-color-scheme": "dark",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Microsoft Edge\";v=\"120\"",
                "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.200\", \"Microsoft Edge\";v=\"120.0.2210.121\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"15.0.0\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "viewport-width": "715",
                "referrerPolicy": "strict-origin-when-cross-origin",
            },
        }

        if (auth.proxy) {
            this.options.agent = useProxy(auth.proxy)
        }

    }

    getCookies(res) {

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

    loginCookie(cookie) { return new Promise(async (resolve, reject) => {

        try {


            for (let index = 0; index < 3; index++) {
                try {
                    this.data = await this.getData()
                    break
                } catch {}
                
            }

            const res = await fetch("https://www.instagram.com/ajax/bulk-route-definitions/", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",
                    "dpr": "0.9",
                    "sec-ch-prefers-color-scheme": "light",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"15.0.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "787",
                    "x-asbd-id": "129477",
                    "x-fb-lsd": "AVqYFaiJ8Nk",
                    "user-agent": this.UA,
                    "x-ig-d": "www",
                    "cookie": cookie,
                },
                "agent": this.options.agent,
                "body": "route_urls[0]=%2Fchallenge%2Faction%2FAXEv_xhsl1dOF13SIj0xYiFUhYqqXVR2hnGyHe-mq1dVPbHuWyORp9l4wyzVPXU2j7GOTK8%2FAfxDtoO3Rrd-spYtOtq9ij3kqUIfTbwfer2LrN6IHWMpOudE9YXtWzn-8sfvFWGi_I5_l0V9JUqKGQ%2Fffc_Sv0yEazbf6hFFETtU6J4feZWthTGR2oDD6Zq00n3HL4BAPxHtGx4MURYIT0cfJMC%2F&routing_namespace=igx_www&__d=www&__user=0&__a=1&__req=2&__hs=19825.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=1&__ccg=UNKNOWN&__rev=1012731081&__s=zusemu%3A89epks%3A0kcgpm&__hsi=7356841708902919301&__dyn=7xe5WwlEnwn8K2Wmm0NonwgU2owSwMwNwcy0lW4o0B-q1ew65xO0FE2aw7Bx61vwoEcE2ygao1aU2swc20EUjwGzEaE7622362W2K0zE5W0PU1bobodEGdwtU662O0Lo6-3u2WE15E6O1FwlE6PhA6bxy13AwCAxW6Uf9E&__csr=hk9SyYAARjh7EHYCG-RhEC9CHKt5AG8L-ALX-GUC9Dyi9xeaCK9Bh8x0iQjyE-2um59oiyUqwxAyomxy16AzFoaEozUgKew8q00kllw13Obc03uC1Ig2Zgsw2Hk086wmU1Ko0gS8Ehgkw27o&__comet_req=7&lsd=AVqYFaiJ8Nk&jazoest=2940&__spin_r=1012731081&__spin_b=trunk&__spin_t=1712898190",
                "method": "POST"
            })

            

            this.options.headers = {
                ...this.options.headers,
                "content-type": "application/x-www-form-urlencoded",
                "x-asbd-id": "129477",
                "x-ig-app-id": "936619743392459",
                "x-ig-www-claim": "0",
                "x-instagram-ajax": "1010749009",
                "x-requested-with": "XMLHttpRequest",
                "x-csrftoken": this.data.csrf,
                "x-web-device-id": this.data.machineId,
                "Referer": "https://www.instagram.com/",
            }

            this.options.headers.cookie = cookie

            const check = await this.checkAccount()

            if (check.status) {
                this.userData = check.data
                resolve()
            } else {
                reject(check.type)
            }

        } catch (err) {

            console.log(err)

            reject('login_error')
        }

    })}

    login() { return new Promise(async (resolve, reject) => {

        try {

            for (let index = 0; index < 3; index++) {
                try {
                    this.data = await this.getData()
                    break
                } catch {}
                
            }

            this.options.headers = {
                ...this.options.headers,
                "content-type": "application/x-www-form-urlencoded",
                "x-asbd-id": "129477",
                "x-ig-app-id": "936619743392459",
                "x-ig-www-claim": "0",
                "x-instagram-ajax": "1010749009",
                "x-requested-with": "XMLHttpRequest",
                "x-csrftoken": this.data.csrf,
                "x-web-device-id": this.data.machineId,
                "Referer": "https://www.instagram.com/",
            }

            this.options.body = "enc_password=#PWD_INSTAGRAM_BROWSER:0:1111:"+this.password+"&optIntoOneTap=false&queryParams={}&trustedDeviceRecords={}&username="+this.username
            this.options.method = 'POST'

            const res = await fetch('https://www.instagram.com/api/v1/web/accounts/login/ajax/', this.options)
            const data = await res.json()

            this.options.headers.cookie = this.getCookies(res)
            
            if (data.message && data.status === 'fail' && !data.checkpoint_url) {

                reject('ERROR: '+data.message)

            }

            if (data.checkpoint_url?.includes('/challenge/')) {
                
                this.challenge = data.checkpoint_url

                reject('mail')

            }

            if (data.checkpoint_url?.includes('/auth_platform/')) {

                this.challenge = data.checkpoint_url

                reject('mail2')

            }

            if (data.two_factor_required) {

                const identifier = data.two_factor_info.two_factor_identifier
                
                const twofaCode = twofactor.generateToken(this.twofa)
                const code = twofaCode.token

                const res = await fetch("https://www.instagram.com/api/v1/web/accounts/login/ajax/two_factor/", {
                    "headers": {
                      "accept": "*/*",
                      "accept-language": "en-US,en;q=0.9",
                      "content-type": "application/x-www-form-urlencoded",
                      "dpr": "0.9",
                      "sec-ch-prefers-color-scheme": "light",
                      "sec-ch-ua-mobile": "?0",
                      "sec-ch-ua-model": "\"\"",
                      "sec-ch-ua-platform": "\"Windows\"",
                      "sec-ch-ua-platform-version": "\"15.0.0\"",
                      "sec-fetch-dest": "empty",
                      "sec-fetch-mode": "cors",
                      "sec-fetch-site": "same-origin",
                      "viewport-width": "964",
                      "x-asbd-id": "129477",
                      "user-agent": this.UA,
                      "x-csrftoken": this.data.csrf,
                      "x-ig-app-id": "936619743392459",
                      "x-ig-www-claim": "0",
                      "x-instagram-ajax": "1012473345",
                      "x-requested-with": "XMLHttpRequest",
                      "x-web-device-id": this.data.machineId,
                      "cookie": this.options.headers.cookie,
                      "Referer": "https://www.instagram.com/accounts/login/two_factor?next=%2F",
                      "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "agent": this.options.agent,
                    "body": "identifier="+identifier+"&queryParams=%7B%22next%22%3A%22%2F%22%7D&trust_signal=true&username="+this.username+"&verification_method=3&verificationCode="+code,
                    "method": "POST"
                })

                this.options.headers.cookie = this.getCookies(res)

                data.authenticated = true

            }

            if (data.authenticated) {
                
                let check = {}

                for (let index = 0; index < 9; index++) { 
                    try {
                        check = await this.checkAccount()
                        break
                    } catch (err) {
                    }
                }

                if (check.status) {
                    this.userData = check.data
                    resolve()
                } else {
                    reject(check.type)
                }

            } else if (!data.authenticated && data.user) {

                reject('wrong_password')

            } else {

                reject('login_error')
            }


        } catch (err) {

            console.log(err)

            reject('login_error')
        }

    })}

    checkAccount() { return new Promise(async (resolve, reject) => {

        try {

            this.options.body = null
            this.options.method = 'GET'

            const res = await fetch('https://www.instagram.com/data/shared_data/', this.options)
            const res1 = await fetch('https://www.instagram.com/', this.options)
            const data = await res.json()
            const data1 = await res1.text()

            this.data.claim = (data1.match(/(?<=\"claim\":\")[^\"]*/g))[0]
            this.data.csrf = (data1.match(/(?<=\"csrf_token\":\")[^\"]*/g))[0]

            if (res1.url.includes('challenge')) {

                this.options.body = "challenge_context=CMcpVqwjMFZmNOdla8ZsmrOV2nUEedyrerGreVS_xImd3tjJH1UimzdJPnjXMDM3jteubOG7KhL9qNf0&phone_number=&next=https%3A%2F%2Fwww.instagram.com%2F%3F__coig_challenged%3D1"
                this.options.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
                this.options.headers['x-csrftoken'] = this.data.csrf
                this.options.method = 'POST'

                const res = await fetch("https://www.instagram.com/api/v1/challenge/web/action/", this.options)

                const data = await res.text()

                if (data.includes('GraphChallengePageMap')) {

                    this.options.body = "choice=2&next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_challenged%3D1"

                    const res = await fetch("https://www.instagram.com/api/v1/challenge/web/action/", this.options)

                    const data = await res.text()


                    if (data.includes('/accounts/onetap')) {


                        this.options.body = "challenge_context=CMcpVqwjMFZmNOdla8ZsmrOV2nUEedyrerGreVS_xImd3tjJH1UimzdJPnjXMDM3jteubOG7KhL9qNf0&phone_number=&next=https%3A%2F%2Fwww.instagram.com%2F%3F__coig_challenged%3D1"
                        this.options.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
                        this.options.headers['x-csrftoken'] = this.data.csrf
                        this.options.method = 'POST'

                        const res1 = await fetch("https://www.instagram.com/api/v1/challenge/web/action/", this.options)

                        const data1 = await res1.text()

                        if (data1.includes('SubmitPhoneNumberForm')) {

                            resolve({
                                status: false,
                                type: 'add_phone',
                            })
                            
                        } else {

                            this.options.body = null
                            this.options.method = 'GET'

                            const res = await fetch('https://www.instagram.com/data/shared_data/', this.options)
                            const data2 = await res.json()

                            resolve({
                                status: true,
                                type: 'live',
                                data: data2.config.viewer,
                            })

                        }

                    }

                }

                if (data.includes(' ')) {

                    resolve({
                        status: false,
                        type: 'add_phone',
                    })

                } else if (data.includes('RecaptchaRestrictChallengeForm')) {

                    resolve({
                        status: false,
                        type: 'captcha',
                    })

                } else {

                    resolve({
                        status: false,
                        type: 'error',
                    })

                }

            } else {

                if (data.config?.viewer) {

                    resolve({
                        status: true,
                        type: 'live',
                        data: data.config.viewer,
                    })
                } else if (data.checkpoint_url?.includes('accounts/disabled')) {
                    resolve({
                        status: false,
                        type: 'die_vv',
                    })
                } else if (data.checkpoint_url?.includes('accounts/suspended')) {
                    resolve({
                        status: false,
                        type: '282',
                    })
                } else {
                    resolve({
                        status: false,
                        type: 'error',
                    })
                }

            }

        } catch (err) {

            resolve({
                status: false,
                type: 'error',
            })
        }

    })}

    getDtsg() { return new Promise(async (resolve, reject) => {

        try {

            this.options.body = null
            this.options.method = 'GET'

            const res = await fetch('https://www.instagram.com/accounts/edit/', this.options)
            const data = await res.text()

            const dtsg = (data.match(/(?<=\"token\":\")[^\"]*/g).filter(item => item.startsWith('NA')))[0]
            const actorID = (data.match(/(?<=\"actorID\":\")[^\"]*/g))[0]
            const instaId = (data.match(/(?<=\"appScopedIdentity\":\")[^\"]*/g))[0]

            this.dtsg = dtsg
            this.actorID = actorID
            this.instaId = instaId


            resolve()

        } catch (err) {

            reject()
        }

    })}

    getData() { return new Promise(async (resolve, reject) => {

        try {


            this.options.body = null 
            this.options.method = 'GET'
    
            const res = await fetch("https://www.instagram.com/", this.options)    

            const data = await res.text()

            const machineId = ((data.match(/(?<=\"device_id\":\")[^\"]*/g)).filter(item => item && !item.includes('$')))[0]
            const lsd = (data.match(/(?<=\"token\":\")[^\"]*/g))[0]
            const device = (data.match(/(?<=\"machine_id\":\")[^\"]*/g))[0]
            const csrf = (data.match(/(?<=\"csrf_token\":\")[^\"]*/g))[0]
            const datr = data.split('"_js_datr":{"value":"')[1].split('","expiration_for_js"')[0]
            const versionId = data.split('{"versioningID":"')[1].split('"')[0]
            const jazoest = data.split('&jazoest=')[1].split('"')[0]

            const time = String(Math.floor(Date.now() / 1000))

            const cookies = "ps_l=0; ps_n=0; csrftoken="+csrf+"; mid="+device+"; ig_did="+machineId+"; datr="+datr
    
            resolve({cookies, machineId, device, csrf, time, versionId, datr, lsd, jazoest})
    
        } catch (err) {
            reject(err)
        }

    })}

    khang282(message, updateLimit) {return new Promise(async (resolve, reject) => {

        try {

            message('Đang tiến hành kháng 282')

            const res = await fetch('https://www.instagram.com/accounts/suspended', this.options)
            const html = await res.text()

            let stopped = false
            let khang282Success = false

            const dtsg = (html.match(/(?<=\"f\":\")[^\"]*/g))[0]

            if (dtsg) {

                const setting = await getSetting()

                const getState = () => {
                    return new Promise(async (resolve, reject) => {

                        this.options.body = "__d=www&__user=0&__a=1&__req=1&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010654565&__s=m5z4xe%3A59ggbl%3Aotpm74&__hsi=7320062786796391003&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=hZR6EylkiOjQCppXhbt5BVFoyhcEmA_VoN7yEaoowhUKbxaJ150zxXGmczkdxbzE8VUOHxqubUjwFxy2Xw04Kag-2e01f-wLw4Ig0WK0iiOk0aX8Egg3EwbW1ng-2e&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26347&lsd=1xNk-m_OGw0bZdvI11OCs4&__spin_r=1010654565&__spin_b=trunk&__spin_t=1704334930&params=%7B%7D"
                        this.options.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
                        this.options.method = 'POST'

                        const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.controller&type=app&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", this.options)
                        const data = await res.text()

                        resolve(data)

                    })
                }

                let html = await getState()

                const introStep = html.includes('com.bloks.www.checkpoint.ufac.complete_intro')

                if (introStep) {

                    this.options.body = "__d=www&__user=0&__a=1&__req=8&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010654565&__s=ipy3n6%3Amug09i%3Aux7db5&__hsi=7320066279506613406&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=hZR6EylkiOjQCppXhbt5BVFoyhcEmA_VoN7yEaoowhUKbxaJ150zxXGmczkdxbzE8VUOHxqubUjwFxy2Xw04Kag-2e01f-wLw4Ig0WK0iiOk0aX8Egg3EwbW1ng-2e&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26083&lsd=xZcKMQBLB1FteWrp8vf05X&__spin_r=1010654565&__spin_b=trunk&__spin_t=1704335743&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%221299903020100000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%221299903020100015%5C%22%7D%7D%22%7D"
                    
                    const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.complete_intro&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", this.options)
                    html = await res.text()

                }

                const captChaStep = html.includes('com.bloks.www.checkpoint.ufac.bot_captcha.submit')

                if (captChaStep) {

                    message('Đang giải captcha')

                    const part1 = html.replaceAll('\\', '').split('bk.action.array.Make, "').filter(item => item.startsWith('AZ'))
                    const persist = (part1[0].split('", (bk.action'))[0]

                    this.options.headers['content-type'] = 'text/html; charset="utf-8"'
                    this.options.body = null
                    this.options.method = 'GET'

                    const res = await fetch('https://www.instagram.com/', this.options)
                    const content = await res.text()

                    const locale = (content.match(/(?<=\"code\":\")[^\"]*/g))[0]

                    if (locale && persist) {

                        const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?__cci=ig_captcha_iframe&compact=false&locale='+locale+'&referer=https%253A%252F%252Fwww.instagram.com'

                        const res = await fetch(captchaUrl, this.options)
                        const $ = cheerio.load(await res.text())

                        const siteKey = $('.g-recaptcha').attr('data-sitekey')

                        for (let index = 0; index < 3; index++) {

                            if (stopped) { break }

                            if (index > 0) {
                                message('Đang thử giải lại captcha')
                            }
    
                            try {
                                
                                const res = await resolveCaptcha(setting.general, siteKey, captchaUrl)
    
                                if (res) {

                                    const res2 = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.bot_captcha.submit&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                        "headers": {
                                            "accept": "*/*",
                                            "accept-language": "en-US,en;q=0.9",
                                            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                            "dpr": "0.9",
                                            "sec-ch-prefers-color-scheme": "light",
                                            "sec-fetch-dest": "empty",
                                            "sec-fetch-mode": "cors",
                                            "sec-fetch-site": "same-origin",
                                            "viewport-width": "805",
                                            "user-agent": this.UA,
                                            "cookie": this.options.headers.cookie,
                                            "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                            "Referrer-Policy": "strict-origin-when-cross-origin"
                                        },
                                        "agent": this.options.agent,
                                        "body": "__d=www&__user=0&__a=1&__req=7&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=yvnffq%3A6jcms9%3Ax2bq5q&__hsi=7320085618821695684&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26072&lsd=5yBYpSvYWuzEhg-LZAwqh7&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704340246&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22persisted_data%5C%22%3A%5C%22"+persist+"%5C%22%2C%5C%22challenge_root_id%5C%22%3A%5C%22146198691500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22146198691500016%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22captcha_response%5C%22%3A%5C%22"+res+"%5C%22%7D%7D%22%7D",
                                        "method": "POST"
                                    })

                                    const resData = await res2.text()

                                    if (resData.includes('com.bloks.www.checkpoint.ufac.set_contact_point.submit')) {

                                        html = resData

                                        message('Giải captcha thành công')

                                        break

                                    } else {

                                        return reject('Giải captha thất bại')
                                    }

                                }
    
                            } catch (err) {
                                console.log(err)
                            }
                            
                        }

                    } else {

                        stopped = true
                        return reject()
                    }


                }

                const codeStep = html.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')

                if (codeStep) {

                    message('Đang gỡ thông tin cũ')

                    const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.unset&type=action&__bkv=8bcb2010987ce0d8b367374a0209e1091fb2aa0a8484f307015f2f19cecd4eab", {
                        "headers": {
                          "accept": "*/*",
                          "accept-language": "en-US,en;q=0.9",
                          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                          "dpr": "0.9",
                          "sec-ch-prefers-color-scheme": "light",
                          "sec-fetch-dest": "empty",
                          "sec-fetch-mode": "cors",
                          "sec-fetch-site": "same-origin",
                          "viewport-width": "805",
                          "user-agent": this.UA,
                          "cookie": this.options.headers.cookie,
                          "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                          "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "agent": this.options.agent,
                        "body": "__d=www&__user=0&__a=1&__req=8&__hs=19735.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010814782&__s=nulles%3Ax9csab%3A5vznx6&__hsi=7323550084908100305&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=iNBj_cOqrObrrGihALzbFCBEFrFkqmBy9pFoKerjGum5ElxG14Kfwyy8VxyE-cgsUPCyUsK6qCimexW3qEuy8bogw04Je801eUw5Pzo10i03G2a441cw7UwaGhS0sW420&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26289&lsd=C6EbQdGiKftVY_isqdlnA6&__spin_r=1010814782&__spin_b=trunk&__spin_t=1705146880&__jssesw=1&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%222585262500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%222585262500021%5C%22%7D%7D%22%7D",
                        "method": "POST"
                    })

                    const resData = await res.text()

                    if (resData.includes('com.bloks.www.checkpoint.ufac.set_contact_point.submit')) {
                        message('Gỡ thông tin cũ thành công')
                        html = await getState()
                    } else {
                        message('Gỡ thông tin cũ thất bại')
                        stopped = true
                        return reject()
                    }

                }

                const emailStep = html.includes('com.bloks.www.checkpoint.ufac.set_contact_point.submit') && !html.includes('ig.components.PhoneNumberInput')

                if (emailStep) {
                    
                    const service = setting.general.tmMailService.value
                    let domain = ''

        
                    if (service === 'emailfake.com') {
                        domain = setting.general.emailFakeDomain.value
                    }

                    if (service === 'generator.email') {
                        domain = setting.general.generatorEmailDomain.value
                    }

                    if (service === 'moakt.com') {
                        domain = setting.general.moaktDomain.value
                    }

                    let mailData = false 

                    for (let index = 0; index < 10; index++) {

                        if (index > 0) {
                            message('Đang thử lấy lại email')
                        } else {
                            message('Đang lấy email')
                        }
                        
                        try {

                            mailData = await getTmMail(service, domain)

                            break

                        } catch {}
                        
                    }

                    if (mailData) {

                        message('Đang thêm email: '+mailData.address) 

                        const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.set_contact_point.submit&type=action&__bkv=8bcb2010987ce0d8b367374a0209e1091fb2aa0a8484f307015f2f19cecd4eab", {
                            "headers": {
                              "accept": "*/*",
                              "accept-language": "en-US,en;q=0.9",
                              "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                              "dpr": "0.9",
                              "sec-ch-prefers-color-scheme": "light",
                              "sec-fetch-dest": "empty",
                              "sec-fetch-mode": "cors",
                              "sec-fetch-site": "same-origin",
                              "viewport-width": "408",
                              "user-agent": this.UA,
                              "cookie": this.options.headers.cookie,
                              "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                              "Referrer-Policy": "strict-origin-when-cross-origin"
                            },
                            "agent": this.options.agent,
                            "body": "__d=www&__user=0&__a=1&__req=8&__hs=19735.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010814782&__s=ph6zth%3A1y38l3%3A0fermd&__hsi=7323554745543067777&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=iNBj_cOqrObrrGihALzbFCBEFrEFFqm8BCByUVJeFVomxm6E4iU-2a8zC6azUN1PzeqbxOUpGp9oW7EdGxW8wJx200iQUw04Xy0nedw4180eE8Egg4O0vy0GF7o1PEg8&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26039&lsd=pxY2n86wtYlkzIv8RXMAGC&__spin_r=1010814782&__spin_b=trunk&__spin_t=1705147965&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%226492351800000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%226492351800015%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22contact_point%5C%22%3A%5C%22"+mailData.address+"%5C%22%7D%7D%22%7D",
                            "method": "POST"
                        })

                        const resData = await res.text()

                        let enterEmailSuccess = false

                        if (resData.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')) {

                            message('Đang chờ mã kích hoạt email')

                            let code = false

                            for (let index = 0; index < 99; index++) {
                                
                                try {

                                    const inbox = (await getTmMailInbox(mailData, service)).filter(item => item.from.includes('mail.instagram.com'))

                                    if (inbox[0].code) {
                                        code = inbox[0].code

                                        break
                                    }

                                } catch (err) {}

                                await delayTimeout(1000)
                                
                            }
                            

                            if (code) {
                                message('Đang nhập mã kích hoạt email: '+code)

                                const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.submit_code&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                    "headers": {
                                        "accept": "*/*",
                                        "accept-language": "en-US,en;q=0.9",
                                        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                        "dpr": "0.9",
                                        "sec-ch-prefers-color-scheme": "light",
                                        "sec-fetch-dest": "empty",
                                        "sec-fetch-mode": "cors",
                                        "sec-fetch-site": "same-origin",
                                        "viewport-width": "408",
                                        "user-agent": this.UA,
                                        "cookie": this.options.headers.cookie,
                                        "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                        "Referrer-Policy": "strict-origin-when-cross-origin"
                                    },
                                    "agent": this.options.agent,
                                    "body": "__d=www&__user=0&__a=1&__req=9&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=0ugmsw%3Ajsxq69%3A57lu3m&__hsi=7320093099675678385&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26281&lsd=_0VAKbPPU8wPmrqDUbvCpv&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341988&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22152471553000000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22153144509100021%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22captcha_code%5C%22%3A%5C%22"+code+"%5C%22%7D%7D%22%7D",
                                    "method": "POST"
                                })

                                const resData = await res.text()

                                if (resData.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_identity_verification_photo') || resData.includes('com.bloks.www.checkpoint.ufac.set_contact_point.submit')) {

                                    message('Thêm email thành công')

                                    enterEmailSuccess = true 

                                    html = resData
                                }

                            }

                            if (!enterEmailSuccess) {

                                await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.unset&type=action&__bkv=8bcb2010987ce0d8b367374a0209e1091fb2aa0a8484f307015f2f19cecd4eab", {
                                    "headers": {
                                        "accept": "*/*",
                                        "accept-language": "en-US,en;q=0.9",
                                        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                        "dpr": "0.9",
                                        "sec-ch-prefers-color-scheme": "light",
                                        "sec-fetch-dest": "empty",
                                        "sec-fetch-mode": "cors",
                                        "sec-fetch-site": "same-origin",
                                        "viewport-width": "805",
                                        "user-agent": this.UA,
                                        "cookie": this.options.headers.cookie,
                                        "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                        "Referrer-Policy": "strict-origin-when-cross-origin"
                                    },
                                    "agent": this.options.agent,
                                    "body": "__d=www&__user=0&__a=1&__req=8&__hs=19735.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010814782&__s=nulles%3Ax9csab%3A5vznx6&__hsi=7323550084908100305&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=iNBj_cOqrObrrGihALzbFCBEFrFkqmBy9pFoKerjGum5ElxG14Kfwyy8VxyE-cgsUPCyUsK6qCimexW3qEuy8bogw04Je801eUw5Pzo10i03G2a441cw7UwaGhS0sW420&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26289&lsd=C6EbQdGiKftVY_isqdlnA6&__spin_r=1010814782&__spin_b=trunk&__spin_t=1705146880&__jssesw=1&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%222585262500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%222585262500021%5C%22%7D%7D%22%7D",
                                    "method": "POST"
                                })
    
                                message('Thêm email thất bại')
                                stopped = true
                                return reject()
    
                            }

                        }

                    } else {


                        message('Lấy email thất bại')

                        return reject()
                    }

                }

                const phoneStep = html.includes('ig.components.PhoneNumberInput')

                if (phoneStep) {

                    const phoneDb = new Db('checkPhone')

                    let phoneStepSuccess = false
                    let addPhoneError = false

                    for (let index = 0; index < 6; index++) {

                        if (stopped) { break }

                        let phone = false
                        let addPhoneSuccess = false
                        let addCodeSuccess = false

                        for (let index = 0; index < 6; index++) {
                            
                            if (stopped) { break }

                            html = await getState()

                            const phoneStep = html.includes('ig.components.PhoneNumberInput')

                            if (phoneStep) {
                                                                
                                if (index > 0) {
                                    message('Đang thử lấy số điện thoại khác')
                                } else {
                                    message('Đang lấy số điện thoại')
                                }

                                try {

                                    phone = await getPhone(setting.general.phoneService.value, setting.general.phoneServiceKey.value, '', 'instagram')

                                    try {

                                        await phoneDb.findById(phone.number)
                                   
                                    } catch {

                                        message('Đang thêm số điện thoại')

                                        const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.set_contact_point.submit&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                            "headers": {
                                                "accept": "*/*",
                                                "accept-language": "en-US,en;q=0.9",
                                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                                "dpr": "0.9",
                                                "sec-ch-prefers-color-scheme": "light",
                                                "sec-fetch-dest": "empty",
                                                "sec-fetch-mode": "cors",
                                                "sec-fetch-site": "same-origin",
                                                "viewport-width": "805",
                                                "user-agent": this.UA,
                                                "cookie": this.options.headers.cookie,
                                                "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                                "Referrer-Policy": "strict-origin-when-cross-origin"
                                            },
                                            "agent": this.options.agent,
                                            "body": "__d=www&__user=0&__a=1&__req=7&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010660656&__s=5dzwqu%3A96t994%3Araushu&__hsi=7320111898954618919&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gxNdq999bLnlFG8mEASHCKKbBGZ4h8OUyHAAVo98pxm3i7Ey4F4dBBxmaAxGFFoWEkDy89EKexF5z8iKm3y48qxa00iVgw052Gaw4JBw3HE1aiet02rU24Bkw1Koby0&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26255&lsd=IzBDHqLngAXRrJnsfdjSjN&__spin_r=1010660656&__spin_b=trunk&__spin_t=1704346365&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22168227330500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22168227330500018%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22contact_point%5C%22%3A%5C%22VN+%2B"+phone.number+"%5C%22%7D%7D%22%7D",
                                            "method": "POST"
                                        })

                                        const resData = await res.text()
                                                                                
                                        if (resData.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')) {
                                                                                        
                                            addPhoneSuccess = true

                                            stopped = true

                                            break
                                        }

                                        if (resData.includes('Too Many')) {

                                            message('Spam SMS')

                                            addPhoneError = 'Spam SMS'

                                            await delayTimeout(2000)

                                            stopped = true

                                            break

                                        }

                                        if (setting.general.phoneService.value === 'custom' && phone.id) {

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

                                    } 

                                } catch (err) { console.log(err) }


                            } else {
                                stopped = true
                                return reject()
                            }

                        }

                        if (addPhoneSuccess && phone) {

                            updateLimit(phone.number)

                            html = await getState()

                            const codeStep = html.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')

                            if (codeStep) {

                                message('Đang chờ mã kích hoạt số điện thoại')

                                let code = false

                                try {

                                    code = await getPhoneCode(setting.general.phoneService.value, setting.general.phoneServiceKey.value, phone.id)

                                    message('Đang nhập mã kích hoạt số điện thoại: '+code)

                                    await phoneDb.insert({
                                        id: phone.number
                                    })

                                    const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.submit_code&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                        "headers": {
                                            "accept": "*/*",
                                            "accept-language": "en-US,en;q=0.9",
                                            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                            "dpr": "0.9",
                                            "sec-ch-prefers-color-scheme": "light",
                                            "sec-fetch-dest": "empty",
                                            "sec-fetch-mode": "cors",
                                            "sec-fetch-site": "same-origin",
                                            "viewport-width": "805",
                                            "user-agent": this.UA,
                                            "cookie": this.options.headers.cookie,
                                            "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                            "Referrer-Policy": "strict-origin-when-cross-origin"
                                        },
                                        "agent": this.options.agent,
                                        "body": "__d=www&__user=0&__a=1&__req=9&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=0ugmsw%3Ajsxq69%3A57lu3m&__hsi=7320093099675678385&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26281&lsd=_0VAKbPPU8wPmrqDUbvCpv&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341988&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22152471553000000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22153144509100021%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22captcha_code%5C%22%3A%5C%22"+code+"%5C%22%7D%7D%22%7D",
                                        "method": "POST"
                                    })

                                    const resData = await res.text()

                                    if (resData.includes('com.bloks.www.checkpoint.ufac.complete_outro') || resData.includes('com.bloks.www.checkpoint.ufac.poll_ufac_api')) {

                                        message('Thêm số điện thoại thành công')

                                        addCodeSuccess = true

                                    } else {

                                        if (phone && code) {

                                            html = await getState()

                                            if (!html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_identity_verification_photo') && !html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_selfie')) {

                                                message('Đang thử nhập lại số cũ')
                                                
                                                const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.set_contact_point.submit&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                                    "headers": {
                                                        "accept": "*/*",
                                                        "accept-language": "en-US,en;q=0.9",
                                                        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                                        "dpr": "0.9",
                                                        "sec-ch-prefers-color-scheme": "light",
                                                        "sec-fetch-dest": "empty",
                                                        "sec-fetch-mode": "cors",
                                                        "sec-fetch-site": "same-origin",
                                                        "viewport-width": "805",
                                                        "user-agent": this.UA,
                                                        "cookie": this.options.headers.cookie,
                                                        "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                                        "Referrer-Policy": "strict-origin-when-cross-origin"
                                                    },
                                                    "agent": this.options.agent,
                                                    "body": "__d=www&__user=0&__a=1&__req=7&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010660656&__s=5dzwqu%3A96t994%3Araushu&__hsi=7320111898954618919&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gxNdq999bLnlFG8mEASHCKKbBGZ4h8OUyHAAVo98pxm3i7Ey4F4dBBxmaAxGFFoWEkDy89EKexF5z8iKm3y48qxa00iVgw052Gaw4JBw3HE1aiet02rU24Bkw1Koby0&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26255&lsd=IzBDHqLngAXRrJnsfdjSjN&__spin_r=1010660656&__spin_b=trunk&__spin_t=1704346365&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22168227330500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22168227330500018%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22contact_point%5C%22%3A%5C%22VN+%2B"+phone.number+"%5C%22%7D%7D%22%7D",
                                                    "method": "POST"
                                                })

                                                const resData = await res.text()

                                                if (resData.includes('com.bloks.www.checkpoint.ufac.contact_point.submit_code')) {

                                                    await delayTimeout(5000)

                                                    message('Đang thử nhập lại code cũ')

                                                    const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.submit_code&type=action&__bkv=50e6c792f7a391f775258eccaa28c4e49a6586704421bd42a366ce4e9523984e", {
                                                        "headers": {
                                                            "accept": "*/*",
                                                            "accept-language": "en-US,en;q=0.9",
                                                            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                                            "dpr": "0.9",
                                                            "sec-ch-prefers-color-scheme": "light",
                                                            "sec-fetch-dest": "empty",
                                                            "sec-fetch-mode": "cors",
                                                            "sec-fetch-site": "same-origin",
                                                            "viewport-width": "805",
                                                            "user-agent": this.UA,
                                                            "cookie": this.options.headers.cookie,
                                                            "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                                            "Referrer-Policy": "strict-origin-when-cross-origin"
                                                        },
                                                        "agent": this.options.agent,
                                                        "body": "__d=www&__user=0&__a=1&__req=9&__hs=19726.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010659322&__s=0ugmsw%3Ajsxq69%3A57lu3m&__hsi=7320093099675678385&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gBeOsZSyBSg-iheVABGFeXChA8GZ6y8y8JK8Uboixa14zoO31uWga8yiiqbG4UyaBxXxKim5rBx2awSxK68-00iVbo053a9w4Ig0WS0iOqt2pk0bzEK0R82_wkJw&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26281&lsd=_0VAKbPPU8wPmrqDUbvCpv&__spin_r=1010659322&__spin_b=trunk&__spin_t=1704341988&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%22152471553000000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22153144509100021%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22captcha_code%5C%22%3A%5C%22"+code+"%5C%22%7D%7D%22%7D",
                                                        "method": "POST"
                                                    })

                                                    const resData = await res.text()

                                                    if (resData.includes('com.bloks.www.checkpoint.ufac.complete_outro') || resData.includes('com.bloks.www.checkpoint.ufac.poll_ufac_api')) {
                                                        message('Thêm số điện thoại thành công')

                                                        addCodeSuccess = true
                                                    }

                                                }

                                            }

                                        }

                                    }
                                    

                                } catch (err) {
                                    console.log(err)
                                }

                                if (addCodeSuccess) {

                                    phoneStepSuccess = true

                                    break

                                } else {

                                    await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.contact_point.unset&type=action&__bkv=8bcb2010987ce0d8b367374a0209e1091fb2aa0a8484f307015f2f19cecd4eab", {
                                        "headers": {
                                            "accept": "*/*",
                                            "accept-language": "en-US,en;q=0.9",
                                            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                            "dpr": "0.9",
                                            "sec-ch-prefers-color-scheme": "light",
                                            "sec-fetch-dest": "empty",
                                            "sec-fetch-mode": "cors",
                                            "sec-fetch-site": "same-origin",
                                            "viewport-width": "805",
                                            "user-agent": this.UA,
                                            "cookie": this.options.headers.cookie,
                                            "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                            "Referrer-Policy": "strict-origin-when-cross-origin"
                                        },
                                        "agent": this.options.agent,
                                        "body": "__d=www&__user=0&__a=1&__req=8&__hs=19735.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010814782&__s=nulles%3Ax9csab%3A5vznx6&__hsi=7323550084908100305&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=iNBj_cOqrObrrGihALzbFCBEFrFkqmBy9pFoKerjGum5ElxG14Kfwyy8VxyE-cgsUPCyUsK6qCimexW3qEuy8bogw04Je801eUw5Pzo10i03G2a441cw7UwaGhS0sW420&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26289&lsd=C6EbQdGiKftVY_isqdlnA6&__spin_r=1010814782&__spin_b=trunk&__spin_t=1705146880&__jssesw=1&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%222585262500000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%222585262500021%5C%22%7D%7D%22%7D",
                                        "method": "POST"
                                    })
                                    
                                }
                            }
                        }

                        if (setting.general.phoneService.value === 'custom' && phone.id) {

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

                    // if (!phoneStepSuccess) {

                    //     html = await getState()

                    //     console.log(html)

                    // }

                    if (phoneStepSuccess) {
                        html = await getState()
                    } else {

                        if (addPhoneError) {
                            message('Thêm số điện thoại thất bại: '+addPhoneError)
                        } else {
                            message('Thêm số điện thoại thất bại')
                        }

                        stopped = true

                        html = await getState()

                        if (!html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_identity_verification_photo') && !html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_selfie')) {
                            return reject()
                        }
                        
                    }
                }

                const photoStep = html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_identity_verification_photo') || html.includes('com.bloks.www.checkpoint.ufac.image_upload.upload_selfie')

                if (photoStep) {

                    message('Đang tạo phôi')

                    try {

                        const phoiTemplate = path.resolve(app.getPath('userData'), 'phoi/'+setting.general.phoiTemplate.value)

                        if (!fs.existsSync(phoiTemplate)) {

                            message('Không thể load phôi')
                            return reject()
                        }

                        const name = await randomName()

                        const genders = ["Male", "Female"]

                        const random = Math.floor(Math.random() * genders.length)
                        const gender = genders[random]

                        const textData = {
                            firstName: name.ho,
                            lastName: name.ten,
                            fullName: name.ho+' '+name.ten,
                            birthday: randomNumberRange(1, 25)+'/'+randomNumberRange(1, 12)+'/'+randomNumberRange(1990, 2005),
                            gender,
                        }
                    
                        const base64 = await taoPhoi(textData, phoiTemplate, '', true)
                        
                        const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.checkpoint.ufac.image_upload.upload_identity_verification_photo&type=action&__bkv=8bcb2010987ce0d8b367374a0209e1091fb2aa0a8484f307015f2f19cecd4eab", {
                            "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9",
                                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                "dpr": "0.9",
                                "sec-ch-prefers-color-scheme": "light",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "viewport-width": "805",
                                "user-agent": this.UA,
                                "cookie": this.options.headers.cookie,
                                "Referer": "https://www.instagram.com/accounts/suspended/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_ufac%3D1",
                                "Referrer-Policy": "strict-origin-when-cross-origin"
                            },
                            "agent": this.options.agent,
                            "body": "__d=www&__user=0&__a=1&__req=7&__hs=19735.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010815100&__s=7ap80d%3A4c7f6n%3Axeh00j&__hsi=7323564868751105828&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU29zEdEc8co2qwJw5ux609vCwjE1xoswIwuo2awt81s8hwnU6a3a1YwBgao6C0Mo2sx-0z8jwae4UaEW2G1NwwwNwKwHw8Xwn82Lx-0iS2S3qazo7u1xwIwbS1LwTwKG0L85C1Iwqo5q1IQp1yUowgV8&__csr=gwJsRiOqG_RiqaWheUyVAr_Q-8VkJaWCm599HzFp9Hm9y8uxy3y488UpUijF16cDxe48oHUG6HLKUy8xa9w_G2x0Nxu00iQIw04Xy0nedw4180eE8Egg4O0vy0GF7o1PEg8&__comet_req=7&fb_dtsg="+dtsg+"&jazoest=26290&lsd=jOZl9qCG-LdwuEOPMgWJQw&__spin_r=1010815100&__spin_b=trunk&__spin_t=1705150322&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22challenge_root_id%5C%22%3A%5C%2214975705000000%5C%22%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%2214975705000014%5C%22%7D%2C%5C%22client_input_params%5C%22%3A%7B%5C%22binary_image_data%5C%22%3A%5C%22"+encodeURIComponent(base64.replace('data:image/png;base64,', ''))+"%5C%22%7D%7D%22%7D",
                            "method": "POST"
                        })

                        const resData = await res.text()

                        if (resData.includes('com.bloks.www.checkpoint.ufac.refresh_ufac_state')) {
                            message('Upload phôi thành công')
                        } else {
                            message('Upload phôi thất bại')
                            stopped = true
                            return reject()
                        }

                        
                    } catch (err) {

                        message('Upload phôi thất bại')
                        stopped = true
                        return reject()
                    }

                }

                html = await getState()

                const reviewStep = html.includes('awaiting_review_ui_state')

                if (reviewStep) {

                    message('Kháng 282 thành công')
                    khang282Success = true

                }

            }

            stopped = true

            if (khang282Success) {
                resolve()
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
        }

    })}

    moCpMail(message) {return new Promise(async (resolve, reject) => {

        let success = false
        let error = false

        try {

            message('Đang mở CP mail')

            const username = this.email.split('@')[0]
            const start = username[0]
            const end = username[username.length - 1]

            let finalEmail = start

            for (let index = 0; index < 7; index++) {
                finalEmail += '*'
            }

            finalEmail += end + '@'

            const res = await fetch(this.challenge.replace('/challenge/action/', 'https://www.instagram.com/api/v1/challenge/web/'), {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "dpr": "0.9",
                    "sec-ch-prefers-color-scheme": "light",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "964",
                    "x-asbd-id": "129477",
                    "x-bloks-version-id": "0bb5b087678057c651794cbbee1440d15ff05a72bb9ab6751f3db3862eb4ffd1",
                    "x-csrftoken": this.data.csrf,
                    "x-ig-app-id": "936619743392459",
                    "x-ig-www-claim": "0",
                    "x-requested-with": "XMLHttpRequest",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://www.instagram.com"+this.challenge,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": null,
                "method": "GET"
            })

            const resData = await res.json()

            if (resData.navigation.forward && resData.fields.email.includes(finalEmail)) {

                let emailData = false

                message('Đang lấy email')

                const setting = await getSetting()
                const service = setting.general.tmMailService.value

                if (service === 'emailfake.com' || service === 'generator.email') {

                    emailData = {
                        address: this.email
                    }

                    await deleteFakeEmailInbox(service, emailData, this.proxy)

                }

                if (service === 'moakt.com') {
                    
                    emailData = await getMoAktMail2(this.email, this.options.agent)

                }
                
                const lastMessages = []

                if (service === 'gmx.live') {
                    
                    emailData = {
                        address: this.email,
                        password: this.passMail
                    }

                    try {

                        const res = await fetch("https://gmx.live/login/api.php?login="+this.email+"|"+this.passMail)
                        const $ = cheerio.load(await res.text())

                        $('a').each(function() {
                            lastMessages.push($(this).attr('href'))
                        })

                    } catch (err) {
                    }

                }

                if (emailData) {

                    message('Đang gửi mã kích hoạt')

                    const next = 'https://www.instagram.com'+resData.navigation.forward

                    const res = await fetch(next, {
                        "headers": {
                        "accept": "*/*",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "1",
                        "sec-ch-prefers-color-scheme": "dark",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                        "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"123.0.2420.65\", \"Not:A-Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"123.0.6312.87\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"15.0.0\"",
                        "viewport-width": "640",
                        "x-asbd-id": "129477",
                        "x-csrftoken": this.data.csrf,
                        "x-ig-app-id": "936619743392459",
                        "x-ig-www-claim": "0",
                        "x-instagram-ajax": "1012440337",
                        "x-requested-with": "XMLHttpRequest",
                        "Referrer-Policy": "strict-origin-when-cross-origin",
                        "user-agent": this.UA,
                            "cookie": this.options.headers.cookie,
                        },
                        "body": "choice=1",
                        "method": "POST"
                    })

                    const data = await res.json()

                    if (data.navigation.forward) {

                        message('Đang chờ mã kích hoạt')

                        await delayTimeout(5000)

                        let code = false

                        for (let index = 0; index < 99; index++) {
                            
                            try {

                                let inbox = false

                                if (service === 'gmx.live') {

                                    inbox = await getGmxInboxes(emailData, lastMessages)

                                } else {

                                    inbox = (await getTmMailInbox(emailData, service)).filter(item => item.from.includes('mail.instagram.com'))

                                }

                                if (inbox[0].code) {
                                    code = inbox[0].code

                                    break
                                }

                            } catch (err) {console.log(err)}

                            await delayTimeout(1000)
                            
                        }

                        const next = 'https://www.instagram.com'+data.navigation.forward

                        message('Đang nhập mã kích hoạt')

                        const res = await fetch(next, {
                            "headers": {
                            "accept": "*/*",
                            "content-type": "application/x-www-form-urlencoded",
                            "dpr": "1",
                            "sec-ch-prefers-color-scheme": "dark",
                            "sec-ch-ua": "\"Microsoft Edge\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                            "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"123.0.2420.65\", \"Not:A-Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"123.0.6312.87\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-model": "\"\"",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-ch-ua-platform-version": "\"15.0.0\"",
                            "viewport-width": "640",
                            "x-asbd-id": "129477",
                            "x-csrftoken": this.data.csrf,
                            "x-ig-app-id": "936619743392459",
                            "x-ig-www-claim": "0",
                            "x-instagram-ajax": "1012440337",
                            "x-requested-with": "XMLHttpRequest",
                            "Referrer-Policy": "strict-origin-when-cross-origin",
                            "user-agent": this.UA,
                                "cookie": this.options.headers.cookie,
                            },
                            "body": "security_code="+code,
                            "method": "POST"
                        })

                        const resData = await res.json()

                        if (resData.type === 'CHALLENGE_REDIRECTION') {
                            success = true
                        } else if (resData.challengeType === 'ReviewContactPointChangeForm') {

                            await fetch("https://www.instagram.com/api/v1/bloks/apps/com.instagram.challenge.navigation.take_challenge/", {
                                "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9",
                                "content-type": "application/x-www-form-urlencoded",
                                "dpr": "0.9",
                                "sec-ch-prefers-color-scheme": "light",
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-model": "\"\"",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "sec-ch-ua-platform-version": "\"10.0\"",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "viewport-width": "751",
                                "x-asbd-id": "129477",
                                "x-bloks-version-id": "0bb5b087678057c651794cbbee1440d15ff05a72bb9ab6751f3db3862eb4ffd1",
                                "x-csrftoken": this.data.csrf,
                                "x-ig-app-id": "936619743392459",
                                "x-ig-www-claim": "0",
                                "x-instagram-ajax": "1012445031",
                                "x-requested-with": "XMLHttpRequest",
                                "user-agent": this.UA,
                                "cookie": this.options.headers.cookie,
                                "Referrer-Policy": "strict-origin-when-cross-origin"
                                },
                                "body": "choice=0&is_bloks_web=True&challenge_context="+resData.challenge_context+"&has_follow_up_screens=false&nest_data_manifest=true",
                                "method": "POST"
                            })

                            success = true

                        }
                        

                    }

                    if (emailData.cookie) {
                        await fetch("https://moakt.com/vi/inbox/logout", {
                            "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                            "sec-ch-ua": "\"Microsoft Edge\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "same-origin",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "cookie": emailData.cookie,
                            "Referer": "https://moakt.com/vi/inbox",
                            "Referrer-Policy": "strict-origin-when-cross-origin"
                            },
                            "body": null,
                            "method": "GET"
                        })

                    }

                }

            } else {
                error = 'CP mail khác'
            }

        } catch (err) {
            console.log(err)
        }

        if (success) {
            message('Mở CP mail thành công')
        } else {

            if (error) {
                message('Mở CP mail thất bại: '+error)
            } else {
                message('Mở CP mail thất bại')
            }
            
        }

        resolve()

    })}

    moCpMail2(message) {return new Promise(async (resolve, reject) => {

        let success = false
        let error = false

        try {

            message('Đang mở CP mail')

            const username = this.email.split('@')[0]
            const start = username[0]
            const end = username[username.length - 1]

            let finalEmail = start

            for (let index = 0; index < 7; index++) {
                finalEmail += '*'
            }

            finalEmail += end + '@'

            let emailData = false

            message('Đang lấy email')

            const setting = await getSetting()
            const service = setting.general.tmMailService.value

            if (service === 'emailfake.com' || service === 'generator.email') {

                emailData = {
                    address: this.email
                }

                await deleteFakeEmailInbox(service, emailData, this.proxy)

            }

            if (service === 'moakt.com') {
                
                emailData = await getMoAktMail2(this.email, this.options.agent)

            }

            const lastMessages = []

            if (service === 'gmx.live') {
                
                emailData = {
                    address: this.email,
                    password: this.passMail
                }

                try {

                    const res = await fetch("https://gmx.live/login/api.php?login="+this.email+"|"+this.passMail)
                    const $ = cheerio.load(await res.text())

                    $('a').each(function() {
                        lastMessages.push($(this).attr('href'))
                    })

                } catch (err) {
                }

            }


            if (emailData) {

                message('Đang kiểm tra email')

                const res0 = await fetch("https://www.instagram.com/api/v1/web/accounts/login/ajax/", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-asbd-id": "129477",
                        "x-csrftoken": this.data.csrf,
                        "x-ig-app-id": "936619743392459",
                        "x-ig-www-claim": "0",
                        "x-instagram-ajax": "1017463902",
                        "x-requested-with": "XMLHttpRequest",
                        "user-agent": this.UA,
                        "x-web-device-id": this.data.machineId,
                        "cookie": this.options.headers.cookie,
                        "Referer": "https://www.instagram.com/",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": "enc_password=#PWD_INSTAGRAM_BROWSER:0:1111:"+this.password+"&optIntoOneTap=false&queryParams={}&trustedDeviceRecords={}&username="+this.username,
                    "method": "POST"
                })

                const data = await res0.json()

                const res = await fetch('https://www.instagram.com'+data.checkpoint_url, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "en-US,en;q=0.9",
                        "dpr": "0.8999999761581421",
                        "priority": "u=0, i",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "viewport-width": "447",
                        "user-agent": this.UA,
                        "cookie": this.options.headers.cookie,
                        "Referer": "https://www.instagram.com/",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "redirect": "manual",
                    "agent": this.options.agent,
                    "body": null,
                    "method": "GET"
                })

                const apc = res.headers.get('location').split('?apc=')[1]

                const res2 = await fetch("https://www.instagram.com/api/graphql", {
                    "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-prefers-color-scheme": "light",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-asbd-id": "129477",
                    "x-csrftoken": this.data.csrf,
                    "x-fb-friendly-name": "AuthPlatformCodeEntryViewQuery",
                    "x-fb-lsd": "AVpGnJDVz_E",
                    "x-ig-app-id": "936619743392459",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://www.instagram.com"+data.checkpoint_url,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "agent": this.options.agent,
                    "body": "av=0&__d=www&__user=0&__a=1&__req=1&__hs=20014.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1017463902&__s=rjvuoc%3A8hevj7%3Aokupwq&__hsi=7427059672713304210&__dyn=7xeUmwlE7ibwKBAg5S1Dxu13w8CewSwMwNw9G2S0lW4o0B-q1ew65xO0FE2awt81s8hwnU6a3a1YwBgao6C0Mo2swaO4U2zxe2GewGw9a361qw8Xwn82Lx-0lK3qazo7u1xwIwbS1LwTwKG0hq1Iwqo5p0qZ6goK1sAwHxW1oCwl83fy8C&__csr=nE8SxJdsLtOjuyTWlDKSFeGAGt6DjjXA-itaKV9pGyuVHDy8Z7ocouwTUjG8yUK2fLUyeBUyfBzt2WCUrKRUJ5UbUaUgxqESudUWawwzGxmbyEc8yq9w04Xgg7q04AU1XE0oIw2Byo0K21oyegm0kcE0zFwJwn41RAo1LU1p815k01Xuw&__comet_req=7&lsd=AVpGnJDVz_E&jazoest=2958&__spin_r=1017463902&__spin_b=trunk&__spin_t=1729247084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AuthPlatformCodeEntryViewQuery&variables=%7B%22apc%22%3A%22"+apc+"%22%7D&server_timestamps=true&doc_id=8116657765045978",
                    "method": "POST"
                })

                const resData = await res2.text()

                if (resData.includes(finalEmail)) {

                    message('Đang chờ mã kích hoạt')      
                    
                    let code = false

                    for (let index = 0; index < 99; index++) {
                        
                        try {

                            let inbox = false

                            if (service === 'gmx.live') {

                                inbox = await getGmxInboxes(emailData, lastMessages)

                            } else {

                                inbox = (await getTmMailInbox(emailData, service)).filter(item => item.from.includes('mail.instagram.com'))

                            }

                            if (inbox[0].code) {
                                code = inbox[0].code

                                break
                            }

                        } catch (err) {}

                        await delayTimeout(1000)
                        
                    }

                    message('Đang nhập mã kích hoạt')

                    const res = await fetch("https://www.instagram.com/api/graphql", {
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
                          "x-csrftoken": this.data.csrf,
                          "x-fb-friendly-name": "useAuthPlatformSubmitCodeMutation",
                          "x-fb-lsd": "AVqjAn5ywhA",
                          "x-ig-app-id": "936619743392459",
                          "cookie": this.options.headers.cookie,
                          "user-agent": this.UA,
                          "Referer": "https://www.instagram.com"+data.checkpoint_url,
                          "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "body": "av=0&__d=www&__user=0&__a=1&__req=9&__hs=20014.HYP%3Ainstagram_web_pkg.2.1..0.0&dpr=1&__ccg=UNKNOWN&__rev=1017465220&__s=hdxpry%3Ayyy7ts%3A68f1g9&__hsi=7427093164760971808&__dyn=7xeUmwlE7ibwKBAg5S1Dxu13w8CewSwMwNw9G2S0lW4o0B-q1ew65xO0FE2awt81s8hwnU6a3a1YwBgao6C0Mo2swaO4U2zxe2GewGw9a361qw8Xwn82Lx-0lK3qazo7u1xwIwbS1LwTwKG0hq1Iwqo5p0qZ6goK1sAwHxW1oCwl83fy8C&__csr=ilMzdbAdqnkltsAGiqAngJeXngkBHt6LAClV4Wz8zgOEWt2Ezyo_wRxa9wXhox1iuuayohCxO9umuFu4F96po-2ibU-i2G4oWEjxB4xe217xeqm12LAw04Xmg7u04AU1Xo0oGw2yoMw0GW0xFFRC4w55a08Wobo5iu1wy8Gq0r60ni0hl00uR8&__comet_req=7&lsd=AVqjAn5ywhA&jazoest=21007&__spin_r=1017465220&__spin_b=trunk&__spin_t=1729254882&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useAuthPlatformSubmitCodeMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%224%22%2C%22actor_id%22%3A%220%22%2C%22code%22%3A%22"+code+"%22%2C%22encrypted_ap_context%22%3A%22"+apc+"%22%7D%7D&server_timestamps=true&doc_id=8104104852955856",
                        "method": "POST"
                    })

                    const resData = await res.text()

                    if (resData.includes('"error_message":null')) {
                        success = true
                    }

                    if (emailData.cookie) {

                        await fetch("https://moakt.com/vi/inbox/logout", {
                            "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                            "sec-ch-ua": "\"Microsoft Edge\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "same-origin",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "cookie": emailData.cookie,
                            "Referer": "https://moakt.com/vi/inbox",
                            "Referrer-Policy": "strict-origin-when-cross-origin"
                            },
                            "body": null,
                            "method": "GET"
                        })

                    }

                } else {
                    error = 'CP mail khác'
                }

            } else {

                error = 'Không lấy được email'

            }

        } catch (err) {
            console.log(err)
        }

        if (success) {
            message('Mở CP mail thành công')
        } else {

            if (error) {
                message('Mở CP mail thất bại: '+error)
            } else {
                message('Mở CP mail thất bại')
            }
            
        }

        resolve()

    })}

    convertAccount(type) { return new Promise(async (resolve, reject) => {
        try {

            const res = await fetch("https://www.instagram.com/api/v1/business/account/convert_account/", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "vi",
                    "content-type": "application/x-www-form-urlencoded",
                    "dpr": "1",
                    "sec-ch-prefers-color-scheme": "dark",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Microsoft Edge\";v=\"120\"",
                    "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.217\", \"Microsoft Edge\";v=\"120.0.2210.133\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"15.0.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "565",
                    "x-asbd-id": "129477",
                    "x-csrftoken": this.data.csrf,
                    "x-ig-app-id": "936619743392459",
                    "x-ig-www-claim": this.data.claim,
                    "x-instagram-ajax": "1010858910",
                    "x-requested-with": "XMLHttpRequest",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://www.instagram.com/accounts/convert_to_professional_account/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": "category_id=150108431712141&create_business_id=true&entry_point=ig_web_settings&set_public=true&should_bypass_contact_check=true&should_show_category=0&to_account_type="+type,
                "method": "POST"
            })

            const resData = await res.json()

            console.log(resData)

            if (resData.user.account_type === type) {
                resolve(resData.user.fbid_v2)
            } else {
                reject()
            }

        } catch {
            reject()
        }
    })}

    khangAd() { return new Promise(async (resolve, reject) => {

        try {
            const res = await fetch("https://help.instagram.com/ajax/help/contact/submit/page", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",
                    "dpr": "0.9",
                    "sec-ch-prefers-color-scheme": "light",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.225\", \"Google Chrome\";v=\"120.0.6099.225\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"10.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "817",
                    "x-asbd-id": "129477",
                    "x-fb-lsd": "bZ1EBRkr4zSlDmmtiyt6xm",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://help.instagram.com/contact/534180673793883",
                    "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": "jazoest=26541&fb_dtsg="+this.dtsg+"&more_details=Xin%20h%C3%A3y%20m%E1%BB%9F%20kh%C3%B3a%20t%C3%A0i%20kho%E1%BA%A3n%20cho%20t%C3%B4i&support_form_id=534180673793883&support_form_locale_id=en_US&support_form_hidden_fields=%7B%7D&support_form_fact_false_fields=[]&__user=0&__a=1&__req=5&__hs=19741.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1010904360&__s=z29asj%3Au1ys4v%3Aucx9ow&__hsi=7325702681051758717&__dyn=7xe6E5aQ1PyUbFp61swgE98nwgU6C7UW8xi642-7E2vwXw5ux60Vo1upE4W0OE2WxO2O1Vwooa81VohwnU1e42C220qu1Tw40wdq0Ho2ewnE3fw6iw4vwbS1Lw4Cwcq0mW&__csr=&lsd=bZ1EBRkr4zSlDmmtiyt6xm&__spin_r=1010904360&__spin_b=trunk&__spin_t=1705648070&confirmed=1",
                "method": "POST"
            })

            const resData = JSON.parse((await res.text()).replace('for (;;);', ''))

            if (!resData.error) {
                resolve()
            } else {
                reject()
            }

        } catch {
            reject()
        }

    })}

    loadAd(message) { return new Promise(async (resolve, reject) => {

        let success = false

        for (let index = 0; index < 10; index++) {

            message('Load Ads lần '+(index + 1))

            try {

                const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.ig_promote.prevalidation.async_controller&type=action&__bkv=1bf9937bd4fb199207adc8ce2df56c40f8e609ccb27ee39c41d840e3bf8be07f", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "cookie": this.options.headers.cookie,
                        "dpr": "2.25",
                        "User-Agent": this.UA1,
                        "origin": "https://www.instagram.com",
                        "referer": "https://www.instagram.com/"+this.username+"/",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
                        "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"117.0.5938.150\", \"Not;A=Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"117.0.5938.150\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform-version": "\"10.0.0\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "1139",
                    },
                    "agent": this.options.agent,
                    "body": "__d=www&__user=0&__a=1&__req=m&__hs=19644.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=3&__ccg=UNKNOWN&__rev=1009254376&__s=2bj5um%3Am0bw65%3Abzou4w&__hsi=7289938419414787655&__dyn=7xeUmwlEnwn8K2WnFw9-2i5U4e1ZyUW3qi2K360CEbotw50x609vCwjE1xoswIwuo2awlU-cw5Mx62G3i1ywOwv89k2C1Fwc60D8vw8OfK0EUjwGzEaE7622362W2K0zK5o4q3y1Sx_w4HwJwSyES1Twoob82cwMwrUdUbGwmk1xwmo6O1FwlE6OFA6bw&__csr=g8clllkpqvnPl_SJ9fTl9RIFkp5_FultuXnB9UCmvai4aBGAAl6h8yaUkBWyuqinjjGJ7BKeAykZQUCQbQnDjBLGmunAwAyoOUpDxiaw04jogtwg40gKdw9S0ckqxW02ke7E410gEmP0pAcwsm7E0UO3lwGw5fe048Pw33Q01zHw3xE&__comet_req=7&fb_dtsg="+this.dtsg+"&jazoest=26096&lsd=v_SG6wcGDd-cM20QM2wiyd&__spin_r=1009254376&__spin_b=trunk&__spin_t=1697321054&params=%7B%22params%22%3A%22%7B%5C%22server_params%5C%22%3A%7B%5C%22step%5C%22%3A%5C%22inline_resolution%5C%22%2C%5C%22entry_point%5C%22%3A%5C%22profile%5C%22%2C%5C%22flow%5C%22%3A%5C%22boost_on_web_prevalidation%5C%22%2C%5C%22flow_id%5C%22%3A%5C%22"+uuidv4()+"%5C%22%2C%5C%22promote_prevalidation_asset_exceptions%5C%22%3A%5B%5C%22promote_default_ad_account_does_not_exist_exception%5C%22%2C%5C%22promote_link_settings_does_not_exist_exception%5C%22%5D%2C%5C%22INTERNAL__latency_qpl_marker_id%5C%22%3A36707139%2C%5C%22INTERNAL__latency_qpl_instance_id%5C%22%3A%5C%22127825800900005%5C%22%7D%7D%22%7D",
                    "method": "POST"
                })

            } catch {}

            await delayTimeout(2000)

            try {

                const flowId = uuidv4()

                const res2 = await fetch("https://www.instagram.com/api/graphql", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "0.9",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "383",
                        "x-asbd-id": "129477",
                        "x-csrftoken": this.data.csrf,
                        "x-fb-friendly-name": "usePolarisAdToolsDefaultAdAccountQuery",
                        "x-fb-lsd": "4zZhAlfG1Kj7YP2wOTKLuL",
                        "x-ig-app-id": "936619743392459",
                        "Referer": "https://www.instagram.com/ad_tools/?next=%2F&context=ad_tools_cta&flow_id="+flowId,
                        "Referrer-Policy": "strict-origin-when-cross-origin",
                        "User-Agent": this.UA2,
                        "cookie": this.options.headers.cookie,
                    },
                    "agent": this.options.agent,
                    "body": "av="+this.actorID+"&__d=www&__user=0&__a=1&__req=r&__hs=19750.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1011068914&__s=8j7qvd%3Asbtgg0%3Ac7uj7e&__hsi=7328995368782302859&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU7SbzEdF8aUco2qwJxS0k24o0B-q1ew65xO2O1Vw8G1nzUO0n24oaEd86a3a1YwBgao6C0Mo2sx-0z8-U2zxe2GewGwso88cobEaU2eUlwhEe87q7U1bobpEbUGdG1QwTwFwIw8O321LwTwKG1pg661pwr86C1mwrd6goK68jxeUnAw&__csr=g9dRf49hniTdr98RArO8DdqhGiQQnGjTKFF2fiiK4V_KumbjzHVGAWZFq8EKFEZJ5KFWmKiKAamtnBy8PJeUgUymlVF48AGGRxCiUC4EsyrGm5Eog01bZqx106Ag0clE0kUg3ow8UzDg9N4w2TU0iGDgChwjbyE4C09sDgCl0c-0hW4Zw9y2J00aq6&__comet_req=7&fb_dtsg="+this.dtsg+"&jazoest=26189&lsd=4zZhAlfG1Kj7YP2wOTKLuL&__spin_r=1011068914&__spin_b=trunk&__spin_t=1706414709&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=usePolarisAdToolsDefaultAdAccountQuery&variables=%7B%22flowID%22%3A%22"+flowId+"%22%7D&server_timestamps=true&doc_id=6777423459022769",
                    "method": "POST"
                })

                const data2 = await res2.text()

                if (data2.includes('INSTAGRAM_BACKED_ADS')) {
                    success = true
                    break
                }

            } catch {}

            await delayTimeout(2000)

        }

        if (success) {
            resolve()
        } else {
            reject()
        }

    })}

    checkMedia() { return new Promise(async (resolve, reject) => {
        try {
          const res = await fetch("https://www.instagram.com/graphql/query", {
            headers: {
              "accept": "*/*",
              "accept-language": "en-US,en;q=0.9",
              "content-type": "application/x-www-form-urlencoded",
              "priority": "u=1, i",
              "sec-ch-prefers-color-scheme": "light",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-asbd-id": "359341",
              "x-bloks-version-id": "583b7d883d9edbdacc73cd8be5ead22144deee62d92644d8b0823de4d07fee17",
              "x-csrftoken": this.data.csrf,
              "x-fb-friendly-name": "PolarisProfilePageContentQuery",
              "x-fb-lsd": "r6se4-Q8WBYqYrKdKn7hbp",
              "x-ig-app-id": "936619743392459",
              "user-agent": this.UA,
              "cookie": this.options.headers.cookie,
              "Referer": "https://www.instagram.com/",
              "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            agent: this.options.agent,
            body: "av=" + this.actorID + "&__d=www&__user=0&__a=1&__req=4&__hs=20157.HYP%3Ainstagram_web_pkg.2.1...1&dpr=1&__ccg=EXCELLENT&__rev=1020732599&__s=07p4wh%3Adij0ua%3Araqn19&__hsi=7480052551582897940&__dyn=7xe5WwlEnwn8K2Wmm1twpUnwgU7S6EeUaUco38w5ux609vCwjE1EE2Cw8G11wBw5Zx62G3i1ywOwa90Fw4Hw9O0Lbwae4UaEW2G0AEco5G0zEnwhE0Caazo7u1xwIwbS1LwTwKG0hq1Iwqo5q1IQp1yU426V8aUuwm8jxK2K0P8Km5o&__csr=hk5P3Jil6-z_9-h2VHWOenmji9FprWKUNGGhlgGQ8Ax1a-Am8F_UOCEWrGiS9BypaxeUWiiVGG-6Eqm48boiy8C3-6kSfyoGeypVo89oF38co-u6VQbBw04Nuw5dhpQ089w4dx4St2r80Po12FK0lS2S0dfw18K0bry8Bk2q2qfwcm3Dw4yCwBDg4Lw4Dwo8510bive4Q0iS2K3a13w085y05hU&__hsdp=&__hblp=&__comet_req=7&fb_dtsg=" + this.dtsg + "&jazoest=26340&lsd=r6se4-Q8WBYqYrKdKn7hbp&__spin_r=1020732599&__spin_b=trunk&__spin_t=1741585450&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisProfilePageContentQuery&variables=%7B%22id%22%3A%22"+this.instaId+"%22%2C%22render_surface%22%3A%22PROFILE%22%7D&server_timestamps=true&doc_id=9109150515847101",
            method: "POST"
          });
    
          const data = await res.json();
    
          if (data.data.user.has_profile_pic === true && data.data.user.media_count > 0) {
            resolve()
          } else if (data.data.user.has_profile_pic === false && data.data.user.media_count > 0) {
            reject('Thiếu Avatar')
          } else if (data.data.user.has_profile_pic === true && data.data.user.media_count === 0) {
            reject('Thiếu Post')
          } else if (data.data.user.has_profile_pic === false && data.data.user.media_count === 0) {
            reject('Chưa Up Gì Cả')
          } else {
            reject(false)
          }
        } catch (err) {

            console.log(err)
          reject(false)
        }
      });
    }
    checkDong() {return new Promise(async (resolve, reject) => {
        try {

            const res = await fetch("https://www.instagram.com/async/wbloks/fetch/?appid=com.bloks.www.async.components.BloksProToProFrameworkBoostFBAuthDisclosureComponentQuery&type=app&__bkv=e7c968a852c20a5809af0f132c00310b0f6e633456328181b298a8955b4764e8", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "en-US,en;q=0.9",
                  "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                  "priority": "u=1, i",
                  "sec-ch-prefers-color-scheme": "light",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "user-agent": this.UA,
                  "cookie": this.options.headers.cookie,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": "__d=www&__user=0&__a=1&__req=1g&__hs=20173.HYP%3Ainstagram_web_pkg.2.1...1&dpr=1&__ccg=EXCELLENT&__rev=1021261779&__s=ieerjz%3Av0rliv%3A08jx55&__hsi=7486032734896221715&__dyn=7xeUjG1mxu1syUbFp41twpUnwgU7SbzEdF8aUco2qwJxS0DU2wx609vCwjE1EE2Cw8G11wBz81s8hwGxu786a3a1YwBgao6C0Mo2swaOfK0EUjwGzEaE2iwNwmE2eUlwhEe87q0oa2-azqwt8d-2u2J0bS1LwTwKG1pg2fwxyo6O1FwlEcUed6goK10K5V8aUuwm8jxK2K0P8KmU&__csr=gL0yMB3kgzNYORLOQzFsBkD9A9XDZbSRjFaQQmEBqmWzKm8LAADhUjh8G9gzipF9WBupbiiHiCAO7yVQUycyd7JqjcmeAmcykdVoSEOFHzUhxmqqECAmEFeeBG8mXVojlBDximl4G5EeUKfwCwDwKwm9VE8U01fpW80h-iRKu4Ee8C0ykElAPxm19g4Lx8w1AGzm0wEdrG1Iw3ZU0k6weKewhmidg5SV4V41TgK4Xg1xUDt055wSwMa1vg987a3d0kUK0Cpk0EU0gmgqdDw3Ub801m2w12i0WE&__comet_req=7&fb_dtsg="+this.dtsg+"&jazoest=26204&lsd=bK47gcs9AkpsYyEyjFvY0S&__spin_r=1021261779&__spin_b=trunk&__spin_t=1742977819&params=%7B%22entry_point%22%3A%22ads_manager_suggested_post%22%2C%22flow%22%3A%22pro2pro_framework_boost_on_web_flow%22%2C%22flow_id%22%3A%224d29e2ff-96ca-409b-9ce7-fd7eb200a92d%22%2C%22custom_parameters%22%3A%7B%22open_promote_uri%22%3A%22%2Fb%2F3507201398113563150%2F%3Fcontext%3Dads_manager_suggested_post%26flow_id%3D4d29e2ff-96ca-409b-9ce7-fd7eb200a92d%26promote_flow_type%3Doriginal_promote%26return_path%3D%252Fad_tools%252F%253Fcontext%253Dmain_navigation%2526flow_id%253D99730746-5731-4f2f-8552-8a419150b20a%22%7D%2C%22previous_step%22%3A%22pro2pro_framework%3Ascreen%3Afb_auth_disclosure%3Aentry%22%7D",
                "method": "POST"
              })

              const data = JSON.parse((await res.text()).replace('for (;;);', ''))

              try {
                
                const check = data.payload.components[0].payload.layout.bloks_payload.embedded_payloads[0].payload.layout.bloks_payload

                resolve('2 dòng')

              } catch {

                resolve('1 dòng')

              }
            
        } catch (err) {

            console.log(err)

            reject()
        }
    })}

    checkAd() { return new Promise(async (resolve, reject) => {

        try {

            const res = await fetch("https://www.instagram.com/api/graphql", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",
                    "dpr": "0.9",
                    "sec-ch-prefers-color-scheme": "light",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "1890",
                    "x-asbd-id": "129477",
                    "x-csrftoken": this.data.csrf,
                    "x-fb-friendly-name": "PolarisBoostCanSkipPro2ProQuery",
                    "x-fb-lsd": "GWsSOcPx4NfStBdmLuJbA0",
                    "x-ig-app-id": "936619743392459",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://www.instagram.com/p/C2Ng6O9ykTn/?next=%2F",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": "av="+this.actorID+"&__d=www&__user=0&__a=1&__req=y&__hs=19739.HYP%3Ainstagram_web_pkg.2.1..0.1&dpr=1&__ccg=UNKNOWN&__rev=1010859960&__s=npnh8m%3Afzkfmh%3Afafq6c&__hsi=7325133387054014605&__dyn=7xeUjG1mxu1syUbFp60DU98nwgU7SbzEdF8aUco2qwJxS0k24o0B-q1ew65xO2O1Vw8G1nzUO0n24oaEd86a3a1YwBgao6C0Mo2sx-0z8-U2zxe2GewGwso88cobEaU2eUlwhEe87q7U1bobpEbUGdG1QwTwFwIw8O321LwTwKG1pg661pwr86C1mwrd6goK68jxeUnAw&__csr=gB0D8Blb5v6jYhPblPvQBqvFTiSldnFh5d99kRBmRtTuVeAjG9VA54EXAWUy4nGvB8XGupbDhryKAjGF-Q9UKgGG8zlp9p8GZ6ArGFKFoCUOuemEhGcKbzXx5oSbK2200iTd08pa480l1807t80llEIN2yFE882jwloO2mbwro2Gg0Ua0hWac1I8J3o17E2Bwj6it2o1AUhxe0h50e200Eco&__comet_req=7&fb_dtsg="+this.dtsg+"&jazoest=26456&lsd=GWsSOcPx4NfStBdmLuJbA0&__spin_r=1010859960&__spin_b=trunk&__spin_t=1705515520&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisBoostCanSkipPro2ProQuery&variables=%7B%22platform%22%3A%22WEB%22%2C%22entrypoint%22%3A%22selfProfilePageModal%22%7D&server_timestamps=true&doc_id=6844670978909501",
                "method": "POST"
            })

            const data = await res.json()

            if (data.data.ig_professional_cache.can_user_skip_pro_identity_setup) {
                resolve()
            } else {
                reject()
            }

        } catch {
            reject()
        }

    })}

    connect(via) { return new Promise(async (resolve, reject) => {

        let success = false

        try {

            const res = await fetch("https://business.facebook.com/business_user/oauth/state/?type=1", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "en-US,en;q=0.9",
                  "content-type": "application/x-www-form-urlencoded",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-asbd-id": "129477",
                  "x-fb-lsd": "Y5EoJ5Fiia9uCcqNd-O4-2",
                  "user-agent": this.UA,
                  "cookie": via.cookies,
                  "Referer": "https://business.facebook.com/settings/",
                  "Referrer-Policy": "origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": "__usid=6-Ts7g3s0lt4bfs%3APs7g3s018cp1kf%3A0-As7g3rl1yyfzy0-RV%3D6%3AF%3D&__user="+via.id+"&__a=1&__req=m&__hs=19740.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010880810&__s=t4qarz%3A4jsfmd%3Ac673bf&__hsi=7325331431356298850&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o2vwOxa7FEd89EmwoU9FE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WElUScwuEnw8ScwgECu7E422a3Fe6rwnVU8FE9k2B12ewi8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAxK4U-dwKwHxa1ozFUK1gzpA6EfEObwAzUkGum2ym2WEdEO8wl8hyVEKu9zUbVEHyU8U3yDwqU4C1Lx3wlFbwCwiUWqU9E5C1dxW6U98a85O0FU&__csr=&fb_dtsg="+via.dtsg+"&jazoest=25349&lsd=Y5EoJ5Fiia9uCcqNd-O4-2&__aaid=0&__bid="+via.bmId+"&__spin_r=1010880810&__spin_b=trunk&__spin_t=1705561632&__jssesw=1",
                "method": "POST"
            })

            const data = JSON.parse( (await res.text()).replace('for (;;);', '') )
            
            if (data.payload.state) {

                const res = await fetch("https://www.instagram.com/oauth/authorize/?redirect_uri=https%3A%2F%2Fbusiness.facebook.com%2Fbusiness%2Finstagram%2Fclaim%2Foauth%2F&app_id=532380490911317&response_type=code&state=%7B%22nonce%22%3A%22"+data.payload.state+"%22%2C%22require_professional%22%3Atrue%7D&logger_id="+uuidv4(), {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "en-US,en;q=0.9",
                        "dpr": "0.8999999761581421",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"10.0\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "viewport-width": "1036",
                        "user-agent": this.UA,
                        "cookie": this.options.headers.cookie,
                        "Referer": "https://www.instagram.com/accounts/onetap/?next=%2Foauth%2Fauthorize%2F%3Fredirect_uri%3Dhttps%3A%2F%2Fbusiness.facebook.com%2Fbusiness%2Finstagram%2Fclaim%2Foauth%2F%26app_id%3D532380490911317%26response_type%3Dcode%26state%3D%257B%2522nonce%2522%3A%2522"+data.payload.state+"%2522%2C%2522require_professional%2522%3Atrue%257D%26logger_id%3D"+uuidv4(),
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "agent": this.options.agent,
                    "body": null,
                    "method": "GET"
                })

                const url1 = new URL(res.url)
                const url2 = new URL(decodeURIComponent(url1.searchParams.get('next')))
                const code = url2.searchParams.get('code')

                if (code) {

                    const res = await fetch("https://business.facebook.com/business/instagram/claim/update/", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-asbd-id": "129477",
                            "x-fb-lsd": "tP8mlbOYDV2DU2kmrM02_a",
                            "user-agent": this.UA,
                            "cookie": via.cookies,
                            "Referer": "https://business.facebook.com/settings/instagram-account-v2s?business_id="+via.bmId,
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "agent": this.options.agent,
                        "body": "business_id="+via.bmId+"&code="+code+"&confirmed=false&ig_access_token&ig_oidc_token&ig_perms_tos_version=1&should_set_batr=false&entry_point=business_manager_settings_instagram_accounts&__usid=6-Ts7gdsa13pagan%3APs7gds81xqo1in%3A0-As7gds11f7uo8p-RV%3D6%3AF%3D&__user="+via.id+"&__a=1&__req=q&__hs=19740.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010881913&__s=ppjeer%3Alw99yh%3Aax8s1u&__hsi=7325387128258744854&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o2vwOxa7FEd89EmwoU9FE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WElUScwuEnw8ScwgECu7E422a3Fe6rwnVU8FE9k2B12ewi8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAxK4U-dwKwHxa1ozFUK1gzpA6EfEObwAzUkGum2ym2WEdEO8wl8hyVEKu9zUbVEHyU8U3yDwqU4C1Lx3wlFbwCwiUWqU9E5C1dxW6U98a85O0FU&__csr=&fb_dtsg="+via.dtsg+"&jazoest=25360&lsd=KhEpa9optJHq1BrLUSUh00&__aaid=0&__bid="+via.bmId+"&__spin_r=1010881913&__spin_b=trunk&__spin_t=1705574600&__jssesw=1",
                        "method": "POST"
                    })

                    const resData = await res.text()
                   
                    if (resData.includes('"payload":{"success":true,"')) {
                        success = true
                    }

                }

            }

        } catch (err) {
            console.log(err)
        }

        if (success) {
            resolve()
        } else {
            reject()
        }

    })}

    changePassword(newPassword) { return new Promise(async (resolve, reject) => {

        try {

            const oldPasswordHash = '#PWD_INSTAGRAM_BROWSER:0:1111:'+this.password
            const newPasswordHash = '#PWD_INSTAGRAM_BROWSER:0:1111:'+newPassword

            const res = await fetch("https://accountscenter.instagram.com/api/graphql/", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "en-US,en;q=0.9",
                  "content-type": "application/x-www-form-urlencoded",
                  "dpr": "0.9",
                  "sec-ch-prefers-color-scheme": "light",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "viewport-width": "1580",
                  "x-asbd-id": "129477",
                  "x-fb-friendly-name": "useFXSettingsChangePasswordMutation",
                  "x-fb-lsd": "ReHw3HhsJod9VgG4VadA4S",
                  "x-ig-app-id": "936619743392459",
                  "user-agent": this.UA,
                  "cookie": this.options.headers.cookie,
                  "Referer": "https://accountscenter.instagram.com/password_and_security/password/change/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": 'av='+this.actorID+'&__user=0&__a=1&__req=s&__hs=19743.HYP:accounts_center_pkg.2.1..0.1&dpr=1&__ccg=EXCELLENT&__rev=1010930879&__s=6myrrw:he1uvu:s339xq&__hsi=7326540155537521578&__dyn=7xeUmwlE7ibwKBAo2vwAxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65wio7C0yE7i0n24o5-0Bo7O2l0Fwqo31w9O7U2cxe0EUjwGzE2swwwNwKwHw8Xwn82Lx-0iS2S3qazo7u0zEiwaG1LwTwNwbO1pwr86C1nw&__csr=ghjl9fsABHTYN4hn4GJt9T8ALQJjvmndOmIyuATZppVTjddbWloxHVpd9dkmyIjjHAhakDyCiv-KRArKiWiF293Hl5iF6JahamKEKrAqqlbqbzVpWy7Ggx6h5G9AVe8x96ltd6ChKHLqTGm-FEyjDmE-8ylz9oSQVAq00joW0cExa0isw1H80bzpF40Ak0aoyqKp3pbCHTCwLHCxC2y5UiGB82LhpA3IzCGljwmo6qnAUl81oXodkUby0PyOa463K9BACgHgdENw7ugVe0Uo&__comet_req=24&fb_dtsg='+this.dtsg+'&jazoest=26362&lsd=ReHw3HhsJod9VgG4VadA4S&__spin_r=1010930879&__spin_b=trunk&__spin_t=1705843060&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useFXSettingsChangePasswordMutation&variables={"account_id":"'+this.actorID+'","account_type":"INSTAGRAM","current_password_enc":{"sensitive_string_value":"'+oldPasswordHash+'"},"new_password_enc":{"sensitive_string_value":"'+newPasswordHash+'"},"new_password_confirm_enc":{"sensitive_string_value":"'+newPasswordHash+'"},"client_mutation_id":"'+uuidv4()+'"}&server_timestamps=true&doc_id=4872350656193366',
                "method": "POST"
            })

            const resData = await res.json()

            if (resData.data.xfb_change_password.success) {
                resolve()
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
            reject()
        }

    })}

    changeEmail(message) { return new Promise(async (resolve, reject) => {

        try {

            const setting = await getSetting()

            const service = setting.general.tmMailService.value
            let domain = ''


            if (service === 'emailfake.com') {
                domain = setting.general.emailFakeDomain.value
            }

            if (service === 'generator.email') {
                domain = setting.general.generatorEmailDomain.value
            }

            if (service === 'moakt.com') {
                domain = setting.general.moaktDomain.value
            }

            let emailData = false 

            for (let index = 0; index < 10; index++) {

                if (index > 0) {
                    message('Đang thử lấy lại email')
                } else {
                    message('Đang lấy email')
                }
                
                try {

                    emailData = await getTmMail(service, domain)

                    break

                } catch {}
                
            }

            message('Đang nhập email: '+emailData.address)

            const res = await fetch("https://accountscenter.instagram.com/api/graphql/", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                    "content-type": "application/x-www-form-urlencoded",
                    "dpr": "1",
                    "sec-ch-prefers-color-scheme": "dark",
                    "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Microsoft Edge\";v=\"122\"",
                    "sec-ch-ua-full-version-list": "\"Chromium\";v=\"122.0.6261.95\", \"Not(A:Brand\";v=\"24.0.0.0\", \"Microsoft Edge\";v=\"122.0.2365.66\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"15.0.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "1064",
                    "x-asbd-id": "129477",
                    "x-fb-friendly-name": "FXAccountsCenterAddContactPointMutation",
                    "x-fb-lsd": "KVEgAfUjRcTkM9eJzdNbcj",
                    "x-ig-app-id": "936619743392459",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://accountscenter.instagram.com/personal_info/contact_points/?contact_point_type=email&dialog_type=add_contact_point&theme=dark",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": "av="+this.actorID+"&__user=0&__a=1&__req=y&__hs=19791.HYP%3Aaccounts_center_pkg.2.1..0.1&dpr=1&__ccg=EXCELLENT&__rev=1011946474&__s=4i6eye%3Agnt0s8%3A6ppg6s&__hsi=7344198080611464841&__dyn=7xeUmwlEnwn8K2Wmh0cm5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O7U2czXwae4UaEW0D888cobEaU2eU5O0HUvw4JwJwSyES1Tw8W4E2GwrUdUco15E6O1FwlU18ouw&__csr=gWyYJPiTsB9HlahmG9F9_j99drpbl4ZsxWnRimDiOQG9THlcLKLHh5GGZ9bn4F2J7Btd95Cm_L-8G8JlXCdvGrz6-yZeKyogD_AZ7G_qhmvBBAVuVqGiRQmWrV9VXKlfGbuV5ilrWXVeAmimQ7RhkaFBzoN2AQbKV9GACw054zw5xw2LoOFo-aG1kw0J3gG2hbz88oJ0Ix22y540axWxxembK9wEyEamEggjxSi5F8lDyKyehP0cQE6x1GFd7xyvJ08Gl2VnoHl0GiQWwk86u2bceQVQ5E24G360y8Bw&__comet_req=24&fb_dtsg="+this.dtsg+"&jazoest=26468&lsd=KVEgAfUjRcTkM9eJzdNbcj&__spin_r=1011946474&__spin_b=trunk&__spin_t=1709954366&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterAddContactPointMutation&variables=%7B%22country%22%3A%22VN%22%2C%22contact_point%22%3A%22"+encodeURIComponent(emailData.address)+"%22%2C%22contact_point_type%22%3A%22email%22%2C%22selected_accounts%22%3A%5B%22"+this.actorID+"%22%5D%2C%22family_device_id%22%3A%22device_id_fetch_ig_did%22%2C%22client_mutation_id%22%3A%22mutation_id_1709954405682%22%7D&server_timestamps=true&doc_id=6970150443042883",
                "method": "POST"
            })

            const resData = await res.text()

            if (resData.includes(emailData.address)) {

                message('Đang chờ mã kích hoạt')

                let code = false

                for (let index = 0; index < 99; index++) {
                    
                    try {

                        const inbox = (await getTmMailInbox(emailData, service)).filter(item => item.from.includes('mail.instagram.com'))

                        if (inbox[0].code) {
                            code = inbox[0].code

                            break
                        }

                    } catch (err) {}

                    await delayTimeout(1000)
                    
                }

                message('Đang nhập mã kích hoạt: '+code)

                const res = await fetch("https://accountscenter.instagram.com/api/graphql/", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "1",
                        "sec-ch-prefers-color-scheme": "dark",
                        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Microsoft Edge\";v=\"122\"",
                        "sec-ch-ua-full-version-list": "\"Chromium\";v=\"122.0.6261.95\", \"Not(A:Brand\";v=\"24.0.0.0\", \"Microsoft Edge\";v=\"122.0.2365.66\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"15.0.0\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "1064",
                        "x-asbd-id": "129477",
                        "x-fb-friendly-name": "FXAccountsCenterContactPointConfirmationDialogVerifyContactPointMutation",
                        "x-fb-lsd": "KVEgAfUjRcTkM9eJzdNbcj",
                        "x-ig-app-id": "936619743392459",
                        "user-agent": this.UA,
                        "cookie": this.options.headers.cookie,
                        "Referer": "https://accountscenter.instagram.com/personal_info/contact_points/?contact_point_type=email&dialog_type=add_contact_point&theme=dark",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "agent": this.options.agent,
                    "body": "av="+this.actorID+"&__user=0&__a=1&__req=1d&__hs=19791.HYP%3Aaccounts_center_pkg.2.1..0.1&dpr=1&__ccg=EXCELLENT&__rev=1011946474&__s=3k8jtj%3Agnt0s8%3A6ppg6s&__hsi=7344198080611464841&__dyn=7xeUmwlEnwn8K2Wmh0cm5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O7U2czXwae4UaEW0D888cobEaU2eU5O0HUvw4JwJwSyES1Tw8W4E2GwrUdUco15E6O1FwlU18ouw&__csr=gWyYJPiTsB9HlahmG9F9_j99drpbl4ZsxWnRimDiOQG9THlcLKLHh5GGZ9bn4F2J7Btd95Cm_L-8G8JlXCdvGrz6-yZeKyogD_AZ7G_qhmvBBAVuVqGiRQmWrV9VXKlfGbuV5ilrWXVeAmimQ7RhkaFBzoN2AQbKV9GACw054zw5xw2LoOFo-aG1kw0J3gG2hbz88oJ0Ix22y540axWxxembK9wEyEamEggjxSi5F8lDyKyehP0cQE6x1GFd7xyvJ08Gl2VnoHl0GiQWwk86u2bceQVQ5E24G360y8Bw&__comet_req=24&fb_dtsg="+this.dtsg+"&jazoest=26468&lsd=KVEgAfUjRcTkM9eJzdNbcj&__spin_r=1011946474&__spin_b=trunk&__spin_t=1709954366&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterContactPointConfirmationDialogVerifyContactPointMutation&variables=%7B%22contact_point%22%3A%22"+emailData.address+"%22%2C%22contact_point_type%22%3A%22email%22%2C%22pin_code%22%3A%22"+code+"%22%2C%22selected_accounts%22%3A%5B%22"+this.actorID+"%22%5D%2C%22family_device_id%22%3A%22device_id_fetch_ig_did%22%2C%22client_mutation_id%22%3A%22mutation_id_1709955712136%22%2C%22contact_point_event_type%22%3A%22ADD%22%2C%22normalized_contact_point_to_replace%22%3A%22%22%7D&server_timestamps=true&doc_id=6973420842719905",
                    "method": "POST"
                })

                const resData = await res.text()

                if (resData.includes('FXCALSettingsMutationReturnDataSuccess')) {
                    resolve(emailData.address)
                } else {
                    reject()
                }
            
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
            reject()
        }

    })}

    uploadPhoto(file) {return new Promise(async (resolve, reject) => {
        try {

            const image = await sharp(file)
            const metadata = await image.metadata()
            const width = metadata.width
            const height = metadata.height
            const size = (await fs.promises.stat(file)).size
            const content = await fs.promises.readFile(file)
            const mimeD = mime.getType(file)
            const uploadId = Date.now()

            const res = await fetch("https://i.instagram.com/rupload_igphoto/fb_uploader_"+uploadId, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                    "content-type": mimeD,
                    "offset": "0",
                    "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Microsoft Edge\";v=\"122\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "x-asbd-id": "129477",
                    "x-entity-length": size,
                    "x-entity-name": "fb_uploader_"+uploadId,
                    "x-entity-type": mimeD,
                    "x-ig-app-id": "936619743392459",
                    "x-instagram-ajax": "1011946474",
                    "x-instagram-rupload-params": "{\"media_type\":1,\"upload_id\":\""+uploadId+"\",\"upload_media_height\":"+height+",\"upload_media_width\":"+width+"}",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://www.instagram.com/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": content,
                "method": "POST"
            })

            const resData = await res.json()

            const uploadId2 = resData.upload_id

            const res2 = await fetch("https://www.instagram.com/api/v1/media/configure/", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                    "content-type": "application/x-www-form-urlencoded",
                    "dpr": "1",
                    "sec-ch-prefers-color-scheme": "dark",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"15.0.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "1064",
                    "x-asbd-id": "129477",
                    "x-csrftoken": this.data.csrf,
                    "x-ig-app-id": "936619743392459",
                    "x-ig-www-claim": this.data.claim,
                    "x-instagram-ajax": "1011946474",
                    "x-requested-with": "XMLHttpRequest",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": "archive_only=false&caption=&clips_share_preview_to_feed=1&disable_comments=0&disable_oa_reuse=false&igtv_share_preview_to_feed=1&is_meta_only_post=0&is_unified_video=1&like_and_view_counts_disabled=0&source_type=library&upload_id="+uploadId2+"&video_subtitles_enabled=0",
                "method": "POST"
            })
            

            const resData2 = await res2.json()

            if (resData2.media.id) {
                resolve()
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
            reject(err)
        }
    })}

    changeAvatar(file) {return new Promise(async (resolve, reject) => {

        try {

            const form = new FormData()
    
            form.append('profile_pic', fs.createReadStream(file))

            const res = await fetch("https://www.instagram.com/api/v1/web/accounts/web_change_profile_picture/", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                    "dpr": "1",
                    "sec-ch-prefers-color-scheme": "dark",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"15.0.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "310",
                    "x-asbd-id": "129477",
                    "x-csrftoken": this.data.csrf,
                    "x-ig-app-id": "936619743392459",
                    "x-ig-www-claim": this.data.claim,
                    "x-instagram-ajax": "1011946474",
                    "x-requested-with": "XMLHttpRequest",
                    "user-agent": this.UA,
                    "cookie": this.options.headers.cookie,
                    "Referer": "https://www.instagram.com/"+this.username+"/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    ...form.getHeaders()
                },
                "agent": this.options.agent,
                "body": form,
                "method": "POST"
            })

            const resData = await res.json()

            if (resData.changed_profile) {
                resolve()
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
            reject()
        }
    })}
    
    outCookie() { return new Promise(async (resolve, reject) => {

        try {


            const res = await fetch("https://accountscenter.instagram.com/api/graphql/", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "vi",
                  "content-type": "application/x-www-form-urlencoded",
                  "priority": "u=1, i",
                  "sec-ch-prefers-color-scheme": "light",
                  "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
                  "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"135.0.7049.117\", \"Not-A.Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"135.0.7049.117\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-model": "\"\"",
                  "sec-ch-ua-platform": "\"Windows\"",
                  "sec-ch-ua-platform-version": "\"10.0.0\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-asbd-id": "359341",
                  "x-fb-friendly-name": "useFXSettingsLogoutSessionMutation",
                  "x-fb-lsd": "ARjLW0YxozZ5vwkrtLalic",
                  "x-ig-app-id": "936619743392459",
                  "user-agent": this.UA,
                  "cookie": this.options.headers.cookie,
                  "Referer": "https://accountscenter.instagram.com/password_and_security/login_activity/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": 'av='+this.actorID+'&__user=0&__a=1&__req=12&__hs=20219.HYP%3Aaccounts_center_pkg.2.1...1&dpr=1&__ccg=EXCELLENT&__rev=1022727780&__s=qftkgz%3Aluf79p%3Aceas1g&__hsi=7503197064641829760&__dyn=7xeUmwlEnwn8K2Wmh0no6u5U4e0yoW3q32360CEbo19oe8hw2nVE4W099w8G1Dz81s8hwnU2lwv89k2C1Fwc60D82IzXwae4UaEW0Loco5G0zK1swa-0raazo7u0zEiwaG1LwTwNw4mwr86C1nw4xxW1owLwHwea&__csr=gkld92HdtkR6ZdNZOmHi9SWX8TiZHqbQObvcy_jJmQh9qJdqJGiI8b8uA8lvmjnttOdOajAGozoClkjExaJSlmBAJ99QASq_iVuGAGGIGLAoOppGXGA4qDGugR93WzVu8jCV7CGlahvharGmha8AGmmGHLHyHxnKQUkypaD-8Cyem5En-Q00loii0WE0Aww460kx05awhUEsMG0imFpkmFHBGeJ2bwaq0GrKhpbKV9KlaXGiUmxZ1i1HGHGAm5oCU1k8WqWAK58421-LKmiiq2W0irwyAV8yWjAKqbG8KGypEiBDAxa0b8KXweCt7zpVqwzg2AwVxOcCgHhoC8wkEeQ0DE5upC81iw8K0qnEAawdqV6ayEgy-10yUy3SUG1RwRG1DyUKUgx22WVWG8Ki00AM86e4UN7hkeJBw&__comet_req=24&fb_dtsg='+this.dtsg+'&jazoest=26339&lsd=ARjLW0YxozZ5vwkrtLalic&__spin_r=1022727780&__spin_b=trunk&__spin_t=1746974202&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useFXSettingsLogoutSessionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22'+uuidv4()+'%22%2C%22actor_id%22%3A%22'+this.actorID+'%22%2C%22account_id%22%3A%22'+this.actorID+'%22%2C%22account_type%22%3A%22INSTAGRAM%22%2C%22mutate_params%22%3A%7B%22logout_all%22%3Atrue%2C%22session_ids%22%3A%5B%2219%3A1746935359%22%5D%7D%2C%22fdid%22%3A%22device_id_fetch_ig_did%22%7D%7D&server_timestamps=true&doc_id=10085457938165811',
                "method": "POST"
              });

            const resData = await res.json()

            if (resData.data.xfb_logout_session.success) {
                resolve()
            } else {
                reject()
            }

        } catch (err) {
            console.log(err)
            reject()
        }

    })}

    enable2Fa(message) { return new Promise(async (resolve, reject) => {

        let twofa = false

        try {

            message('Đang bật 2FA')

            const res = await fetch("https://accountscenter.instagram.com/api/graphql/", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                  "content-type": "application/x-www-form-urlencoded",
                  "dpr": "1",
                  "sec-ch-prefers-color-scheme": "dark",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-model": "\"\"",
                  "sec-ch-ua-platform": "\"Windows\"",
                  "sec-ch-ua-platform-version": "\"15.0.0\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "viewport-width": "419",
                  "user-agent": this.UA,
                  "cookie": this.options.headers.cookie,
                  "Referer": "https://accountscenter.instagram.com/password_and_security/two_factor/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": "av="+this.actorID+"&__user=0&__a=1&__req=k&__hs=19815.HYP%3Aaccounts_center_pkg.2.1..0.1&dpr=1&__ccg=EXCELLENT&__rev=1012470842&__s=mbtkvs%3Ak9fseu%3Azh6kaz&__hsi=7353163800186776001&__dyn=7xeUmwlEnwn8K2Wmh0cm5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O7U2czXwae4UaEW0D888cobEaU2eU5O0HUvw4JwJwSyES1Tw8W4E2GwrUdUco15E6O1FwlU18ouw&__csr=gUGkRsIIrJHJdBaTIh9kyrF9SAjP9bQInvZF_RuqyWFiGgF3Pi6AKGVp6j-qijjnHFftHkGGqinh5hV8WsBuGFS4ayaAhK9d8ybiBWFyfLzauA8qyby4jSijBAAQri8iem8HJ7HnHKKu9gO8nG8DAykfDgCuijx2U01fNo0q1wbS0P8527bUoxm06yU0V50CpA0QU4-rgyva2Ola2d03wU-Ehy9ouKq5rGi-byAy2bebwAg9UZ0pOwi86i2iz3Q5ei13Q26qhbwkaxmmePxq8yahFo8bAG2fzo3bo-5oV0Dw4bo&__comet_req=24&fb_dtsg="+this.dtsg+"&jazoest=26621&lsd=qKqWKIxyo4OAarCDQERkIl&__spin_r=1012470842&__spin_b=trunk&__spin_t=1712041860&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useFXSettingsTwoFactorGenerateTOTPKeyMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%222694721c-cc3e-4bef-980e-e557086f6504%22%2C%22actor_id%22%3A%22"+this.actorID+"%22%2C%22account_id%22%3A%22"+this.actorID+"%22%2C%22account_type%22%3A%22INSTAGRAM%22%2C%22device_id%22%3A%22device_id_fetch_ig_did%22%2C%22fdid%22%3A%22device_id_fetch_ig_did%22%7D%7D&server_timestamps=true&doc_id=6282672078501565",
                "method": "POST"
            })

            const resData = await res.json()

            const key = resData.data.xfb_two_factor_generate_totp_key.totp_key.key_text
            const twofaCode = twofactor.generateToken(key)
            const code = twofaCode.token

            if (code) {

                const res = await fetch("https://accountscenter.instagram.com/api/graphql/", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "0.9",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "964",
                        "x-asbd-id": "129477",
                        "x-fb-friendly-name": "useFXSettingsTwoFactorEnableTOTPMutation",
                        "x-fb-lsd": "BnY3W_udZnYAMK0qSAafU2",
                        "x-ig-app-id": "936619743392459",
                        "user-agent": this.UA,
                        "cookie": this.options.headers.cookie,
                        "Referer": "https://accountscenter.instagram.com/password_and_security/two_factor/",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": "av="+this.actorID+"&__user=0&__a=1&__req=12&__hs=19815.HYP%3Aaccounts_center_pkg.2.1..0.1&dpr=1&__ccg=EXCELLENT&__rev=1012473692&__s=j71d8b%3As91ya2%3Arq2zid&__hsi=7353209948967346571&__dyn=7xeUmwlEnwn8K2Wmh0cm5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O7U2czXwae4UaEW0D888cobEaU2eU5O0HUvw4JwJwSyES1Tw8W4E2GwrUdUco15E6O1FwlU18ouw&__csr=gPR4qZMx9Gy4peDtFXf48Sihq64N3RkWqOKJkj97RqR9O8BWWRVXhpqYymGKHAp4L9ELAA8Vz68HhkiGLlr_J5yf_l2UzCiulcwGEF4AXHVlWtmmp2aAy9vQb9QF4mYx99QbWhely9aCHHCDgOtVUCjgrVp9bBgiBw04_dw1DC0JE4O0xE6qaUnxu06yE0V50ChQbwFw9G1p843wHCK6uu1Jw35EO-fyV8nUy6BGXxHil218G2h0DwtW80HE8F2kt5UiDw-AUuyuRwjFaxiqUIMoCDHp8C7WzErx20Oizonz81dC&__comet_req=24&fb_dtsg="+this.dtsg+"&jazoest=26435&lsd=BnY3W_udZnYAMK0qSAafU2&__spin_r=1012473692&__spin_b=trunk&__spin_t=1712052605&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useFXSettingsTwoFactorEnableTOTPMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%225188ac4d-dcaa-437a-a1e4-0ca1f7885bae%22%2C%22actor_id%22%3A%22"+this.actorID+"%22%2C%22account_id%22%3A%22"+this.actorID+"%22%2C%22account_type%22%3A%22INSTAGRAM%22%2C%22verification_code%22%3A%22"+code+"%22%2C%22device_id%22%3A%22device_id_fetch_ig_did%22%2C%22fdid%22%3A%22device_id_fetch_ig_did%22%7D%7D&server_timestamps=true&doc_id=7032881846733167",
                    "method": "POST"
                })

                const resData = await res.json()

                if (resData.data.xfb_two_factor_enable_totp.success) {
                    twofa = key
                }

            }
            
        } catch (error) {
            console.log(error)
        }

        if (twofa) {

            message('Bật 2FA thành công')

            resolve(twofa)
        } else {

            message('Bật 2FA thất bại')

            resolve(false)
        }

    })}

    addPhone(message) { return new Promise(async (resolve, reject) => {

        let phoneStepSuccess = false
            
        try {

            const setting = await getSetting()

            for (let index = 0; index < 1; index++) {

                let phone = false
                let addPhoneSuccess = false
                let addCodeSuccess = false

                for (let index = 0; index < 1; index++) {

                    if (index > 0) {
                        message('Đang thử lấy số điện thoại khác')
                    } else {
                        message('Đang lấy số điện thoại')
                    }

                    try {

                        message('Đang thêm số điện thoại')

                        const res = await fetch("https://www.instagram.com/api/v1/challenge/web/action/", {
                            "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9",
                                "content-type": "application/x-www-form-urlencoded",
                                "dpr": "0.9",
                                "sec-ch-prefers-color-scheme": "light",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "viewport-width": "1225",
                                "x-asbd-id": "129477",
                                "x-csrftoken": this.data.csrf,
                                "x-ig-app-id": "936619743392459",
                                "x-ig-www-claim": this.data.claim,
                                "x-instagram-ajax": "1011951227",
                                "x-requested-with": "XMLHttpRequest",
                                "user-agent": this.UA,
                                "cookie": this.options.headers.cookie,
                                "Referer": "https://www.instagram.com/challenge/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_challenged%3D1",
                                "Referrer-Policy": "strict-origin-when-cross-origin"
                            },
                            "body": "challenge_context=Af5N39-cljKLVcsaQz6WGsaD24QHxd0fJRSCI-R_J9ocoQTWGEHOsxlbf0OqiIPBcB0AWHncvwqZMkOYNXiKBWAGBeGlpJVouYF1NFyRUFjFPqm83ZvzxarMRLl1coqoVKBmEZgU8JKj1cbpkO1u3Ko5-1252A9rsTo&phone_number="+phone.number+"&next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_challenged%3D1",
                            "method": "POST"
                        })

                        const resData = await res.text()

                        if (resData.includes('VerifySMSCodeFormForSMSCaptcha')) {
                            
                            addPhoneSuccess = true

                            break

                        }

                        if (setting.general.phoneService.value === 'custom' && phone.id) {

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

                    } catch (err) {
                        console.log(err)
                    }

                }

                if (addPhoneSuccess && phone) {

                    message('Đang chờ mã kích hoạt số điện thoại')

                    try {

                        const code = await getPhoneCode(setting.general.phoneService.value, setting.general.phoneServiceKey.value, phone.id)

                        message('Đang nhập mã kích hoạt số điện thoại: '+code)

                        const res = await fetch("https://www.instagram.com/api/v1/challenge/web/action/", {
                            "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9",
                                "content-type": "application/x-www-form-urlencoded",
                                "dpr": "0.9",
                                "sec-ch-prefers-color-scheme": "light",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "viewport-width": "1580",
                                "x-asbd-id": "129477",
                                "x-csrftoken": this.data.csrf,
                                "x-ig-app-id": "936619743392459",
                                "x-ig-www-claim": this.data.claim,
                                "x-instagram-ajax": "1011951227",
                                "x-requested-with": "XMLHttpRequest",
                                "user-agent": this.UA,
                                "cookie": this.options.headers.cookie,
                            },
                            "agent": this.options.agent,
                            "redirect": "manual",
                            "body": "challenge_context=WNPpjY-qmL0taf4UNnibY7fkBT7g84xj5ys89ptsaxJHhTgqgYyW7bWfDogVP6LeFZpBKt4HozynqLu3QHvl5CULEatZaY3hQ0lOwXzN8hw7TDQwL5ha_vGxpDIu0XRjLvd21JSsTZ1HcFBkC-AQozkcZw&security_code="+code+"&next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_challenged%3D1",
                            "method": "POST"
                        })

                        const resData = await res.text()

                        if (resData.includes('CHALLENGE_REDIRECTION')) {

                            addCodeSuccess = true

                        }

                    } catch {}

                    if (addCodeSuccess) {

                        phoneStepSuccess = true 

                        break

                    } else {

                        message('Đang gỡ số điện thoại')

                        const res = await fetch("https://www.instagram.com/api/v1/challenge/web/reset/", {
                            "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9",
                                "content-type": "application/x-www-form-urlencoded",
                                "dpr": "0.9",
                                "sec-ch-prefers-color-scheme": "light",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "viewport-width": "805",
                                "x-asbd-id": "129477",
                                "x-csrftoken": this.data.csrf,
                                "x-ig-app-id": "936619743392459",
                                "x-ig-www-claim": this.data.claim,
                                "x-instagram-ajax": "1011951227",
                                "x-requested-with": "XMLHttpRequest",
                                "user-agent": this.UA,
                                "cookie": this.options.headers.cookie,
                            },
                            "agent": this.options.agent,
                            "body": "challenge_context=Af5EfiYQcADufa5qiWBI7FFEWn2OmfIf951CWjVH3FnszXBXim3l4SNnnD8pr3k_s4RbSVRtQekOSPJkCn80cb8XzLe-z2IJyqjbFKkYxewMqeGyZw8c37fdDQ0Obn-NfsIBqS8oM6F0ed5m8tcceQ4wfWW43zZoslk&next=https%3A%2F%2Fwww.instagram.com%2F%3F__coig_challenged%3D1",
                            "method": "POST"
                        })

                    }

                }

                if (setting.general.phoneService.value === 'custom' && phone.id) {

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


        } catch (err) {
            console.log(err)
        }

        if (phoneStepSuccess) {

            message('Thêm số điện thoại thành công')

        } else {

            message('Thêm số điện thoại thất bại')

        }

        resolve()

    })}

    giaiCaptcha(message) { return new Promise(async (resolve, reject) => {

        let success = false

        for (let index = 0; index < 3; index++) {
            
        
            try {

                const setting = await getSetting()

                if (index > 0) {

                    message('Đang thử giải lại captcha')

                } else {

                    message('Đang giải captcha')

                }

                const captchaUrl = "https://www.fbsbx.com/captcha/recaptcha/iframe/?__cci=ig_captcha_iframe&compact=false&locale=en_US&referer=https%253A%252F%252Fwww.instagram.com"

                const res = await fetch(captchaUrl, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "max-age=0",
                        "sec-ch-ua": "\"Chromium\";v=\"122\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"122\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1"
                    },
                    "agent": this.options.agent,
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET"
                })

                const $ = cheerio.load(await res.text())

                const siteKey = $('[data-sitekey]').attr('data-sitekey')

                const result = await resolveCaptcha(setting.general, siteKey, captchaUrl)

                if (result) {

                    const res = await fetch("https://www.instagram.com/api/v1/challenge/web/action/", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "dpr": "0.9",
                            "sec-ch-prefers-color-scheme": "light",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "viewport-width": "1580",
                            "x-asbd-id": "129477",
                            "x-csrftoken": this.data.csrf,
                            "x-ig-app-id": "936619743392459",
                            "x-ig-www-claim": this.data.claim,
                            "x-instagram-ajax": "1011961784",
                            "x-requested-with": "XMLHttpRequest",
                            "user-agent": this.UA,
                            "cookie": this.options.headers.cookie,
                            "Referer": "https://www.instagram.com/challenge/?next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_challenged%3D1",
                            "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "agent": this.options.agent,
                        "body": "g-recaptcha-response="+result+"&next=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fonetap%2F%3Fnext%3D%252F%26__coig_challenged%3D1",
                        "method": "POST"
                    })

                    const resData = await res.json()

                    if (resData.type === 'CHALLENGE_REDIRECTION') {
                        success = true
                        break
                    }

                }

            } catch (err) {
                console.log(err)
                message('Giải captcha thất bại')
                reject()
            }

        }

        if (success) {

            message('Giải captcha thành công')
            resolve()
        } else {
            message('Giải captcha thất bại')
            reject()
        }

    })}

    getEmail() { return new Promise(async (resolve, reject) => {
        
        try {

            const res = await fetch("https://accountscenter.instagram.com/personal_info/", {
                "headers": {
                  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                  "accept-language": "vi,en;q=0.9,en-US;q=0.8",
                  "cache-control": "max-age=0",
                  "dpr": "1",
                  "priority": "u=0, i",
                  "sec-ch-prefers-color-scheme": "dark",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-model": "\"\"",
                  "sec-ch-ua-platform": "\"Windows\"",
                  "sec-ch-ua-platform-version": "\"15.0.0\"",
                  "sec-fetch-dest": "document",
                  "sec-fetch-mode": "navigate",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-user": "?1",
                  "upgrade-insecure-requests": "1",
                  "user-agent": this.UA,
                  "cookie": this.options.headers.cookie,
                  "Referer": "https://www.instagram.com/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "agent": this.options.agent,
                "body": null,
                "method": "GET"
            })

            const resData = await res.text()

            const emailMatches = resData.match(/(?<=\"navigation_row_subtitle\":\")[^\"]*/g)

            const email = emailMatches[0].replace('\\u0040', '@').match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)[0]

            resolve(email)

        } catch {

            reject()

        }

    })}

}

module.exports = IG