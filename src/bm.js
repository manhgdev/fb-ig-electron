class Bm {

    constructor (cookie, token, uid) {
        this.uid = uid
        this.bmId = ''
        this.cookie = cookie
        this.token = token
        this.dtsg = ''
        this.permissionId = ''
    }
    
    async getBmId() {
        try {

            const res = await fetch("https://graph.facebook.com/v14.0/me/businesses?fields=id&limit=9999999&access_token="+this.token, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "cookie": this.cookie
                },
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })

            const data = await res.json()

            this.bmId = data.data[0].id
            
            return

        } catch (err) {
            throw Error(err)
        }
    }

    async getPermissionId() {
        try {

            const res = await fetch("https://business.facebook.com/settings/info?business_id="+this.bmId, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "cookie": this.cookie
                },
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })

            const html = await res.text()

            let mainIdMatch = html.match(/(?<=\"business_user_id\":\")[^\"]*/g)

            this.permissionId = mainIdMatch[0]

        } catch (err) {
            throw Error(err)
        }
    }

    

    async test() {

        try {

            const res = await fetch("https://graph.facebook.com/me?access_token="+this.token, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "vi",
                    "cache-control": "max-age=0",
                    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Microsoft Edge\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "cookie": this.cookie
                },
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })
    
            return await res.json()
    
        } catch (err) {
            throw Error(err)
        }

    }

    async share(id) {

        try {

            const res = await fetch("https://z-p3-graph.facebook.com/v17.0/"+this.bmId+"/client_ad_accounts?access_token="+this.token+"&__cppo=1", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Microsoft Edge\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "cookie": this.cookie,
                    "Referer": "https://business.facebook.com/",
                    "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": '__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&_reqName=object:brand/client_ad_accounts&_reqSrc=AdAccountActions.brands&access_type=AGENCY&adaccount_id=act_'+id+'&locale=vi_VN&method=post&permitted_roles=[]&permitted_tasks=["ADVERTISE","ANALYZE","DRAFT","MANAGE"]&pretty=0&suppress_http_code=1&xref=f27983f708bede8',
                "method": "POST"
            })

            return await res.json()

        } catch (err) {
            throw Error(err)
        }
        
    }

    async check(id) {

        try {

            const res = await fetch("https://business.facebook.com/api/graphql/", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",
                    "dpr": "0.9",
                    "sec-ch-prefers-color-scheme": "light",
                    "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \";Not A Brand\";v=\"99\"",
                    "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"119.0.6045.106\", \"Chromium\";v=\"119.0.6045.106\", \"Not?A_Brand\";v=\"24.0.0.0\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"10.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "1728",
                    "cookie": this.cookie,
                    "Referer": "https://business.facebook.com/",
                    "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": "av="+this.uid+"&__user="+this.uid+"&__a=1&__req=l&__hs=19658.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1009549596&__s=jq8lp7%3A92cjs6%3Aca3fei&__hsi=7294946552908453770&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCwRCwqojyUV0RAAzpoixW4E5S2WdwJwCwq8gwqoqyoyazoO4o461twOxa7FEd89EmwoU9FE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G5udz87G0FoO12ypUuwg88EeAUpK1vDwFwBgak48W18wRwEwiUmwoErorx2aK2a4p8y26U8U-UvzE4S7VEjCx6221cwjUd8-dwKwHxa1ozFUK1gzpA6EfEO32fxiFVoa9obGwgUy1kx6bCyVUCfwLCyKbwzweau0Jo4m2C4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg="+this.dtsg+"&jazoest=25497&lsd=hyxkec1fuHthDTsbbI9qgs&__aaid=0&__bid="+this.bmId+"&__spin_r=1009549596&__spin_b=trunk&__spin_t=1698487101&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingCheckPreloadingQEQuery&variables=%7B%22paymentAccountID%22%3A%22"+id+"%22%2C%22universes%22%3A%5B%7B%22params%22%3A%5B%22should_preload%22%5D%2C%22type%22%3A%22PAYMENT_ACCOUNT%22%2C%22universe_name%22%3A%22billing_preload_www_add_pm%22%7D%5D%7D&server_timestamps=true&doc_id=6776006182411900",
                "method": "POST"
            })

            return await res.json()

        } catch (err) {
            throw Error(err)
        }

    }

    async pending() {

        try {

            const res = await fetch("https://graph.facebook.com/v17.0/"+this.bmId+"/pending_client_ad_accounts?access_token="+this.token+"&__cppo=1&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Fpending_client_ad_accounts&_reqSrc=BusinessConnectedPendingClientAdAccountsStore.brands&date_format=U&fields=%5B%22id%22%2C%22ad_account.fields(id%2Cname%2Caccount_id%2Caccount_status%2Cbusiness%2Ccreated_time%2Ccurrency%2Ctimezone_name%2Cend_advertiser%2Cend_advertiser_name%2Cinvoicing_emails%2Cis_disabled_umbrella%2Clast_spend_time)%22%2C%22permitted_roles%22%2C%22permitted_tasks%22%5D&filtering=%5B%7B%22field%22%3A%22account_status%22%2C%22operator%22%3A%22NOT_EQUAL%22%2C%22value%22%3A%226%22%7D%5D&limit=25&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f8fa354cd7ed84", {  
                "headers": {
                    "accept": "*/*",    
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",   
                    "sec-ch-ua-mobile": "?0",    
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",    
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",    
                    "cookie": this.cookie,
                    "Referer": "https://business.facebook.com/",    
                    "Referrer-Policy": "origin-when-cross-origin"
                },  
                "body": null,
                "method": "GET"
            })

            const data = await res.json()
            
            if (data.data) {
                return data.data
            } else {
                throw Error()
            }

        } catch (err) {

            console.log(err)

            throw Error()
        }

    }

    async cancel(id) {

        try {

            const res = await fetch("https://z-p3-graph.facebook.com/v17.0/"+this.bmId+"/adaccounts?access_token="+this.token+"&__cppo=1", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Microsoft Edge\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "cookie": this.cookie,
                    "Referer": "https://business.facebook.com/",
                    "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abrand%2Fadaccounts&_reqSrc=AdAccountActions.brands&adaccount_id=act_"+id+"&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&xref=f2f1e9007c465f4",
                "method": "POST"
            })

            return await res.json()

        } catch (err) {
            throw Error(err)
        }

    }

    async getDtsg() {

        try {

            const res = await fetch("https://business.facebook.com/business-support-home/", {
                "headers": {
                  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                  "accept-language": "vi",
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
                  "viewport-width": "1936",
                  "cookie": this.cookie
                },
                "referrerPolicy": "origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })

            const html = await res.text()

            const postTokenMatches = html.match(/(?<=\"token\":\")[^\"]*/g)

            this.dtsg = postTokenMatches[0]

        } catch (err) {
            throw Error(err)
        }

    }

    getRealDtsg() {
        const token = this.dtsg 
        const cookie = this.cookie 
    
        const xs = cookie.split('; ').filter(item => item.includes('xs=')).map(item => item.replace('xs=', '').split('%3A'))
    
        const start = xs[0][0]
        const end = xs[0][3]
    
        const finalDtsg = token.replace(token.split(':')[2], end).replace(token.split(':')[1], start)
    
        return finalDtsg
    
    }

    async permission(id) {

        const dtsg = this.getRealDtsg()

        try {

            const res = await fetch("https://business.facebook.com/business/business_objects/update/permissions/", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "en-US,en;q=0.9",
                  "content-type": "application/x-www-form-urlencoded",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "cookie": this.cookie,
                  "Referer": "https://business.facebook.com/settings/ad-accounts/"+id+"?business_id="+this.bmId,
                  "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": "asset_ids[0]="+id+"&asset_type=ad-account&business_id="+this.bmId+"&roles[0]=151821535410699&roles[1]=610690166001223&roles[2]=864195700451909&roles[3]=186595505260379&user_ids[0]="+this.permissionId+"&__user="+this.uid+"&__a=1&__req=z&__hs=19668.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009736702&__s=9d12in%3Aprxdif%3Ah129d0&__hsi=7298728906200616979&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o2vwOxa7FEd89EmwoU9FE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WElUScwuEnw8ScwgECu7E422a3Fe6rwnVU8FE9k2B12ewi8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio6-4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg="+dtsg+"&jazoest=25558&lsd=Or77EZofuf9cJCFD_UgPpxd&__aaid=0&__bid="+this.bmId+"&__spin_r=1009736702&__spin_b=trunk&__spin_t=1699367749&__jssesw=1",
                "method": "POST"
            })
            
            return await res.text()

        } catch (err) {
            throw Error(err)
        }

    }

    async changeInfo(id, country, timezone, currency) {

        try {

            const dtsg = this.getRealDtsg()
            
            const res = await fetch("https://business.facebook.com/api/graphql/?_flowletID=3123", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "en-US,en;q=0.9",
                  "content-type": "application/x-www-form-urlencoded",
                  "dpr": "1.125",
                  "sec-ch-prefers-color-scheme": "light",
                  "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                  "sec-ch-ua-full-version-list": "\"Chromium\";v=\"116.0.5845.190\", \"Not)A;Brand\";v=\"24.0.0.0\", \"Google Chrome\";v=\"116.0.5845.190\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-model": "\"\"",
                  "sec-ch-ua-platform": "\"Windows\"",
                  "sec-ch-ua-platform-version": "\"10.0.0\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "viewport-width": "3039",
                  "x-fb-friendly-name": "BillingAccountInformationUtilsUpdateAccountMutation",
                  "x-fb-lsd": "F_D2oHXHNCnspi72rOq1QN",
                  "cookie": this.cookie,
                  "Referer": "https://business.facebook.com/billing_hub/accounts/details/?business_id="+this.bmId+"&asset_id="+id,
                  "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": "av="+this.uid+"&__usid=&__user="+this.uid+"&__a=1&__req=&dpr=1&__ccg=EXCELLENT&__rev=1009739567&__s=fmzy25%3A5wjot6%3Aykpzxg&__hsi=7298796659933252680&__dyn=7xeUmxa3-Q5E9EdoK2abBWqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898888oe82xwCCwjFFpobQ4u2SmGxBa2dmm11K6U8o7y78jCggwExm3G4UhwXwEwl-dw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U984678-3K5E7VxK48W2a4p8y26U8U-U98C2i48nxm498W6888dUnwj84idwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&__csr=&fb_dtsg="+dtsg+"&jazoest=25717&lsd=uwnThuF4Izg8E80xK6f6sY&__aaid="+id+"&__bid="+this.bmId+"&__spin_r=1009739567&__spin_b=trunk&__spin_t=1699383524&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingAccountInformationUtilsUpdateAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22"+id+"%22%2C%22currency%22%3A%22"+currency+"%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A37%2C%22logging_id%22%3A%2235834839%22%7D%2C%22tax%22%3A%7B%22business_address%22%3A%7B%22city%22%3A%22%22%2C%22country_code%22%3A%22"+country+"%22%2C%22state%22%3A%22%22%2C%22street1%22%3A%22%22%2C%22street2%22%3A%22%22%2C%22zip%22%3A%22%22%7D%2C%22business_name%22%3A%22%22%2C%22is_personal_use%22%3Afalse%2C%22second_tax_id%22%3A%22%22%2C%22tax_id%22%3A%22%22%2C%22tax_registration_status%22%3A%22%22%7D%2C%22timezone%22%3A%22"+encodeURIComponent(timezone)+"%22%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22BILLING_HUB%22%2C%22external_flow_id%22%3A%22%22%2C%22target_name%22%3A%22BillingAccountInformationUtilsUpdateAccountMutation%22%2C%22user_session_id%22%3Anull%2C%22wizard_config_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_screen_name%22%3A%22account_information_state_display%22%2C%22wizard_session_id%22%3Anull%7D%2C%22actor_id%22%3Anull%2C%22client_mutation_id%22%3A%220%22%7D%7D&server_timestamps=true&doc_id=23988069674173253",
                "method": "POST"

            })

            return await res.json()

        } catch (err) {
            throw Error(err)
        }
    }

    async add2(id, data) {

        try {

            data.cardNumber = parseInt(data.cardNumber.toString().replaceAll(' ', ''))
            data.expMonth = parseInt(data.expMonth)
            data.expYear = parseInt(data.expYear)

            const first6 = parseInt(data.cardNumber.toString().substr(0, 6))
            const last4 = parseInt(data.cardNumber.toString().slice(-4))

            const res = await fetch("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5591", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "vi",
                  "content-type": "application/x-www-form-urlencoded",
                  "sec-ch-ua": "\"Chromium\";v=\"118\", \"Microsoft Edge\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"Windows\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-site",
                  "x-fb-friendly-name": "useBillingAddCreditCardMutation",
                  "cookie": "sb=asA9ZS8xXekLl8EdQQlEZfdo; datr=asA9ZXHLCrGjwttCuSxneJT8; locale=vi_VN; c_user=100071887106038; presence=EDvF3EtimeF1698567458EuserFA21B71887106038A2EstateFDutF0CEchF_7bCC; xs=50%3AeXNGBGOgQl700g%3A2%3A1698567446%3A-1%3A6277%3A%3AAcXAbaiMaUQVJvdGKgX5fd5jsF5a4b8vn9Ezx6qUYA; fr=1CyRzGDj3e4wReX2M.AWWNKbGvtMwc2EGuXD1nssC8nhE.BlPjJj.Hd.AAA.0.0.BlPjJj.AWWCfG_uE40; wd=1936x1318; usida=eyJ2ZXIiOjEsImlkIjoiQXMzYWRpdjZjbHB3bSIsInRpbWUiOjE2OTg1NzU5ODR9",
                  "Referer": "https://business.facebook.com/",
                  "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": "av="+this.uid+"&payment_dev_cycle=prod&__usid=6-Ts3a9md1syvqep%3APs3adiukei6gi%3A0-As3adiv6clpwm-RV%3D6%3AF%3D&__user="+this.uid+"&__a=1&__req=20&__hs=19659.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009553608&__s=5fwcsr%3Aiqwdat%3Ad0pees&__hsi=7295327777672531848&__dyn=7xeUmxa3-Q5E9EdoK2abBWqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898888oe82xwCCwjFFpobQ4u2SmGxBa2dmm11K6UG5E7y78jCggwExm3G4UhwXwEwl-dw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U984678-3K5Ef845xK48W2a4p8y26U8U-U98C2i48nxm498W6888dUnwj84idwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg="+this.dtsg+"&jazoest=25287&lsd=WsM_URWBmesIfysbCz_Vyq&__aaid=515485720765187&__bid="+this.bmId+"&__spin_r=1009553608&__spin_b=trunk&__spin_t=1698575862&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22"+this.country+"%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A49%2C%22logging_id%22%3A%223403087759%22%7D%2C%22cardholder_name%22%3A%22"+encodeURIComponent(data.cardName)+"%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22"+first6+"%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22"+last4+"%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22"+data.cardNumber+"%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22"+data.cardCsv+"%22%7D%2C%22expiry_month%22%3A%22"+data.expMonth+"%22%2C%22expiry_year%22%3A%22"+data.expYear+"%22%2C%22payment_account_id%22%3A%22"+id+"%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1698575864815_07b422db-3dc6-4b1e-a508-365cece000da%22%2C%22wizard_session_id%22%3A%22upl_wizard_1698575892025_6c83fdb3-5b00-4685-991b-e1a246b2dd16%22%7D%2C%22actor_id%22%3A%22100071887106038%22%2C%22client_mutation_id%22%3A%226%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
                "method": "POST"
            })

            return await res.json()

        } catch (err) {
            throw Error(err)
        }

    }

    async add(id, data) {

        try {

            data.cardNumber = parseInt(data.cardNumber.toString().replaceAll(' ', ''))
            data.expMonth = parseInt(data.expMonth)
            data.expYear = parseInt(data.expYear)

            const first6 = parseInt(data.cardNumber.toString().substr(0, 6))
            const last4 = parseInt(data.cardNumber.toString().slice(-4))

            const res = await fetch("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=8295", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "vi",
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Microsoft Edge\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "x-fb-friendly-name": "useBillingAddCreditCardMutation",
                    "cookie": this.cookie,
                    "Referer": "https://business.facebook.com/",
                    "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": "av="+this.uid+"&payment_dev_cycle=prod&__usid=6-Ts37yz418lvgxk%3APs380lx1wj6d2p%3A0-As37yynz66fza-RV%3D6%3AF%3D&__user="+this.uid+"&__a=1&__req=38&__hs=19658.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009546204&__s=spbt7h%3A1kmfrg%3Ai5j7nz&__hsi=7294855122010371166&__dyn=7xeUmxa3-Q5E9EdoK2abBWqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898888oe82xwCCwjFFpobQ4u2SmGxBa2dmm11K6U8o7y78jCggwExm3G4UhwXwEwgolUS0DU2qwgEhxWbwQwnHxC1zVoao9k2B2V8W2e2i11xOfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O14zobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&fb_dtsg="+this.dtsg+"&jazoest=25670&lsd=LGSwpCQj1i4CRbISKibIlN&__aaid=1493603831415862&__bid="+this.bmId+"&__spin_r=1009546204&__spin_b=trunk&__spin_t=1698465813&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22"+this.country+"%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A50%2C%22logging_id%22%3A%223367741736%22%7D%2C%22cardholder_name%22%3A%22"+encodeURIComponent(data.cardName)+"%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22"+first6+"%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22"+last4+"%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22"+data.cardNumber+"%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22"+data.cardCsv+"%22%7D%2C%22expiry_month%22%3A%22"+data.expMonth+"%22%2C%22expiry_year%22%3A%22"+data.expYear+"%22%2C%22payment_account_id%22%3A%22"+id+"%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1698465814049_85f2703f2-ccd2-4d05-8f01-4ed78cc79bf2%22%2C%22wizard_session_id%22%3A%22upl_wizard_16984658140493_6ea26c42-add3-4bcd-a529-2aba16f42f23%22%7D%2C%22actor_id%22%3A%22"+this.uid+"%22%2C%22client_mutation_id%22%3A%226%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
                "method": "POST"
            })

            return await res.json()

        } catch (err) {
            throw Error(err)
        }

    }

}
