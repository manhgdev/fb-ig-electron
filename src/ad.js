const {randomNumber, delayTimeout} = require('./core.js')

class Ad {

    constructor(uid, cookie, token, dtsg) {

        this.uid = uid
        this.cookie = cookie
        this.token = token
        this.dtsg = dtsg

    }

    checkHold(id) {
        return new Promise(async (resolve, reject) => {

            const dtsg =  this.dtsg
            const cookie = this.cookie
            const uid = this.uid

            const data = {
                status: false,
                country: ''
            }

            try {

                const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=1", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "vi,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "1",
                        "sec-ch-prefers-color-scheme": "dark",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                        "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"119.0.2151.44\", \"Chromium\";v=\"119.0.6045.105\", \"Not?A_Brand\";v=\"24.0.0.0\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"15.0.0\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "1363",
                        "x-asbd-id": "129477",
                        "x-fb-lsd": "wUiXe-PmEKt_dJKtoKfc2j",
                        "cookie": cookie,
                        "Referer": "https://business.facebook.com/billing_hub/payment_settings?asset_id="+id+"&business_id&placement=ads_manager",
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": "variables=%7B%22assetID%22%3A%22"+id+"%22%7D&doc_id=6401661393282937&__usid=6-Ts5nipgghzke1%3APs5njgxu7qu6k%3A0-As5nioptysbhe-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=z&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010415572&__s=nj5fv4%3Auxyhlh%3Anumh4f&__hsi=7312393684659585941&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&__csr=&fb_dtsg="+dtsg+"&jazoest=25305&lsd=wUiXe-PmEKt_dJKtoKfc2j&__aaid="+id+"&__spin_r=1010415572&__spin_b=trunk&__spin_t=1702549328&__jssesw=1",
                    "method": "POST"
                })

                const html = await res.text()
                const countryMatch = html.match(/(?<=\"predicated_business_country_code\":\")[^\"]*/g)

                if (countryMatch[0]) {
                    data.country = countryMatch[0]
                }

                if (html.includes('RETRY_FUNDS_HOLD'))  {
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

            const dtsg =  this.dtsg
            const uid = this.uid
            const cookie = this.cookie

            try {

                const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=1", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "vi,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "1",
                        "sec-ch-prefers-color-scheme": "dark",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                        "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"119.0.2151.44\", \"Chromium\";v=\"119.0.6045.105\", \"Not?A_Brand\";v=\"24.0.0.0\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"15.0.0\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "1363",
                        "x-asbd-id": "129477",
                        "x-fb-lsd": "wUiXe-PmEKt_dJKtoKfc2j",
                        "cookie": cookie,
                        "Referer": "https://business.facebook.com/billing_hub/payment_settings?asset_id="+id+"&business_id&placement=ads_manager",
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": 'variables={"paymentAccountID":"'+id+'"}&doc_id=5746473718752934&__usid=6-Ts5btmh131oopb:Ps5bu98bb7oey:0-As5btmhrwegfg-RV=6:F=&__user='+uid+'&__a=1&__req=s&__hs=19699.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010282616&__s=flj1ty:75294s:o83s9c&__hsi=7310049091311550655&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwvC6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&__csr=&fb_dtsg='+dtsg+'&jazoest=25610&lsd=HExoeF2styyeq_LWWUo9db&__aaid='+id+'&__spin_r=1010282616&__spin_b=trunk&__spin_t=1702003435&__jssesw=1',
                    "method": "POST"
                })

                const data = await res.json()

                const cards = data.data.billable_account_by_payment_account.billing_payment_account.billing_payment_methods

                resolve(cards)

            } catch (err) {
                reject()
            }


        })
    }

    getUser(id) {
        return new Promise(async (resolve, reject) => {

            const cookie = this.cookie 
            const token = this.token 

            try {

                const res = await fetch('https://graph.facebook.com/v16.0/act_'+id+'?access_token='+token+'&__cppo=1&__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&_reqName=adaccount&fields=["users{id,is_active,name,permissions,role,roles}"]&locale=en_US&method=get&pretty=0&suppress_http_code=1&xref=f3b1944e6a8b33c&_flowletID=1', {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "vi,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-site",
                        "cookie": cookie,
                        "Referer": "https://business.facebook.com/",
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": null,
                    "method": "GET"
                })

                const item = await res.json()

                resolve(item.users.data)


            } catch (err) {
                reject()
            }
            
        })
    }

