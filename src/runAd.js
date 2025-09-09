const Db = require('./db.js')
const {loginCookieApi} = require('./login.js')
const {delayTimeout, formatAdData} = require('./core.js')
const Ad = require('./ad.js')
const moment = require('moment')
const fs = require('fs-extra')
const detect = require('charset-detector')

module.exports = (item, setting, mode, send) => {
    return new Promise(async (resolve, reject) => {

        const ads = new Db('ads')
        const tkqc = new Db('ads/tkqc')
        
        const via = await ads.findById(item.uid)
        const cookie = via.cookies
        const token = via.accessToken


        send('message', {id: item.id, message: 'Đang đăng nhập'})

        try {

            const dtsg = await loginCookieApi(cookie)

            const ad = new Ad(item.uid, cookie, token, dtsg)

            send('message', {id: item.id, message: 'Đăng nhập thành công'})

            if (setting.addCard.value && mode === 'normal') {

                if (item.payment.includes('PaymentCredentialDetails')) {

                    send('message', {id: item.id, message: 'Tài khoản đã có thẻ'})

                } else {

                    const max = setting.maxCard.value
                    let card = false

                    const cardDb = new Db('card')

                    send('message', {id: item.id, message: 'Đang lấy thông tin thẻ'})

                    for (let index = 0; index < 99; index++) {
                        
                        try {

                            card = await cardDb.findOne(item => {

                                let diff = 0

                                if (item.time) {
                                    const start = moment(item.time)
                                    const now = moment()
                                    diff = start.diff(now, 'seconds')
                                }

                                return item.running === false && item.count < max && diff === 0
                            })

                            break

                        } catch {}

                        await delayTimeout(1000)
                        
                    }

                    if (card) {

                        send('message', {id: item.id, message: 'Đang tiến hành add thẻ'})

                        const count = card.count
                        await cardDb.update(card.id, {running: true})

                        try {

                            await ad.addCard(item.adId, card, setting.addCardMode.value)

                            send('message', {id: item.id, message: 'Add thẻ thành công'})

                            await cardDb.update(card.id, {
                                count: count + 1,
                                time: moment().add((setting.cardDelay.value / 10), 'seconds')
                            })

                        } catch (err) {
                            console.log(err)
                            send('message', {id: item.id, message: 'Add thẻ thất bại'})
                        }

                        await cardDb.update(card.id, {running: false})

                    } else {
                        send('message', {id: item.id, message: 'Không có thẻ để add'})
                    }

                }

            }

            if (setting.rename.value && mode === 'normal') {
                try {

                    send('message', {id: item.id, message: 'Đang tiến hành đổi tên tài khoản'})

                    await ad.changeName(item.adId, setting.newName.value)

                    send('message', {id: item.id, message: 'Đổi tên tài khoản thành công'})

                } catch {
                    send('message', {id: item.id, message: 'Đổi tên tài khoản thất bại'})
                }
            }

            if (setting.changeInfo.value && mode === 'normal') {

                try {

                    send('message', {id: item.id, message: 'Đang tiến hành đổi thông tin tài khoản'})

                    await ad.changeInfo(item.adId, setting.currency.value, setting.timezone.value, setting.country.value)

                    send('message', {id: item.id, message: 'Đổi thông tin tài khoản thành công'})

                } catch {
                    send('message', {id: item.id, message: 'Đổi thông tin tài khoản thất bại'})
                }

            }

            if (setting.removeAdmin.value && mode === 'normal') {

                if (setting.removeHidden.value || setting.removeAll.value) {

                    try {

                        send('message', {id: item.id, message: 'Đang check admin ẩn'})

                        const hiddenAdmins = await ad.checkHiddenAdmin(item.adId)                    

                        if (hiddenAdmins.length > 0) {

                            let removeAdminSuccess = 0

                            send('message', {id: item.id, message: 'Đang xóa '+hiddenAdmins.length+' admin ẩn'})

                            for (let index = 0; index < hiddenAdmins.length; index++) {

                                try {

                                    const id = hiddenAdmins[index]

                                    await ad.removeUser(item.adId, id)
                                    
                                    removeAdminSuccess++

                                } catch {}

                                await delayTimeout(2000)
                                
                            }

                            send('message', {id: item.id, message: 'Đã xóa '+removeAdminSuccess+'/'+hiddenAdmins.length+' admin ẩn'})

                        } else {
                            send('message', {id: item.id, message: 'Tài khoản không có admin ẩn'})
                        }
                        

                    } catch (err) {
                        console.log(err)
                        send('message', {id: item.id, message: 'Check admin ẩn thất bại'})
                    }

                }

                if (setting.removeAll.value) {

                    try {

                        const users = (await ad.getUser(item.adId)).map(item => item.id).filter(user => user != item.uid)

                        send('message', {id: item.id, message: 'Đang xóa '+users.length+' admin'})

                        if (users.length > 0) {

                            let removeAdminSuccess = 0

                            for (let index = 0; index < users.length; index++) {

                                try {

                                    const id = users[index]

                                    await ad.removeUser(item.adId, id)

                                    removeAdminSuccess++

                                } catch {}
                                
                                await delayTimeout(2000)
                            }

                            send('message', {id: item.id, message: 'Đã xóa '+removeAdminSuccess+'/'+users.length+' admin'})

                        } else {

                            send('message', {id: item.id, message: 'Không có admin để xóa'})

                        }

                    } catch (err) {
                        console.log(err)
                        send('message', {id: item.id, message: 'Xóa admin thất bại'})
                    }

                }

            }

            if (setting.lenCamp.value && mode === 'normal') {

                try {

                    const fileBuffer = await fs.promises.readFile(setting.fileCamp.value)
                    const detected = detect(fileBuffer)
                    const encoding = detected[0] ? detected[0].charsetName : 'utf-8'

                    const fileContent = await fs.promises.readFile(setting.fileCamp.value, {encoding})

                    let draftData = false

                    try {

                        send('message', {id: item.id, message: 'Đang upload camp'})

                        draftData = await ad.uploadCamp(item.adId, fileContent)

                        send('message', {id: item.id, message: 'Upload camp thành công'})

                    } catch {}

                    if (draftData) {

                        send('message', {id: item.id, message: 'Đang tiến hành lên camp'})

                        await ad.lenCamp(item.adId, draftData)

                        send('message', {id: item.id, message: 'Lên camp thành công'})

                    } else {
                        send('message', {id: item.id, message: 'Upload camp thất bại'})
                    }

                } catch {
                    send('message', {id: item.id, message: 'Lên camp thất bại'})
                }

            }

            try {

                const finalData = await ad.getAccountInfo(item.adId)

                await tkqc.update(item.adId, finalData)

                const formatData = formatAdData(finalData, item.id)

                if (formatData) {
                    send('updateData', formatData)
                }

                if (mode === 'refresh') {

                    send('message', {id: item.id, message: 'Lấy thông tin tài khoản thành công'})

                }

            } catch {

                if (mode === 'refresh') {

                    send('message', {id: item.id, message: 'Lấy thông tin tài khoản thất bại'})

                }
            }

        } catch {
            send('message', {id: item.id, message: 'Đăng nhập thất bại'})
        }

        resolve()
        
    })
}