const {loginCookieApi} = require('./login.js')
const fs = require('fs')
const path = require('path')
const {app} = require('electron')
const {zFetch} = require('./zquery.js')
const {getAccessToken3} = require('./login.js')
const Bm = require('./bm.js')
const cheerio = require('cheerio')

class Tut {
    constructor(page, data, setting, item, pid) {
        this.page = page
        this.data = data
        this.setting = setting 
        this.item = item
        this.pid = pid
    }

    async kich5m8 (send) {

        const page = this.page 
        const item = this.item
        const data = this.data
        const setting = this.setting 
        const z = new zFetch(page)

        let error = false

        let shareSuccess = false
        let acceptSuccess = false
        let setPermisstionSuccess = false
        let changeInfoSuccess = false

        try {

            if (setting.kich5m82.value) {

                send('message', {id: item.id, message: 'Đang tiến hành kích 5m8'})

                const fileBm = path.resolve(app.getPath('userData'), './backup/bm.json')
                const bmData = JSON.parse(await fs.promises.readFile(fileBm, {encoding: 'utf-8'}) || '[]')
                const max = setting.maxBm.value

                const z = new zFetch(page)

                let bm = ''

                for (let index = 0; index < 99999; index++) {

                    try { process.kill(this.pid, 0)} catch { break }
                    
                    const checkBm = bmData.filter(item => item.process === 'UID Live' && parseInt(item.count) < max)

                    const randomItem = checkBm[Math.floor(Math.random() * checkBm.length)]

                    if (randomItem) {

                        const res = await (await fetch('https://graph2.facebook.com/v3.3/'+randomItem.uid+'/picture?redirect=0')).json()

                        if (res.data.width && res.data.height) {

                            send('message', {id: randomItem.id, message: 'UID Live'})

                            try {

                                send('message', {id: item.id, message: 'Đang đăng nhập BM: '+randomItem.uid})

                                randomItem.dtsg = await loginCookieApi(randomItem.cookies)

                                send('message', {id: item.id, message: 'Đăng nhập thành công: '+randomItem.uid})

                                bm = randomItem

                                break

                            } catch {

                                send('message', {id: item.id, message: 'Đăng nhập thất bại: '+randomItem.uid})
                                send('message', {id: randomItem.id, message: 'UID Die'})
                            }
                                                                                                                            
                        } else {
                            send('message', {id: item.id, message: 'BM die: '+randomItem.uid})
                            send('message', {id: randomItem.id, message: 'UID Die'})
                        }
                        
                    }
                    
                }

                if (bm) {

                    const share = new Bm(bm.cookies, bm.token, bm.uid)

                    try {

                        await share.getBmId()

                        for (let index = 0; index < 999999; index++) {

                            try { process.kill(this.pid, 0)} catch { break }
                            
                            const count = (await share.pending()).length

                            if (count <= 2) {
                                break
                            }

                            await page.waitForTimeout(1000)
                            
                        }

                    } catch {
                        throw Error()
                    }

                }

                if (bm) {

                    send('congData', {id: bm.id})

                    const html = await z.get('https://adsmanager.facebook.com/adsmanager/')
                    const mainIdMatch = html.match(/(?<=act=)(.*)(?=&breakdown_regrouping)/g)
                    const mainId = mainIdMatch[0]

                    
                    const share = new Bm(bm.cookies, bm.token, bm.uid)

                    try {

                        await share.getBmId()
                        await share.getPermissionId()
                        await share.getDtsg()

                        send('message', {id: item.id, message: 'Đang share tài khoản vào BM'})

                        for (let index = 0; index < 10; index++) {

                            const res = await share.share(mainId)

                            try {
                            
                                if (res.access_status === 'PENDING' || res.error.error_user_title?.includes('trùng lặp') || res.error.error_user_msg?.includes('đã có quyền truy cập vào đối tượng này')) {

                                    shareSuccess = true

                                    send('message', {id: item.id, message: 'Share tài khoản thành công'})

                                    break
                        
                                } else {
                                    send('message', {id: item.id, message: res.error.error_user_msg || 'Share TK vào BM thất bại'})
                                }

                                if (res.errors) {

                                    if (res.error.error_user_msg.includes('đã có quyền truy cập vào đối tượng này')) {
                                        shareSuccess = true
                                        acceptSuccess = true

                                        break
                                    }

                                    if (!res.error.error_user_msg.includes('chỉ có thể thêm một tài khoản quảng cáo của khách hàng mỗi lần') && !res.error.error_user_msg.includes('Bạn phải chờ yêu cầu được chấp nhận hoặc hủy một số yêu cầu')) { 
                                        break
                                    }

                                }

                            } catch {}

                            await page.waitForTimeout(3000)

                        }

                    } catch (err) {
                        error = true
                    }

                    if (shareSuccess) {

                        send('message', {id: item.id, message: 'Đang chấp nhận lời mời'})
                        
                        const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=1558", {
                            "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&__ad_account_id="+mainId+"&__usid=6-Ts3pafy1j7m0ln%3APs3pb8akztzrj%3A0-As3pafytht9ch-RV%3D6%3AF%3D&__user="+item.uid+"&__a=1&__req=n&__hs=19667.BP%3Aads_campaign_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009706899&__s=6iu4n2%3Akkkogc%3Aapdda9&__hsi=7298320803731958255&__dyn=7xeUmxa2C5rgydwCxpxO9UqDBBBWqxu59o9E4a2i5aCGq58mCyEgx2226UjACzEdF98SmcBxWE-1qG4EOezobo-5FoS1kx2egGbwgEmK9y8Gdz8hyUdocEaEcEixWq3h0Bxq3m2S2qq1eCBBKfxJedQ2OmGx6ta2dmm3mbKegK26bwr8sxep3bBwyylhUeEjx63KdxG11xny-cwuEnxK1Nz84a9DxW48W222a3Fe6rwRwFDwFwBgakbAzE8UqyodoK78-3K5EbpEbororx2aK48OimbAy88rwzzXyE8U4S7VEjCx6223q5o4-i2-fzobEaUiwm8Wubwk8Su6EfEO33zokGum2iVobGwgUyfyA4Ekx24oKqbDyoOEappEHyU8U4y5E7Guu0Jo4md868gU5qiU9E4eueCK2q37wBwjouxJ6xO64uWgcpE8FUeEWcwGxi8w&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25704&lsd=fLDQWnpUzU6Brvs5dILT_H&__aaid="+mainId+"&__spin_r=1009706899&__spin_b=trunk&__spin_t=1699272730&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AdsAccountPitchedGuidanceGraphQLQuery&server_timestamps=true&variables=%7B%22adAccountID%22%3A%22"+mainId+"%22%7D&doc_id=6274337222614887",
                        })

                        const json = JSON.parse(res)

                        if (json.data.ad_accounts[0].id) {
                            
                            await z.post("https://adsmanager.facebook.com/adaccount/agency/request/accept_reject/?_flowletID=3463", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "ad_market_id="+json.data.ad_accounts[0].id+"&agency_id="+share.bmId+"&operation=0&ext=1699535642&hash=AeRBkUiiaakyDElGxW8&__usid=6-Ts3pdzbv7nfdr%3APs3pe0wldlrqq%3A0-As3pdzbyon82-RV%3D6%3AF%3D&__user="+item.uid+"&__a=1&__req=y&__hs=19667.BP%3Aads_campaign_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009706899&__s=fiktub%3A63ks0r%3Azeedw3&__hsi=7298336359530181907&__dyn=7xeUmxa2C5rgydwCxpxO9UqDBBBWqxu59o9E4a2i5aCGq58mCyEgx2226UjACzEdF98SmcBxWE-1qG4EOezobo-5FoS1kx2egGbwgEmK9y8Gdz8hyUdocEaEcEixWq3h0Bxq3m2S2qq1eCBBKfxJedQ2OmGx6ta2dmm3mbKegK26bwr8sxep3bBwyylhUeEjx63KdxG11xny-cwuEnxK1Nz84a9DxW48W222a3Fe6rwRwFDwFwBgakbAzE8UqyodoK78-3K5EbpEbororx2aK48OimbAy88rwzzXyE8U4S7VEjCx6223q5o4-i2-fzobEaUiwm8Wubwk8Su6EfEO33zokGum2iVobGwgUyfyA4Ekx24oKqbDyoOEappEHyU8U4y5E7Guu0Jo4md868gU5qiU9E4eueCK2q37wBwjouxJ6xO64uWgcpE8FUeEWcwGxi8w&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25559&lsd=yWuC_J5hsXsaTl0iv16VCB&__aaid="+mainId+"&__spin_r=1009706899&__spin_b=trunk&__spin_t=1699276352",
                            })

                            const res = await share.check(mainId)
        
                            if (!res.errors) {
                                acceptSuccess = true
                            } else {
                                error = true
                            }
                                                
                        } else {
                            error = true
                        }


                    }

                    if (acceptSuccess) {

                        send('message', {id: item.id, message: 'Đang cấp quyền cho tài khoản'})

                        const res = await share.permission(mainId)

                        console.log(res)

                        if (res.includes('{"successes":{"'+mainId+'"')) {

                            send('message', {id: item.id, message: 'Cấp quyền thành công'})

                            setPermisstionSuccess = true

                        } else {

                            send('message', {id: item.id, message: 'Không thể cấp quyền cho tài khoản'})
                        }

                    } else {

                        await page.waitForTimeout(5000)

                        try {
                            await share.cancel(mainId)
                        } catch {

                        }

                        error = true
                    }

                    if (setPermisstionSuccess) {

                        send('message', {id: item.id, message: 'Đang kích 5m8'})

                        try {

                            if (setting.changeInfoTkqc.value) {

                                const res = await share.changeInfo(mainId, setting.kich5m8Country.value, setting.kich5m8Timezone.value, setting.kich5m8Currency.value)

                                if (!res.errors) {

                                    send('message', {id: item.id, message: 'Kích 5m8 thành công'})

                                    changeInfoSuccess = true

                                } else {
                                    send('message', {id: item.id, message: 'Kích 5m8 thất bại'})
                                }

                            } else {

                                send('message', {id: item.id, message: 'Kích 5m8 thành công'})
                                changeInfoSuccess = true

                            }


                        } catch {

                            error = true
                        }

                    } else {
                        error = true
                    }

                    send('truData', {id: bm.id})

                }

            } else {
                changeInfoSuccess = true
            }

            if (setting.shareTkVaoVia.value && changeInfoSuccess) {

                send('message', {id: item.id, message: 'Đang tiến hành share tài khoản vào VIA'})
                
                const fileVia = path.resolve(app.getPath('userData'), './backup/via.json')
                const viaData = JSON.parse(await fs.promises.readFile(fileVia, {encoding: 'utf-8'}) || '[]')
                const max = setting.maxVia.value

                const checkVia = viaData.filter(item => item.process === 'UID Live' && parseInt(item.count) < max && parseInt(item.shareError) < 5 && item.isRunning == 0)

                let via = false

                if (checkVia[0]) {

                    send('viaRunning', {id: checkVia[0].id})

                    const res = await (await fetch('https://graph2.facebook.com/v3.3/'+checkVia[0].uid+'/picture?redirect=0')).json()

                    if (res.data.width && res.data.height) {

                        send('message', {id: checkVia[0].id, message: 'UID Live'})

                        try {

                            send('message', {id: item.id, message: 'Đang đăng nhập VIA: '+checkVia[0].uid})

                            checkVia[0].dtsg = await loginCookieApi(checkVia[0].cookies)

                            send('message', {id: item.id, message: 'Đăng nhập thành công: '+checkVia[0].uid})

                            via = checkVia[0]

                        } catch {

                            send('message', {id: item.id, message: 'Đăng nhập thất bại: '+checkVia[0].uid})
                            send('message', {id: checkVia[0].id, message: 'UID Die'})
                        }
                                                                                                                        
                    } else {
                        send('message', {id: item.id, message: 'VIA die: '+checkVia[0].uid})
                        send('message', {id: checkVia[0].id, message: 'UID Die'})
                    }
                }

                if (via) {

                    let target = ''
                    let sender = ''

                    if (setting.shareFrom.value === 'viaCam') {
                        target = item.uid 
                        sender = via.uid
                    } else {
                        target = via.uid 
                        sender = item.uid
                    }

                    let addFriendSuccess = false
                    let acceptFriendSuccess = false
                    let shareAccSuccess = false
                    let areFriend = false

                    if (setting.shareFrom.value === 'viaCam') {

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
                                    "cookie": via.cookies,
                                    "Referer": "https://www.facebook.com/profile.php?id="+target,
                                    "Referrer-Policy": "strict-origin-when-cross-origin"
                                },
                                "body": "av="+sender+"&__user="+sender+"&__a=1&__req=p&__hs=19665.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1009698433&__s=tdp65f%3Aoo2g20%3A14aaa3&__hsi=7297598015669684550&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUKbgS3q5UObwNwnof8boG0x8bo6u3y4o2vyE3Qwb-q7oc81xoswIK1Rwwwqo465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwgojUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWwjE&__csr=g8Y8MTq9kLOkJR8x4AZbMTLRbkLRPGAuBEWlOcDtQipZlZvqqWhe_KjsHqgDCF4GECrKnSEV5BAyAaF4KW9Dpbg_CzbZoO2mmcXBGA8DLDUhLBoOE-4mipFeEa9Eb8Sim8xiqdG9CF1y68Gu68W4ElF0iE-Uyi58iy8fHwMwSUlwyzo8p84GegmCwlEWdwJwmE5a4EOfDwzU9EaUnxq15wn8swIwBxy3y6Eaodo3pwAyE5q2m3-18U2Jw2WA324U5u0gC0Mo1jj042Aw5Zw5Pwo8qzo06ly00KaE0Zx03Vo6-2mdw9m3-u0eUw4-w7owRDCw1dSJw2DU8GweF0no1-E7m03We2i058E09762C0UU0j8w2xo0gew&__comet_req=15&fb_dtsg="+via.dtsg+"&jazoest=25465&lsd=bDKLvgS6rXdNSQTYKST5kT&__aaid=0&__spin_r=1009698433&__spin_b=trunk&__spin_t=1699104443&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1699104440833%2C56049%2C190055527696468%2C%22%2C%22friend_requestee_ids%22%3A%5B%22"+target+"%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%22"+target+"%22%5D%2C%22actor_id%22%3A%22"+sender+"%22%2C%22client_mutation_id%22%3A%222%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129",
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
                                        "cookie": via.cookies,
                                        "Referer": "https://www.facebook.com/",
                                        "Referrer-Policy": "strict-origin-when-cross-origin"
                                    },
                                    "body": "av="+target+"&__user="+target+"&__a=1&__req=z&__hs=19665.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1009699624&__s=hcwf62%3Al32b9f%3Amf9c99&__hsi=7297673615366928756&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUngS3q5UObwNwnof8boG0x8bo6u3y4o2vyE3Qwb-q7oc81xoswIK1Rwwwg8a8465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwOzEjUlDw-wUwxwjFovUy2a1ywtUuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWw-zU&__csr=gdslST4RmB2vfQxD5TkhkOOOnkOQwzIAzFZO8sLlSl94tmAAHuAAysLPq9WQ9nl7ZfnjVpFppG-mA8VaADAALVtqghUGcGmGhAF9VbBBK8CmFFbGV4ExuahoyuWBCyoGGRh8Z11edVaxjxa2ifAAG44m8yogxjx-t6ykm6ULgGVE9F4dyEiAnxirU4afxe4pEnx6EhF0nGVo4e4UkyQ7k3KbKexS4EiACwEBxG36cxy7FErDyoS8xGfwmEpwGwTx65Wxe7FolyoqyUvwuEC9DwkoWm6EyeAgS0w8jwSwCwjrwu81oE1hE6-0GonDUcU621yxC0pOew78wt8d84ii0EU5y4U0ao808so0oqg0zy0bcw0sJo0d3826w3S404lo9oS0BofVU1I81Ho5C0jW0ty3muq1VVdw5Xw6Do1cF60b2w3hU7m02mCq360608988Fo0jVw0Asoao3zw1cy0a5w4VDw-w2YA0PyHyWoigW&__comet_req=15&fb_dtsg="+via.dtsg+"&jazoest=25309&lsd=DnPjnf7RbZWGiU5jeTTMlM&__aaid=0&__spin_r=1009699624&__spin_b=trunk&__spin_t=1699122045&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestConfirmMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22CometHomeRoot.react%2Ccomet.home%2Cvia_cold_start%2C1699122042792%2C224627%2C4748854339%2C%22%2C%22friend_requester_id%22%3A%22"+sender+"%22%2C%22source%22%3A%22rhc_friend_requests%22%2C%22actor_id%22%3A%22"+target+"%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%2C%22refresh_num%22%3A0%7D&server_timestamps=true&doc_id=7035688403142455",
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

                        } else {
                            send('message', {id: item.id, message: 'Không thể gửi lời mời kết bạn'})
                        }

                    }

                    if (addFriendSuccess && acceptFriendSuccess) {

                        send('message', {id: item.id, message: 'Đang share tài khoản vào VIA'})

                        const html = await z.get('https://adsmanager.facebook.com/adsmanager/')
                        const mainIdMatch = html.match(/(?<=act=)(.*)(?=&breakdown_regrouping)/g)
                        const mainId = mainIdMatch[0]

                        let accessToken = false

                        try {

                            accessToken = await getAccessToken3(page, item.uid, data.fb_dtsg, item.twofa)

                        } catch {}

                        if (accessToken) {

                            const url = await page.url()

                            if (!url.includes('www.facebook.com')) {
                                await page.goto('https://www.facebook.com')
                            }

                            const res = await z.post("https://adsmanager-graph.facebook.com/v16.0/act_"+mainId+"/users?_reqName=adaccount%2Fusers&access_token="+accessToken+"&method=post&__cppo=1&_flowletID=4592", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=adaccount%2Fusers&_reqSrc=AdsPermissionDialogController&_sessionID=7a64d663a01a01b7&account_id="+mainId+"&include_headers=false&locale=vi_VN&method=post&pretty=0&role=281423141961500&suppress_http_code=1&uid="+via.uid+"&xref=f1647efb1d2cb7",
                            })

                            if (res.success) {

                                shareAccSuccess = true

                                send('message', {id: item.id, message: 'Share tài khoản vào VIA thành công'})
                                send('congDataVia', {id: via.id})
                            } else {

                                error = true

                                send('message', {id: item.id, message: 'Share tài khoản vào VIA thất bại'})
                                
                            }

                        } else {

                            error = true
                            send('message', {id: item.id, message: 'Không thể lấy Access Token'})
                        }

                    }

                    if (!shareAccSuccess) {
                        send('congDataViaError', {id: via.id})
                    }

                } else {

                    error = true

                    send('message', {id: item.id, message: 'Số lượng Via cầm không đủ'})
                    
                }

                send('viaStopped', {id: via.id})

            }

            if (error) {

                throw Error()
            }

            return

        } catch (err) {
            console.log(err)
            throw Error(err)
        }

    }

    shareTk(send) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const item = this.item
            const data = this.data
            const setting = this.setting 
            const z = new zFetch(page)

            try {

                const fileBm = path.resolve(app.getPath('userData'), './backup/bm.json')
                const bmData = JSON.parse(await fs.promises.readFile(fileBm, {encoding: 'utf-8'}) || '[]')

                let bm = false

                if (bmData[0]) {

                    const res = await (await fetch('https://graph2.facebook.com/v3.3/'+bmData[0].uid+'/picture?redirect=0')).json()

                    if (res.data.width && res.data.height) {

                        send('message', {id: bmData[0].id, message: 'UID Live'})

                        try {

                            send('message', {id: item.id, message: 'Đang đăng nhập BM: '+bmData[0].uid})

                            bmData[0].dtsg = await loginCookieApi(bmData[0].cookies)

                            send('message', {id: item.id, message: 'Đăng nhập thành công: '+bmData[0].uid})

                            bm = bmData[0]

                        } catch {

                            send('message', {id: item.id, message: 'Đăng nhập thất bại: '+bmData[0].uid})
                            send('message', {id: bmData[0].id, message: 'UID Die'})
                        }
                                                                                                                        
                    } else {
                        send('message', {id: item.id, message: 'BM die: '+bmData[0].uid})
                        send('message', {id: bmData[0].id, message: 'UID Die'})
                    }

                }

                if (bm) {

                    send('message', {id: item.id, message: 'Đang tiến hành share TK vào BM'})

                    let shareSuccess = false
                    let acceptSuccess = false
                    let setPermisstionSuccess = false

                    const html = await z.get('https://adsmanager.facebook.com/adsmanager/')
                    const mainIdMatch = html.match(/(?<=act=)(.*)(?=&breakdown_regrouping)/g)
                    const mainId = mainIdMatch[0]

                    const share = new Bm(bm.cookies, bm.token, bm.uid)
                    
                    try {

                        share.bmId = setting.bmId.value
                        share.dtsg = bm.dtsg
                        
                        await share.getPermissionId()

                        send('message', {id: item.id, message: 'Đang share tài khoản vào BM'})

                        for (let index = 0; index < 10; index++) {

                            const res = await share.share(mainId)

                            console.log(res)

                            try {
                            
                                if (res.access_status === 'PENDING' || res.error.error_user_title?.includes('trùng lặp') || res.error.error_user_msg?.includes('đã có quyền truy cập vào đối tượng này')) {

                                    shareSuccess = true

                                    send('message', {id: item.id, message: 'Share tài khoản thành công'})

                                    break
                        
                                } else {
                                    send('message', {id: item.id, message: res.error.error_user_msg || 'Share tài khoản thất bại'})
                                }

                                if (res.errors) {

                                    if (res.error.error_user_msg.includes('đã có quyền truy cập vào đối tượng này')) {
                                        acceptSuccess = true
                                        shareSuccess = true

                                        break
                                    }

                                    if (!res.error.error_user_msg.includes('chỉ có thể thêm một tài khoản quảng cáo của khách hàng mỗi lần') && !res.error.error_user_msg.includes('Bạn phải chờ yêu cầu được chấp nhận hoặc hủy một số yêu cầu')) { 
                                        break
                                    }

                                }

                            } catch {}

                            await page.waitForTimeout(3000)

                        }

                    } catch (err) {
                        console.log(err)
                    }

                    if (shareSuccess) {

                        send('message', {id: item.id, message: 'Đang chấp nhận lời mời'})
                        
                        const res = await z.post("https://adsmanager.facebook.com/api/graphql/?_flowletID=1558", {
                            "headers": {
                            "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&__ad_account_id="+mainId+"&__usid=6-Ts3pafy1j7m0ln%3APs3pb8akztzrj%3A0-As3pafytht9ch-RV%3D6%3AF%3D&__user="+item.uid+"&__a=1&__req=n&__hs=19667.BP%3Aads_campaign_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009706899&__s=6iu4n2%3Akkkogc%3Aapdda9&__hsi=7298320803731958255&__dyn=7xeUmxa2C5rgydwCxpxO9UqDBBBWqxu59o9E4a2i5aCGq58mCyEgx2226UjACzEdF98SmcBxWE-1qG4EOezobo-5FoS1kx2egGbwgEmK9y8Gdz8hyUdocEaEcEixWq3h0Bxq3m2S2qq1eCBBKfxJedQ2OmGx6ta2dmm3mbKegK26bwr8sxep3bBwyylhUeEjx63KdxG11xny-cwuEnxK1Nz84a9DxW48W222a3Fe6rwRwFDwFwBgakbAzE8UqyodoK78-3K5EbpEbororx2aK48OimbAy88rwzzXyE8U4S7VEjCx6223q5o4-i2-fzobEaUiwm8Wubwk8Su6EfEO33zokGum2iVobGwgUyfyA4Ekx24oKqbDyoOEappEHyU8U4y5E7Guu0Jo4md868gU5qiU9E4eueCK2q37wBwjouxJ6xO64uWgcpE8FUeEWcwGxi8w&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25704&lsd=fLDQWnpUzU6Brvs5dILT_H&__aaid="+mainId+"&__spin_r=1009706899&__spin_b=trunk&__spin_t=1699272730&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AdsAccountPitchedGuidanceGraphQLQuery&server_timestamps=true&variables=%7B%22adAccountID%22%3A%22"+mainId+"%22%7D&doc_id=6274337222614887",
                        })

                        const json = JSON.parse(res)

                        if (json.data.ad_accounts[0].id) {
                            
                            await z.post("https://adsmanager.facebook.com/adaccount/agency/request/accept_reject/?_flowletID=3463", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                },
                                "body": "ad_market_id="+json.data.ad_accounts[0].id+"&agency_id="+share.bmId+"&operation=0&ext=1699535642&hash=AeRBkUiiaakyDElGxW8&__usid=6-Ts3pdzbv7nfdr%3APs3pe0wldlrqq%3A0-As3pdzbyon82-RV%3D6%3AF%3D&__user="+item.uid+"&__a=1&__req=y&__hs=19667.BP%3Aads_campaign_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009706899&__s=fiktub%3A63ks0r%3Azeedw3&__hsi=7298336359530181907&__dyn=7xeUmxa2C5rgydwCxpxO9UqDBBBWqxu59o9E4a2i5aCGq58mCyEgx2226UjACzEdF98SmcBxWE-1qG4EOezobo-5FoS1kx2egGbwgEmK9y8Gdz8hyUdocEaEcEixWq3h0Bxq3m2S2qq1eCBBKfxJedQ2OmGx6ta2dmm3mbKegK26bwr8sxep3bBwyylhUeEjx63KdxG11xny-cwuEnxK1Nz84a9DxW48W222a3Fe6rwRwFDwFwBgakbAzE8UqyodoK78-3K5EbpEbororx2aK48OimbAy88rwzzXyE8U4S7VEjCx6223q5o4-i2-fzobEaUiwm8Wubwk8Su6EfEO33zokGum2iVobGwgUyfyA4Ekx24oKqbDyoOEappEHyU8U4y5E7Guu0Jo4md868gU5qiU9E4eueCK2q37wBwjouxJ6xO64uWgcpE8FUeEWcwGxi8w&__csr=&fb_dtsg="+data.fb_dtsg+"&jazoest=25559&lsd=yWuC_J5hsXsaTl0iv16VCB&__aaid="+mainId+"&__spin_r=1009706899&__spin_b=trunk&__spin_t=1699276352",
                            })

                            const res = await share.check(mainId)
        
                            if (!res.errors) {
                                acceptSuccess = true
                            } else {
                                send('message', {id: item.id, message: 'Không thể chấp nhận lời mời'})
                            }
                                                
                        }

                    }

                    if (acceptSuccess) {

                        send('message', {id: item.id, message: 'Đang cấp quyền cho tài khoản'})

                        const res = await share.permission(mainId)

                        if (res.includes('{"successes":{"'+mainId+'"')) {

                            send('message', {id: item.id, message: 'Cấp quyền thành công'})

                            setPermisstionSuccess = true

                        } else {

                            send('message', {id: item.id, message: 'Không thể cấp quyền cho tài khoản'})
                        }

                    } else {

                        await page.waitForTimeout(5000)

                        try {
                            await share.cancel(mainId)
                        } catch {

                        }

                    }

                    if (setPermisstionSuccess) {
                        send('message', {id: item.id, message: 'Share TK vào BM thành công'})
                        resolve()
                    } else {
                        send('message', {id: item.id, message: 'Share TK vào BM thất bại'})
                        reject()
                    }

                } else {

                    reject('Không có BM')

                }

            } catch (err) {

                send('message', {id: item.id, message: 'Share TK vào BM thất bại'})
                reject()
            }


        })
    }
}

module.exports = Tut