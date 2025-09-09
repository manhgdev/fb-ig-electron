const cheerio = require('cheerio')
const generator = require('generate-password')
const {getMailCode, getCodeBrowser, randomNumberRange, capitalizeFLetter, delayTimeout, maskEmail} = require('./core.js')
const { getAccessToken3, getAccessToken2 } = require('./login.js')
const { zFetch } = require('./zquery.js')
const twofactor = require('node-2fa')

class Change {

    constructor (page, uid, password, email, dtsg, lsd) {
        this.page = page
        this.uid = uid
        this.password = password
        this.dtsg = dtsg
        this.email = email
        this.lsd = lsd
    }

    changePasswordApiMBasic (newPwd) {

        return new Promise(async (resolve, reject) => {
            
            const page = this.page 
            const dtsg = this.dtsg
            const oldPwd = this.password
            const z = new zFetch(page)

            try {

                const url = await z.getRedirect("https://m.facebook.com/password/change/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+dtsg+"&jazoest=25566&password_change_session_identifier=bc75d143-5db3-4c8b-9d9c-158fd8d86e4f&password_old="+oldPwd+"&password_new="+newPwd+"&password_confirm="+newPwd+"&save=L%C6%B0u+thay+%C4%91%E1%BB%95i",
                    "method": "POST",
                })

                const res = await z.get(url)

                if (res.includes('Đã đổi mật khẩu')) {
                    resolve()
                } else {
                    reject()
                }

            } catch {
                reject()
            }

        })
        
    }

    changePasswordMBasic (newPwd) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const oldPwd = this.password

            try {

                await page.goto('https://mbasic.facebook.com/settings/security/password/')

                await page.waitForSelector('input[name="password_new"]')

                await page.evaluate((newPwd, oldPwd) => {
                    document.querySelector('input[name="password_old"]').value = oldPwd
                    document.querySelector('input[name="password_new"]').value = newPwd
                    document.querySelector('input[name="password_confirm"]').value = newPwd
                }, newPwd, oldPwd)

                await page.click('input[type="submit"][name="save"]')

                await page.waitForSelector('input[value="keep_sessions"]')

                await page.click('input[value="keep_sessions"]')

                await page.click('input[name="submit_action"]')

                resolve()

            } catch {
                reject()
            }

        })
    }

    changePassword (newPwd) {
        
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.uid
            const oldPwd = this.password
            const dtsg = this.dtsg
            const lsd = this.lsd
            const z = new zFetch(page)
    
            try {
    
                const res = await z.post('https://www.facebook.com/api/graphql/', {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                    },
                    body: `av=${uid}&__user=${uid}&__a=1&__dyn=7AzHxqU5a5Q1ryUqxenFw9uu2i5U4e0ykdwSwAyUco2qwJxS1NwJwpUe8hw6vwb-q7oc81xoswaq221FwgolzUO0n2US2G5Usw9m1YwBgK7o884y0Mo4G4Ufo5m1mzXw8W58jwGzEaE5e7oqBwJK2W5olwUwgojUlDw-wUws9ovUaU3VBwJCwLyES0Io5d08O321bwzwTwNxe6Uak1xwJwxw&__csr=gz2zECOcYp4p6KJYAZ9ZlfuFpJCjW_tl8IhTiiHH8uLJprilkFlF6Ah9qXCVeieh999LhVF9FqCDLCzVEy4oC9VWxhoy9y8XxC2qex2fDBwko89FEy32Egzouxy2KbwUDxy2i2qbxy2i1zwkF852i3a1mwNwpE5K1rwYyE4q9wvEhwsU6S17wqE5G22266Epwj80d2U0c_U02UUw1By00GSU0kVg1u80HO0aGw7_x20lC2a&__req=c&__hs=19349.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1&__ccg=EXCELLENT&__rev=1006770320&__s=i3lqb8%3Av8tmwz%3Afp9vfk&__hsi=7180247638856180079&__comet_req=15&fb_dtsg=${dtsg}&jazoest=25511&lsd=${lsd}&__spin_r=1006770320&__spin_b=trunk&__spin_t=1671781679&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PrivacyCheckupPasswordChangeMutation&variables=%7B%22input%22%3A%7B%22confirm_password%22%3A%22${newPwd}%22%2C%22new_password%22%3A%22${newPwd}%22%2C%22old_password%22%3A%22${oldPwd}%22%2C%22allow_unchanged%22%3Afalse%2C%22actor_id%22%3A%22${uid}%22%2C%22client_mutation_id%22%3A%221%22%7D%7D&server_timestamps=true&doc_id=5234317409926323`,
                })
    
                if (res.includes('"client_mutation_id":"1"')) {
                    resolve()
                } else {
                    reject()
                }
            
            } catch (err) {
                reject(err)
            }
            
    
        })
    }

    confirmMailApi(email, code) {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            const dtsg = this.dtsg
            const uid = this.uid
            const z = new zFetch(page)

            try {

                const res = await z.post("https://accountscenter.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=12&__hs=19643.HYP:accounts_center_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1009219091&__s=y8mbd2:xyeo0f:e5hul3&__hsi=7289272213868076833&__dyn=7xeUmwlE7ibwKBWo2vwAxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65xO2O1Vw8G1Qw5Mx61vw9m1YwBgao6C0Mo2sx-3m1mxe0EUjwGzE2swwwNwKwHw8Xwn82Lx_w4HwJwSyES1Tw8W0Lo6-3u362-0z85C1Iwqo5u1Jw&__csr=gD7_SPSyBOiVV97VaWTiTqWF9TiFd5jSy4rQHTASRBzzpnOJGK9-KiEGKnjAnHCVKFpknEC9Qb_zUqyObyGWy2xnADyAVVucJ1jy-9y9UKm68Cm00gLK045o42eU11UmF06Bw0z9iCjgaGGdglwOg6x3k4oiomGGFxcwrGF8oG5Uhw2OGGFUbo8sMyeh2Ea1Qw46Eug8o5uKaGnz8-ES16xmu5PAxamWK4bzGGKWAF39uHDF9aGizWGJaGGVbBDyohyy03qmb87Gw&__comet_req=5&fb_dtsg='+dtsg+'&jazoest=25470&lsd=ASdwHo3qe3R-2C4F9mRUAG&__spin_r=1009219091&__spin_b=trunk&__spin_t=1697165941&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterContactPointConfirmationDialogVerifyContactPointMutation&variables={"contact_point":"'+email+'","contact_point_type":"email","pin_code":"'+code+'","selected_accounts":["'+uid+'"],"family_device_id":"device_id_fetch_datr","client_mutation_id":"mutation_id_1697165969254","contact_point_event_type":"ADD","normalized_contact_point_to_replace":"'+email+'"}&server_timestamps=true&doc_id=6418775468173098',
                })

                const emails = await this.getMailPhu()

                const checkEmail = emails.filter(item => item.email === email)

                if (checkEmail[0]) {
                    resolve()
                } else {
                    reject()
                }

            } catch {
                reject()
            }
        })
    }

    confirmMailMbasic(email, code) {
        return new Promise(async (resolve, reject) => {
            const page = this.page

            try {

                await page.goto('https://mbasic.facebook.com/entercode.php?cp='+email+'&source_verified=m_settings')

                await page.waitForSelector('[name="code"]')

                await page.type('[name="code"]', code)

                await page.waitForTimeout(3000)

                await Promise.all([
                    page.click('[value="Gửi"]'),
                    page.waitForNavigation({waitUntil: 'networkidle0'})
                ])

                const html = await page.content()
                
                if (html.includes('Mã xác nhận không hợp lệ')) {
                    reject()
                } else {
                    resolve()
                }

            } catch {
                reject()
            }

        })
    }

    confirmMailMbasicApi(email, code) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const fb_dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                const res = await z.get('https://mbasic.facebook.com/entercode.php?cp='+email+'&source_verified=m_settings')

                const $ = cheerio.load(res)
                const url = 'https://mbasic.facebook.com'+$('form[action^="/entercode.php"]').attr('action')

                const html = await z.post(url, {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+fb_dtsg+"&jazoest=25433&code="+code,
                })
                
                if (html.includes('Mã xác nhận không hợp lệ')) {
                    reject()
                } else {
                    resolve()
                }

            } catch {
                reject()
            }

        })
    }

    addMailMBasicApi(email, removeEmail) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const fb_dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                removeEmail()

                await z.post("https://mbasic.facebook.com/a/settings/email/", {
                    "headers": {
                      "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": 'fb_dtsg='+fb_dtsg+'&jazoest=25454&email='+email+'&add_email=1&qp_id=&c=&qp_h=&source_added=m_settings&save=Thêm+Email',
                  })

                const res = await z.get('https://mbasic.facebook.com/settings/email/')

                const user = (email.split('@'))[0]

                if (res.includes(user)) {

                    resolve()

                } else {
                    reject('Add mail không thành công')
                }

            } catch {
                reject('Add mail không thành công')
            }
        })
    }

    addMailApi(email, removeEmail) {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.uid
            const fb_dtsg = this.dtsg
            const lsd = this.lsd
            const z = new zFetch(page)

            try {

                removeEmail()

                await z.post("https://accountscenter.facebook.com/api/graphql/", {
                    "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=t&__hs=19639.HYP:accounts_center_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1009118537&__s=ognjyj:kfqeav:pdobcc&__hsi=7287880450223747251&__dyn=7xeUmwlE7ibwKBWo2vwAxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65xO2O1Vw8G1Qw5Mx61vw9m1YwBgao6C0Mo2sx-3m1mxe0EUjwGzE2swwwNwKwHw8Xwn82Lx_w4HwJwSyES1Tw8W0Lo6-3u362-0z85C1Iwqo5u1Jw&__csr=gT5_v9az8F4yZRjALGu8Q-CBaRGAyTlugzQiWpvSB8Bl4Cmh9cClJDhWyORDXhSUFbiDbFi5aqdGqh-eyoO7-HQXGHyrZ5Ay8pK56agHG9y8lw04dpw2fS2K221Fwaq09jF0Dw0yvjg3aGZ3mbx64Q4Amhadgep8K08RGGCzaGKWGiu3CuHxmii79GGiqu9GF8a2xseQ4jEE3pABKdOwJgpKezkl12QiKGAZ6hpaGmGGAEJQiUkwhqG9DGqF-awfRxcw&__comet_req=5&fb_dtsg='+fb_dtsg+'&jazoest=25020&lsd='+lsd+'&__spin_r=1009118537&__spin_b=trunk&__spin_t=1696841896&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterAddContactPointMutation&variables={"country":"US","contact_point":"'+email+'","contact_point_type":"email","selected_accounts":["'+uid+'"],"family_device_id":"device_id_fetch_datr","client_mutation_id":"mutation_id_123456789"}&server_timestamps=true&doc_id=6011904518939183',
                })

                const res = await z.get('https://mbasic.facebook.com/settings/email/')

                const user = (email.split('@'))[0]

                if (res.includes(user)) {

                    resolve()

                } else {
                    reject('Add mail không thành công')
                }

            } catch {
                reject('Add mail không thành công')
            }

        })

    }

    addMail (email, removeEmail) {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.uid
            const dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                removeEmail()
        
                await z.post('https://www.facebook.com/add_contactpoint/dialog/submit/', {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                    },
                    method: 'post',
                    body: `jazoest=22134&fb_dtsg=${dtsg}&next=&contactpoint=${email}&__user=${uid}&__a=1&__dyn=&__req=1&__be=1&__pc=PHASED%3ADEFAULT&dpr=1&__rev=&__s=&__hsi=7174763124268448758&__spin_r=1006705921&__spin_b=trunk&__spin_t=1670504716`,
                })

                const res = await z.get('https://mbasic.facebook.com/settings/email/')

                const user = (email.split('@'))[0]

                if (res.includes(user)) {

                    resolve()

                } else {
                    reject('Add mail không thành công')
                }

            } catch {
                reject('Add mail không thành công')
            }
    
        })
    }

    addMailMBasic(email, removeEmail) {

        return new Promise(async (resolve, reject) => {
            const page = this.page 

            try {

                removeEmail()

                await page.goto('https://mbasic.facebook.com/settings/email/add')

                await page.waitForSelector('input[name="email"]')
                await page.type('input[name="email"]', email)

                await page.waitForTimeout(5000)

                await page.click('input[name="save"]')

                await page.waitForSelector('a[href*="entercode.php"]')

                const error = await page.$('span.bm') || false 

                if (error) {
                    reject(await page.$eval('span.bm', el => el.innerText))
                } else {
                    resolve()
                }
            
            } catch (err) {
                reject(err)
            }


        })

    }

    setPrimaryEmailApiMbasic(newEmail) {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            const dtsg = this.dtsg 
            const z = new zFetch(page)

            try {

                const html = await z.get('https://mbasic.facebook.com/settings/email/?primary_email')
                const $ = cheerio.load(html)

                const emails = []

                $('[name="email"]').each(function() {
                    emails.push({
                        value: $(this).val(),
                        email: $(this).parent('label').text()
                    })
                })

                const email = emails.filter(item => {
                    return item.email === newEmail
                })

                if (email[0]) {

                    const url = await z.getRedirect("https://mbasic.facebook.com/a/settings/email/?eav=AfbgC6wj2_yC21x5OBiodLRXJhtIXMopZWNoA4NEoOid1A0bDVGOk7ETaxYOjswRNnI&paipv=0&refid=74", {
                        "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25415&email="+email[0].value+"&change_primary=1&save=L%C6%B0u",
                        "method": "POST",
                    })

                    if (url.includes('?email_status=3')) {
                        resolve()
                    } else {
                        reject('Đặt email chính thất bại')
                    }

                } else {
                    reject('Không tìm thấy email để xóa')
                }
                
            } catch (err) {
                reject('Đặt email chính thất bại')
            }

        })
    }

    setPrimaryEmail(newEmail) {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            const dtsg = this.dtsg 
            const uid = this.uid 
            const lsd = this.lsd 
            const z = new zFetch(page)

            try {

                const html = await z.get('https://m.facebook.com/settings/email/?primary_email')
                const $ = cheerio.load(html)

                const emails = []

                $('[name="email"]').each(function() {
                    emails.push({
                        value: $(this).val(),
                        email: $(this).parent('label').text()
                    })
                })


                const email = emails.filter(item => {
                    return item.email === newEmail
                })

                if (email[0]) {

                    await z.post("https://m.facebook.com/a/settings/email/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "email="+email[0].value+"&change_primary=1&save=L%C6%B0u&fb_dtsg="+dtsg+"&jazoest=25540&lsd="+lsd+"&__dyn=1KQEGiE5q5Ujwh8-t0BBBgS5UqxK12wAxu3-U2owSwMxW0Horx60lW4o3Bw4Ewk9E4W0om78b87C1Jwt8-0nS4o1sE52229wcq0DUdE2IzU2Xwp834wmE2ewnE2Lx-220n66811E2ZwrU6C2-0z836w&__csr=&__req=b&__a=AYk1pBHg_Haje1Cjzfb7jtqJ3QLinRrkk6E2zcJRbnPZTw_eSSITAG851K0TyuT0RjBA6HHCEVCMh6GdZYzoi_0bZ55Sg4dd0KUeXkyjfmQi-g&__user="+uid,
                    })

                    const primaryEmail = await this.checkMailChinh()

                    if (primaryEmail === newEmail) {
                        resolve()
                    } else {
                        reject('Đặt email chính thất bại')
                    }

                } else {
                    reject('Không tìm thấy email để xóa')
                }
                
            } catch (err) {
                console.log(err)
                reject('Đặt email chính thất bại')
            }

        })
    }

    setPrimaryEmailMbasic(newEmail) {

        return new Promise(async (resolve, reject) => {

            const page = this.page

            try {

                await page.goto('https://mbasic.facebook.com/settings/email/?primary_email')

                const $ = cheerio.load(await page.content())

                const emails = []

                $('[name="email"]').each(function() {
                    emails.push({
                        value: $(this).val(),
                        email: $(this).parent('label').text()
                    })
                })

                const email = emails.filter(item => {
                    return item.email === newEmail
                })

                if (email[0]) {

                    await page.click('input[type="radio"][value="'+email[0].value+'"]')

                    await Promise.all([
                        page.click('input[name="save"]'),
                        page.waitForNavigation({
                            waitUntil: 'networkidle0'
                        })
                    ])

                    const url = await page.url()

                    if (url.includes('?email_status=3')) {
                        resolve()
                    } else {
                        reject('Đặt email chính thất bại')
                    }

                } else {
                    reject('Không tìm thấy email để xóa')
                }


            } catch (err) {
                reject('Đặt email chính thất bại')
            }

        })

    }

    checkMailChinh () {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const z = new zFetch(page)

            try {

                const html = await z.get('https://mbasic.facebook.com/settings/email/')
                const $ = cheerio.load(html)

                const email = $('a[href*="?primary_email"] span').text()
        
                if (email) {
                    resolve(email)
                } else {

                    const emails = await this.getMailPhu()

                    if (emails.length === 1) {
                        resolve(emails[0].email)
                    } else {
                        resolve('')
                    }

                }
            } catch (err) {
                reject(err)
            }
        })
    
    }

    getMailPhu(newEmail = '') {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const z = new zFetch(page)

            try {

                const html = await z.get('https://mbasic.facebook.com/settings/email/?primary_email')
                const $ = cheerio.load(html)

                const emails = []

                $('[name="email"]').each(function() {
                    emails.push({
                        value: $(this).val(),
                        email: $(this).parent('label').text()
                    })
                })

                resolve(emails.filter(item => item.email !== newEmail))

            } catch (err) {
                reject(err)
            }
        })
    
    }

    deleteEmailMbasicApi(emailPhu) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                let success = 0

                for (let index = 0; index < emailPhu.length; index++) {

                    const email = emailPhu[index]
                    
                    const url = await z.getRedirect("https://mbasic.facebook.com/a/settings/email/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'fb_dtsg='+dtsg+'&jazoest=25635&remove_email=1&email='+email+'&save=Gỡ+email',
                        "method": "POST"
                    })

                    if (url.includes('/settings/email/?saved=1')) {
                        success++
                    }

                }

                resolve('Đã xóa '+success+'/'+emailPhu.length+' email')

            } catch {
                reject()
            }

        })
    }

    deleteEmailApi(emailPhu, emailChinh, password) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const dtsg = this.dtsg
            const uid = this.uid
            const lsd = this.lsd
            const z = new zFetch(page)

            try {

                let success = 0

                for (let index = 0; index < emailPhu.length; index++) {

                    const email = emailPhu[index]
                    
                    const res = await z.post("https://accountscenter.facebook.com/api/graphql/", {
                        "headers": {
                          "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "av="+uid+"&__user="+uid+"&__a=1&__req=h&__hs=19923.HYP%3Aaccounts_center_pkg.2.1..0.0&dpr=1&__ccg=MODERATE&__rev=1015005800&__s=0oahgp%3A82vxug%3Asay6uo&__hsi=7393289059709679226&__dyn=7xeUmwlEnwn8K2Wmh0no6u5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O1lwlE-U2zxe2GewbS361qw8Xwn82Lx-0iS2S3qazo7u0zE2ZwrUdUcobU3Cwr86C1nwro2PxW1owmU&__csr=gojTnTv8IDO4XRImGuWJpiAqaIyO9fEHHihlhTQHjUHIDQa-GmHHJrAKbZ94huL_inJ1fUW-lQZuEgxCEjAfi4mVAm8CCIxJoqxpF94xumm4FoiCU4muTKh6G6WG4paz-qEqKUiUlVpei00kiGnw28E3qw11C0FEeGF289aGiE6u1nQGGEzGE0agVQa40ZyEN3EGi1Exa0zlByuhyU2Rw3TBO0lxcE2YaVQ94wKKE9Qi9Uvx664U426-ibBGFElwnEO3S4pHAAyomP3FVU7Dw3Sk1ShFU&__comet_req=5&fb_dtsg="+dtsg+"&jazoest=25559&lsd=sv8quxDp3npL_ajxFrseFl&__spin_r=1015005800&__spin_b=trunk&__spin_t=1721384250&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterDeleteContactPointMutation&variables=%7B%22normalized_contact_point%22%3A%22"+email+"%22%2C%22contact_point_type%22%3A%22EMAIL%22%2C%22selected_accounts%22%3A%5B%22"+uid+"%22%5D%2C%22client_mutation_id%22%3A%22mutation_id_1721384270428%22%2C%22family_device_id%22%3A%22device_id_fetch_datr%22%7D&server_timestamps=true&doc_id=6716611361758391",
                    })

                    const resData = JSON.parse(res)

                    const description = JSON.parse(resData.errors[0].description)

                    const encrypted = description.encrypted_context

                    await delayTimeout(10000)

                    try {
                        

                        const code = await getMailCode(emailChinh, password)

                        const res2 = await z.post("https://accountscenter.facebook.com/api/graphql/", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "av="+uid+"&__user="+uid+"&__a=1&__req=z&__hs=19923.HYP%3Aaccounts_center_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1015005800&__s=n0sxfz%3Ao1ic7k%3Arfbfiw&__hsi=7393293083262511623&__dyn=7xeUmwlEnwn8K2Wmh0no6u5U4e0yoW3q32360CEbo19oe8hw2nVE4W0om0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O1lwlE-U2zxe2GewbS361qw8Xwn82Lx-0iS2S3qazo7u0zE2ZwrUdUcobU3Cwr86C1nwro2PxW1owmU&__csr=gojTnTv8IDO4XRImGuWJpiAqaIyO9fEHHihlhtZaQ-aX9Z2LGBGWXmVby_ih4nH_QBXgj-eLBtfnG48pG4V3Qx5Kp5y9FH8rm6Emqih8nBBxam4FK15DJXAhGxKGx6iE_CG6HK4K5umjAw054GBU0ya0SE0gpwaq3GGgy2iGAG1DwlZaGG8WG02Aet2x0aVayoGcgWaAwq8iw8RpoDAoK0Jo0ZVsw5oja0L2Kt2h8bHGi294yu7Uhxxe10xLAyVqGq5o5WcwZx6qV98C5IMWuu1VU0ZB0tAqu&__comet_req=5&fb_dtsg="+dtsg+"&jazoest=25630&lsd=-gSpYy3n2doG8zo2zadtfR&__spin_r=1015005800&__spin_b=trunk&__spin_t=1721385187&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useTwoFactorLoginValidateCodeMutation&variables=%7B%22code%22%3A%7B%22sensitive_string_value%22%3A%22"+code.code+"%22%7D%2C%22method%22%3A%22EMAIL%22%2C%22flow%22%3A%22SECURED_ACTION%22%2C%22encryptedContext%22%3A%22"+encrypted+"%22%2C%22maskedContactPoint%22%3A%22"+maskEmail(emailChinh)+"%22%7D&server_timestamps=true&doc_id=7404767032917067",
                        })

                        const resData2 = JSON.parse(res2)

                        console.log(resData2)

                        await delayTimeout(500000000)

                    } catch {}

                }

                resolve('Đã xóa '+success+'/'+emailPhu.length+' email')
                
            } catch {
                reject()
            }

        })
    }

    deleteEmailMbasic(emailPhu) {

        return new Promise(async (resolve, reject) => {

            try {

                const page = this.page 

                await page.goto('https://mbasic.facebook.com/settings/email/')

                const html = await page.content()

                const $ = cheerio.load(html)


                const urls = []

                $('a[href^="/settings/email/?remove_email"]').each(async function() {

                    const url = 'https://mbasic.facebook.com'+$(this).attr('href')

                    const params = new URL(url).searchParams
                    const email = decodeURIComponent(params.get('email'))

                    urls.push({
                        email,
                        url
                    })
                    
                })

                const data = urls.filter(item => emailPhu.includes(item.email))

                let success = 0

                for (let index = 0; index < data.length; index++) {

                    await page.goto(data[index].url)
                    
                    await Promise.all([
                        page.click('input[name="save"]'),
                        page.waitForNavigation({waitUntil: 'networkidle0'})
                    ])

                    const url = await page.url()

                    if (url.includes('/settings/email/?saved=1')) {
                        success++
                    }
                    
                }

                resolve('Đã xóa '+success+'/'+emailPhu.length+' email')

            } catch {
                reject()
            }

        })
    }

    deletePhone (password) {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const dtsg = this.dtsg
            const uid = this.uid
            const z = new zFetch(page)

            try {    
    
                let urls = await this.getPhone()

                const html = await z.get('https://www.facebook.com/settings/?tab=mobile')
        
                const token = html.match(/(?<=\"compat_iframe_token\":\")[^\"]*/g)
                
                let success = 0

                for (let index = 0; index < urls.length; index++) {

                    const phone = urls[index].phone
                    
                    await z.post('https://www.facebook.com/ajax/settings/mobile/delete_phone.php', {
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                        },
                        body: `phone_number=${phone}&profile_id=${uid}&shared=false&__user=${uid}&__a=1&__dyn=7xu5Fo4OQ1PyUbAjFwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3BwbC0LVE4W0y8460KEswaq1vwGwt81sbzo5-1uwbe3a7o884y0i23S0H83bwdq1iwmE2ewnE2Lx-0lK3qazo11E2ZwrU6C0L8&__csr=&__req=3&__hs=19344.BP%3ADEFAULT.2.0.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1006757422&__s=en27px%3A2rsg61%3Awtl125&__hsi=7178357156082373380&__comet_req=0&cquick=jsc_c_r&cquick_token=${token}&ctarget=https%3A%2F%2Fwww.facebook.com&fb_dtsg=${dtsg}&jazoest=25387&lsd=w0BF1JN8h6nLjK2my53aDw&__spin_r=1006757422&__spin_b=trunk&__spin_t=1671341517&ajax_password=${password}&confirmed=1`,
                    })

                    success++
                    
                }

                resolve('Đã xóa '+success+'/'+urls.length+' SĐT')


            } catch {
                reject()
            }
        })

    }

    getPhone() {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const z = new zFetch(page)

            try {
                const html = await z.get('https://mbasic.facebook.com/settings/sms/')
    
                const $ = cheerio.load(html)
    
                let urls = []
            
                $('a').each(function() {
                    if ($(this).attr('href').includes('/settings/sms/?remove_phone')) {

                        const url = 'https://mbasic.facebook.com'+$(this).attr('href')
                        const params = new URL(url).searchParams
                        const phone = params.get('phone_number')

                        urls.push({
                            url,
                            phone
                        })
                    }
                })

                resolve(urls)
            } catch {
                reject()
            }

        })
    }

    deletePhoneMbasic(password) {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const z = new zFetch(page)

            try {    
    
                let urls = await this.getPhone()
                
                let success = 0

                for (let index = 0; index < urls.length; index++) {

                    const url = urls[index].url
                    
                    await page.goto(url)

                    await page.waitForSelector('[name="remove_phone_warning_acknwoledged"]')

                    await page.click('[name="remove_phone_warning_acknwoledged"]')

                    await page.waitForTimeout(2000)

                    await Promise.all([
                        page.click('[value="Gỡ số"]'),
                        page.waitForNavigation({waitUntil: 'networkidle0'})
                    ])

                    await page.waitForSelector('[name="save_password"]')

                    await page.type('[name="save_password"]', password)

                    await page.waitForTimeout(2000)
                    
                    await Promise.all([
                        page.click('[name="save"]'),
                        page.waitForNavigation({waitUntil: 'networkidle0'})
                    ])

                    const url2 = await page.url()

                    if (url2.includes('?saved')) {
                        success++
                    }
                    
                }

                resolve('Đã xóa '+success+'/'+urls.length+' SĐT')

            } catch {
                reject()
            }
        })
    }

    deletePhoneMbasicApi(password) {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const dtsg = this.dtsg
            const z = new zFetch(page)

            try {    
    
                let urls = await this.getPhone()
                
                let success = 0

                for (let index = 0; index < urls.length; index++) {

                    const phone = urls[index].phone
                    
                    const url = await z.getRedirect("https://mbasic.facebook.com/a/settings/sms/?remove_phone=1&phone_number="+phone+"&redirect_to_unified_contact_setting_page=0&use_tetra=all_tetra", {
                        "headers": {
                          "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'fb_dtsg='+dtsg+'&jazoest=25393&save_password='+password+'@&error_uri=/settings/sms/?remove_phone&phone_number='+phone+'&eav=AfYRjxFabNR6CIjEQBDQ92DAQH4NEuLwlyAEdCOIWm2Uvt9-WaCPEyia6cP1-GmZqU4&paipv=0&invalid_password=1&save=Gỡ+điện+thoại',
                        "method": "POST",
                    })

                    if (url.includes('?saved')) {
                        success++
                    }
                    
                }

                resolve('Đã xóa '+success+'/'+urls.length+' SĐT')


            } catch {
                reject()
            }
        })
    }

    logoutDevicesApiMbasic() {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const z = new zFetch(page)

            try {

                const html = await z.get('https://mbasic.facebook.com/settings/security_login/sessions/log_out_all/confirm/')
                const $ = cheerio.load(html)

                const link = 'https://mbasic.facebook.com'+$('a[href^="/security/settings/sessions/log_out_all/?redirect=1"]').attr('href')

                await z.get(link)

                resolve()

            } catch {
                reject()
            }


        })
    }

    logoutDevices() {

        return new Promise(async (resolve, reject) => {

            try {

                const page = this.page
                const uid = this.uid
                const dtsg = this.dtsg
                const z = new zFetch(page)

                const res = await z.post("https://accountscenter.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=k&__hs=19641.HYP:accounts_center_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1009171716&__s=4jbf61:36qvrj:10dgn1&__hsi=7288610049732280054&__dyn=7xeUmwlE7ibwKBWo2vwAxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65xO2O1Vw8G1Qw5Mx61vw9m1YwBgao6C0Mo2sx-3m1mxe0EUjwGzE2swwwNwKwHw8Xwn82Lx_w4HwJwSyES1Tw8W0Lo6-3u362-0z85C1Iwqo5u1Jw&__csr=gT6FlO8LH4b8PqmA9Sb_kChpnox99rN2h7ATELprFaH9rrCAF4rGBV8yFFamy2AH--ChqSV7m9gSKdigJxzWyp8LhUzUgUJQHgjG48KvyrykEOm5A6E012XU0gUwb61jg6y3W02rdbwNzof40ykfCgy7uaByvxmGG4ohyUbS08ywMwlpaGmGGESiqK2uGGGGmFh1EVmygEEfQ52wFwgoNo4OFGUmAouJ4yoy6iwzGq9yUmcq4XG4uieGeGGKazqVqFaFprGGGGGF40BUVoRw5ow5Dw&__comet_req=5&fb_dtsg='+dtsg+'&jazoest=25465&lsd=8_TsBJw6ceDVfYpD54GyS9&__spin_r=1009171716&__spin_b=trunk&__spin_t=1697011768&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FXAccountsCenterDeviceLoginActivitiesDialogQuery&variables={"account_id":"'+uid+'","account_type":"FACEBOOK","interface":"FB_WEB"}&server_timestamps=true&doc_id=6487574057995774',
                })

                const data = JSON.parse(res)

                const devices = data.data?.fxcal_settings?.node?.sessions_data.filter(item => !item.is_active).map(item => item.id)

                if (devices.length > 0) {

                    const res2 = await z.post("https://accountscenter.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=13&__hs=19641.HYP:accounts_center_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1009171716&__s=ny2v6z:q1s3b3:ncqcyv&__hsi=7288615680289341243&__dyn=7xeUmwlE7ibwKBWo2vwAxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65xO2O1Vw8G1Qw5Mx61vw9m1YwBgao6C0Mo2sx-3m1mxe0EUjwGzE2swwwNwKwHw8Xwn82Lx_w4HwJwSyES1Tw8W0Lo6-3u362-0z85C1Iwqo5u1Jw&__csr=gT6FlO8Ln4l8PqmA9SmnZip5h7ox99rN5WujuyZBKAGIBJKqiAhJqnADiKFamy2AH--ChqSV7m9gSKdigJxzWyp8LhUzUgUJQHgjG48KvyrykEOm5A6E012XU0gUwb61jg6y3W02rdbwNGagW2N08B3VA8xTyFoDUlGGx64oK2Zw28Ec85miGBGGGdACHwDGGGGBGkgqelEAaa3Z1gEao46cm1cGqK5F67Hh8C8xAE8WCyoK5z6xeWx7AzGzGGHgCdHBGAGBBKGGGGGAg2nzBzm0ly0mu&__comet_req=5&fb_dtsg='+dtsg+'&jazoest=25342&lsd=Q-IEU8knG-SLLrAFvMj_7a&__spin_r=1009171716&__spin_b=trunk&__spin_t=1697013080&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useFXSettingsLogoutSessionMutation&variables={"input":{"client_mutation_id":"39055741-93ee-44edf-9eba-abfc3c3e924b","actor_id":"'+uid+'","account_id":"'+uid+'","account_type":"FACEBOOK","mutate_params":{"logout_all":false,"session_ids":["'+devices.join('","')+'"]},"fdid":"device_id_fetch_datr"}}&server_timestamps=true&doc_id=5253374301386065',
                    })

                    if (res2.includes('"success":true')) {
                        resolve()
                    } else {
                        reject()
                    }

                } else {
                    resolve()
                }

            } catch (err) {
                console.log(err)
                reject()
            }
        })
    }

    logoutDevicesMBasic() {
        return new Promise(async (resolve, reject) => {
            const page = this.page 


            try {

                await page.goto('https://mbasic.facebook.com/settings/security_login/sessions/')

                await page.waitForSelector('a[href^="/settings/security_login/sessions/log_out_all"]')
                await page.click('a[href^="/settings/security_login/sessions/log_out_all"]')

                await page.waitForSelector('a[href^="/security/settings/sessions/log_out_all/"]')
                await page.click('a[href^="/security/settings/sessions/log_out_all/"]')

                resolve()
            } catch {
                reject()
            }
 
        })
    }



    deleteOldCookie() {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const uid = this.uid 
            const dtsg = this.dtsg
            const lsd = this.lsd
            const z = new zFetch(page)

            try {


                await z.post("https://www.facebook.com/login/device-based/turn-on/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": 'flow=logged_in_settings&reload=1&__user='+uid+'&__a=1&__req=4&__hs=19639.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009116923&__s=o0x5im:1bnnfo:hdhi6w&__hsi=7287768069197381037&__dyn=7xeUmwkHg7ebwKBWo5O3Gu2i5U4e1Fx-ewSwMxW0DUS2S0im4E9ohwem0nCq1ewcG0KEswIwuo2awt81s8hwnU5W0IU9k2C2218w5uwaO0OU3mwkE5G0zE5W0HUvw6ixy0gq0Lo6-1FwbO0NE&__csr=&fb_dtsg='+dtsg+'&jazoest=25718&lsd=CLFcDSQ4vc0cV4M9lQ2mm9&__spin_r=1009116923&__spin_b=trunk&__spin_t=1696815730',
                })

                await z.post('https://www.facebook.com/login/device-based/async/remove/', {
                    "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "flow=logged_in_settings&__user="+uid+"&__a=1&__req=3&__hs=19636.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1009077610&__s=ym8u8d%3Aihm87k%3Aywwlax&__hsi=7286658291213988068&__dyn=7xeUmwkHg7ebwKBWo5O3Gu2i5U4e1Fx-ewSwMxW0DUS2S0im4E9ohwem0nCq1ewcG0KEswIwuo2awt81s8hwnU5W0IU9k2C2218w5uwaO0OU3mwkE5G0zE5W0HUvw6ixy0gq0Lo6-1FwbO0NE&__csr=&fb_dtsg="+dtsg+"&jazoest=25510&lsd="+lsd+"&__spin_r=1009077610&__spin_b=trunk&__spin_t=1696557340",
                })

                resolve()

            } catch {
                reject()
            }

        })
    }

    bat2FaTTTK() {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const fb_dtsg = this.dtsg
            const lsd = this.lsd
            const uid = this.uid
            const z = new zFetch(page)

            try {

                await page.goto('https://accountscenter.facebook.com/password_and_security/two_factor')

                await page.waitForXPath('//span[text()="Facebook"]/parent::div/parent::div/parent::div/parent::div/parent::div/parent::div[@tabindex]')

                await this.clickXpath('//span[text()="Facebook"]/parent::div/parent::div/parent::div/parent::div/parent::div/parent::div[@tabindex]')

                await page.waitForXPath('//span[text()="Ứng dụng xác thực"]/parent::div/parent::div/parent::div/parent::div/parent::div/parent::div[@tabindex]')

                await this.clickXpath('//span[text()="Ứng dụng xác thực"]/parent::div/parent::div/parent::div/parent::div/parent::div/parent::div[@tabindex]')

                await page.waitForSelector('[role="switch"]')

                const checked = await page.$eval('[role="switch"]', element => element.checked)

                if (checked) {

                    await page.click('[role="switch"]')

                    await page.waitForXPath('//span[text()="Tắt"]/parent::span/parent::div/parent::div/parent::div/parent::div[@tabindex]')

                    await this.clickXpath('//span[text()="Tắt"]/parent::span/parent::div/parent::div/parent::div/parent::div[@tabindex]')



                }

            } catch (err) {
                console.log(err)
            }

        })
    }

    bat2FaM(password) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const fb_dtsg = this.dtsg
            const z = new zFetch(page)

            if (password) {

                try {

                    await page.goto('https://m.facebook.com/security/2fac/setup/intro')

                    await page.waitForSelector('input[type="password"]', {timeout: 5000})

                    await page.type('input[type="password"]', password)

                    await Promise.all([
                        page.keyboard.press('Enter'),
                        page.waitForNavigation({waitUntil: 'networkidle0'})
                    ])

                    try {

                        await page.waitForSelector('input[type="password"]', {timeout: 5000})

                        return reject('Bật 2FA thất bại: Mật khẩu không chính xác')

                    } catch {}

                    await page.waitForTimeout(5000)

                } catch {}

            }

            try {

                await z.post("https://m.facebook.com/security/2fac/setup/turn_off/async/?paipv=0", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+fb_dtsg+"&jazoest=25368",
                })

                const html = await z.get('https://m.facebook.com/security/2fac/settings/')
                const $ = cheerio.load(html)

                const link = $('a[href^="https://m.facebook.com/security/2fac/setup/qrcode/generate/"]').attr('href')
                const redirect = await z.getRedirect(link)

                if (redirect) {

                    const html = await z.get(redirect)
                    const $ = cheerio.load(html)

                    const twofa = $('[data-testid="key"]').text().replaceAll(' ', '')
                    const twofaCode = twofactor.generateToken(twofa)
                    const code = twofaCode.token

                    if (code) {

                        const redirect = await z.getRedirect("https://m.facebook.com/security/2fac/setup/verify_code/?paipv=0&eav=AfbAUZMhvv5buP5t9GHazKZKYKmdp-4cjnVwjFLoO3z7va-svGNG1Rg2Bs9SpUGiudY", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "fb_dtsg="+fb_dtsg+"&jazoest=25304&code="+code,
                            "method": "POST",
                        })

                        if (redirect.includes('?error_message')) {
                            const url = new URL(redirect)
                            const search = url.searchParams

                            const error = search.get('error_message')

                            reject(error)

                        } else {

                            const html = await z.get(redirect)
                            
                            if (html.includes('TwoFactButton')) {
                                resolve(twofa)
                            } else {
                                reject('Bật 2FA thất bại')
                            }

                        }

                    } else {
                        reject('Bật 2FA thất bại')
                    }

                } else {
                    reject('Bật 2FA thất bại')
                }


            } catch (err) {

                const url = await z.getRedirect('https://m.facebook.com/security/2fac/settings/')

                if (url.includes('password/reauth')) {
                    reject('Bật 2FA thất bại: Yêu cầu xác nhận')
                } else {
                    reject('Bật 2FA thất bại')
                }
            }

        })
    }

    bat2FaMBasic(password) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const fb_dtsg = this.dtsg
            const z = new zFetch(page)

            if (password) {

                try {

                    await page.goto('https://mbasic.facebook.com/security/2fac/setup/intro')

                    await page.waitForSelector('input[type="password"]', {timeout: 5000})

                    await page.type('input[type="password"]', password)

                    await Promise.all([
                        page.keyboard.press('Enter'),
                        page.waitForNavigation({waitUntil: 'networkidle0'})
                    ])

                    try {

                        await page.waitForSelector('input[type="password"]', {timeout: 5000})

                        return reject('Bật 2FA thất bại: Mật khẩu không chính xác')

                    } catch {}

                    await page.waitForTimeout(5000)

                } catch {}

            }

            try {

                await z.post("https://mbasic.facebook.com/security/2fac/setup/turn_off/async/?paipv=0&eav=AfZDqJ9TxI6anFfr5zaj8rHTWbscz8Ga3UwR3Z8BhtlWMQiVvikKtpuKx_egQ6IxINg", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+fb_dtsg+"&jazoest=25518",
                })

                const html = await z.get('https://mbasic.facebook.com/security/2fac/settings/?paipv=0')
                const $ = cheerio.load(html)

                const url = $('a[href^="https://mbasic.facebook.com/security/2fac/setup/qrcode/generate/"]').attr('href')

                const final = await z.getRedirect(url)

                if (final) {

                    const html = await z.get(final)
                    const $ = cheerio.load(html)

                    const link = $('a[href^="otpauth://totp"]').attr('href')

                    const url = new URL(link)
                    const search = url.searchParams

                    const twofa = search.get('secret')

                    const twofaCode = twofactor.generateToken(twofa)
                    const code = twofaCode.token

                    if (code) {

                        const redirect = await z.getRedirect("https://mbasic.facebook.com/security/2fac/setup/verify_code/?paipv=0&eav=Afaqw-oqE2lRwOTNAEv7aclmxyaNFoU-xy5bZv2-v7hNaxLOlq39C23eg-_X1uIOyQA", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "fb_dtsg="+fb_dtsg+"%3A21%3A1696577600&jazoest=25581&code="+code,
                            "method": "POST",
                        })

                        if (redirect.includes('?error_message')) {
                            const url = new URL(redirect)
                            const search = url.searchParams

                            const error = search.get('error_message')

                            reject(error)

                        } else {

                            const html = await z.get(redirect)
                            
                            if (html.includes('TwoFactButton')) {
                                resolve(twofa)
                            } else {
                                reject('Bật 2FA thất bại')
                            }

                        }
                    

                    } else {
                        reject('Bật 2FA thất bại')
                    }


                } else {
                    reject('Bật 2FA thất bại')
                }

            } catch (err) {
                
                const url = await z.getRedirect('https://mbasic.facebook.com/security/2fac/settings/?paipv=0')

                if (url.includes('password/reauth')) {
                    reject('Bật 2FA thất bại: Yêu cầu xác nhận')
                } else {
                    reject('Bật 2FA thất bại')
                }
            }
        })
    }

    bat2Fa(password) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const fb_dtsg = this.dtsg
            const lsd = this.lsd
            const uid = this.uid
            const z = new zFetch(page)

            if (password) {
                try {

                    await page.goto('https://www.facebook.com/security/2fac/setup/intro')

                    await page.waitForSelector('[name="pass"]', {timeout: 5000})
                    

                    await page.type('[name="pass"]', password)

                    await Promise.all([
                        page.keyboard.press('Enter'),
                        page.waitForNavigation({waitUntil: 'networkidle0'})
                    ])

                    try {

                        await page.waitForSelector('[name="pass"]', {timeout: 5000})

                        return reject('Bật 2FA thất bại: Mật khẩu không chính xác')

                    } catch {}

                    await page.waitForTimeout(5000)

                } catch {}
            }

            try {

                await z.post('https://www.facebook.com/security/2fac/setup/turn_off/async/?ext=1696820629&hash=AeQV2LjcEyCdPpL_X2w', {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__user="+uid+"&__a=1&__req=8&__hs=19636.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009077610&__s=157d7r%3A5czthe%3Am5ovqx&__hsi=7286675816215663116&__dyn=7AgNe-4agW5A9xSS5k2m3mbwyyaheC2-m2q3F6wAxu13wFw_x-ewSyoS68uxa0z8S2S2q1Ew9m4EG6Ehw8u5U4m0Ko4a1YCxS321ZgC11x-0CEsxe687C22i3DwEBU4-fz81bo4a4o5-1uwp84uqexp2Utx6ewi82Gwu8eE4a5Ey58d8-0KU6i1NwkEbEaUiwuU5W0F8G58G0hG4EtzUdEGdwzwe50bS1LwqobU5G360NE&__csr=&fb_dtsg="+fb_dtsg+"&jazoest=25381&lsd="+lsd+"&__spin_r=1009077610&__spin_b=trunk&__spin_t=1696561420",
                })

                await page.waitForTimeout(3000)

                const res = await z.post('https://www.facebook.com/security/2fac/setup/qrcode/generate/', {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__asyncDialog=2&__user="+uid+"&__a=1&__req=8&__hs=19636.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1009077610&__s=e7bxq8%3Afh9ehc%3A21ra0x&__hsi=7286680629335021009&__dyn=7AgNe-4amcxp2otJxl0BwRyU8EyAjFwLBwCwWhE98nwgUaofUvzEdECdxy7Eiw8OdwJwCwq82lxaaxG4o27xu15wbC12wv9EtwMwvk9wgovw9G78jxy1VwwAwVUa9u1fzUO0iS12x61vwnE6i17CzEmgK7ohzE4y0GE7y3G12xq8xi3ifwbK1Awso5a2W2K4E7K1uwaiaxiaw4qxa7o-3qazo8U3xg2ZwrU6C2-1qwNwcq&__csr=&fb_dtsg="+fb_dtsg+"&jazoest=25688&lsd="+lsd+"&__spin_r=1009077610&__spin_b=trunk&__spin_t=1696562540",
                })

                const data = JSON.parse(res.replace('for (;;);', ''))

                if (data.redirect) {

                    const res = await z.post("https://www.facebook.com"+data.redirect, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "__asyncDialog=1&__user="+uid+"&__a=1&__req=7&__hs=19636.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009079832&__s=fxk02g%3A5hoi7n%3Az7hkzx&__hsi=7286683305287901171&__dyn=7AgNe-4amcxp2otJxl0BwRyU8EyAjFwLBwCwWhE98nwgUaofUvzEdECdxy7Eiw8OdwJwCwq82lxaaxG4o27xu15wbC12wv9EtwMwvk9wgovw9G78jxy1VwwAwVUa9u1fzUO0iS12x61vwnE6i17CzEmgK7ohzE4y0GE7y3G12xq8xi3ifwbK1Awso5a2W2K4E7K1uwaiaxiaw4qxa7o-3qazo8U3xg2ZwrU6C2-1qwNwcq&__csr=&fb_dtsg="+fb_dtsg+"&jazoest=25250&lsd="+lsd+"&__spin_r=1009079832&__spin_b=trunk&__spin_t=1696563164",
                    })

                    const twofaMatch = res.match(/(?<=\"code\":\")[^\"]*/g)

                    if (twofaMatch[0] && twofaMatch[0].replaceAll(' ', '').length === 32) {

                        const twofa = twofaMatch[0].replaceAll(' ', '')
                        const twofaCode = twofactor.generateToken(twofa)
                        const code = twofaCode.token

                        const res = await z.post("https://www.facebook.com/security/2fac/setup/verify_code/", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "code="+code+"&dialog_loaded=true&__user="+uid+"&__a=1&__req=c&__hs=19636.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009079832&__s=9ktwu8%3Afytuns%3A4kouks&__hsi=7286685555808318822&__dyn=7AgNe-4amcxp2otJxl0BwRyU8EyAjFwLBwCwWhE98nwgUaofUvzEdECdxy7Eiw8OdwJwCwq82lxaaxG4o27xu15wbC12wv9EtwMwvk9wgovw9G78jxy1VwwAwVUa9u1fzUO0iS12x61vwnE6i17CzEmgK7ohzE4y0GE7y3G12xq8xi3ifwbK0RE5a2W2K4E7K1uwaiaxiaw4qxa7o-3qazo8U3xg2ZwrU6C2-1qwNwcq&__csr=&fb_dtsg="+fb_dtsg+"&jazoest=25625&lsd="+lsd+"&__spin_r=1009079832&__spin_b=trunk&__spin_t=1696563688",
                        })

                        const data = JSON.parse(res.replace('for (;;);', ''))

                        if (data.payload?.error_message) {
                            reject(data.payload.error_message)
                        } else {
                            if (data.redirect) {
                                resolve(twofa)
                            } else {
                                reject('Bật 2FA thất bại')
                            }
                        }

                    } else {
                        reject('Bật 2FA thất bại')
                    }
                
                } else if (data.errorSummary) {
                    reject('Bật 2FA thất bại: '+data.errorSummary)
                } else {
                    reject('Bật 2FA thất bại')
                }

            } catch (err) {
                reject('Bật 2FA thất bại')
            }

        })
    }

    clickXpath(xpath) {

        return new Promise(async (resolve, reject) => {
            const page = this.page

            await page.waitForTimeout(4000)

            await page.evaluate((xpath) => {
                document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click()
            }, xpath)

            resolve()
        })
    }

    changeCookie() {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            
            await page.goto('https://mbasic.facebook.com/recover/initiate/')




        })
    }

    changeHackedApi(resetPassword, newPassword, newEmail, newEmailPassword, message, updatePassword, updateEmail, removeEmail) {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const z = new zFetch(page)

            try {

                let changeEmail = true
                let error = false

                let html = await z.get('https://mbasic.facebook.com/hacked')
                let $ = cheerio.load(html)

                let url = $('form[action^="/hacked/triage/"]').attr('action')
                let dtsg = $('input[name="fb_dtsg"]').val()

                html = await z.post('https://mbasic.facebook.com'+url, {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+dtsg+"&jazoest=25515&reason=someone_accessed&confirmed=Ti%E1%BA%BFp+t%E1%BB%A5c",
                })

                $ = cheerio.load(html)

                url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                let nh = $('input[name="nh"]').val()

                html = await z.post("https://mbasic.facebook.com"+url, {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+dtsg+"&jazoest=25309&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=25309",
                })

                $ = cheerio.load(html)

                url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                nh = $('input[name="nh"]').val()

                html = await z.post("https://mbasic.facebook.com"+url, {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+dtsg+"&jazoest=25309&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=25309",
                })

                if (html.includes('name="password_new"') && !resetPassword) {

                    message('Đang đổi mật khẩu')

                    const $ = cheerio.load(html)

                    const url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                    const nh = $('input[name="nh"]').val()

                    html = await z.post("https://mbasic.facebook.com"+url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25530&password_new="+newPassword+"&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=25530",
                    })

                    if (!html.includes('name="password_new"')) {

                        message('Đổi mật khẩu thành công')

                        updatePassword()

                    } else {

                        message('Đổi mật khẩu thất bại')

                        error = true
                    }

                }

                if (html.includes('Có bất kỳ địa chỉ email nào ở đây bạn không nhận ra không?')) {

                    const $ = cheerio.load(html)
                    const url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                    const nh = $('input[name="nh"]').val()
                    const has_data = $('input[name="has_data"]').val()

                    const email = []

                    $('#m_check_list_aria_label input').each(function() {

                        email.push('selected[]='+$(this).val())

                    })

                    html = await z.post("https://mbasic.facebook.com"+url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25184&"+email.join('&')+"&has_data="+has_data+"&submit[Continue]=Tiếp+tục&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=25184",
                    })
                    
                } else {

                    message('Acc No Verify')
    
                    changeEmail = false
        
                }

                if (changeEmail) {

                    if (html.includes('submit[Add New Email]')) {

                        const $ = cheerio.load(html)
                        const url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                        const nh = $('input[name="nh"]').val()

                        html = await z.post("https://mbasic.facebook.com"+url, {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": 'fb_dtsg='+dtsg+'&jazoest=25269&submit[Add+New+Email]=Thêm+email+mới&nh='+nh+'&fb_dtsg='+dtsg+'&jazoest=25269',
                        })

                    }

                    if (html.includes('name="new_cp"')) {

                        message('Đang thêm email '+newEmail)

                        removeEmail()

                        const $ = cheerio.load(html)
                        const url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                        const nh = $('input[name="nh"]').val()

                        html = await z.post("https://mbasic.facebook.com"+url, {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": 'fb_dtsg='+dtsg+'&jazoest=25483&new_cp='+newEmail+'&submit[Add]=Thêm&nh='+nh+'&fb_dtsg='+dtsg+'&jazoest=25483',
                        })

                        if (!html.includes('name="new_cp"')) {

                            message('Thêm email thành công')

                        } else {

                            message('Thêm email thất bại')

                            error = true
                        }

                    }

                    if (html.includes('name="code"')) {

                        const $ = cheerio.load(html)
                        const url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                        const nh = $('input[name="nh"]').val()

                        message('Đang lấy mã kích hoạt')

                        await page.waitForTimeout(10000)

                        try {

                            const code = await getMailCode(newEmail, newEmailPassword)

                            message('Đang nhập mã kích hoạt')

                            html = await z.post("https://mbasic.facebook.com"+url, {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": 'fb_dtsg='+dtsg+'&jazoest=25170&code='+code.code+'&submit[Confirm]=Xác+nhận&nh='+nh+'&fb_dtsg='+dtsg+'&jazoest=25170',
                            })

                            if (!html.includes('name="code"')) {

                                message('Thêm email thành công')

                                updateEmail()

                            } else {

                                error = true
                                message('Thêm email thất bại')

                            }


                        } catch {

                            message('Lấy mã thất bại')

                            error = true
                        }

                    }

                    for (let index = 0; index < 999; index++) {
                        const $ = cheerio.load(html)

                        if ($('#m_check_list_aria_label input').length > 0) {
                        
                            const url = $('form[action^="/checkpoint/flow/?checkpoint_created"]').attr('action')
                            const nh = $('input[name="nh"]').val()
                            const has_data = $('input[name="has_data"]').val()

                            let email = []

                            $('#m_check_list_aria_label input').each(function() {

                                if ($(this).is(':checked')) {
                                    email.push('selected[]='+$(this).val())
                                }
        
                            })

                            if (email.length > 0) {
                                email = email.join('&')
                            } else {
                                email = 'selected[]='
                            }
        
                            html = await z.post("https://mbasic.facebook.com"+url, {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "fb_dtsg="+dtsg+"&jazoest=25184&"+email+"&has_data="+has_data+"&submit[Continue]=Tiếp+tục&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=25184",
                            })

                        } else {
                            break
                        }
                        
                    }

                    if (error) {
                        reject()
                    } else {
                        resolve()
                    }

                }
                


            } catch (err) {
                console.log(err)
                reject()
            }

        })

    }

    changeHackedBasic(resetPassword, newPassword, newEmail, newEmailPassword, message, updatePassword, updateEmail, removeEmail) {

        return new Promise(async (resolve, reject) => {

            const page = this.page

            let error = false
            let changeEmail = true

            await page.goto('https://mbasic.facebook.com/hacked', {
                waitUntil: 'networkidle0'
            })

            try {

                await page.waitForSelector('input[value="someone_accessed"]')

                await page.waitForTimeout(5000)

                await page.evaluate(() => {
                    document.querySelector('input[value="someone_accessed"]').checked = true
                })

                await page.waitForTimeout(5000)

                await page.click('[name="confirmed"]')

                await page.waitForTimeout(5000)

                await page.click('#checkpointButtonContinue-actual-button')

                await page.waitForSelector('#checkpointSubmitButton-actual-button', {
                    timeout: 5000
                })

                await page.click('#checkpointSubmitButton-actual-button')

            } catch (err) {
                error = true
            }

            if (!resetPassword) {

                if (!error) {

                    try {

                        await page.waitForSelector('input[name="password_new"]', {
                            timeout: 15000
                        })

                        await page.evaluate(() => {
                            document.querySelector('input[name="password_new"]').value = ''
                        })

                        await page.waitForTimeout(2000)

                        message('Đang đổi mật khẩu')

                        const passwordNew = await page.$('input[name="password_new"]') || false
                        const passwordOld = await page.$('input[name="password_old"]') || false
                        const passwordConfirm = await page.$('input[name="password_confirm"]') || false

                        if (passwordNew && !passwordOld && !passwordConfirm) {
                            await page.type('input[name="password_new"]', newPassword)
                        }

                        if (passwordNew && passwordOld && passwordConfirm) {
                            await page.type('input[name="password_new"]', newPassword)
                            await page.type('input[name="password_old"]', this.password)
                            await page.type('input[name="password_confirm"]', newPassword)
                        }

                        await page.waitForTimeout(5000)

                        await page.click('#checkpointSubmitButton-actual-button')

                        try {

                            await page.waitForSelector('input[name="password_new"]', {
                                timeout: 5000
                            })

                            message('Đổi mật khẩu thất bại')

                        } catch {

                            message('Đổi mật khẩu thành công')

                            updatePassword()
                        }

                    } catch {
                        error = true
                    }

                }

            }

            try {

                await page.waitForSelector('input[aria-labelledby="m_check_list_aria_label"]:not([value*="delete"]), input[value*="@"]', {
                    timeout: 15000
                })

            } catch {

                message('Acc No Verify')

                changeEmail = false

            }

            if (changeEmail) {


                await page.waitForTimeout(5000)

                await page.$$eval('input[aria-labelledby="m_check_list_aria_label"], input[value*="@"]', checks => checks.forEach(c => c.checked = true))

                await page.waitForTimeout(2000)

                await page.click('#checkpointButtonContinue-actual-button')

                try {

                    await page.waitForSelector('[value="Thêm email mới"]', {
                        timeout: 5000
                    })

                    await page.click('[value="Thêm email mới"]')

                } catch {}

                try {

                    message('Đang thêm email '+newEmail)

                    removeEmail()

                    await page.waitForSelector('input[name="new_cp"]')

                    await page.type('input[name="new_cp"]', newEmail)

                    await page.waitForTimeout(5000)

                    await page.click('#checkpointSubmitButton-actual-button')

                    try {

                        await page.waitForSelector('input[name="new_cp"]', {
                            timeout: 5000
                        })

                        message('Thêm email thất bại')

                        error = true
                        
                    } catch {

                        try {

                            await page.waitForSelector('input[name="code"]')

                            message('Đang lấy mã kích hoạt')

                            await page.waitForTimeout(10000)

                            try {

                                const code = await getMailCode(newEmail, newEmailPassword)

                                message('Đang nhập mã kích hoạt')

                                const activeCode = code.code

                                await page.type('input[name="code"]', activeCode)

                                await page.waitForTimeout(5000)

                                await Promise.all([
                                    page.click('#checkpointSubmitButton-actual-button'),
                                    page.waitForNavigation({waitUntil: 'networkidle0'})
                                ])

                                try {

                                    await page.waitForTimeout(5000)

                                    message('Đang kiểm tra mã kích hoạt')

                                    await page.waitForSelector('input[name="code"]', {
                                        timeout: 5000
                                    })

                                    message('Nhập mã không thành công')

                                    error = true

                                } catch {

                                    message('Thêm email thành công')

                                    updateEmail()
                                }

                            
                            } catch (err) {

                                console.log(err)

                                message('Lấy mã thất bại')
                                error = true

                            }

                        } catch (err) {
                            console.log(err)
                            error = true
                        }
                    }

                } catch (err) {

                    console.log(err)

                    message('Thêm email thất bại')
                    error = true
                }
                
            }

            if (!error) {

                for (let index = 0; index < 999; index++) {

                    try {

                        await page.waitForSelector('#checkpointButtonContinue-actual-button, #checkpointSubmitButton-actual-button', {
                            timeout: 5000
                        })

                        await page.click('#checkpointButtonContinue-actual-button, #checkpointSubmitButton-actual-button')

                    } catch {
                        break
                    }
                
                }
            }

            if (error) {
                reject()
            } else {
                resolve()
            }

        })
    }

    deactiveAccount() {
        return new Promise(async (resolve, reject) => {
            const page = this.page

            try {
                await page.goto('https://mbasic.facebook.com/help/delete_account/', {
                    waitUntil: 'networkidle0'
                })

                await page.waitForSelector('#continue_deactivate_or_delete_button')

                await Promise.all([
                    page.click('#continue_deactivate_or_delete_button'),
                    page.waitForNavigation({
                        waitUntil: 'networkidle0',
                        timeout: 60000
                    })
                ])

                await page.waitForSelector('[value="TEMPORARY"]')

                await page.click('[value="TEMPORARY"]')

                await Promise.all([
                    page.click('#submit'),
                    page.waitForNavigation({
                        waitUntil: 'networkidle0',
                        timeout: 60000
                    })
                ])

                await page.waitForSelector('#auto_reactivate_delay')

                await page.evaluate(() => {
                    document.querySelector('#auto_reactivate_delay option[value="0"]').selected = true
                })

                await Promise.all([
                    page.click('#submit'),
                    page.waitForNavigation({
                        waitUntil: 'networkidle0',
                        timeout: 60000
                    })
                ])

                await Promise.all([
                    page.click('#submit'),
                    page.waitForNavigation({
                        waitUntil: 'networkidle0',
                        timeout: 60000
                    })
                ])

                resolve()

            } catch (err) {
                reject(err)
            }
        })
    }

}