    getAccountInfo(id) {
        return new Promise(async (resolve, reject) => {

            const uid = this.uid
            const cookie = this.cookie 
            const token = this.token 

            try {

                const res = await fetch('https://graph.facebook.com/v16.0/act_'+id+'?access_token='+token+'&__cppo=1&__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&_reqName=adaccount&fields=["adtrust_dsl","adspaymentcycle{threshold_amount}","insights.date_preset(lifetime){spend}","balance","next_bill_date","owner","owner_business","userpermissions.user('+uid+').as(user_roles)","disable_reason","currency","account_id","name","account_status","users{id,is_active,name,permissions,role,roles}","business","created_time","timezone_offset_hours_utc","timezone_name"]&locale=en_US&method=get&pretty=0&suppress_http_code=1&xref=f3b1944e6a8b33c&_flowletID=1', {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "vi,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-site",
                        "cookie": cookie,
                        "Referer": "https://business.facebook.com/",
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": null,
                    "method": "GET"
                })

                const item = await res.json()

                if (!item.error) {

                    const account = {
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
                        role: item.user_roles?.data[0]?.role || 'UNKNOWN',
                        currency: item.currency,
                        disableReason: item.disable_reason,
                        prePay: item.is_prepay_account ? 'TT' : 'TS',
                        ownerBusiness: item.owner_business ? item.owner_business.id : null,
                        users: item.users ? item.users.data : [],
                        uid: uid,
                    }

                    const checkHold = await this.checkHold(id)

                    if (checkHold.status) {
                        account.status = 999
                    }

                    if (checkHold.country) {
                        account.country = checkHold.country
                    }

                    try {
                        account.cards = await this.getCard(id)
                    } catch {}

                    resolve(account)

                } else {
                    reject()
                }

            } catch (err) {
                reject()
            }
            
        })
    }

