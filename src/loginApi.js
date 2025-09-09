const fetch = require('node-fetch')
const twofactor = require('node-2fa')
const generator = require('generate-password')
const {randomNumberRange, getPhone, getPhone2, getPhoneCode, delayTimeout, deletePhone, getMailCode, resolveCaptcha, resolveCaptchaImage, readMailInbox, getCodeBrowser, randomName, getSetting, capitalizeFLetter} = require('./core.js')
const {app} = require('electron')
const {taoPhoi} = require('./card.js')
const Db = require('./db.js')
const path = require('path')
const cheerio = require('cheerio')
const fs = require('fs')
const nodemailer = require('nodemailer')
const mime = require('mime')
const moment = require('moment')


class FB {

    constructor(data) {
        this.uid = data.uid
        this.password = data.password
        this.twofa = data.twofa
        this.cookie = data.cookie
        this.agent = data.agent
        this.dtsg = false
        this.lsd = false
        this.accessToken = false
        this.jazoest = false
        this.UA = data.UA
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
            return ''
        }
    }

    login3(message) {
        return new Promise(async (resolve, reject) => {

            let loginSuccess = false
            let cookie = ''
            let url = ''
            let errMsg = ''

            let data = {
                status: false
            }

            if (this.cookie) {

                message('Đang đăng nhập cookie Facebook')

                await delayTimeout(2000)

                cookie = this.cookie
                loginSuccess = true

            } else {

                message('Đang đăng nhập Facebook')

                for (let index = 0; index < 10; index++) {

                    try {

                        const res0 = await fetch("https://m.facebook.com/", {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "vi",
                                "cache-control": "max-age=0",
                                "content-type": "application/x-www-form-urlencoded",
                                "dpr": "1",
                                "priority": "u=0, i",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "same-origin",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                        })

                        const data0 = await res0.text()

                        let datr = false

                        try {
                            datr = data0.split('["_js_datr","')[1].split('",')[0]
                        } catch {
                            datr = this.getCookies(res0).split('datr=')[1].split(';')[0]
                        }
                        
                        const jazoest = data0.split('"jazoest", "')[1].split('",')[0]
                        const lsd = data0.split('"lsd":"')[1].split('",')[0]
                        const dtsg = data0.split('{"dtsg":{"token":"')[1].split('",')[0]

                        this.dtsg = dtsg
                        this.jazoest = jazoest
                        this.lsd = lsd

                        const res = await fetch('https://m.facebook.com/async/wbloks/fetch/?appid=com.bloks.www.bloks.caa.login.async.send_login_request&type=action&__bkv=2238fef536737a6cadcc343ca637ae897c1be7af47bd6ce31c6fa5621cb1c887', {
                            method: 'POST',
                            headers: {
                              'Referer': 'https://m.facebook.com/',
                              'User-Agent': this.UA,
                              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                              'Cookie': 'datr='+datr+';'
                            },
                            body: new URLSearchParams({
                              '__aaid': '0',
                              '__user': '0',
                              '__a': '1',
                              '__req': 'f',
                              '__hs': '20160.BP:wbloks_caa_pkg.2.0...0',
                              'dpr': '3',
                              '__ccg': 'EXCELLENT',
                              '__rev': '1020850159',
                              '__s': 'vzrgag:6ftesm:qzqfmr',
                              '__hsi': '7481134931718270998',
                              '__dyn': '0wzpawlE72fDg9ppo5S12wAxu13wqobE6u7E39x60lW4o3Bw4Ewk9E4W099w2s8hw73wGw6tw5Uw64w8W1uwf20n6aw8m0zE2ZwrU6q3a0le0iS2eU2dwde',
                              '__csr': '',
                              '__hsdp': '',
                              '__hblp': '',
                              'fb_dtsg': this.dtsg,
                              'jazoest': this.jazoest,
                              'lsd': this.lsd,
                              'params': '{"params":"{\\"server_params\\":{\\"credential_type\\":\\"password\\",\\"username_text_input_id\\":\\"t1v2l1:68\\",\\"password_text_input_id\\":\\"t1v2l1:69\\",\\"login_source\\":\\"Login\\",\\"login_credential_type\\":\\"none\\",\\"server_login_source\\":\\"login\\",\\"ar_event_source\\":\\"login_home_page\\",\\"should_trigger_override_login_success_action\\":0,\\"should_trigger_override_login_2fa_action\\":0,\\"is_caa_perf_enabled\\":0,\\"reg_flow_source\\":\\"login_home_native_integration_point\\",\\"caller\\":\\"gslr\\",\\"is_from_landing_page\\":0,\\"is_from_empty_password\\":0,\\"is_from_password_entry_page\\":0,\\"is_from_assistive_id\\":0,\\"is_from_msplit_fallback\\":0,\\"INTERNAL__latency_qpl_marker_id\\":36707139,\\"INTERNAL__latency_qpl_instance_id\\":\\"175664840500395\\",\\"device_id\\":null,\\"family_device_id\\":null,\\"waterfall_id\\":\\"7cd59885-bae4-460c-b531-5093f4f7aa4a\\",\\"offline_experiment_group\\":null,\\"layered_homepage_experiment_group\\":null,\\"is_platform_login\\":0,\\"is_from_logged_in_switcher\\":0,\\"is_from_logged_out\\":0,\\"access_flow_version\\":\\"pre_mt_behavior\\"},\\"client_input_params\\":{\\"machine_id\\":\\"\\",\\"contact_point\\":\\"'+this.uid+'\\",\\"password\\":\\"#PWD_BROWSER:0:1111:'+this.password+'\\",\\"accounts_list\\":[],\\"fb_ig_device_id\\":[],\\"secure_family_device_id\\":\\"\\",\\"encrypted_msisdn\\":\\"\\",\\"headers_infra_flow_id\\":\\"\\",\\"try_num\\":1,\\"login_attempt_count\\":1,\\"event_flow\\":\\"login_manual\\",\\"event_step\\":\\"home_page\\",\\"openid_tokens\\":{},\\"auth_secure_device_id\\":\\"\\",\\"client_known_key_hash\\":\\"\\",\\"has_whatsapp_installed\\":0,\\"sso_token_map_json_string\\":\\"\\",\\"should_show_nested_nta_from_aymh\\":0,\\"password_contains_non_ascii\\":\\"false\\",\\"has_granted_read_contacts_permissions\\":0,\\"has_granted_read_phone_permissions\\":0,\\"app_manager_id\\":\\"\\",\\"lois_settings\\":{\\"lois_token\\":\\"\\"}}}"}'
                            }),
                            agent: this.agent
                        })

                        const resData = await res.text()                        

                        cookie = "datr="+datr+";"+this.getCookies(res)
                        url = res.headers.get('location')

                                              
                        if (resData.includes('two_factor_login')) {

                            const twofaContext = (JSON.parse(resData.replace('for (;;);', ''))).payload.layout.bloks_payload.action.split('"INTERNAL_INFRA_screen_id"), (bk.action.array.Make, "')[1].split('",')[0]

                            message('Đang nhập 2FA')

                            const twofa = twofactor.generateToken(this.twofa)

                            const res1 = await fetch("https://m.facebook.com/async/wbloks/fetch/?appid=com.bloks.www.two_step_verification.verify_code.async&type=action&__bkv=2238fef536737a6cadcc343ca637ae897c1be7af47bd6ce31c6fa5621cb1c887", {
                                "headers": {
                                  "accept": "*/*",
                                  "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                                  "cookie": cookie,
                                  "user-agent": this.UA
                                },
                                "body": new URLSearchParams({
                                    '__aaid': '0',
                                    '__user': '0',
                                    '__a': '1',
                                    '__req': 'o',
                                    '__hs': '20160.BP:wbloks_caa_pkg.2.0...0',
                                    'dpr': '3',
                                    '__ccg': 'EXCELLENT',
                                    '__rev': '1020850159',
                                    '__s': 'b56k4o:pahz0c:261rod',
                                    '__hsi': '7481142559525354681',
                                    '__dyn': '0wzpawlE72fDg9ppo5S12wAxu13wqobE6u7E39x60lW4o3Bw4Ewk9E4W099w2s8hw73wGw6tw5Uw64w8W1uwf20n6aw8m0zE2ZwrU6q3a0le0iS2eU2dwde',
                                    '__csr': '',
                                    '__hsdp': '',
                                    '__hblp': '',
                                    'fb_dtsg': this.dtsg,
                                    'jazoest': this.jazoest,
                                    'lsd': this.lsd,
                                    'params': '{"params":"{\\"server_params\\":{\\"two_step_verification_context\\":\\"'+twofaContext+'\\",\\"flow_source\\":\\"two_factor_login\\",\\"challenge\\":\\"totp\\",\\"INTERNAL__latency_qpl_marker_id\\":36707139,\\"INTERNAL__latency_qpl_instance_id\\":\\"182089187700089\\",\\"machine_id\\":null,\\"device_id\\":null},\\"client_input_params\\":{\\"machine_id\\":\\"\\",\\"code\\":\\"'+twofa.token+'\\",\\"should_trust_device\\":1,\\"auth_secure_device_id\\":\\"\\"}}"}'
                                }),
                                "method": "POST",
                                "agent": this.agent
                            })

                            const data1 = await res1.text()

                            if (data1.includes('login_success')) {

                                message('Nhập 2FA thành công')

                                cookie = "datr="+datr+";"+this.getCookies(res1)

                                break

                            }

                        } else if (url.includes('login_error_dialog_recovery_password_clicked')) {

                            errMsg = 'Sai thông tin đăng nhập'

                            break

                        } else {
                            break
                        }

                    } catch (err) {

                        await delayTimeout(3000)

                    }

                }

            }

            if (cookie.includes('c_user='+this.uid)) {
                loginSuccess = true
            }

            if (loginSuccess) {

                this.cookie = cookie

                message('Đang kiểm tra trạng thái đăng nhập')

                let success = false

                for (let index = 0; index < 5; index++) {

                    try {
                    
                        data = await this.checkLogin()

                        if (data.status) {

                            message('Đăng nhập thành công')

                            success = true

                            break

                        } else {

                            if (data.checkPoint) {
                                message('Đăng nhập thất bại: Tài khoản bị CP')

                                success = true

                                break

                            }

                        }

                    } catch {}

                }

                if (!success) {
                    message('Đăng nhập thất bại')
                }

            } else {
                data.status = false

                if (errMsg) {
                    message('Đăng nhập thất bại: '+errMsg)
                } else {
                    message('Đăng nhập thất bại')
                }
            }

            resolve(data)

        })
    }

    login2(message) {
        return new Promise(async (resolve, reject) => {

            let loginSuccess = false
            let cookie = ''
            let url = ''
            let errMsg = ''

            let data = {
                status: false
            }

            if (this.cookie) {

                message('Đang đăng nhập cookie Facebook')

                await delayTimeout(2000)

                cookie = this.cookie
                loginSuccess = true

            } else {

                message('Đang đăng nhập Facebook')

                for (let index = 0; index < 10; index++) {

                    try {

                        const res0 = await fetch("https://www.facebook.com/", {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "vi",
                                "cache-control": "max-age=0",
                                "content-type": "application/x-www-form-urlencoded",
                                "dpr": "1",
                                "priority": "u=0, i",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "same-origin",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                        })

                        const data0 = await res0.text()

                        let datr = false

                        try {
                            datr = data0.split('["_js_datr","')[1].split('",')[0]
                        } catch {
                            datr = this.getCookies(res0).split('datr=')[1].split(';')[0]
                        }
                        
                        const jazoest = data0.split('name="jazoest" value="')[1].split('" autocomplete="off"')[0]
                        const lsd = data0.split('name="lsd" value="')[1].split('" autocomplete="off"')[0]

                        this.jazoest = jazoest
                        this.lsd = lsd

                        const res = await fetch("https://www.facebook.com/login/?privacy_mutation_token=eyJ0eXBlIjowLCJjcmVhdGlvbl90aW1lIjoxNzI2OTgwODgwLCJjYWxsc2l0ZV9pZCI6MzgxMjI5MDc5NTc1OTQ2fQ%3D%3D&next", {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "vi",
                                "cache-control": "max-age=0",
                                "content-type": "application/x-www-form-urlencoded",
                                "dpr": "1",
                                "priority": "u=0, i",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "same-origin",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                "cookie": "datr="+datr+";",
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "redirect": "manual",
                            "body": "jazoest="+jazoest+"&lsd="+lsd+"&email="+this.uid+"&login_source=comet_headerless_login&next=&encpass=#PWD_BROWSER:0:1111:"+this.password,
                            "method": "POST"
                        })
                        

                        cookie = "datr="+datr+";"+this.getCookies(res)
                        url = res.headers.get('location')

                        if (url.includes('two_step_verification/authentication')) {

                            const enc = url.split('?encrypted_context=')[1].split('&flow=')[0]

                            message('Đang giải captcha')

                            const res = await fetch(url, {
                                "headers": {
                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                    "accept-language": "vi",
                                    "cache-control": "max-age=0",
                                    "dpr": "1",
                                    "priority": "u=0, i",
                                    "sec-fetch-dest": "document",
                                    "sec-fetch-mode": "navigate",
                                    "sec-fetch-site": "same-origin",
                                    "sec-fetch-user": "?1",
                                    "upgrade-insecure-requests": "1",
                                    "cookie": cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                            })

                            const resData = await res.text()

                            const captchaImage = resData.split('"text_captcha_image_uri":"')[1].split('"}},"')[0].replace(/\\/g, '')
                            const persist = resData.split('"captcha_persist_data":"')[1].split('","')[0]

                            const res2 = await fetch(captchaImage, {
                                "headers": {
                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                    "accept-language": "vi",
                                    "cache-control": "max-age=0",
                                    "dpr": "1",
                                    "priority": "u=0, i",
                                    "sec-fetch-dest": "document",
                                    "sec-fetch-mode": "navigate",
                                    "sec-fetch-site": "same-origin",
                                    "sec-fetch-user": "?1",
                                    "upgrade-insecure-requests": "1",
                                    "cookie": cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                            })

                            const base64 = (await res2.buffer()).toString('base64')

                            const setting = await getSetting()

                            let code = false

                            for (let index = 0; index < 3; index++) {

                                if (index > 0) {
                                    message('Đang thử giải lại captcha')
                                }
                            
                                try {
    
                                    code = await resolveCaptchaImage(setting.general, base64)
        
                                    break
    
                                } catch (err) {
                                    console.log(err)
                                }
    
                            }

                            if (code) {

                                const res = await fetch("https://www.facebook.com/api/graphql/", {
                                    "headers": {
                                        "accept": "*/*",
                                        "accept-language": "en-US,en;q=0.9",
                                        "content-type": "application/x-www-form-urlencoded",
                                        "accept-language": "vi",
                                        "cache-control": "max-age=0",
                                        "dpr": "1",
                                        "priority": "u=0, i",
                                        "sec-fetch-dest": "document",
                                        "sec-fetch-mode": "navigate",
                                        "sec-fetch-site": "same-origin",
                                        "sec-fetch-user": "?1",
                                        "upgrade-insecure-requests": "1",
                                        "cookie": cookie,
                                        "user-agent": this.UA
                                    },
                                    "agent": this.agent,
                                    "body": "av=0&__aaid=0&__user=0&__a=1&__req=4&__hs=20071.HYP%3Acomet_loggedout_pkg.2.1.0.0.0&dpr=1&__ccg=MODERATE&__rev=1018880509&__s=8mjz9a%3Axtgybf%3Also07i&__hsi=7448193353250541374&__dyn=7xeUmwlE7ibwKBAg5S1Dxu13w8CewSwMwNw9G2S7o11Ue8hw2nVE4W099w8G1Qw5Mx61vw9m1YwBgao6C0Mo2swlo5q4U2zxe2GewbS2SU5G0zK1swaCm7-0lC3qazo11E2ZwrUdUcobU3Cwr86C13G486S0IUuwm85K2G0JU&__csr=gEwAiDmQHCCiGqmifjBy9Ero-vooxG5olxu2m6K4V89EaHwvES6UdQmmimdwlHgb84m2-cU08OAQELyp4Q042U0dLd0dW06ue0bhVU0xyU0kzw0eZ204DE6m1Yy81dF3S0cDw2o80_2dDo2Hw39d04sg08bE1ZcE11U1Mo3Sg09ME0JV2oF3rAwby01y2w3BE0g1w3qm09ga0ty049US8g0E1xx01ri08cw&__comet_req=15&lsd="+lsd+"&jazoest="+jazoest+"&__spin_r=1018880509&__spin_b=trunk&__spin_t=1734167652&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useTwoStepVerificationTextCaptchaValidateCodeMutation&variables=%7B%22captcha_response%22%3A%22"+code+"%22%2C%22encryptedContext%22%3A%22"+enc+"%22%2C%22persist_data%22%3A%22"+persist+"%22%2C%22is_web%22%3Atrue%7D&server_timestamps=true&doc_id=8493530090676151",
                                    "method": "POST",
                                })

                                const resData = await res.json()
                                
                                url = resData.data.xfb_validate_text_captcha_response.redirect_uri

                                cookie = cookie+";"+this.getCookies(res)

                            } else {

                                message('Giải captcha thất bại')

                                break

                            }

                        }
                                                
                        if (url.includes('two_factor/')) {
                        
                            const enc = url.split('?encrypted_context=')[1].split('&flow=')[0]

                            const res = await fetch(url, {
                                "headers": {
                                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                    "accept-language": "vi",
                                    "cache-control": "max-age=0",
                                    "dpr": "1",
                                    "priority": "u=0, i",
                                    "sec-fetch-dest": "document",
                                    "sec-fetch-mode": "navigate",
                                    "sec-fetch-site": "same-origin",
                                    "sec-fetch-user": "?1",
                                    "upgrade-insecure-requests": "1",
                                    "cookie": cookie,
                                    "user-agent": this.UA
                                },
                                //"agent": this.agent,
                            })

                            const data = await res.text()

                            const token = data.match(/(?<=\"async_get_token\":\")[^\"]*/g)[0]

                            message('Đang nhập 2FA')

                            const twofa = twofactor.generateToken(this.twofa)

                            const res1 = await fetch("https://www.facebook.com/api/graphql/", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                    "sec-ch-ua-mobile": "?0",
                                    "sec-ch-ua-model": "\"\"",
                                    "x-asbd-id": "129477",
                                    "sec-fetch-dest": "empty",
                                    "sec-fetch-mode": "cors",
                                    "sec-fetch-site": "same-origin",
                                    "x-asbd-id": "129477",
                                    "x-fb-friendly-name": "useTwoFactorLoginValidateCodeMutation",
                                    "x-fb-lsd": "LnIdt2cbDQBIh5nNoZFD5o",
                                    "cookie": cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                                "body": "av=0&__aaid=0&__user=0&__a=1&__req=4&__hs=19988.HYP%3Acomet_plat_default_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016700928&__s=1uhzir%3Azta2du%3Acgvxrx&__hsi=7417333130652066369&__dyn=7xeUmwlE7ibwKBAg5S1Dxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65wce0yE7i0n24o5-0Bo7O2l0Fwqo31w9O1lwlEjwae4UaEW0LobrwmE2eU5O0GpovU1modEGdw46wbS1LwTwNwLweq1Iwqo4eEgwro2PxW1owmU&__csr=nf7tkOEgFqLiiDFaQil4yEGm8nKrJi6yk4Ea8ymqeCHzp8yfwGAwj8yq2e4K9xe10wJDw-G3K1Zwh8bUhzVk1ew8q16y8e862dwMgS1LwdK1wwo83kw8W0jm018Tw29U01GtK0gV00nSS5o1wo0RB0288&__comet_req=1&fb_dtsg="+token+"&jazoest="+jazoest+"&lsd="+lsd+"&__spin_r=1016700928&__spin_b=trunk&__spin_t=1726982447&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useTwoFactorLoginValidateCodeMutation&variables=%7B%22code%22%3A%7B%22sensitive_string_value%22%3A%22"+twofa.token+"%22%7D%2C%22method%22%3A%22TOTP%22%2C%22flow%22%3A%22TWO_FACTOR_LOGIN%22%2C%22encryptedContext%22%3A%22"+enc+"%22%2C%22maskedContactPoint%22%3Anull%7D&server_timestamps=true&doc_id=7404767032917067",
                                "method": "POST"
                            })

                            const data1 = await res1.text()

                            if (data1.includes('"is_code_valid":true')) {

                                message('Nhập 2FA thành công')

                                cookie = "datr="+datr+";"+this.getCookies(res1)

                                break

                            }

                        } else if (url.includes('www_first_password_failure')) {

                            errMsg = 'Sai mật khẩu'

                            break

                        } else {
                            break
                        }

                    } catch (err) {

                        await delayTimeout(3000)

                    }

                }

            }

            if (cookie.includes('c_user='+this.uid)) {
                loginSuccess = true
            }

            if (loginSuccess) {

                this.cookie = cookie

                message('Đang kiểm tra trạng thái đăng nhập')

                let success = false

                for (let index = 0; index < 5; index++) {

                    try {
                    
                        data = await this.checkLogin()

                        if (data.status) {

                            message('Đăng nhập thành công')

                            success = true

                            break

                        } else {

                            if (data.checkPoint) {
                                message('Đăng nhập thất bại: Tài khoản bị CP')

                                success = true

                                break

                            }

                        }

                    } catch {}

                }

                if (!success) {
                    message('Đăng nhập thất bại')
                }

            } else {
                data.status = false

                if (errMsg) {
                    message('Đăng nhập thất bại: '+errMsg)
                } else {
                    message('Đăng nhập thất bại')
                }
            }

            resolve(data)

        })
    }

    login(message) {
        return new Promise(async (resolve, reject) => {

            let loginSuccess = false
            let cookie = ''
            let errMsg = ''

            let data = {
                status: false
            }

            if (this.cookie) {

                message('Đang đăng nhập cookie Facebook')

                await delayTimeout(2000)

                cookie = this.cookie
                loginSuccess = true

            } else {
                try {

                    message('Đang đăng nhập Facebook')
    
                    const res0 = await fetch("https://mbasic.facebook.com/", {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "accept-language": "en-US,en;q=0.9",
                            "cache-control": "max-age=0",
                            "dpr": "0.8999999761581421",
                            "priority": "u=0, i",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "none",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "body": null,
                        "method": "GET"
                    })
    
                    cookie = this.getCookies(res0)
    
                    const $ = cheerio.load(await res0.text())
    
                    const lsd = $('input[name="lsd"]').val()
                    const m_ts = $('input[name="m_ts"]').val()
                    const jazoest = $('input[name="jazoest"]').val()
                    const li = $('input[name="li"]').val()
    
                    const res = await fetch("https://mbasic.facebook.com/login/device-based/regular/login/?refsrc=deprecated&lwv=100&refid=8", {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "content-type": "application/x-www-form-urlencoded",
                            "accept-language": "en-US,en;q=0.9",
                            "cache-control": "max-age=0",
                            "dpr": "0.8999999761581421",
                            "priority": "u=0, i",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "none",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "redirect": "manual",
                        "body": "lsd="+lsd+"&jazoest="+jazoest+"&m_ts="+m_ts+"&li="+li+"&try_number=0&unrecognized_tries=0&email="+this.uid+"&pass="+this.password+"&login=%C4%90%C4%83ng+nh%E1%BA%ADp&bi_xrwh=0",
                        "method": "POST"
                    })
    
                    const location = res.headers.get('location')
    
                    if (location.includes('e=1348131') || location.includes('e=1348092')) {
    
                        errMsg = 'Sai tài khoản hoặc mật khẩu'
    
                    } else if (location.includes('checkpoint/disabled')) {
    
                        data.checkPoint = 'Vô hiệu hóa'
    
                    } else {
    
                        cookie = this.getCookies(res)
    
                        if (cookie.includes('c_user')) {
    
                            loginSuccess = true
    
                        } else {
    
                            for (let index = 0; index < 99; index++) {
                                
                                const res = await fetch("https://mbasic.facebook.com/checkpoint/?_rdr", {
                                    "headers": {
                                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                        "accept-language": "en-US,en;q=0.9",
                                        "cache-control": "max-age=0",
                                        "dpr": "0.8999999761581421",
                                        "priority": "u=0, i",
                                        "sec-fetch-dest": "document",
                                        "sec-fetch-mode": "navigate",
                                        "sec-fetch-site": "none",
                                        "sec-fetch-user": "?1",
                                        "upgrade-insecure-requests": "1",
                                        "cookie": cookie,
                                        "user-agent": this.UA
                                    },
                                    "agent": this.agent,
                                    "body": null,
                                    "method": "GET"
                                })
                                
                                cookie = this.getCookies(res)
    
                                const $ = cheerio.load(await res.text())
    
                                const dtsg = $('input[name="fb_dtsg"]').val()
                                const nh = $('input[name="nh"]').val()
    
                                if ($('#approvals_code').length) {
    
                                    message('Đang nhập 2FA')
                                    
                                    const twofa = twofactor.generateToken(this.twofa)
    
                                    const res = await fetch("https://mbasic.facebook.com/login/checkpoint/", {
                                        "headers": {
                                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                            "content-type": "application/x-www-form-urlencoded",
                                            "accept-language": "en-US,en;q=0.9",
                                            "cache-control": "max-age=0",
                                            "dpr": "0.8999999761581421",
                                            "priority": "u=0, i",
                                            "sec-fetch-dest": "document",
                                            "sec-fetch-mode": "navigate",
                                            "sec-fetch-site": "none",
                                            "sec-fetch-user": "?1",
                                            "upgrade-insecure-requests": "1",
                                            "cookie": cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "body": "fb_dtsg="+dtsg+"&jazoest=2971&checkpoint_data=&approvals_code="+twofa.token+"&codes_submitted=0&submit%5BSubmit+Code%5D=G%E1%BB%ADi+m%C3%A3&nh="+nh,
                                        "method": "POST"
                                    })
    
                                    const $ = cheerio.load(await res.text())
    
                                    if ($('#approvals_code').length === 0) {
    
                                        message('Nhập 2FA thành công')
    
                                        cookie = this.getCookies(res)
    
                                    }
    
                                } else if ($('a[href*="disabled_checkpoint"]').length) {
    
                                    data.checkPoint = 'Vô hiệu hóa'
    
                                    errMsg = 'Tài khoản bị vô hiệu hóa'
    
                                    break
    
                                } else if ($('input[name="password_new"]').length) {
    
                                    message('Checkpoint đổi mật khẩu')
    
                                    const newPassword = 'A@!'+generator.generate({
                                        length: 10,
                                        numbers: true
                                    })
    
                                    const res = await fetch("https://mbasic.facebook.com/login/checkpoint/", {
                                        "headers": {
                                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                            "content-type": "application/x-www-form-urlencoded",
                                            "accept-language": "en-US,en;q=0.9",
                                            "cache-control": "max-age=0",
                                            "dpr": "0.8999999761581421",
                                            "priority": "u=0, i",
                                            "sec-fetch-dest": "document",
                                            "sec-fetch-mode": "navigate",
                                            "sec-fetch-site": "none",
                                            "sec-fetch-user": "?1",
                                            "upgrade-insecure-requests": "1",
                                            "cookie": cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "body": "fb_dtsg="+dtsg+"&jazoest=21003&checkpoint_data=&password_new="+newPassword+"&submit%5BChange+Password%5D=%C4%90%E1%BB%95i+m%E1%BA%ADt+kh%E1%BA%A9u&nh="+nh,
                                        "method": "POST"
                                    })
    
                                    const html = await res.text()
    
                                    if (!html.includes('name="password_new"')) {
                                        message('Đã đổi mật khẩu thành: '+newPassword)
    
                                        data.newPassword = newPassword
    
                                        cookie = this.getCookies(res)
                                    }
    
                                } else if ($('input[value="save_device"]').length) {
    
                                    message('Đang lưu thiết bị')
                                    
                                    const res = await fetch("https://mbasic.facebook.com/login/checkpoint/", {
                                        "headers": {
                                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                            "content-type": "application/x-www-form-urlencoded",
                                            "accept-language": "en-US,en;q=0.9",
                                            "cache-control": "max-age=0",
                                            "dpr": "0.8999999761581421",
                                            "priority": "u=0, i",
                                            "sec-fetch-dest": "document",
                                            "sec-fetch-mode": "navigate",
                                            "sec-fetch-site": "none",
                                            "sec-fetch-user": "?1",
                                            "upgrade-insecure-requests": "1",
                                            "cookie": cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "redirect": "manual",
                                        "body": "fb_dtsg="+dtsg+"&jazoest=21158&checkpoint_data=&name_action_selected=save_device&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh,
                                        "method": "POST"
                                    })
    
                                    message('Lưu thiết bị thành công')
                                    
                                    cookie = this.getCookies(res)
    
                                } else if ($('form[action^="/login"]').length) {
    
                                    const url = 'https://mbasic.facebook.com'+$('form[action^="/login"]').attr('action')
    
                                    const submit = $('#checkpointSubmitButton-actual-button').attr('name')
                                    const submitValue = $('#checkpointSubmitButton-actual-button').val()
    
                                    const res = await fetch(url, {
                                        "headers": {
                                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                            "content-type": "application/x-www-form-urlencoded",
                                            "accept-language": "en-US,en;q=0.9",
                                            "cache-control": "max-age=0",
                                            "dpr": "0.8999999761581421",
                                            "priority": "u=0, i",
                                            "sec-fetch-dest": "document",
                                            "sec-fetch-mode": "navigate",
                                            "sec-fetch-site": "none",
                                            "sec-fetch-user": "?1",
                                            "upgrade-insecure-requests": "1",
                                            "cookie": cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "redirect": "manual",
                                        "body": "fb_dtsg="+dtsg+"&jazoest=21049&checkpoint_data=&"+submit+"="+submitValue+"&nh="+nh,
                                        "method": "POST"
                                    })
    
                                    cookie = this.getCookies(res)
    
                                }
    
                                if (cookie.includes('c_user')) { 
                                    loginSuccess = true
                                    break
                                }
    
                                await delayTimeout(1000)
                                
                            }
    
                        }
    
                    }
    
                } catch (err) {
                }
            }

            if (loginSuccess) {

                this.cookie = cookie

                message('Đang kiểm tra trạng thái đăng nhập')

                data = await this.checkLogin()

                if (data.status) {

                    message('Đăng nhập thành công')

                } else {

                    if (data.checkPoint) {
                        message('Đăng nhập thất bại: Tài khoản bị CP')
                    } else {
                        message('Đăng nhập thất bại')
                    }

                }

            } else {
                data.status = false

                if (errMsg) {
                    message('Đăng nhập thất bại: '+errMsg)
                } else {
                    message('Đăng nhập thất bại')
                }
            }

            resolve(data)

        })
    }

    checkLogin() {

        return new Promise(async (resolve, reject) => {

            const data = {
                status: true,
                checkPoint: false,
                cookie: this.cookie
            }

            try {

                let url = ''
                let html = ''

                try {

                    const res = await fetch("https://business.facebook.com/billing_hub/payment_settings/", {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "accept-language": "en-US,en;q=0.9",
                            "dpr": "0.8999999761581421",
                            "priority": "u=0, i",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "none",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "body": null,
                        "method": "GET"
                    })

                    url = res.url

                    if (url.includes('65049')) {
                        try {
                            const res00 = await fetch("https://www.facebook.com/checkpoint/601051028565049/?__mmr=1&_rdr", {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "en-US,en;q=0.9",
                                "dpr": "0.8999999761581421",
                                "priority": "u=0, i",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "none",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "body": null,
                            "method": "GET"
                        })

                        const resData = await res00.text()

                        data.dtsg = resData.match(/(?<=\"token\":\")[^\"]*/g).filter(item => item.startsWith('NA'))[0]

                        console.log(data.dtsg)

                        const res0 = await fetch("https://www.facebook.com/api/graphql/", {
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
                                "x-fb-friendly-name": "FBScrapingWarningMutation",
                                "x-fb-lsd": this.lsd,
                                "Referer": "https://www.facebook.com/checkpoint/601051028565049/?__mmr=1&_rdr",
                                "Referrer-Policy": "strict-origin-when-cross-origin",
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "body": "av="+this.uid+"&__user="+this.uid+"&__a=1&__req=6&__hs=20067.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1&__ccg=GOOD&__rev=1018743848&__s=yy1ek9%3Aixkdtn%3A6zgrdv&__hsi=7446649054431003029&__dyn=7xeUmwlEnwn8K2Wmh0no6u5U4e0yoW3q32360CEbo19oe8hw2nVE4W099w8G1Dz81s8hwnU2lwv89k2C1Fwc60D8vwRwlE-U2zxe2GewbS361qw8Xwn82Lw5XwSyES1Mw9m0Lo6-1Fw4mwr86C0No7S3m1TwLwHwGwbu&__csr=gGGimdi-q6949LBCGiEF1CFdu8zUSVoSdCUS2C9xe4EWU5mdxa0xU0Fu0B8gwlU7u1xwzw2ho5C0he06vU0aY801tjo0zW07Jo&__comet_req=15&fb_dtsg="+data.dtsg+"&jazoest="+this.jazoest+"&lsd="+this.lsd+"&__spin_r=1018743848&__spin_b=trunk&__spin_t=1733808092&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBScrapingWarningMutation&variables=%7B%7D&server_timestamps=true&doc_id=6339492849481770",
                            "method": "POST"
                        })
                            
                        } catch  {}
                        try {
                            const res11 = await fetch("https://m.facebook.com/checkpoint/601051028565049/?next=https%3A%2F%2Fm.facebook.com%2Flogin%2Fsave-device%2F&wtsid=rdr_0EJi3alasY64JemNx&_rdr", {
                            "headers": {
                              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                              "accept-language": "vi",
                              "dpr": "1",
                              "priority": "u=0, i",
                              "sec-ch-prefers-color-scheme": "light",
                              "sec-fetch-dest": "document",
                              "sec-fetch-mode": "navigate",
                              "sec-fetch-site": "none",
                              "sec-fetch-user": "?1",
                              "upgrade-insecure-requests": "1",
                              "viewport-width": "390",
                              "cookie": this.cookie,
                              "user-agent": this.UA
                              },
                              "agent": this.agent,
                              "body": null,
                              "method": "GET"
                          });
                          const resData = await res11.text()

                          data.dtsg = resData.match(/(?<=\"token\":\")[^\"]*/g).filter(item => item.startsWith('NA'))[0]
  
                          console.log(data.dtsg)
                        
                        
                        const res1 = await fetch("https://m.facebook.com/checkpoint/601051028565049/submit/", {
                            "headers": {
                              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                              "accept-language": "vi",
                              "cache-control": "max-age=0",
                              "content-type": "application/x-www-form-urlencoded",
                              "dpr": "1",
                              "priority": "u=0, i",
                              "sec-ch-prefers-color-scheme": "light",
                              "sec-fetch-dest": "document",
                              "sec-fetch-mode": "navigate",
                              "sec-fetch-site": "same-origin",
                              "sec-fetch-user": "?1",
                              "upgrade-insecure-requests": "1",
                              "viewport-width": "390",
                              "Referer": "https://m.facebook.com/checkpoint/601051028565049/?next=https%3A%2F%2Fm.facebook.com%2Flogin%2Fsave-device%2F&wtsid=rdr_0HsPUQShEynGvsgUe&_rdr",
                              "Referrer-Policy": "strict-origin-when-cross-origin",
                              "cookie": this.cookie,
                              "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "body": "jazoest="+this.jazoest+"&fb_dtsg="+data.dtsg+"",
                            "method": "POST",
                          });
                            
                        } catch  {}
                        
                        const res = await fetch("https://business.facebook.com/billing_hub/payment_settings/", {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "en-US,en;q=0.9",
                                "dpr": "0.8999999761581421",
                                "priority": "u=0, i",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "none",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "body": null,
                            "method": "GET"
                        })

                        html = await res.text()

                    } else {

                        html = await res.text()

                        data.dtsg = html.match(/(?<=\"token\":\")[^\"]*/g).filter(item => item.startsWith('NA'))[0]

                    }

                    data.accessToken = html.match(/(?<=\"accessToken\":\")[^\"]*/g).filter(item => item.startsWith('EAAG'))[0]


                } catch (err) {

                    const res = await fetch("https://adsmanager.facebook.com/adsmanager/manage/campaigns", {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "accept-language": "en-US,en;q=0.9",
                            "dpr": "0.8999999761581421",
                            "priority": "u=0, i",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "none",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "cookie": this.cookie,
                        },
                        "agent": this.agent,
                        "body": null,
                        "method": "GET"
                    })

                    url = res.url

                    try {

                        const html = await res.text()

                        const act = html.split('campaigns?act=')[1].split('&breakdown_regrouping=1&nav_source=no_referrer')[0]

                        const res1 = await fetch('https://adsmanager.facebook.com/adsmanager/manage/campaigns?act='+act+'&breakdown_regrouping=1&nav_source=no_referrer', {
                            "headers": {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                "accept-language": "en-US,en;q=0.9",
                                "dpr": "0.8999999761581421",
                                "priority": "u=0, i",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "none",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                "cookie": this.cookie,
                            },
                            "agent": this.agent,
                            "body": null,
                            "method": "GET"
                        })

                        const html2 = await res1.text()

                        data.accessToken = html2.match(/window.__accessToken="(.*)";/).filter(item => item.startsWith('EAAB'))[0]
                        data.dtsg = html2.match(/(?<=\"token\":\")[^\"]*/g).filter(item => item.startsWith('NA'))[0]


                    } catch (err) {
                        
                    }

                }

                if (url.includes('checkpoint/828281030927956') || url.includes('checkpoint%2F828281030927956')) {

                    //if (html.includes('/x/checkpoint/828281030927956/stepper/?token=')) {
                        data.status = false
                        data.checkPoint = 'Checkpoint Mail'
                    // } else {
                    //     data.status = false
                    //     data.checkPoint = 'Khóa hòm'
                    // }

                } else if (url.includes('consent/reconciliation_3pd_blocking')) {

                    data.status = false
                    data.checkPoint = 'Tạm thời bị chặn'

                } else if (url.includes('facebook.com/confirmemail.php') || url.includes('facebook.com/confirmation/contactpoint_bouncing')) {

                    data.status = false
                    data.checkPoint = 'Checkpoint Verify'
                    data.url = res.url
    
                } else if (url.includes('1501092823525282')) {

                    data.status = false
                    data.checkPoint = 'Checkpoint 282'

                } else if (url.includes('facebook.com/checkpoint/disabled')) {

                    data.status = false
                    data.checkPoint = 'Vô Hiệu hóa'

                }

                if (!data.dtsg || !data.accessToken) {

                    data.status = false
                } else {
                    this.dtsg = data.dtsg
                    this.accessToken = data.accessToken
                }


            } catch (err) {

                data.status = false
            }

            resolve(data)

        })
    }

    checkSupport() {
        return new Promise(async (resolve, reject) => {

            let status = 'ERROR'

            try {

                const res = await fetch('https://www.facebook.com/business/help/support', {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "redirect": "manual",
                })

                const url = res.headers.get('location')

                if (url === 'https://www.facebook.com/business/help/support') {
                    status = 'YES'
                } else {
                    status = 'NO'
                }

            } catch {}

            resolve(status)

        })
    }

    checkDating () {
        return new Promise(async (resolve, reject) => {

            try {


                const res = await fetch('https://www.facebook.com/dating/get-started', {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })

                const html = await res.text()

                if (html.includes('itunes.apple.com')) {
                    resolve('YES')
                } else {
                    resolve('NO')
                }

            } catch {
                resolve('')
            }

        })
    }

    getFriends() {
        return new Promise(async (resolve, reject) => {

            try {

                const accessToken = this.accessToken

                const res = await fetch('https://graph.facebook.com/v14.0/me?fields=friends&access_token='+accessToken, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })
    
                const data = await res.json()
        
                resolve(data.friends.summary.total_count)

            } catch (err) {

                reject(err)
            }

        })
    }

    createBm(type, name) {
        return new Promise(async (resolve, reject) => {
            const uid =  this.uid
            const dtsg =  this.dtsg

            const bmName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            console.log(bmName)

            let createBmSuccess = false

            try {

                if (type === '350') {

                    const res = await fetch("https://business.facebook.com/api/graphql/", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": "av="+uid+"&__usid=6-Trf0mkxer7rg4%3APrf0mkv1xg9ie7%3A0-Arf0mkxurlzsp-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__dyn=7xeUmwkHgmwn8K2WnFwn84a2i5U4e1Fx-ewSyo9Euxa0z8S2S7o760Boe8hwem0nCq1ewcG0KEswaq1xwEwlU-0nSUS1vwnEfU7e2l0Fwwwi85W1ywnEfogwh85qfK6E28xe3C16wlo5a2W2K1HwywnEhwxwuUvwbW1fxW4UpwSyES0gq5o2DwiU8UdUco&__csr=&__req=s&__hs=19187.BP%3Abizweb_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1005843971&__s=xpxflz%3A1mkqgj%3Avof03o&__hsi=7120240829090214250&__comet_req=0&fb_dtsg="+dtsg+"&jazoest=25414&lsd=8VpPvx4KH5-Ydq-I0JMQcK&__spin_r=1005843971&__spin_b=trunk&__spin_t=mftool&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBEGeoBMCreation_CreateBusinessMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%226%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22business_name%22%3A%22"+encodeURIComponent(bmName)+"%22%7D%7D&server_timestamps=true&doc_id=5232196050177866"
                    })

                    const resData = await res.text()

                    if (resData.includes('{"data":{"fbe_create_business":{"id":"')) {
                        createBmSuccess = true
                    }
                }

                if (type === '50') {
                    
                    const res = await fetch("https://business.facebook.com/api/graphql/", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": 'fb_dtsg='+dtsg+'&variables={"input":{"client_mutation_id":"4","actor_id":"'+uid+'","business_name":"'+encodeURIComponent(bmName)+'","user_first_name":"Tool","user_last_name":"FB%20'+randomNumberRange(111111, 99999)+'","user_email":"toolfb'+randomNumberRange(111111, 99999)+'@gmail.com","creation_source":"MBS_BUSINESS_CREATION_PROMINENT_HOME_CARD"}}&server_timestamps=true&doc_id=7183377418404152'
                    })

                    const resData = await res.text()

                    if (resData.includes('{"data":{"bizkit_create_business":{"id":"')) {
                        createBmSuccess = true
                    }

                }

                if (type === 'over') {

                    const res = await fetch("https://business.facebook.com/business/create_account/?brand_name="+encodeURIComponent(bmName)+"&first_name=Tool&last_name=FB%20"+randomNumberRange(111111, 99999)+"&email=toolfb"+randomNumberRange(111111, 99999)+"@gmail.com&timezone_id=132&business_category=OTHER", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": "__user="+uid+"&__a=1&__dyn=7xeUmwkHg7ebwKBWo5O12wAxu13wqovzEdEc8uw9-dwJwCw4sxG4o2vwho1upE4W0OE2WxO0FE662y0umUS1vwnE2Pwk8884y1uwc63S482rwKxe0y83mwkE5G0zE5W0HUvw5rwSyES0gq0Lo6-1FwbO&__csr=&__req=1b&__hs=19300.BP:brands_pkg.2.0.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1006542795&__s=fx337t:hidf4p:qkhu11&__hsi=7162041770829218151&__comet_req=0&fb_dtsg="+dtsg+"&jazoest=25796&lsd=7qUeMnkz4xy0phFCtNnkTI&__aaid=523818549297438&__spin_r=1006542795&__spin_b=trunk&__spin_t=1667542795&__jssesw=1"
                    })

                    const resData = await res.text()

                    if (resData.includes('"payload":"https:')) {
                        createBmSuccess = true
                    }
                    

                }

                if (type === 'xmdt') {
                    
                    const res = await fetch("https://business.facebook.com/api/graphql/", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": 'av='+uid+'&__usid=6-Trf0mkxer7rg4:Prf0mkv1xg9ie7:0-Arf0mkxurlzsp-RV=6:F=&__user='+uid+'&__a=1&__dyn=7xeUmwkHgmwn8K2WnFwn84a2i5U4e1Fx-ewSyo9Euxa0z8S2S7o760Boe8hwem0nCq1ewcG0KEswaq1xwEwlU-0nSUS1vwnEfU7e2l0Fwwwi85W1ywnEfogwh85qfK6E28xe3C16wlo5a2W2K1HwywnEhwxwuUvwbW1fxW4UpwSyES0gq5o2DwiU8UdUco&__csr=&__req=s&__hs=19187.BP:bizweb_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1005843971&__s=xpxflz:1mkqgj:vof03o&__hsi=7120240829090214250&__comet_req=0&fb_dtsg='+dtsg+'&jazoest=25414&lsd=8VpPvx4KH5-Ydq-I0JMQcK&__spin_r=1005843971&__spin_b=trunk&__spin_t=toolfb&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBEGeoBMCreation_CreateBusinessMutation&variables={"input":{"client_mutation_id":"6","actor_id":"'+uid+'","business_name":"'+encodeURIComponent(bmName)+'"}}&server_timestamps=true&doc_id=5232196050177866'
                    })

                    const resData = await res.text()

                    if (resData.includes('{"data":{"fbe_create_business":{"id":"')) {
                        createBmSuccess = true
                    }

                }

            } catch (err) {
                console.log(err)
            }

            if (createBmSuccess) {
                resolve()
            } else {
                reject()
            }
        })
    }

    getBmStatus() {

        return new Promise(async (resolve, reject) => {

            const uid = this.uid
            const dtsg = this.dtsg

            try {

                const res = await fetch('https://business.facebook.com/api/graphql/', {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    method: "POST",
                    body: "fb_dtsg="+dtsg+"&variables={}&doc_id=4941582179260904"
                })

                const data = await res.json()

                const bmData = data.data.viewer.ad_businesses.nodes.map(item => {

                    let status = ''
                    let text = ''

                    if (item.advertising_restriction_info.status === 'NOT_RESTRICTED' && !item.advertising_restriction_info.is_restricted) {
                        status = 'LIVE'
                        text = 'Live'
                    }

                    if (item.advertising_restriction_info.status === 'VANILLA_RESTRICTED' && item.advertising_restriction_info.is_restricted || item.advertising_restriction_info.status === 'APPEAL_INCOMPLETE') {
                        status = 'DIE'
                        text = 'Die'
                    }

                    //item.advertising_restriction_info.status === 'VANILLA_RESTRICTED' && item.advertising_restriction_info.is_restricted && item.advertising_restriction_info.additional_parameters?.ufac_state === 'FAILED'

                    if (item.advertising_restriction_info.status === 'APPEAL_REJECTED_NO_RETRY' && item.advertising_restriction_info.is_restricted) {
                        status = 'DIE_VV'
                        text = 'Die vĩnh viễn'
                    }
                    
                    if (item.advertising_restriction_info.status === 'APPEAL_REJECTED') {
                        status = 'DIE_VV'
                        text = 'Die vĩnh viễn'
                    }

                    if (item.advertising_restriction_info.status === 'APPEAL_PENDING') {
                        status = 'DIE_DK'
                        text = 'Die đang kháng'
                    }

                    if (item.advertising_restriction_info.status === 'APPEAL_ACCEPTED') {

                        if (item.advertising_restriction_info.restriction_type === 'ALE') {
                            status = 'BM_KHANG'
                            text = 'BM kháng 3 dòng'
                        } else {

                            if (!item.advertising_restriction_info.is_restricted) {

                                status = 'BM_KHANG'
                                text = 'BM kháng'

                            } else {

                                status = 'DIE_VV'
                                text = 'Die vĩnh viễn'

                            }

                        }
                    }

                    return {
                        id: item.id,
                        type: status,
                        name: item.name,
                        text,
                        status: item.advertising_restriction_info.status,
                        is_restricted: item.advertising_restriction_info.is_restricted,
                        restriction_type: item.advertising_restriction_info.restriction_type,
                        avatar: item.profile_picture.uri
                    }
                })

                let promises = []

                for (let index = 0; index < bmData.length; index++) {
                    
                    if (bmData[index].type === 'DIE') {

                        const checkDie = () => {
                            return new Promise(async (resolve, reject) => {
                                try {
        
                                    const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=1", {
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
                                            "cookie": this.cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "method": "POST",
                                        "body": "av="+uid+"&__usid=6-Ts626y2arz8fg%3APs626xy1mafk6f%3A0-As626x5t9hdw-RV%3D6%3AF%3D&session_id=3f06e26e24310de8&__user="+uid+"&__a=1&__req=1&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574318&__s=bgx31o%3A93y1un%3Aj1i0y0&__hsi=7315329750708113449&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o2oCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK3eUbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lx3wlF8C221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg="+dtsg+"&jazoest=25595&lsd=XBGCglH3K63SPddlSyNKgf&__aaid=0&__bid=745415083846542&__spin_r=1010574318&__spin_b=trunk&__spin_t=1703232934&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22"+bmData[index].id+"%22%7D&server_timestamps=true&doc_id=24196151083363204",
                                    })

                                    const data = await res.json()
        
                                    const advertising_restriction_info = data.data.assetOwnerData.advertising_restriction_info
        
                                    if (advertising_restriction_info.status === 'VANILLA_RESTRICTED' && advertising_restriction_info.is_restricted && advertising_restriction_info.additional_parameters.ufac_state === 'FAILED') {
                                        bmData[index].type = 'DIE_VV'
                                        bmData[index].text = 'Die vĩnh viễn'
                                    }
        
                                } catch {}

                                resolve()
                            })
                        }

                        promises.push(checkDie())

                    }
                    
                }

                await Promise.all(promises)

                resolve(bmData)

            } catch (err) {

                reject(err)
            }
    
        })
    }

    deactiveAdAccount (id) {
        return new Promise(async (resolve, reject) => {

            try {

                const res = await fetch("https://adsmanager.facebook.com/ads/ajax/account_close/?_callFlowletID=5557&_triggerFlowletID=5734", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "body": "account_id="+id+"&flow_session_id=uplserver_1725012566_7bcb5ec7-bd36-4132-8321-42a1c60ab17f&session_id=uplserver_1725012566_7bcb5ec7-bd36-4132-8321-42a1c60ab17f&__usid=6-Tsj0zp71v97zw4%3APsj100nrete4w%3A1-Asj0zp713sekkb-RV%3D6%3AF%3D&__aaid="+id+"&__user="+this.uid+"&__a=1&__req=1j&__hs=19965.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1016105196&__s=jiw5tm%3Awepyfs%3Ajmbmd0&__hsi=7408871461852448341&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3K2KmeGqKi5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF8pK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8tKU-4U-UG7F8a898vCxeq4qz8gwDzElx63Si6UjzUS324UGaxa2h2ppEryrhUK5Ue8Su6Ey3maUjxy-dxiFAm9KcyoC2GZ3UC2C8ByoF1a58gx6bxa4oOE88ymqaUK2e4E42byE6-uvAxO0yVoK3Cd868g-cwNxaHjwCwXDDzFLxny9onxDwBwXx67HxtBxO64uWg-26q2au5onADzEHDUK54VoC5EaUCi2K5ElhbAwAK4kUy2iijDix68VUOuEy68WaJ129g&__csr=&__comet_req=25&fb_dtsg="+this.dtsg+"&jazoest=25234&lsd=bSe70uRDvXwM-OtNPhtV1g&__spin_r=1016105196&__spin_b=trunk&__spin_t=1725012311&__jssesw=1",
                    "method": "POST"
                })

                const resData = await res.text()

                console.log(resData)

                if (!resData.includes('error')) {
                    resolve()
                } else {
                    reject()
                }

            } catch (err) {
                reject(err)
            }

        })

    }

    getMainAdAccount () {
        return new Promise(async (resolve, reject) => {

            const uid = this.uid
            const dtsg = this.dtsg

            try {
        
                const data = "__usid=6-Trkmfmjt08e28%3APrkmfmhj7dv0z%3A0-Arkmfmjfurewq-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__dyn=7xeUmxa3-Q8zo5ObwyyVuCFohK49o9E4a2imeGqErG6EHoO366UvzEdF98SmcBxWE-1MxKdwJzUKaBzogwCxO482ey8G6EhwGxV0FwGxa4o88W1bg9po4q2S2qq1eCBBK2J17wJRiG6lg8Ro4uU9onwu8sxF12m2afBzob8jx63KdxG1nULz89U-1qxm1Tz8twAKdxW32fwnoO4oeoapUC7U9k2CcAzE8U984678-3K5E5W7S6UgzE8EhAy88rwzzUWfxe1dwWxyE4mewpp8fUS2W2K4E98jK2m685Wu0FUkyFoqwZCx23e68K2u48hxabDyoNodEGdzUjwnUfU4au0HVo4K2e4e1mAwABwiUpwCwNw&__csr=&__req=g&__hs=19296.BP%3Aads_manager_pkg.2.0.0.0.0&dpr=1&__ccg=UNKNOWN&__rev=1006496828&__s=rm6xvl%3Az2lrzx%3Aetvf24&__hsi=7160680085992619893&__comet_req=0&fb_dtsg="+dtsg+"&jazoest=25287&lsd=7E8ffN4ir_Ib4NqMi6HERh&__spin_r=1006496828&__spin_b=trunk&__spin_t=1667225753&__jssesw=1"
    
                const res = await fetch('https://www.facebook.com/business/navigation/?global_scope_id='+uid+data, {
                    headers: {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    agent: this.agent,
                    method: 'POST',
                })
    
                const html = await res.text()

                const match = html.match(/act=([^&]+)/)
    
                if (match) {
                    resolve(match[1])
                } else {
                    reject()
                }

            } catch  {
                reject()
            }
    
        })
    }

    getMainAdAccount2 () {
        return new Promise(async (resolve, reject) => {

            try {
            
                const res = await fetch('https://adsmanager.facebook.com/adsmanager/manage/ad_account_settings', {
                    headers: {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    agent: this.agent,
                })

                const resData = await res.text()
                
                const id = resData.split('ad_account_settings?act=')[1].split('&')[0]
    
                resolve(id)
              

            } catch  {
                reject()
            }
    
        })
    }

    check273(id) {
        return new Promise(async (resolve, reject) => {

            const dtsg =  this.dtsg
            const uid = this.uid

            let status = false

            try {

                const res = await fetch("https://www.facebook.com/api/graphql/?", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "method": "POST",
                    "agent": this.agent,
                    "body": "av="+uid+"&__usid=6-Ts3dqwl1d2saj%3APs3dqww19j66f0%3A0-As3dqvm1uufhhw-RV%3D6%3AF%3D&session_id=24d1640f6048cdc4&__user="+uid+"&__a=1&__req=1&__hs=19661.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009583025&__s=8w5mcb%3A2tg64k%3Apshhn3&__hsi=7296003472047894728&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o461mCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyUszUiwExq1yxJUpx2aK2a4p8y26UcXwKwjovCxeq4qxS1cwjUd8-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U4y0CpU2RwhoaogU5qi9wwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25766&lsd=bR5OxrMb_uxUX_8bKV64xQ&__aaid=635974613136523&__spin_r=1009583025&__spin_b=trunk&__spin_t=1698733183&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewQuery&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=7271073246287557",
                })

                const data = await res.json()

                if (data.data?.adAccountData?.advertising_restriction_info?.restriction_type === 'PREHARM')  {
                    status = true
                } else {
                    status = false
                }


            } catch {
                status = false
            }

            resolve(status)


        })
    }

    checkHold(id) {
        return new Promise(async (resolve, reject) => {

            const dtsg =  this.dtsg
            const uid = this.uid

            const data = {
                status: false,
                country: ''
            }

            try {

                const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=1", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "av="+uid+"&__usid=6-Ts51f1w1gfkvpj%3APs51f2gvheire%3A0-As51f1wdhal3d-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=8&__hs=19693.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010170946&__s=ew2ohe%3Afdtegc%3A7il5yk&__hsi=7307960693527437806&__dyn=7xe6Eiw_K5U5ObwyyVp6Eb9o6C2i5VGxK7oG484S7UW3qiidBxa7GzU721nzUmxe1Bw8W4Uqx619g5i2i221qwa62qq1eCBBwLghUbpqG6kE8Ro4uUfo7y78qggwExm3G4UhwXwEwlU-0DU2qwgEhxW10wv86eu1fgaohzE8U6q78-3K5E7VxK48W2a4p8y26UcXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYwGxe1uwciawaG13xC4oiyVV98OEdEGdwzweau0Jomwm8gU5qi2G1bzEG2q362u1IxK321VDx27o72&__csr=&fb_dtsg="+dtsg+"&jazoest=25595&lsd=_WnEZ0cRpYEKpFXHPcY7Lg&__aaid="+id+"&__spin_r=1010170946&__spin_b=trunk&__spin_t=1701517192&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingHubPaymentSettingsViewQuery&variables=%7B%22assetID%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6747949808592904",
                })

                const resData = await res.text()

                const countryMatch = resData.match(/(?<=\"predicated_business_country_code\":\")[^\"]*/g)

                if (countryMatch[0]) {
                    data.country = countryMatch[0]
                }

                if (resData.includes('RETRY_FUNDS_HOLD'))  {
                    data.status = true
                } else {
                    data.status = false
                }


            } catch {
                data.status = false
            }

            resolve(data)

        })
    }


    getAdAccounts () {

        return new Promise(async (resolve, reject) => {

            try {
    
        
                const res = await fetch("https://graph.facebook.com/v14.0/me/adaccounts?limit=9999999999&fields=name,profile_picture,account_id,account_status,is_prepay_account,owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},balance,owner,users{id,is_active,name,permissions,role,roles},insights.date_preset(maximum){spend},userpermissions.user("+this.uid+"){role}&access_token="+this.accessToken+"&summary=1&locale=en_US", {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "vi",
                        "cache-control": "max-age=0",
                        "dpr": "1",
                        "priority": "u=0, i",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })
                
                const accounts = await res.json()

                accounts.data = accounts.data.filter(item => !item.owner_business)

                const res2 = await fetch("https://graph.facebook.com/v14.0/me/businesses?limit=99999&access_token="+this.accessToken, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "vi",
                        "cache-control": "max-age=0",
                        "dpr": "1",
                        "priority": "u=0, i",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })

                const accounts2 = await res2.json()

                const existed = accounts.data.map(item => item.account_id)

                if (accounts2.data) {

                    const getAccount = (id, type) => {
                        return new Promise(async (resolve, reject) => {

                            try {

                                const res = await fetch('https://graph.facebook.com/v14.0/'+id+'/'+type+'?access_token='+this.accessToken+'&pretty=1&fields=name%2Cprofile_picture%2Caccount_id%2Caccount_status%2Cis_prepay_account%2Cowner_business%2Ccreated_time%2Cnext_bill_date%2Ccurrency%2Cadtrust_dsl%2Ctimezone_name%2Ctimezone_offset_hours_utc%2Cdisable_reason%2Cadspaymentcycle%7Bthreshold_amount%7D%2Cbalance%2Cowner%2Cusers%7Bid%2Cis_active%2Cname%2Cpermissions%2Crole%2Croles%7D%2Cinsights.date_preset%28maximum%29%7Bspend%7D%2Cuserpermissions.user%28100029138032182%29%7Brole%7D&limit=50', {
                                    "headers": {
                                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                                        "accept-language": "vi",
                                        "cache-control": "max-age=0",
                                        "dpr": "1",
                                        "priority": "u=0, i",
                                        "sec-fetch-dest": "document",
                                        "sec-fetch-mode": "navigate",
                                        "sec-fetch-site": "same-origin",
                                        "sec-fetch-user": "?1",
                                        "upgrade-insecure-requests": "1",
                                        "cookie": this.cookie,
                                        "user-agent": this.UA
                                    },
                                    "agent": this.agent,
                                })

                                const resData = await res.json()

                                resData.data.forEach(item => {

                                    if (!existed.includes(item.account_id)) {
                                        accounts.data.push(item)
                                        existed.push(item.account_id)
                                    }
                                })

                                let next = resData.paging.next

                                if (next) {

                                    for (let index = 0; index < 9999; index++) {
                                        
                                        const res = await fetch(next)
                                        const resData = await res.json()

                                        if (resData.data) {

                                            resData.data.forEach(item => {


                                                if (!existed.includes(item.account_id)) {
                                                    accounts.data.push(item)
                                                    existed.push(item.account_id)
                                                }
                                            })

                                        }

                                        if (resData.paging.next) {
                                            next = resData.paging.next
                                        } else {
                                            break
                                        }
                                        
                                    }

                                }

                            } catch (err) {
                                
                            }

                            resolve()

                        })

                    }

                    const promises = []

                    for (let index = 0; index < accounts2.data.length; index++) {
                        
                        const bm = accounts2.data[index]

                        promises.push(getAccount(bm.id, 'owned_ad_accounts'))
                        promises.push(getAccount(bm.id, 'client_ad_accounts'))

                    }

                    await Promise.all(promises)

                }

                if (accounts.data) {

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

                    resolve(accounts.data.map(item => {
                        
                        item.limit = item.adtrust_dsl
                        item.prePay = item.is_prepay_account ? 'TT' : 'TS'
                        item.threshold = item.adspaymentcycle ? item.adspaymentcycle.data[0].threshold_amount : ''
                        item.remain = (item.threshold - item.balance)
                        item.spend = item.insights ? item.insights.data[0].spend : '0'
                        item.users = item.users ? item.users.data : []

                        const nextBillDate = moment(item.next_bill_date)
                        const now = moment()

                        const convert = ['EUR', 'CHF', 'BRL', 'USD', 'CNY', 'MYR', 'UAH', 'QAR', 'THB', 'THB', 'TRY', 'GBP', 'PHP', 'INR']

                        if (convert.includes(item.currency)) {
                            item.balance = (Number(item.balance) / 100)
                            item.threshold = (Number(item.threshold) / 100)
                            item.remain = (Number(item.remain) / 100)
                        }

                        // item.limit = (new Intl.NumberFormat('en-US').format(item.limit)).replace('NaN', '')
                        // item.spend = (new Intl.NumberFormat('en-US').format(item.spend)).replace('NaN', '')
                        // item.remain = (new Intl.NumberFormat('en-US').format(item.remain)).replace('NaN', '')
                        // item.balance = (new Intl.NumberFormat('en-US').format(item.balance)).replace('NaN', '')
                        // item.threshold = (new Intl.NumberFormat('en-US').format(item.threshold)).replace('NaN', '')

                        if (!item.cards) {
                            item.cards = []
                        }

                        //const admin = item.users.filter(item => item.role === 1001)
                        
                        return {
                            name: item.name,
                            status: item.account_status,
                            id: item.account_id,
                            balance: item.balance,
                            threshold: item.threshold,
                            spend: item.spend,
                            createdTime: moment(item.created_time).format('DD/MM/YYYY'),
                            nextBillDate: nextBillDate.format('DD/MM/YYYY'),
                            timezoneName: item.timezone_name,
                            limit: item.limit,
                            role: item.userpermissions?.data[0]?.role || 'UNKNOWN',
                            currency: item.currency+'-'+item.prePay,
                            disableReason: reasons[item.disable_reason],
                            countryCode: item.business_country_code ?? '',
                            prePay: item.is_prepay_account ? 'TT' : 'TS',
                            ownerBusiness: item.owner_business ? item.owner_business.id : null,
                            users: item.users ? item.users.data : []
                        }

                    }))

                } else {
                    reject()
                }

            } catch (err) {
                reject(err)
            }
        })
    }

    getBmLimit(id) {
    
        return new Promise(async (resolve, reject) => {

            try {
            
                const res = await fetch("https://business.facebook.com/business/adaccount/limits/?business_id="+id, {
                    headers: {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    agent: this.agent,
                    body: "__user="+this.uid+"&__a=1&__req=o&__hs=19540.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007781368&__s=qz2hlv%3Ay60rbc%3Ar5xvs9&__hsi=7251060620459517467&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o461twOxa7FEd89EmwoU9FE4WqbwLjzocJ5wglDwRyXxK261UxO4UkK2y5oeE9oeUa8fGxnzoO1Wxu0zoO12ypUuwg88EeAUpK1vDwyCwBgak48W18wRwEwiUmwnHxJxK48GU8EhAy88rwzzXx-ewjoiz9EjCx6221cwjV8bU-dwKwHxa1oxqbwk8Sp1G3WcyU98-5aDBwEBwKG3qcy85i4oKqbDyo-2-qaUK2e0UFU6K19wrU6CiU9E4KeCK2q1pwjouwg825w&__csr=&fb_dtsg="+this.dtsg+"&jazoest=25326&lsd=JyUQ2yg8yXD0xQDkPPa1v8&__bid="+id+"&__spin_r=1007781368&__spin_b=trunk&__spin_t=1688269111&__jssesw=1",
                    method: "POST",
                })

                const bmData = await res.text()
        
                const result = JSON.parse(bmData.replace('for (;;);', ''))
        
                if (result.payload) {
                    resolve(result.payload.adAccountLimit)
                } else {
                    reject()
                }

            } catch (err) {

                console.log(err)
                reject()
            }
    
        })
    }

    removeBmPage(id, id2) {
        return new Promise(async (resolve, reject) => {
            try {

                const pageCookie = this.cookie+';i_user='+id
                

                const res = await fetch("https://www.facebook.com/settings/?tab=profile_access", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,vi;q=0.7",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "priority": "u=1, i",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"10.0.0\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-asbd-id": "129477",
                        "x-fb-friendly-name": "CometNotificationsDropdownQuery",
                        "x-fb-lsd": "eeu7CBLSHdnw0HALUUUQ6S",
                        "cookie": pageCookie,
                        "user-agent": this.UA,
                    },
                    "agent": this.agent,
                })

                const resData = await res.text()

                const bmId = resData.split('"businessID":"')[1].split('"')[0]

                if (bmId) {
                    const res2 = await fetch("https://business.facebook.com/business/asset_onboarding/business_remove_page/", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,vi;q=0.7",
                            "cache-control": "no-cache",
                            "content-type": "application/x-www-form-urlencoded",
                            "pragma": "no-cache",
                            "priority": "u=1, i",
                            "sec-ch-prefers-color-scheme": "light",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-model": "\"\"",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-ch-ua-platform-version": "\"10.0.0\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-asbd-id": "129477",
                            "x-fb-lsd": "YHPk_xwyJVTNwseQ_edr-E",
                            "cookie": this.cookie,
                            "user-agent": this.UA,
                        },
                        "agent": this.agent,
                        "body": "event_source=PCM&business_id=" + bmId + "&page_id=" + id2 + "&session_id=ad31c7dc-3130-45e0-9458-8ef077d610b9&__aaid=0&__bid=" + bmId + "&__user=" + this.uid + "&__a=1&__req=9&__hs=20075.BP:DEFAULT.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1018957020&__s=e0q5v9:n2onic:6zuykz&__hsi=7449646404857994590&__dyn=7xeUmF3EfXolwCwRyUbFp62-m2q3K2K5Uf9E6C7UW3q5UgDxW4E2czobo2fw9m4E9ohy82mwho1upE4WUaUy742p2o467Uvw9u4Uowuo9oeUa86u0nS4o5-0ha2l2Utg6y1uwci3G48comwkE-3a0y83mwkE5G4E6u4U5W0HUkw5CwSyES0gq0Lo6-1FAw8m360NE1UU7u1rwGwbu&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25364&lsd=YHPk_xwyJVTNwseQ_edr-E&__spin_r=1018957020&__spin_b=trunk&__spin_t=1734505967&__jssesw=1",
                        "method": "POST"
                    });
    
                    const resData2 = await res2.text();

                    if (!resData2.includes('error')) {
                        resolve();
                    } else {
                        reject();
                    }
                } else {
                    
                    resolve();
                }

            } catch (err) {
                reject(err)
            }
        })
    }

    getBm() {

        return new Promise(async (resolve, reject) => {

            const accessToken = this.accessToken

            try {
            
                const res = await fetch("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,adtrust_dsl,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1)&limit=9999999&access_token="+accessToken, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })
        
                const data = await res.json()

                if (data.data) {
                    resolve(data.data)
                } else {
                    reject()
                }

            } catch (err) {
                console.log(err)
                reject(err)
            }
    
        })
    }

    backupBm(id, email, number, role, delay) {
        
        return new Promise(async (resolve, reject) => {
            
            const accessToken =  this.accessToken

            try {

                const domain = email.split('@')[1].split('|')[0]

                let roleList = ''

                if (role === 'admin') {
                    roleList = '["DEFAULT","MANAGE","DEVELOPER","EMPLOYEE","ASSET_MANAGE","ASSET_VIEW","PEOPLE_MANAGE","PEOPLE_VIEW","PARTNERS_VIEW","PARTNERS_MANAGE","PROFILE_MANAGE"]'
                }

                if (role === 'other') {
                    roleList = '["DEFAULT","EMPLOYEE"]'
                }

                for (let index = 0; index < number; index++) {
                    
                    const mail = email.split('@')[0]+'+'+randomNumberRange(1111111, 9999999)+'-'+id+'@'+domain

                    try {

                        await fetch("https://z-p3-graph.facebook.com/v3.0/"+id+"/business_users?access_token="+accessToken+"&__cppo=1", {
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
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "body": '__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&brandId='+id+'&email='+encodeURIComponent(mail)+'&method=post&pretty=0&roles='+roleList+'&suppress_http_code=1',
                        })

                    } catch {}

                    await delayTimeout(delay * 100)
                    
                }

                resolve()

            } catch (err) {

                reject()

            }

        })
    }

    renameBm(id, name) {
        return new Promise(async (resolve, reject) => {
    
            const accessToken =  this.accessToken

            const bmName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            try {

                const res = await fetch("https://z-p3-graph.facebook.com/v17.0/"+id+"?access_token="+accessToken+"&__cppo=1", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F"+id+"&_reqSrc=adsDaoGraphDataMutator&endpoint=%2F"+id+"&entry_point=business_manager_business_info&locale=vi_VN&method=post&name="+encodeURIComponent(bmName)+"&pretty=0&suppress_http_code=1&version=17.0&xref=f325d6c85530f9c",
                })

                const data = await res.json()

                if (data.id) {
                    resolve()
                } else {
                    reject()
                }

            } catch (err) {

                console.log(err)

                reject()

            }

        })
    }

    unlinkIg(pageId, pageId2) {
        return new Promise(async (resolve, reject) => {
            try {

                const pageCookie = this.cookie+';i_user='+pageId

                const res = await fetch("https://www.facebook.com/api/graphql/", {
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
                        "x-fb-friendly-name": "PageLinkInstagramMutationUnlinkMutation",
                        "x-fb-lsd": "gK-vGVmqRm2res5PDl0cZ1",
                        "cookie": pageCookie,
                        "user-agent": this.UA,
                        "Referer": "https://www.facebook.com/settings/?tab=linked_instagram",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "agent": this.agent,
                    "body": "av="+pageId+"&__aaid=0&__user="+pageId+"&__a=1&__req=c&__hs=20057.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1018532832&__s=qkea5j%3Ajpcxto%3A5dhui2&__hsi=7442976668432954622&__dyn=7AzHxqU5a5Q1ryUbFp41twWwIxu13wFwnUW3q32360CEbo19oe8hw6vwb-q7oc81EE2Cwwwqo462mcw5Mx62G5Usw9m1YwBgK7o6C0Mo2swlo5qfK0zEkxe2GewGw8Om2SU4i5o7G4-5o4q3y1MBwxwHwfC3eq2-azo2NwkQ0z8c86-bwHwNxe6Uak0zU8oC1Iwqo4e4UcEeE4WVU8EdouwjVqwLwHwGwbu&__csr=gkn5mwLfcPdAtsCzSG8z_J94h5A-OiGBdt4KiqXWLlzHgGp298yaRwUUGi7ebyF99bh4p6ABxCmRxx7yUCmXpbDDh8GumiUzKFHBUa4UbElyo5G2OeyooDDx57xa7ovyQqazVEmCwDzp47pUiwCy8rBwhoaU99FohU9o6m9yEbVE8EgxK1lweS8xu18U2VwRwAyE7q2C6E5a9wWw05JYw0eRum0pi0iVw15O0edw1gSE1hE3zxq0I80FW0vK&__comet_req=1&fb_dtsg="+this.dtsg+"&jazoest=25378&lsd=gK-vGVmqRm2res5PDl0cZ1&__spin_r=1018532832&__spin_b=trunk&__spin_t=1732953048&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PageLinkInstagramMutationUnlinkMutation&variables=%7B%22input%22%3A%7B%22entry_point%22%3A%22PROFILE_PLUS_SETTINGS%22%2C%22page_id%22%3A%22"+pageId2+"%22%2C%22actor_id%22%3A%22"+pageId+"%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22page_id%22%3A%22"+pageId2+"%22%7D&server_timestamps=true&doc_id=8322714381157374",
                    "method": "POST"
                })

                const data = await res.text()

                if (data.includes('XFBPageInstagramPresmaUnlinkedRenderer')) {
                    resolve()
                } else {
                    reject()
                }

            } catch (err) {
                reject(err)
            }
        })
    }

    createInstagram(pageId, pageId2) {
        return new Promise(async (resolve, reject) => {
            try {

                const pageCookie = this.cookie+';i_user='+pageId

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
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": "av="+pageId2+"&__usid=6-Tsnrnd11w4t438%3APsnrnd9iffmur%3A0-Asnrnd1r7aewt-RV%3D6%3AF%3D&__aaid=0&__user="+this.uid+"&__a=1&__req=q&__hs=20057.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1018533759&__s=18hhts%3Azz9h1s%3Ajcfl5b&__hsi=7443067055801362343&__dyn=7AzHJ16Aexp2u7-5k1ryUbFp62Gim2q3K2K5U4e2C1vzEdEnxiUco5S3O6Uhw8-E2iwUx60xU8E3Qwb-qbx6321Zm19wdu2O1VwwAwXwEwpUO0iS12x62G3i1ywOwv89kbxS1FwnE4K5E663G48W2a4p89HK2efK2W1vxi4UaEW2G1NwwwJK14xm4E5yexfxm16wUwtEkz8cE3BwMzUdEGdwzwea0Lo6-3u36i2G2B0LwNwNwDwr86C13wwwbe1wxW1owmUaEbU6q22&__csr=g4z8yijnf93Ard4PhsYKIy959jHb6Jn258_AbvZEZlEAYIHJF8GvtFl8HFpnlbAZlYTGl5rjjlpF-FcOASBiniFnuBFvXmAh9d9nGVbV4iRBnQAVp5hVFKG8OahqlaAV58it6KXBBBDQl_8FGzlOpeUGHAylyaWHmjWJaeAiBF2bDHAmV8wxFmq8hbjKUzAJdedUGla4oCqJmKhCGaAKdBmeyGgLDjCCLKmm9KFaDDKqiaLxerK-Fd3WBGVk9LgmhKQu5aCQeKmFoyaGidxK48h-aUymuc-iczUrzqxpaAmWV8Obp8-11ADyoy2mEKq4qAG7WHBCg9rG3Scxa5UsG4oRkEKHxe4awRzoe4rwzwkUG6Ee9Ue8jw6uG54bU24VQdG0oyfx6dw2vo6hyUV07NG480-61Lwa6iA2y1rwKwcDiw29E4q0q05gk5Nk2Dg7S2F0aK2GgAg1442Gw2NK0i22K1JzU16aw2Bag22y5EuE3ww2vK2u0ZU1lE6El802420wk017Tw4dOwi4fw3CS0U80a9Esw3z-awn0G4B1e0pKOG05bUF06ww2Rywc60kOw5e1apUl4N009bFz5wBwh8jyE410XIElwgUrw2So08TpYw-2u2Kdw1X9wgVE5ow1gU0D25vrIE3fw1Jq0pSlU0QWcO0824U0K1UgV9Caz8og9Qewm205Nxm0pq0iy0IoeE13rxacw17i1Uw&__comet_req=11&fb_dtsg="+this.dtsg+"&jazoest=25434&lsd=bJBfWFybhvQ1DqPe3vqR81&__spin_r=1018533759&__spin_b=trunk&__spin_t=1732974093&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=igCreationAndLoginMutationsCheckUserAndSendCodeByEmailMutation&variables=%7B%22device_id%22%3A%7B%22sensitive_string_value%22%3A%2218hhts%3Azz9h1s%3Ajcfl5b%22%7D%2C%22email%22%3A%7B%22sensitive_string_value%22%3A%22uoijoioiu%40oio.com%22%7D%2C%22username%22%3A%7B%22sensitive_string_value%22%3A%22oiuoisudf0sd9f%22%7D%2C%22ig_name%22%3A%7B%22sensitive_string_value%22%3A%22Toolfb%2035567%22%7D%2C%22enc_password%22%3A%7B%22sensitive_string_value%22%3A%22Hungj%22%7D%2C%22birthday%22%3A%7B%22sensitive_string_value%22%3A%222000-11-08%22%7D%7D&server_timestamps=true&doc_id=6151962731595562",
                    "method": "POST"
                })

                const data = await res.text()

                console.log(data)
                
            } catch (err) {
                reject(err)
            }
        })
    }

    getBmAccounts(id) {
        return new Promise(async (resolve, reject) => {
    
            try {

                const res = await fetch('https://business.facebook.com/api/graphql/?_callFlowletID=1&_triggerFlowletID=2', {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "body": "av="+this.uid+"&__usid=6-Tsfc23h1281ds6%3APsfc2w71bzxauu%3A0-Asfc23hiabbpt-RV%3D6%3AF%3D&__aaid=0&__bid="+id+"&__user="+this.uid+"&__a=1&__req=g&__hs=19893.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1014333729&__s=rikyig%3Ad3c2u0%3Ahklcnb&__hsi=7382236135753552199&__dyn=7xeUmxa2C6oCdwn8K2Wmhe5UkBw8W5VEdpE6C4UKewSAxam4Eco5S3O2S2q1VwqoqyojzoO4o2vwOwNCwQwCxq0yFE4WqbwQzobVqxN0Cm3S1dwu8swEK2y1gwBwXwEwgo9oO1WwamcwgECu7E422a3Gi6rxi1aDwFwBgao884y3m2y1bxq1yxJxK48G2q4p8aHwzzXwKwjovCxeq4ohzEaE8o4-224U-9K2W2K4E5yeDy-1ezo8EfEO32fxiF-3a2WE4e8yE4C4oKqbx6fwLCyKbwzweau0Jo6-3u36iU9E4KeCK2q362u1dxW6U98a84e69U158uwm85K&__csr=hs3l1f4gNEv4PkynRsCQiGnn9jNanheW9bqsYRlZEBYN2Rb9lhaJOkSACBb9hiaiCIzGCyitJbWVaF7nyZ924XjjGhYji9hyeCz4tA-p9XKWCZUhcdppWmj-i_iVLihuii8HBDCBJ6ypFVipEzyWKEGXgDCCBXDBBnzWgKnAyu9BBGvDKF4EiCx6tpVXzEO9yAGz94i9yRF5Qm9h8hCgKh2aUhyGDAx2EKF8kyU-4oW8AQi8Dz6QiC-K6pUGfG9Gcz8ixOVoCdAzuiK5FXAhEy4Emx2EuyoO6oKqq9KaWx7wokaxq5o9o98aotobUhxiqawkQ13wrJxecxa2W6U5yi2q682lDG0AE33O4wRF0kag0Hg8Qbw2nnFDgHF0ww35d6wlo-8zUNwb82E9y8mx11p0lhFB2g1320jE1uE1lA04fu0W42S04u80h-8221rA9mAEWhgFE8a2i2V1y3Wvw6uU4a5EaVE6bgkyEbmaqw1xS04h402Qu0lS1CwkME4AayhO81FwnU1aA2Jw77fDknaUiK442EayGcEeo7jeEijz748k0w0E5o510kYHy54N017Q0XUekq8gGz09nc0ti5u0gUx9QaCg2gw56w5I524a4Kq0WE2Fwf2UgwKw3n8pS4Q0e5w1vW0jF5PUFjeveEigkU3wIJ0r87904XHHzVo88G4oloclDU0n2w4cwk8051Gu045P06nw31pBw56x60Fy0Eo0u0g0QUEiz88Aawa2hw18a0ge0qa4U5q0cAwwU&__comet_req=11&fb_dtsg="+this.dtsg+"&jazoest=25295&lsd=&__spin_r=1014333729&__spin_b=trunk&__spin_t=1718810791&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitSettingsPeopleTableContainerQuery&variables=%7B%22businessID%22%3A%22"+id+"%22%2C%22searchTerm%22%3Anull%2C%22orderBy%22%3A%22NAME_ASCENDING%22%2C%22permissions%22%3A%5B%5D%2C%22asset_types%22%3A%5B%22PAGE%22%2C%22AD_ACCOUNT%22%2C%22PRODUCT_CATALOG%22%2C%22APP%22%2C%22PIXEL%22%2C%22INSTAGRAM_ACCOUNT_V2%22%2C%22OFFLINE_CONVERSION_DATA_SET%22%2C%22CUSTOM_CONVERSION%22%2C%22WHATSAPP_BUSINESS_ACCOUNT%22%2C%22BUSINESS_CREATIVE_FOLDER%22%2C%22EVENTS_DATASET_NEW%22%5D%2C%22isUnifiedSettings%22%3Afalse%2C%22businessAccessType%22%3A%5B%5D%2C%22businessUserStatusType%22%3A%5B%5D%7D&server_timestamps=true&doc_id=25827314413550348",
                    "method": "POST",
                })

                const data = await res.json()

                resolve(data.data.business.business_users_and_invitations.edges.filter(item => !item.nameColumn.invited_email).map(item => item.node.id))

            } catch {

                reject()

            }

        })
    }

    getMainBmAccounts(id) {
        return new Promise(async (resolve, reject) => {
    
            try {

                const res = await fetch('https://business.facebook.com/settings/info?business_id='+id, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })

                const html = await res.text()

                let mainIdMatch = html.match(/(?<=\"business_user_id\":\")[^\"]*/g)

                if (mainIdMatch[0]) {
                    resolve(mainIdMatch[0])
                } else {
                    reject()
                }

            } catch {

                reject()

            }

        })
    }

    createAdAccount(id, currency, timezone, name) {
        return new Promise(async (resolve, reject) => {
    
            const dtsg = this.dtsg 
            const uid = this.uid
            const accessToken =  this.accessToken

            const adName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            try {

                const main = await this.getMainBmAccounts(id)

                const res = await fetch("https://z-p3-graph.facebook.com/v17.0/"+id+"/adaccount?access_token="+accessToken+"&__cppo=1", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "method": "POST",
                    "agent": this.agent,
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abrand%2Fadaccount&_reqSrc=AdAccountActions.brands&ad_account_created_from_bm_flag=true&currency="+currency+"&end_advertiser="+id+"&invoicing_emails=%5B%5D&locale=vi_VN&media_agency=UNFOUND&method=post&name="+encodeURIComponent(adName)+"&partner=UNFOUND&po_number=&pretty=0&suppress_http_code=1&timezone_id="+timezone+"&xref=f240a980fd9969",
                })

                const data = await res.json()

                if (data.account_id) {

                    try {

                        await fetch("https://business.facebook.com/business/business_objects/update/permissions/", {
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
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "method": "POST",
                            "body": "asset_ids[0]="+res.account_id+"&asset_type=ad-account&business_id="+id+"&roles[0]=151821535410699&roles[1]=610690166001223&roles[2]=864195700451909&roles[3]=186595505260379&user_ids[0]="+main+"&__user="+uid+"&__a=1&__req=t&__hs=19662.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009606682&__s=2zimvz%3A8blg31%3A9mxlfz&__hsi=7296403044252789266&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o461twOxa7FEd89EmwoU9FE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WElUScwuEnw8ScwgECu7E422a3Fe6rwnVU8FE9k2B12ewi8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio4m2C4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg="+dtsg+"&jazoest=25484&lsd=M7V3k5fl_jTcOKm-KVKVe3&__aaid=0&__bid="+id+"&__spin_r=1009606682&__spin_b=trunk&__spin_t=1698826216&__jssesw=1",
                        })

                    } catch {}

                    resolve()

                } else {
                    reject()
                }

            } catch (err) {

                console.log(err)

                reject()

            }

        })
    }

    removeAccount(bm, id) {

        return new Promise(async (resolve, reject) => {

            try {

                const res = await fetch("https://business.facebook.com/business/asset_onboarding/business_remove_admin/", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "business_id="+bm+"&admin_id="+id+"&session_id=2e942068-0721-40b7-a912-4f89f3a72b0e&event_source=PMD&__aaid=0&__bid="+bm+"&__user="+this.uid+"&__a=1&__req=8&__hs=20010.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017311549&__s=n0exl1%3An9jvpp%3Af8agky&__hsi=7425567271958688187&__dyn=7xeUmF3EfXolwCwRyUbFp62-m2q3K2K5U4e1Fx-ewSxu68uxa0z8S2S0zU2EwBx60DU4m0nCq1eK2K8xN0CgC11x-7U7G78jxy1VwBwXwEwpU1eE4a4o5-0ha2l2Utg6y1uwiU7y3G48comwkE-3a0y83mwkE5G4E6u4U5W0HUkyE16Ec8-3qazo8U3ywbS1Lwqp8aE5G360NE1UU7u1rwGwbu&__csr=&fb_dtsg="+this.dtsg+"&jazoest=25473&lsd=lAqaEcMivHToYG0Fq_qw4b&__spin_r=1017311549&__spin_b=trunk&__spin_t=1728899607&__jssesw=1",
                })

                const data = await res.text()

                if (!data.includes('error')) {
                    resolve(true)
                } else {
                    resolve(false)
                }

            } catch (err) {
                console.log(err)
                resolve(false)
            }
        })
    }

    outBm(id) {
        return new Promise(async (resolve, reject) => {
            const accessToken = this.accessToken
            const uid = this.uid

            try {

                const res = await fetch("https://graph.facebook.com/v17.0/"+uid+"/businesses?access_token="+accessToken+"&__cppo=1", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F"+uid+"%2Fbusinesses&_reqSrc=adsDaoGraphDataMutator&business="+id+"&endpoint=%2F"+uid+"%2Fbusinesses&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&userID="+uid+"&version=17.0&xref=f2e80f8533bb1f4",
                })

                const data = await res.json()

                if (data.success) {
                    resolve()
                } else {
                    reject()
                }

            } catch {
                reject()
            }
        })
    }

    applyPage(id) {
        return new Promise(async (resolve, reject) => {

            const accessToken = this.accessToken

            try {
                
                const bmId = await this.getBmId()
                
                const res = await fetch("https://graph.facebook.com/v17.0/"+bmId+"?access_token="+accessToken, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F"+bmId+"&_reqSrc=adsDaoGraphDataMutator&endpoint=%2F"+bmId+"&entry_point=business_manager_settings_ad_accounts&locale=vi_VN&method=post&pretty=0&primary_page="+id+"&suppress_http_code=1&version=17.0&xref=fe82499b740a5c",
                })

                const data = await res.json()

                if (data.id) {
                    resolve()
                } else {
                    reject()
                }

            } catch (err) {
                reject(err)
            }
        })
    }

    getBmId() {
        return new Promise(async (resolve, reject) => {

            const accessToken =  this.accessToken

            try {

                const res = await fetch("https://graph.facebook.com/v14.0/me/businesses?fields=id&limit=9999999&access_token="+accessToken, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })

                const data = await res.json()
        
                resolve(data.data[0].id)
                    
            } catch (err) {
                reject(err)
            }

        })
    }

    getPage() {
        return new Promise(async (resolve, reject) => {
            try {

                const res = await fetch('https://graph.facebook.com/me/accounts?type=page&limit=999&fields=additional_profile_id,id,likes,followers_count,name,page_created_time&access_token='+this.accessToken, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })
                const data = await res.json()

                resolve(data.data)

            } catch(err) {
                reject(err)
            }
        })
    }

    checkLiveStream(id) {
        return new Promise(async (resolve, reject) => {

            const uid = this.uid
            const dtsg = this.dtsg

            try {

                const res = await fetch("https://business.facebook.com/api/graphql/", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "method": "POST",
                    "agent": this.agent,
                    "body": "av="+id+"&__user="+uid+"&__a=1&__req=1&__hs=19714.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010578883&__s=gbfpnk%3Asq06yi%3A1vjosc&__hsi=7315694075972505019&__dyn=7xeUmx3wgUnwn8yEqxemhwLBwqo98nyUdU765QdwPGiidz8K2aewhE9Eb8boG5-0g23y4o4O11wqU8E28wlU62WyU4a2-8z8Z0Cg11EswIK1bwFwBwXwEwgolzUO9w5Cx62G3i1ywOwv89k2C2218wIwNxK16w9O48W2a5E5afK1zw_xe2GewGwso88brwBy8aUiwBwOUO4-5o4q1MwPyF8-aUuxe0yo6W4UpwSyES0gq360yUd8eEdUck6EjwmEcogwi86O1fxC13wc2&__csr=gdAp134gP24BgTcZN6TN5dsAT4ibNiexQp194iONeBijG_QDOmIlnYRiPOjhIjORt9PATnlalAqin8SNy8jdF6l-kJWQRHiHi-BQF5Vdb_ihdGKKFaRhlAjjqJ9kQP9IFqbWHV5SPOdGHqy4mTCjmmnVevmqLlB-J-aBut4GjjLmbgDF5mqiKiVuVbAAVUBUyBDjVQXChWCGn-9AU-quqmt4Cx2C4KeCD-UKeK6FEHGcziqyoy8y-vyomK7V8GfG5poy8mbCKhbAjhUOp7ypVaQUkDxqmZ7xWGwBgOVWyp9VEK8yFp-aghzEyfUWcyeqm7oGq22EsUiz8gg-cxq7-UyawOwJwxxGbzUsyU084-CwDyRUOE7S1_wx4w6Yw1uc2BwVgngm8DpUClxo2G04a3yE3nEE1hUlw7va0jy1x78bG58jjz6Ei1m07U8Kp01Hi580fPpVo0-C0X-4ph008m819yG046oy9QE0sdhE1nU1982U1g4YMFg9E2ywfe0oB0f-0n-2yve5J3EeR0jEdOxq1dg2xBwSw1aa8wdi0iK04ro0lwwz2m4o2cwBw1UGq0ri04OpE1Go0gewfq4Ekw5lAwwhK784R0k8lw3vU0u0Cm0WU0zK1sg1F21i0UA0k6&__comet_req=11&fb_dtsg="+dtsg+"&jazoest=25513&lsd=hSJw3G9L_EZwhG5c_N8ai3&__spin_r=1010578883&__spin_b=trunk&__spin_t=1703317760&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitMonetizationStarsMainDetailViewCometWrapperQuery&variables=%7B%22earningsQuery%22%3A%7B%22asset_ids%22%3A%5B%5D%2C%22metrics%22%3A%5B%5D%2C%22page_ids%22%3A%5B%22"+id+"%22%5D%2C%22requested_fields%22%3A%5B%5D%2C%22since%22%3A1702659600%2C%22total_video_metrics%22%3Afalse%2C%22unified_metric_params%22%3A%5B%7B%22aggregation_type%22%3A%22PAGE_UPLOADED%22%2C%22combined_breakdowns_list%22%3A%5B%5B%5D%5D%2C%22counting_method%22%3A%22COUNT%22%2C%22metric_list%22%3A%5B%22STARS_RECEIVED%22%5D%7D%5D%2C%22until%22%3A1703178000%7D%2C%22isStarsMainSubtab%22%3Atrue%2C%22pageID%22%3A%22"+id+"%22%2C%22starsInsightsEndTime%22%3A1703178000%2C%22starsInsightsStartTime%22%3A1702659600%7D&server_timestamps=true&doc_id=6927259353997484",
                })

                const data = await res.json()

                resolve(data.data.page.mta_tool_eligibility_info.eligibility_state)

            } catch (err) {
                console.log(err)
                reject()
            }


        })
    }

    checkPage() {
        return new Promise(async (resolve, reject) => {

            const uid = this.uid
            const dtsg = this.dtsg
            const accessToken = this.accessToken

            let pageData = []

            try {

                const res = await fetch("https://graph.facebook.com/me/accounts?type=page&fields=id,birthday,name,likes,is_published,business&access_token="+accessToken+"&limit=999", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })
                
                const resData = await res.json()

                const pages = resData.data.map(item => item.id)

                const data = []

                for (let index = 0; index < pages.length; index++) {

                    const id = pages[index]

                    let status = ''

                    let liveStream = false

                    try {
                    
                        if (await this.checkLiveStream(id) === 'ELIGIBLE') {
                            liveStream = true
                        }

                    } catch {}

                    const res2 = await fetch("https://www.facebook.com/api/graphql/", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "body": "av="+uid+"&__user="+uid+"&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lwqp8aE4KeCK2q362u1dxW10w8mu&__csr=&fb_dtsg="+dtsg+"&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6228297077225495",
                        "method": "POST",
                    })

                    const resData2 = await res2.json()

                    if (resData2.data.pageData.advertising_restriction_info.status === 'APPEAL_REJECTED_NO_RETRY') {
                        status = 'Hạn chế vĩnh viễn'
                    }

                    if (resData2.data.pageData.advertising_restriction_info.status === 'VANILLA_RESTRICTED') {
                        status = 'Cần kháng'
                    }

                    if (resData2.data.pageData.advertising_restriction_info.status === 'APPEAL_PENDING') {
                        status = 'Đang kháng'
                    }
    
                    if (resData2.data.pageData.advertising_restriction_info.status === 'NOT_RESTRICTED') {
                        status = 'Live'
                    }
    
                    if (resData2.data.pageData.advertising_restriction_info.restriction_type === 'BI_IMPERSONATION') {
                        status = 'XMDT'
                    }
    
                    if (!resData2.data.pageData.advertising_restriction_info.is_restricted && resData2.data.pageData.advertising_restriction_info.restriction_type === 'ALE') {
                        status = 'Page kháng'
                    }
        
                    data.push({
                        id,
                        status,
                        liveStream,
                    })

                    await delayTimeout(3000)
                    
                }

                pageData = data

            } catch (err) {
                console.log(err)
            }

            resolve(pageData)

        })
    }

    checkPage2(id) {
        return new Promise(async (resolve, reject) => {
            const uid = this.uid
            const dtsg = this.dtsg

            let status = 'ERROR'
            
            try {

                const res = await fetch("https://www.facebook.com/api/graphql/", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "av="+uid+"&__user="+uid+"&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lwqp8aE4KeCK2q362u1dxW10w8mu&__csr=&fb_dtsg="+dtsg+"&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6228297077225495",
                })

                const data = await res.json()

                if (data.data.pageData.advertising_restriction_info.status === 'APPEAL_REJECTED_NO_RETRY') {
                    status = 'Hạn chế vĩnh viễn'
                }

                if (data.data.pageData.advertising_restriction_info.status === 'VANILLA_RESTRICTED') {
                    status = 'Cần kháng'
                }

                if (data.data.pageData.advertising_restriction_info.status === 'APPEAL_PENDING') {
                    status = 'Đang kháng'
                }

                if (data.data.pageData.advertising_restriction_info.status === 'NOT_RESTRICTED') {
                    status = 'Live'
                }

                if (data.data.pageData.advertising_restriction_info.restriction_type === 'BI_IMPERSONATION') {
                    status = 'XMDT'
                }

                if (!data.data.pageData.advertising_restriction_info.is_restricted && data.data.pageData.advertising_restriction_info.restriction_type === 'ALE') {
                    status = 'Page kháng'
                }

            } catch (err) {
                console.log(err)
            }

            resolve(status)

        })
    }

    checkPageMessage(number) {
        return new Promise(async (resolve, reject) => {

            const accessToken = this.accessToken
            const uid = this.uid

            try {

                const res = await fetch('https://graph.facebook.com/'+uid+'/accounts?access_token='+accessToken, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })

                const resData = await res.json()

                const pages = resData.data.filter(item => item.perms.includes('ADMINISTER'))

                for (let index = 0; index < pages.length; index++) {

                    try {
                    
                        const token = pages[index].access_token
                        const id = pages[index].id
                        const status = await this.checkPage(id)

                        if (status === 'Live') {

                            const res = await fetch('https://graph.facebook.com/v14.0/'+id+'/conversations?limit='+number+'&access_token='+token, {
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
                                    "cookie": this.cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                            })

                            const resData = await res.json()

                            pages[index].count = resData.data.length

                        } else {
                            pages[index].count = 0
                        }

                    } catch {}

                }

                const data = pages.filter(item => item.count === number).map(item => item.id)

                resolve(data)

            } catch (err) {
                console.log(err)
                reject(err)
            }

        })
    }

    createPage(name) {
        return new Promise(async (resolve, reject) => {
            const uid = this.uid
            const dtsg = this.dtsg

            const pageName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            try {

                const bmId = await this.getBmId()

                const res = await fetch("https://business.facebook.com/ajax/ads/create/page/create", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "jazoest=25515&fb_dtsg="+dtsg+"&page_name="+encodeURIComponent(pageName)+"&category=2612&parent_category=2612&has_no_profile_pic=1&business_id="+bmId+"&__user="+uid+"&__a=1&__req=k&__hs=19668.BP%3Abrands_pkg.2.0..0.0&dpr=1.5&__ccg=GOOD&__rev=1009742842&__s=nyc2d0%3Af69gum%3Aq1dva0&__hsi=7298836689871505933&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCwRCwqojyUV0RAAzpoixW4E5S2WdwJwCwq8gwqoqyoyazoO4o2vwOxa7FEd89EmwoU9FE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G5udz87G0FoO12ypUuwg88EeAUpK1vDwFwBgak48W18wRwEwiUmwoErorx2aK2a4p8y26U8U-UvzE4S7VEjCx6221cwjUd8-dwKwHxa1ozFUK1gzpA6EfEO32fxiFVoa9obGwgUy1kx6bCyVUCfwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&lsd=ch-H_YWFOB8VNvxG12Hpdh&__aaid=0&__bid="+bmId+"&__spin_r=1009742842&__spin_b=trunk&__spin_t=1699392843&__jssesw=1",
                })

                const data = await res.text()

                if (data.includes('{"page":{"id":"')) {

                    const data2 = JSON.parse(data.replace('for (;;);', ''))

                    resolve(data2.payload.page.id)

                } else {
                    reject()
                }

            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    createPage2(name) {

        return new Promise(async (resolve, reject) => {

            const uid = this.uid
            const dtsg = this.dtsg

            const pageName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            try {

                const res = await fetch("https://www.facebook.com/api/graphql/", {
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
                        "x-fb-friendly-name": "AdditionalProfilePlusCreationMutation",
                        "x-fb-lsd": this.lsd,
                        "cookie": this.cookie,
                        "user-agent": this.UA,
                        "Referer": "https://www.facebook.com/pages/creation/?ref_type=launch_point",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "agent": this.agent,
                    "body": "av="+uid+"&__aaid=0&__user="+uid+"&__a=1&__req=2d&__hs=20056.HYP%3Acomet_pkg.2.1..2.1&dpr=2&__ccg=GOOD&__rev=1018526344&__s=9w13lv%3A3jttp2%3A6uq3vc&__hsi=7442571017677665797&__dyn=7AzHK4HwkEng5K8G6EjBAg5S3G2O5U4e2C17xt3odE98K361twYwJyE24wJwpUe8hwaG1sw9u0LVEtwMw6ywIK1Rwwwqo462mcwfG12wOx62G5Usw9m1YwBgK7o6C0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e3ym2SU4i5oe8464-5pUfEe88o4Wm7-2K1ywtUuwLKq2-azqwaW223908O3216xi4UK2K364UrwFg2fwxyo566k1FwgU4q3Gfw-Kufxa3mUqwjVqwLwHwGwbu5E&__csr=gcQn5sldb3Y7cIYCDdd5OblihtLPOcIZbsApqN4JTIDER9jHitiRGGtO__Zt5Q-njmjaFvVvGx54mV2dJWigDAA9KmV9kaiQGBGuVKGhGy4qFnCABDWZevChfSEHzGzrVaGcBCV94XK8Cy_DDiRxqF988Vohy6u-4EC8By8C7AawRAF1eui9z8G4ejzUgx2VotKHxe6ENe225oC1jxKfG4EgxbAzE-E4-fyFoeoO0LE9Ee85u0BGzEkwbu2C2ym0V8dUmw_who2gwb6082o4F07Vwpu0lG0h20Co1Fyw1b601zSw2Go3tU0lhw0ddi0BE5y0LUrw41hU3Iw7Fw2U80rIwro5em0dTw0S2uewDgaEhw3AC0x409Gxm02Uy057Q04So0Mm&__comet_req=15&fb_dtsg="+dtsg+"&jazoest="+this.jazoest+"&lsd="+this.lsd+"&__spin_r=1018526344&__spin_b=trunk&__spin_t=1732858600&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AdditionalProfilePlusCreationMutation&variables=%7B%22input%22%3A%7B%22bio%22%3A%22%22%2C%22categories%22%3A%5B%22129417183848258%22%5D%2C%22creation_source%22%3A%22comet%22%2C%22name%22%3A%22"+encodeURIComponent(pageName)+"%22%2C%22off_platform_creator_reachout_id%22%3Anull%2C%22page_referrer%22%3A%22launch_point%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%224%22%7D%7D&server_timestamps=true&doc_id=8146768482082105",
                    "method": "POST"
                })

                const data = await res.text()

                if (data.includes('"page":{"id":"')) {

                    const data2 = JSON.parse(data)

                    resolve(data2.data.additional_profile_plus_create.page.id)
                    
                } else {
                    reject('cccc')
                }

            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    getUserData() {
        return new Promise(async (resolve, reject) => {

            try {

                const accessToken = this.accessToken

                const res = await fetch('https://graph.facebook.com/me?access_token='+accessToken, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })

                resolve(await res.json())

            } catch (err) {
                reject(err)
            }

        })
    }

    khang902(message, quality, bmId = '') {

        return new Promise(async (resolve, reject) => {

            const setting = (await getSetting()).bm
            
            const dtsg = this.dtsg
            const lsd = 'b2nSsVw94zpgnIYb39cCuR'

            const uid = this.uid 

            let target = uid
            let type = 5

            if (bmId) {
                target = bmId
                type = 3
            }

            try {

                const chooseArr = ['policy', 'unauthorized_use', 'other']
                const randomChoose = chooseArr[Math.floor(Math.random() * chooseArr.length)]

                const choose = setting.chooseLine.value === 'random' ? randomChoose : setting.chooseLine.value
                const content = setting.chooseLine.value === 'other' ? encodeURIComponent(setting.noiDungKhang.value) : encodeURIComponent('I think there was unauthorized use of my Facebook account.')

                const reasons = {
                    policy: 1,
                    unauthorized_use: 2,
                    other: 3
                }

                const reasonId = reasons[choose]

                if (quality !== '902' && quality !== '902_line') {

                    return reject('Không thể kháng 902')
                }

                const res = await fetch("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOMix6XnzisxiE316",
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": '------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"fb_dtsg\"\r\n\r\n'+dtsg+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"lsd\"\r\n\r\n'+lsd+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"variables\"\r\n\r\n{\"assetOwnerId\":\"'+target+'\"}\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"doc_id\"\r\n\r\n5816699831746699\r\n------WebKitFormBoundaryOMix6XnzisxiE316--\r\n',
                })

                const data = await res.json()

                const issueId = data.data.assetOwnerData.advertising_restriction_info.ids_issue_ent_id

                if (setting.chooseLineOnly?.value || quality === '902_line') {

                    message('Đang chọn dòng')

                    const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=2423", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": "av="+uid+"&__usid=6-Ts62bj38e5dcl%3APs62bqs19mjhs3%3A0-As62bhb1qhfddh-RV%3D6%3AF%3D&session_id=26399276ba0973c5&__user="+uid+"&__a=1&__req=w&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574604&__s=pyhonq%3Azkdiwa%3A6yn1u0&__hsi=7315356470129303763&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzweau0Jo6-4e1mAKm221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg="+dtsg+"&jazoest=25180&lsd=5FnEglTcQSfqnuBkn03g8c&__aaid=0&__bid=212827131149567&__spin_r=1010574604&__spin_b=trunk&__spin_t=1703239154&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useALEBanhammerAppealMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22"+reasonId+"%22%2C%22actor_id%22%3A%22100050444678752%22%2C%22entity_id%22%3A%22"+target+"%22%2C%22ids_issue_ent_id%22%3A%22"+issueId+"%22%2C%22appeal_comment%22%3A%22"+encodeURIComponent(content)+"%22%2C%22callsite%22%3A%22ACCOUNT_QUALITY%22%7D%7D&server_timestamps=true&doc_id=6816769481667605",
                    })

                    const data = await res.text()

                    if (data.includes('"success":true')) {
                        return resolve()
                    } else {
                        return reject()
                    }

                }
                
                const decisionId = data.data.assetOwnerData.advertising_restriction_info.additional_parameters.friction_decision_id

                const res2 = await fetch("https://www.facebook.com/accountquality/ufac/?decision_id="+decisionId+"&ids_issue_id="+issueId+"&entity_type="+type+"&entity_id="+target+"&_flowletID=2169", {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                    "method": "POST",
                    "body": "__usid=6-Ts32udfp2ieqb%3APs32udrqbzoxh%3A0-As32ud2p8mux0-RV%3D6%3AF%3D&session_id=2478ab408501cdea&__user="+uid+"&__a=1&__req=u&__hs=19655.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=417qpb%3Alchip2%3Ayq4pb1&__hsi=7293818531390316856&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25548&lsd=A-HDfPRVoR7YG2zHwlCDBx&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224463",
                })

                const resData2 = await res2.text()

                const data2 = JSON.parse(resData2.replace('for (;;);', ''))

                const id = data2.payload.enrollment_id

                const checkState = () => {
                    return new Promise(async (resolve, reject) => {

                        try {

                            const res = await fetch("https://www.facebook.com/api/graphql/?_flowletID=2667", {
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
                                    "cookie": this.cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                                "method": "POST",
                                "body": 'av='+uid+'&__usid=6-Ts32uok1y9xfvn:Ps32uol13ql4xy:0-As32unzppjifr-RV=6:F=&session_id=39a4ef7cb4471bc7&__user='+uid+'&__a=1&__req=v&__hs=19655.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=66oim1:rc1h95:79wmnc&__hsi=7293820200761279392&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg='+dtsg+'&jazoest=25374&lsd=gxYcaWGy-YhTSvBKDhInoq&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224851&__jssesw=247&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=UFACAppQuery&variables={"enrollmentID":'+id+',"scale":1}&server_timestamps=true&doc_id=7089047377805579',
                            })

                            const data = await res.json()

                            resolve(data.data.ufac_client.state)

                        } catch {
                            reject()
                        }
                    })
                }

                let state = await checkState()

                const captchaStep = state.__typename === 'UFACBotCaptchaState'

                if (captchaStep) {

                    message('Đang giải captcha')

                    const res = await fetch('https://www.facebook.com/business-support-home/'+uid, {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                    })

                    const html = await res.text()

                    const persist = state.captcha_persist_data
                    const consent = (html.match(/(?<=\"consent_param\":\")[^\"]*/g))[0]
                    const locale = (html.match(/(?<=\"code\":\")[^\"]*/g))[0]

                    const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?referer=https%253A%252F%252Fwww.facebook.com&locale='+locale+'&__cci='+encodeURIComponent(consent)

                    const res2 = await fetch(captchaUrl, {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                    })

                    const $ = cheerio.load(await res2.text())

                    const siteKey = $('[data-sitekey]').attr('data-sitekey')

                    let captchaSuccess = false

                    for (let index = 0; index < 3; index++) {

                        if (index > 0) {
                            message('Đang thử giải lại captcha')
                        }

                        try {
                            
                            const res = await resolveCaptcha(setting, siteKey, captchaUrl)

                            const res2 = await fetch('https://www.facebook.com/api/graphql/', {
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
                                    "cookie": this.cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                                "method": "POST",
                                "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=6&__hs=19608.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1008510432&__s=wixma6:3lwxjd:w1cvvj&__hsi=7276285233254120568&__dyn=7xeXxa2C2O5U5O8G6EjBWo2nDwAxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew65xO2OU7m0yE465o-cw5Mx62G3i0Bo7O2l0Fwqo31w9O7Udo5qfK0zEkxe2Gew9O22362W5olw8Xxm16wa-7U1boarCwLyESE6S0B40z8c86-1Fwmk1xwmo6O1Fw9O2y&__csr=gQNdJ-OCcBGBG8WB-F4GHHCjFZqAS8LKaAyqhVHBGAACJde48jiKqqqGy4bK8zmbxi5onGfgiw9Si1uBwJwFw9N2oaEW3m1pwKwr835wywaG0vK0u-ewCwbS01aPw0d9O05uo4Wcwp8cJAx6U21w1420kKdxCQ063U12U0QK0midgsw1mR00H9w5VxS9DAw0gCvw0Opw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25277&lsd='+lsd+'&__spin_r=1008510432&__spin_b=trunk&__spin_t=1694142174&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"SUBMIT_BOT_CAPTCHA_RESPONSE","bot_captcha_persist_data":"'+persist+'","bot_captcha_response":"'+res+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6495927930504828'
                            })

                            const result = await res2.text()

                            if (result.includes('body_text')) {
                                captchaSuccess = true
                                break
                            }

                        } catch {}
                        
                    }

                    if (captchaSuccess) {

                        state = await checkState()

                        message('Giải captcha thành công')

                    } else {
                        return reject('Giải captha thất bại')
                    }

                }

                const codeStep = state.__typename === 'UFACContactPointChallengeSubmitCodeState'

                if (codeStep) {

                    message('Đang gỡ số điện thoại cũ')
                    
                    const res = await fetch("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                    })

                    const data = await res.text()

                    if (data.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {
                        state = await checkState()
                    } else {

                        return reject('Không thể gỡ số điện thoại cũ')

                    }
                    
                }

                const phoneStep = state.__typename === 'UFACContactPointChallengeSetContactPointState'

                if (phoneStep) {

                    let phoneStepSuccess = false

                    for (let index = 0; index < 6; index++) {

                        let phone = false
                        let addPhoneSuccess = false
                        let addCodeSuccess = false

                        for (let index = 0; index < 6; index++) {

                            state = await checkState()

                            const phoneStep = state.__typename === 'UFACContactPointChallengeSetContactPointState'

                            if (phoneStep) {
                                                                
                                if (index > 0) {
                                    message('Đang thử lấy số điện thoại khác')
                                } else {
                                    message('Đang lấy số điện thoại')
                                }

                                try {

                                    phone = await getPhone(setting.phoneService.value, setting.phoneServiceKey.value, this.proxy)

                                    message('Đang thêm số điện thoại')

                                    const res = await fetch("https://adsmanager.facebook.com/api/graphql/?_flowletID=5799", {
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
                                            "cookie": this.cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "method": "POST",
                                        "body": 'av='+uid+'&__usid=6-Ts32vzy5lbbnm:Ps32w00w7ep8k:0-As32vzy8nfhuf-RV=6:F=&session_id=392d588c9fe08fb9&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=v3r9g5:6bpvyp:rynm6b&__hsi=7293827532840545377&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25259&lsd=_m2P87owOD8j6w2xxN6rHw&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698226559&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"SET_CONTACT_POINT","contactpoint":"'+phone.number+'","country_code":"VN","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                                    })

                                    const data = await res.json()

                                    if (!data.errors) {

                                        addPhoneSuccess = true

                                        break
                                        
                                    } else {
                                        message(data.errors[0].summary)
                                    }

                                    if (setting.phoneService.value === 'custom' && phone.id) {

                                        try {
    
                                            const phoneData = new Db('phone/facebook')
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
                            
                            state = await checkState()

                            const codeStep = state.__typename === 'UFACContactPointChallengeSubmitCodeState'

                            if (codeStep) {

                                message('Đang chờ mã kích hoạt')

                                try {

                                    const code = await getPhoneCode(setting.phoneService.value, setting.phoneServiceKey.value, phone.id, this.proxy)

                                    message('Đang nhập mã kích hoạt')

                                    const res = await fetch("https://adsmanager.facebook.com/api/graphql/?_flowletID=6114", {
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
                                            "cookie": this.cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "method": "POST",
                                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=bi5lni:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"SUBMIT_CODE","code":"'+code+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                                    })

                                    const data = await res.text()

                                    if (data.includes('"ufac_client":{"id"')) {

                                        message('Thêm số điện thoại thành công')

                                        addCodeSuccess = true

                                    }

                                    if (res.includes('UFACOutroState')) {

                                        state.__typename = 'UFACAwaitingReviewState'

                                    }

                                } catch (err) { console.log(err) }

                                if (addCodeSuccess) {

                                    phoneStepSuccess = true

                                    break

                                } else {

                                    message('Đang gỡ số điện thoại cũ')
                    
                                    const res = await fetch("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
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
                                            "cookie": this.cookie,
                                            "user-agent": this.UA
                                        },
                                        "agent": this.agent,
                                        "method": "POST",
                                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                                    })

                                    const data = await res.text()

                                    if (data.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {
                                        state = await checkState()
                                    } else {

                                        return reject('Không thể gỡ số điện thoại cũ')

                                    }
                                    
                                }

                            }
                        }

                        if (setting.phoneService.value === 'custom' && phone.id) {

                            try {

                                const phoneData = new Db('phone/facebook')
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

                        try {
                            state = await checkState()

                        } catch {}

                        

                    } else {
                        return reject()
                    }

                }

                const imageStep = state.__typename === 'UFACImageUploadChallengeState'

                if (imageStep) {

                    const dest = path.resolve(app.getPath('userData'), 'card/'+uid+'.png')

                    if (!fs.existsSync(dest)) {

                        const accountData = await this.getUserData()

                        const textData = {
                            firstName: accountData.first_name,
                            lastName: accountData.last_name,
                            fullName: accountData.name,
                            birthday: accountData.birthday,
                            gender: accountData.gender,
                        }

                        message('Đang tạo phôi')

                        const phoiTemplate = path.resolve(app.getPath('userData'), 'phoi/'+setting.phoiTemplate.value)

                        if (!fs.existsSync(phoiTemplate)) {

                            return reject('Không thể load phôi')
                        }

                        const server = setting.faceServer.value

                        if (!fs.existsSync(dest)) {
                            await taoPhoi(textData, phoiTemplate, dest, false, server)
                        }

                    }

                    const size = (await fs.promises.stat(dest)).size
                    const content = await fs.promises.readFile(dest)
                    const mimeD = mime.getType(dest)
                    const name = path.basename(dest)

                    message('Đang upload phôi')

                    const res = await fetch("https://rupload.facebook.com/checkpoint_1501092823525282_media_upload/4c196911-0947-480e-bb0d-d44fe48eedcd?__user="+uid+"&__a=1&__req=5&__hs=19649.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009336620&__s=e4dthv%3A4gqfv2%3Azfd1tr&__hsi=7291491037551682076&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gZOqqAjnFnvHi-8B8HAgKWmhKswxbx12P3ajQF8CqmeWy5pEjy8tK9xaEG3i10yE7W0x88Fo621lgB0rEC0K87q2WfzoS0aewmo6G0CodoeE2_w3KrCGGzoC8AgGUe85W09miwda04aEqCw7Gw0fge02wO06so09cE0qNyoCUowmE0c4805Ga&__comet_req=15&fb_dtsg="+dtsg+"&jazoest=25620&lsd=ebAFxVKmO4TRIteldK-cKt&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697682551", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "offset": "0",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "Content-Type": mimeD,
                            "x-entity-length": size,
                            "x-entity-name": name,
                            "x-entity-type": mimeD,
                            "cookie": this.cookie,
                            "user-agent": this.UA,
                            "Referer": "https://www.facebook.com/",
                            "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "agent": this.agent,
                        "body": content,
                        "method": "POST"
                    })

                    const data = await res.json()

                    if (data.h) {

                        const res = await fetch("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
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
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                            "method": "POST",
                            "body": 'av='+uid+'&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UPLOAD_IMAGE","image_upload_handle":"'+data.h+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                        })

                        const data = await res.text()

                        if (data.includes('UFACAwaitingReviewState')) {

                            message('Upload phôi thành công')

                            state = await checkState()

                        } else {

                            message('Đang thử upload lại phôi')

                            const res = await fetch("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
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
                                    "cookie": this.cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                                "method": "POST",
                                "body": 'av='+uid+'&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UPLOAD_IMAGE","image_upload_handle":"'+data.h+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                            })

                            const data = await res.text()

                            if (data.includes('UFACAwaitingReviewState')) {

                                message('Upload phôi thành công')
    
                                state = await checkState()

                            } else {

                                return reject()

                            }
                        }

                    } else {

                        return reject('Không thể upload phôi')
                    }

                }

                const reviewStep = state.__typename === 'UFACAwaitingReviewState'

                if (reviewStep) {

                    message('Đang chọn dòng')

                    const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=2423", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": "av="+uid+"&__usid=6-Ts62bj38e5dcl%3APs62bqs19mjhs3%3A0-As62bhb1qhfddh-RV%3D6%3AF%3D&session_id=26399276ba0973c5&__user="+uid+"&__a=1&__req=w&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574604&__s=pyhonq%3Azkdiwa%3A6yn1u0&__hsi=7315356470129303763&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzweau0Jo6-4e1mAKm221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg="+dtsg+"&jazoest=25180&lsd=5FnEglTcQSfqnuBkn03g8c&__aaid=0&__bid=212827131149567&__spin_r=1010574604&__spin_b=trunk&__spin_t=1703239154&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useALEBanhammerAppealMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22"+reasonId+"%22%2C%22actor_id%22%3A%22100050444678752%22%2C%22entity_id%22%3A%22"+target+"%22%2C%22ids_issue_ent_id%22%3A%22"+issueId+"%22%2C%22appeal_comment%22%3A%22"+encodeURIComponent(content)+"%22%2C%22callsite%22%3A%22ACCOUNT_QUALITY%22%7D%7D&server_timestamps=true&doc_id=6816769481667605",
                    })

                    const data = await res.json()

                    if (data.includes('"success":true')) {
                        resolve()
                    } else {
                        reject()
                    }

                }

            } catch (err) {
                console.log(err)
                reject()
            }

        })
    }

    khangXmdtApi(message, quality, bmId = false, khangBang273 = false, khangBangPage = false) {
        return new Promise(async (resolve, reject) => {

            const dtsg = this.dtsg
            const lsd = 'b2nSsVw94zpgnIYb39cCuR'
            const setting = (await getSetting()).bm
            const accessToken = this.accessToken

            const uid = this.uid 

            let target = uid
            let type = 5

            if (!khangBang273 && !khangBangPage) {

                if (bmId) {
                    target = bmId
                    type = 3
                }

                if (quality !== 'xmdt') {
                    return reject('Không thể kháng XMDT')
                }

            }

            try {

                let id = ''

                if (!khangBang273 && !khangBangPage) {

                    const res = await fetch("https://www.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOMix6XnzisxiE316",
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": '------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"fb_dtsg\"\r\n\r\n'+dtsg+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"lsd\"\r\n\r\n'+lsd+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"variables\"\r\n\r\n{\"assetOwnerId\":\"'+target+'\"}\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"doc_id\"\r\n\r\n5816699831746699\r\n------WebKitFormBoundaryOMix6XnzisxiE316--\r\n',
                    })

                    const data = await res.json()

                    const issueId = data.data.assetOwnerData.advertising_restriction_info.ids_issue_ent_id
                    const decisionId = data.data.assetOwnerData.advertising_restriction_info.additional_parameters.decision_id

                    const res2 = await fetch("https://www.facebook.com/accountquality/ufac/?decision_id="+decisionId+"&ids_issue_id="+issueId+"&entity_type="+type+"&entity_id="+target+"&_flowletID=9999", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": '__usid=6-Ts2rbmo1223bxs:Ps2rbmm1pafisj:0-As2rbmcwf48js-RV=6:F=&session_id=4d371069f94ed908&__user='+uid+'&__a=1&__req=q&__hs=19649.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009336620&__s=vkojb0:tpoa7e:m367w6&__hsi=7291509895584633584&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U&__csr=&fb_dtsg='+dtsg+'&jazoest=25489&lsd=QTfKpPcJRl9RAFTWridNry&__aaid=0&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697686941',
                    })

                    const data2 = JSON.parse((await res2.text()).replace('for (;;);', ''))

                    id = data2.payload.enrollment_id

                } else if (khangBangPage) {

                    const res = await fetch("https://www.facebook.com/business_authenticity_platform/xfac/?authenticatable_entity_id="+khangBangPage+"&bap_product=bi_impersonation&callback_uri_string=%2Fbusiness-support-home%2F&_flowletID=1730", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": "__usid=6-Ts5uu53d8dfod%3APs5uu6bg02c8f%3A0-As5uu34urhtu2-RV%3D6%3AF%3D&session_id=2c2f06ec95e5cc5b&__user="+uid+"&__a=1&__req=m&__hs=19709.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010474043&__s=m2k4ll%3Asfxlhg%3Atsb4ry&__hsi=7313855978735943424&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25387&lsd=JQMnGH0ipq77OVWWsb7uxd&__aaid=0&__spin_r=1010474043&__spin_b=trunk&__spin_t=1702889795&__jssesw=1",
                    })

                    const data = JSON.parse((await res.text()).replace('for (;;);', ''))

                    id = data.payload.enrollment_id

                } else {

                    target = bmId
                    type = 4
                    id = khangBang273

                }

                const url = 'https://www.facebook.com/checkpoint/1501092823525282/'+id

                const res = await fetch(url, {
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
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    "agent": this.agent,
                })

                let html = await res.text()

                const introStep = html.includes('UFACIntro')
             
                if (introStep) {

                    const res = await z.post("https://www.facebook.com/api/graphql/", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                        "method": "POST",
                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=4&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009317597&__s=g4kdcc:fbi499:cmeoui&__hsi=7291209497129069677&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=hI9lGNcCF7GZQVdeqGlkmuUyFk-JGWjByV9KZ6WjRriOUgqmJ9G8yXgS5XqWyUgyk8wBxO5EcU5iawOwko2cwUG1dxy68vU885m2613wjo1qU1381SE33z87i1Bw5lw4IyodFWwfS6Q4EdUqHCye2m1nw3EU0M60S803P1w0Obw18G02K-0R80cBo3Hxiq4F802nFw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25829&lsd='+lsd+'&__spin_r=1009317597&__spin_b=trunk&__spin_t=1697617000&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"PROCEED","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                    })

                    const data = await res.text()

                    if (!data.includes('{"ufac_client":{"id"')) {
                        return reject()
                    } else {

                        const res = await fetch(url, {
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
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                        })

                        html = await res.text()
                    }

                }

                const captchaStep = html.includes('"captcha_persist_data"')

                if (captchaStep) {

                    message('Đang giải captcha')
                    
                    const persist = (html.match(/(?<=\"captcha_persist_data\":\")[^\"]*/g))[0]
                    const consent = (html.match(/(?<=\"consent_param\":\")[^\"]*/g))[0]
                    const locale = (html.match(/(?<=\"code\":\")[^\"]*/g))[0]

                    const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?referer=https%253A%252F%252Fwww.facebook.com&locale='+locale+'&__cci='+encodeURIComponent(consent)

                    const res = await fetch(captchaUrl, {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "agent": this.agent,
                    })

                    const $ = cheerio.load(await res.text())

                    const siteKey = $('[data-sitekey]').attr('data-sitekey')

                    let captchaSuccess = false

                    for (let index = 0; index < 3; index++) {

                        if (index > 0) {
                            message('Đang thử giải lại captcha')
                        }

                        try {
                            
                            const res = await resolveCaptcha(setting, siteKey, captchaUrl)

                            const result = await fetch('https://www.facebook.com/api/graphql/', {
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
                                    "cookie": this.cookie,
                                    "user-agent": this.UA
                                },
                                "agent": this.agent,
                                "method": "POST",
                                "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=6&__hs=19608.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1008510432&__s=wixma6:3lwxjd:w1cvvj&__hsi=7276285233254120568&__dyn=7xeXxa2C2O5U5O8G6EjBWo2nDwAxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew65xO2OU7m0yE465o-cw5Mx62G3i0Bo7O2l0Fwqo31w9O7Udo5qfK0zEkxe2Gew9O22362W5olw8Xxm16wa-7U1boarCwLyESE6S0B40z8c86-1Fwmk1xwmo6O1Fw9O2y&__csr=gQNdJ-OCcBGBG8WB-F4GHHCjFZqAS8LKaAyqhVHBGAACJde48jiKqqqGy4bK8zmbxi5onGfgiw9Si1uBwJwFw9N2oaEW3m1pwKwr835wywaG0vK0u-ewCwbS01aPw0d9O05uo4Wcwp8cJAx6U21w1420kKdxCQ063U12U0QK0midgsw1mR00H9w5VxS9DAw0gCvw0Opw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25277&lsd='+lsd+'&__spin_r=1008510432&__spin_b=trunk&__spin_t=1694142174&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"SUBMIT_BOT_CAPTCHA_RESPONSE","bot_captcha_persist_data":"'+persist+'","bot_captcha_response":"'+res+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6495927930504828'
                            })

                            const data = await result.text()

                            if (data.includes('body_text')) {
                                captchaSuccess = true
                                break
                            }

                        } catch {}
                        
                    }

                    if (captchaSuccess) {

                        const res = await fetch(url, {
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
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                        })

                        html = await res.text()

                        message('Giải captcha thành công')

                    } else {
                        return reject('Giải captha thất bại')
                    }

                }

                const selectPhoneStep = html.includes('UFACSelectPhone')

                if (selectPhoneStep) {

                    const res = await z.post("https://www.facebook.com/api/graphql/", {
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
                            "cookie": this.cookie,
                            "user-agent": this.UA
                        },
                        "method": "POST",
                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=7&__hs=19649.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009336620&__s=4na9wc:efzkrd:jhn576&__hsi=7291499991552787607&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gJfOqqAjnGDvHi-8B8HAgKWldKswxbx12YxFqjQF8CqmeWy5pEjy98oK9xmawQwg8Hwv824wyBwo85l2k1Kwj87m0Fo-dzo0EW1pwYwJw9C3m3G0LU0XCVGGES9y94aK3y1uw2lAE3iw12G6FE1WE03Q3w0Ecw1D602ja06IoC9K685G031201qyw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25259&lsd=ry1hVRzCoL--hEDK73Qfr2&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697684636&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"USE_DIFFERENT_PHONE","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7132448186773917',
                    })

                    const data = await res.text()

                    if (data.includes('{"ufac_client":{"id"')) {
                        
                        const res = await fetch(url, {
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
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                        })

                        html = await res.text()

                    } else {
                        return reject()
                    }

                }

                const codeStep = html.includes('UFACSubmitCode')

                if (codeStep) {

                    message('Đang gỡ số điện thoại cũ')
                    
                    const res = await z.post("https://www.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=c&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009318603&__s=ev3b2w:a5xmo3:nh90rd&__hsi=7291258643627118762&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gF5QW8NyluUyTiFZeiAqquiVqGQF4BFdd4GdJ6LXXGB_BheqAAH-riUDyVptp24xqE4zy88o4Sii2u6o2hxK9wlUe8-2GU7-E8U6C6810E2kw47wUw54xK0jm3y1zway0gi0XEtxbCKbxGayo6a2p1Oi480YaA0dcw5Xw0f5O03jO04D80aXE38w0NJw4PyEGui00BSo&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25316&lsd=b24y-J5CcPuIzXkNl7D1aT&__spin_r=1009318603&__spin_b=trunk&__spin_t=1697628443&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                    })

                    if (res.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {

                        const res = await fetch(url, {
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
                                "cookie": this.cookie,
                                "user-agent": this.UA
                            },
                            "agent": this.agent,
                        })

                        html = await res.text()
                        
                    } else {

                        return reject('Không thể gỡ số điện thoại cũ')

                    }

                }

                const phoneStep = html.includes('UFACAddPhone')

                if (phoneStep) {

                    let phoneStepSuccess = false

                    for (let index = 0; index < 6; index++) {

                        let phone = false
                        let addPhoneSuccess = false
                        let addCodeSuccess = false

                        for (let index = 0; index < 6; index++) {

                            html = await z.get(url)

                            const phoneStep = html.includes('UFACAddPhone')

                            if (phoneStep) {
                                                                
                                if (index > 0) {
                                    message('Đang thử lấy số điện thoại khác')
                                } else {
                                    message('Đang lấy số điện thoại')
                                }

                                try {

                                    phone = await getPhone(setting.phoneService.value, setting.phoneServiceKey.value, this.proxy)

                                    message('Đang thêm số điện thoại')

                                    const res = await z.post("https://www.facebook.com/api/graphql/", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=4&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1009317597&__s=quou5v:fbi499:mixpff&__hsi=7291211722156876320&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=hI9lGNcCF7GZQVdeqGlkmuUyFk-JGWjByV9KZ6WjRriOUGlFqQCKqbJ3oKbJHGbx29gy2m78mwPwHwEyEcE560z8eawjoowUU885m26dwRwjo1qU1381SE33z87i1Bw5lw4IyodFWwfS6Q4EdUqHCye2m1nw3EU0M60S803P1w0Obw18G02K-0R80cBo3Hxiq4F802nFw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25212&lsd=XyTPesFYsbBJUQ-5BW6n3X&__spin_r=1009317597&__spin_b=trunk&__spin_t=1697617518&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"SET_CONTACT_POINT","contactpoint":"'+phone.number+'","country_code":"VN","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                                    })

                                    const data = JSON.parse(res)

                                    if (!data.errors) {

                                        addPhoneSuccess = true

                                        break
                                        
                                    } else {
                                        message(data.errors[0].summary)
                                    }

                                    if (setting.phoneService.value === 'custom' && phone.id) {

                                        try {

                                            const phoneData = new Db('phone/facebook')
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
                            
                            html = await z.get(url)

                            const codeStep = html.includes('UFACSubmitCode')

                            if (codeStep) {

                                message('Đang chờ mã kích hoạt')

                                try {

                                    const code = await getPhoneCode(setting.phoneService.value, setting.phoneServiceKey.value, phone.id, this.proxy)

                                    message('Đang nhập mã kích hoạt')

                                    const res = await z.post("https://www.facebook.com/api/graphql/", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=8&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009317597&__s=bqwuh3:o5izdo:872ra0&__hsi=7291212374530997109&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=hI9lGNcCF7GZQVdeqGlkmuUyFk-JGWjByV9KZ6WjRriOUgqmJ9G8yXgSbyXqWyUgyk8wgEmwPwl8G3a1hw8O3yE4S68ee221lwxwgU4S0mK0Y8rw7qwcecwt86m0lm0iO9wSDG0_orgiwTxGKq8U9o5u0ezw30o3ow0fc6038K04yE0aXU3kw0OlweK59EiAw09uC&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25853&lsd=qs-V5mfF7bF0wwFZv6G5dg&__spin_r=1009317597&__spin_b=trunk&__spin_t=1697617670&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"SUBMIT_CODE","code":"'+code+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                                    })

                                    if (res.includes('"ufac_client":{"id"')) {

                                        message('Thêm số điện thoại thành công')

                                        addCodeSuccess = true

                                    }

                                } catch (err) {}

                                if (addCodeSuccess) {

                                    phoneStepSuccess = true

                                    break

                                } else {

                                    message('Đang gỡ số điện thoại cũ')
                    
                                    const res = await z.post("https://www.facebook.com/api/graphql/", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=c&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009318603&__s=ev3b2w:a5xmo3:nh90rd&__hsi=7291258643627118762&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gF5QW8NyluUyTiFZeiAqquiVqGQF4BFdd4GdJ6LXXGB_BheqAAH-riUDyVptp24xqE4zy88o4Sii2u6o2hxK9wlUe8-2GU7-E8U6C6810E2kw47wUw54xK0jm3y1zway0gi0XEtxbCKbxGayo6a2p1Oi480YaA0dcw5Xw0f5O03jO04D80aXE38w0NJw4PyEGui00BSo&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25316&lsd=b24y-J5CcPuIzXkNl7D1aT&__spin_r=1009318603&__spin_b=trunk&__spin_t=1697628443&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                                    })

                                    if (res.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {

                                        const res = await fetch(url, {
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
                                                "cookie": this.cookie,
                                                "user-agent": this.UA
                                            },
                                            "agent": this.agent,
                                        })
                
                                        html = await res.text()

                                    } else {

                                        return reject('Không thể gỡ số điện thoại cũ')

                                    }
                                }

                            }
                        }

                        if (setting.phoneService.value === 'custom' && phone.id) {

                            try {

                                const phoneData = new Db('phone/facebook')
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

                        if (khangBangPage) {
                            return resolve()
                        } else {
                            html = await z.get(url)
                        }

                    } else {
                        return reject()
                    }


                }
                
                const photoStep = html.includes('UFACFilePickerImageUpload')

                if (photoStep) {

                    const dest = path.resolve(app.getPath('userData'), 'card/'+uid+'.png')

                    if (!fs.existsSync(dest)) {

                        const account = new Account(page, uid, twofa, dtsg, accessToken, lsd)

                        const accountData = await account.getUserData()

                        const textData = {
                            firstName: accountData.first_name,
                            lastName: accountData.last_name,
                            fullName: accountData.name,
                            birthday: accountData.birthday,
                            gender: accountData.gender,
                        }

                        message('Đang tạo phôi')

                        const phoiTemplate = path.resolve(app.getPath('userData'), 'phoi/'+setting.phoiTemplate.value)

                        if (!fs.existsSync(phoiTemplate)) {

                            return reject('Không thể load phôi')
                        }

                        const server = setting.faceServer.value

                        if (!fs.existsSync(dest)) {
                            await taoPhoi(textData, phoiTemplate, dest, false, server)
                        }

                    }

                    const size = (await fs.promises.stat(dest)).size
                    const content = await fs.promises.readFile(dest)
                    const mimeD = mime.getType(dest)
                    const name = path.basename(dest)

                    message('Đang upload phôi')

                    const cookies = (await page.cookies()).map(item => {
                        return item.name+'='+item.value
                    }).join('; ')

                    const res = await fetch("https://rupload.facebook.com/checkpoint_1501092823525282_media_upload/4c196911-0947-480e-bb0d-d44fe48eedcd?__user="+uid+"&__a=1&__req=5&__hs=19649.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009336620&__s=e4dthv%3A4gqfv2%3Azfd1tr&__hsi=7291491037551682076&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gZOqqAjnFnvHi-8B8HAgKWmhKswxbx12P3ajQF8CqmeWy5pEjy8tK9xaEG3i10yE7W0x88Fo621lgB0rEC0K87q2WfzoS0aewmo6G0CodoeE2_w3KrCGGzoC8AgGUe85W09miwda04aEqCw7Gw0fge02wO06so09cE0qNyoCUowmE0c4805Ga&__comet_req=15&fb_dtsg="+dtsg+"&jazoest=25620&lsd=ebAFxVKmO4TRIteldK-cKt&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697682551", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "offset": "0",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "Content-Type": mimeD,
                            "x-entity-length": size,
                            "x-entity-name": name,
                            "x-entity-type": mimeD,
                            "cookie": cookies,
                            "Referer": "https://www.facebook.com/",
                            "Referrer-Policy": "strict-origin-when-cross-origin"
                        },
                        "body": content,
                        "method": "POST"
                    })

                    const data = await res.json()

                    if (data.h) {

                        const res = await z.post("https://www.facebook.com/api/graphql/", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=a&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009319702&__s=kkjyjj:x8xz67:pnn29k&__hsi=7291281969750347905&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gF5Fd9hsFtdABni9LACKih3qAeExrKAmprAGaCHQhAti6RyEzKHHSGGTAF2HKEtwzzozxGbzrwt8nwLx-7U5i2y12wsA2eawi82ewEwzxO4U3gw9y0zU0Dy1bAwca2C0vG08KwxwkAQ2qdARwCyE1VQE7-0drw963-00WUE0fnU0irw0HMwcq036W0jGVWDw09tW&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25502&lsd=iOoORd1b2ZIEwk4KCViudJ&__spin_r=1009319702&__spin_b=trunk&__spin_t=1697633874&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UPLOAD_IMAGE","image_upload_handle":"'+data.h+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                        })

                        if (res.includes('{"ufac_client":{"id"')) {

                            return resolve()

                        } else {

                            return reject()
                        }

                    } else {

                        return reject('Không thể upload phôi')
                    }

                }
      
            } catch (err) {

                console.log(err)

                reject()
            }
        })
    }

    getAccountQuality() {

        return new Promise(async (resolve, reject) => {
                        
            try {
            
        
                const res = await fetch('https://www.facebook.com/api/graphql/', {
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "content-type": "application/x-www-form-urlencoded",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "max-age=0",
                        "dpr": "0.8999999761581421",
                        "priority": "u=0, i",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "cookie": this.cookie,
                        "user-agent": this.UA
                    },
                    agent: this.agent,
                    method: 'POST',
                    body: 'fb_dtsg='+this.dtsg+'&lsd='+this.lsd+'&variables={"assetOwnerId":"'+this.uid+'"}&doc_id=5816699831746699',
                })
    
                const result = await res.json()

                if (!result.errors) {

                    let trangthai = 'N/A'
                    let type = ''
                    let dame = false
            
                    const is_restricted = result.data.assetOwnerData.advertising_restriction_info.is_restricted
                    const status = result.data.assetOwnerData.advertising_restriction_info.status
                    const restriction_type = result.data.assetOwnerData.advertising_restriction_info.restriction_type

                    if (!is_restricted) {

                        if (restriction_type == "PREHARM" && status == "APPEAL_ACCEPTED") {
                            trangthai = "Tích Xanh XMDT"
                        }
                        
                        if (restriction_type == "ALE" && status == "APPEAL_ACCEPTED") {
                            trangthai = "Tích Xanh 902"
                        }
                        
                        if (status == "NOT_RESTRICTED") {
                            trangthai = "Live Ads - Không Sao Cả"
                            dame = true
                        }

                        if (restriction_type == "ADS_ACTOR_SCRIPTING") {
                            trangthai = "Tích xanh XMDT ẩn tích"
                        }

                        if (status == "NOT_RESTRICTED" && restriction_type == "BUSINESS_INTEGRITY") {
                            trangthai = "Tích xanh 902 ẩn tích"
                        }


                    } else {
                        
                        if (status == "VANILLA_RESTRICTED" && restriction_type == "BUSINESS_INTEGRITY") {
                            trangthai = "Hạn Chế Quảng Cáo"
                        }

                        if (is_restricted && restriction_type == "PREHARM") {

                            if (status == "VANILLA_RESTRICTED") {
                                trangthai = "Hạn Chế Quảng Cáo"
                                type = 'xmdt'
                            }
                            
                            if (status == "APPEAL_PENDING") {
                                trangthai = "Đang kháng XMDT"
                            }

                            if (status == "APPEAL_INCOMPLETE") {
                                trangthai = "Xmdt Chưa Xong"
                                type = 'xmdt'
                            }

                            if (status == "APPEAL_REJECTED_NO_RETRY" || status == 'APPEAL_TIMEOUT' || status == 'APPEAL_TIMEOUT') {
                                trangthai = "XMDT Xịt - Xmdt lại 273"
                            }

                        }

                        if (is_restricted && restriction_type == "ALE") {
                                
                            if (status == "APPEAL_PENDING") {
                                trangthai = "Đang Kháng 902";
                            }

                            if (status == "APPEAL_REJECTED_NO_RETRY") {
                                trangthai = "HCQC Vĩnh Viễn";
                            }

                            const ufac_state = result.data.assetOwnerData.advertising_restriction_info.additional_parameters.ufac_state
                            const appeal_friction = result.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_friction
                            const appeal_ineligibility_reason = result.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_ineligibility_reason

                            if (status == "VANILLA_RESTRICTED" && ufac_state == "FAILED" || status == "VANILLA_RESTRICTED" && ufac_state == "TIMEOUT") {
                                trangthai = "HCQC 902 xịt - Xmdt lại 273"
                                    
                            }

                            if (status == "VANILLA_RESTRICTED" && ufac_state == null && appeal_friction == "UFAC") {
                                trangthai = "HCQC 902 XMDT"
                                type = '902'
                            }

                            if (status == "VANILLA_RESTRICTED" && ufac_state == null && appeal_friction == null && appeal_ineligibility_reason == "ENTITY_APPEAL_LIMIT_REACHED") {
                                trangthai = "HCQC 902 xịt - Xmdt lại 273"

                            } else {

                                if (status == "VANILLA_RESTRICTED" && ufac_state == null && appeal_friction == null) {
                                    trangthai = "HCQC 902 Chọn Dòng"
                                    type = '902_line'
                                }

                                if (status == "VANILLA_RESTRICTED" && ufac_state == "SUCCESS" && appeal_friction == null) {
                                    trangthai = "HCQC 902 Chọn Dòng"
                                    type = '902_line'
                                }
                            }

                        }

                        if (is_restricted && restriction_type == "ACE" || restriction_type === "GENERIC") {
                            trangthai = "XMDT Xịt - Xmdt lại 273"
                        }

                        if (is_restricted && restriction_type == "RISK_REVIEW" || restriction_type === "RISK_REVIEW_EMAIL_VERIFICATION") {
                            trangthai = "XMDT Checkpoint"
                            type = 'xmdt_cp'
                        }

                        if (restriction_type == "ADS_ACTOR_SCRIPTING") {


                            if (status == 'APPEAL_REJECTED') {

                                trangthai = "XMDT Xịt - Xmdt lại 273"

                            } else if (status == 'APPEAL_PENDING') {

                                trangthai = "Đang kháng XMDT"

                            } else if (status == 'APPEAL_ACCEPTED') {

                                trangthai = "Tích Xanh 902"

                            } else {

                                trangthai = "Hạn Chế Quảng Cáo"
                                type = 'xmdt2'

                            }
                        }


                    }

                    resolve({
                        type,
                        dame,
                        status: trangthai
                    })

                } else {
                    reject(result.errors[0].summary)
                }

            } catch (err) {
                reject(err)
            }
    
        })
    }

}

module.exports = FB