class Account {

    constructor (page, uid, twofa, dtsg, accessToken, lsd) {
        this.page = page
        this.uid = uid
        this.dtsg = dtsg
        this.lsd = lsd
        this.accessToken = accessToken
        this.twofa = twofa
    }

    checkDating () {
        return new Promise(async (resolve, reject) => {

            const page = this.page

            try {

                const html = await page.evaluate(async () => {

                    const res = await fetch('https://www.facebook.com/dating/get-started')

                    return await res.text()

                })

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

    getUserData() {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.uid
            const dtsg = this.dtsg
            const twofa = this.twofa

            try {

                const accessToken = await getAccessToken3(page, uid, dtsg, twofa)

                const res = await page.evaluate(async (accessToken) => {
            
                    const res = await fetch('https://graph.facebook.com/me?access_token='+accessToken)
        
                    return await res.json()
        
                }, accessToken)

                res.accessToken = accessToken

                resolve(res)

            } catch (err) {
                reject(err)
            }

        })
    }

    checkSupport() {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const z = new zFetch(page)

            let status = 'ERROR'

            try {

                const url = await z.getRedirect('https://www.facebook.com/business/help/support')

                if (url === 'https://www.facebook.com/business/help/support') {
                    status = 'YES'
                } else {
                    status = 'NO'
                }

            } catch {}

            resolve(status)

        })
    }