    changeName(id, name) {
        return new Promise(async (resolve, reject) => {
            const cookie = this.cookie
            const token = this.token

            const newName = name+' '+randomNumber(11111, 99999)

            try {

                const res = await fetch("https://graph.facebook.com/v18.0/act_"+id+"?access_token="+token, {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "vi,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-site",
                        "cookie": cookie,
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": "name="+encodeURIComponent(newName),
                    "method": "POST"
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

    removeUser(id, user) {
        return new Promise(async (resolve, reject) => {
            const cookie = this.cookie
            const token = this.token

            try {

                const res = await fetch("https://graph.facebook.com/v14.0/act_"+id+"/users/"+user+"?method=DELETE&access_token="+token, {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "vi,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-site",
                        "cookie": cookie,
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": null,
                    "method": "GET"
                })

                const data = await res.json()

                if (data.success) {
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

    changeInfo(id, currency, timezone, country) {
        return new Promise(async (resolve, reject) => {
            const cookie = this.cookie
            const dtsg = this.dtsg
            const uid = this.uid

            try {

                const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=7168", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "dpr": "0.9",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                        "sec-ch-ua-full-version-list": "\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"120.0.6099.109\", \"Google Chrome\";v=\"120.0.6099.109\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"10.0\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "viewport-width": "1508",
                        "x-asbd-id": "129477",
                        "x-fb-friendly-name": "BillingAccountInformationUtilsUpdateAccountMutation",
                        "x-fb-lsd": "bCvJhCyzXeg968-UrrpA6K",
                        "cookie": cookie,
                        "Referer": "https://business.facebook.com/billing_hub/payment_settings/?asset_id="+id+"&placement=ads_manager",
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": "av="+uid+"&__usid=6-Ts5rdw4ejkzb9%3APs5rdw3f9ktw3%3A0-As5rdsb1ltzmda-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=1n&__hs=19707.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010466044&__s=d06uwg%3A6ckp8m%3A85uy65&__hsi=7313164176971322218&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&__csr=&fb_dtsg="+dtsg+"&jazoest=25234&lsd=bCvJhCyzXeg968-UrrpA6K&__aaid="+id+"&__spin_r=1010466044&__spin_b=trunk&__spin_t=1702728722&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingAccountInformationUtilsUpdateAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22"+id+"%22%2C%22currency%22%3A%22"+currency+"%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A25%2C%22logging_id%22%3A%222786824690%22%7D%2C%22tax%22%3A%7B%22business_address%22%3A%7B%22city%22%3A%22Toolfb.vn%22%2C%22country_code%22%3A%22"+country+"%22%2C%22state%22%3A%22Toolfb.vn%22%2C%22street1%22%3A%22Toolfb.vn%22%2C%22street2%22%3A%22Toolfb.vn%22%2C%22zip%22%3A%2299999%22%7D%2C%22business_name%22%3A%22Toolfb.vn%22%2C%22is_personal_use%22%3Afalse%2C%22second_tax_id%22%3A%22%22%2C%22tax_id%22%3A%22%22%2C%22tax_registration_status%22%3A%22%22%7D%2C%22timezone%22%3A%22"+timezone+"%22%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22BILLING_HUB%22%2C%22external_flow_id%22%3A%222389477848%22%2C%22target_name%22%3A%22BillingAccountInformationUtilsUpdateAccountMutation%22%2C%22user_session_id%22%3A%22upl_1702728726646_fb2b6a0c-5c7b-4cd7-8973-6809dd8c607b%22%2C%22wizard_config_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_screen_name%22%3A%22account_information_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702728726646_b7c07b3c-65d4-478d-8578-4d26107d8179%22%7D%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%225%22%7D%7D&server_timestamps=true&doc_id=23988069674173253",
                    "method": "POST"
                })
                
                const data = await res.text()

                if (data.includes('Toolfb.vn')) {
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

    checkHiddenAdmin(id,) {
        return new Promise(async (resolve, reject) => {
            const cookie = this.cookie
            const dtsg = this.dtsg
            const uid = this.uid

            try {

                const res = await fetch("https://www.facebook.com/ads/manager/account_settings/information/?act="+id, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "en-US,en;q=0.9",
                        "dpr": "0.8999999761581421",
                        "sec-ch-prefers-color-scheme": "light",
                        "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-model": "\"\"",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-ch-ua-platform-version": "\"10.0\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "viewport-width": "642",
                        "cookie": cookie
                    },
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET"
                })

                const data = await res.text()

                const hiddenUsers = data.match(/\b(\d+)\,(name:null)\b/g)

                if (hiddenUsers) {

                    resolve(hiddenUsers.map(item => {
                        return item.replace(',name:null', '')
                    }))

                } else {
                    resolve([])
                }

            } catch (err) {
                reject(err)
            }

        })
    }

    addCard(id, card, mode) {
        return new Promise(async (resolve, reject) => {
            const cookie = this.cookie
            const uid = this.uid
            const dtsg = this.dtsg

            try {

                const cardNumber = card.cardNumber.toString().replaceAll(' ', '')
                const expMonth = parseInt(card.expMonth)
                const expYear = parseInt(card.expYear)

                const first6 = cardNumber.toString().substr(0, 6)
                const last4 = cardNumber.toString().slice(-4)

                let res = false

                if (mode == 1) {

                    res = await fetch("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5755", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "x-fb-friendly-name": "useBillingAddCreditCardMutation",
                            "cookie": cookie,
                            "Referer": "https://business.facebook.com/",
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "body": "av="+uid+"&payment_dev_cycle=prod&__usid=6-Ts5n9f71tgu6bi%3APs5n9f71o4wo1d%3A0-As5n9es1ukf1sd-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=23&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010409196&__s=tsyyte%3Aca3toj%3Ap91ad2&__hsi=7312337759778035971&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg="+dtsg+"&jazoest=25632&lsd=8pbDxyOWVFHU8ZQqBPXwiA&__aaid="+id+"&__spin_r=1010409196&__spin_b=trunk&__spin_t=1702536307&__jssesw=1&qpl_active_flow_ids=270206296&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A56%2C%22logging_id%22%3A%221695426641%22%7D%2C%22cardholder_name%22%3A%22"+encodeURIComponent(card.cardName)+"%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22"+first6+"%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22"+last4+"%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22"+cardNumber+"%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22"+card.cardCsv+"%22%7D%2C%22expiry_month%22%3A%22"+expMonth+"%22%2C%22expiry_year%22%3A%2220"+expYear+"%22%2C%22payment_account_id%22%3A%22"+id+"%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702536309339_5f530bbf-fed6-4f28-8d5c-48c42769f959%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702536309339_859290be-8180-4b68-a810-97e329d6ff00%22%7D%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%2211%22%7D%7D&server_timestamps=true&doc_id=7203358526347017&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D270206296%22%5D",
                        "method": "POST"
                    })

                }

                if (mode == 2) {

                    res = await fetch("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5602", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "x-fb-friendly-name": "useBillingAddCreditCardMutation",
                            "cookie": cookie,
                            "Referer": "https://business.facebook.com/",
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "body": "av="+uid+"&payment_dev_cycle=prod&__usid=6-Ts5nbs384tvjc%3APs5nbs31x3roaz%3A0-As5nbrg12abp26-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=2c&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010409196&__s=vva7lu%3Ai7twp6%3Ai6haj9&__hsi=7312350885137944044&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxKaxq1UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq3O11orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg="+dtsg+"&jazoest=25632&lsd=atclR6VUVMWqcQJ9vPCgdL&__aaid="+id+"&__spin_r=1010409196&__spin_b=trunk&__spin_t=1702539363&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A36%2C%22logging_id%22%3A%222195093243%22%7D%2C%22cardholder_name%22%3A%22"+encodeURIComponent(card.cardName)+"%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22"+first6+"%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22"+last4+"%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22"+cardNumber+"%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22"+card.cardCsv+"%22%7D%2C%22expiry_month%22%3A%22"+expMonth+"%22%2C%22expiry_year%22%3A%2220"+expYear+"%22%2C%22payment_account_id%22%3A%22"+id+"%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702539365385_4aba71a2-a333-4dba-9816-d502aa296ad1%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702539445087_1069a84b-5462-4e7c-b503-964f5da85c9e%22%7D%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%228%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
                        "method": "POST"
                    })

                }

                if (mode == 3) {

                    res = await fetch("https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=8308", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "x-fb-friendly-name": "useBillingAddCreditCardMutation",
                            "cookie": cookie,
                            "Referer": "https://adsmanager.facebook.com/",
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "body": "av="+uid+"&payment_dev_cycle=prod&__usid=6-Ts5ncpg15yixvw%3APs5ncpg19n5k27%3A0-As5nco9x6xrcn-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=2h&__hs=19705.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010412528&__s=0oatf1%3A21wtco%3A7hru27&__hsi=7312356040330685281&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3Kq2imeGqFEkG4VEHoOqqE88lBxeipe9wNWAAzppFuUuGfxW2u5Eiz8WdyU8ryUKrVoS3u7azoV2EK12xqUC8yEScx6bxW5FQ4Vbz8ix2q9hUhzoizE-Hx6290BAggwwCzoO69UryFE4eaKFprzu6QUCZ0IXGECutk2dmm2adAyXzAbwxyU6O78jCgOVp8W9AylmnyUb8jz98eUS48C11xny-cyo725UiGm1ixWcgsxN6ypVoKcyV8W22m78eF8pK3m2DBCG4UK4EigK7kbAzE8Uqy43mbgOUGfgeEhAwJCxSegroG48gyHx2cAByV8y7rKfxefKaxWi2y2icxaq4VEhGcx22uexm4ofp8rxefzobK4UGaxa2h2pqK6UCQubxu3ydCgqw-yK4UoLzokGp5yrz8CVoaHQfwCz8ym9yA4Ekx24oKqbDypVawwy9pEHCAwzxa3m5EG1LDDV8swhU4embwVzi1y4fz8coiGQU9EeU-eC-5u8BwNU9oboS4ouK5Qq78ohXF3U8pE8FUlxuiueyK5okyEC8wVw&__comet_req=25&fb_dtsg="+dtsg+"&jazoest=25300&lsd=kQwoj2grbvdlOnXmuC9nTM&__aaid="+id+"&__spin_r=1010412528&__spin_b=trunk&__spin_t=1702540563&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22US%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A60%2C%22logging_id%22%3A%224034760264%22%7D%2C%22cardholder_name%22%3A%22"+encodeURIComponent(card.cardName)+"%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22"+first6+"%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22"+last4+"%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22"+cardNumber+"%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22"+card.cardCsv+"%22%7D%2C%22expiry_month%22%3A%22"+expMonth+"%22%2C%22expiry_year%22%3A%2220"+expYear+"%22%2C%22payment_account_id%22%3A%22"+id+"%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702540566252_4f062482-d4e4-4c40-b8c5-c0d643d0e5b4%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702540566252_5d97ef95-3809-4231-a8b3-f487855c965d%22%7D%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%2212%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
                        "method": "POST"
                    })

                }

                if (mode == 4) {

                    res = await fetch("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=3823", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "x-fb-friendly-name": "useBillingAddCreditCardMutation",
                            "cookie": cookie,
                            "Referer": "https://business.facebook.com/",
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "body": "av="+uid+"&payment_dev_cycle=prod&__usid=6-Ts5nduusqru6%3APs5nduu1s4ryxb%3A0-As5nduuzgap66-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=1o&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010413747&__s=a9ss2l%3Aptab0y%3Ae2tqc1&__hsi=7312362442079618026&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxKaxq1UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwYwgm6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&fb_dtsg="+dtsg+"&jazoest=25289&lsd=WCAAksbHDq9ktWk0fRV9iq&__aaid="+id+"&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542054&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A45%2C%22logging_id%22%3A%223760170890%22%7D%2C%22cardholder_name%22%3A%22"+encodeURIComponent(card.cardName)+"%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22"+first6+"%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22"+last4+"%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22"+cardNumber+"%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22"+card.cardCsv+"%22%7D%2C%22expiry_month%22%3A%22"+expMonth+"%22%2C%22expiry_year%22%3A%2220"+expYear+"%22%2C%22payment_account_id%22%3A%22"+id+"%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542056078_4b48c676-8dff-447d-8576-be8eace3fa70%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542056078_63cbaee3-ff87-45c3-8093-96bbd0331e68%22%7D%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%227%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
                        "method": "POST"
                    })

                }

                if (mode == 5) {

                    res = await fetch("https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=3674", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "x-fb-friendly-name": "useBillingAddCreditCardMutation",
                            "cookie": cookie,
                            "Referer": "https://adsmanager.facebook.com/",
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "body": "av="+uid+"&payment_dev_cycle=prod&__usid=6-Ts5nebgytlglm%3APs5ned212v0lbj%3A0-As5nebgnh3ghe-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=1d&__hs=19705.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010413747&__s=338clt%3Ahvf4zf%3Afrhk6f&__hsi=7312365256460775839&__dyn=7AgSXgWGgWEjgDBxmSudgf64ECbxGuml4AqxuUgBwCwXCwABzGCGq5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV0JyU6O78qgOVp8W9AylmnyUb8jz98eUS48C11xny-cyo725UiGm1ixWcgsxN6ypVoKcyV8W22m78eF8pK3m2DBCG4UK4EigK7oOiewzxG8gdoJ3byEZ0Wx6i2Sq7oV1JyEgx2aK48OimbAy8tKU-4U-UG7F8a898O4FEjCx6EO489UW5ohwZAxK4U-dwKUjyEG4E949BGUryrhUK5Ue8Sp1G3WaUjxy-dxiFAm9KcyrBwGLg-2qcy9oCagixi48hyVEKu9DAG228BCyKqi2e4EdomyE6-uvAxO17wgVoK3Cd868g-cwNxaHgaEeU-eC-5u8BwNU9oboS4ouK5Qq78ohXF3U8pE8FUlxuiueyK5okyEC8wVw&__comet_req=25&fb_dtsg="+dtsg+"&jazoest=25466&lsd=V93_40ILei7NAmQfSh_tls&__aaid="+item.ad+"&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542709&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A41%2C%22logging_id%22%3A%223115641264%22%7D%2C%22cardholder_name%22%3A%22"+encodeURIComponent(card.cardName)+"%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22"+first6+"%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22"+last4+"%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22"+cardNumber+"%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22"+card.cardCsv+"%22%7D%2C%22expiry_month%22%3A%22"+expMonth+"%22%2C%22expiry_year%22%3A%2220"+expYear+"%22%2C%22payment_account_id%22%3A%22"+id+"%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542711187_368e9941-43bc-4e54-8a9a-78e0e48980fd%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542711187_088ec65b-5388-4d82-8e28-12533de0fff5%22%7D%2C%22actor_id%22%3A%22"+uid+"%22%2C%22client_mutation_id%22%3A%228%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
                        "method": "POST"
                    })

                }

                if (res) {

                    const data = await res.text()

                    if (data.includes('{"credit_card":{"card_association":"')) {

                        resolve()

                    } else {
                        reject()
                    }

                } else {
                    reject()
                }


            } catch (err) {
                reject(err)
            }

        })
    }

    uploadCamp(id, content) {
        return new Promise(async (resolve, reject) => {
            const cookie = this.cookie
            const dtsg = this.dtsg
            const uid = this.uid


            try {

                const res = await fetch("https://adsmanager.facebook.com/adsmanager/manage/campaigns?act="+id+"&breakdown_regrouping=1", {
                    "headers": {
                      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                      "accept-language": "vi",
                      "cache-control": "max-age=0",
                      "dpr": "1",
                      "sec-ch-prefers-color-scheme": "dark",
                      "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                      "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"119.0.2151.44\", \"Chromium\";v=\"119.0.6045.105\", \"Not?A_Brand\";v=\"24.0.0.0\"",
                      "sec-ch-ua-mobile": "?0",
                      "sec-ch-ua-model": "\"\"",
                      "sec-ch-ua-platform": "\"Windows\"",
                      "sec-ch-ua-platform-version": "\"15.0.0\"",
                      "sec-fetch-dest": "document",
                      "sec-fetch-mode": "navigate",
                      "sec-fetch-site": "same-origin",
                      "sec-fetch-user": "?1",
                      "upgrade-insecure-requests": "1",
                      "viewport-width": "1868",
                      "cookie": cookie,
                      "Referer": "https://adsmanager.facebook.com/adsmanager?act="+id+"&breakdown_regrouping=true",
                      "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": null,
                    "method": "GET"
                })

                const data = await res.text()

                const idMatches = data.match(/(?<=\"id\":\")[^\"]*/g).filter(item => data.includes('addraft_'+item))
                const accessTokenMatches = data.match(/window.__accessToken="(.*)";/)
             
                if (idMatches[0] && accessTokenMatches[1]) {

                    const res = await fetch("https://adsmanager.facebook.com/adsmanager/loadtsv/?_flowletID=25848", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "dpr": "0.9",
                            "sec-ch-prefers-color-scheme": "light",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "viewport-width": "1784",
                            "x-asbd-id": "129477",
                            "x-fb-lsd": "Na3bFKp5CD6pYKgb9LqZ8K",
                            "x-fb-qpl-active-flows": "270216139",
                            "cookie": cookie,
                            "Referer": "https://adsmanager.facebook.com/adsmanager/manage/campaigns?act="+id+"&breakdown_regrouping=true",
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "body": "account_id="+id+"&app_id=119211728144504&draft_id="+idMatches[0]+"&image_mapping&video_mapping&import_session_token=f25be15fff3f088&tsv="+encodeURIComponent(content)+"&__usid=6-Ts5skwzbugcgj%3APs5skwz143ib2c%3A1-As5skwzwp2a51-RV%3D6%3AF%3D&__user="+uid+"&__a=1&__req=2h&__hs=19708.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010468872&__s=b1wlmr%3Ax84cnl%3Aeq9o3h&__hsi=7313403664345298140&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3Kq2imeGqFEkG4VEHoOqqE88lBxeipe9wNWAAzppFuUuGfxW2u5Eiz8WdyU8ryUKrVoS3u7azoV2EK12xqUC8yEScx6bxW5FQ4Vbz8ix2q9hUhzoizE-Hx6exd0BAggwwCzoO69UryFE4eaKFprzu6QUCZ0IXGECutk2dmm7Hzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgoj-bUO9ws8nxaFo5a7EN1O74q9DByUObAzE89oswWADx6UdoapVGxebxa4AbxR2V8W2e6Ex0RyQcKazQ3G4p8bpEtzA6Sax248GUgz99oKi8xSXzUjzXyEuAwEwAz8iCxeq4qz8gwDzElx63Si6UjzUS2XxeayGzU949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypVawwy9pEHCAwzxa3m5EG1LDDV8sw8KmbwVzi1y4fz8coiGQU9EeU-eC-5u8BwNU9oboS4ouK5Qq78ohXF3U8pE8FUlxuiueyK5okyEC8wVw&__csr=&__comet_req=25&fb_dtsg="+dtsg+"&lsd=Na3bFKp5CD6pYKgb9LqZ8K&__aaid="+id+"&__spin_r=1010468872&__spin_b=trunk&__spin_t=1702784482&__jssesw=1&qpl_active_flow_ids=270216139",
                        "method": "POST"
                    })

                    const html = await res.text()

                    if (html.includes('async_session_id')) {
                        resolve({
                            id: idMatches[0],
                            token: accessTokenMatches[1]
                        })
                    } else {
                        reject()
                    }

                } else {
                    reject()
                }

            } catch (err) {

                console.log(err)

                reject(err)
            }
        })
    }

    lenCamp(id, draftData) {
        return new Promise(async (resolve, reject) => {
            const cookie = this.cookie
            const token = this.token
            const uid = this.uid

            try {

                let campIds = [] 

                for (let index = 0; index < 9999; index++) {

                    try {
                    
                        const res = await fetch("https://adsmanager-graph.facebook.com/v16.0/addraft_"+draftData.id+"/addraft_fragments?access_token="+draftData.token+"&__cppo=1&__activeScenarioIDs=[]&__activeScenarios=[]&__ad_account_id="+id+"&__entryPointPreloaded=1&__interactionsMetadata=[]&_flowletID=16287&_reqName=objectByName:addraft_"+draftData.id+"/addraft_fragments&_reqSrc=AdsDraftFragmentListDataManager&_sessionID=1476e856fb2bdd3&fields=[%22id%22]&include_headers=false&limit=500&locale=vi_VN&method=get&pretty=0&suppress_http_code=1&xref=faf5337645f224&", {
                            "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            "accept-language": "vi",
                            "cache-control": "max-age=0",
                            "sec-ch-ua": "\"Microsoft Edge\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "document",
                            "sec-fetch-mode": "navigate",
                            "sec-fetch-site": "none",
                            "sec-fetch-user": "?1",
                            "upgrade-insecure-requests": "1",
                            "cookie": cookie
                            },
                            "referrerPolicy": "strict-origin-when-cross-origin",
                            "body": null,
                            "method": "GET"
                        })

                        const data = await res.json()
                        campIds = data.data.map(item => item.id)

                        if (campIds.length > 0) {
                            break
                        }

                    } catch {}

                    await delayTimeout(1000)
                    
                }

                if (campIds.length > 0) {

                    const res = await fetch("https://adsmanager-graph.facebook.com/v16.0/"+draftData.id+"/publish?_reqName=object%3Adraft_id%2Fpublish&access_token="+draftData.token+"&method=post&qpl_active_flow_ids=270208286%2C270216423&qpl_active_flow_instance_ids=270208286_57f1ed6f4f15aa968%2C270216423_57f71109a3379888&__cppo=1&_flowletID=15185", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site",
                            "cookie": cookie,
                            "Referer": "https://adsmanager.facebook.com/",
                            "Referrer-Policy": "origin-when-cross-origin"
                        },
                        "body": '__activeScenarioIDs=["f03ab81b-0fff-45ce-94ec-4c77d7fd1c7d"]&__activeScenarios=["am.publish_ads.in_review_and_publish"]&__ad_account_id='+id+'&__interactionsMetadata=["{at_section:L3,current_action_objects_total_count:0,flow_instance_id:null,media_format:null,name:am.publish_ads.in_review_and_publish,revisit:0,start_callsite:AdsManagerPerfScenarioTriggerController_AdsPEUploadPreviewDialog.react,}"]&_flowletID=15185&_reqName=object:draft_id/publish&_reqSrc=AdsDraftPublishDataManager&_sessionID=4c8d448f2b7a2e57&fragments=["'+campIds.join('","')+'"]&ignore_errors=true&include_fragment_statuses=true&include_headers=false&locale=vi_VN&method=post&pretty=0&qpl_active_flow_ids=170208286,170216423&qpl_active_flow_instance_ids=170208286_57f1ed6f4f15aa968,170216423_57f71109a3379888&suppress_http_code=1&xref=f1d7b6c9f7bdd88',
                        "method": "POST"
                    })

                    const data = await res.json()

                    if (data.success) {
                        resolve()
                    } else {
                        console.log('1')
                        reject()
                    }

                } else {
                    console.log('2')
                    reject()
                }

                
            } catch (err) {

                console.log(err)

                reject(err)
            }
        })
    }

}

module.exports = Ad