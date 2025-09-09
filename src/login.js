const twofactor = require('node-2fa')
const generator = require('generate-password')
const cheerio = require('cheerio')
const {zFetch} = require('./zquery.js')
const { delayTimeout } = require('./core.js')

function getAccessToken3(page, uid, dtsg, twofa) {

    return new Promise(async (resolve, reject) => {

        try {
            
            // const twofaCode = twofactor.generateToken(twofa)
            // const code = twofaCode.token

            const code = ''

            const html = await page.evaluate(async (uid, code, dtsg) => {

                let res = await fetch('https://business.facebook.com/billing_hub/payment_settings/')
                
                // if (res.url.includes('/security/twofactor/reauth/')) {

                //     const submitRes = await fetch("https://business.facebook.com/security/twofactor/reauth/enter/", {
                //         "headers": {
                //             "content-type": "application/x-www-form-urlencoded",
                //         },
                //         "body": "approvals_code="+code+"&save_device=false&hash&__user="+uid+"&__a=1&__req=6&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841815&__s=nkjrm2%3Ajkhuf4%3Aak57ky&__hsi=7255612881930865683&__dyn=7xeUmF3EfXolwCwRyU8EKnFwLBwCwXCwAxu13wqovzEdEnxy7Eiwzwq8S2S2q1EwayaxG4o2vwho3Ywv9E4WUc417mu11x-7-1UxO4Uowuo9oeUa85vzo1eE4a4o5-1uwbe2l2UtggzE4y1uwiUmwnGxNxK48W2a4p8y26U8U-3a0y83mwkEbEaUiwpUjwnFU2DxiaBw4kxa4UCfwSyES2e0UE2ZwrU6C2-1qwNwmo6O&__csr=&fb_dtsg="+dtsg+"&jazoest=25114&lsd=KR2xqKPwUu9QJFfE_cA-ah&__spin_r=1007841815&__spin_b=trunk&__spin_t=1689329017&__jssesw=1",
                //         "method": "POST",
                //     })

                //     const submitHtml = await submitRes.text()

                //     if (submitHtml.includes('"codeConfirmed":true')) {
                //         res = await fetch('https://business.facebook.com/content_management')
                //     }

                // }

                return await res.text()

            }, uid, code, dtsg)

            let accessTokenMatches = html.match(/(?<=\"accessToken\":\")[^\"]*/g)

            accessTokenMatches = accessTokenMatches.filter(item => item.includes('EAAG'))

            if (accessTokenMatches[0]) {
                resolve(accessTokenMatches[0])
            } else {
                reject()
            }

        } catch (err) {

            reject(err)

        }
    })

}

function getAccessToken2(page) {

    return new Promise(async (resolve, reject) => {

        try {

            const z = new zFetch(page)
        
            const html = await z.get('https://www.facebook.com/adsmanager/')

            let redirect = html.match(/window.location\.replace\("(.+)"/)

            if (redirect) {

                redirect = redirect[1].replace(/\\/g, '')

                const html2 = await z.get(redirect)

                let accessTokenMatches = html2.match(/window.__accessToken="(.*)";/)
                let postTokenMatches = html2.match(/(?<=\"token\":\")[^\"]*/g)

                if (accessTokenMatches[1] && postTokenMatches[0] && postTokenMatches[1]) {

                    resolve({
                        accessToken: accessTokenMatches[1],
                        fb_dtsg: postTokenMatches[0],
                        lsd: postTokenMatches[1],
                    })

                }

            }

        } catch (err) {
            reject(err)
        }

    })
}

function getAccessToken(page) {

    // return new Promise(async (resolve, reject) => {

    //     try {

    //         const z = new zFetch(page)

    //         let data = {}
            
    //         const html = await z.get('https://business.facebook.com/business-support-home/')
        
    //         let accessTokenMatches = html.match(/(?<=\"accessToken\":\")[^\"]*/g)
    //         let postTokenMatches = html.match(/(?<=\"token\":\")[^\"]*/g)

    //         console.log(accessTokenMatches)
    
    //         accessTokenMatches = accessTokenMatches.filter(item => item.includes('EAA'))
    
    //         if (postTokenMatches[0] && postTokenMatches[1] && accessTokenMatches[0]) {
    
    //             data = {
    //                 accessToken: accessTokenMatches[0],
    //                 fb_dtsg: postTokenMatches[0],
    //                 lsd: postTokenMatches[1],
    //             }
    
    //         }

    //         if (data.fb_dtsg && data.lsd) {
    //             resolve(data)
    //         } else {
    //             const url = await z.getRedirect('https://business.facebook.com/business-support-home/')
    //             reject(url)
    //         }

    //     } catch (err) {
    //         reject(false)
    //     }

    // })

    return new Promise(async (resolve, reject) => {

        try {

            const z = new zFetch(page)
        
            const html = await z.get('https://www.facebook.com/adsmanager/')

            let redirect = html.match(/window.location\.replace\("(.+)"/)

            if (redirect) {

                redirect = redirect[1].replace(/\\/g, '')

                const html2 = await z.get(redirect)

                let accessTokenMatches = html2.match(/window.__accessToken="(.*)";/)
                let postTokenMatches = html2.match(/(?<=\"token\":\")[^\"]*/g)

                if (accessTokenMatches[1] && postTokenMatches[0] && postTokenMatches[1]) {

                    resolve({
                        accessToken: accessTokenMatches[1],
                        fb_dtsg: postTokenMatches[0],
                        lsd: postTokenMatches[1],
                    })

                }

            } else {
                
                const url = await z.getRedirect('https://www.facebook.com/adsmanager/')

                if (url.includes('/consent/user_cookie_choice/')) {

                    const res = await z.get('https://mbasic.facebook.com/')
                    const $ = cheerio.load(res)

                    const url = $('form[action ^="/privacy/consent_framework/server_callback/"]').attr('action')
                    const dtsg = $('input[name="fb_dtsg"]').val()

                    await z.post(url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25552&fb_trackers_on_other_companies=false&other_company_trackers_on_foa=false&card_one_learnt_more=&card_two_learnt_more=&card_three_learnt_more=&card_four_learnt_more=&fb_trackers_on_other_companies=false&other_company_trackers_on_foa=false&primary_consent_button=Autoriser+tous+les+cookies+ou+les+cookies+s%C3%A9lectionn%C3%A9s",
                    })

                }

                reject(url)
            }

        } catch (err) {

            
            reject()
        }

    })
}

function checkPointDetector(page, redirect = false) {

    return new Promise(async (resolve, reject) => {

        try {

            let url 

            if (redirect) {
                url = redirect
            } else {
                url = await page.url()
            }

            if (url.includes('/consent/user_cookie_choice/')) {

                await page.goto('https://mbasic.facebook.com/privacy/consent_framework/prompt/?consent_flow_name=user_cookie_choice&consent_entry_source=pft_user_cookie_choice&_rdr')

                await page.waitForSelector('[name="primary_consent_button"]', {timeout: 5000})

                await page.click('[name="primary_consent_button"]')

            }

            if (url.includes('checkpoint/601051028565049')) {

                await page.goto('https://mbasic.facebook.com/checkpoint/601051028565049/')

                await page.waitForSelector('form[action="/checkpoint/601051028565049/submit/"] button[type="submit"], form[action="/checkpoint/601051028565049/submit/"] input[type="submit"]', {timeout: 5000})

                await page.click('form[action="/checkpoint/601051028565049/submit/"] button[type="submit"], form[action="/checkpoint/601051028565049/submit/"] input[type="submit"]')

            }

            if (url.includes('checkpoint/828281030927956') || url.includes('checkpoint%2F828281030927956') ) {

                const z = new zFetch(page) 

                const res = await z.get('https://mbasic.facebook.com')

                if (res.includes('/x/checkpoint/828281030927956/stepper/?token=')) {

                    await page.goto('https://mbasic.facebook.com')

                    await page.waitForSelector('a[href^="/x/checkpoint/828281030927956/stepper/"]')

                    await page.click('a[href^="/x/checkpoint/828281030927956/stepper/"]')

                    try {

                        await page.waitForSelector('a[href^="/x/checkpoint/828281030927956/anti_scripting/"]', {timeout: 5000})

                        await page.click('a[href^="/x/checkpoint/828281030927956/anti_scripting/"]')

                        try {
                        
                            await page.waitForSelector('#email_captcha', {
                                timeout: 5000
                            })
    
                            resolve('Checkpoint Mail')
    
                        } catch {
                            
                            resolve('Checkpoint Phone')
                            
                        }

                    } catch {

                        await page.waitForSelector('a[href^="/x/checkpoint/828281030927956/cp/intro/"]', {timeout: 5000})

                        await page.click('a[href^="/x/checkpoint/828281030927956/cp/intro/"]')

                        try  {

                            await page.waitForSelector('a[href^="/x/checkpoint/828281030927956/change_password/"]', {timeout: 5000})

                            await page.click('a[href^="/x/checkpoint/828281030927956/change_password/"]')

                            try {

                                await page.waitForSelector('#type_code_container[name="pw"]')
                                
                                resolve('password')

                            } catch {
                                resolve(false)
                            }

                        } catch {

                            await page.waitForSelector('a[href^="/x/checkpoint/828281030927956/cp/selection/"]', {timeout: 5000})

                            await page.click('a[href^="/x/checkpoint/828281030927956/cp/selection/"]')

                            await page.waitForSelector('input[name="skip"]', {timeout: 5000})

                            await page.click('input[name="skip"]')

                            await page.waitForSelector('form[action="/checkpoint/601051028565049/submit/"] input[type="submit"]')



                        }

                    }

                } else {

                    resolve('Khóa hòm')

                }

            } else if (url.includes('consent/reconciliation_3pd_blocking')) {

                resolve('Tạm thời bị chặn')

            } else if (url.includes('checkpoint/1501092823525282')) {

                resolve('Checkpoint 282')

            } else {

                resolve(false)

            }
        } catch (err) {
            reject()
        }
    })

}

function loginCookieApi(cookie) {
    
    return new Promise(async (resolve, reject) => {
        try {
            const res = await fetch("https://www.facebook.com/", {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "vi,en;q=0.9",
                    "cache-control": "max-age=0",
                    "dpr": "1",
                    "sec-ch-prefers-color-scheme": "dark",
                    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Microsoft Edge\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                    "sec-ch-ua-full-version-list": "\"Chromium\";v=\"118.0.5993.71\", \"Microsoft Edge\";v=\"118.0.2088.46\", \"Not=A?Brand\";v=\"99.0.0.0\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"15.0.0\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "viewport-width": "950",
                    "cookie": cookie
                },
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })

            const data = await res.text()

            if (data.includes('"actorId"')) {

                const postTokenMatches = data.match(/(?<=\"token\":\")[^\"]*/g).filter(item => item.startsWith('NA'))

                if (postTokenMatches[0]) {
                    resolve(postTokenMatches[0])
                } else {
                    reject()
                }

            } else {
                reject()
            }
        } catch (err) {

            reject()
        }

    })
} 

function loginApi(page, uid, password, twofa, setting, mode, forgotSuccess, forgotHacked, pid, message, updatePassword, updateStatus) {

    return new Promise(async (resolve, reject) => {
        const z = new zFetch(page)

        await page.goto(`https://${setting.subDomain.value}.facebook.com/login.php`)

        let html = await z.get('https://mbasic.facebook.com/login/')
        let $ = cheerio.load(html)

        let url = $('form[action^="/login/device-based/"]').attr('action')
        
        if (url) {

            let body = []

            let lsd = $('input[name="lsd"]').val()
            let jazoest = $('input[name="jazoest"]').val()
            let m_ts = $('input[name="m_ts"]').val()
            let li = $('input[name="li"]').val()

            url = await z.getRedirect("https://mbasic.facebook.com/login/device-based/regular/login/?refsrc=deprecated&lwv=100&refid=9", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                },
                "body": "lsd="+lsd+"&jazoest="+jazoest+"&m_ts="+m_ts+"&li="+li+"&try_number=0&unrecognized_tries=0&email="+uid+"&pass=werwerwerwerwer&login=Log+In&bi_xrwh=0",
                "method": "POST"
            })
        
           console.log(url)

        }
        
    })


}

function loginFb(page, uid, password, twofa, setting, mode, forgotSuccess, forgotHacked, pid, message, updatePassword, updateStatus) {

    return new Promise(async (resolve, reject) => {

        let error = false
        let checkLogin

        const timeout = 3000
        
        let timer = setTimeout(() => {
            
            clearTimeout(timer)
            clearInterval(checkLogin)

            updateStatus('Timeout')

            return reject()

        }, 120000)

        let busy = false

        checkLogin = setInterval(async () => {

            if (!busy) {

                try {
                    process.kill(pid, 0)
                } catch {
                    clearTimeout(timer)
                    clearInterval(checkLogin)
                    return reject()
                }

                try {

                    const cookies = await page.cookies()
                    const cUser = cookies.filter(item => { return item.name === 'c_user' })

                    if (cUser[0]) {

                        busy = true

                        try {

                            const data = await getAccessToken(page)

                            if (data.accessToken) {

                                clearTimeout(timer)
                                clearInterval(checkLogin)
                                return resolve(data)
                            }

                        } catch (err) {

                            if (err) {

                                try {

                                    const checkPoint = await checkPointDetector(page, err)

                                    if (checkPoint) {

                                        if (checkPoint === 'password') {

                                            const newPassword = 'A@!'+generator.generate({
                                                length: 10,
                                                numbers: true
                                            })
                        
                                            message('Checkpoint đổi mật khẩu')
                        
                        
                                            await page.type('#type_code_container[name="pw"]', newPassword)
                        
                                            await Promise.all([
                                                page.keyboard.press('Enter'),
                                                page.waitForNavigation({waitUntil: 'networkidle2'})
                                            ])
                        
                                            updatePassword(newPassword)
                        
                                            message('Đã đổi mật khẩu thành: '+newPassword)
    
                                            return resolve()
    
                                        } else {

                                            clearTimeout(timer)
                                            clearInterval(checkLogin)

                                            if (mode === 'khang282') {
                                                return resolve(false)
                                            } else {
                                                updateStatus(checkPoint)
                                                return reject('Tài khoản bị checkpoint')
                                            }

                                        }

                                    }

                                } catch {}
                            }

                        } finally {
                            busy = false
                        }

                    }

                } catch {}

            }

        }, 1000)

        if (!forgotSuccess && !forgotHacked) {

            try {

                try {

                    await page.goto(`https://${setting.subDomain.value}.facebook.com/login`, {
                        timeout: 60000
                    })

                } catch (err) {

                    if (err.toString().includes('ERR_NO_SUPPORTED_PROXIES')) {
                        reject('Lỗi proxy')
                    } else {
                        reject('Lỗi mạng')
                    }
                }

                if (!error) {

                    try {

                        await page.waitForSelector('[name="accept_only_essential"][value="0"], [data-testid="cookie-policy-manage-dialog-accept-button"], [data-cookiebanner="accept_button"]', {
                            timeout: 5000
                        })

                        await Promise.all([
                            page.click('[name="accept_only_essential"][value="0"], [data-testid="cookie-policy-manage-dialog-accept-button"], [data-cookiebanner="accept_button"]'),
                            page.waitForNavigation()
                        ])

                    } catch { }
                    try {
                         await page.waitForSelector('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div[2]/div/div/div/div/div/div[1]/div[2]/div/div/div', {
                            timeout: 5000
                        })
                        await Promise.all([
                            page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div[2]/div/div/div/div/div/div[1]/div[2]/div/div/div'),
                            page.waitForNavigation()
                        ])
                    } catch {}
                    try {
                        await page.type('input[name="email"]', uid)
                        await page.type('input[name="pass"]', password)
                    } catch  {
                        await page.waitForSelector('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div/div/div/div[2]/div[3]/div[1]/div/div/div/div[2]/div[2]/input')
                        await page.type('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div/div/div/div[2]/div[3]/div[1]/div/div/div/div[2]/div[2]/input', uid);
                        await page.waitForSelector('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div/div/div/div[2]/div[3]/div[2]/div/div/div/div[2]/div[2]/input')
                        await page.type('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div/div/div/div[2]/div[3]/div[2]/div/div/div/div[2]/div[2]/input', password)                      

                    }
                    try {
                        await page.click('[name="login"]')

                    } catch {
                        await Promise.all([
                            await page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div/div/div/div[2]/div[3]/div[3]/div/div/div'),
                            page.waitForNavigation({waitUntil: 'networkidle2'})
                        ])
                    }
                }

            } catch (err) {

                error = true
            }

            if (!error) {

                try {

                    // Đăng nhập lỗi

                    await page.waitForSelector('#login_error:not([style="display: none;"]), ._9ay7, #error_box', {timeout})
                    
                    const $ = cheerio.load(await page.content())

                    const errText = $('#login_error, ._9ay7, #error_box').text()

                    error = true
                    
                    clearTimeout(timer)
                    clearInterval(checkLogin)

                    reject(errText.replace(/(\r\n|\n|\r)/gm, ' '))

                } catch {

                    try {

                        await page.waitForSelector('#identify_search_text_input', {timeout})

                        clearTimeout(timer)
                        clearInterval(checkLogin)

                        reject('Thông tin đăng nhập không chính xác')

                    } catch {}

                }
                

            }

        }

        if (!error) {

            try {

                let code = ''

                try {
                    const element = await page.waitForSelector('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[2]/input', {timeout});
                  
                    if (element) {
                        
                      code = twofactor.generateToken(twofa);
                  
                      await page.type('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[2]/input', code.token);
                  
                      await Promise.all([
                        page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[4]/div/div[1]/div/div/div'),
                        page.waitForNavigation({waitUntil: 'networkidle2'})
                      ]);
                    } 
                  } catch {
                      await page.waitForXPath('/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[3]/div/div/div');
                      await page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[3]/div/div/div');

                      let found = false;
                      for (let i = 0; i < 20; i++) {
                        try {
                            // Tìm kiếm XPath1 (ở đây là xpath1 bạn đã đề cập)
                            await page.waitForXPath('/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div[2]/div/div/div[2]/div/img');
                            found = true;  // Đánh dấu là đã tìm thấy
                            break;  // Dừng vòng lặp nếu tìm thấy
                        } catch  {}
                        await new Promise(resolve => setTimeout(resolve, 100));
                       }
                       await delayTimeout(2000)
                      await page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div/div[2]/div/div/div[2]/div/img');

                      await page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div[2]/div/div/div/div[2]/div/div/div');
                  
                      await page.waitForSelector('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[2]/input', {timeout});
                  
                      code = twofactor.generateToken(twofa);
                  
                      await page.type('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[2]/div/div/div/div[2]/div[2]/input', code.token);
                  
                      await Promise.all([
                        page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div/div[2]/div/div[4]/div/div[1]/div/div/div'),
                        page.waitForNavigation({waitUntil: 'networkidle2'})
                      ]);
                  }
                  
                try {

                    await page.waitForSelector('[role="button"]:has([role="none"])', {timeout})

                    await page.click('[role="button"]:has([role="none"])')

                    await page.waitForSelector('label:has([name="unused"][value="1"])', {timeout})

                    await page.click('label:has([name="unused"][value="1"])')

                    const button = await page.$x('//*[contains(text(), "Tiếp tục")]')

                    await button[0].click()



                } catch {
                    await page.waitForSelector('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div[2]/div/div/div/div[2]/div/div/div[1]/div/div/div', {timeout})
                    await page.click('xpath=/html/body/div[1]/div/div[2]/div[1]/div/div/div/div/div/div[1]/div/div/div/div[3]/div/div/div/div[2]/div/div/div/div[2]/div/div/div[1]/div/div/div')

                }

                try {

                    await page.waitForSelector('input[id^=":r"]', {timeout})

                    code = twofactor.generateToken(twofa)

                    await page.type('input[id^=":r"]', code.token)

                    await Promise.all([
                        page.keyboard.press('Enter'),
                        page.waitForNavigation({waitUntil: 'networkidle2'})
                    ])

                } catch {}

                try {

                    await page.waitForSelector('input[name="approvals_code"]', {timeout})

                    code = twofactor.generateToken(twofa)

                    message('Đang nhập 2FA')

                    await page.type('input[name="approvals_code"]', code.token)

                    await Promise.all([
                        page.click('[type="submit"]:not(.hidden_elem)'),
                        page.waitForNavigation({waitUntil: 'networkidle2'})
                    ])

                } catch {}

                twofaError = await page.$('input[name="approvals_code"]') || false

                if (twofaError) {

                    clearTimeout(timer)
                    clearInterval(checkLogin)

                    return reject('Mã 2FA không chính xác')
                    
                } else {

                    if (mode !== 'khang282') {

                        try {

                            await page.waitForSelector('#checkpointSubmitButton-actual-button', {timeout})

                            await page.click('#checkpointSubmitButton-actual-button')

                            await page.waitForSelector('#checkpointSubmitButton-actual-button')

                            await page.click('#checkpointSubmitButton-actual-button')

                            await page.waitForSelector('#checkpointSubmitButton-actual-button')

                            await page.click('#checkpointSubmitButton-actual-button')
                        

                        } catch {}

                    }

                    try {

                        await page.waitForSelector('input[value="save_device"]', {timeout})

                        message('Lưu thiết bị')

                        await Promise.all([
                            page.click('[type="submit"]:not(.hidden_elem)'),
                            message('Lưu thiết bị thành công'),
                            page.waitForNavigation({waitUntil: 'networkidle2'})
                        ])

                    } catch {}

                    const url = await page.url()

                    if (url.includes('pipa_blocking_flow')) {

                        const $ = cheerio.load(await page.content())
                        const z = new zFetch(page)

                        const url = 'https://mbasic.facebook.com'+$('form[action^="/privacy/consent_framework/"]').attr('action')
                        const dtsg = $('input[name="fb_dtsg"]').val()


                        const res = await z.post(url, {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "fb_dtsg="+dtsg+"&jazoest=25442&personal_data_toggle=false&data_shared_3pd_toggle=false&cross_border_data_transfer_toggle=false&location_info_toggle=false&primary_consent_button=%EB%8F%99%EC%9D%98%ED%95%A8&personal_data_toggle=false&personal_data_toggle=true&data_shared_3pd_toggle=false&data_shared_3pd_toggle=true&cross_border_data_transfer_toggle=false&cross_border_data_transfer_toggle=true&location_info_toggle=false&location_info_toggle=true&primary_consent_button=%EB%8F%99%EC%9D%98%ED%95%A8",
                        })


                    }

                    if (url.includes('/checkpoint/disabled/')) {

                        clearTimeout(timer)
                        clearInterval(checkLogin)

                        updateStatus('Vô hiệu hóa')
                        return reject('Tài khoản bị checkpoint')

                    }

                    if (url.includes('601051028565049')) {

                        await page.goto('https://mbasic.facebook.com')
        
                        await page.click('form[action="/checkpoint/601051028565049/submit/"] [type="submit"]')
        
                    }

                }

            } catch {}

            try {


                for (let index = 0; index < 10; index++) {
                    
                    try {
        
                        await page.waitForSelector('[type="submit"]:not(.hidden_elem)', {
                            timeout: 3000
                        })

                        cookies = await page.cookies()

                        const cUser = cookies.filter(item => { return item.name === 'c_user' })
                        const changePassword = await page.$('input[name="password_new"]') || ''

                        if (changePassword) {
                            break
                        } else if (cUser[0]) {
                            break
                        } else {
                            await Promise.all([
                                page.click('[type="submit"]:not(.hidden_elem)'),
                                page.waitForNavigation({waitUntil: 'networkidle2'})
                            ])
                        }
        
                    } catch {
                        break
                    }
                    
                }
            
                try {

                    await page.waitForSelector('[name="verification_method"], a[href*="/secure_account_learn_more/"]', {timeout})

                    updateStatus('Checkpoint Mail')
    
                    if (mode === 'khang282') {

                        return resolve(false)

                    } else {

                        clearTimeout(timer)
                        clearInterval(checkLogin)

                        return reject('Tài khoản bị checkpoint')
                    }
    
                } catch {}

                const changePassword = await page.$('input[name="password_new"]') || false
                const confirmPassword = await page.$('input[name="password_confirm"]') || false 
                
                let newPassword = ''

                if (changePassword) {

                    newPassword = 'A@!'+generator.generate({
                        length: 10,
                        numbers: true
                    })

                    message('Checkpoint đổi mật khẩu')

                    await page.evaluate(() => {
                        document.querySelector('input[name="password_new"]').value = ''
                    })

                    await page.type('input[name="password_new"]', newPassword)

                    if (confirmPassword) {
                        await page.type('input[name="password_confirm"]', newPassword)
                    }

                    await Promise.all([
                        page.click('#checkpointSubmitButton-actual-button, #checkpointSubmitButton'),
                        page.waitForNavigation({waitUntil: 'networkidle2'})
                    ])

                    updatePassword(newPassword)

                    message('Đã đổi mật khẩu thành: '+newPassword)

                }

            } catch (err) {
                clearTimeout(timer)
                clearInterval(checkLogin)
                reject('Không thể đăng nhập')
            }

        }

    })

}

function loginFbCookie(page, data, setting, mode, updateStatus) {

    return new Promise(async (resolve, reject) => {

        cookies = []

        data.split(';').forEach(item => {
            
            const parts = item.split('=')
            
            if (parts[0].length > 0) {
                cookies.push({
                    domain: ".facebook.com",
                    name: parts[0].trim(),
                    value: parts[1]
                })
            }

        })

        await page.setCookie(...cookies)

        await page.goto(`https://${setting.subDomain.value}.facebook.com`)

        const checkPoint = await checkPointDetector(page)

        if (checkPoint) {

            if (mode === 'khang282') {
                return resolve(false)
            } else {
                updateStatus(checkPoint)
                return reject('Tài khoản bị checkpoint')
            }

        } else {

            try {

                if (mode !== 'viewChrome') {
    
                    const fbData = await getAccessToken(page)
    
                    resolve(fbData)
    
                } else {
                    resolve(false)
                }
    
            } catch (err) {
                reject('Đã xảy ra lỗi')
            }
        }
      

    })

}

module.exports = {loginFb, loginApi, loginFbCookie, loginCookieApi, checkPointDetector, getAccessToken, getAccessToken2, getAccessToken3}