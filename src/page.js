const moment = require('moment')
const {randomNumberRange, capitalizeFLetter} = require('./core.js')
const cheerio = require('cheerio')
const {zFetch} = require('./zquery.js')
const Db = require('./db.js')
const fs = require('fs')
const { app } = require('electron')
const path = require('path')

class Page {

    constructor (page, item, dtsg, accessToken, lsd, setting = false) {
        this.page = page
        this.setting = setting
        this.item = item
        this.dtsg = dtsg
        this.lsd = lsd
        this.accessToken = accessToken
    }

    createPage(name, format = true) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const uid = this.item.uid
            const dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                let pageName = name

                if (format) {
                    pageName = capitalizeFLetter(name+" "+randomNumberRange(11111, 99999))
                }

                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__user="+uid+"&__a=1&__req=1v&__hs=19694.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010174206&__s=zgpvzb%3A8cqk4o%3A8gvuf9&__hsi=7308188588785296006&__dyn=7AzHK4HzE4e5Q1ryaxG4Vp62-m1xDwAxu13wFwhUngS3q5UObwNwnof8boG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswIK1Rwwwg8a8465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwOzEjUlDw-wUwxwjFovUy2a1ywtUuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWw-zXDzU&__csr=gacagBmDE9hthJN4jQB6NT5Os_6Av7nR4IZft4RSAXAjeGOrRtmKmhHQkDWWVBhdeQhd9pumfJ2J4_gyfGymiKHKj-W8rDK-QicCy6mnh995zfZ1iiEHDWyt4JpaCAG2WehemGG8hECudmcxt5z8gBCByk9zEuDJ4hHhA48yh5WDwCxh6xe6uUGGz4EyEaoKuFUkCy9eaLCwywMUnhp9FQm3GA6VU8oix-q26kwhwVyo5Hy8oQi4obpV8cEgzFGwge3yexpzEtwm8gwNxa1RwCyVoS0PU8U1krwfm0he0A83EwbO0Eyw4sw8-16whqg31yaQ1aw8Si0gF0Yw28j06gwrU0Fa0nu020i030m0cZU0now0ac-08kDyo1j84Nk1koyeo1p80AC0h-04Z80uug0za08ew3pE5u2e2mnEM1yA1Rw2Co1vHw2sogw1hm4S13zEao0H603xC0ty4oiwiFE21w15W08nwn8EUeC5UPDw2zu16w&__comet_req=15&fb_dtsg="+dtsg+"&jazoest=25563&lsd=R1sWlP5eu_-q_qVd0jpuf1&__aaid=0&__spin_r=1010174206&__spin_b=trunk&__spin_t=1701570253&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AdditionalProfilePlusCreationMutation&variables=%7B%22input%22%3A%7B%22bio%22%3A%22%22%2C%22categories%22%3A%5B%222705%22%5D%2C%22creation_source%22%3A%22comet%22%2C%22name%22%3A%22"+encodeURIComponent(pageName)+"%22%2C%22page_referrer%22%3A%22launch_point%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%223%22%7D%7D&server_timestamps=true&doc_id=5296879960418435",
                })

                if (res.includes('"page":{"id":"')) {

                    const data = JSON.parse(res)

                    resolve(data.data.additional_profile_plus_create.page.id)
                    
                } else {
                    reject('cccc')
                }

            } catch (err) {
                reject(err)
            }

        })
    }

    checkPage() {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const uid = this.item.uid
            const dtsg = this.dtsg
            const accessToken = this.accessToken

            let pageData = []

            try {

                const res = await page.evaluate(async (accessToken) => {

                    const res = await fetch("https://graph.facebook.com/me/accounts?type=page&fields=id,birthday,name,likes,is_published,business&access_token="+accessToken+"&limit=999")
                    
                    return await res.json()

                }, accessToken)

                const pages = res.data.map(item => item.id)

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

                    const res2 = await page.evaluate(async (uid, dtsg, id) => {
                        const res = await fetch("https://www.facebook.com/api/graphql/", {
                            "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "av="+uid+"&__user="+uid+"&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lwqp8aE4KeCK2q362u1dxW10w8mu&__csr=&fb_dtsg="+dtsg+"&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6228297077225495",
                            "method": "POST",
                        })

                        return await res.json()
                    }, uid, dtsg, id)

                    if (res2.data.pageData.advertising_restriction_info.status === 'APPEAL_REJECTED_NO_RETRY') {
                        status = 'Hạn chế vĩnh viễn'
                    }

                    if (res2.data.pageData.advertising_restriction_info.status === 'VANILLA_RESTRICTED') {
                        status = 'Cần kháng'
                    }

                    if (res2.data.pageData.advertising_restriction_info.status === 'APPEAL_PENDING') {
                        status = 'Đang kháng'
                    }
    
                    if (res2.data.pageData.advertising_restriction_info.status === 'NOT_RESTRICTED') {
                        status = 'Live'
                    }
    
                    if (res2.data.pageData.advertising_restriction_info.restriction_type === 'BI_IMPERSONATION') {
                        status = 'XMDT'
                    }
    
                    if (!res2.data.pageData.advertising_restriction_info.is_restricted && res2.data.pageData.advertising_restriction_info.restriction_type === 'ALE') {
                        status = 'Page kháng'
                    }
        
                    data.push({
                        id,
                        status,
                        liveStream,
                    })

                    await page.waitForTimeout(3000)
                    
                }

                pageData = data

            } catch (err) {
                console.log(err)
            }

            resolve(pageData)

        })
    }

    checkPage2() {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const uid = this.item.uid
            const dtsg = this.dtsg
            const accessToken = this.accessToken

            try {

                const res = await page.evaluate(async (accessToken) => {

                    const res = await fetch("https://graph.facebook.com/me/accounts?type=page&fields=id,birthday,name,likes,is_published,business&access_token="+accessToken+"&limit=150")
                    
                    return await res.json()

                }, accessToken)

                const pages = []

                let createTime = ''

                for (let index = 0; index < res.data.length; index++) {

                    const item = res.data[index]

                    let status = ''

                    const pageId = item.id

                    const res2 = await page.evaluate(async (uid, dtsg, pageId) => {
                        const res = await fetch("https://www.facebook.com/api/graphql/", {
                            "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "av="+uid+"&__user="+uid+"&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lwqp8aE4KeCK2q362u1dxW10w8mu&__csr=&fb_dtsg="+dtsg+"&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+pageId+"%22%7D&server_timestamps=true&doc_id=6228297077225495",
                            "method": "POST",
                        })

                        return await res.json()
                    }, uid, dtsg, pageId)

                    try {

                        const res3 = await page.evaluate(async (pageId, accessToken) => {

                            const res = await fetch("https://graph.facebook.com/graphql?q=nodes("+pageId+")%7Bregistration_time,friends%7Bcount%7D%7D&access_token="+accessToken)
                            
                            return await res.json()
        
                        }, pageId, accessToken)


                        createTime = moment.unix(res3[pageId].registration_time).format("DD/MM/YYYY")

                    } catch {}

                    if (res2.data.pageData.advertising_restriction_info.status === 'APPEAL_REJECTED_NO_RETRY') {
                        status = 'Hạn chế vĩnh viễn'
                    }

                    if (res2.data.pageData.advertising_restriction_info.status === 'VANILLA_RESTRICTED') {
                        status = 'Cần kháng'
                    }

                    if (res2.data.pageData.advertising_restriction_info.status === 'APPEAL_PENDING') {
                        status = 'Kháng treo'
                    }

                    if (res2.data.pageData.advertising_restriction_info.status === 'NOT_RESTRICTED') {
                        status = 'Live'
                    }

                    if (res2.data.pageData.advertising_restriction_info.restriction_type === 'BI_IMPERSONATION') {
                        status = 'XMDT'
                    }
        
                    pages.push({
                        likes: item.likes,
                        createTime,
                        name: item.name,
                        id: item.id,
                        status
                    })

                    await page.waitForTimeout(3000)
                    
                }

                resolve(pages)

            } catch (err) {

                console.log(err)

                reject(err)
            }

        })
    }

    deleteWhatsApp (id, id2, pageData) {
        return new Promise(async (resolve, reject) => {

            const z = new zFetch(this.page)

            try {

                const data = await z.get('https://www.facebook.com/settings?tab=linked_whatsapp', {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    }
                })

                if (data.includes('"verified_whatsapp_numbers":{"nodes":')) {

                    const numbers = JSON.parse(((data.split('"verified_whatsapp_numbers":{"nodes":'))[1].split('},"page_type_name_for_content"'))[0])

                    for (let index = 0; index < numbers.length; index++) {
                        
                        try {

                            const res = await z.post("https://www.facebook.com/api/graphql/", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "av="+id+"&__user="+id+"&__a=1&__req=d&__hs=19721.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010612927&__s=jw5smg%3A5qjfza%3Akd5j0f&__hsi=7318325146399108680&__dyn=7AzHxqU5a5Q1ryUbFp60BVU98nwgUao5-ewSwMwNwnof8bo19oe8hw2nVEtwMw65xO2O1Vwwwqo465o-cwfG1Rx62G5Usw9m1YwBgK7o884y0Mo2sx-3m1mzXw8W58jwGzE8FU766FobrwKxm5o7G4-5o4q3y1MBx_wHwdG7FobpEbUGdG0HE5d08O321LwTwNxe6Uak1xwJwxyo6O1FwgUjwOwWyU4aVU8E&__csr=glMBbd4sGiFEAzhAWCrLAh8SBVuch6iayaABoKKryeLxa-VlAoCmqHglJxCaCVlyax2QbxydxS9xfBxuayUZ0LxSunK58mxi8wDBxaECcK2q2e222u8wWK6oaA5ES2-2S1Kwmo5S18G16g5i8wUwEwNw-wyg3Aw04B_w0p3o0jpwcZ0Vw0rpU1SUK2e07jEd809So0Y6E0mvw0Bby8ydw6zwno&__comet_req=1&fb_dtsg="+pageData.dtsg+"&lsd=l19sxq246wwM7SA_L0ZwBz&__aaid=0&__spin_r=1010612927&__spin_b=trunk&__spin_t=1703930354&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusSettingsWhatsAppDisconnectNumberDialog_DisconnectWhatsAppMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22"+id+"%22%2C%22selected_number_to_remove%22%3A%22"+numbers[index].raw_whatsapp_number+"%22%7D%7D&server_timestamps=true&doc_id=6842520052466138",
                            })

                            if (res.includes('"delegate_page_id"')) {

                            }

                        } catch {

                        }
                        
                        await this.page.waitForTimeout(1000)
                    }

                }

                resolve()

            } catch (err) {
                console.log(err)
                reject()
            }
        })
    }

    getPage () {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const accessToken = this.accessToken

            try {
    
                const data = await page.evaluate(async (accessToken) => {
                    const pageFetch = await fetch('https://graph.facebook.com/me/accounts?type=page&limit=999&fields=additional_profile_id,id,likes,followers_count,name,page_created_time&access_token='+accessToken)
                    return await pageFetch.json()
                }, accessToken)
        
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

    switchPage(id) {

        return new Promise(async (resolve, reject) => {

            const page = this.page
            const dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                let uid = this.item.uid
                
                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__user="+uid+"&__a=1&__req=s&__hs=19695.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010180241&__s=j7uuyl%3A6c1wke%3Aw5sx8z&__hsi=7308670430050517750&__dyn=7AzHK4HzE4e5Q1ryaxG4Vp62-m1xDwAxu13wFwhUngS3q5UObwNwnof8boG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswIK1Rwwwg8a8465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwOzEjUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWw-zXDzU&__csr=gF0xMD8ynnNGbbfsj8DdIgIp9EOYjiFlkAy8yZOmliBWmKD54vl49nA99V4neFuJa4K_OaDAGGWh2bQbWAgPh4WlbhULALRByJ6UCiludG44ui8AJ34ibhFUV5hZ6y-eDpKE-8Km9gJfg9lhWyEG2m8oil7CyXx24ohG8DBy8lChUiZaqicy8yq5Q2rGEtyoSaCyoG7mEnFoy6ojCxW6UWdxa49may8G2-i7pSU9K6EgCz9UoBxGE-6pWDxa8wEFpEGm7uaz8qwKwq89EW3q1oDw8mu5FEcohy84mELU3eAwoU2pwrU13A1iw6ZwcF3o3R81zxO320Ie0ha3u1hw3ZU3Rw0WKw2QU0pXDw1be01Zew0Tjw7MUeU3dw30E7u0rGm7uq0HE3RwLg6a16w34EeWaE1B80xS09CCCggw3Sojw6sw1cG04JU1rVU6u07020f603lO2hw66w1ki1Bg4G04Vohw7MxJK4N2Aw&__comet_req=15&fb_dtsg="+dtsg+"&jazoest=25310&lsd=Y8ckWEU0tarlQQcAPUIOHF&__aaid=0&__spin_r=1010180241&__spin_b=trunk&__spin_t=1701682440&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometProfileSwitchMutation&variables=%7B%22profile_id%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=7240611932633722",
                })

                if (res.includes('errors') && res.includes('description')) {

                    const data = JSON.parse(res)

                    return reject(data.errors[0].description)

                }

                if (res.includes('profile_switcher_comet_login')) {
                    resolve()
                } else {
                    reject()
                }

            } catch (err) {
                reject()
            }
        })
    }

    switchToMain() {
        return new Promise(async (resolve, reject) => {

            const dtsg = this.dtsg
            const z = new zFetch(this.page)

            try {

                await z.post("https://www.facebook.com/forced_account_switch", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "jazoest=25649&fb_dtsg="+dtsg,
                })

                const cookies = await this.page.cookies()

                const iUser = cookies.filter(item => item.name === 'i_user')

                if (iUser[0]) {
                    reject()
                } else {
                    resolve()
                }

            } catch {
                reject()
            }
        })
    }

    sharePage(pageId, target, pageData) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const z = new zFetch(page)

            try {

                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+pageId+"&__user="+pageId+"&__a=1&__req=g&__hs=19697.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1010231448&__s=zvjw9u%3Ajgblij%3Ah6vy63&__hsi=7309320928293449979&__dyn=7AzHxqUW13xt0mUyEqxemhwLBwopU98nwgUao4u5QdwSxucyUco5S3O2Saw8i2S1DwUx609vCxS320om78bbwto88422y11xmfz83WwtohwGxu782lwv89kbxS2218wc60D8vwRwlE-U2exi4UaEW2au1NxGm2SUbElxm3y3aexfxm16wUws9ovUy2a0SEuBwJCwLyESE2KwwwOg2cwMwrUdUcojxK2B0oobo8oC1Iwqo4e4UcEeEfE-VU&__csr=g9X10x5N7mJ5STnrASKHF4SZRtH88KheiqprWy9VqV8RaGhaKmryqhaAXHy8SjigzV5GXWB-F6i8CCAz9VFUrQGV8qKbV8KqeJ5AFa5ohmJ2e8xjG4A54t5GiqcDG7EjUmCyFoS48OcyoshkV8tXV8OummQayEhxq15xyu8z88Ehho8UjyUiwJxqdzEdZ12bKcwEzU4O3h3pEW5UrxS7UkBw9Sm2qaiy8qwHwDx64e8x-58fU9Ai4aw8K58K4E9axS8x2axW7Eao6K19Cwep0Gwko8Xw5-U0gmxei036q0Y80yu0UE0ajo020Gw0NTw3XU09Io3tw8-1jw4rw2-U2qo6K0fTo-2h020U0eBo1wS8xGyPwoQ1BU2wwby0Fo0FV016ulw5xF0ei0fLwrE6i0w9oB0Xw9m09GwcC08pw4H8it3o0vgw&__comet_req=1&fb_dtsg="+pageData.dtsg+"&jazoest=25639&lsd=O8kC1RCTsys6PG356SZQnQ&__aaid=0&__spin_r=1010231448&__spin_b=trunk&__spin_t=1701833896&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusCoreAppAdminInviteMutation&variables=%7B%22input%22%3A%7B%22additional_profile_id%22%3A%22"+pageId+"%22%2C%22admin_id%22%3A%22"+target+"%22%2C%22admin_visibility%22%3A%22Unspecified%22%2C%22grant_full_control%22%3Atrue%2C%22actor_id%22%3A%22"+pageId+"%22%2C%22client_mutation_id%22%3A%222%22%7D%7D&server_timestamps=true&doc_id=5707097792725637",
                })

                if (res.includes('errors') && res.includes('description')) {

                    const data = JSON.parse(res)

                    return reject(data.errors[0].description)

                }

                const idMatch = res.match(/(?<=\"profile_admin_invite_id\":\")[^\"]*/g)

                if (idMatch[0]) {

                    resolve(idMatch[0])

                } else {

                    reject()
                }

            } catch (err) {
                console.log(err)
                reject()
            }
        })
    }

    getPageData(id) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const uid = this.item.uid
            const accessToken = this.accessToken
            const z = new zFetch(page)

            try {

                const res = await z.get('https://graph.facebook.com/'+uid+'/accounts?access_token='+accessToken)

                const pageData = (res.data.filter(item => item.id == id))[0]

                const html = await z.get('https://www.facebook.com/settings?tab=profile&section=name&view')

                const dtsgMatch = html.match(/(?<=\"token\":\")[^\"]*/g).filter(item => item.startsWith('NA'))

                if (pageData.access_token && dtsgMatch[0]) {
                    resolve({
                        token: pageData.access_token,
                        dtsg: dtsgMatch[0]
                    })
                } else {
                    reject()
                }

            } catch (err) {
                reject(err)
            }

        })
    }

    renamePage(id, name, pageData) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const password = this.item.password
            const accessToken = this.accessToken
            const z = new zFetch(page)

            try {

                const pageName = name+" "+randomNumberRange('00000', '99999')

                await z.post("https://www.facebook.com/ajax/settings/account/name.php", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "cquick_token="+pageData.token+"&ctarget=https%3A%2F%2Fwww.facebook.com&cquick=jsc_c_1&jazoest=25374&fb_dtsg="+pageData.dtsg+"&save_password="+encodeURIComponent(password)+"&pseudonymous_name="+encodeURIComponent(pageName)+"&__user="+id+"&__a=1&__req=4&__hs=19695.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010180631&__s=%3Aut7rwf%3Akoqxot&__hsi=7308682028817560329&__dyn=7xu5Fo4OQ1PyUbAihwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3BwbC0LVE4W0y8460KEswIwuo5-2G1Qw5Mx61vwnE2PwOxS2218w5uwaO0OU3mwkE5G0zE5W0HUvw6ixy0gq0Lo6-1FwbO0NE1rE&__csr=&lsd=HsqF1vTumyjXb6g7r3sn5v&__spin_r=1010180631&__spin_b=trunk&__spin_t=1701685141",
                })

                const res2 = await z.get('https://graph.facebook.com/'+id+'/?fields=name&access_token='+accessToken)

                if (res2.name === pageName) {
                    resolve()
                } else {
                    reject()
                }

            
            } catch (err) {

                reject()
            }

        })
    }

    removeAdmin(id, admin, pageData) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const password = this.item.password
            const accessToken = this.accessToken
            const z = new zFetch(page)

            try {

                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+id+"&__user="+id+"&__a=1&__req=i&__hs=19710.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=UNKNOWN&__rev=1010492885&__s=jyjaqa%3Aaxhed1%3Adst9x5&__hsi=7314133112040368991&__dyn=7AzHxqU5a5Q1ryUbFp60BVU98nwgUao5-ewSwMwNw9G2S0im3y4o0B-q7oc81xoswIwuo886C11xmfz83WwtohwGxu782lwv89kbxS2218wc60D8vwRwlE-U2exi4UaEW2G1NxGm2SUbElxm1Wxfxm16wUws9ovUaU3VBwJCwLyESE2KwkQ0z8c86-3u364UrwFg662S269wr86C13xe3a3G1eKu2a&__csr=gkh4Itk8l4h3QCJuWFcH8i_mXGCKuhpaQqvyVECRVGGEqWyeiiVbyul0wBBuudm498ZoTDzoGbAz9osxaq9oBG2qVubyojwiUymbypWF12ehAEa8W4FUhwg8-8xGVEgxi2OawpKq48Cq16wIwYwrUkxu6opxW1Ixq0I8mz8px61gwRwLwaq1ZK00oEu0eOwdS01L7w6XwnEgw1Jq1UwVw0Elw2h60fqw1Ty0bOw9-9o0Ee&__comet_req=1&fb_dtsg="+pageData.dtsg+"&jazoest=25687&lsd=SO-afpHuRosZ_2NHQUZ7_8&__aaid=0&__spin_r=1010492885&__spin_b=trunk&__spin_t=1702954320&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusRemoveCoreAppAdminMutation&variables=%7B%22input%22%3A%7B%22additional_profile_id%22%3A%22"+id+"%22%2C%22admin_id%22%3A%22"+admin+"%22%2C%22grant_full_control%22%3Afalse%2C%22actor_id%22%3A%22"+id+"%22%2C%22client_mutation_id%22%3A%222%22%7D%7D&server_timestamps=true&doc_id=9529441547128945",
                })

                if (res.includes('errors') && res.includes('description')) {

                    const data = JSON.parse(res)

                    return reject(data.errors[0].description)

                }

                if (res.includes(id)) {
                    resolve()
                } else {
                    reject()
                }

            
            } catch (err) {

                reject()
            }

        })
    }

    checkBm(id) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const dtsg = this.dtsg
            const uid = this.item.uid
            const z = new zFetch(page)

            try {

                const res = await z.post("https://business.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "__user="+uid+"&__a=1&__req=9&__hs=19697.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010226213&__s=zges90%3A8smxem%3A3wstnd&__hsi=7309285553690587366&__dyn=7xeUmxa2C5rgydwn8K2abBAqxu59o9E4a2i5VGxK5FEG12xK4UKegdp98Sm4Euxa1tx-ezobo9E7C1FxG9y8Gdz8hw9-3a4EuCwQwCxq1zwCCwjFEK2ZedwLBGEpg9BwZyXwZwu8swEK2y5oeE9oeUa8fGxnzoO1Wxu0zoO12ypUuwg88EeAUpK1vDwyCwBgaohzE4y3m2y1bxq1yxJxK48GU8EhAy88rwzzXx-ewjoiz9EjCx6221cwjV8rxefzobEaUiwm8Wubwk8Sp1G3WcyU98-5aDBwEBwKG3qcy85i4oKqbDyo-2-qaUK2e0UFU6K19wrUgU5qiU9E4KeCK2q1pwjouxK2i2y1swau&__csr=&fb_dtsg="+dtsg+"&jazoest=25427&lsd=rZbXuF_2IXr1eiey7qFLOd&__aaid=0&__bid="+id+"&__spin_r=1010226213&__spin_b=trunk&__spin_t=1701825660&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BusinessConnectedPeoplePaneBrandQuery&server_timestamps=true&variables=%7B%22businessID%22%3A%22"+id+"%22%7D&doc_id=6232452256824456",
                })

                if (res.includes('num_permitted_and_invited_business_user')) {
                    resolve()
                } else {
                    reject()
                }

            } catch {
                reject()
            }
        })
    }

    addPage(bm, pageId, token) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const z = new zFetch(page)

            try {

                const res = await z.post("https://graph.facebook.com/v17.0/"+bm+"/owned_pages?access_token="+token+"&__cppo=1", {
                    "headers": {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Fowned_pages&_reqSrc=PageActions.brands&access_type=OWNER&code=&entry_point=business_manager_settings_pages&ig_password=&locale=vi_VN&method=post&page_id="+pageId+"&pretty=0&suppress_http_code=1&xref=f2dd4a195373478",
                })

                if (res.access_status === "CONFIRMED") {
                    resolve()
                } else {
                    reject()
                }

            } catch {
                reject()
            }
        })
    }

    getPageAdmin(id, data) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const z = new zFetch(page)

            try {

                const res = await z.get("https://www.facebook.com/settings?tab=profile_access", {
                    "headers": {
                      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    },
                })

                const data = JSON.parse(((res.split('"core_app_admins_for_additional_profile":'))[1].split(',"outgoing_core_app_admin_invites"'))[0]).edges.map(item => item.node.admin_profile)

                resolve(data)


            } catch (err) {

                console.log(err)

                reject(err)
            }
        })
    }

    khangPage(id, line, reason) {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const uid = this.item.uid
            const dtsg = this.dtsg
            const z = new zFetch(page)

            try {

                const chooseArr = ['policy', 'unauthorized_use', 'other']

                const chooseNumber = {
                    policy: 1,
                    unauthorized_use: 2,
                    other: 3
                }

                const randomChoose = chooseArr[Math.floor(Math.random() * chooseArr.length)]

                const chooseValue = line === 'random' ? randomChoose : line

                const reasonText = chooseValue !== 'other' ? "I'm not sure which policy was violated." : reason

                const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=1", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+uid+"&__usid=6-Ts61te17u7ia%3APs61tgf1m93yf1%3A0-As61t711bl84kk-RV%3D6%3AF%3D&session_id=75506749bfe2b142&__user="+uid+"&__a=1&__req=1&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010571561&__s=5rsoi6%3Agbdpww%3Adg42mn&__hsi=7315254677578816521&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o2oCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK3eUbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U4y0CpU2RwrUgU5qi9wwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25303&lsd=Fog6362wK0iEY8XqphT6qv&__aaid=0&__spin_r=1010571561&__spin_b=trunk&__spin_t=1703215455&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewQuery&variables=%7B%22assetOwnerId%22%3A%22"+uid+"%22%2C%22assetId%22%3A%22"+id+"%22%7D&server_timestamps=true&doc_id=6808323559261043",
                })

                const data = JSON.parse(res)

                const issueId = data.data.pageData.advertising_restriction_info.ids_issue_ent_id

                if (issueId) {
                    
                    const res = await z.post("https://www.facebook.com/api/graphql/?_flowletID=5951", {
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": "av="+uid+"&__usid=6-Ts61sri1n0w6gg%3APs61srf6fxh6q%3A0-As61sr81yd87hq-RV%3D6%3AF%3D&session_id=38686d393d715bf2&__user="+uid+"&__a=1&__req=15&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010571561&__s=vu4ytm%3Aqwdqqs%3Axfvzme&__hsi=7315250813066231849&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg="+dtsg+"&jazoest=25469&lsd=Hb1ZywQjm--nmm_QFicxfq&__aaid=0&__spin_r=1010571561&__spin_b=trunk&__spin_t=1703214555&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useALEBanhammerAppealMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22"+chooseNumber[chooseValue]+"%22%2C%22actor_id%22%3A%22"+uid+"%22%2C%22entity_id%22%3A%22"+id+"%22%2C%22ids_issue_ent_id%22%3A%22"+issueId+"%22%2C%22appeal_comment%22%3A%22"+encodeURIComponent(reasonText)+"%22%2C%22callsite%22%3A%22ACCOUNT_QUALITY%22%7D%7D&server_timestamps=true&doc_id=6816769481667605",
                    })
                    
                    if (res.includes('"success":true')) {
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

    checkLiveStream(id) {
        return new Promise(async (resolve, reject) => {

            const uid = this.item.uid
            const dtsg = this.dtsg
            const z = new zFetch(this.page)

            try {

                const res = await z.post("https://business.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+id+"&__user="+uid+"&__a=1&__req=1&__hs=19714.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010578883&__s=gbfpnk%3Asq06yi%3A1vjosc&__hsi=7315694075972505019&__dyn=7xeUmx3wgUnwn8yEqxemhwLBwqo98nyUdU765QdwPGiidz8K2aewhE9Eb8boG5-0g23y4o4O11wqU8E28wlU62WyU4a2-8z8Z0Cg11EswIK1bwFwBwXwEwgolzUO9w5Cx62G3i1ywOwv89k2C2218wIwNxK16w9O48W2a5E5afK1zw_xe2GewGwso88brwBy8aUiwBwOUO4-5o4q1MwPyF8-aUuxe0yo6W4UpwSyES0gq360yUd8eEdUck6EjwmEcogwi86O1fxC13wc2&__csr=gdAp134gP24BgTcZN6TN5dsAT4ibNiexQp194iONeBijG_QDOmIlnYRiPOjhIjORt9PATnlalAqin8SNy8jdF6l-kJWQRHiHi-BQF5Vdb_ihdGKKFaRhlAjjqJ9kQP9IFqbWHV5SPOdGHqy4mTCjmmnVevmqLlB-J-aBut4GjjLmbgDF5mqiKiVuVbAAVUBUyBDjVQXChWCGn-9AU-quqmt4Cx2C4KeCD-UKeK6FEHGcziqyoy8y-vyomK7V8GfG5poy8mbCKhbAjhUOp7ypVaQUkDxqmZ7xWGwBgOVWyp9VEK8yFp-aghzEyfUWcyeqm7oGq22EsUiz8gg-cxq7-UyawOwJwxxGbzUsyU084-CwDyRUOE7S1_wx4w6Yw1uc2BwVgngm8DpUClxo2G04a3yE3nEE1hUlw7va0jy1x78bG58jjz6Ei1m07U8Kp01Hi580fPpVo0-C0X-4ph008m819yG046oy9QE0sdhE1nU1982U1g4YMFg9E2ywfe0oB0f-0n-2yve5J3EeR0jEdOxq1dg2xBwSw1aa8wdi0iK04ro0lwwz2m4o2cwBw1UGq0ri04OpE1Go0gewfq4Ekw5lAwwhK784R0k8lw3vU0u0Cm0WU0zK1sg1F21i0UA0k6&__comet_req=11&fb_dtsg="+dtsg+"&jazoest=25513&lsd=hSJw3G9L_EZwhG5c_N8ai3&__spin_r=1010578883&__spin_b=trunk&__spin_t=1703317760&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitMonetizationStarsMainDetailViewCometWrapperQuery&variables=%7B%22earningsQuery%22%3A%7B%22asset_ids%22%3A%5B%5D%2C%22metrics%22%3A%5B%5D%2C%22page_ids%22%3A%5B%22"+id+"%22%5D%2C%22requested_fields%22%3A%5B%5D%2C%22since%22%3A1702659600%2C%22total_video_metrics%22%3Afalse%2C%22unified_metric_params%22%3A%5B%7B%22aggregation_type%22%3A%22PAGE_UPLOADED%22%2C%22combined_breakdowns_list%22%3A%5B%5B%5D%5D%2C%22counting_method%22%3A%22COUNT%22%2C%22metric_list%22%3A%5B%22STARS_RECEIVED%22%5D%7D%5D%2C%22until%22%3A1703178000%7D%2C%22isStarsMainSubtab%22%3Atrue%2C%22pageID%22%3A%22"+id+"%22%2C%22starsInsightsEndTime%22%3A1703178000%2C%22starsInsightsStartTime%22%3A1702659600%7D&server_timestamps=true&doc_id=6927259353997484",
                })

                const data = JSON.parse(res)

                resolve(data.data.page.mta_tool_eligibility_info.eligibility_state)

            } catch (err) {
                console.log(err)
                reject()
            }


        })
    }

    getPageUid(id) {
        return new Promise(async (resolve, reject) => {

            const z = new zFetch(this.page)

            try {
                const redirect = await z.getRedirect('https://www.facebook.com/profile.php?id='+id)

                const targetUrl = new URL(redirect)

                const searchParams = targetUrl.searchParams

                const pageUid = searchParams.get('id')

                resolve(pageUid)

            } catch (err) {
                console.log(err)
                reject()
            }

        })
    }

    createPageWhatsApp(pageId, pageUid, pageData, client, message) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page 
            const z = new zFetch(page)

            try {

                message('Đang nhập số Whatsapp')

                const number = client.info.me.user

                const res = await z.post("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "av="+pageId+"&__user="+pageId+"&__a=1&__req=s&__hs=19721.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010613049&__s=yaylm4%3Axlkzt5%3Avpu807&__hsi=7318362160198834266&__dyn=7AzHxqU5a5Q1ryUbFp60BVU98nwgUao5-ewSwMwNwnof8bo19oe8hw2nVEtwMw65xO2O1Vwwwqo465o-cwfG1Rx62G5Usw9m1YwBgK7o884y0Mo2sx-3m1mzXw8W58jwGzE8FU766FobrwKxm5o7G4-5o4q3y1MBx_wHwdG7FobpEbUGdG0HE5d08O321LwTwNxe6Uak1xwJwxyo6O1FwgUjwOwWyU4aVU8E&__csr=glMBbd4sGiFEBAhAWCrLAh8SBVuch6QuEyF9mbHCUzHUiLKlp69AhGJ1mh1CaCVlCgkJ2UsyotyrzBBV8gxl3Q1dDBXxi5Eky89VolyoOU9E8U88c8eHxC2F1qdwLwJwrE2TwiawhA1twUwEwNw-wyg3Aw04B_w0tVU12E06Su0tKbwzw1QW3i02tC0f1G05DU09iUy8zo1EU5S&__comet_req=1&fb_dtsg="+pageData.dtsg+"&jazoest=25487&lsd=HzxuaWOQw2kso7_UdPSrAh&__aaid=0&__spin_r=1010613049&__spin_b=trunk&__spin_t=1703938972&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PageWhatsAppLinkingStartVerifyMutation&variables=%7B%22whatsapp_number%22%3A%22"+number+"%22%2C%22page_id%22%3A%22"+pageUid+"%22%2C%22source%22%3A%22PAGE_SETTING%22%2C%22require_business_number%22%3Afalse%7D&server_timestamps=true&doc_id=7050734001613905",
                })
                
                if (res.includes('VERIFICATION_CODE_SEND_SUCCESS')) {

                    message('Đang chờ mã kích hoạt')
                    
                    client.on('message', async (mess) => {

                        if (mess.body.includes('Facebook')) {

                            const codeMatches = mess.body.match(/([0-9]{5})/)

                            if (codeMatches[0]) {
                                const code = codeMatches[0]
                                message('Đang nhập mã kích hoạt')

                                const res = await z.post("https://www.facebook.com/api/graphql/", {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                    },
                                    "body": "av="+pageId+"&__user="+pageId+"&__a=1&__req=z&__hs=19721.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010613049&__s=bx6j04%3Axlkzt5%3Avpu807&__hsi=7318362160198834266&__dyn=7AzHxqU5a5Q1ryUbFp60BVU98nwgUao5-ewSwMwNwnof8bo19oe8hw2nVEtwMw65xO2O1Vwwwqo465o-cwfG1Rx62G5Usw9m1YwBgK7o884y0Mo2sx-3m1mzXw8W58jwGzE8FU766FobrwKxm5o7G4-5o4q3y1MBx_wHwdG7FobpEbUGdG0HE5d08O321LwTwNxe6Uak1xwJwxyo6O1FwgUjwOwWyU4aVU8E&__csr=glMBbd4sGiFEAzhAWCrLAh8SBVuch6QuEyF9mbHCUzHUiLKlp69AhGJ1mh1CaCVlCgkJ2UsyotyrzBBV8gyEF3Q1dDBXxi5Eky89VoiG9zbwCwzwwwMwWK6oaA5ES2-2S1Kwbu18G16g5S3y2y363W290ei00in-01TDw4aw0rpU1SUK2e07jEd809So0Y6E0mvw0Bby8ydw6zwno&__comet_req=1&fb_dtsg="+pageData.dtsg+"&jazoest=25487&lsd=HzxuaWOQw2kso7_UdPSrAh&__aaid=0&__spin_r=1010613049&__spin_b=trunk&__spin_t=1703938972&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PageAdminSettingsWhatsAppLinkAccountMutation&variables=%7B%22whatsapp_number%22%3A%22"+number+"%22%2C%22page_id%22%3A%22"+pageUid+"%22%2C%22source%22%3A%22PAGE_SETTING_PAGE_MULTI_NUMBER%22%2C%22require_business_number%22%3Afalse%2C%22verification_code%22%3A%22"+code+"%22%2C%22register_wa_to_page%22%3Anull%2C%22disclosure_auth_data%22%3Anull%2C%22set_primary_number%22%3Afalse%7D&server_timestamps=true&doc_id=6873370086083249",
                                })

                                if (res.includes('"page":{"id":"')) {

                                    message('Thêm số Whatsapp thành công')

                                    client.destroy()

                                    resolve()
                                    
                                } else {

                                    client.destroy()

                                    reject()
                                }
                            }
                        }

                    })
                } else {
                    message('Nhập số Whatsapp thất bại')
                    client.destroy()
                    reject()
                    
                }

            } catch (err) {
                client.destroy()
                reject(err)
            }

        })
    }

}

module.exports = Page