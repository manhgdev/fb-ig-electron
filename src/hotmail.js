const {getPhone, getPhoneCode} = require('./core.js')
const {zFetch} = require('./zquery.js')
const {generateUsername} = require("unique-username-generator")
const axios = require('axios')
const generator = require('generate-password')


class Hotmail {

    constructor(page, setting, item, proxy) {
        this.page = page  
        this.item = item
        this.setting = setting
        this.proxy = proxy
        this.z = new zFetch(page)
    }

    login(message, oldEmail = false) {

        const page = this.page
        const setting = this.setting

        let email = ''
        let password = ''

        let bypass = false

        if (oldEmail) {

            const emailData = this.item.oldEmail.split('|')

            email = emailData[0]
            password = emailData[1]

        } else {

            email = this.item.email
            password = this.item.passMail

        }

        return new Promise(async (resolve, reject) => {
            
            let busy = true

            const checkLogin = setInterval(async () => {

                
                try {
                        
                    await page.waitForSelector('#acceptButton', {
                        timeout: 500
                    })

                    await page.click('#acceptButton')

                } catch {}

                try {
                        
                    await page.waitForSelector('#idA_PWD_SwitchToPassword', {
                        timeout: 500
                    })

                    await page.click('#idA_PWD_SwitchToPassword')

                } catch {}

                if (!busy) {

                    try {

                        await page.waitForSelector('#msaTile', {
                            timeout: 500
                        })

                        await page.click('#msaTile')

                    } catch {}

                    try {

                        const html = await page.content()

                        if (html.includes('meInitialsButton') || html.includes('id="txtSch"') || html.includes('O365_MainLink_MePhoto')) {

                            clearInterval(checkLogin)

                            try {

                                await page.goto('https://outlook.live.com/mail/0/options/general/timeAndLanguage')

                                await page.waitForSelector('.fui-Select__select:has(option[value="en-US"]')

                                const language = await page.$eval('.fui-Select__select:has(option[value="en-US"]', elm => elm.value)

                                if (language !== 'en-US') {

                                    console.log('cccc')

                                    await page.select('.fui-Select__select:has(option[value="en-US"]', 'en-US')

                                    await page.waitForTimeout(3000)
                    
                                    await page.click('.ms-Button.ms-Button--primary')

                                    await page.waitForTimeout(3000)

                                }

                            } catch {}

                            try {

                                await page.goto('https://outlook.live.com/mail/0/options/mail/layout')

                                await page.waitForXPath(`//span[text()="Don't sort my messages"]/parent::label`)

                                const layout = await page.$x(`//span[text()="Don't sort my messages"]/parent::label`)

                                await layout[0].click()

                                try {

                                    await page.waitForSelector('.ms-Button.ms-Button--primary', {
                                        timeout: 3000
                                    })

                                    await page.click('.ms-Button.ms-Button--primary')

                                    await page.waitForTimeout(3000)

                                } catch {}

                            } catch {}


                            // try {

                            //     await page.waitForXPath('//div[text()="Filter"]', {
                            //         timeout: 5000
                            //     })
                                
                            // } catch {

                            //     await page.goto('https://outlook.live.com/mail/0/options/general/timeAndLanguage')

                            //     await page.waitForSelector('.fui-Select__select:has(option[value="en-US"]')

                            //     await page.select('.fui-Select__select:has(option[value="en-US"]', 'en-US')

                            //     try {

                            //         await page.waitForSelector('.ms-Button.ms-Button--primary', {
                            //             timeout: 5000,
                            //         })
                
                            //         await page.click('.ms-Button.ms-Button--primary')

                            //     } catch {}

                            //     await page.waitForTimeout(3000)
                            // }

                            // try {

                            //     await page.waitForXPath('//span[text()="Focused"]', {
                            //         timeout: 5000
                            //     })

                            //     await page.goto('https://outlook.live.com/mail/0/options/mail/layout')

                            //     await page.waitForXPath(`//span[text()="Don't sort my messages"]/parent::label`)
                            //     const button = await page.$x(`//span[text()="Don't sort my messages"]/parent::label`)

                            //     button[0].click()

                            //     try {

                            //         await page.waitForSelector('.ms-Button.ms-Button--primary', {
                            //             timeout: 5000,
                            //         })
                
                            //         await page.click('.ms-Button.ms-Button--primary')

                            //     } catch {}

                            // } catch (err) {}

                            await page.goto('https://outlook.live.com/mail/0/')

                            message('Đăng nhập thành công')

                            return resolve()

                        }

                    } catch {}

                    try {

                        const html = await page.content()

                        if (html.includes('The request is blocked')) {

                            clearInterval(checkLogin)
                            message('The request is blocked')
                            return reject()
                        }

                        if (html.includes('Your account has been locked')) {
                            await page.click('#StartAction')
                        }

                        if (html.includes("There's a temporary problem")) {
                            clearInterval(checkLogin)
                            message("There's a temporary problem")
                            return reject()
                        }

                        if (html.includes('Sign-in is blocked')) {
                            clearInterval(checkLogin)
                            message('Khóa đăng nhập')
                            return reject()
                        }

                        if (html.includes("Enter your phone number, and we'll send you a security code")) {
                            clearInterval(checkLogin)
                            message('Checkpoint Add Phone')
                            return reject()
                        }

                        if (html.includes("We're updating our terms")) {
                            await page.waitForSelector('#iNext')
                            await page.click('#iNext')
                        }

                    } catch {}

                    try {

                        await page.waitForSelector('#KmsiCheckboxField', {
                            timeout: 500
                        })

                        await page.click('#idSIButton9')

                    } catch {}

                    try {

                        await page.waitForSelector('#iCancel', {
                            timeout: 500
                        })

                        await page.click('#iCancel')

                    } catch {}

                    try {

                        await page.waitForSelector('#StickyFooter button', {
                            timeout: 500
                        })

                        await page.click('#StickyFooter button')

                    } catch {}

                    try {

                        await page.waitForSelector('#iLooksGood', {
                            timeout: 500
                        })

                        await page.click('#iLooksGood')

                    } catch {}

                    try {
                        await page.waitForSelector('#iLandingViewAction', {
                            timeout: 500
                        })
                        await page.click('#iLandingViewAction')
                    } catch {}

                    try {

                        await page.waitForSelector('#iProofOptions option[value="Email"]', {
                            timeout: 500
                        })

                        try {

                            await page.waitForSelector('#iShowSkip', {
                                timeout: 500
                            })
    
                            await page.click('#iShowSkip')
    
                        } catch {

                            clearInterval(checkLogin)
                            message('Checkpoint Add Mail')
                            return reject()

                        }

                    } catch {}

                    try {

                        await page.waitForSelector('#DisplayPhoneNumber', {
                            timeout: 500
                        })
                        clearInterval(checkLogin)
                        message('Checkpoint Add Phone')
                        return reject()


                    } catch {}

                    try {

                        await page.waitForSelector('input[title^="To verify that this is your email address"]', {
                            timeout: 500
                        })

                        if (setting.bypassCode.value && !bypass) {

                            busy = true

                            await page.goto('https://support.microsoft.com/en-US', {
                                waitUntil: 'networkidle2'
                            })

                            await page.waitForTimeout(2000)

                            await page.goto('https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=16&ct=1696152892&rver=7.0.6738.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fcobrandid%3dab0455a0-8d03-46b9-b18b-df2f57b9e44c%26nlp%3d1%26deeplink%3dowa%252f%26RpsCsrfState%3dfa488740-3f91-986b-dd88-79a3ae7457d3&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=ab0455a0-8d03-46b9-b18b-df2f57b9e44c')

                            bypass = true

                            busy = false
                        
                        } else {

                            clearInterval(checkLogin)
                            message('Checkpoint Code Mail')

                            return reject()
                        }


                    } catch {}

                    try {

                        await page.waitForSelector('input[title^="To verify that this is your phone number"]', {
                            timeout: 500
                        })

                        if (setting.bypassCode.value && !bypass) {

                            busy = true

                            await page.goto('https://support.microsoft.com/en-US', {
                                waitUntil: 'networkidle2'
                            })

                            await page.waitForTimeout(2000)

                            await page.goto('https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=16&ct=1696152892&rver=7.0.6738.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fcobrandid%3dab0455a0-8d03-46b9-b18b-df2f57b9e44c%26nlp%3d1%26deeplink%3dowa%252f%26RpsCsrfState%3dfa488740-3f91-986b-dd88-79a3ae7457d3&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=ab0455a0-8d03-46b9-b18b-df2f57b9e44c')

                            bypass = true

                            busy = false
                        
                        
                        } else {
                            clearInterval(checkLogin)
                            message('Checkpoint Code Phone')
                            return reject()
                        }


                    } catch {}

                    try {

                        await page.waitForSelector('input[data-bi-id="choice-i-am-a-parent"]', {
                            timeout: 500
                        })
                        clearInterval(checkLogin)
                        message('Checkpoint Parent')
                        return reject()
                        
                    } catch {}

                }

            }, 1000)
            
            try {

                message('Đang đăng nhập hotmail')

                await page.goto('https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=16&ct=1696152892&rver=7.0.6738.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fcobrandid%3dab0455a0-8d03-46b9-b18b-df2f57b9e44c%26nlp%3d1%26deeplink%3dowa%252f%26RpsCsrfState%3dfa488740-3f91-986b-dd88-79a3ae7457d3&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=ab0455a0-8d03-46b9-b18b-df2f57b9e44c')

                
                await page.waitForSelector('input[name="loginfmt"]')

                await page.waitForTimeout(1000)

                await page.type('input[name="loginfmt"]', email)

                await page.keyboard.press('Enter')

                await page.waitForTimeout(3000)

                const emailError = await page.$('#usernameError') || false

                if (emailError) {

                    message('Tài khoản sai')
                    return reject()

                }
                
                try {

                    message('Đang nhập mật khẩu')

                    await page.waitForSelector('input[name="passwd"]')

                    await page.waitForTimeout(3000)
    
                    await page.type('input[name="passwd"]', password)

                    await page.waitForTimeout(3000)
    
                    await page.keyboard.press('Enter')
    
                    await page.waitForTimeout(5000)
    
                    const passwordError = await page.$('#i0118Error') || false

                    if (passwordError) {

                        message('Mật khẩu sai')
                        return reject()

                    } else {
                        message('Đang kiểm tra đăng nhập')
                    }
    
                } catch {}

                busy = false


            } catch (err) {
                console.log(err)
                reject()
            }

        })
    }