    getFriends() {
        return new Promise(async (resolve, reject) => {

            const page = this.page

            try {

                const fbData = await getAccessToken2(page)
                const accessToken = fbData.accessToken

                const res = await page.evaluate(async (accessToken) => {
            
                    const res = await fetch('https://graph.facebook.com/v14.0/me?fields=friends&access_token='+accessToken)
        
                    return await res.json()
        
                }, accessToken)

                resolve(res.friends.summary.total_count)

            } catch (err) {

                reject(err)
            }

        })
    }

    // getBirthday () {

    //     return new Promise(async (resolve, reject) => {

    //         const page = this.page

    //         try {
    
    //             const html = await page.evaluate(async () => {
        
    //                 const res = await fetch('https://mbasic.facebook.com/editprofile.php?type=basic&edit=birthday')
        
    //                 return await res.text()
        
    //             })
                
    //             const $ = cheerio.load(html)

    //             const day = $('#day').find(':selected').val()
    //             const month = $('#month').find(':selected').val()
    //             const year = $('#year').find(':selected').val()

    //             resolve(day+'/'+month+'/'+year)

    //         } catch {
    //             reject()
    //         }
            
    
    //     })
    // }

    getBm() {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const accessToken = this.accessToken
            const z = new zFetch(page)

            try {
            
                const data = await z.get("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,adtrust_dsl,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1)&limit=9999999&access_token="+accessToken)
        
                if (data.data) {
                    resolve(data.data)
                } else {
                    reject()
                }

            } catch {
                reject()
            }
    
        })
    }

    getBmStatus() {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.uid
            const dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                const res = await z.post('https://business.facebook.com/api/graphql/', {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    body: "fb_dtsg="+dtsg+"&variables={}&doc_id=4941582179260904"
                })

                const data = JSON.parse(res)

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

                    if (item.advertising_restriction_info.status === 'APPEAL_PENDING') {
                        status = 'DIE_DK'
                        text = 'Die đang kháng'
                    }

                    if (item.advertising_restriction_info.status === 'APPEAL_ACCEPTED' && !item.advertising_restriction_info.is_restricted) {
                        status = 'BM_KHANG'
                        text = 'BM kháng'
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
        
                                    const res = await z.post("https://business.facebook.com/api/graphql/?_flowletID=1", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": "av="+uid+"&__usid=6-Ts626y2arz8fg%3APs626xy1mafk6f%3A0-As626x5t9hdw-RV%3D6%3AF%3D&session_id=3f06e26e24310de8&__user="+uid+"&__a=1&__req=1&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574318&__s=bgx31o%3A93y1un%3Aj1i0y0&__hsi=7315329750708113449&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o2oCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK3eUbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lx3wlF8C221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg="+dtsg+"&jazoest=25595&lsd=XBGCglH3K63SPddlSyNKgf&__aaid=0&__bid=745415083846542&__spin_r=1010574318&__spin_b=trunk&__spin_t=1703232934&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22"+bmData[index].id+"%22%7D&server_timestamps=true&doc_id=24196151083363204",
                                    })

                                    const data = JSON.parse(res)
        
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

    checkBm(id) {

        return new Promise(async (resolve, reject) => {
    
            const page = this.page 
            const dtsg =  this.dtsg
            const lsd = this.lsd 
            const uid = this.uid
            const z = new zFetch(page)

            try {
            
                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "x-asbd-id": "129477",
                        "x-fb-lsd": lsd
                    },
                    body: "av="+uid+"&session_id=1c45e38f5c44ffcc&__user="+uid+"&__a=1&__req=1&__hs=19616.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1008682084&__s=wvfpmj%3Artnpg9%3Afqm6js&__hsi=7279396576133048892&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgolUScwuEnw8ScwgECu7E422a3Fe6rwiolDwFwBgaohzE8U98doK78-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lx3wlF8aE4KeCK2q1pwjouxK2i2y1sDw&__csr=&fb_dtsg="+dtsg+"&jazoest=25374&lsd="+lsd+"&__aaid=0&__bid=126950020055158&__spin_r=1008682084&__spin_b=trunk&__spin_t=1694866589&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6733190926704197",
                })

                const data = JSON.parse(res)

                const appeal_ineligibility_reason = data.data.assetOwnerData?.advertising_restriction_info?.additional_parameters?.appeal_ineligibility_reason
                const status = data.data.assetOwnerData?.advertising_restriction_info?.status
                const appeal_friction = data.data.assetOwnerData?.advertising_restriction_info?.additional_parameters?.appeal_friction

                if (status === 'VANILLA_RESTRICTED' && appeal_ineligibility_reason === 'ELIGIBLE' && appeal_friction === 'UFAC') {
                    resolve()
                } else {
                    reject()
                }

            } catch (err) {
                reject(err)
            }
    
        })
    }

    checkHold(id) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const dtsg =  this.dtsg
            const uid = this.uid
            const z = new zFetch(page)

            const data = {
                status: false,
                country: ''
            }

            try {

                const res = await z.post("https://business.facebook.com/api/graphql/?_flowletID=1", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__usid=6-Ts51f1w1gfkvpj%3APs51f2gvheire%3A0-As51f1wdhal3d-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=8&__hs=19693.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010170946&__s=ew2ohe%3Afdtegc%3A7il5yk&__hsi=7307960693527437806&__dyn=7xe6Eiw_K5U5ObwyyVp6Eb9o6C2i5VGxK7oG484S7UW3qiidBxa7GzU721nzUmxe1Bw8W4Uqx619g5i2i221qwa62qq1eCBBwLghUbpqG6kE8Ro4uUfo7y78qggwExm3G4UhwXwEwlU-0DU2qwgEhxW10wv86eu1fgaohzE8U6q78-3K5E7VxK48W2a4p8y26UcXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYwGxe1uwciawaG13xC4oiyVV98OEdEGdwzweau0Jomwm8gU5qi2G1bzEG2q362u1IxK321VDx27o72&__csr=&fb_dtsg="+dtsg+"&jazoest=25595&lsd=_WnEZ0cRpYEKpFXHPcY7Lg&__aaid="+id+"&__spin_r=1010170946&__spin_b=trunk&__spin_t=1701517192&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingHubPaymentSettingsViewQuery&variables=%7B%22assetID%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6747949808592904",
                })

                const countryMatch = res.match(/(?<=\"predicated_business_country_code\":\")[^\"]*/g)

                if (countryMatch[0]) {
                    data.country = countryMatch[0]
                }

                if (res.includes('RETRY_FUNDS_HOLD'))  {
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

    getCard(id) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const dtsg =  this.dtsg
            const uid = this.uid
            const z = new zFetch(page)

            try {

                const res = await z.post("https://business.facebook.com/api/graphql/?_flowletID=1", {
                    "headers": {
                      "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": 'variables={"paymentAccountID":"'+id+'"}&doc_id=5746473718752934&__usid=6-Ts5btmh131oopb:Ps5bu98bb7oey:0-As5btmhrwegfg-RV=6:F=&__user='+uid+'&__a=1&__req=s&__hs=19699.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010282616&__s=flj1ty:75294s:o83s9c&__hsi=7310049091311550655&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwvC6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&__csr=&fb_dtsg='+dtsg+'&jazoest=25610&lsd=HExoeF2styyeq_LWWUo9db&__aaid='+id+'&__spin_r=1010282616&__spin_b=trunk&__spin_t=1702003435&__jssesw=1',
                })

                const data = JSON.parse(res)

                const cards = data.data.billable_account_by_payment_account.billing_payment_account.billing_payment_methods

                resolve(cards)

            } catch (err) {
                reject(err)
            }


        })
    }

    check273(id) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const dtsg =  this.dtsg
            const uid = this.uid
            const z = new zFetch(page)

            let status = false

            try {

                const res = await z.post("https://www.facebook.com/api/graphql/?", {
                    "headers": {
                      "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__usid=6-Ts3dqwl1d2saj%3APs3dqww19j66f0%3A0-As3dqvm1uufhhw-RV%3D6%3AF%3D&session_id=24d1640f6048cdc4&__user="+uid+"&__a=1&__req=1&__hs=19661.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009583025&__s=8w5mcb%3A2tg64k%3Apshhn3&__hsi=7296003472047894728&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o461mCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyUszUiwExq1yxJUpx2aK2a4p8y26UcXwKwjovCxeq4qxS1cwjUd8-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U4y0CpU2RwhoaogU5qi9wwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25766&lsd=bR5OxrMb_uxUX_8bKV64xQ&__aaid=635974613136523&__spin_r=1009583025&__spin_b=trunk&__spin_t=1698733183&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewQuery&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=7271073246287557",
                })

                const data = JSON.parse(res)

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

    getMainBmAccounts(id) {
        return new Promise(async (resolve, reject) => {
    
            const page = this.page 
            const z = new zFetch(page)

            try {

                const html = await z.get('https://business.facebook.com/settings/info?business_id='+id)

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

    removeAccount(bm, id) {

        const page = this.page 
        const accessToken = this.accessToken
        const z = new zFetch(page)

        return new Promise(async (resolve, reject) => {
            try {

                const res = await z.post("https://z-p3-graph.facebook.com/v17.0/"+id+"?access_token="+accessToken+"&__cppo=1", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness_user&_reqSrc=UserServerActions.brands&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&xref=f26a693ca5515cc",
                })

                if (res.success) {
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

    getBmId() {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const accessToken =  this.accessToken
            const z = new zFetch(page)

            try {

                const res = await z.get("https://graph.facebook.com/v14.0/me/businesses?fields=id&limit=9999999&access_token="+accessToken)
        
                resolve(res.data[0].id)
                    
            } catch (err) {
                reject(err)
            }

        })
    }

    applyPage(id) {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            const uid = this.uid
            const accessToken = this.accessToken
            const z = new zFetch(page)

            try {
                
                const bmId = await this.getBmId()
                
                const res = await z.post("https://graph.facebook.com/v17.0/"+bmId+"?access_token="+accessToken, {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F"+bmId+"&_reqSrc=adsDaoGraphDataMutator&endpoint=%2F"+bmId+"&entry_point=business_manager_settings_ad_accounts&locale=vi_VN&method=post&pretty=0&primary_page="+id+"&suppress_http_code=1&version=17.0&xref=fe82499b740a5c",
                })

                if (res.id) {
                    resolve()
                } else {
                    reject()
                }

            } catch (err) {
                reject(err)
            }
        })
    }

    createPage(name) {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            const uid = this.uid
            const dtsg = this.dtsg
            const z = new zFetch(page)

            const pageName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            try {

                const bmId = await this.getBmId()

                const res = await z.post("https://business.facebook.com/ajax/ads/create/page/create", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "jazoest=25515&fb_dtsg="+dtsg+"&page_name="+encodeURIComponent(pageName)+"&category=2612&parent_category=2612&has_no_profile_pic=1&business_id="+bmId+"&__user="+uid+"&__a=1&__req=k&__hs=19668.BP%3Abrands_pkg.2.0..0.0&dpr=1.5&__ccg=GOOD&__rev=1009742842&__s=nyc2d0%3Af69gum%3Aq1dva0&__hsi=7298836689871505933&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCwRCwqojyUV0RAAzpoixW4E5S2WdwJwCwq8gwqoqyoyazoO4o2vwOxa7FEd89EmwoU9FE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G5udz87G0FoO12ypUuwg88EeAUpK1vDwFwBgak48W18wRwEwiUmwoErorx2aK2a4p8y26U8U-UvzE4S7VEjCx6221cwjUd8-dwKwHxa1ozFUK1gzpA6EfEO32fxiFVoa9obGwgUy1kx6bCyVUCfwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&lsd=ch-H_YWFOB8VNvxG12Hpdh&__aaid=0&__bid="+bmId+"&__spin_r=1009742842&__spin_b=trunk&__spin_t=1699392843&__jssesw=1",
                })

                if (res.includes('{"page":{"id":"')) {
                    const data = JSON.parse(res.replace('for (;;);', ''))

                    resolve(data.payload.page.id)

                } else {
                    reject()
                }

            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    renameBm(id, name) {
        return new Promise(async (resolve, reject) => {
    
            const page = this.page 
            const uid = this.uid
            const accessToken =  this.accessToken
            const z = new zFetch(page)

            const bmName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            try {

                const res = await z.post("https://z-p3-graph.facebook.com/v17.0/"+id+"?access_token="+accessToken+"&__cppo=1", {
                    "headers": {
                      "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F"+id+"&_reqSrc=adsDaoGraphDataMutator&endpoint=%2F"+id+"&entry_point=business_manager_business_info&locale=vi_VN&method=post&name="+encodeURIComponent(bmName)+"&pretty=0&suppress_http_code=1&version=17.0&xref=f325d6c85530f9c",
                })

                if (res.id) {
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

    backupBm(id, email, number, role, delay) {
        
        return new Promise(async (resolve, reject) => {
            
            const page = this.page 
            const accessToken =  this.accessToken
            const dtsg =  this.dtsg
            const z = new zFetch(page)

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

                        await z.post("https://z-p3-graph.facebook.com/v3.0/"+id+"/business_users?access_token="+accessToken+"&__cppo=1", {
                            "headers": {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            "body": '__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&brandId='+id+'&email='+encodeURIComponent(mail)+'&method=post&pretty=0&roles='+roleList+'&suppress_http_code=1',
                        })

                    } catch {}

                    await page.waitForTimeout(delay * 100)
                    
                }

                resolve()

            } catch (err) {

                reject()

            }

        })
    }

    createBm(type, name) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page 
            const uid =  this.uid
            const dtsg =  this.dtsg
            const z = new zFetch(page)

            const bmName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            let createBmSuccess = false

            try {

                if (type === '350') {

                    const res = await z.post("https://business.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "av="+uid+"&__usid=6-Trf0mkxer7rg4%3APrf0mkv1xg9ie7%3A0-Arf0mkxurlzsp-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__dyn=7xeUmwkHgmwn8K2WnFwn84a2i5U4e1Fx-ewSyo9Euxa0z8S2S7o760Boe8hwem0nCq1ewcG0KEswaq1xwEwlU-0nSUS1vwnEfU7e2l0Fwwwi85W1ywnEfogwh85qfK6E28xe3C16wlo5a2W2K1HwywnEhwxwuUvwbW1fxW4UpwSyES0gq5o2DwiU8UdUco&__csr=&__req=s&__hs=19187.BP%3Abizweb_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1005843971&__s=xpxflz%3A1mkqgj%3Avof03o&__hsi=7120240829090214250&__comet_req=0&fb_dtsg="+dtsg+"&jazoest=25414&lsd=8VpPvx4KH5-Ydq-I0JMQcK&__spin_r=1005843971&__spin_b=trunk&__spin_t=mftool&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBEGeoBMCreation_CreateBusinessMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%226%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22business_name%22%3A%22"+encodeURIComponent(bmName)+"%22%7D%7D&server_timestamps=true&doc_id=5232196050177866"
                    })

                    if (res.includes('{"data":{"fbe_create_business":{"id":"')) {
                        createBmSuccess = true
                    }
                }

                if (type === '50') {
                    
                    const res = await z.post("https://business.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'fb_dtsg='+dtsg+'&variables={"input":{"client_mutation_id":"4","actor_id":"'+uid+'","business_name":"'+encodeURIComponent(bmName)+'","user_first_name":"Tool","user_last_name":"FB%20'+randomNumberRange(111111, 99999)+'","user_email":"toolfb'+randomNumberRange(111111, 99999)+'@gmail.com","creation_source":"MBS_BUSINESS_CREATION_PROMINENT_HOME_CARD"}}&server_timestamps=true&doc_id=7183377418404152'
                    })

                    if (res.includes('{"data":{"bizkit_create_business":{"id":"')) {
                        createBmSuccess = true
                    }

                }

                if (type === 'over') {
                    
                    const res = await z.post("https://business.facebook.com/business/create_account/?brand_name="+encodeURIComponent(bmName)+"&first_name=Tool&last_name=FB%20"+randomNumberRange(111111, 99999)+"&email=toolfb"+randomNumberRange(111111, 99999)+"@gmail.com&timezone_id=132&business_category=OTHER", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "__user="+uid+"&__a=1&__dyn=7xeUmwkHg7ebwKBWo5O12wAxu13wqovzEdEc8uw9-dwJwCw4sxG4o2vwho1upE4W0OE2WxO0FE662y0umUS1vwnE2Pwk8884y1uwc63S482rwKxe0y83mwkE5G0zE5W0HUvw5rwSyES0gq0Lo6-1FwbO&__csr=&__req=1b&__hs=19300.BP:brands_pkg.2.0.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1006542795&__s=fx337t:hidf4p:qkhu11&__hsi=7162041770829218151&__comet_req=0&fb_dtsg="+dtsg+"&jazoest=25796&lsd=7qUeMnkz4xy0phFCtNnkTI&__aaid=523818549297438&__spin_r=1006542795&__spin_b=trunk&__spin_t=1667542795&__jssesw=1"
                    })

                    if (res.includes('"payload":"https:')) {
                        createBmSuccess = true
                    }

                }

                if (type === 'xmdt') {
                    
                    const res = await z.post("https://business.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'av='+uid+'&__usid=6-Trf0mkxer7rg4:Prf0mkv1xg9ie7:0-Arf0mkxurlzsp-RV=6:F=&__user='+uid+'&__a=1&__dyn=7xeUmwkHgmwn8K2WnFwn84a2i5U4e1Fx-ewSyo9Euxa0z8S2S7o760Boe8hwem0nCq1ewcG0KEswaq1xwEwlU-0nSUS1vwnEfU7e2l0Fwwwi85W1ywnEfogwh85qfK6E28xe3C16wlo5a2W2K1HwywnEhwxwuUvwbW1fxW4UpwSyES0gq5o2DwiU8UdUco&__csr=&__req=s&__hs=19187.BP:bizweb_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1005843971&__s=xpxflz:1mkqgj:vof03o&__hsi=7120240829090214250&__comet_req=0&fb_dtsg='+dtsg+'&jazoest=25414&lsd=8VpPvx4KH5-Ydq-I0JMQcK&__spin_r=1005843971&__spin_b=trunk&__spin_t=toolfb&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBEGeoBMCreation_CreateBusinessMutation&variables={"input":{"client_mutation_id":"6","actor_id":"'+uid+'","business_name":"'+encodeURIComponent(bmName)+'"}}&server_timestamps=true&doc_id=5232196050177866'
                    })

                    if (res.includes('{"data":{"fbe_create_business":{"id":"')) {
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

    createAdAccount(id, currency, timezone, name) {
        return new Promise(async (resolve, reject) => {
    
            const page = this.page 
            const dtsg = this.dtsg 
            const uid = this.uid
            const accessToken =  this.accessToken
            const z = new zFetch(page)

            const adName = capitalizeFLetter(name+' '+randomNumberRange(11111, 99999))

            try {

                const main = await this.getMainBmAccounts(id)

                const res = await z.post("https://z-p3-graph.facebook.com/v17.0/"+id+"/adaccount?access_token="+accessToken+"&__cppo=1", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abrand%2Fadaccount&_reqSrc=AdAccountActions.brands&ad_account_created_from_bm_flag=true&currency="+currency+"&end_advertiser="+id+"&invoicing_emails=%5B%5D&locale=vi_VN&media_agency=UNFOUND&method=post&name="+encodeURIComponent(adName)+"&partner=UNFOUND&po_number=&pretty=0&suppress_http_code=1&timezone_id="+timezone+"&xref=f240a980fd9969",
                });

                if (res.account_id) {

                    try {

                        await z.post("https://business.facebook.com/business/business_objects/update/permissions/", {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
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

    getBmAccounts(id) {
        return new Promise(async (resolve, reject) => {
    
            const page = this.page 
            const accessToken =  this.accessToken
            const z = new zFetch(page)

            try {

                const res = await z.get('https://z-p3-graph.facebook.com/v17.0/'+id+'/business_users?access_token='+accessToken+'&__cppo=1&_reqName=object:business/business_users&_reqSrc=BusinessConnectedConfirmedUsersStore.brands&date_format=U&fields=[]&limit=999&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f3d585b3bfdd8ac')

                resolve(res.data)

            } catch {

                reject()

            }

        })
    }

    getBmLimit(id) {
    
        return new Promise(async (resolve, reject) => {
    
            const page = this.page 
            const fb_dtsg =  this.dtsg
            const lsd =  this.lsd
            const uid = this.uid

            try {
            
                const bmData = await page.evaluate(async (fb_dtsg, lsd, id, uid) => {

                    const bmFetch = await fetch("https://business.facebook.com/business/adaccount/limits/?business_id="+id, {
                        headers: {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        body: "__user="+uid+"&__a=1&__req=o&__hs=19540.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007781368&__s=qz2hlv%3Ay60rbc%3Ar5xvs9&__hsi=7251060620459517467&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o461twOxa7FEd89EmwoU9FE4WqbwLjzocJ5wglDwRyXxK261UxO4UkK2y5oeE9oeUa8fGxnzoO1Wxu0zoO12ypUuwg88EeAUpK1vDwyCwBgak48W18wRwEwiUmwnHxJxK48GU8EhAy88rwzzXx-ewjoiz9EjCx6221cwjV8bU-dwKwHxa1oxqbwk8Sp1G3WcyU98-5aDBwEBwKG3qcy85i4oKqbDyo-2-qaUK2e0UFU6K19wrU6CiU9E4KeCK2q1pwjouwg825w&__csr=&fb_dtsg="+fb_dtsg+"&jazoest=25326&lsd=JyUQ2yg8yXD0xQDkPPa1v8&__bid="+id+"&__spin_r=1007781368&__spin_b=trunk&__spin_t=1688269111&__jssesw=1",
                        method: "POST",
                    })

                    return await bmFetch.text()
                }, fb_dtsg, lsd, id, uid)
        
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

    outBm(id, token) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const uid = this.uid
            const z = new zFetch(page)

            try {

                const res = await z.post("https://graph.facebook.com/v17.0/"+uid+"/businesses?access_token="+token+"&__cppo=1", {
                    "headers": {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F"+uid+"%2Fbusinesses&_reqSrc=adsDaoGraphDataMutator&business="+id+"&endpoint=%2F"+uid+"%2Fbusinesses&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&userID="+uid+"&version=17.0&xref=f2e80f8533bb1f4",
                })

                if (res.success) {
                    resolve()
                } else {
                    reject()
                }

            } catch {
                reject()
            }
        })
    }

    checkPage(id) {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            const uid = this.uid
            const dtsg = this.dtsg
            const z = new zFetch(page)

            let status = 'ERROR'

            
            try {

                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__user="+uid+"&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lwqp8aE4KeCK2q362u1dxW10w8mu&__csr=&fb_dtsg="+dtsg+"&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6228297077225495",
                })

                const data = JSON.parse(res)

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
            const page = this.page
            const accessToken = this.accessToken
            const uid = this.uid
            const z = new zFetch(page)

            try {

                const res = await z.get('https://graph.facebook.com/'+uid+'/accounts?access_token='+accessToken)

                const pages = res.data.filter(item => item.perms.includes('ADMINISTER'))

                for (let index = 0; index < pages.length; index++) {

                    try {
                    
                        const token = pages[index].access_token
                        const id = pages[index].id
                        const status = await this.checkPage(id)

                        if (status === 'Live') {

                            const res = await z.get('https://graph.facebook.com/v14.0/'+id+'/conversations?limit='+number+'&access_token='+token)

                            pages[index].count = res.data.length

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

    getAdAccounts () {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const accessToken = this.accessToken
            const uid = this.uid

            try {
    
                const accounts = await page.evaluate(async (accessToken, uid) => {
        
                    const accountsFetch = await fetch("https://graph.facebook.com/v14.0/me/adaccounts?limit=9999999999&fields=name,account_id,account_status,is_prepay_account,owner_business,created_time,next_bill_date,currency,adtrust_dsl,business_country_code,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},balance,owner,users{id,is_active,name,permissions,role,roles},insights.date_preset(maximum){spend},userpermissions.user("+uid+"){role}&access_token="+accessToken+"&summary=1&locale=en_US")
                    return await accountsFetch.json()
        
                }, accessToken, uid)


                if (accounts.data) {

                    resolve(accounts.data.map(item => {

                        return {
                            name: item.name,
                            status: item.account_status,
                            id: item.account_id,
                            balance: item.balance,
                            threshold: item.adspaymentcycle ? item.adspaymentcycle.data[0].threshold_amount : '',
                            spend: item.insights ? item.insights.data[0].spend : '0',
                            createdTime: item.created_time,
                            nextBillDate: item.next_bill_date,
                            timezoneName: item.timezone_name,
                            limit: item.adtrust_dsl,
                            role: item.userpermissions?.data[0]?.role || 'UNKNOWN',
                            currency: item.currency,
                            disableReason: item.disable_reason,
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


    getMainAdAccount () {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.uid
            const dtsg = this.dtsg

            try {
    
                const mainAdAccount = await page.evaluate(async (uid, dtsg) => {
        
                    const data = "__usid=6-Trkmfmjt08e28%3APrkmfmhj7dv0z%3A0-Arkmfmjfurewq-RV%3D6%3AF%3D&__user="+
                    uid
                    +"&__a=1&__dyn=7xeUmxa3-Q8zo5ObwyyVuCFohK49o9E4a2imeGqErG6EHoO366UvzEdF98SmcBxWE-1MxKdwJzUKaBzogwCxO482ey8G6EhwGxV0FwGxa4o88W1bg9po4q2S2qq1eCBBK2J17wJRiG6lg8Ro4uU9onwu8sxF12m2afBzob8jx63KdxG1nULz89U-1qxm1Tz8twAKdxW32fwnoO4oeoapUC7U9k2CcAzE8U984678-3K5E5W7S6UgzE8EhAy88rwzzUWfxe1dwWxyE4mewpp8fUS2W2K4E98jK2m685Wu0FUkyFoqwZCx23e68K2u48hxabDyoNodEGdzUjwnUfU4au0HVo4K2e4e1mAwABwiUpwCwNw&__csr=&__req=g&__hs=19296.BP%3Aads_manager_pkg.2.0.0.0.0&dpr=1&__ccg=UNKNOWN&__rev=1006496828&__s=rm6xvl%3Az2lrzx%3Aetvf24&__hsi=7160680085992619893&__comet_req=0&fb_dtsg="+
                    dtsg
                    +"&jazoest=25287&lsd=7E8ffN4ir_Ib4NqMi6HERh&__spin_r=1006496828&__spin_b=trunk&__spin_t=1667225753&__jssesw=1"
        
                    const res = await fetch('https://www.facebook.com/business/navigation/?global_scope_id='+uid+data, {
                        method: 'POST',
                        headers: {
                            'x-fb-lsd': '7E8ffN4ir_Ib4NqMi6HERh'
                        }
                    })
        
                    const html = await res.text()

                    const match = html.match(/act=([^&]+)/)
        
                    if (match) {
                        return match[1]
                    } else {
                        return false
                    }
                    
                }, uid, dtsg)
        
                if (mainAdAccount) {
                    resolve(mainAdAccount)
                } else {
                    reject()
                }

            } catch  {
                reject()
            }
    
        })
    }
    
    getAccountInfo (id) {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const accessToken = this.accessToken

            try {
    
                const accountData = await page.evaluate(async (accessToken, id) => {
        
                    const accountFetch = await fetch('https://graph.facebook.com/v14.0/act_'+id+'?access_token='+accessToken+'&fields=["business_city","business_country_code","business_name","business_state","business_street","business_street2","business_zip","currency","id","is_personal","name","owner","tax_id","timezone_id","timezone_name","users{id,is_active,name,role,roles}"]')
                    return await accountFetch.json()
        
                }, accessToken, id)
        
                if (accountData.error) {
                    reject(accountData.error.message)
                } else {
                    resolve(accountData)
                }

            } catch {
                reject()
            }
    
        })
    }

    getAccountStats (id) {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const accessToken = this.accessToken

            try {
    
                const adStats = await page.evaluate(async (id, accessToken) => {
        
                    const adStatsUrl = "https://graph.facebook.com/v14.0/act_"+id+"?fields=account_id,account_status,is_prepay_account,owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,business_country_code,disable_reason,adspaymentcycle{threshold_amount},balance,owner,insights.date_preset(maximum){spend}&access_token="+accessToken
        
                    const adStatsFetch = await fetch(adStatsUrl)
                    return await adStatsFetch.json()
        
                }, id, accessToken)
        
                const data = {
                    id: adStats.account_id,
                    status: adStats.account_status,
                    balance: adStats.balance,
                    threshold: adStats.adspaymentcycle ? adStats.adspaymentcycle.data[0].threshold_amount : '',
                    spend: adStats.insights ? adStats.insights.data[0].spend : '0',
                    createdTime: adStats.created_time,
                    nextBillDate: adStats.next_bill_date,
                    timezoneName: adStats.timezone_name,
                    limit: adStats.adtrust_dsl,
                    currency: adStats.currency,
                    disableReason: adStats.disable_reason,
                    countryCode: adStats.business_country_code ?? '',
                    prePay: adStats.is_prepay_account ? 'TT' : 'TS',
                    ownerBusiness: adStats.owner_business ? adStats.owner_business.id : null
                }
        
                resolve(data)

            } catch {

                reject()

            }
        })
    }

    getAccountQuality() {

        return new Promise(async (resolve, reject) => {
                        
            const page = this.page
            const fb_dtsg = this.dtsg
            const lsd = this.lsd
            const fid = this.uid

            try {
            
                const result = await page.evaluate(async (fb_dtsg, lsd, fid) => {

                    const formData = new FormData() 

                    formData.append('fb_dtsg', fb_dtsg)
                    formData.append('lsd', lsd)
                    formData.append('variables', '{"assetOwnerId":"'+fid+'"}')
                    formData.append('doc_id', '5816699831746699')
            
                    const qualityFetch = await fetch('https://www.facebook.com/api/graphql/', {
                        method: 'POST',
                        body: formData,
                    })
        
                    return await qualityFetch.json()

                }, fb_dtsg, lsd, fid)

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

class Forgot {

    constructor(page, page2, setting, email, pass) {
        this.page = page
        this.page2 = page2
        this.email = email
        this.pass = pass
        this.setting = setting
    }

    forgotPasswordApi(changeCookie, message) {
        return new Promise(async (resolve, reject) => {
    
            const page = this.page
            const page2 = this.page2
            const email = this.email
            const pass = this.pass
            const setting = this.setting
            const z = new zFetch(page)

            try {


                let lsd = ''
                let dtsg = ''

                let url = ''
                let url2 = ''
                let url3 = ''
                let url4 = false

                let newPwd = false
                let newMail = false

                if (page2) {

                    await page2.waitForSelector('[data-convid]')

                    newMail = await page2.evaluate(() => {
                        const mailList = document.querySelectorAll('[data-convid]')

                        return mailList[0].getAttribute('data-convid')
                    })
                }

                if (!changeCookie) {

                    await page.goto('https://mbasic.facebook.com')

                    const html = await page.content()
                    const $ = cheerio.load(html)

                    const forgotLink = $('a[href^="/recover/initiate/?privacy_mutation_token="]').attr('href')

                    if (forgotLink) {
                        const html = await z.get(forgotLink)
                        const $ = cheerio.load(html)

                        lsd = $('input[name="lsd"]').val()

                        if (lsd) {

                            const html = await z.post("https://mbasic.facebook.com/login/identify/?ctx=recover&c=%2Flogin%2F&search_attempts=1&alternate_search=0&show_friend_search_filtered_list=0&birth_month_search=0&city_search=0", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "lsd="+lsd+"&email="+email+"&did_submit=Search",
                            })

                            const $ = cheerio.load(html)

                            const nameSearch = $('a[href^="/recover/initiate/"]').attr('href')

                            if (nameSearch) {

                                const html = await z.get(nameSearch)

                                const $ = cheerio.load(html)

                                url = $('form[action^="/ajax/recover/initiate/"]').attr('action')

                            } else {
                                url = $('form[action^="/ajax/recover/initiate/"]').attr('action')
                            }

                        }

                    }

                } else {

                    const html = await z.get('https://mbasic.facebook.com/recover/initiate/?fl=default_recover&ctx=msite_initiate_view&recover_method=send_email')

                    const $ = cheerio.load(html)

                    lsd = $('input[name="lsd"]').val()
                    dtsg = $('input[name="fb_dtsg"]').val()
                    url = $('form[action^="/ajax/recover/initiate/"]').attr('action')

                }

                if (url) {

                    const html = await z.post("https://mbasic.facebook.com"+url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "lsd="+lsd+"&fb_dtsg="+dtsg+"&jazoest=21094&recover_method=send_email&reset_action=Continue",
                    })

                    const $ = cheerio.load(html)

                    url2 = $('form[action^="/recover/code/"]').attr('action')

                }

                if (url2) {

                    message('Đang chờ mã kích hoạt')

                    let code = false

                    try {

                        if (page2) {

                            code = await getCodeBrowser(page2, newMail)

                        } else {

                            const data = await getMailCode(email, pass)
                            code = data.code 

                        }

                    } catch {}

                    if (code) {

                        message('Đang nhập mã kích hoạt')

                        const html = await z.post("https://mbasic.facebook.com"+url2, {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "lsd="+lsd+"&fb_dtsg="+dtsg+"&jazoest=2919&n="+code+"&reset_action=Continue",
                        })

                        const $ = cheerio.load(html)

                        if (html.includes('account_recovery_password_reset_label')) {

                            url3 = $('form[action^="https://mbasic.facebook.com/recover/password/write"]').attr('action')

                        }
                        

                    }

                }

                if (url3) {

                    if (!setting.skipChangePassword.value || changeCookie) {

                        message('Đang đổi mật khẩu')

                        if (setting.randomPassword.value) {

                            newPwd = 'A@!'+generator.generate({
                                length: 10,
                                numbers: true
                            })

                        } else {
                            newPwd = setting.newPassword.value
                        }

                        url4 = await z.getRedirect(url3, {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "lsd="+lsd+"&fb_dtsg="+dtsg+"&jazoest=2985&password_new="+newPwd,
                            "method": "POST"
                        })

                    } else {

                        message('Đang bỏ qua đổi mật khẩu')

                        url4 = await z.getRedirect(url3, {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "lsd="+lsd+"&fb_dtsg="+dtsg+"&jazoest=21099&password_new=&btn_skip=Skip",
                            "method": "POST"
                        })

                    }

                }

                if (url4.includes('https://')) {

                    await page.goto(url4)

                    resolve(newPwd)

                } else {
                    reject()
                }

            } catch (err) {

                console.log(err)

                reject()
            }

        })
    }
    
    forgotPasswordMbasic(changeCookie, message) {
    
        return new Promise(async (resolve, reject) => {
    
            const page = this.page
            const page2 = this.page2
            const email = this.email
            const pass = this.pass
            const setting = this.setting

            try {

                let error = false

                if (!changeCookie) { 
    
                    await page.goto('https://mbasic.facebook.com/login/identify/')
        
                    await page.waitForSelector('#identify_search_text_input')
        
                    await page.type('#identify_search_text_input', email)
        
                    await page.waitForTimeout(5000)
        
                    await page.click('#did_submit')
        
                    error = await page.$('#login_identify_search_error_msg') || false

                } else {
                    error = false
                }
    
                if (error) {
    
                    message(error)
    
                    return reject()
    
                } else {

                    let newMail = false

                    if (page2) {

                        await page2.waitForSelector('[data-convid]')

                        newMail = await page2.evaluate(() => {
                            const mailList = document.querySelectorAll('[data-convid]')

                            return mailList[0].getAttribute('data-convid')
                        })
                    }
    
                    await page.goto('https://mbasic.facebook.com/recover/initiate/?fl=default_recover&ctx=msite_initiate_view&recover_method=send_email')
    
                    await page.waitForSelector('input[value="send_email"]')
    
                    await page.waitForTimeout(3000)
        
                    try {
                        await page.waitForSelector('input[name="reset_action"]', {
                            timeout: 3000
                        })
                        await page.click('input[name="reset_action"]')
                    } catch {}

                    try {
                        await page.waitForSelector('input[name="send_email"]', {
                            timeout: 3000
                        })
                        await page.click('input[name="send_email"]')
                    } catch {}
    
                    message('Đang chờ lấy mã kích hoạt')

                    try {

                        await page.waitForSelector('a[href^="/login/forget_recovery/?next=%2Frecover"]')

                        await Promise.all([
                            page.click('a[href^="/login/forget_recovery/?next=%2Frecover"]'),
                            page.waitForNavigation({waitUntil: 'networkidle0'})
                        ])
        
                        try {
                            await page.waitForSelector('input[name="reset_action"]', {
                                timeout: 3000
                            })
                            await page.click('input[name="reset_action"]')
                        } catch {}
    
                        try {
                            await page.waitForSelector('input[name="send_email"]', {
                                timeout: 3000
                            })
                            await page.click('input[name="send_email"]')
                        } catch {}

                    } catch {}

                    await page.waitForSelector('input[name="n"]')
    
    
                    let code = ''
    
                    try {
    
                        if (page2) {

                            code = await getCodeBrowser(page2, newMail)

                        } else {

                            await page.waitForTimeout(10000)

                            const data = await getMailCode(email, pass)
                            code = data.code 

                        }
    
                    } catch {
      
                        message('Lấy mã không thành công')
                        
                    }    
    
                    if (code) {

                        message('Đang nhập mã kích hoạt')
    
                        await page.type('input[name="n"]', code)
    
                        await page.waitForTimeout(5000)
    
                        await page.click('[name="reset_action"]')
    
                        await page.waitForSelector('input[name="password_new"]')
    
                        if (!setting.skipChangePassword.value || changeCookie) {

                            let newPwd = ''
    
                            if (setting.randomPassword.value) {

                                newPwd = 'A@!'+generator.generate({
                                    length: 10,
                                    numbers: true
                                })

                            } else {
                                newPwd = setting.newPassword.value
                            }

                            message('Đang đổi mật khẩu')

                            await page.waitForTimeout(2000)
    
                            await page.type('input[name="password_new"]', newPwd)
    
                            await page.waitForTimeout(5000)
    
                            await page.click('input[type="submit"]:not([name="btn_skip"])')
    
                            resolve(newPwd)
    
                        } else {
    
                            message('Đang bỏ qua đổi mật khẩu')
    
                            await page.click('input[name="btn_skip"]')
    
                            resolve(false)
                        }
    
    
                    } else {
                        reject()
                    }
                    
                }
    
            } catch (err) {
                reject(err)
            }
    
        })
    }

}

module.exports = {Change, Account, Forgot}