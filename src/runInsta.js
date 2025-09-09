const IG = require('./insta.js')
const moment = require('moment')
const fetch = require('node-fetch')
const generator = require('generate-password')
const fs = require('fs')
const path = require('path')
const log = require('./log.js')
const {app} = require('electron')

const {
    useTmProxy, 
    useShopLikeProxy, 
    useTinProxy, 
    useProxyFb, 
    useProxy,
    delayTimeout,
    randomUserAgent,
    shuffle,
    randomNumberRange
} = require('./core.js')

module.exports = (data, send) => {

    return new Promise(async (resolve, reject) => {

        const setting = data.setting
        const tool = data.tool
        const item = data.item
        const mode = data.mode

        send('running', item.id)

        let stopped = false

        const timeout = (setting.timeout.value * 100)


        let timer = setTimeout(async () => {

            try {

                try { await browser.close() } catch {}

                send('updateStatus', {id: item.id, status: 'Timeout'})

                const time = moment().format('DD/MM/YYYY - H:m:s')

                send('finish', {item, time})
                
                clearTimeout(timer)

                stopped = true

                return reject()

            } catch {}
            
        }, timeout)

        if (mode === 'changePassMailInsta' && !stopped) {

            try {

                await send('message', {id: item.id, message: 'Đang đổi mật khẩu email'})

                const newPass = randomNumberRange(10000000, 99999999)

                const res = await fetch("https://gmx.live/changepass.php", {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    "body": "email="+item.email+"&currentPassword="+item.passMail+"&newPassword="+newPass+"&confirmPassword="+newPass+"&submit=",
                    "method": "POST"
                })

                const data = await res.text()

                if (data.includes('Password updated successfully')) {

                    await send('message', {id: item.id, message: 'Đổi mật khẩu email thành công'})

                    send('updatePassMailInsta', {id: item.id, newPass})

                } else {

                    await send('message', {id: item.id, message: 'Đổi mật khẩu email thất bại'})

                }

            } catch (err) {

                await send('message', {id: item.id, message: 'Đổi mật khẩu email thất bại'})

            }

        } else {

            try {

                let ip = ''
                let error = false 

                if (item.proxyKey && !error && !stopped) {

                    try {

                        if (setting.proxy.value === 'httpProxy' || setting.proxy.value === 'sProxy') {
                            ip = item.proxyKey
                        }
                        
                        if (setting.proxy.value === 'tmProxy') {
                            ip = await useTmProxy(item.proxyKey, msg => {
                                send('message', {id: item.id, message: msg})
                            })
                        }

                        if (setting.proxy.value === 'shopLike') {
                            ip = await useShopLikeProxy(item.proxyKey, msg => {
                                send('message', {id: item.id, message: msg})
                            })
                        }

                        if (setting.proxy.value === 'tinSoft') {
                            ip = await useTinProxy(item.proxyKey, msg => {
                                send('message', {id: item.id, message: msg})
                            })
                        }

                        if (setting.proxy.value === 'proxyFb') {
                            ip = await useProxyFb(item.proxyKey, msg => {
                                send('message', {id: item.id, message: msg})
                            })
                        }
                    

                    } catch {
                        error = true
                    }

                }

                if (ip && !error && !stopped) {

                    try {

                        const agent = useProxy(ip)

                        try {
                            const res = await fetch('https://api.myip.com/', {agent})
                            data = await res.json()
                        } catch {
                            const res = await fetch('https://api.country.is', {agent})
                            data = await res.json()
                        }

                        if (data.ip) {

                            await send('message', {id: item.id, message: 'Sử dụng IP: '+data.ip})
                            await delayTimeout(1000)

                        } else {
                            error = true
                        }

                    } catch (err) {

                        console.log(err)

                        await send('message', {id: item.id, message: 'Lỗi proxy'})
                        error = true
                    }

                }

                if (!error && !stopped) {

                    const userAgent = await randomUserAgent(setting.userAgent.value)

                    const ig = new IG({
                        proxy: ip,
                        username: item.uid,
                        password: item.password,
                        email: item.email,
                        passMail: item.passMail,
                        UA: userAgent,
                        twofa: item.twofa,
                    })

                    try {

                        if (item.cookies && setting.useCookieInsta.value) {

                            try {

                                send('message', {id: item.id, message: 'Đang đăng nhập cookie Instagram'})

                                await ig.loginCookie(item.cookies)

                            } catch (err) {

                                if (err === '282' || err === 'mail' || err === 'die_vv' || err === 'captcha' || err === 'add_phone') {

                                    throw err
                                    
                                } else {

                                    if (item.cookies) {
                                        send('updateCookie', {
                                            id: item.id,
                                            type: 'instagram',
                                            cookies: '',
                                        })
                                    }
        
                                    send('message', {id: item.id, message: 'Đăng nhập lại bằng password'})
        
                                    await ig.login()
        
                                    send('updateCookie', {
                                        id: item.id,
                                        type: 'instagram',
                                        cookies: ig.options.headers.cookie,
                                    })
                                    
                                }

                            }
                            
                        } else {

                            send('message', {id: item.id, message: 'Đang đăng nhập Instagram'})

                            await ig.login()

                            send('updateCookie', {
                                id: item.id,
                                type: 'instagram',
                                cookies: ig.options.headers.cookie,
                            })
                            
                        }

                        await ig.getDtsg()

                        send('message', {id: item.id, message: 'Đăng nhập thành công'})

                        if (mode === 'khangAdsInsta' && !stopped) {
                        
                            try {

                                await ig.checkAd()

                                send('message', {id: item.id, message: 'Ads Live'})

                            } catch {

                                try {
                                    send('message', {id: item.id, message: 'Đang kháng ads'})

                                    await ig.khangAd()

                                    send('message', {id: item.id, message: 'Kháng ads thành công'})

                                } catch {
                                    send('message', {id: item.id, message: 'Kháng ads thất bại'})
                                }

                            }

                        }

                        if (mode === 'checkMediaInsta' && !stopped) {

                            try {
    
                                send('message', { id: item.id, message: 'Đang check media' })
    
                                await ig.checkMedia()
    
                                send('message', { id: item.id, message: 'Mặt hàng OK' })
    
                            } catch (err) {
    
                                if (err) {
                                    send('message', { id: item.id, message: err })
                                } else {
                                    send('message', { id: item.id, message: 'Lỗi check media' })
                                }
                            }
    
                        }
                        if (mode === 'checkDongInsta' && !stopped) {

                            try {
    
                                send('message', { id: item.id, message: 'Đang check dòng ID' })
    
                                const res = await ig.checkDong()
    
                                send('message', { id: item.id, message: res })
    
                            } catch (err) {
    
                                if (err) {
                                    send('message', { id: item.id, message: err })
                                } else {
                                    send('message', { id: item.id, message: 'Lỗi check dòng ID' })
                                }
                            }
    
                        }
                        if (mode === 'checkNguonInsta' && !stopped) {
                            if (ig.userData.is_professional_account) {
                                send('message', { id: item.id, message: 'Nguồn đểu' })
                            } else {
                                send('message', { id: item.id, message: 'Nguồn OK' })
                            }
                        }

                        if (mode === 'checkAdsInsta' && !stopped) {

                            try {

                                send('message', {id: item.id, message: 'Đang check ads'})

                                await ig.checkAd()

                                send('message', {id: item.id, message: 'Ads Live'})

                            } catch (err) {

                                send('message', {id: item.id, message: 'Ads Die'})
                            }

                        }

                        if (mode === 'loadAdsInsta' && !stopped) {

                            let loadAd = true 

                            if (!ig.userData.is_professional_account) {

                                try {

                                    send('message', {id: item.id, message: 'Đang tạo BM IG'})

                                    await ig.convertAccount(3)

                                    send('message', {id: item.id, message: 'Tạo BM IG thành công'})

                                } catch {
                                    
                                    send('message', {id: item.id, message: 'Tạo BM IG thất bại'})
                                    error = true
                                }

                            } else {

                                try {

                                    send('message', {id: item.id, message: 'Đang check Ads'})

                                    await ig.checkAd()

                                    send('message', {id: item.id, message: 'Ads Live'})

                                    loadAd = false

                                } catch (err) {

                                    send('message', {id: item.id, message: 'Ads Die'})
                            
                                    try {

                                        send('message', {id: item.id, message: 'Đang ngắt kết nối BM IG'})

                                        await ig.convertAccount(1)

                                        send('message', {id: item.id, message: 'Ngắt kết nối BM IG thành công'})

                                        try {

                                            send('message', {id: item.id, message: 'Đang tạo BM IG'})

                                            await ig.convertAccount(3)

                                            send('message', {id: item.id, message: 'Tạo BM IG thành công'})

                                        } catch {
                                            error = true
                                            send('message', {id: item.id, message: 'Tạo BM IG thất bại'})
                                        }

                                    } catch {
                                        send('message', {id: item.id, message: 'Ngắt kết nối BM IG thất bại'})
                                        error = true
                                    }

                                }

                            }

                            if (loadAd && !error && !stopped) {

                                try {

                                    send('message', {id: item.id, message: 'Đang load Ads'})

                                    await ig.loadAd(message => {
                                        send('message', {id: item.id, message: message})
                                    })

                                    send('message', {id: item.id, message: 'Đang check Ads'})

                                    try {

                                        await ig.checkAd()

                                        send('message', {id: item.id, message: 'Ads Live'})

                                    } catch {
                                        connect = false
                                        send('message', {id: item.id, message: 'Ads Die'})
                                    }

                                } catch {
                                    
                                    send('message', {id: item.id, message: 'Load Ads thất bại'})

                                }
                            }

                        }

                        if (mode === 'bat2FaInsta' && !stopped) {

                            const twofa = await ig.enable2Fa(message => {
                                send('message', {id: item.id, message: message})
                            })

                            if (twofa) {
                                send('update2Fa', {
                                    id: item.id,
                                    twofa: twofa.replaceAll(' ', '')
                                })
                            }

                        }

                        if (mode === 'changeInfoInsta' && !stopped) {

                            if (setting.changePasswordInsta.value) {
                        
                                try {

                                    send('message', {id: item.id, message: 'Đang đổi mật khẩu'})

                                    const newPassword = generator.generate({
                                        length: 12,
                                        numbers: true
                                    })

                                    await ig.changePassword(newPassword)

                                    send('message', {id: item.id, message: 'Đã đổi mật khẩu thành: '+newPassword})

                                    send('updatePassword', {
                                        id: item.id,
                                        new: newPassword
                                    })

                                } catch {

                                    send('message', {id: item.id, message: 'Đổi mật khẩu thất bại'})

                                }

                            }

                            if (setting.changeEmailInsta.value) {

                                try {

                                    send('message', {id: item.id, message: 'Đang đổi email'})
        
                                    const newEmail = await ig.changeEmail(msg => {
                                        send('message', {id: item.id, message: msg})
                                    })

                                    send('updateEmailInsta', {id: item.id, newEmail})
                                    send('message', {id: item.id, message: 'Đổi email thành công'})

        
                                } catch (err) {
        
                                    send('message', {id: item.id, message: 'Đổi email thất bại'})
                                }

                            }

                            if (setting.changeAvatarInsta.value) {

                                try {

                                    const imageFolder = path.resolve(app.getPath('userData'), 'avatar')
                                    let imageData = await fs.promises.readdir(imageFolder)

                                    const file = path.resolve(imageFolder, imageData[Math.floor(Math.random() * imageData.length)])
                                    
                                    send('message', {id: item.id, message: 'Đang update avatar'})

                                    await ig.changeAvatar(file)

                                    send('message', {id: item.id, message: 'Update avatar thành công'})

                                } catch {
                                    send('message', {id: item.id, message: 'Update avatar thất bại'})
                                }

                            }

                            if (setting.uploadImageInsta.value) {

                                const number = setting.numberUploadImage.value 
                                let successCount = 0

                                try {

                                    const imageFolder = path.resolve(app.getPath('userData'), 'instaImage')

                                    let imageData = await fs.promises.readdir(imageFolder)

                                    imageData = shuffle(imageData)

                                    for (let index = 1; index <= number; index++) {
                                        
                                        try {

                                            const file = path.resolve(imageFolder, imageData[index])

                                            await ig.uploadPhoto(file)

                                            successCount++

                                            send('message', {id: item.id, message: 'Upload thành công '+successCount+'/'+number+' ảnh'})

                                        } catch (err) {
                                            console.log(err)
                                        }

                                        await delayTimeout(1000)
                                        
                                    }

                                } catch (err) {
                                    console.log(err)
                                }

                                send('message', {id: item.id, message: 'Upload thành công '+successCount+'/'+number+' ảnh'})



                            }
                            if (setting.changeCookieInsta.value) {

                                try {
                                    send('message', {id: item.id, message: 'Đang Out Cookie'})

                                    await ig.outCookie()

                                    send('message', {id: item.id, message: 'Out Cookie thành công'})

                                } catch {
                                    send('message', {id: item.id, message: 'Out Cookie thất bại'})
                                }

                            }

                        }

                        if (mode === 'getInfoInsta' && !stopped) {

                            if (setting.infoEmailInsta.value) {

                                try {

                                    send('message', {id: item.id, message: 'Đang lấy email'})

                                    const email = await ig.getEmail()

                                    send('updateEmailInsta', {id: item.id, newEmail: email})

                                    send('message', {id: item.id, message: 'Lấy email thành công'})

                                } catch {

                                    send('message', {id: item.id, message: 'Lấy email thất bại'})

                                }

                            }



                        }

                        // if (mode === 'uploadPhotoInsta' && !stopped) {
                            
                        //     try {

                        //         await ig.uploadPhoto(msg => {
                        //             send('message', {id: item.id, message: msg})
                        //         })

                        //     } catch (err) {}

                        // }

                    } catch (err) {

                        if (item.cookies) {
                            send('updateCookie', {
                                id: item.id,
                                type: 'instagram',
                                cookies: '',
                            })
                        }

                        if (err === '282') {

                            send('updateStatus', {id: item.id, status: 'Checkpoint 282'})
                            send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                            send('updateCookie', {
                                id: item.id,
                                type: 'instagram',
                                cookies: ig.options.headers.cookie,
                            })

                            if (mode === 'moCheckPointInstaApi' && setting.khang282Insta.value) {
                                await ig.khang282(msg => {
                                    send('message', {id: item.id, message: msg})
                                }, number => {
                                    send('updateInfo', {id: item.id, limit: number})
                                })
                            }

                        } else if (err === 'wrong_password') {

                            send('message', {id: item.id, message: 'Sai tài khoản hoặc mật khẩu'})

                        } else if (err === 'mail' || err === 'mail2') {

                            send('updateStatus', {id: item.id, status: 'Checkpoint Mail'})
                            
                            send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                            if (mode === 'moCheckPointInstaApi' && setting.moCpMailInsta.value) {

                                if (err === 'mail') {

                                    await ig.moCpMail(msg => {
                                        send('message', {id: item.id, message: msg})
                                    })

                                } else {

                                    await ig.moCpMail2(msg => {
                                        send('message', {id: item.id, message: msg})
                                    })

                                }

                                await delayTimeout(2000)

                                send('message', {id: item.id, message: 'Đang thử đăng nhập lại'})

                                try {

                                    await ig.login()

                                } catch {}

                                if (ig.options.headers.cookie.includes('ds_user_id')) {
                                    send('updateCookie', {
                                        id: item.id,
                                        type: 'instagram',
                                        cookies: ig.options.headers.cookie,
                                    })
                                }

                            }

                        } else if (err === 'add_phone') {

                            send('updateStatus', {id: item.id, status: 'Checkpoint Add Phone'})
                            send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                            if (mode === 'moCheckPointInstaApi' && setting.addPhoneInsta.value) {
                                await ig.addPhone(msg => {
                                    send('message', {id: item.id, message: msg})
                                })
                            }

                        } else if (err === 'captcha') {

                            send('updateStatus', {id: item.id, status: 'Checkpoint Captcha'})
                            send('message', {id: item.id, message: 'Tài khoản bị Checkpoint'})

                            if (mode === 'moCheckPointInstaApi' && setting.giaiCaptchaInsta.value) {
                                await ig.giaiCaptcha(msg => {
                                    send('message', {id: item.id, message: msg})
                                })
                            }
                            
                        } else if (err === 'die_vv') {

                            send('updateStatus', {id: item.id, status: 'Die vĩnh viễn'})
                            send('message', {id: item.id, message: 'Đăng nhập thất bại'})

                        } else if (err.toString().includes('ERROR:')) {

                            send('message', {id: item.id, message: err})

                        } else {

                            send('message', {id: item.id, message: 'Đăng nhập thất bại'})

                        }
                    }

                }

            } catch (err) {
                console.log(err)
            }

        }

        clearTimeout(timer)

        const time = moment().format('DD/MM/YYYY - H:m:s')

        send('finish', {item, time})

        resolve()

    })
}