    unlockPhone(message) {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const setting = this.setting
            const proxy = this.proxy

            try {

                await page.waitForSelector('#StartAction')

                message('Đang mở khóa SĐT')

                await page.click('#StartAction')

                await page.waitForSelector('[aria-label="Country code"]')

                await page.evaluate(() => {
                    document.querySelector('option[value="VN"]').selected = true
                })

                message('Đang lấy SĐT')

                try {

                    for (let index = 0; index < 6; index++) {

                        if (index > 0) {
                            message('Đang thử lại')
                        }

                        await page.evaluate(() => {
                            document.querySelector('input[id*="IPPhoneInput"]').value = ''
                        })
                        
                        const phone = await getPhone(setting.phoneService.value, setting.phoneServiceKey.value, proxy, 'microsoft')

                        message('Đang nhập SĐT')

                        console.log('ffffffffffff')

                        await page.type('input[id*="IPPhoneInput"]', phone.number)

                        await page.waitForTimeout(3000)

                        await page.click('a[title="Send code"]')

                        try {

                            await page.waitForSelector('.alert.alert-error', {
                                timeout: 1000
                            })

                            

                        } catch (err) {
                            console.log(err)
                            break
                        }

                    }



                } catch (err) {

                    console.log(err)

                    message('Không thể lấy SĐT')

                    return reject()
                }

            } catch (err) {
                console.log(err)
                reject()
            }

        })
    } 

    unlockCodeMail(message) {
        return new Promise(async (resolve, reject) => {

            const page = this.page 
            const recoverEmail = this.item.recoverEmail
            const setting = this.setting
            const z = this.z

            try {

                message('Đang mở khóa CP code mail')

                await page.waitForSelector('#proofDiv0 input')

                await page.click('#proofDiv0 input')

                if (recoverEmail) {

                    await z.delete('https://inboxes.com/api/v2/inbox/'+recoverEmail)
                    await z.get('https://inboxes.com/api/v2/inbox/'+recoverEmail)

                    const emailUser = recoverEmail.split('@')[0]

                    await page.type('#iProofEmail', emailUser)

                    message('Đang nhập mail khôi phục')

                    await page.waitForTimeout(3000)

                    await page.click('#iSelectProofAction')

                    let code = false

                    message('Đang chờ lấy mã kích hoạt')

                    try {

                        code = await this.getCode(recoverEmail)
                        
                    } catch {}

                    if (code) {

                        message('Đang nhập mã kích hoạt')

                        await page.type('#iOttText', code)

                        await z.delete('https://inboxes.com/api/v2/inbox/'+recoverEmail)

                        await page.waitForTimeout(3000)

                        await page.click('#iVerifyCodeAction')

                        let password = ''

                        try {

                            await page.waitForSelector('#iPassword', {
                                timeout: 10000
                            })

                            if (setting.hotmailRandomPassword.value) {

                                password = generator.generate({
                                    length: 12,
                                    numbers: true
                                })

                            } else {
                                password = setting.hotmailNewPassword.value
                            }

                            await page.waitForTimeout(3000)

                            message('Đang nhập mật khẩu mới')

                            await page.type('#iPassword', password)

                            await page.waitForTimeout(3000)

                            await page.click('#iPasswordViewAction')

                            await page.waitForSelector('#iReviewProofsViewAction')

                            await page.click('#iReviewProofsViewAction')

                            try {

                                await page.waitForSelector('#iCollectProofsViewAlternate', {
                                    timeout: 10000
                                })

                                await page.click('#iCollectProofsViewAlternate')

                            } catch {}

                        } catch {}

                        message('Mở khóa CP code mail thành công')

                        resolve(password)

                    } else {
                        reject('Không nhận được mã kích hoạt')
                    }

                } else {

                    reject('Không có mail khôi phục')

                }

                
            } catch (err) {
                reject('Mở khóa CP code mail thất bại')
            }

        })
    }

    unlockAddMail(message) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
        })
    }

    unlock(send) {
        return new Promise(async (resolve, reject) => {
            
            const page = this.page
            const item = this.item
            const setting = this.setting

            const unlockPhone = await page.$('input[title^="To verify that this is your phone number"]') || false
            const unlockCodeMail = await page.$('input[title^="To verify that this is your email address"]') || false
            const unlockAddMail = await page.$('#iProofOptions option[value="Email"]') || false

            let newEmail = false

            if (unlockAddMail && setting.unlockAddMail.value) {

                try {

                    const email = await this.addMail(message => {
                        send('message', {id: item.id, message: 'HOTMAIL: '+message})
                    })

                    newEmail = email

                    send('updateRecoveryEmail', {
                        id: item.id,
                        email,
                    })

                } catch {
                    return reject()
                }

            }

            if (unlockPhone && setting.unlockAddPhone.value) {

                try {

                    await page.waitForTimeout(5000000)

                    await this.unlockPhone(message => {
                        send('message', {id: item.id, message: 'HOTMAIL: '+message})
                    })

                } catch {

                }

            }

            if (unlockCodeMail && setting.unlockCodeMail.value) {
                
                try {

                    const password = await this.unlockCodeMail(message => {
                        send('message', {id: item.id, message: 'HOTMAIL: '+message})
                    })

                    if (password) {
                        send('updateEmail', {
                            id: item.id,
                            newEmail: item.email,
                            newEmailPassword: password
                        })
                    }

                } catch (err) {
                    send('message', {id: item.id, message: 'HOTMAIL: '+err})

                    return reject()
                }

            }

            resolve(newEmail)

        })
    }

    batImap() {
        return new Promise(async (resolve, reject) => {

            const page = this.page

            try {

                await page.goto('https://outlook.live.com/mail/0/options/mail/accounts')

                await page.waitForXPath('//span[text()="Yes"]/parent::label')

                const button = await page.$x('//span[text()="Yes"]/parent::label')

                button[0].click()

                try {

                    await page.waitForSelector('.ms-Button.ms-Button--primary', {
                        timeout: 5000
                    })

                    await page.click('.ms-Button.ms-Button--primary')

                    await page.waitForTimeout(3000)

                } catch {}

                resolve()

            } catch (err) {
                console.log(err)
                reject()
            }



        })
    }

    getCode(email) {
        return new Promise(async (resolve, reject) => {
            const page = this.page 
            const z = this.z 

            let code = ''

            for (let index = 0; index < 999; index++) {

                try {
                
                    const res = await z.get('https://inboxes.com/api/v2/inbox/'+email)

                    const mess = res.msgs.filter(item => item.s.includes('Microsoft'))

                    if (mess[0]) {

                        const res = await z.get('https://inboxes.com/api/v2/message/'+mess[0].uid)

                        const content = res.html.replace(/<[^>]*>?/gm, '')

                        const codeMatch = content.match(/Security code:\s(\d{6,8})/)

                        if (codeMatch[1]) {
                            code = codeMatch[1]
                            break
                        }
                    
                    }


                } catch (err) {}

                await page.waitForTimeout(5000)
                
            }

            if (code) {
                resolve(code)
            } else {
                reject()
            }
        })
    }

    addMail(message, newEmail = false) {
        return new Promise(async (resolve, reject) => {
            const page = this.page
            const setting = this.setting
            const z = this.z

            try {

                await page.waitForSelector('[aria-describedby="idDiv_SAOTCS_Title"]', {
                    timeout: 10000
                })
                
                if (newEmail) {
                    message('Thêm mail khôi phục thành công')
                } else {
                    message('Đã có mail khôi phục')
                }

                return reject()

            } catch {}

            try {

                message('Đang thêm mail khôi phục')

                await page.waitForSelector('#EmailAddress')

                await page.evaluate(() => {
                    document.querySelector('option[value="Email"]').selected = true
                })

                const email = generateUsername('', 5, 20)+'@'+setting.tempDomain.value

                await z.delete('https://inboxes.com/api/v2/inbox/'+email)

                await page.waitForTimeout(3000)

                message('Đang nhập email')

                await page.type('#EmailAddress', email)

                await page.waitForTimeout(3000)

                await page.click('#iNext')

                await page.waitForSelector('#iOttText')

                let code = false

                message('Đang chờ lấy mã kích hoạt')

                try {

                    code = await this.getCode(email)

                } catch {}

                if (code) {

                    await z.delete('https://inboxes.com/api/v2/inbox/'+email)

                    message('Đang nhập mã kích hoạt')

                    await page.type('#iOttText', code)

                    await page.waitForTimeout(3000)
                    
                    await page.click('#iNext')

                    await page.waitForTimeout(3000)

                    try {

                        await page.waitForSelector('#iOttText', {
                            timeout: 5000
                        })

                        message('Thêm mail khôi phục thất bại')
                        reject()

                    } catch {

                        message('Thêm mail khôi phục thành công')
                        resolve(email)
                        
                    }

                } else {

                    message('Thêm mail khôi phục thất bại')

                    reject()
                }

            } catch (err) {

                message('Thêm mail khôi phục thất bại')
                reject()
            }

        })
    }

    changePassMail(send) {
        return new Promise(async (resolve, reject) => {

            const page = this.page
            const item = this.item
            let recoverEmail = item.recoverEmail
            const password = item.passMail
            const setting = this.setting
            const z = this.z

            try {

                await page.goto('https://account.live.com/password/Change?mkt=en-US&refd=account.microsoft.com&refp=profile')

                try {

                    await page.waitForSelector('#EmailAddress', {
                        timeout: 5000
                    })
                    
                    try {

                        const email = await this.addMail(message => {
                            send('message', {id: item.id, message: 'HOTMAIL: '+message})
                        })

                        recoverEmail = email
    
                        send('updateRecoveryEmail', {
                            id: item.id,
                            email,
                        })

                    } catch (err) {
                        return reject()
                    }

                } catch (err) {
                }

                try {

                    await page.waitForSelector('[aria-describedby="idDiv_SAOTCS_Title"]', {
                        timeout: 5000
                    })

                    if (recoverEmail) {

                        await z.delete('https://inboxes.com/api/v2/inbox/'+recoverEmail)

                        await page.click('[aria-describedby="idDiv_SAOTCS_Title"]')

                        await page.waitForSelector('[name="ProofConfirmation"]')

                        await page.waitForTimeout(3000)

                        send('message', {id: item.id, message: 'HOTMAIL: Đang nhập email'})

                        await z.get('https://inboxes.com/api/v2/inbox/'+recoverEmail)

                        await page.type('[name="ProofConfirmation"]', recoverEmail)

                        await page.waitForTimeout(3000)

                        await page.click('#idSubmit_SAOTCS_SendCode')

                        await page.waitForSelector('[placeholder="Code"]')

                        let code = false

                        send('message', {id: item.id, message: 'HOTMAIL: Đang chờ lấy mã kích hoạt'})

                        try {

                            code = await this.getCode(recoverEmail)

                        } catch {}

                        if (code) {

                            await page.type('[placeholder="Code"]', code)

                            await page.click('[name="AddTD"]')

                            await page.waitForTimeout(3000)

                            await page.click('#idSubmit_SAOTCC_Continue')

                            await page.waitForTimeout(3000)

                            try {
                                
                                await page.waitForSelector('[placeholder="Code"]', {
                                    timeout: 5000
                                })

                                send('message', {id: item.id, message: 'HOTMAIL: Nhập mã thất bại'})

                                return reject()

                            } catch {
                                send('message', {id: item.id, message: 'HOTMAIL: Nhập mã thành công'})
                            }

                            try {

                                await page.waitForSelector('#iCancel', {
                                    timeout: 5000
                                })

                                await page.click('#iCancel')
                            } catch {}

                        } else {

                            send('message', {id: item.id, message: 'HOTMAIL: Không nhận được mã kích hoạt'})

                            return reject()
                        }


                    } else {

                        send('message', {id: item.id, message: 'HOTMAIL: Không tìm thấy mail khôi phục'})

                        return reject()
                    }


                } catch (err) {
                    console.log('ccc'+err)
                }

                try {

                    let newPassword = ''

                    if (setting.hotmailRandomPassword.value) {

                        newPassword = generator.generate({
                            length: 12,
                            numbers: true
                        })

                    } else {
                        newPassword = setting.hotmailNewPassword.value
                    }
                    
                    send('message', {id: item.id, message: 'HOTMAIL: Đang nhập mật khẩu'})

                    await page.waitForSelector('#iCurPassword')

                    await page.waitForTimeout(5000)

                    await page.type('#iCurPassword', password)

                    await page.waitForTimeout(1000)

                    await page.type('#iPassword', newPassword)

                    await page.waitForTimeout(1000)

                    await page.type('#iRetypePassword', newPassword)

                    await page.waitForTimeout(3000)

                    await page.click('#UpdatePasswordAction')

                    await page.waitForTimeout(5000)

                    try {

                        await page.waitForSelector('#iCurPassword', {
                            timeout: 5000
                        })

                        reject()

                    } catch {

                        resolve(newPassword)
                    }


                } catch {
                    reject()
                }


            } catch {
                reject()
            }

        })
    }

}

module.exports = Hotmail