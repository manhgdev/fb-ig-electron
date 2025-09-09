const {app} = require('electron')
const {randomNumberRange, getPhone, getPhone2, getPhoneCode, deletePhone, getMailCode, resolveCaptcha, resolveCaptchaImage, readMailInbox, getCodeBrowser, randomName} = require('./core.js')
const {Account} = require('./change.js')
const {taoPhoi} = require('./card.js')
const Db = require('./db.js')
const {zFetch, zQuery} = require('./zquery.js')
const path = require('path')
const cheerio = require('cheerio')
const fs = require('fs')
const generator = require('generate-password')
const nodemailer = require('nodemailer')
const mime = require('mime')


class Xmdt {

    constructor(page, item, setting, proxy = '', dtsg = '', accessToken = '', lsd = '', quality = '') {
        this.setting = setting
        this.page = page
        this.item = item
        this.lsd = lsd
        this.dtsg = dtsg
        this.accessToken = accessToken
        this.quality = quality
        this.proxy = proxy
    }

    dameXmdt() {

        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const uid = this.item.uid 
            const dtsg = this.dtsg
            const lsd = this.lsd

            const z = new zFetch(page)

            for (let index = 0; index < 19; index++) {

                try {

                    await z.post('https://business.facebook.com/business/create_account/?brand_name=Toolfb '+randomNumberRange('00000', '99999')+'&first_name=Nguyen&last_name=Hung&email=toolfb'+randomNumberRange('00000', '99999')+'@gmail.com&timezone_id=132&business_category=OTHER', {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "__user="+uid+"&__a=1&__req=y&__hs=19625.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1008828734&__s=ny6s1g%3A8u9ai5%3Aywb7lh&__hsi=7282602546521266083&__dyn=7xeUmwkHg7ebwKBWo5O12wAxu13wqovzEdEc8uw9-dwJwCw4sxG4o2vwho1upE4W0OE2WxO2O1Vwooa81VohwnU5W0IU9k2C2218wnE3_x20CU4a0y83mwkE5G1HwywnE2Lx-0lK3qazo11E2ZwrU6C0L836w&__csr=&fb_dtsg="+dtsg+"&jazoest=25710&lsd="+lsd+"&__spin_r=1008828734&__spin_b=trunk&__spin_t=1695613037&__jssesw=1",
                    })

                } catch {}

            }

            resolve()

        })

    }

    moKhoaHom(message) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page 
            const email = this.item.email 
            const passMail = this.item.passMail 

            try {

                await fetch("https://www.facebook.com/ajax/help/contact/submit/page", {  
                    "headers": {
                        "accept": "*/*",    
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",    
                        "dpr": "1.25",
                        "sec-ch-prefers-color-scheme": "light",    
                        "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
                        "sec-ch-ua-full-version-list": "\"Not/A)Brand\";v=\"99.0.0.0\", \"Google Chrome\";v=\"115.0.5790.188\", \"Chromium\";v=\"115.0.5790.188\"",    
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",    
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"10.0.0\"",    
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",    
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "1242",    
                        "x-asbd-id": "129477",
                        "x-fb-lsd": "AVping06ehQ"  
                    },
                    "referrer": "https://www.facebook.com/help/contact/255904741169641",  
                    "referrerPolicy": 
                    "origin-when-cross-origin",
                    "body": "jazoest=2969&lsd=AVping06ehQ&issue2=cant_sign_up_for_an_account&email="+email+"&details=Đã gửi thông tin "+randomNumberRange(111111, 999999)+"&full_name=Hung Nguyen&dob[year]=2000&dob[month]=1&dob[day]=1&Field153787988085868[0]=Agree&support_form_id=255904741169641&support_form_locale_id=vi_VN&support_form_hidden_fields=%7B%22261033887423161%22%3Afalse%2C%22382689188461041%22%3Afalse%2C%22359890017438092%22%3Afalse%2C%22388054501219785%22%3Afalse%2C%22266870416730477%22%3Afalse%2C%22359294880798758%22%3Afalse%2C%22153787988085868%22%3Afalse%2C%221598858540351148%22%3Atrue%2C%221551831115092703%22%3Atrue%2C%221501744193208904%22%3Atrue%7D&support_form_fact_false_fields=[]&__user=0&__a=1&__req=5&__hs=19645.BP%3ADEFAULT.2.0..0.0&dpr=1.5&__ccg=GOOD&__rev=1009255267&__s=exqcd2%3Autmz6y%3A4t9tvq&__hsi=7290000532615781296&__dyn=7xe6E5aQ1PyUbFuC1swgE98nwgU6C7UW8xi642-7E2vwXw5ux60Vo1upE4W0OE2WxO2O1Vwooa87i0n24o5-0jx0Fwwwi81nE7u0g20RE2Jw8W1uwc-0pa0h-0Lo6-0iq0NE&__csr=&__spin_r=1009255267&__spin_b=trunk&__spin_t=1697335515",  
                    "method": "POST",
                    "mode": "cors",  
                    "credentials": "include"
                })


                await page.waitForTimeout(10000)

                console.log(email, passMail)

                let replyEmail = ''

                for (let index = 0; index < 36; index++) {

                    try {
                    
                        const inbox = await readMailInbox(email, passMail)

                        const match = inbox.filter(item => item.from.includes('<info') && item.from.includes('@support.facebook.com>'))

                        if (match[0]) {

                            replyEmail = inbox[0].from.replace('Facebook <', '').replace('>', '')

                            break
                        }

                    } catch {}

                    await page.waitForTimeout(5000)
                    
                }

                if (replyEmail) {

                    const transporter = nodemailer.createTransport({
                        service: 'hotmail',
                        auth: {
                            user: email,
                            pass: passMail
                        }
                    })
                      
                    const mailOptions = {
                        from: email,
                        to: replyEmail,
                        subject: '',
                        text: '1234'
                    }
                      
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            reject()
                        } else {
                            resolve()
                        }
                    })

                } else {
                    reject()
                }

            } catch (err) {
                console.log(err)
            }

        })
    }

    khangXmdt2(message) {

        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const dtsg = this.dtsg
            const lsd = this.lsd
            const setting = this.setting
            const accessToken = this.accessToken
            const twofa = this.item.twofa
            const quality = this.quality
            const z = new zFetch(page)

            const uid = this.item.uid 

            try {

                const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=1", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__usid=6-Ts4au6pq5jy1l%3APs4au6q1ouvtdq%3A0-As4au6714al647-RV%3D6%3AF%3D&session_id=a31b78567403a2a&__user="+uid+"&__a=1&__req=1&__hs=19679.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009974351&__s=wzht9h%3A5h7j5q%3Asja3ys&__hsi=7302634423574926430&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgolUScwuEnw8ScwgECu7E422a3Fe6rwiolDwFwBgaohzE8U5GbxOfxa2y5E6a6TxC48GU8EhAy88rwzzXwKwjovCxeq4qxS1cwjU88jzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U4y0CpU2RwrUgU5qi9wwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25340&lsd=TtwzUPLIvGqVnRA2_q3dC-&__aaid=0&__spin_r=1009974351&__spin_b=trunk&__spin_t=1700277073&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%7D&server_timestamps=true&doc_id=6538633256243378",
                });

                const data = JSON.parse(res)

                const issueId = data.data.assetOwnerData.advertising_restriction_info.ids_issue_ent_id
                const containerId = data.data.assetOwnerData.advertising_restriction_info.additional_parameters.paid_actor_root_appeal_container_id

                const res2 = await z.post("https://www.facebook.com/accountquality/ufac/?entity_id="+uid+"&paid_actor_root_appeal_container_id="+containerId+"&entity_type=5&ids_issue_id="+issueId+"&_flowletID=1929", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__usid=6-Ts4atur1c0b5uj%3APs4atu71gkqp0a%3A0-As4atsxmyvdik-RV%3D6%3AF%3D&session_id=319ce66cff81c1cb&__user="+uid+"&__a=1&__req=w&__hs=19679.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009974351&__s=wyrl09%3Awwkpua%3A996ez5&__hsi=7302632491991955516&__dyn=7xeXxa4EaolJ28S2q3m8G6FUKnFG5UkBwCwWDwAxuqErxqqax21dxebzEdF8iBCyUuGfwnoiz8WdwJyF8mxe1kx2784O6EC8yEScx60C9EG2u4EuCwQwCxq2212wCCwjFFpobQUTwJBGEpiwzlBwRyXxK261UxO4VAcKU98lwWxe4oeUuyo465udz87G5U2dz84a9DxWbwQwywWjxCU4C5pUao9k2B12ewzwmEK78-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx6dCxeq4qxS1cwjU88jzUS2W5olxa1ozFUK5Ue8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9yQFEa9EHyWwwwi82ohU24wMwrUgU5qiVo88ak22eCK2q362u1dxW6U98a85Ou3u1DxK&__csr=&fb_dtsg="+dtsg+"&jazoest=25446&lsd=6cBvkN1ramDxEQIxXtQL2b&__aaid=0&__spin_r=1009974351&__spin_b=trunk&__spin_t=1700276622",
                    "method": "POST",
                })

                const data2 = JSON.parse(res2.replace('for (;;);', ''))

                const id = data2.payload.enrollment_id

                const checkState = () => {
                    return new Promise(async (resolve, reject) => {

                        try {
                            const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=1945", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "av="+uid+"&__usid=6-Ts4aubo19vyce7%3APs4aubpgelqge%3A0-As4aubb14hlfv5-RV%3D6%3AF%3D&session_id=22f4ddf70b5d1281&__user="+uid+"&__a=1&__req=x&__hs=19679.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009974351&__s=vhxzdp%3A9nkedr%3Ajiid61&__hsi=7302635197700531820&__dyn=7xeXxa4EaolJ28S2q3m8G6FUKnFG5UkBwCwWDwAxuqErxqqax21dxebzEdF8iBCyUuGfwnoiz8WdwJyF8mxe1kx2784O6EC8yEScx60C9EG2u4EuCwQwCxq2212wCCwjFFpobQUTwJBGEpiwzlBwRyXxK261UxO4VAcKU98lwWxe4oeUuyo465udz87G5U2dz84a9DxWbwQwywWjxCU4C5pUao9k2B12ewzwmEK78-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx6dCxeq4qxS1cwjU88jzUS2W5olxa1ozFUK5Ue8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9yQFEa9EHyWwwwi82ohU24wMwrUgU5qiVo88ak22eCK2q362u1dxW6U98a85Ou3u1DxK&__csr=&fb_dtsg="+dtsg+"&jazoest=25386&lsd=mzPJ5d0CM6jJsibJQ_QNCe&__aaid=0&__spin_r=1009974351&__spin_b=trunk&__spin_t=1700277253&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=UFACAppQuery&variables=%7B%22enrollmentID%22%3A"+id+"%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7097887906929159",
                            })

                            const data = JSON.parse(res)

                            resolve(data.data.ufac_client.state)

                        } catch {
                            reject()
                        }
                    })
                }

                let state = await checkState()

                if (state.__typename === 'UFACIntroState') {

                    await z.post("https://www.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=4&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009317597&__s=g4kdcc:fbi499:cmeoui&__hsi=7291209497129069677&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=hI9lGNcCF7GZQVdeqGlkmuUyFk-JGWjByV9KZ6WjRriOUgqmJ9G8yXgS5XqWyUgyk8wBxO5EcU5iawOwko2cwUG1dxy68vU885m2613wjo1qU1381SE33z87i1Bw5lw4IyodFWwfS6Q4EdUqHCye2m1nw3EU0M60S803P1w0Obw18G02K-0R80cBo3Hxiq4F802nFw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25829&lsd='+lsd+'&__spin_r=1009317597&__spin_b=trunk&__spin_t=1697617000&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"PROCEED","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                    })

                    state = await checkState()

                }

                if (state.__typename === 'UFACBotCaptchaState') {

                    message('Đang giải captcha')

                    const html2 = await z.get('https://www.facebook.com/business-support-home/'+uid)

                    const persist = state.captcha_persist_data
                    const consent = (html2.match(/(?<=\"consent_param\":\")[^\"]*/g))[0]
                    const locale = (html2.match(/(?<=\"code\":\")[^\"]*/g))[0]

                    const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?referer=https%253A%252F%252Fwww.facebook.com&locale='+locale+'&__cci='+encodeURIComponent(consent)

                    const captchaHtml = await z.get(captchaUrl)
                    const $ = cheerio.load(captchaHtml)

                    const siteKey = $('[data-sitekey]').attr('data-sitekey')

                    let captchaSuccess = false

                    for (let index = 0; index < 3; index++) {

                        if (index > 0) {
                            message('Đang thử giải lại captcha')
                        }

                        try {
                            
                            const res = await resolveCaptcha(setting, siteKey, captchaUrl)

                            const result = await z.post('https://www.facebook.com/api/graphql/', {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=6&__hs=19608.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1008510432&__s=wixma6:3lwxjd:w1cvvj&__hsi=7276285233254120568&__dyn=7xeXxa2C2O5U5O8G6EjBWo2nDwAxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew65xO2OU7m0yE465o-cw5Mx62G3i0Bo7O2l0Fwqo31w9O7Udo5qfK0zEkxe2Gew9O22362W5olw8Xxm16wa-7U1boarCwLyESE6S0B40z8c86-1Fwmk1xwmo6O1Fw9O2y&__csr=gQNdJ-OCcBGBG8WB-F4GHHCjFZqAS8LKaAyqhVHBGAACJde48jiKqqqGy4bK8zmbxi5onGfgiw9Si1uBwJwFw9N2oaEW3m1pwKwr835wywaG0vK0u-ewCwbS01aPw0d9O05uo4Wcwp8cJAx6U21w1420kKdxCQ063U12U0QK0midgsw1mR00H9w5VxS9DAw0gCvw0Opw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25277&lsd='+lsd+'&__spin_r=1008510432&__spin_b=trunk&__spin_t=1694142174&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"SUBMIT_BOT_CAPTCHA_RESPONSE","bot_captcha_persist_data":"'+persist+'","bot_captcha_response":"'+res+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6495927930504828'
                            })

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

                if (state.__typename === 'UFACContactPointChallengeSubmitCodeState' && state.contact_point_challenge_variant !== 'ADD_NEW_CORRESPONDENCE_EMAIL') {

                    message('Đang gỡ số điện thoại cũ')
                    
                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                    })

                    if (res.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {
                        state = await checkState()
                    } else {

                        return reject('Không thể gỡ số điện thoại cũ')

                    }
                    
                }

                if (state.__typename === 'UFACContactPointChallengeSubmitCodeState' && state.contact_point_challenge_variant === 'ADD_NEW_CORRESPONDENCE_EMAIL') {

                    message('Đang gỡ email cũ')
                    
                    const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=2056", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "av="+uid+"&__usid=6-Ts5ufbei1hr5g%3APs5ufbdv9d84x%3A0-As5ufb1hw2siq-RV%3D6%3AF%3D&session_id=309593664689455&__user="+uid+"&__a=1&__req=w&__hs=19709.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010472990&__s=4sgbxn%3Akciq9x%3Aohl3k9&__hsi=7313773266847056689&__dyn=7xeXxa4EaolJ28S2q3m8G6FUKmhG5UkBwCwWDwAxuqErxqqax21dxebzEdF8iBCyUuGfwnoiz8WdwJyF8mxe1kx2784O6EC8yEScx60C9EG2u4EuCwQwCxq2212wCCwjFFpobQUTwJBGEpiwzlBwRyXxK261UxO4VAcKU98lwWxe4oeUuyo465udz87G5U2dz84a9DxWbwQwywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx6dCxeq4qxS1cwjU88jzUS2W5olxa1ozFUK5Ue8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9yQFEa9EHyWwwwi82ohU24wMwrUgU5qiVo88ak22eCK2q362u1dxW6U98a85Ou3u1DxKfw&__csr=&fb_dtsg="+dtsg+"&jazoest=25788&lsd=DhOhNJtqEHZMQj9bU_rLrT&__aaid=0&__spin_r=1010472990&__spin_b=trunk&__spin_t=1702870537&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22action%22%3A%22UNSET_CONTACT_POINT%22%2C%22enrollment_id%22%3A%22"+id+"%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7263818100308692",
                    })

                    if (res.includes('UFACContactPointChallengeSetContactPointState')) {
                        state = await checkState()
                    } else {

                        return reject('Không thể gỡ email cũ')

                    }

                }

                if (state.__typename === 'UFACContactPointChallengeSetContactPointState' && state.contact_point_challenge_variant !== 'ADD_NEW_CORRESPONDENCE_EMAIL') {

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

                                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=5799", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__usid=6-Ts32vzy5lbbnm:Ps32w00w7ep8k:0-As32vzy8nfhuf-RV=6:F=&session_id=392d588c9fe08fb9&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=v3r9g5:6bpvyp:rynm6b&__hsi=7293827532840545377&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25259&lsd=_m2P87owOD8j6w2xxN6rHw&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698226559&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"SET_CONTACT_POINT","contactpoint":"'+phone.number+'","country_code":"VN","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
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
                            
                            state = await checkState()

                            const codeStep = state.__typename === 'UFACContactPointChallengeSubmitCodeState'

                            if (codeStep) {

                                message('Đang chờ mã kích hoạt')

                                try {

                                    const code = await getPhoneCode(setting.phoneService.value, setting.phoneServiceKey.value, phone.id, this.proxy)

                                    message('Đang nhập mã kích hoạt')

                                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6114", {
                                        "headers": {
                                          "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=bi5lni:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"SUBMIT_CODE","code":"'+code+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                                      })


                                    if (res.includes('"ufac_client":{"id"')) {

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
                    
                                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                                    })

                                    if (res.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {
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

                if (state.__typename === 'UFACContactPointChallengeSetContactPointState' && state.contact_point_challenge_variant === 'ADD_NEW_CORRESPONDENCE_EMAIL') {

                    const newEmail = this.item.newEmail.split('|')[0]
                    const newEmailPassword = this.item.newEmail.split('|')[1]

                    try {

                        message('Đang thêm email mới')

                        const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=2242", {
                            "headers": {
                                "accept": "*/*",
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "av="+uid+"&__usid=6-Ts5ueir92ogpx%3APs5ueiqndvv6b%3A0-As5uegm1p5o1lx-RV%3D6%3AF%3D&session_id=57bb8ba6c53704f1&__user="+uid+"&__a=1&__req=x&__hs=19709.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010472990&__s=zugdq9%3A9boet8%3A0tj9xf&__hsi=7313768834743222582&__dyn=7xeXxa4EaolJ28S2q3m8G6FUKmhG5UkBwCwWDwAxuqErxqqax21dxebzEdF8iBCyUuGfwnoiz8WdwJyF8mxe1kx2784O6EC8yEScx60C9EG2u4EuCwQwCxq2212wCCwjFFpobQUTwJBGEpiwzlBwRyXxK261UxO4VAcKU98lwWxe4oeUuyo465udz87G5U2dz84a9DxWbwQwywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx6dCxeq4qxS1cwjU88jzUS2W5olxa1ozFUK5Ue8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9yQFEa9EHyWwwwi82ohU24wMwrUgU5qiVo88ak22eCK2q362u1dxW6U98a85Ou3u1DxKfw&__csr=&fb_dtsg="+dtsg+"&jazoest=25614&lsd=02wwLjIrOwkPHgJpvD-WJ7&__aaid=0&__spin_r=1010472990&__spin_b=trunk&__spin_t=1702869505&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22action%22%3A%22SET_CONTACT_POINT%22%2C%22contactpoint%22%3A%22"+newEmail+"%22%2C%22enrollment_id%22%3A%22"+id+"%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7263818100308692",
                        })

                        if (res.includes('UFACContactPointChallengeSubmitCodeState')) {

                            message('Đang chờ mã kích hoạt')

                            await page.waitForTimeout(2000)

                            await z.post("https://www.facebook.com/api/graphql/?_flowletID=2469", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "av="+uid+"&__usid=6-Ts5ufryusgcgv%3APs5ufrx1aeligf%3A0-As5ufrkk7z4wx-RV%3D6%3AF%3D&session_id=1aefbee9fad1c568&__user="+uid+"&__a=1&__req=10&__hs=19709.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010472990&__s=d3qlrb%3Aht3gba%3Afvy4jk&__hsi=7313775827675692801&__dyn=7xeXxa4EaolJ28S2q3m8G6FUKmhG5UkBwCwWDwAxuqErxqqax21dxebzEdF8iBCyUuGfwnoiz8WdwJyF8mxe1kx2784O6EC8yEScx60C9EG2u4EuCwQwCxq2212wCCwjFFpobQUTwJBGEpiwzlBwRyXxK261UxO4VAcKU98lwWxe4oeUuyo465udz87G5U2dz84a9DxWbwQwywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx6dCxeq4qxS1cwjU88jzUS2W5olxa1ozFUK5Ue8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9yQFEa9EHyWwwwi82ohU24wMwrUgU5qiVo88ak22eCK2q362u1dxW6U98a85Ou3u1DxKfw&__csr=&fb_dtsg="+dtsg+"&jazoest=25323&lsd=QMR804n1NI548gzT3CurOg&__aaid=0&__spin_r=1010472990&__spin_b=trunk&__spin_t=1702871133&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22action%22%3A%22RESEND_CODE%22%2C%22enrollment_id%22%3A%22"+id+"%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7263818100308692",
                            })

                            await page.waitForTimeout(10000)

                            const data = await getMailCode(newEmail, newEmailPassword)
                            const code = data.code 

                            if (code) {

                                message('Đang nhập mã kích hoạt')

                                const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=2203", {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                    },
                                    "body": "av="+uid+"&__usid=6-Ts5ufryusgcgv%3APs5ufrx1aeligf%3A0-As5ufrkk7z4wx-RV%3D6%3AF%3D&session_id=1aefbee9fad1c568&__user="+uid+"&__a=1&__req=x&__hs=19709.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010472990&__s=v5yu93%3Aht3gba%3Afvy4jk&__hsi=7313775827675692801&__dyn=7xeXxa4EaolJ28S2q3m8G6FUKmhG5UkBwCwWDwAxuqErxqqax21dxebzEdF8iBCyUuGfwnoiz8WdwJyF8mxe1kx2784O6EC8yEScx60C9EG2u4EuCwQwCxq2212wCCwjFFpobQUTwJBGEpiwzlBwRyXxK261UxO4VAcKU98lwWxe4oeUuyo465udz87G5U2dz84a9DxWbwQwywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx6dCxeq4qxS1cwjU88jzUS2W5olxa1ozFUK5Ue8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9yQFEa9EHyWwwwi82ohU24wMwrUgU5qiVo88ak22eCK2q362u1dxW6U98a85Ou3u1DxKfw&__csr=&fb_dtsg="+dtsg+"&jazoest=25323&lsd=QMR804n1NI548gzT3CurOg&__aaid=0&__spin_r=1010472990&__spin_b=trunk&__spin_t=1702871133&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22action%22%3A%22SUBMIT_CODE%22%2C%22code%22%3A%22"+code+"%22%2C%22enrollment_id%22%3A%22"+id+"%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7263818100308692",
                                })

                                console.log(res)

                            } else {
                                message('Thêm email mới thất bại')
                            }

                        } else {
                            message('Thêm email mới thất bại')
                        }

                    } catch (err) {
                        message('Thêm email mới thất bại')
                    }

                }

                if (state.__typename === 'UFACImageUploadChallengeState') {

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

                        const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
                            "headers": {
                              "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": 'av='+uid+'&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UPLOAD_IMAGE","image_upload_handle":"'+data.h+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                        })

                        if (res.includes('UFACAwaitingReviewState')) {

                            message('Upload phôi thành công')

                            return resolve()

                        } else {

                            message('Đang thử upload lại phôi')

                            const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
                                "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": 'av='+uid+'&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UPLOAD_IMAGE","image_upload_handle":"'+data.h+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                            })

                            if (res.includes('UFACAwaitingReviewState')) {

                                message('Upload phôi thành công')
    
                                return resolve()

                            } else {

                                return reject()

                            }
                        }

                    } else {

                        return reject('Không thể upload phôi')
                    }

                }

                if (state.__typename === 'UFACAwaitingReviewState') {                    
                    resolve()
                }


            } catch (err) {
                console.log(err)
            }

        })
    }

    khangXmdtApi(message, bmId = false, khangBang273 = false, khangBangPage = false) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const dtsg = this.dtsg
            const lsd = this.lsd
            const setting = this.setting
            const accessToken = this.accessToken
            const twofa = this.item.twofa
            const quality = this.quality
            const z = new zFetch(page)

            const uid = this.item.uid 

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

                    const res = await z.post("https://www.facebook.com/api/graphql/", {
                        "headers": {
                        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOMix6XnzisxiE316",
                        },
                        "body": '------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"fb_dtsg\"\r\n\r\n'+dtsg+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"lsd\"\r\n\r\n'+lsd+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"variables\"\r\n\r\n{\"assetOwnerId\":\"'+target+'\"}\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"doc_id\"\r\n\r\n5816699831746699\r\n------WebKitFormBoundaryOMix6XnzisxiE316--\r\n',
                    })

                    const data = JSON.parse(res)

                    const issueId = data.data.assetOwnerData.advertising_restriction_info.ids_issue_ent_id
                    const decisionId = data.data.assetOwnerData.advertising_restriction_info.additional_parameters.decision_id

                    const res2 = await z.post("https://www.facebook.com/accountquality/ufac/?decision_id="+decisionId+"&ids_issue_id="+issueId+"&entity_type="+type+"&entity_id="+target+"&_flowletID=9999", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": '__usid=6-Ts2rbmo1223bxs:Ps2rbmm1pafisj:0-As2rbmcwf48js-RV=6:F=&session_id=4d371069f94ed908&__user='+uid+'&__a=1&__req=q&__hs=19649.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009336620&__s=vkojb0:tpoa7e:m367w6&__hsi=7291509895584633584&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U&__csr=&fb_dtsg='+dtsg+'&jazoest=25489&lsd=QTfKpPcJRl9RAFTWridNry&__aaid=0&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697686941',
                    })

                    const data2 = JSON.parse(res2.replace('for (;;);', ''))

                    id = data2.payload.enrollment_id

                } else if (khangBangPage) {

                    const res = await z.post("https://www.facebook.com/business_authenticity_platform/xfac/?authenticatable_entity_id="+khangBangPage+"&bap_product=bi_impersonation&callback_uri_string=%2Fbusiness-support-home%2F&_flowletID=1730", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "__usid=6-Ts5uu53d8dfod%3APs5uu6bg02c8f%3A0-As5uu34urhtu2-RV%3D6%3AF%3D&session_id=2c2f06ec95e5cc5b&__user="+uid+"&__a=1&__req=m&__hs=19709.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010474043&__s=m2k4ll%3Asfxlhg%3Atsb4ry&__hsi=7313855978735943424&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25387&lsd=JQMnGH0ipq77OVWWsb7uxd&__aaid=0&__spin_r=1010474043&__spin_b=trunk&__spin_t=1702889795&__jssesw=1",
                        "method": "POST",
                    })

                    console.log(res)

                    await page.waitForTimeout(5000000)

                    const data = JSON.parse(res.replace('for (;;);', ''))

                    id = data.payload.enrollment_id

                } else {

                    target = bmId
                    type = 4
                    id = khangBang273

                }

                const url = 'https://www.facebook.com/checkpoint/1501092823525282/'+id

                console.log(url)

                let html = await z.get(url)

                const introStep = html.includes('UFACIntro')
             
                if (introStep) {

                    const res = await z.post("https://www.facebook.com/api/graphql/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=4&__hs=19648.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009317597&__s=g4kdcc:fbi499:cmeoui&__hsi=7291209497129069677&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=hI9lGNcCF7GZQVdeqGlkmuUyFk-JGWjByV9KZ6WjRriOUgqmJ9G8yXgS5XqWyUgyk8wBxO5EcU5iawOwko2cwUG1dxy68vU885m2613wjo1qU1381SE33z87i1Bw5lw4IyodFWwfS6Q4EdUqHCye2m1nw3EU0M60S803P1w0Obw18G02K-0R80cBo3Hxiq4F802nFw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25829&lsd='+lsd+'&__spin_r=1009317597&__spin_b=trunk&__spin_t=1697617000&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"PROCEED","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7677628318930552',
                    })

                    if (!res.includes('{"ufac_client":{"id"')) {
                        return reject()
                    } else {
                        html = await z.get(url)
                    }

                }

                const captchaStep = html.includes('"captcha_persist_data"')

                if (captchaStep) {

                    message('Đang giải captcha')
                    
                    const persist = (html.match(/(?<=\"captcha_persist_data\":\")[^\"]*/g))[0]
                    const consent = (html.match(/(?<=\"consent_param\":\")[^\"]*/g))[0]
                    const locale = (html.match(/(?<=\"code\":\")[^\"]*/g))[0]

                    const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?referer=https%253A%252F%252Fwww.facebook.com&locale='+locale+'&__cci='+encodeURIComponent(consent)

                    const captchaHtml = await z.get(captchaUrl)
                    const $ = cheerio.load(captchaHtml)

                    const siteKey = $('[data-sitekey]').attr('data-sitekey')

                    let captchaSuccess = false

                    for (let index = 0; index < 3; index++) {

                        if (index > 0) {
                            message('Đang thử giải lại captcha')
                        }

                        try {
                            
                            const res = await resolveCaptcha(setting, siteKey, captchaUrl)

                            const result = await z.post('https://www.facebook.com/api/graphql/', {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=6&__hs=19608.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1008510432&__s=wixma6:3lwxjd:w1cvvj&__hsi=7276285233254120568&__dyn=7xeXxa2C2O5U5O8G6EjBWo2nDwAxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew65xO2OU7m0yE465o-cw5Mx62G3i0Bo7O2l0Fwqo31w9O7Udo5qfK0zEkxe2Gew9O22362W5olw8Xxm16wa-7U1boarCwLyESE6S0B40z8c86-1Fwmk1xwmo6O1Fw9O2y&__csr=gQNdJ-OCcBGBG8WB-F4GHHCjFZqAS8LKaAyqhVHBGAACJde48jiKqqqGy4bK8zmbxi5onGfgiw9Si1uBwJwFw9N2oaEW3m1pwKwr835wywaG0vK0u-ewCwbS01aPw0d9O05uo4Wcwp8cJAx6U21w1420kKdxCQ063U12U0QK0midgsw1mR00H9w5VxS9DAw0gCvw0Opw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25277&lsd='+lsd+'&__spin_r=1008510432&__spin_b=trunk&__spin_t=1694142174&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"SUBMIT_BOT_CAPTCHA_RESPONSE","bot_captcha_persist_data":"'+persist+'","bot_captcha_response":"'+res+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6495927930504828'
                            })

                            if (result.includes('body_text')) {
                                captchaSuccess = true
                                break
                            }

                        } catch {}
                        
                    }

                    if (captchaSuccess) {

                        html = await z.get(url)

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
                        },
                        "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=7&__hs=19649.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009336620&__s=4na9wc:efzkrd:jhn576&__hsi=7291499991552787607&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gJfOqqAjnGDvHi-8B8HAgKWldKswxbx12YxFqjQF8CqmeWy5pEjy98oK9xmawQwg8Hwv824wyBwo85l2k1Kwj87m0Fo-dzo0EW1pwYwJw9C3m3G0LU0XCVGGES9y94aK3y1uw2lAE3iw12G6FE1WE03Q3w0Ecw1D602ja06IoC9K685G031201qyw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25259&lsd=ry1hVRzCoL--hEDK73Qfr2&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697684636&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"USE_DIFFERENT_PHONE","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=7132448186773917',
                    })

                    if (res.includes('{"ufac_client":{"id"')) {
                        html = await z.get(url)
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
                        html = await z.get(url)
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
                                        html = await z.get(url)
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

    khang902Api2(message, bmId = '') {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const setting = this.setting
            const dtsg = this.dtsg
            const lsd = this.lsd
            const accessToken = this.accessToken
            const twofa = this.item.twofa
            const quality = this.quality
            const z = new zFetch(page)

            const uid = this.item.uid 

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

                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                      "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOMix6XnzisxiE316",
                    },
                    "body": '------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"fb_dtsg\"\r\n\r\n'+dtsg+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"lsd\"\r\n\r\n'+lsd+'\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"variables\"\r\n\r\n{\"assetOwnerId\":\"'+target+'\"}\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"doc_id\"\r\n\r\n5816699831746699\r\n------WebKitFormBoundaryOMix6XnzisxiE316--\r\n',
                })

                const data = JSON.parse(res)

                const issueId = data.data.assetOwnerData.advertising_restriction_info.ids_issue_ent_id

                if (setting.chooseLineOnly?.value || this.quality === '902_line') {

                    message('Đang chọn dòng')

                    const res = await z.post("https://business.facebook.com/api/graphql/?_flowletID=2423", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "av="+uid+"&__usid=6-Ts62bj38e5dcl%3APs62bqs19mjhs3%3A0-As62bhb1qhfddh-RV%3D6%3AF%3D&session_id=26399276ba0973c5&__user="+uid+"&__a=1&__req=w&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574604&__s=pyhonq%3Azkdiwa%3A6yn1u0&__hsi=7315356470129303763&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzweau0Jo6-4e1mAKm221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg="+dtsg+"&jazoest=25180&lsd=5FnEglTcQSfqnuBkn03g8c&__aaid=0&__bid=212827131149567&__spin_r=1010574604&__spin_b=trunk&__spin_t=1703239154&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useALEBanhammerAppealMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22"+reasonId+"%22%2C%22actor_id%22%3A%22100050444678752%22%2C%22entity_id%22%3A%22"+target+"%22%2C%22ids_issue_ent_id%22%3A%22"+issueId+"%22%2C%22appeal_comment%22%3A%22"+encodeURIComponent(content)+"%22%2C%22callsite%22%3A%22ACCOUNT_QUALITY%22%7D%7D&server_timestamps=true&doc_id=6816769481667605",
                    })

                    if (res.includes('"success":true')) {
                        return resolve()
                    } else {
                        return reject()
                    }

                }
                
                const decisionId = data.data.assetOwnerData.advertising_restriction_info.additional_parameters.friction_decision_id

                const res2 = await z.post("https://www.facebook.com/accountquality/ufac/?decision_id="+decisionId+"&ids_issue_id="+issueId+"&entity_type="+type+"&entity_id="+target+"&_flowletID=2169", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__usid=6-Ts32udfp2ieqb%3APs32udrqbzoxh%3A0-As32ud2p8mux0-RV%3D6%3AF%3D&session_id=2478ab408501cdea&__user="+uid+"&__a=1&__req=u&__hs=19655.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=417qpb%3Alchip2%3Ayq4pb1&__hsi=7293818531390316856&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25548&lsd=A-HDfPRVoR7YG2zHwlCDBx&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224463",
                })

                const data2 = JSON.parse(res2.replace('for (;;);', ''))

                const id = data2.payload.enrollment_id

                const checkState = () => {
                    return new Promise(async (resolve, reject) => {

                        try {
                            const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=2667", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": 'av='+uid+'&__usid=6-Ts32uok1y9xfvn:Ps32uol13ql4xy:0-As32unzppjifr-RV=6:F=&session_id=39a4ef7cb4471bc7&__user='+uid+'&__a=1&__req=v&__hs=19655.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=66oim1:rc1h95:79wmnc&__hsi=7293820200761279392&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg='+dtsg+'&jazoest=25374&lsd=gxYcaWGy-YhTSvBKDhInoq&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224851&__jssesw=247&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=UFACAppQuery&variables={"enrollmentID":'+id+',"scale":1}&server_timestamps=true&doc_id=7089047377805579',
                            })

                            const data = JSON.parse(res)

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

                    const html = await z.get('https://www.facebook.com/business-support-home/'+uid)

                    const persist = state.captcha_persist_data
                    const consent = (html.match(/(?<=\"consent_param\":\")[^\"]*/g))[0]
                    const locale = (html.match(/(?<=\"code\":\")[^\"]*/g))[0]

                    const captchaUrl = 'https://www.fbsbx.com/captcha/recaptcha/iframe/?referer=https%253A%252F%252Fwww.facebook.com&locale='+locale+'&__cci='+encodeURIComponent(consent)

                    const captchaHtml = await z.get(captchaUrl)
                    const $ = cheerio.load(captchaHtml)

                    const siteKey = $('[data-sitekey]').attr('data-sitekey')

                    let captchaSuccess = false

                    for (let index = 0; index < 3; index++) {

                        if (index > 0) {
                            message('Đang thử giải lại captcha')
                        }

                        try {
                            
                            const res = await resolveCaptcha(setting, siteKey, captchaUrl)

                            const result = await z.post('https://www.facebook.com/api/graphql/', {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": 'av='+uid+'&__user='+uid+'&__a=1&__req=6&__hs=19608.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1008510432&__s=wixma6:3lwxjd:w1cvvj&__hsi=7276285233254120568&__dyn=7xeXxa2C2O5U5O8G6EjBWo2nDwAxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew65xO2OU7m0yE465o-cw5Mx62G3i0Bo7O2l0Fwqo31w9O7Udo5qfK0zEkxe2Gew9O22362W5olw8Xxm16wa-7U1boarCwLyESE6S0B40z8c86-1Fwmk1xwmo6O1Fw9O2y&__csr=gQNdJ-OCcBGBG8WB-F4GHHCjFZqAS8LKaAyqhVHBGAACJde48jiKqqqGy4bK8zmbxi5onGfgiw9Si1uBwJwFw9N2oaEW3m1pwKwr835wywaG0vK0u-ewCwbS01aPw0d9O05uo4Wcwp8cJAx6U21w1420kKdxCQ063U12U0QK0midgsw1mR00H9w5VxS9DAw0gCvw0Opw&__comet_req=15&fb_dtsg='+dtsg+'&jazoest=25277&lsd='+lsd+'&__spin_r=1008510432&__spin_b=trunk&__spin_t=1694142174&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"SUBMIT_BOT_CAPTCHA_RESPONSE","bot_captcha_persist_data":"'+persist+'","bot_captcha_response":"'+res+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6495927930504828'
                            })

                            console.log(result)

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
                    
                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                    })

                    if (res.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {
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

                                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=5799", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__usid=6-Ts32vzy5lbbnm:Ps32w00w7ep8k:0-As32vzy8nfhuf-RV=6:F=&session_id=392d588c9fe08fb9&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=v3r9g5:6bpvyp:rynm6b&__hsi=7293827532840545377&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25259&lsd=_m2P87owOD8j6w2xxN6rHw&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698226559&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"SET_CONTACT_POINT","contactpoint":"'+phone.number+'","country_code":"VN","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
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
                            
                            state = await checkState()

                            const codeStep = state.__typename === 'UFACContactPointChallengeSubmitCodeState'

                            if (codeStep) {

                                message('Đang chờ mã kích hoạt')

                                try {

                                    const code = await getPhoneCode(setting.phoneService.value, setting.phoneServiceKey.value, phone.id, this.proxy)

                                    message('Đang nhập mã kích hoạt')

                                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6114", {
                                        "headers": {
                                          "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=bi5lni:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"SUBMIT_CODE","code":"'+code+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                                      })


                                    if (res.includes('"ufac_client":{"id"')) {

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
                    
                                    const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": 'av='+uid+'&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user='+uid+'&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"2","actor_id":"'+uid+'","action":"UNSET_CONTACT_POINT","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                                    })

                                    if (res.includes('REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP')) {
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

                        const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
                            "headers": {
                              "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": 'av='+uid+'&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UPLOAD_IMAGE","image_upload_handle":"'+data.h+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                        })

                        if (res.includes('UFACAwaitingReviewState')) {

                            message('Upload phôi thành công')

                            state = await checkState()

                        } else {

                            message('Đang thử upload lại phôi')

                            const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
                                "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": 'av='+uid+'&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user='+uid+'&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg='+dtsg+'&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={"input":{"client_mutation_id":"1","actor_id":"'+uid+'","action":"UPLOAD_IMAGE","image_upload_handle":"'+data.h+'","enrollment_id":"'+id+'"},"scale":1}&server_timestamps=true&doc_id=6856852124361122',
                            })

                            if (res.includes('UFACAwaitingReviewState')) {

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

                    const res = await z.post("https://business.facebook.com/api/graphql/?_flowletID=2423", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "av="+uid+"&__usid=6-Ts62bj38e5dcl%3APs62bqs19mjhs3%3A0-As62bhb1qhfddh-RV%3D6%3AF%3D&session_id=26399276ba0973c5&__user="+uid+"&__a=1&__req=w&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574604&__s=pyhonq%3Azkdiwa%3A6yn1u0&__hsi=7315356470129303763&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzweau0Jo6-4e1mAKm221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg="+dtsg+"&jazoest=25180&lsd=5FnEglTcQSfqnuBkn03g8c&__aaid=0&__bid=212827131149567&__spin_r=1010574604&__spin_b=trunk&__spin_t=1703239154&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useALEBanhammerAppealMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22"+reasonId+"%22%2C%22actor_id%22%3A%22100050444678752%22%2C%22entity_id%22%3A%22"+target+"%22%2C%22ids_issue_ent_id%22%3A%22"+issueId+"%22%2C%22appeal_comment%22%3A%22"+encodeURIComponent(content)+"%22%2C%22callsite%22%3A%22ACCOUNT_QUALITY%22%7D%7D&server_timestamps=true&doc_id=6816769481667605",
                    })

                    if (res.includes('"success":true')) {
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

    khang902Api(message) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const setting = this.setting
            const uid= this.item.uid
            const dtsg = this.dtsg
            const z = new zFetch(page)

            const chooseArr = ['policy', 'unauthorized_use', 'other']
            const randomChoose = chooseArr[Math.floor(Math.random() * chooseArr.length)]

            const chooseValue = setting.chooseLine.value === 'random' ? randomChoose : setting.chooseLine.value

            const text = {
                'policy': 'I’m not sure which policy was violated.',
                'unauthorized_use': 'I think there was unauthorized use of my Facebook account.',
                'other': 'Another reason:',
            }

            let flag = 'true' 

            if (chooseValue === 'other') {
                flag = 'false'
            }

            const content = setting.chooseLine.value === 'other' ? setting.noiDungKhang.value : 'I think there was unauthorized use of my Facebook account.'
            const choose = text[chooseValue]

            try {

                const res = await z.post("https://www.facebook.com/ajax/help/contact/submit/page", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "jazoest=22029&fb_dtsg="+dtsg+"&Field194851295145668="+encodeURIComponent(choose)+"&appeal_comment="+encodeURIComponent(content)+"&support_form_id=273898596750902&support_form_hidden_fields=%7B%22194851295145668%22%3Afalse%2C%22258738601593328%22%3A"+flag+"%7D&support_form_fact_false_fields=[]&__user="+uid+"&__a=1&__dyn=-&__csr=&__req=6&__hs=18924.BP%3ADEFAULT.2.0.0.0.&dpr=1&__ccg=GOOD&__rev=1004607876&__s=pnssk4%3A39i9cy%3Azjsula&__hsi=7022570742279676317-0&__comet_req=0&lsd=q9OTr74TsfDhr6yht5dUfI&__spin_r=1004607876&__spin_b=trunk&__spin_t=1635069575"
                })

                if (res.includes('view_details')) {
                    resolve()
                } else {
                    reject()
                }

            } catch {}

        })
    }

    da282() {
        
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.item.uid 
            const z = new zFetch(page)

            const $ = (selector) => {
                return new zQuery(page, selector)
            }

            try {

                const data = await z.get('https://mbasic.facebook.com')

                const $ = cheerio.load(data)

                const dtsg = $('form[action^="/checkpoint/1501092823525282/"] input[name="fb_dtsg"]').val()

                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__user="+uid+"&__a=1&__req=d&__hs=19591.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1008188232&__s=kn5ha7%3Aldjm7x%3A9wus2p&__hsi=7270198495251572741&__dyn=7xeXxa2C2O5U5O8G6EjBWo2nDwAxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0Z82_CwjE1xoswIK1Rw8G11xmfz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2swwwNwKxm5o2eUlwhE2Lx-0iS2CVEbUGdG1Jw9h08O321Lwqo5B0ooboaU6O1Fw9O&__csr=n3dWQTr_RDLpaHhCj-AAJWyHF2UOniEMSQiWzEPl12mQVEyuqcyorHV8jgy2SE6Wi4U2own89EGU4668-i1PwhE3mwMw4nwGwce0jG1wwRwaidw0i4E03kXw1kC3W1BxG32vmcxW048o1KUvGQ064E0W616w5-w6Pw69Cw2k4m02DiE9qHw0gafw0T9xq&__comet_req=15&fb_dtsg="+dtsg+"&jazoest=25332&lsd=rX4SvDCOKINrl8FqWHGbys&__spin_r=1008188232&__spin_b=trunk&__spin_t=1692724995&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22action%22%3A%22APPEAL_HACKED_DISABLED_OPTIONS_MENU%22%2C%22enrollment_id%22%3Anull%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=6871133792905834",
                })

                if (res.includes('"is_final":true')) {

                    await page.waitForTimeout(5000)

                    await page.goto('https://mbasic.facebook.com')

                    const url = await page.url()

                    if (url.includes('checkpoint/828281030927956')) {

                        resolve()

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
        })
    }

    khang956Api(message, page2 = false, oldEmail = false) {

        return new Promise(async (resolve, reject) => {
            const page = this.page
            const setting = this.setting
            const z = new zFetch(page)

            let khang956Success = false

            let email = ''
            let password = ''

            if (oldEmail) {

                const emailData = this.item.oldEmail.split('|')

                email = emailData[0]
                password = emailData[1]

            } else {

                email = this.item.email
                password = this.item.passMail

            }

            let newMail = false

            if (page2) {

                await page2.waitForSelector('[data-convid]')

                newMail = await page2.evaluate(() => {
                    const mailList = document.querySelectorAll('[data-convid]')

                    return mailList[0].getAttribute('data-convid')
                })
            }

            const html = await z.get('https://mbasic.facebook.com')
            const $ = cheerio.load(html)

            const url = $('a[href^="/x/checkpoint/828281030927956/stepper/?token="]').attr('href')
            
            if (url) {

                let html = await z.get('https://mbasic.facebook.com'+url)
                let $ = cheerio.load(html)

                const url10 = $('a[href^="/x/checkpoint/828281030927956/cp/intro/?token="]').attr('href')

                if (url10) {
                    
                    html = await z.get('https://mbasic.facebook.com'+url10)
                    $ = cheerio.load(html)

                    const url11 = $('a[href^="/x/checkpoint/828281030927956/change_password/?token="]').attr('href')

                    html = await z.get('https://mbasic.facebook.com'+url11)
                    $ = cheerio.load(html)

                    khang956Success = true
                    
                }

                const url2 = $('a[href^="/x/checkpoint/828281030927956/anti_scripting/?token="]').attr('href')

                if (url2) {

                    const html = await z.get('https://mbasic.facebook.com'+url2)
                    const $ = cheerio.load(html)

                    const captcha = $('img[src^="https://www.facebook.com/captcha/tfbimage/?captcha_challenge_code"]').attr('src')

                    let url3 = false
                    let dtsg = false

                    if (captcha) {

                        let captchaSuccess = false

                        message('Đang giải captcha')

                        await page.goto('https://mbasic.facebook.com'+url2)

                        for (let index = 0; index < 3; index++) {

                            if (index > 0) {
                                message('Đang thử giải lại captcha')
                            }
                        
                            try {

                                await page.waitForSelector('[name="code"]')

                                const captchaDiv = await page.$('img[src^="https://www.facebook.com/captcha/tfbimage/?captcha_challenge_code"]')

                                const captchaImage = await captchaDiv.screenshot({encoding: 'base64'})

                                const result = await resolveCaptchaImage(setting, captchaImage)

                                await page.type('[name="code"]', result)

                                await Promise.all([
                                    page.click('[type="submit"]'),
                                    page.waitForNavigation({
                                        waitUntil: 'networkidle0'
                                    })
                                ])

                                try {

                                    await page.waitForSelector('#type_code_error', {timeout: 2000})

                                } catch {

                                    captchaSuccess = true

                                    break
                                }

                            } catch {}

                        }

                        if (captchaSuccess) {

                            message('Giải captcha thành công')

                            const html = await page.content()
                            const $ = cheerio.load(html)

                            dtsg = $('input[name="fb_dtsg"]').val()
                            url3 = $('form[action^="/epsilon/select_challenge/async/?token="]').attr('action')

                        } else {

                            message('Giải captcha thất bại')

                            return reject()
                        }

                    } else {
                        dtsg = $('input[name="fb_dtsg"]').val()
                        url3 = $('form[action^="/epsilon/select_challenge/async/?token="]').attr('action')
                    }


                    if (url3) {

                        const html = await z.post('https://mbasic.facebook.com'+url3, {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "fb_dtsg="+dtsg+"&jazoest=25541&challenge=email_captcha",
                        })

                        const $ = cheerio.load(html)
                        const url4 = $('form[action^="/epsilon/sc/async/select/?token="]').attr('action')

                        const username = email.split('@')[0]

                        const start = username[0]
                        const end = username[username.length - 1]

                        let finalEmail = start

                        for (let index = 0; index < (username.length - 2); index++) {
                            finalEmail += '*'
                        }

                        let emailId = ''

                        $('label').each(function() {
                            if ($(this).text().includes(end)) {
                                emailId = $(this).find('input').val()
                            }
                        })

                        if (emailId) {

                            message('Đang chọn email')

                            if (url4) {

                                const html = await z.post("https://mbasic.facebook.com"+url4, {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                    },
                                    "body": "fb_dtsg="+dtsg+"&jazoest=25411&index="+emailId,
                                })

                                const $ = cheerio.load(html)
                                
                                let resend = $('input[formaction^="/epsilon/sc/async/resend_code/?token="]').attr('formaction')

                                let url5 = false

                                for (let index = 0; index < 4; index++) {
                                    
                                    const html = await z.post("https://mbasic.facebook.com"+resend, {
                                        "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": "fb_dtsg="+dtsg+"&jazoest=25765&code=&data="+emailId+"&resend=G%E1%BB%ADi+l%E1%BA%A1i+m%C3%A3",
                                    })

                                    const $ = cheerio.load(html)

                                    resend = $('input[formaction^="/epsilon/sc/async/resend_code/?token="]').attr('formaction')

                                    url5 = $('form[action^="/epsilon/sc/async/verify/?token="]').attr('action')

                                }

                                if (url5) {

                                    let code = false

                                    message('Đang chờ lấy mã kích hoạt')

                                    try {
                    
                                        if (page2) {

                                            code = await getCodeBrowser(page2, newMail)

                                        } else {

                                            await page.waitForTimeout(10000)

                                            const data = await getMailCode(email, password)
                                            code = data.code 

                                        }
                    
                                    } catch (err) {
                                        console.log(err)
                                    }

                                    if (code) {

                                        message('Đang nhập mã kích hoạt')

                                        const html = await z.post("https://mbasic.facebook.com"+url5, {
                                            "headers": {
                                                "content-type": "application/x-www-form-urlencoded",
                                            },
                                            "body": "fb_dtsg="+dtsg+"&jazoest=25302&code="+code+"&data="+emailId,
                                        })

                                        const $ = cheerio.load(html)

                                        const url6 = $('a[href^="/x/checkpoint/828281030927956/cp/intro/?token="]').attr('href')

                                        if (url6) {

                                            const html = await z.get('https://mbasic.facebook.com'+url6)

                                            const $ = cheerio.load(html)

                                            const selectMailUrl = $('a[href^="/x/checkpoint/828281030927956/cp/selection/?token="]').attr('href')

                                            let url7 = ''

                                            if (selectMailUrl) {

                                                const html = await z.get("https://mbasic.facebook.com"+selectMailUrl.replace('https://mbasic.facebook.com', ''))

                                                const $ = cheerio.load(html)

                                                url7 = $('input[formaction^="/x/checkpoint/828281030927956/change_password/?token="]').attr('formaction')

                                            } else {

                                                url7 = $('a[href^="/x/checkpoint/828281030927956/change_password/?token="]').attr('href')

                                            }

                                            if (url7) {

                                                const html = await z.get('https://mbasic.facebook.com'+url7)

                                                const $ = cheerio.load(html)

                                                const url8 = $('a[href^="/x/checkpoint/828281030927956/outro/?token="]').attr('href')

                                                if (url8) {

                                                    const html = await z.get('https://mbasic.facebook.com'+url8)

                                                    if (html.includes('/x/checkpoint/hacked_cleanup/')) {

                                                        khang956Success = true

                                                    }

                                                }


                                            }

                                        }

                                    }

                                }

                            }

                        } else {
                            message('Giải 956 thất bại: CP mail khác')
                            return reject('CP mail khác')
                        }

                    }

                }
                
            }

            if (khang956Success) {
                resolve()
            } else {

                message('Giải 956 thất bại')
                reject()
            }
            

        })
    }

    khang282Api(message) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const setting = this.setting
            const uid = this.item.uid
            const z = new zFetch(page)

            let khang282Success = false

            try {

                let html = await z.get('https://mbasic.facebook.com')
                let $ = cheerio.load(html)
                let dtsg = ''

                const replyStep = html.includes('action_acknowledge_hacked_disabled_review')

                if (replyStep) {

                    const url = $('form[action^="/checkpoint/1501092823525282/submit/"]').attr('action')
                    dtsg = $('input[name="fb_dtsg"]').val()

                    html = await z.post("https://mbasic.facebook.com"+url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25151&action_acknowledge_hacked_disabled_review=Ph%E1%BA%A3n+%C4%91%E1%BB%91i+quy%E1%BA%BFt+%C4%91%E1%BB%8Bnh",
                    })

                    $ = cheerio.load(html)

                }

                const gender = ['Male', 'Female'][Math.floor(Math.random() * 2)]

                let fullName = ''

                const introStep = html.includes('name="action_proceed"')

                if (introStep) {

                    const url = $('form[action^="/checkpoint/1501092823525282/submit/"]').attr('action')
                    dtsg = $('input[name="fb_dtsg"]').val()

                    fullName = $('.bd.be').text()

                    html = await z.post("https://mbasic.facebook.com"+url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25565&action_proceed=Kh%C3%A1ng+ngh%E1%BB%8B",
                    })

                }

                if (!fullName) {

                    const name = await randomName(gender)

                    fullName = name.ho+' '+name.ten
                }

                const textData = {
                    firstName: '',
                    lastName: '',
                    fullName,
                    birthday: randomNumberRange(1, 25)+'/'+randomNumberRange(1, 12)+'/'+randomNumberRange(1990, 2005),
                    gender,
                }

                const captchaStep = html.includes('captcha_persist_data')

                if (captchaStep) {

                    let captchaSuccess = false

                    message('Đang giải captcha')

                    await page.goto('https://mbasic.facebook.com')

                    for (let index = 0; index < 3; index++) {

                        if (index > 0) {
                            message('Đang thử giải lại captcha')
                        }
                        
                        try {

                            await page.waitForSelector('[name="captcha_response"]')

                            const captchaDiv = await page.$('img[src^="https://mbasic.facebook.com/captcha/tfbimage.php?captcha_challenge_code"]')

                            const captchaImage = await captchaDiv.screenshot({encoding: 'base64'})

                            const result = await resolveCaptchaImage(setting, captchaImage)

                            await page.type('[name="captcha_response"]', result)

                            await Promise.all([
                                page.click('[name="action_submit_bot_captcha_response"]'),
                                page.waitForNavigation({
                                    waitUntil: 'networkidle0'
                                })
                            ])

                            try {

                                await page.waitForSelector('[name="captcha_response"]', {timeout: 2000})

                            } catch {

                                captchaSuccess = true

                                break
                            }

                        } catch {}

                    }

                    if (captchaSuccess) {

                        message('Giải captcha thành công')

                        html = await page.content()

                    } else {

                        return reject('Giải captcha thất bại')
                    }

                }

                const codeStep = html.includes('name="code"')

                if (codeStep) {

                    $ = cheerio.load(html)
                    const url = $('form[action^="/checkpoint/1501092823525282/submit/"]').attr('action')
                    dtsg = $('input[name="fb_dtsg"]').val()

                    html = await z.post("https://mbasic.facebook.com"+url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25529&action_unset_contact_point=%C4%90%E1%BB%95i+s%E1%BB%91+di+%C4%91%E1%BB%99ng",
                    })
                    
                }

                const changePhoneStep = html.includes('name="contact_point_index"')

                if (changePhoneStep) {

                    $ = cheerio.load(html)
                    const url = $('form[action^="/checkpoint/1501092823525282/submit/"]').attr('action')
                    dtsg = $('input[name="fb_dtsg"]').val()


                    html = await z.post("https://mbasic.facebook.com"+url, {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=25418&contact_point_index=0&action_use_different_phone=Th%C3%AAm+s%E1%BB%91+m%E1%BB%9Bi",
                    })

                }

                const phoneStep = html.includes('name="contact_point"')
                
                if (phoneStep) {

                    let phoneStepSuccess = false

                    for (let index = 0; index < 6; index++) {

                        let addPhoneSuccess = false

                        let phone = false
                        let country = 'VN'

                        for (let index = 0; index < 6; index++) {

                            if (index > 0) {
                                message('Đang thử lấy số điện thoại khác')
                            } else {
                                message('Đang lấy số điện thoại')
                            }

                            try {

                                let $ = cheerio.load(html)

                                const url = $('form[action^="/checkpoint/1501092823525282/submit/"]').attr('action')
                                dtsg = $('input[name="fb_dtsg"]').val()

                                phone = await getPhone(setting.phoneService.value, setting.phoneServiceKey.value, this.proxy)
                                
                                message('Đang nhập số điện thoại')

                                html = await z.post("https://mbasic.facebook.com"+url, {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                    },
                                    "body": "fb_dtsg="+dtsg+"&jazoest=25580&country_code="+country+"&contact_point="+phone.number+"&action_set_contact_point=G%E1%BB%ADi+qua+SMS",
                                })

                                if (html.includes('name="code"')) {

                                    addPhoneSuccess = true
                                    break
                                } else {
                                    await deletePhone(phone.id, setting.phoneServiceKey.value)
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

                            } catch (err){
                                console.log(err)
                            }

                        }

                        if (addPhoneSuccess && phone) {

                            $ = cheerio.load(html)
                            const url = $('form[action^="/checkpoint/1501092823525282/submit/"]').attr('action')

                            try {

                                message('Đang chờ lấy mã kích hoạt')

                                const code = await getPhoneCode(setting.phoneService.value, setting.phoneServiceKey.value, phone.id, this.proxy)

                                message('Đang nhập mã kích hoạt')

                                html = await z.post("https://mbasic.facebook.com"+url, {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                    },
                                    "body": "fb_dtsg="+dtsg+"&jazoest=25819&code="+code+"&action_submit_code=Ti%E1%BA%BFp+t%E1%BB%A5c",
                                })

                                if (!html.includes('name="code"')) {
                                    
                                    phoneStepSuccess = true

                                    break

                                } else {

                                    html = await z.post("https://mbasic.facebook.com"+url, {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": "fb_dtsg="+dtsg+"&jazoest=25529&action_unset_contact_point=%C4%90%E1%BB%95i+s%E1%BB%91+di+%C4%91%E1%BB%99ng",
                                    })

                                }

                            } catch (err) {

                                console.log(err)
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

                        message('Thêm số điện thoại thành công')

                    } else {

                        await deletePhone(phone.id, setting.phoneServiceKey.value)

                        return reject('Thêm số điện thoại thất bại')
                    }

                }

                const doneStep = html.includes('name="action_proceed"')

                if (doneStep) {

                    khang282Success = true

                }

                const imageStep = html.includes('mobile_image_data')

                if (imageStep) {

                    $ = cheerio.load(html)
                    const url = $('form[action^="/checkpoint/1501092823525282/submit/"]').attr('action')
                    dtsg = $('input[name="fb_dtsg"]').val()

                    const dest = path.resolve(app.getPath('userData'), 'card/'+uid+'.png')

                    if (!fs.existsSync(dest)) {

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

                    message('Đang upload phôi')

                    const size = (await fs.promises.stat(dest)).size
                    const content = await fs.promises.readFile(dest)
                    const mimeD = mime.getType(dest)
                    const name = path.basename(dest)

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
                            "body": "av="+uid+"&__user="+uid+"&__a=1&__req=e&__hs=19655.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009458673&__s=byv8pl%3A8sru6z%3Aeszk7s&__hsi=7293741220481695645&__dyn=7xeXxa1mxu1syaxG4VuC0BVU98nwgU29zEdE98K360CEboG0IE6u3y4o2Gwfi0LVE4W0om78bbwto2awgolzUO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0D888cobElxm0zK5o4q0HUvw4JwFKq2-azqwro2kg2cwMwrU6C1pg661pwr86C0D8a8&__csr=gNJq9PqtqmSJBqm8iDFarGBvgyaAKHiGnHAiyaJrmBLzHypF8xp8WUgxCcCwKCxS13yElwSUb826wiU2dw-UWGwhUuw48yUjxu2-0e1whU4e08ew68wce542a1SwIwkXytodUyq9w3CbAw6cwce00ZCU0cjU0nKw0C7w2580b181Ip8kG6o02l7w&__comet_req=15&fb_dtsg="+dtsg+"&jazoest=25433&lsd=csmZYxdqObxmkoLv-U2iYx&__spin_r=1009458673&__spin_b=trunk&__spin_t=1698206463&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22action%22%3A%22UPLOAD_IMAGE%22%2C%22image_upload_handle%22%3A%22"+data.h+"%22%2C%22enrollment_id%22%3Anull%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=6666736803373295",
                        })

                        if (res.includes('{"ufac_client":{"id"')) {

                            khang282Success = true

                        } else {

                            message('Mở khóa 282 thất bại')

                            return reject()

                        }

                    } else {

                        return reject('Upload phôi thất bại')
                    }

                }

            } catch (err) {

                console.log(err)

                return reject()
            }

            if (khang282Success) {
                return resolve()
            } else {
                return reject()
            }

        })
    }

    moCheckPointMail2(message, page2 = false) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const email = this.item.email 
            const passMail = this.item.passMail
            const z = new zFetch(page)

            try {

                let newMail = false

                let moCpSuccess = false

                if (page2) {

                    await page2.waitForSelector('[data-convid]')

                    newMail = await page2.evaluate(() => {
                        const mailList = document.querySelectorAll('[data-convid]')

                        return mailList[0].getAttribute('data-convid')
                    })
                }

                let html = await z.get('https://mbasic.facebook.com/checkpoint/?next')
                let $ = cheerio.load(html)

                let dtsg = $('input[name="fb_dtsg"]').val()
                let nh = $('input[name="nh"]').val()

                html = await z.post("https://mbasic.facebook.com/login/checkpoint/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "fb_dtsg="+dtsg+"&jazoest=2830&checkpoint_data=&verification_method=37&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=2830",
                })

                $ = cheerio.load(html)

                dtsg = $('input[name="fb_dtsg"]').val()
                nh = $('input[name="nh"]').val()

                const username = email.split('@')[0]
                const domain = '@' + email.split('@')[1]
                const start = username[0]
                const end = username[username.length - 1]

                let finalEmail = start

                for (let index = 0; index < (username.length - 2); index++) {
                    finalEmail += '*'
                }

                finalEmail += end + domain
                
                const mainEmail = $('#eindex option[value="'+finalEmail+'"]').val()

                if (mainEmail) {

                    html = await z.post("https://mbasic.facebook.com/login/checkpoint/", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "fb_dtsg="+dtsg+"&jazoest=2883&checkpoint_data=&send_code=1&eindex="+mainEmail+"&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=2883",
                    })

                    if (html.includes('name="captcha_response"')) {

                        message('Đang chờ mã xác nhận')

                        $ = cheerio.load(html)
                        dtsg = $('input[name="fb_dtsg"]').val()
                        nh = $('input[name="nh"]').val()

                        let code = false

                        try {

                            if (page2) {

                                code = await getCodeBrowser(page2, newMail)

                            } else {

                                await page.waitForTimeout(10000)

                                const data = await getMailCode(email, passMail)
                                code = data.code 

                            }

                        } catch {}

                        if (code) {

                            message('Đang nhập mã kích hoạt')
                            
                            html = await z.post("https://mbasic.facebook.com/login/checkpoint/", {
                                "headers": {
                                  "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "fb_dtsg="+dtsg+"&jazoest=2864&checkpoint_data=&captcha_response="+code+"&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=2864",
                            })

                            if (html.includes('submit[Yes]')) {

                                message('Nhập mã kích hoạt thành công')

                                $ = cheerio.load(html)
                                dtsg = $('input[name="fb_dtsg"]').val()
                                nh = $('input[name="nh"]').val()

                                html = await z.post("https://mbasic.facebook.com/login/checkpoint/", {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                    },
                                    "body": "fb_dtsg="+dtsg+"&jazoest=2952&checkpoint_data=&submit%5BYes%5D=C%C3%B3&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=2952",
                                })

                                if (html.includes('submit[Continue]')) {

                                    html = await z.post("https://mbasic.facebook.com/login/checkpoint/", {
                                        "headers": {
                                            "content-type": "application/x-www-form-urlencoded",
                                        },
                                        "body": "fb_dtsg="+dtsg+"&jazoest=2946&checkpoint_data=&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=2946",
                                    })

                                    if (html.includes('name="password_new"')) {

                                        $ = cheerio.load(html)
                                        dtsg = $('input[name="fb_dtsg"]').val()
                                        nh = $('input[name="nh"]').val()

                                        message('Đang đổi mật khẩu')

                                        const password = 'A@!'+generator.generate({
                                            length: 10,
                                            numbers: true
                                        })

                                        html = await z.post("https://mbasic.facebook.com/login/checkpoint/", {
                                            "headers": {
                                                "content-type": "application/x-www-form-urlencoded",
                                            },
                                            "body": "fb_dtsg="+dtsg+"&jazoest=2946&checkpoint_data=&password_new="+encodeURIComponent(password)+"&submit%5BNext%5D=Ti%E1%BA%BFp&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=2946",
                                        })

                                        if (html.includes('submit[Continue]')) {

                                            message('Đổi mật khẩu thành công')

                                            $ = cheerio.load(html)
                                            dtsg = $('input[name="fb_dtsg"]').val()
                                            nh = $('input[name="nh"]').val()

                                            await z.post("https://mbasic.facebook.com/login/checkpoint/", {
                                                "headers": {
                                                    "content-type": "application/x-www-form-urlencoded",
                                                },
                                                "body": "fb_dtsg="+dtsg+"&jazoest=2946&checkpoint_data=&submit%5BContinue%5D=Ti%E1%BA%BFp+t%E1%BB%A5c&nh="+nh+"&fb_dtsg="+dtsg+"&jazoest=2946",
                                            })

                                            moCpSuccess = true

                                            return resolve(password)

                                        }

                                    }

                                }

                                if (!moCpSuccess) {

                                    message('Mở CP mail thất bại')
                                    return reject()

                                }

                            } else {

                                message('Mở CP mail thất bại: Mã kích hoạt không đúng')

                                return reject()
                            }
                            
                        } else {
                            message('Mở CP mail thất bại: Không nhận được mã kích hoạt')

                            return reject()
                        }

                    } else {

                        message('Mở CP mail thất bại')

                        return reject()
                    }


                } else {

                    message('Mở CP mail thất bại: CP mail khác')

                    return reject()

                }


            } catch (err) {

                console.log(err)

                message('Mở CP mail thất bại')

                return reject()
            }

        })
    }

}


module.exports = Xmdt