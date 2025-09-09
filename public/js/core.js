function saveSetting(name = 'settings') {

    const setting = {
        general: {},
        change: {},
        xmdt: {},
        bm: {},
        tut: {},
        page: {},
        instagram: {},
    }

    $('[data-tool]').each(function() {

        const tool = $(this).attr('data-tool')

        $(this).find('[data-type="multi"]').each(function() {
            let key = $(this).attr('name')

            if (key) {
                setting[tool][key] = {value: [], type: 'multi', target: ''}
            }
        })

        $(this).find('[data-type="multi"]').each(function() {
            let key = $(this).attr('name')
            let value = $(this).val()
            if (!setting[tool][key].value.includes(value) && $(this).is(':checked')) {
                setting[tool][key].value.push(value)
            }
        })

        $(this).find('input:not([type="radio"], [data-type="multi"])').each(function() {

            let value = $(this).val()
            let type = 'text'
            let target = ''
            let key = $(this).attr('name')

            value = !isNaN(value) ? parseInt(value) : value

            if ($(this).attr('type') === 'checkbox') {

                type = 'checkbox'

                if ($(this).is(':checked')) {
                    value = true
                } else {
                    value = false
                }
            }

            if ($(this).attr('type') === 'file') {

                type = 'file'
                value = $(this).get(0).files[0] ? $(this).get(0).files[0].path : ''

            }

            if ($(this).attr('data-target')) {
                target = $(this).attr('data-target')
            }
            
            if (key) {
                setting[tool][key] = {value, type, target}
            }

        })

        $(this).find('input[type="radio"]:checked').each(function() {
            
            let key = $(this).attr('name')
            let value = $(this).val()

            if (key) {
                setting[tool][key] = {value, type: 'radio'}
            }
        })

        $(this).find('select').each(function() {

            let value = $(this).find(":selected").val() || ''
            let key = $(this).attr('name')

            if (key) {
                setting[tool][key] = {value, type: 'select'}
            }
            
        })

        $(this).find('textarea').each(function() {

            let value = $(this).val()
            let key = $(this).attr('name')

            if (key) {
                setting[tool][key] = {value, type: 'textarea'}
            }
            
        })

    })

    
    window.api.send('saveSetting', {setting, name})

    return setting

}

async function loadSetting(name = 'settings') {

    const setting = await window.api.get('getSetting', name)
    const userAgent = await window.api.get('loadUserAgent')
    
    $('#userAgentData').val(userAgent)

    window.screenWidth = setting.screenWidth
    window.screenHeight = setting.screenHeight

    delete setting.screenWidth
    delete setting.screenHeight

    Object.keys(setting).forEach(tool => {

        Object.keys(setting[tool]).forEach(key => {

            const item = setting[tool][key]

            if (item.type === 'multi') {
                item.value.forEach(val => {
                    $('[data-tool="'+tool+'"]').find('input[name="'+key+'"][value="'+val+'"]').prop('checked', true)
                })
            }

            if (item.type === 'checkbox') {
                $('[data-tool="'+tool+'"]').find('input[name="'+key+'"]').prop('checked', item.value)
            }

            if (item.type === 'radio') {
                $('[data-tool="'+tool+'"]').find('input[type="radio"]').prop('checked', false)
                $('[data-tool="'+tool+'"]').find('input[type="radio"][value="'+item.value+'"]').prop('checked', true)

                if (item.target) {
                    $('[data-tool="'+tool+'"]').find('#'+item.target).removeClass('d-none')
                }
            }

            if (item.type === 'text') {
                $('[data-tool="'+tool+'"]').find('input[name="'+key+'"]').val(item.value)
            }

            if (item.type === 'textarea') {
                $('[data-tool="'+tool+'"]').find('textarea[name="'+key+'"]').val(item.value)
            }

            if (item.type === 'select') {
                $('[data-tool="'+tool+'"]').find('select[name="'+key+'"] option[value="'+item.value+'"]').prop('selected', true)

                $('[data-parent="'+key+'"][data-value="'+item.value+'"]').removeClass('d-none')
            }

            if (key === 'deleteEmailMode' && item.value.includes('mbasic')) {
                $('#setPrimaryEmail').removeClass('d-none')
            }

            if (item.target) {
                if (item.value) {
                    $('[data-tool="'+tool+'"]').find('#'+item.target).removeClass('d-none')
                }
            }
        
        })

    })

    try {
        loadPhoi()

        const renameErrorTotal = $('textarea[name="renameError"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

        $('#renameErrorCount').text(renameErrorTotal.length)

        const renameSuccessTotal = $('textarea[name="renameSuccess"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

        $('#renameSuccessCount').text(renameSuccessTotal.length)

        const linkDataTotal = $('textarea[name="backupLinkAll"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

        $('#backupLinkAllCount').text(linkDataTotal.length)

        const linkDataSuccess = $('textarea[name="backupLinkSuccess"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

        $('#backupLinkSuccessCount').text(linkDataSuccess.length)

        const linkDataError = $('textarea[name="backupLinkError"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

        $('#backupLinkErrorCount').text(linkDataError.length)

    } catch {}

    $('body').addClass('setting-loaded')

    $('#loadingScreen').addClass('d-none')

}