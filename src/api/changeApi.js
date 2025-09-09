const generator = require('generate-password')

class Change {

    constructor(item, setting, data) {
        this.item = item
        this.setting = setting 
        this.cookie = data.cookie 
        this.dtsg = data.dtsg
    }

    changePassword(message) {

        return new Promise(async (resolve, reject) => {

            let newPassword = ''

            try {

                let newPwd = ''

                if (this.setting.randomPassword.value) {
                    newPwd = 'A@!'+generator.generate({
                        length: 12,
                        numbers: true
                    })
                } else {
                    newPwd = this.setting.newPassword.value
                }

                message('Đang đổi mật khẩu')

                const res = await fetch("https://www.facebook.com/api/graphql/", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-site",
                        "cookie": this.cookie,
                        "Referer": "https://mbasic.facebook.com/",
                        "Referrer-Policy": "origin-when-cross-origin"
                    },
                    "body": "av="+this.item.uid+"&__user="+this.item.uid+"&__a=1&__dyn=7AzHxqU5a5Q1ryUqxenFw9uu2i5U4e0ykdwSwAyUco2qwJxS1NwJwpUe8hw6vwb-q7oc81xoswaq221FwgolzUO0n2US2G5Usw9m1YwBgK7o884y0Mo4G4Ufo5m1mzXw8W58jwGzEaE5e7oqBwJK2W5olwUwgojUlDw-wUws9ovUaU3VBwJCwLyES0Io5d08O321bwzwTwNxe6Uak1xwJwxw&__csr=gz2zECOcYp4p6KJYAZ9ZlfuFpJCjW_tl8IhTiiHH8uLJprilkFlF6Ah9qXCVeieh999LhVF9FqCDLCzVEy4oC9VWxhoy9y8XxC2qex2fDBwko89FEy32Egzouxy2KbwUDxy2i2qbxy2i1zwkF852i3a1mwNwpE5K1rwYyE4q9wvEhwsU6S17wqE5G22266Epwj80d2U0c_U02UUw1By00GSU0kVg1u80HO0aGw7_x20lC2a&__req=c&__hs=19349.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1&__ccg=EXCELLENT&__rev=1006770320&__s=i3lqb8%3Av8tmwz%3Afp9vfk&__hsi=7180247638856180079&__comet_req=15&fb_dtsg="+this.dtsg+"&jazoest=25511&lsd=hndTbHt42JRtRmLzvE6vVC&__spin_r=1006770320&__spin_b=trunk&__spin_t=1671781679&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PrivacyCheckupPasswordChangeMutation&variables=%7B%22input%22%3A%7B%22confirm_password%22%3A%22"+newPwd+"%22%2C%22new_password%22%3A%22"+newPwd+"%22%2C%22old_password%22%3A%22"+this.item.password+"%22%2C%22allow_unchanged%22%3Afalse%2C%22actor_id%22%3A%22"+this.item.uid+"%22%2C%22client_mutation_id%22%3A%221%22%7D%7D&server_timestamps=true&doc_id=5234317409926323",
                    "method": "POST"
                })

                const data = await res.json()

                if (data.data.password_change.client_mutation_id == 1) {

                    message('Đổi mật khẩu thành công')

                    newPassword = newPwd

                } else if (data.errors) {
                    message('Đổi mật khẩu thất bại: '+data.errors[0].description)
                } else {
                    message('Đổi mật khẩu thất bại')
                }

            } catch {
                message('Đổi mật khẩu thất bại')
            }

            resolve(newPassword)

        })
    }


}

module.exports = Change