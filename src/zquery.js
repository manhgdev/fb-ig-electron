class zQuery {
    constructor(page, selector = null) {
        this.selector = selector
        this.page = page
    }

    async clearText() {
        const page = this.page 
        const selector = this.selector

        try {

            await page.evaluate(selector => {
                document.querySelector(selector).value = ''
            }, selector)

        } catch (err) {
            throw new Error(err)
        }
    }

    async val() {
        const page = this.page 
        const selector = this.selector

        try {

            const text = await page.evaluate(selector => {
                return document.querySelector(selector).value
            }, selector)

            return text

        } catch (err) {
            throw new Error(err)
        }
    }

    async html() {

        const page = this.page 
        const selector = this.selector

        try {

            const text = await page.evaluate(selector => {
                return document.querySelector(selector).innerHTML
            }, selector)

            return text

        } catch (err) {
            throw new Error(err)
        }
    }

    async text() {

        const page = this.page 
        const selector = this.selector

        try {

            const text = await page.evaluate(selector => {
                return document.querySelector(selector).innerText
            }, selector)

            return text

        } catch (err) {
            throw new Error(err)
        }
    }
}

class zFetch {

    constructor(page) {
        this.page = page
    }

    async getValue(elm) {

        const page = this.page 

        try {
            return await page.$eval(elm, el => el.value)
        } catch (err) {
            throw new Error(err)
        }
    }

    async getText(elm) {

        const page = this.page 

        try {
            return await page.$eval(elm, el => el.innerText)
        } catch (err) {
            throw new Error(err)
        }
    }

    async get(url, options = {}) {

        const page = this.page 

        options.method = 'get'

        try {

            return await page.evaluate(async (url, options) => {
                
                const res = await fetch(url, options)
                const contentType = await res.headers.get('content-type')

                if (contentType.includes('text/html')) {
                    return await res.text()
                }

                if (contentType.includes('application/json')) {
                    return await res.json()
                }

            }, url, options)

        } catch (err) {
            throw new Error(err)
        }

    }

    async delete(url, options = {}) {

        const page = this.page 

        options.method = 'delete'

        try {

            return await page.evaluate(async (url, options) => {
                
                const res = await fetch(url, options)
                const contentType = await res.headers.get('content-type')

                if (contentType.includes('text/html')) {
                    return await res.text()
                }

                if (contentType.includes('application/json')) {
                    return await res.json()
                }

            }, url, options)

        } catch (err) {
            throw new Error(err)
        }

    }

    async post(url, options = {}) {


        const page = this.page 

        options.method = 'post'

        try {

            return await page.evaluate(async (url, options) => {
                
                const res = await fetch(url, options)
                const contentType = await res.headers.get('content-type')

                if (contentType.includes('application/json')) {
                    return await res.json()
                } else {
                    return await res.text()
                }

            }, url, options)

        } catch (err) {
            throw new Error(err)
        }

    }

    async getRedirect(url, options = {}) {

        const page = this.page 

        try {

            const finalUrl = await page.evaluate(async (url, options) => {

                const res = await fetch(url, options)

                return res.url

            }, url, options)

            return finalUrl

        } catch (err) {
            throw new Error(err)
        }

    }

    async getInbox(page) {
        return new Promise(async (resolve, reject) => {

            try {
                const email = await page.evaluate(() => {

                    const mailList = document.querySelectorAll('[data-convid]')

                    const id = mailList[0].getAttribute('data-convid')
                    const from = mailList[0].querySelector('span[title*="@"]').getAttribute('title')
                    const content = mailList[0].getAttribute('aria-label')

                    return {id, from, content}

                })

                resolve(email)
            } catch (err) {
                reject(err)
            }
        })
    }

}

module.exports = {zQuery, zFetch}