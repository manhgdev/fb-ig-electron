
const columnDefs = [
    {
        resizable: false,
        headerCheckboxSelection: true,
        headerCheckboxSelectionCurrentPageOnly: true,
        checkboxSelection: true,
        showDisabledCheckboxes: true,
        maxWidth: 40,
        pinned: 'left',
        suppressMovable: true,
        lockPosition : 'left'
    },
    { 
        field: 'id',
        headerName: '#',
        width: 40,
        minWidth: 40,
        pinned: 'left',
        suppressMovable: true,
        lockPosition : 'left'
    },
    { 
        field: 'type',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'account',
        headerName: lang.account,
    },
    { 
        field: 'note',
        headerName: lang.note,
    },
    { 
        field: 'pid',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'position',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'category',
        hide: true,
        suppressFiltersToolPanel: true,
        filter: 'agTextColumnFilter'
    },
    { 
        field: 'uid',
        headerName: 'UID',
        suppressFiltersToolPanel: true,
        cellRenderer: (params) => {
            if (params.data.type === 'instagram') {
                return '<img src="../public/img/instagram.png" height="15" class="me-2">'+params.data.uid
            } else {
                return '<img src="../public/img/facebook.png" height="15" class="me-2">'+params.data.uid
            }
        }
    },
    { 
        field: 'password',
        headerName: 'Mật khẩu',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'twofa',
        headerName: '2FA',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'email',
        headerName: 'Email',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'passMail',
        headerName: 'Email Password',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'recoverEmail',
        headerName: 'Email khôi phục',
        suppressFiltersToolPanel: true
    },
    { 
        field: 'proxyKey',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'backupEmail',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'newEmail',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'isRunning',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'cookies',
        headerName: 'Cookies'
    },
    { 
        field: 'token',
        headerName: lang.token
    },
    { 
        field: 'oldEmail',
        headerName: lang.oldEmail
    },
    { 
        field: 'limit',
        headerName: lang.limit
    },
    { 
        field: 'active',
        headerName: lang.active,
    },
    { 
        field: 'bestBm',
        headerName: lang.bestBm,
    },
    { 
        field: 'status',
        headerName: lang.status
    },
    {
        field: 'lastTime',
        headerName: 'Last Activity'
    },
    { 
        field: 'process',
        headerName: lang.process,
    },
    { 
        field: 'profile',
        hide: true,
        headerName: 'Profile',
    },
    {
        field: 'quality',
        headerName: lang.quality,
    },
    { 
        field: 'account273',
        headerName: '273',
    },
    { 
        field: 'link273',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'page',
        headerName: lang.page,
    },
    {
        field: 'spendPage',
        hide: true,
        headerName: 'Page chi tiêu'
    },
    { 
        field: 'pageKhang',
        hide: true,
        headerName: 'Page kháng',
    },
    { 
        field: 'pageXmdt',
        hide: true,
        headerName: 'Page XMDT',
    },
    {
        field: 'pageDangKhang',
        hide: true,
        headerName: 'Page đang kháng'
    },
    {
        field: 'pageHcvv',
        hide: true,
        headerName: 'Page HCVV'
    },
    {
        field: 'pageCanKhang',
        hide: true,
        headerName: 'Page cần kháng'
    },
    {
        field: 'pageLive',
        hide: true,
        headerName: 'Page Live'
    },
    {
        field: 'pageLiveStream',
        hide: true,
        headerName: 'Page Livestream'
    },
    { 
        field: 'bm',
        headerName: lang.bm,
    },
    { 
        field: 'bmXmdn',
        headerName: 'BM XMDN',
        hide: true
    },
    { 
        field: 'bm350Live',
        headerName: 'BM350 LIVE',
        hide: true
    },
    { 
        field: 'bm350Die',
        headerName: 'BM350 DIE',
        hide: true
    },
    { 
        field: 'bm50Live',
        headerName: 'BM50 LIVE',
        hide: true
    },
    { 
        field: 'bm50Die',
        headerName: 'BM50 DIE',
        hide: true
    },
    { 
        field: 'bmNoLimitLive',
        headerName: 'BM NLM LIVE',
        hide: true
    },
    { 
        field: 'bmNoLimitDie',
        headerName: 'BM NLM DIE',
        hide: true
    },
    { 
        field: 'bmDieVinhVien',
        headerName: 'BM DIE VV',
        hide: true
    },
    { 
        field: 'bmKhang350',
        headerName: 'BM 350 Kháng',
        hide: true
    },
    { 
        field: 'bmKhang50',
        headerName: 'BM 50 Kháng',
        hide: true
    },
    { 
        field: 'bmKhangNoLimit',
        headerName: 'BM NLM Kháng',
        hide: true
    },
    { 
        field: 'bmDieDangKhang',
        headerName: 'BM Đang Kháng',
        hide: true
    },
    
    { 
        field: 'resource',
        headerName: lang.resource,
    },
    { 
        field: 'name',
        headerName: lang.name,
    },
    { 
        field: 'createdTime',
        headerName: lang.createdTime,
    },
    { 
        field: 'dob',
        headerName: lang.dob,
    },
    { 
        field: 'gender',
        headerName: lang.gender,
    },
    { 
        field: 'firstName',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'lastName',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'friends',
        headerName: lang.friends
    },
    { 
        field: 'dating',
        headerName: lang.dating
    },
    { 
        field: 'support',
        headerName: 'Support'
    },
    { 
        field: 'country',
        headerName: lang.country
    },
    { 
        field: 'timezone',
        headerName: lang.timezone
    },
    { 
        field: 'linkHacked',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'count',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'shareError',
        hide: true,
        suppressFiltersToolPanel: true
    },
    { 
        field: 'shareCount',
        headerName: 'TK Share'
    },
    
]

let scrolling = false
let saveLog = false

// let the grid know which columns and what data to use
const accountGrid = {
    //enableRangeSelection: true,
    undoRedoCellEditing: false,
    rowSelection: 'multiple',
    suppressContextMenu: true,
    suppressMovableColumns: false,
    suppressDragLeaveHidesColumns: true,
    rowMultiSelectWithClick: true,
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    defaultColDef: {
        flex: 1,
        suppressMenu: true,
        minWidth: 100,
        resizable: true,
        sortable: true,
        lockPinned: true,
        editable: true
    },
    columnDefs: columnDefs,
    rowData: [],
    localeText: {
        noRowsToShow: lang.noRowsToShow,
    },
    onRangeSelectionChanged: function(e) {

        const selected = e.api.getCellRanges()

        if (selected.length) {

            let total = 0

            if (selected[0].startRow.rowIndex < selected[0].endRow.rowIndex) {

                total = selected[0].endRow.rowIndex - (selected[0].startRow.rowIndex - 1)

            } else {
                total = selected[0].startRow.rowIndex - (selected[0].endRow.rowIndex - 1)
            }
            

            $('#boiden').text(total)

        } else {

            $('#boiden').text(0)

        }
    },
    onSelectionChanged: function(e) {
        const selected = e.api.getSelectedRows()

        $('#dachon').text(selected.length)
    },
    onRowDataUpdated: function(e) {
        $('#tong').text(e.api.getDisplayedRowCount())
    },
    onFilterChanged: function(e) {
        $('#tong').text(e.api.getDisplayedRowCount())
    },
    rowClassRules: {
        'running': function(params) { return params.data.status === 'RUNNING' },
        'finished': function(params) { return params.data.status === 'FINISHED' },
    },
    onBodyScroll: function(e) {
        scrolling = true
    },
    onBodyScrollEnd: function(e) {
        scrolling = false
    }
}

const previewColumn = columnDefs.filter(item => !item.headerCheckboxSelection).map(item => {
    if (item.field === 'id') {
        item.pinned = false
    }

    return item
})


const previewGrid = {
    //enableRangeSelection: true,
    rowSelection: 'multiple',
    suppressContextMenu: true,
    suppressMovableColumns: false,
    suppressDragLeaveHidesColumns: true,
    rowMultiSelectWithClick: true,
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    defaultColDef: {
        flex: 1,
        suppressMenu: true,
        minWidth: 100,
        resizable: true,
        sortable: true,
    },
    columnDefs: previewColumn,
    rowData: [],
    localeText: {
        noRowsToShow: lang.noRowsToShow,
    },
}


const whatsAppColumns = [
    {
        resizable: false,
        headerCheckboxSelection: true,
        headerCheckboxSelectionCurrentPageOnly: true,
        checkboxSelection: true,
        showDisabledCheckboxes: true,
        maxWidth: 40,
        suppressMovable: true,
    },
    { 
        field: 'id',
        headerName: 'ID',
        hide: true,
        suppressMovable: true,
    },
    { 
        field: 'number',
        headerName: 'Number',
        width: 100,
        minWidth: 200,
        suppressMovable: true,
    },
    { 
        field: 'active',
        headerName: 'Status',
        suppressFiltersToolPanel: true,
        cellRenderer: (params) => {
            if (params.data.active) {
                return '<span class="badge rounded-pill text-bg-success">Hoạt động</span>'
            } else {
                return '<span class="badge rounded-pill text-bg-danger">Không hoạt động</span>'
            }
        }
    },
]

const whatsAppGrid = {
    //enableRangeSelection: true,
    rowSelection: 'multiple',
    suppressContextMenu: true,
    suppressMovableColumns: false,
    suppressDragLeaveHidesColumns: true,
    rowMultiSelectWithClick: true,
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    defaultColDef: {
        flex: 1,
        suppressMenu: true,
        minWidth: 100,
        resizable: true,
        sortable: true,
    },
    columnDefs: whatsAppColumns,
    rowData: [],
    localeText: {
        noRowsToShow: lang.noRowsToShow,
    },
}

const instaColumns = [
    {
        resizable: false,
        headerCheckboxSelection: true,
        headerCheckboxSelectionCurrentPageOnly: true,
        checkboxSelection: true,
        showDisabledCheckboxes: true,
        maxWidth: 40,
        suppressMovable: true,
    },
    { 
        field: 'id',
        headerName: 'ID',
        suppressMovable: true,
    },
    { 
        field: 'account',
        headerName: 'Account',
        suppressMovable: true,
    },
    { 
        field: 'username',
        headerName: 'Username',
        hide: true,
        suppressMovable: true,
    },
    { 
        field: 'password',
        headerName: 'Password',
        hide: true,
        suppressMovable: true,
    },
    { 
        field: 'twofa',
        headerName: '2FA',
        hide: true,
        suppressMovable: true,
    },
    { 
        field: 'email',
        headerName: 'Email',
        hide: true,
        suppressMovable: true,
    },
    { 
        field: 'message',
        headerName: 'Message',
        suppressMovable: true,
    },
    { 
        field: 'status',
        headerName: 'Status',
        suppressMovable: true,
    },
]

const instaGrid = {
    //enableRangeSelection: true,
    rowSelection: 'multiple',
    suppressContextMenu: true,
    suppressMovableColumns: false,
    suppressDragLeaveHidesColumns: true,
    rowMultiSelectWithClick: true,
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    defaultColDef: {
        flex: 1,
        suppressMenu: true,
        minWidth: 100,
        resizable: true,
        sortable: true,
    },
    columnDefs: instaColumns,
    rowData: [],
    localeText: {
        noRowsToShow: lang.noRowsToShow,
    },
}

$(document).ready(async function() {

    window.api.send('checkLicense')

    const selectData = await window.api.get('getSelectData')

    const timezoneOptions = selectData.timezone.map(item => {
        return '<option value="'+item.value+'">'+item.name+'</option>'
    })

    const timezone2Options = selectData.timezone2.map(item => {
        return '<option value="'+item.value+'">'+item.name+'</option>'
    })

    const currencyOptions = selectData.currency.map(item => {
        return '<option value="'+item.value+'">'+item.name+'</option>'
    })

    const countryOptions = selectData.country.map(item => {
        return '<option value="'+item.value+'">'+item.name+'</option>'
    })

    $('select[name="tkqcTimezone"]').html(timezoneOptions)
    $('select[name="kich5m8Timezone"]').html(timezone2Options)
    $('select[name="tkqcCurency"], select[name="kich5m8Currency"]').html(currencyOptions)
    $('select[name="kich5m8Country"]').html(countryOptions)

    $('[data-lang]').each(function() {
        const key = $(this).attr('data-lang')

        $(this).text(lang[key])
    })

    const gridDiv = document.querySelector('#accounts')
    const previewDiv = document.querySelector('#preview')
    const whatsAppDiv = document.querySelector('#whatsApp')
    const instaDiv = document.querySelector('#insta')

    new agGrid.Grid(gridDiv, accountGrid)
    new agGrid.Grid(previewDiv, previewGrid)
    new agGrid.Grid(whatsAppDiv, whatsAppGrid)
    new agGrid.Grid(instaDiv, instaGrid)

    const savedData = await window.api.get('savedData')

    
    
    let savedCategory = await window.api.get('getCategory')

    if (!savedCategory.length) {
        savedCategory = localStorage.getItem('category') || '[]'
        savedCategory = JSON.parse(savedCategory)
    }

    savedCategory.forEach(item => {
        $('#category').append('<button class="cat-item" data-cat="'+item.id+'" type="button">'+item.name+'</button>')
    })

    initCategoryMenu()
    loadSetting()
    loadExt()
    loadPhone()
    saveCategory()

    new Sortable(document.getElementById('category'), {
        animation: 0,
        filter: '#allCategory'
    })

    const rows = []

    for (let index = 0; index < savedData.length; index++) {
        const item = savedData[index]

        item.id = index
        item.status = ''
        item.isRunning = 0
        item.isRunning = 0
        item.pid = ''
        item.position = ''
        item.proxyKey = ''
        item.newEmail = ''

        rows.push(item)
        
    }

    const tool = localStorage.getItem('active_tool') || 'change'

    if (tool !== 'change') {
        $('#toolTabs').find('button[data-bs-target="#'+tool+'"]').tab('show')
        activeTool()
    }

    
    accountGrid.api.setRowData(rows)

    initScroller()
            
    setTimeout(async () => {

        const tool = $('.active[data-tool]').attr('data-tool')

        let savedState = localStorage.getItem('state_'+tool) || '[]'

        savedState = JSON.parse(savedState)

        accountGrid.columnApi.applyColumnState({ 
            state: savedState, 
            applyOrder: true 
        })

        setInterval(() => {

            const tool = $('.active[data-tool]').attr('data-tool')
            const state = accountGrid.columnApi.getColumnState()
            localStorage.setItem('state_'+tool, JSON.stringify(state))

            if ($('body').hasClass('setting-loaded')) {
                saveSetting()
            }
        
        }, 5000)

    }, 500)

    setInterval(() => {
        window.api.send('checkLicense')
    }, 900000)

})

function saveData() {

    return new Promise(async (resolve, reject) => {
        
        const rows = []
        const columns = columnDefs.filter(item => item.field).map(item => item.field)

        accountGrid.api.forEachNode(node => {
            rows.push(node.data)
        })

        if (rows.length > 0) {
            await window.api.get('saveLog', {rows, columns})
        }

        $('#lastSync').text(' - Last synced: '+new Date().toLocaleString())

        resolve()
        
    })

}

$('#insta').on('contextmenu', function(e) {

    const menuHeight = parseInt($('#contextMenuInsta > ul').outerHeight())
    const height = parseInt($('body').outerHeight())

    if ((e.pageY + menuHeight) > height) {
        $('#contextMenuInsta').addClass('open').css({
            top: (e.pageY - menuHeight)+'px',
            left: e.pageX+'px',
        })
    } else {
        $('#contextMenuInsta').addClass('open').css({
            top: e.pageY+'px',
            left: e.pageX+'px',
        })
    }

})

$('#whatsApp').on('contextmenu', function(e) {

    const menuHeight = parseInt($('#contextMenuWhatsApp > ul').outerHeight())
    const height = parseInt($('body').outerHeight())

    if ((e.pageY + menuHeight) > height) {
        $('#contextMenuWhatsApp').addClass('open').css({
            top: (e.pageY - menuHeight)+'px',
            left: e.pageX+'px',
        })
    } else {
        $('#contextMenuWhatsApp').addClass('open').css({
            top: e.pageY+'px',
            left: e.pageX+'px',
        })
    }

})

$('#accounts').on('contextmenu', function(e) {

    const menuHeight = parseInt($('#contextMenu > ul').outerHeight())
    const height = parseInt($('body').outerHeight())

    if ((e.pageY + menuHeight) > height) {
        $('#contextMenu').addClass('open').css({
            top: (e.pageY - menuHeight)+'px',
            left: e.pageX+'px',
        })
    } else {
        $('#contextMenu').addClass('open').css({
            top: e.pageY+'px',
            left: e.pageX+'px',
        })
    }

})

$(document).click(() => {
    $('#contextMenu').removeClass('open').css({
        top: '-999px',
        left: '-999px',
    })

    $('#contextMenuWhatsApp').removeClass('open').css({
        top: '-999px',
        left: '-999px',
    })

    $('#contextMenuInsta').removeClass('open').css({
        top: '-999px',
        left: '-999px',
    })
})

$('.dropdown-submenu a').click(function() {
    $('#contextMenu').removeClass('open').css({
        top: '-999px',
        left: '-999px',
    })
})

$('input[name="changeHacked"]').change(function() {
    const val = $(this).is(':checked') ? true : false

    if (val) {
        $('input[name="changePassword"]').prop('checked', true)
        
        $('input[name="addEmail"]').prop('checked', true)

        $('#changePasswordSetting').removeClass('d-none')
        $('#addEmailSetting').removeClass('d-none')
    }
})

$('input[name="changeCookie"]').change(function() {

    const val = $(this).is(':checked') ? true : false

    if (val) {
        $('input[name="changePassword"]').prop('checked', true)
        
        $('input[name="addEmail"]').prop('checked', true)

        $('#changePasswordSetting').removeClass('d-none')
        $('#addEmailSetting').removeClass('d-none')
    }
})

$('.form-select').change(function() {
    
    const value = $(this).find(':selected').val()
    const parent = $(this).attr('name')

    $('[data-parent="'+parent+'"]').addClass('d-none')

    $('[data-parent="'+parent+'"][data-value="'+value+'"]').removeClass('d-none')

})

$('input[name="changeHacked"]').change(function() {
    const val = $(this).is(':checked') ? true : false

    if (val) {
        $('input[name="changePassword"]').prop('checked', true)
        $('input[name="addEmail"]').prop('checked', true)

        $('#changePasswordSetting').removeClass('d-none')
        $('#addEmailSetting').removeClass('d-none')
    }
})

$('input[name="changePassword"], input[name="addEmail"]').change(function() {
    const val = $(this).is(':checked') ? true : false

    if (!val) {
        $('input[name="changeHacked"]').prop('checked', false)
        $('input[name="changeCookie"]').prop('checked', false)

        $('#changeCookieSetting').addClass('d-none')
    } 
})

$('.form-check-input[data-target]').change(function() {
    const val = $(this).is(':checked') ? true : false
    const target = $(this).attr('data-target')

    if (val) {
        $('#'+target).removeClass('d-none')
    } else {
        $('#'+target).addClass('d-none')
    }
})

$('#chromeSelect').change(function() {
    $('input[name="chromePath"]').val($(this)[0].files[0].path)
})

$('#linkFileSelect').change(function() {
    $('input[name="linkFilePath"]').val($(this)[0].files[0].path)
})

$('#accFileSelect').change(function() {
    $('#accFileSo input[type="text"]').val($(this)[0].files[0].path)
})


async function deleteExt(id) {
    await window.api.get('deleteExt', id)

    $('[data-id="'+id+'"]').remove()
}

async function loadExt() {

    const extData = await window.api.get('loadExt')

    let extContent = ''

    extData.forEach(item => {
        extContent += `
            <div data-id="${item.id}" class="p-2 mb-3 border rounded d-flex align-items-center justify-content-between">
                <div class="d-flex">
                    <img class="me-3" src="${item.icon}" height="48">
                    <div>
                        <strong>${item.name}</strong> <span class="badge text-bg-success">${item.version}</span>
                        <p>${item.description}</p>
                    </div>
                </div>
                <button class="btn btn-sm btn-danger"><i class="ri-delete-bin-6-line" onclick="deleteExt('${item.id}')"></i></div>
            </div>
        `
    })

    $('#extensions').html(extContent)

}

$('#loadExtension').change(async function() {
    const files = $(this)[0].files 

    let path = false

    for (let index = 0; index < files.length; index++) {
        
        if (files[index].name === 'manifest.json') {

            path = files[index].path.replace('manifest.json', '')

            await window.api.get('extInfo', files[index].path)

            loadExt()

            break
        }
        
    }

    console.log(path)
})

function initCategoryMenu() {
    $('.cat-item[data-cat]:not(#allCategory)').contextmenu({
        target: '#contextMenuCategory',
        before: function(e) {

            activeCategory($(e.target))

            return true
        }
    })
}


$(document).on('click', '.cat-item[data-cat]', function() {
    activeCategory($(this))
})

function renameCategory() {

    const inputValue = $('.cat-item.active').text()

    Swal.fire({
        title: 'Nhập tên mới',
        input: 'text',
        inputValue,
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Đổi tên',
        cancelButtonText: 'Hủy',
        inputValidator: (value) => {

            if (value.length) {
                $('.cat-item.active').text(value)
                saveCategory()
            } else {
                return 'Tên không thể để trống'
            }

        }
    })

}

function saveCategory() {

    const category = []
    
    let catOptions = ''

    $('#category .cat-item:not(#allCategory)').each(function() {

        const name = $(this).text()
        const id = $(this).attr('data-cat')

        category.push({name, id})

        catOptions += '<option value="'+id+'">'+name+'</option>'

    })

    $('select.loadFolder').html(catOptions)

    window.api.send('saveCategory', category)

}

function deleteCategory() {

    const id = $('.cat-item.active').attr('data-cat')

    Swal.fire({
        title: 'Bạn có chắc muốn xóa',
        text: 'Dữ liệu trong thư mục cũng sẽ bị xóa',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {

            const deletedRows = []

            accountGrid.api.forEachNode(node => {
                if (node.data.category == id) {
                    deletedRows.push(node.data)
                }
            })

            accountGrid.api.applyTransaction({ remove: deletedRows })

            $('.cat-item.active').addClass('delete')


            $('#contextMenuCategory').removeClass('open')

            activeCategory($('.cat-item.active').prev())

            $('.cat-item.delete').remove()

            saveCategory()

            initScroller()
            

        }
    })
}

function activeCategory(that) {
    
    const id = that.attr('data-cat')

    if (id > 0) { 
        accountGrid.api.setFilterModel({
            category: {
                type: 'equals',
                filter: id
            }
        })
    } else {
        accountGrid.api.setFilterModel(null)
    }

    accountGrid.api.deselectAll()
    accountGrid.api.clearRangeSelection()

    $('.cat-item').removeClass('active')

    that.addClass('active')

    const search = accountGrid.api.getQuickFilter()

    localStorage.setItem('active_category', id)

    accountGrid.api.setQuickFilter('')
    accountGrid.api.setQuickFilter(search)

}


function addCategory() {

    const categories = $('#category .cat-item').map(item => {
        return parseInt($('#category .cat-item').eq(item).attr('data-cat'))
    }).sort((a, b) => {
        return a - b
    })

    const lastCategory = categories.slice(-1)[0]

    const scrollWidth = $('#category')[0].scrollWidth

    const id = lastCategory + 1

    $('#category').append('<button class="cat-item" data-cat="'+id+'" type="button">Thư mục '+id+'</button>')

    activeCategory($('.cat-item[data-cat="'+id+'"]'))

    saveCategory()

    initCategoryMenu()

    initScroller()

    $('#category').scrollLeft(scrollWidth)

}

async function moveToCategory() {

    const category = await window.api.get('getCategory')

    const inputOptions = {
        0: 'Thư mục chính'
    }

    category.forEach(cat => {
        inputOptions[cat.id] = cat.name
    })

    Swal.fire({
        title: 'Chọn thư mục',
        input: 'select',
        inputOptions,
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Di chuyển',
        cancelButtonText: 'Hủy',
        inputValidator: (value) => {

            value = value === 0 ? '' : value

            getSelectedRows().forEach(row => {
                accountGrid.api.getRowNode(row.id).setDataValue('category', value)
            })

            activeCategory($('.cat-item[data-cat="'+value+'"]'))

            saveData()

        }
    })

}

function initScroller() {

    $('#category').scrollLeft(0)

    const width = $('#category')[0].clientWidth
    const scrollWidth = $('#category')[0].scrollWidth

    if (width < scrollWidth) {

        $('.category-nav-wrapper').removeClass('opacity-0')
        $('.category-nav.next').prop('disabled', false)

    } else {

        $('.category-nav-wrapper').addClass('opacity-0')
        $('.category-nav').prop('disabled', true)
        
    }
}

function openLink(url) {
    window.api.send('openLink', url)
}

$(window).on('resize', initScroller)

$('#category').on('scroll', function() {

    const scrollLeft = $('#category').scrollLeft()
    const maxScrollLeft = $('#category')[0].scrollWidth - $('#category')[0].clientWidth;

    if (scrollLeft === 0) {
        $('.category-nav.prev').prop('disabled', true)
    } else {
        $('.category-nav.prev').prop('disabled', false)
    }

    if (scrollLeft === maxScrollLeft) {
        $('.category-nav.next').prop('disabled', true)
    } else {
        $('.category-nav.next').prop('disabled', false)
    }
})

$('.category-nav.next').click(function() {
    $('#category').animate({scrollLeft: "+=100px"}, 100)
})

$('.category-nav.prev').click(function() {
    $('#category').animate({scrollLeft: "-=100px"}, 100)
})

window.api.receive('congDataVia', (data) => {

    const setting = JSON.parse(localStorage.getItem('setting'))

    const current = accountGrid.api.getRowNode(data.id)

    const count = parseInt(current.data.count) || 0

    if (count) {

        accountGrid.api.getRowNode(data.id).setDataValue('count', count + 1)
        accountGrid.api.getRowNode(data.id).setDataValue('shareCount', count + 1)

    } else if (count >= setting.tut.maxVia.value) {

        accountGrid.api.getRowNode(data.id).setDataValue('count', setting.tut.maxVia.value)
        accountGrid.api.getRowNode(data.id).setDataValue('shareCount', setting.tut.maxVia.value)

    } else {

        accountGrid.api.getRowNode(data.id).setDataValue('count', 1)
        accountGrid.api.getRowNode(data.id).setDataValue('shareCount', 1)

    }

})

window.api.receive('congDataViaError', (data) => {

    const current = accountGrid.api.getRowNode(data.id)

    const count = parseInt(current.data.shareError)

    if (count >= 4) {

        accountGrid.api.getRowNode(data.id).setDataValue('shareError', 5)
        accountGrid.api.getRowNode(data.id).setDataValue('process', 'UID Die')

    } else {

        accountGrid.api.getRowNode(data.id).setDataValue('shareError', count + 1)

    }

})

window.api.receive('congData', (data) => {

    const setting = JSON.parse(localStorage.getItem('setting'))

    const current = accountGrid.api.getRowNode(data.id)

    const count = parseInt(current.data.count) 

    if (count >= setting.tut.maxBm.value) {

        accountGrid.api.getRowNode(data.id).setDataValue('count', setting.tut.maxBm.value)

    } else {

        accountGrid.api.getRowNode(data.id).setDataValue('count', count + 1)

    }

})

window.api.receive('truData', (data) => {

    const current = accountGrid.api.getRowNode(data.id)

    const count = parseInt(current.data.count)

    if (count > 0) {
        accountGrid.api.getRowNode(data.id).setDataValue('count', count - 1)
    } else {
        accountGrid.api.getRowNode(data.id).setDataValue('count', 0)
    }

})

window.api.receive('viaRunning', (data) => {

    accountGrid.api.getRowNode(data.id).setDataValue('isRunning', 1)

})

window.api.receive('viaStopped', (data) => {

    accountGrid.api.getRowNode(data.id).setDataValue('isRunning', 0)

})

window.api.receive('renamePageResult', (data) => {

    if (data.error.length > 0) {

        const errorData = $('textarea[name="renameError"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

        const final = errorData.concat(data.error)

        $('#renameErrorCount').text(final.length)

        $('textarea[name="renameError"]').val(final.join("\r\n"))

    }

    if (data.success.length > 0) {

        const successData = $('textarea[name="renameSuccess"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

        const final = successData.concat(data.success)

        $('#renameSuccessCount').text(final.length)

        $('textarea[name="renameSuccess"]').val(final.join("\r\n"))

    }

})

window.api.receive('updateLinkAll', (data) => {

    $('#backupLinkAllCount').text(data.length)

    $('[name="backupLinkAll"]').val(data.join("\r\n"))

})

window.api.receive('updateLinkError', (link) => {

    const data = $('[name="backupLinkError"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

    data.push(link)

    $('#backupLinkErrorCount').text(data.length)
    $('[name="backupLinkError"]').val(data.join("\r\n"))

})

window.api.receive('updateLinkSuccess', (link) => {

    const data = $('[name="backupLinkSuccess"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

    data.push(link)

    $('#backupLinkSuccessCount').text(data.length)
    $('[name="backupLinkSuccess"]').val(data.join("\r\n"))

})

window.api.receive('maximized', () => {
    $('#maximize').addClass('d-none')
    $('#unmaximize').removeClass('d-none')
})

window.api.receive('unmaximized', () => {
    $('#unmaximize').addClass('d-none')
    $('#maximize').removeClass('d-none')
})

window.api.receive('message', (item) => {
    accountGrid.api.getRowNode(item.id).setDataValue('process', item.message)
})

window.api.receive('instaMessage', (item) => {
    instaGrid.api.getRowNode(item.id).setDataValue('message', item.message)
})

window.api.receive('finish', (data) => {

    accountGrid.api.getRowNode(data.item.id).setDataValue('status', 'FINISHED')
    accountGrid.api.getRowNode(data.item.id).setDataValue('lastTime', data.time)

})

window.api.receive('running', (data) => {

    accountGrid.api.getRowNode(data).setDataValue('status', 'RUNNING')

})

function openAdManager() {

    const data = getSelectedRows()

    if (data.length > 0) {
        run('adCheck')
    } else {
        window.api.send('openAdManager')
    }
}

function openInstagram() {
    window.api.send('openInstagram')
}

window.api.receive('stopped', async (data) => {

    const mode = $('#accounts').attr('data-mode')

    if (mode === 'adCheck') {

        window.api.send('openAdManager')

    }

    if (!$('#accounts').hasClass('stopped')) {

        await saveData()

        clearInterval(saveLog)

        $('#loadingScreen').addClass('d-none')

        $('#accounts').addClass('stopped')
        $('#stop').prop('disabled', false)
        $('#start').removeClass('d-none')
        $('#stop').addClass('d-none')

        if (mode === 'dameXmdt') {
            run('dameXmdt')
        }

    } else {

        $('#loadingScreen').addClass('d-none')

    }

})

window.api.receive('updateLink273', (data) => {
    accountGrid.api.getRowNode(data.id).setDataValue('link273', data.link)
})

window.api.receive('updateInfo', (data) => {

    if (data.createdTime) { accountGrid.api.getRowNode(data.id).setDataValue('createdTime', data.createdTime) }
    if (data.name) { accountGrid.api.getRowNode(data.id).setDataValue('name', data.name) }
    if (data.timezoneName) { accountGrid.api.getRowNode(data.id).setDataValue('timezone', data.timezoneName) }
    if (data.userCount) { accountGrid.api.getRowNode(data.id).setDataValue('resource', data.userCount) }
    if (data.limit) { accountGrid.api.getRowNode(data.id).setDataValue('limit', data.limit) }
    if (data.dating) { accountGrid.api.getRowNode(data.id).setDataValue('dating', data.dating) }
    if (data.support) { accountGrid.api.getRowNode(data.id).setDataValue('support', data.support) }
    if (data.bm) { accountGrid.api.getRowNode(data.id).setDataValue('bm', data.bm) }
    if (data.page) { accountGrid.api.getRowNode(data.id).setDataValue('page', data.page) }
    if (data.pageXmdt) { accountGrid.api.getRowNode(data.id).setDataValue('pageXmdt', data.pageXmdt) }

    if (data.pageHcvv) { accountGrid.api.getRowNode(data.id).setDataValue('pageHcvv', data.pageHcvv) }
    if (data.pageDangKhang) { accountGrid.api.getRowNode(data.id).setDataValue('pageDangKhang', data.pageDangKhang) }
    if (data.pageCanKhang) { accountGrid.api.getRowNode(data.id).setDataValue('pageCanKhang', data.pageCanKhang) }
    if (data.pageKhang) { accountGrid.api.getRowNode(data.id).setDataValue('pageKhang', data.pageKhang) }
    if (data.pageXmdt) { accountGrid.api.getRowNode(data.id).setDataValue('pageXmdt', data.pageXmdt) }
    if (data.pageLive) { accountGrid.api.getRowNode(data.id).setDataValue('pageLive', data.pageLive) }
    if (data.pageLiveStream) { accountGrid.api.getRowNode(data.id).setDataValue('pageLiveStream', data.pageLiveStream) }

    if (data.spendPage) { accountGrid.api.getRowNode(data.id).setDataValue('spendPage', data.spendPage) }
    if (data.quality) { accountGrid.api.getRowNode(data.id).setDataValue('quality', data.quality) }
    if (data.birthday) { accountGrid.api.getRowNode(data.id).setDataValue('dob', data.birthday) }
    if (data.gender) { accountGrid.api.getRowNode(data.id).setDataValue('gender', data.gender) }
    if (data.firstName) { accountGrid.api.getRowNode(data.id).setDataValue('firstName', data.firstName) }
    if (data.lastName) { accountGrid.api.getRowNode(data.id).setDataValue('lastName', data.lastName) }
    if (data.bestBm) { accountGrid.api.getRowNode(data.id).setDataValue('bestBm', data.bestBm) }
    if (data.bestAcc) { accountGrid.api.getRowNode(data.id).setDataValue('active', data.bestAcc) }
    if (data.bmXmdn) { accountGrid.api.getRowNode(data.id).setDataValue('bmXmdn', data.bmXmdn) }
    if (data.bm350Live) { accountGrid.api.getRowNode(data.id).setDataValue('bm350Live', data.bm350Live) }
    if (data.bm350Die) { accountGrid.api.getRowNode(data.id).setDataValue('bm350Die', data.bm350Die) }
    if (data.bm50Live) { accountGrid.api.getRowNode(data.id).setDataValue('bm50Live', data.bm50Live) }
    if (data.bm50Die) { accountGrid.api.getRowNode(data.id).setDataValue('bm50Die', data.bm50Die) }
    if (data.bmNoLimitLive) { accountGrid.api.getRowNode(data.id).setDataValue('bmNoLimitLive', data.bmNoLimitLive) }
    if (data.bmNoLimitDie) { accountGrid.api.getRowNode(data.id).setDataValue('bmNoLimitDie', data.bmNoLimitDie) }
    if (data.bmDieVinhVien) { accountGrid.api.getRowNode(data.id).setDataValue('bmDieVinhVien', data.bmDieVinhVien) }
    if (data.bmKhang350) { accountGrid.api.getRowNode(data.id).setDataValue('bmKhang350', data.bmKhang350) }
    if (data.bmKhang50) { accountGrid.api.getRowNode(data.id).setDataValue('bmKhang50', data.bmKhang50) }
    if (data.bmKhangNoLimit) { accountGrid.api.getRowNode(data.id).setDataValue('bmKhangNoLimit', data.bmKhangNoLimit) }
    if (data.bmDieDangKhang) { accountGrid.api.getRowNode(data.id).setDataValue('bmDieDangKhang', data.bmDieDangKhang) }
    if (data.account273) { accountGrid.api.getRowNode(data.id).setDataValue('account273', data.account273) }
    if (data.friends) { accountGrid.api.getRowNode(data.id).setDataValue('friends', data.friends) }
    if (data.country) { accountGrid.api.getRowNode(data.id).setDataValue('country', data.country) }
    
})

window.api.receive('unCheckItem', id => {
    accountGrid.api.getRowNode(id).setSelected(false)
})

window.api.receive('updatePid', (data) => {

    accountGrid.api.getRowNode(data.id).setDataValue('pid', data.pid)
    
})

window.api.receive('update2Fa', (data) => {

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('twofa', data.twofa)
    accountGrid.api.getRowNode(data.id).setDataValue('account', update2Fa(account, data.twofa))
    
})

window.api.receive('updatePassword', (data) => {

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('password', data.new)
    accountGrid.api.getRowNode(data.id).setDataValue('account', updatePassword(account, data.new))
    
})

window.api.receive('clearCheckpoint', () => {
    $('#cpCount').text('0')
})

window.api.receive('countCheckpoint', () => {

    const setting = JSON.parse(localStorage.getItem('setting'))

    const cpCount = parseInt($('#cpCount').text())
    const limitCp = parseInt(setting.general.cpCount.value)

    if ((cpCount + 1) === limitCp) {

        stop()

        Swal.fire({
            icon: 'error',
            title: 'Đã dừng',
            text: 'Vượt quá số lần Checkpoint liên tiếp',
            confirmButtonColor: '#0d6efd'
        })

    }

    $('#cpCount').text(cpCount + 1)
})

window.api.receive('updateStatus', (data) => {

    if (data.status === 'Timeout') {
        if (accountGrid.api.getRowNode(data.id).data.status !== 'FINISHED') {
            accountGrid.api.getRowNode(data.id).setDataValue('quality', data.status)
        }
    } else {
        accountGrid.api.getRowNode(data.id).setDataValue('quality', data.status)
    }
    
})

window.api.receive('removeEmail', (data) => {

    let emails = localStorage.getItem('email') || '[]'
    emails = JSON.parse(emails)

    if (emails.length) {
        localStorage.setItem('email', JSON.stringify(emails.filter(email => {
            return !email.includes(data.newEmail)
        })))
    }
    
})

window.api.receive('updatePassMailInsta', (data) => {

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('passMail', data.newPass)
    accountGrid.api.getRowNode(data.id).setDataValue('account', updatePassMailInsta(account, data.newPass))
    
})

window.api.receive('updateEmailInsta', (data) => {

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('email', data.newEmail)
    accountGrid.api.getRowNode(data.id).setDataValue('account', updateEmailInsta(account, data.newEmail))
    
})

window.api.receive('updateEmail', (data) => {

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('email', data.newEmail)
    accountGrid.api.getRowNode(data.id).setDataValue('passMail', data.newEmailPassword)
    accountGrid.api.getRowNode(data.id).setDataValue('account', updateEmail(account, data.newEmail, data.newEmailPassword))
    
})

window.api.receive('updateRecoveryEmail', (data) => {

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('recoverEmail', data.email)
    accountGrid.api.getRowNode(data.id).setDataValue('account', updateRecoveryEmail(account, data.email))
    
})

window.api.receive('updateProfile', (data) => {

    console.log(data)

    accountGrid.api.getRowNode(data.id).setDataValue('profile', data.profile)

})

window.api.receive('updateCookie', (data) => {

    console.log(data)

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('cookies', data.cookies)

    if (data.type === 'instagram') {
        accountGrid.api.getRowNode(data.id).setDataValue('account', updateCookieInsta(account, data.cookies))
    } else {
        accountGrid.api.getRowNode(data.id).setDataValue('account', updateCookie(account, data.cookies))
    }
    
})

window.api.receive('updateToken', (data) => {

    console.log(data)

    const account = accountGrid.api.getRowNode(data.id).data.account

    accountGrid.api.getRowNode(data.id).setDataValue('token', data.token)
    accountGrid.api.getRowNode(data.id).setDataValue('account', updateToken(account, data.token))
    
})

window.api.receive('checkVersion', async (data) => {

    $('.version').text(data.ver)
    $('.key').text(data.key)
    $('.exp').text(data.exp)

    if (data.soVip) {
        $('#soVipAlert').hide()
    }

    const oldVer = localStorage.getItem('version')

    if (oldVer) {

        if (oldVer !== data.ver) {

            localStorage.setItem('version', data.ver)

            Swal.fire({
                icon: 'success',
                width: 500,
                title: 'Phiên bản '+data.ver,
                text: 'Tính năng mới',
                input: 'textarea',
                inputValue: data.note,
                inputAttributes: {
                    rows: 7,
                    disabled: true
                }
            })
        }

    } else {
        localStorage.setItem('version', data.ver)
    }
    
})

window.api.receive('loadTitle', (data) => {

    $('.titleBar').text(data)
    $('title').text(data)
    
})

window.api.receive('loadPhoi', (data) => {
    loadPhoi() 
})

window.api.receive('checkHackedProgress', (data) => {
    $('#checkHackedProgress').html(data)
})

window.api.receive('checkLiveProgress', (data) => {
    $('#checkLiveProgress').html(data)
})

window.api.receive('checkInstagramProgress', (data) => {
    $('#checkInstagramProgress').html(data)
})

window.api.receive('checkWhatsAppProgress', (data) => {
    $('#checkWhatsAppProgress').html(data)
})

window.api.receive('checkEmailProgress', (data) => {
    $('#checkEmailProgress').html(data)
})

window.api.receive('getLinkProgress', (data) => {
    $('#getLinkProgress').html(data)
})

window.api.receive('checkHackedResult', (data) => {
    accountGrid.api.getRowNode(data.id).setDataValue('process', data.status)
    accountGrid.api.getRowNode(data.id).setDataValue('linkHacked', data.link)
})

window.api.receive('checkAdsResult', (data) => {
    accountGrid.api.getRowNode(data.id).setDataValue('process', data.status)
})

window.api.receive('checkEmailResult', (data) => {
    accountGrid.api.getRowNode(data.id).setDataValue('process', data.status)
})

window.api.receive('checkLiveResult', (data) => {
    accountGrid.api.getRowNode(data.id).setDataValue('process', data.status)
})

window.api.receive('showQr', (url) => {
    Swal.fire({
        html: '<img style="width:100%" src="'+url+'">',
        showCloseButton: true,
        showConfirmButton: false,
        willClose: () => {
            window.api.send('closeQr')
        }
    })
})

window.api.receive('whatsAppLoggedIn', () => {
    Swal.close()
    getWhatsAppData()
})

$('#menuButton').click(() => {

    if ($('body').hasClass('hideMenu')) {

        $('body').removeClass('hideMenu')

    } else {

        $('body').addClass('hideMenu')

    }

})

$('input[type="number"]').change(function() {

    const val = parseInt($(this).val())
    const min = $(this).attr('min')
    const max = $(this).attr('max')

    if (min && min > val) {
        $(this).val(min)
    }

    if (max && max < val) {
        $(this).val(max)
    }

})

async function exportInsta(type) {

    const rows = []

    instaGrid.api.forEachNodeAfterFilterAndSort(node => {

        if (type === 'all') {
            rows.push(node.data)
        }

        if (type === 'selected' && node.selected) {
            rows.push(node.data)
        }

        if (type === 'live' && node.data.status === 'Live') {
            rows.push(node.data)
        }

        if (type === 'die' && node.data.status === 'Die') {
            rows.push(node.data)
        }
    })

    if (rows.length > 0) {

        const downloadFile = (content) => {
            const link = document.createElement("a")
            const file = new Blob([content], { type: 'text/plain' })
            link.href = URL.createObjectURL(file)
            link.download = "instagram.txt"
            link.click()
            URL.revokeObjectURL(link.href)
        }

        const content = rows.map(item => item.account).join("\r\n")

        downloadFile(content)

    }
}

async function deleteInsta() {

    const rows = []

    instaGrid.api.forEachNodeAfterFilterAndSort(node => {
        if (node.selected) {
            rows.push(node.data)
        }
    })

    if (rows.length > 0) {

        await window.api.get('deleteInsta', rows)

        loadInsta()
    }
}

async function checkWhatsApp() {

    const rows = []

    whatsAppGrid.api.forEachNodeAfterFilterAndSort(node => {
        if (node.selected) {
            rows.push(node.data)
        }
    })

    const loading = Swal.fire({
        title: 'Đang Check Whatsapp',
        html: '<span id="checkWhatsAppProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('checkWhatsApp', rows)

    getWhatsAppData()

    loading.close()

    return

}

async function deleteWhatsApp() {

    const rows = []

    whatsAppGrid.api.forEachNodeAfterFilterAndSort(node => {
        if (node.selected) {
            rows.push(node.data)
        }
    })

    if (rows.length > 0) {

        await window.api.get('deleteWhatsApp', rows)

        getWhatsAppData()
    }
}

async function addWhatsApp() {

    Swal.fire({
        didOpen: () => {
            Swal.showLoading()
        }
    })

    window.api.send('getWhatsAppQr')
}

async function getWhatsAppData() {
    
    const data = await window.api.get('getWhatsAppData')

    $('#whatsAppCount').text(data.length)

     whatsAppGrid.api.setRowData(data)
    
}

$('#whatsAppModal').on('show.bs.modal', async function (event) {
    getWhatsAppData()
})

$('#instaModal').on('show.bs.modal', async function (event) {
    loadInsta()
})

$('#settingModal').on('show.bs.modal', async function (event) {

    const data = JSON.parse(localStorage.getItem('proxy')).filter(item => item)

    $('.phoiItem').removeClass('active')

    if (data) {
        $('#proxyData').val(data.join("\r\n"))
        $('#proxyCount').text(data.length)
    }

    const email = JSON.parse(localStorage.getItem('email')).filter(item => item)

    if (email) {
        $('#emailData').val(email.join("\r\n"))
        $('#emailCount').text(email.length)
    }

    loadPhoi()

})

$('#copyModal').on('show.bs.modal', function (event) {
    const field = [
        {
            name: 'UID',
            value: 'uid'
        },
        {
            name: 'Password',
            value: 'password'
        },
        {
            name: '2FA',
            value: 'twofa'
        },
        {
            name: 'Cookies',
            value: 'cookies'
        },
        {
            name: 'Token',
            value: 'token'
        },
        {
            name: 'Email',
            value: 'email'
        },
        {
            name: 'Pass Email',
            value: 'passMail'
        },
        {
            name: 'Email khôi phục',
            value: 'recoverEmail'
        },
        {
            name: 'Mail cũ',
            value: 'oldEmail'
        },
        {
            name: 'Trạng thái',
            value: 'quality'
        },
        {
            name: 'Limit',
            value: 'limit'
        },
        {
            name: 'Ngưỡng',
            value: 'active'
        },
        {
            name: 'BM',
            value: 'bestBm'
        },
        {
            name: 'Page',
            value: 'page'
        },
        {
            name: 'SL BM',
            value: 'bm'
        },
        {
            name: 'Tài khoản',
            value: 'resource'
        },
        {
            name: 'Tên',
            value: 'name'
        },
        {
            name: 'Ngày sinh',
            value: 'dob'
        },
        {
            name: 'Giới tính',
            value: 'gender'
        },
        {
            name: 'Bạn bè',
            value: 'friends'
        },
        {
            name: 'Hẹn hò',
            value: 'dating'
        },
        {
            name: 'Timezone',
            value: 'timezone'
        },
        {
            name: '273',
            value: 'account273'
        },

    ]

    let options = '<option value="">-------</option>'
    
    field.forEach(item => {
        options += `<option value="${item.value}">${item.name}</option>`
    })

    $('.field-select').each(function() {

        $(this).html(options)

        const value = $(this).attr('data-default')

        if (value) {
            $(this).find('option[value="'+value+'"]').prop('selected', true)
        }

    })

    getCopyData()
    
})

$('.field-select').change(function() {

    getCopyData()

})

function copy() {
    document.getElementById('copyData').select()
    document.execCommand('copy')

    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã copy vào clipboard',
        confirmButtonColor: '#0d6efd'
    })
}

async function checkBackupEmail() {
    const email = localStorage.getItem('backupEmail') || '[]'
    const data = JSON.parse(email)

    if (data.length) {

        const loading = Swal.fire({
            title: 'Đang Check E-mail',
            html: '<span id="checkEmailProgress">Xin vui lòng đợi...</span>',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

        const result = await window.api.get('checkEmail', data.map(item => item.trim()).filter(item => item)) || []

        loading.close()

        if (result.length) {

            const final = data.filter(item => !result.includes(item))

            localStorage.setItem('backupEmail', JSON.stringify(final))

        }

    }
}

async function getLink() {
    const email = localStorage.getItem('backupEmail') || '[]'
    const data = JSON.parse(email)

    if (data.length) {

        const loading = Swal.fire({
            title: 'Đang get link backup',
            html: '<span id="getLinkProgress">Xin vui lòng đợi...</span>',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

        const result = await window.api.get('getLink', {
            email: data.map(item => item.trim()).filter(item => item),
            mode: $('[name="getLinkReadMode"]').find(':selected').val()
        }) || []

        loading.close()

        if (result.length) {

            let linkData = $('textarea[name="backupLinkAll"]').val() || ''

            const links = []

            result.forEach(item => {
                item.forEach(link => {
                    if (link) {
                        links.push(link)
                    }
                })
            })

            if (linkData) {
                linkData = linkData+"\r\n"
            }

            $('textarea[name="backupLinkAll"]').val(linkData+links.join("\r\n"))

            const linkDataTotal = $('textarea[name="backupLinkAll"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

            $('#backupLinkAllCount').text(linkDataTotal.length)

        }


    }
}

async function checkEmail() {

    saveAllSetting(false)

    const email = localStorage.getItem('email') || '[]'
    const data = JSON.parse(email)

    if (data.length) {

        const loading = Swal.fire({
            title: 'Đang Check E-mail',
            html: '<span id="checkEmailProgress">Xin vui lòng đợi...</span>',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

        const result = await window.api.get('checkEmail', data.map(item => item.trim()).filter(item => item)) || []

        loading.close()

        if (result.length) {

            const deleteMail = Swal.fire({
                icon: 'error',
                title: 'Danh Sách E-mail Die',
                width: 500,
                showCancelButton: true,
                showConfirmButton: true,
                cancelButtonText: 'Hủy',
                confirmButtonText: 'Xóa '+result.length+' email',
                confirmButtonColor: '#dc3545',
                allowOutsideClick: false,
                
                input: 'textarea',
                inputValue: result.join("\r\n"),
                inputAttributes: {
                    style: 'height: 200px',
                }
            }).then(res => {
                if (res.isConfirmed) {

                    Swal.fire({
                        title: 'Bạn có chắc muốn xóa',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Xóa',
                        cancelButtonText: 'Hủy'
                    }).then(async (res) => {
                        if (res.isConfirmed) {

                            const final = data.filter(item => {
                                return !result.includes(item)
                            })
                
                            localStorage.setItem('email', JSON.stringify(final))

                            $('#emailData').val(final.join("\r\n"))
                            $('#emailCount').text(final.length)
            
                            Swal.fire({
                                icon: 'success',
                                title: 'Thành công!',
                                confirmButtonColor: '#0d6efd'
                            })
                            
                        }
                    })

                }
            })

        } else {
            Swal.fire({
                icon: 'success',
                title: 'Không có email die!',
                confirmButtonColor: '#0d6efd'
            })
        }

    } else {
        Swal.fire({
            icon: 'error',
            title: 'Không có email!',
            confirmButtonColor: '#0d6efd'
        })
    }
}

function getCopyData() {
    const fields = []

    $('.field-select').each(function() {
        const value = $(this).find(':selected').val()

        if (value) {

            $('.field-select').find('option').show()

            setTimeout(() => {
                $('.field-select').find('option[value="'+value+'"]').hide()
            }, 100)

            fields.push(value)
        }

    })

    const format = fields.join('|')

    let data = ''

    getSelectedRows().forEach(item => {

        let final = format

        Object.keys(item).forEach(key => {
            if (key !== 'id') {
                final = final.replace(key, item[key])
            }
        })

        data += final+'\r\n'


    })

    $('#copyData').val(data)
}

$('#emailData').on('input', () => {

    const data = $('#emailData').val().split(/\r?\n|\r|\n/g).filter(item => item)
    $('#emailCount').text(data.length)

})

$('#proxyData').on('input', () => {

    const data = $('#proxyData').val().split(/\r?\n|\r|\n/g).filter(item => item)

    $('#proxyCount').text(data.length)


})

$('#logModal').on('show.bs.modal', async function (event) {
    
    const logs = await window.api.get('getLogs')

    let html = ''

    logs.forEach((log, i) => {

        html += `
            <li class="log-item pe-2">
                <input type="radio" name="logFile" style="width: 0; height: 0;" id="log${i}">
                <label for="log${i}">${log}</label>
            </li>
        `
    })

    $('#logs').html(html)
  
})



function resetColumns() {

    const tool = $('.active[data-tool]').attr('data-tool')

    accountGrid.columnApi.resetColumnState()

    localStorage.setItem('state_'+tool, JSON.stringify([]))

    $('#customizeModal').modal('hide')
}

function saveColumns() {

    const tool = $('.active[data-tool]').attr('data-tool')

    const disabledCols = ['0', 'id', 'position', 'category', 'pid', 'proxyKey', 'newEmail', 'backupEmail', 'isRunning', 'linkHacked', 'firstName', 'lastName', 'count', 'shareError', 'link273', 'type']
    
    const state = accountGrid.columnApi.getColumnState().filter(item => {
        return !disabledCols.includes(item.colId)
    })
    const disabled = accountGrid.columnApi.getColumnState().filter(item => {
        return disabledCols.includes(item.colId)
    })

    const data = []

    $('.col-item').each(function() {
        const id = $(this).find('input').val()
        const hide = !$(this).find('input').is(':checked')

        const stateData = state.filter(col => {
            return col.colId === id
        })

        stateData[0].hide = hide

        data.push(stateData[0])
    
    })

    accountGrid.columnApi.applyColumnState({ 
        state: data.concat(disabled), 
        applyOrder: true 
    })

    localStorage.setItem('state_'+tool, JSON.stringify(data.concat(disabled)))

    $('#customizeModal').modal('hide')

}

function activeTool() {

    const tool = $('.active[data-tool]').attr('data-tool')

    let savedState = localStorage.getItem('state_'+tool) || '[]'

    savedState = JSON.parse(savedState)

    accountGrid.columnApi.applyColumnState({ 
        state: savedState, 
        applyOrder: true 
    })
}

$('#toolTabs button').on('shown.bs.tab', function() {

    const tool = $('.active[data-tool]').attr('data-tool')

    localStorage.setItem('active_tool', tool)

    activeTool()

})

$('#customizeModal').on('show.bs.modal', async function (event) {

    const disabledCols = ['0', 'id', 'position', 'category', 'pid', 'proxyKey', 'newEmail', 'backupEmail', 'isRunning', 'linkHacked', 'firstName', 'lastName', 'count', 'shareError', 'link273', 'type']
    
    const state = accountGrid.columnApi.getColumnState().filter(item => {
        return !disabledCols.includes(item.colId)
    })

    let html = ''

    state.forEach(item => {

        const name = columnDefs.filter(col => {
            return col.field === item.colId
        })


        html += `
        <div class="col-item shadow-sm border rounded p-3 mb-3 d-flex">
            <div class="form-check checkbox-lg">
                <input class="form-check-input me-3" type="checkbox" value="${item.colId}" ${ !item.hide ? 'checked' : ''}>
            </div>
            <div class="flex-grow-1 d-flex justify-content-between ps-4 fw-bold">
                ${name[0].headerName}
                <i class="ri-draggable fs-5" style="cursor: move"></i>
            </div>
        </div>
        `
    })

    $('#colCustomize').html(html)

    new Sortable(document.getElementById('colCustomize'), {
        animation: 0,
        handle: '.ri-draggable',
        ghostClass: 'opacity-50'
    })
  
})

$('#searchSubmit').click(function() {
    accountGrid.api.setQuickFilter($('#search').val())
})

$('#search').change(function() {
    accountGrid.api.setQuickFilter($('#search').val())
})

$('input[name="deleteEmailMode"][value="mbasic"]').change(function() {
    const mode = $(this).is(':checked')

    if (mode) {
        $('#setPrimaryEmail').removeClass('d-none')
    } else {
        $('#setPrimaryEmail').addClass('d-none')
    }
})

function unmaximizeApp() {
    $('#app').removeClass('maximize')
    window.api.send('unmaximizeApp')
}

function maximizeApp() {
    $('#app').addClass('maximize')
    window.api.send('maximizeApp')
}

function minimizeApp() {
    window.api.send('minimizeApp')
}

async function closeApp() {

    $('#loadingScreen').removeClass('d-none')

    window.api.send('closeApp')
}

function saveAllSetting(close = true) {

    saveSetting()

    const data = $('#proxyData').val().split(/\r?\n|\r|\n/g).filter(item => item)
    const email = $('#emailData').val().split(/\r?\n|\r|\n/g).filter(item => item)
    const UA = $('#userAgentData').val()

    window.api.send('saveUserAgent', UA)
    window.api.send('saveEmail', email)

    localStorage.setItem('proxy', JSON.stringify(data))
    localStorage.setItem('email', JSON.stringify(email))

    if (close) {
        $('#settingModal').modal('hide')
    }

}



function configHotmail() {
    $('#settingModal').modal('show')
    $('#settingModal').find('.nav-link').removeClass('active')
    $('#settingModal').find('.tab-pane').removeClass('show').removeClass('active')

    $('#settingModal').find('.nav-link[data-bs-target="#hotmailSetting"]').addClass('active')
    $('#settingModal').find('#hotmailSetting').addClass('show').addClass('active')
}


function saveIBan() {

    const data = $('#iBan').val().split(/\r?\n|\r|\n/g).filter(item => item).map(item => {
        return {
            iban: item.split('|')[0],
            bic: item.split('|')[1],
        }
    })

    if (data) {
        window.api.send('saveIBan', data)
    }

}

$('#iBanModal').on('show.bs.modal', async function (event) {

    const iBan = await window.api.get('getIBan')
    const data = iBan.map(item => {
        return item.id+'|'+item.bic
    }).join("\r\n")

    $('#iBan').val(data)

})

function saveBackupEmail() {

    const data = $('#backupEmail').val().split(/\r?\n|\r|\n/g).filter(item => item)

    localStorage.setItem('backupEmail', JSON.stringify(data))

}

$('#emailModal').on('show.bs.modal', async function (event) {

    const email = JSON.parse(localStorage.getItem('backupEmail')).filter(item => item)

    if (email) {
        $('#backupEmail').val(email.join("\r\n"))
        $('#backupEmailCount').text(email.length)
    }

})

$('#backupEmail').on('input', function() {

    const data = $('#backupEmail').val().split(/\r?\n|\r|\n/g).filter(item => item)

    $('#backupEmailCount').text(data.length)
})

$('[name="backupLinkAll"]').on('input', function() {

    const data = $('[name="backupLinkAll"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

    $('#backupLinkAllCount').text(data.length)
})

$('[name="backupLinkSuccess"]').on('input', function() {

    const data = $('[name="backupLinkSuccess"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

    $('#backupLinkSuccessCount').text(data.length)
})

$('[name="backupLinkError"]').on('input', function() {

    const data = $('[name="backupLinkError"]').val().split(/\r?\n|\r|\n/g).filter(item => item)

    $('#backupLinkErrorCount').text(data.length)
})

async function clearChrome() {

    $('#loadingScreen').removeClass('d-none')

    stop()

    window.api.send('clearChrome')

}

async function stop() {

    $('#stop').prop('disabled', true)

    window.api.send('stop')

}

async function loadPhoi() {

    $('#phoiList').html('')

    const phoi = await window.api.get('getPhoi')
    const selectedPhoi = $('[name="phoiTemplate"]').val()

    let html = '<div class="row">'

    phoi.forEach((phoi, i) => {

        html += `
            <div class="col-3 mb-3">
                <div class="phoiItem d-block p-3 border rounded" data-file="${phoi.file}" onclick="selectPhoi(this)">
                    <i class="ri-checkbox-circle-fill fs-4 text-success"></i>
                    <div class="ratio ratio-4x3">
                        <img class="object-fit-contain w-100 h-100" src="${phoi.image}">
                    </div>
                    <div class="d-flex">
                        <span class="fw-medium">${phoi.name}</span>
                    </div>
                </div>
            </div>
        `
    })

    html += '</div>'
 
    $('#phoiList').html(html)

    $('.phoiItem[data-file="'+selectedPhoi+'"]').addClass('active')

    $('.phoiItem').contextmenu({
        target: '#contextMenuPhoi',
        before: function(e) {

            const file = $(e.currentTarget).attr('data-file')

            $('.phoiItem').removeClass('active')

            $(e.currentTarget).addClass('active')

            $('[name="phoiTemplate"]').val(file)

            return true
        }
    })
}



async function deletePhoi() {

    if ($('[name="phoiTemplate"]').val()) {

        Swal.fire({
            title: 'Bạn có chắc muốn xóa',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {

            if (result.isConfirmed) {

                await window.api.get('deletePhoi', $('[name="phoiTemplate"]').val())

                loadPhoi()

                $('#contextMenuPhoi').removeClass('open')

                $('[name="phoiTemplate"]').val('')

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Đã xóa phôi',
                    confirmButtonColor: '#0d6efd'
                })

            }

        })

    } else {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Bạn chưa chọn phôi để xóa',
            confirmButtonColor: '#0d6efd'
        })
    }


}

async function loadMProxy() {
    const token = $('[name="mProxyToken"]').val()

    if (token) {
        const data = await window.api.get('getMProxy', token)

        $('#proxyData').val(data.join("\r\n"))

    }
}

function viewPhoi() {
    window.api.send('viewPhoi', {file: $('[name="phoiTemplate"]').val()})
}

function openPhoi() {
    window.api.send('openPhoi')
}

function editPhoi() {

    if ($('[name="phoiTemplate"]').val()) {
        window.api.send('editPhoi', $('[name="phoiTemplate"]').val())
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Bạn chưa chọn phôi để sửa',
            confirmButtonColor: '#0d6efd'
        })
    }
}

async function selectPhoi(e) {
    
    const file = $(e).attr('data-file')

    $('.phoiItem').removeClass('active')

    $(e).addClass('active')

    $('[name="phoiTemplate"]').val(file)

}

$('#previewModal').on('show.bs.modal', async function (event) {

    previewGrid.api.setRowData([])

    const file = $('[name="logFile"]:checked + label').text()

    if (file.length) {

        const data = await window.api.get('getLogData', file)

        if (data) {
            previewGrid.api.setRowData(data)
        }

    }

})

async function loadLog() {

    Swal.fire({
        title: 'Cảnh báo',
        text: 'Dữ liệu hiện tại sẽ bị xóa',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    }).then(async result => {
        if (result.isConfirmed) {
            const file = $('[name="logFile"]:checked + label').text()

            if (file.length) {

                const data = await window.api.get('getLogData', file)

                if (data) {
                    accountGrid.api.setRowData(data)
                }

                $('#logModal').modal('hide')

            }
        }
    })

}

function loadProxy() {

    let proxy = localStorage.getItem('proxy') || '[]'
    proxy = JSON.parse(proxy)

    if (proxy.length) {

        let i = 0

        getSelectedRows().forEach(row => {
            
            accountGrid.api.getRowNode(row.id).setDataValue('proxyKey', proxy[i])

            if (i < proxy.length - 1) {
                i++
            } else {
                i = 0
            }
        })

    }

}

function loadNewEmail() {

    let email = localStorage.getItem('email') || '[]'
    email = JSON.parse(email)

    let i = 0

    if (email.length >= getSelectedRows().length) {

        getSelectedRows().forEach(row => {

            if (email[i]) {
                accountGrid.api.getRowNode(row.id).setDataValue('newEmail', email[i])
            }
            
            i++
        })

        return true

    } else {
        return false
    }

}

function loadPosition(width, height) {

    let x = 0
    let y = 0

    const items = getSelectedRows()

    for (let index = 0; index < items.length; index++) {

        accountGrid.api.getRowNode(items[index].id).setDataValue('position', x+'|'+y)

        if (x + width < window.screenWidth) {
            x += width + 10
        } else {
            x = 0
            y += height + 20
        }

        if (y + height > window.screenHeight) {
            x = 0
            y = 0
        }

        
    }

}

function delay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

async function sync() {

    let savedCategory = await window.api.get('getCategory')

    savedCategory = savedCategory.slice()
    savedCategory.unshift({
        id: 1,
        name: 'Thư mục chính',
        data: []
    })

    savedCategory = savedCategory.map(item => {
        item.data = []

        return item
    })

    accountGrid.api.forEachNode(node => {

        const categoryIndex = savedCategory.findIndex(item => item.id == node.data.category)

        if (categoryIndex !== -1) {
            savedCategory[categoryIndex].data.push(node.data)
        }

    })

    window.api.send('syncData', savedCategory)

}

async function run(mode = 'normal') {

    const tool = $('[data-tool].active').attr('data-tool')

    const setting = saveSetting()

    if (mode === 'moCheckPointInsta' && setting.general.limitBrowser.value > 20) {

        if (setting.general.phoneService.value === 'custom' || setting.general.phoneService.value === 'vip')

        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Server số đang quá tải, không được chạy quá 20 luồng',
            confirmButtonColor: '#0d6efd'
        })

        return
    }

    const checkChrome = await window.api.get('checkChrome', setting.general.chromePath.value)

    if (!checkChrome) {

        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            html: 'Đường dẫn đến <strong>chrome.exe</strong> không tồn tại',
            confirmButtonColor: '#0d6efd'
        })

        return
    }

    $('#accounts').attr('data-current', tool)
    $('#accounts').attr('data-mode', mode)

    localStorage.setItem('setting', JSON.stringify(setting))

    $('#accounts').removeClass('stopped')

    if (!$('#start').is(':disabled')) {

        const accFile = $('#accFileSo input[type="text"]').val()

        if (accFile) {

            $('#start').prop('disabled', true)

            setTimeout(() => {
                $('#start').addClass('d-none')
                $('#start').prop('disabled', false)
                $('#stop').removeClass('d-none')
            }, 3000)

            const loading = Swal.fire({
                title: 'Đang Verify Phone',
                html: '<span id="checkHackedProgress">Xin vui lòng đợi...</span>',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })

            window.api.receive('stopped', async (data) => {
                loading.close()
            })

            window.api.send('runAcc', {
                file: accFile,
                tool,
                mode,
                setting: {
                    ...setting[tool],
                    ...setting.general,
                },
                proxy: JSON.parse(localStorage.getItem('proxy') || '[]')
            })

        } else {

            $('#cpCount').text('0')

            const proxy = setting.general.proxy.value
            const limit = parseInt(setting.general.limitBrowser.value)
            const delayTime = parseInt(setting.general.delay.value) * 100

            let mailError = false
            let passwordError = false
            let chooseLineError = false
            let bmNameError = false
            let tkqcNameError = false

            if (proxy !== 'none') {
                loadProxy()
            }

            if (mode === 'normal' && tool === 'change') {

                if (setting.change.addEmail.value || setting.change.changeCookie.value) {

                    if (!loadNewEmail()) {

                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi',
                            text: 'Số lượng email không đủ',
                            confirmButtonColor: '#0d6efd'
                        })

                        mailError = true

                    }

                }

            }

            if (mode === 'normal' && tool === 'xmdt') {

                if (setting.xmdt.khangXmdt.value && setting.xmdt.khangXmdtMode.value === 'khangXmdt' && getSelectedRows().length > 0) {
                    if (!loadNewEmail()) {

                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi',
                            text: 'Số lượng email không đủ',
                            confirmButtonColor: '#0d6efd'
                        })

                        mailError = true

                    }
                }

                if (setting.xmdt.khangXmdt.value && setting.xmdt.khangXmdtMode.value === 'khangBang273' && getSelectedRows().length > 0) {

                    const data = []

                    accountGrid.api.forEachNode(node => {
                        if (node.data.category === setting.xmdt.folder273.value) {
                            data.push(node.data)
                        }
                    })

                    await checkLive(data)

                    await window.api.get('save273', data.map(item => {
                        return {
                            uid: item.uid,
                            id: item.id,
                            process: item.process,
                            token: item.token,
                            cookies: item.cookies
                        }
                    }))

                }

            }

            if (mode === 'normal' && tool === 'bm') {

                if (setting.bm.getLinkBm.value) {

                    const link = $('[name="backupLinkAll"]').val().split(/\r?\n|\r|\n/g)
                    const email = JSON.parse(localStorage.getItem('backupEmail') || '[]')

                    await window.api.send('saveBackupLink', {link, email})
                    
                }

                if (setting.bm.backupBm.value) {

                    await checkBackupEmail()

                    const email = JSON.parse(localStorage.getItem('backupEmail') || '[]')

                    if (email.length > 0) {
                        
                        getSelectedRows().forEach(row => {
                            accountGrid.api.getRowNode(row.id).setDataValue('backupEmail', email[0])
                        })

                    } else {

                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi',
                            text: 'Không có email',
                            confirmButtonColor: '#0d6efd'
                        })

                        mailError = true
                    }

                }

                if (setting.bm.createBm.value && !setting.bm.bmName.value || setting.bm.renameBm.value && !setting.bm.newNameBm.value) {

                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Bạn chưa nhập tên BM',
                        confirmButtonColor: '#0d6efd'
                    })

                    bmNameError = true

                }

                if (setting.bm.createBm.value && !setting.bm.bmNumber.value || parseInt(setting.bm.bmNumber.value) < 1) {

                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Số lượng BM phải nhiều hơn hoặc bằng 1',
                        confirmButtonColor: '#0d6efd'
                    })

                    bmNameError = true

                }

                if (setting.bm.createAdAccount.value && !setting.bm.nameTkqc.value) {

                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Bạn chưa nhập tên TKQC',
                        confirmButtonColor: '#0d6efd'
                    })

                    tkqcNameError = true
                }

            }

            if (mode === 'normal' && tool === 'page' && setting.page.sharePage.value && getSelectedRows().length > 0) {

                let data = []

                accountGrid.api.forEachNode(node => {

                    if (node.data.category === setting.page.folderVia.value) {
                        data.push(node.data)
                    }

                })

                if (data.length > 0) {
                    await checkLive(data)
                }

                $('#start').prop('disabled', true)

                await delay(5000)

                data = []

                accountGrid.api.forEachNode(node => {
                    if (node.data.category === setting.page.folderVia.value) {
                        data.push(node.data)
                    }
                })

                if (data.length > 0) {
                    await window.api.get('savePageVia', data.map(item => {
                        return {
                            uid: item.uid,
                            id: item.id,
                            count: 0,
                            running: false,
                            process: item.process,
                            token: item.token,
                            cookies: item.cookies
                        }
                    }))
                }

            }

            if (mode === 'normal' && tool === 'tut' && setting.tut.kich5m8.value && getSelectedRows().length > 0) {

                const data = []
                const bmData = []

                accountGrid.api.forEachNode(node => {

                    if (setting.tut.kich5m82.value) {
                        if (node.data.category === setting.tut.folderBm.value) {
                            accountGrid.api.getRowNode(node.data.id).setDataValue('count', 0)
                            data.push(node.data)
                            bmData.push(node.data)
                        }
                    }

                    if (setting.tut.shareTkVaoVia.value) {
                        if (node.data.category === setting.tut.folderVia.value) {
                            data.push(node.data)
                        }
                    }

                })

                if (data.length > 0) {

                    await checkLive(data)

                }

                if (data.length > 0 && setting.tut.shareTkVaoVia.value) {

                    const viaData = []

                    accountGrid.api.forEachNode(node => {

                        if (node.data.category === setting.tut.folderVia.value) {
                            viaData.push(node.data)
                        }

                    })

                    let sum = 0
                    const total = getSelectedRows().length

                    for (let index = 0; index < viaData.length; index++) {
                        const via = viaData[index]

                        if (via.process === 'UID Live') {
                            const count = setting.tut.maxVia.value - via.count
                            sum = sum + count
                        }
                        
                    }

                    if (total > sum) {

                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi',
                            text: 'Không đủ số lượng Via nhận',
                            confirmButtonColor: '#0d6efd'
                        })

                        return 
                    }

                }

                if (bmData.length > 0 && setting.tut.kich5m82.value) {
                    await cancelPending(bmData)
                }
                
                const updateBm = setInterval(async () => {

                    if (!$('#accounts').hasClass('stopped')) {

                        const finalData = []

                        accountGrid.api.forEachNode(node => {
                            if (node.data.category === setting.tut.folderBm.value) {
                                finalData.push(node.data)
                            }
                        })

                        if (setting.tut.shareTkVaoVia.value) {

                            const finalDataVia = []

                            accountGrid.api.forEachNode(node => {
                                if (node.data.category === setting.tut.folderVia.value) {
                                    finalDataVia.push(node.data)
                                }
                            })

                            await window.api.send('saveVia', finalDataVia)

                        }
            
                        await window.api.send('saveBm', finalData)

                        
                    } else {
                        clearInterval(updateBm)
                    }

                }, 500)
                

            }

            if (mode === 'adCheck') {

                await window.api.get('emptyAdFolder') 

            }

            if (mode === 'normal' && setting.change.changePassword.value || setting.change.changeHacked.value || setting.change.changeCookie.value) {

                if (!setting.change.randomPassword.value && !setting.change.newPassword.value) {

                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Mật khẩu không được để trống',
                        confirmButtonColor: '#0d6efd'
                    })

                    passwordError = true
                }

            }

            if (setting.xmdt.khang902.value) {

                if (!setting.xmdt.noiDungKhang.value) {

                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Không được để trống nội dung kháng',
                        confirmButtonColor: '#0d6efd'
                    })

                    chooseLineError = true
                }

            }

            if (!mailError && !passwordError && !chooseLineError && !bmNameError && !tkqcNameError) {

                const logTime = setting.general.logTime.value

                if (mode !== 'checkLinked') {

                    loadPosition(setting.general.browserWidth.value, setting.general.browserHeight.value)

                }

                getSelectedRows().forEach(item => {

                    accountGrid.api.getRowNode(item.id).setDataValue('status', '')

                    if (proxy === 'none') {
                        accountGrid.api.getRowNode(item.id).setDataValue('proxyKey', '')
                    }
                    
                })

                const data = getSelectedRows()

                if (data.length > 0) {

                    saveLog = setInterval(() => {
                        saveData()
                    }, logTime * 100)

                    $('#start').prop('disabled', true)

                    setTimeout(() => {
                        $('#start').addClass('d-none')
                        $('#start').prop('disabled', false)
                        $('#stop').removeClass('d-none')
                    }, 3000)

                    window.api.send('runrun', {
                        rows: data,
                        tool,
                        mode,
                        setting: {
                            ...setting[tool],
                            ...setting.general,
                        },
                        limit,
                        delayTime
                    })

                }

            }

        }

    }

    
}

function getSelectedRows() {

    const rows = []

    accountGrid.api.forEachNodeAfterFilterAndSort(node => {
        if (node.selected) {
            rows.push(node.data)
        }
    })

    return rows
}

async function checkHacked() {
    const data = getSelectedRows()

    const loading = Swal.fire({
        title: 'Đang Check Hacked',
        html: '<span id="checkHackedProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('checkHacked', data)

    loading.close()
}

async function cancelPending(data) {

    const loading = Swal.fire({
        title: 'Đang hủy lời mời',
        html: '<span id="cancelPendingProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('cancelPending', data)

    loading.close()

    return

}

async function deleteInstagram() {

    const data = getSelectedRows()

    for (let index = 0; index < data.length; index++) {
        
        accountGrid.api.getRowNode(data[index].id).setDataValue('instagram', ' ')
        
    }

    saveData()

}

async function biThuat() {

    const data = []

    instaGrid.api.forEachNodeAfterFilterAndSort(node => {
        if (node.selected) {
            data.push(node.data)
        }
    })

    const loading = Swal.fire({
        title: 'Đang sử dụng bí thuật',
        html: '<span id="checkInstagramProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('biThuat', data)

    loadInsta()

    loading.close()

    return

}

async function checkInsta() {

    const data = []

    instaGrid.api.forEachNodeAfterFilterAndSort(node => {
        if (node.selected) {
            data.push(node.data)
        }
    })

    const loading = Swal.fire({
        title: 'Đang Check Live Instagram',
        html: '<span id="checkInstagramProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('checkInstagram', data)

    loadInsta()

    loading.close()

    return

}

async function checkCookieInsta() {

    const cookie = $('[name="cookieInsta"]').val()

    const loading = Swal.fire({
        title: 'Đang Check Live UID',
        html: '<span id="checkCookieResult">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    const result = await window.api.get('checkCookieInsta', cookie)

    loading.close()

    if (result === 'LIVE') {
        Swal.fire({
            icon: "success",
            title: "Cookie hoạt động",
        })
    } else {
        Swal.fire({
            icon: "error",
            title: "Cookie không hoạt động",
        })
    }

}

async function checkSimOtp() {

    const key = $('[name="phoneServiceKey"]').val()

    const loading = Swal.fire({
        title: 'Đang Check API',
        html: '<span id="checkLiveProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('checkSimOtp', key)

    loading.close()

}

async function checkLive(data = []) {

    if (data.length === 0) {
        data = getSelectedRows()
    }

    const loading = Swal.fire({
        title: 'Đang Check Live UID',
        html: '<span id="checkLiveProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('checkLive', data)

    loading.close()

    return

}

async function checkAdsEmail() {
    
    const data = getSelectedRows().map(item => {
        return item.oldEmail+'|'+item.id
    })

    const loading = Swal.fire({
        title: 'Đang Check Ads',
        html: '<span id="checkEmailProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('checkAdsEmail', data)

    loading.close()

}

async function checkLiveEmail() {

    const data = getSelectedRows().map(item => {
        return item.oldEmail+'|'+item.id
    })

    const loading = Swal.fire({
        title: 'Đang Check E-mail',
        html: '<span id="checkEmailProgress">Xin vui lòng đợi...</span>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        },
    })

    await window.api.get('checkEmail', data)

    loading.close()

}

async function loadInsta() {

    const data = await window.api.get('getInsta')

    const liveCount = (data.filter(item => item.status === 'Live')).length
    const dieCount = (data.filter(item => item.status === 'Die')).length

    $('#instaCount').text(data.length)
    $('#instaDieCount').text(dieCount)
    $('#instaLiveCount').text(liveCount)

    instaGrid.api.setRowData(data)

}

async function pasteInsta() {

    const clipboard = await navigator.clipboard.readText() ?? ''

    if (clipboard.length > 0) {
        const data = clipboard.split(/\r?\n|\r|\n/g).map(item => {

            const parts = item.split('|')

            return {
                username: parts[0],
                password: parts[1],
                twofa: parts[2],
                email: parts[3],
                cookie: parts[4] || '',
            }

        })

        await window.api.get('saveInsta', data)

        loadInsta()
    }

}

async function pasteData() {

    const clipboard = await navigator.clipboard.readText() ?? ''

    const activeCat = $('.cat-item.active').attr('data-cat')

    if (clipboard.length > 0) {

        await window.api.send('checkKey', clipboard)

        accountGrid.api.clearRangeSelection()
        
        const data = clipboard.split(/\r?\n|\r|\n/g)

        const rows = []
        const newRows = []
        const existed = []

        let i = 0

        accountGrid.api.forEachNode(node => {
            rows.push(node.data)
            i++
        })


        for (let index = 0; index < data.length; index++) {
            
            let row = data[index]

            if (row.includes('c_user') && !row.includes('|')) {

                const parts = row.split(';').filter(item => {
                    return item.includes('c_user')
                }).map(item => {
                    return item.trim().replace('c_user=', '')
                })

                row = parts[0]+'||||'+row

            }

            if (row.includes('csrftoken') && !row.includes('|')) {

                row = '|||'+row

            }

            const cols = row.split('|')
            

            if (cols.length > 1) {

                let cookies = ''
                let email = ''
                let passMail = ''
                let recoverEmail = ''
                let category = ''
                let token = ''
                let oldEmail = ''
                let twofa = ''
                let type = ''

                let cookiesIndex = -1


                if (isNaN(cols[0]) || !cols[0]) {

                    cookiesIndex = cols.findIndex(row => {
                        return row.includes('ds_user_id=') 
                    })

                    type = 'instagram'

                } else {

                    cookiesIndex = cols.findIndex(row => {
                        return row.includes('c_user=') 
                    })
                }

                let emailIndex = -1
                let recoverEmailIndex = -1

                if (type === 'instagram') {

                    emailIndex = cols.findIndex((row) => { 
                        return row.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
                    })

                } else {

                    emailIndex = cols.findIndex((row) => { 
                        return row.match(/@outlook|@hotmail|@gmail|@yahoo/g) 
                    })

                    recoverEmailIndex = cols.findIndex((row) => { 
                        return row.match(/@getnada.com|@abyssmail.com|@dropjar.com|@getairmail.com|@givmail.com|@inboxbear.com|@robot-mail.com|@tafmail.com|@vomoto.com|fviainboxes.com|fviadropinbox.com|fviamail.work|dropinboxes.com/g) 
                    })

                }

                const twofaIndex = cols.findIndex((row) => { 
                    return row.replace(/\s/g, '').length === 32 && !row.includes('@')
                })

                if (twofaIndex !== -1) {

                    twofa = cols[twofaIndex]

                }

                const tokenIndex = cols.findIndex((row) => { 
                    return row.startsWith('EAA')
                })
                                
                if (cookiesIndex !== -1) {
                    cookies = cols[cookiesIndex]
                }

                if (emailIndex !== -1) {
                    passMail = cols[emailIndex+1]
                    email = cols[emailIndex]
                }

                if (recoverEmailIndex !== -1) {
                    recoverEmail = cols[recoverEmailIndex]
                }

                if (tokenIndex !== -1) {
                    token = cols[tokenIndex]
                }

                if (email && passMail) {
                    oldEmail = email+'|'+passMail
                }

                if (activeCat != 0) {
                    category = activeCat
                }

                const data = {
                    id: i,
                    account: row,
                    uid: cols[0],
                    password: cols[1],
                    twofa,
                    type,
                    count: 0,
                    shareError: 0,
                    isRunning: 0,
                    oldEmail,
                    category,
                    token,
                    cookies,
                    email,
                    passMail,
                    recoverEmail
                }

                const existedRow = rows.filter(item => {
                    return item.uid === cols[0]
                })

                if (existedRow[0]) {
                    existed.push(data)
                } else {
                    newRows.push(data)
                }
    
            }

            i++
            
        }

        if (existed.length) {

            Swal.fire({
                width: 700,
                icon: 'warning',
                input: 'textarea',
                title: 'Cảnh báo',
                text: 'Những dữ liệu sau đã tồn tại, bạn có chắc vẫn muốn thêm vào?',
                inputValue: existed.map(item => {return item.account}).join("\r\n"),
                showCancelButton: true,
                allowOutsideClick: false,
                confirmButtonText: 'Vẫn thêm',
                cancelButtonText: 'Bỏ qua',
                inputAttributes: {
                    'rows': 10,
                    'style': 'height: inherit!important'
                },
            }).then(result => {

                if (result.isConfirmed) {

                    const final = newRows.length ? newRows.concat(existed) : existed

                    accountGrid.api.setRowData(rows.concat(final))

                } else {
                    if (newRows.length) {
                        accountGrid.api.setRowData(rows.concat(newRows))
                    }
                }

                saveData()
            })

        } else {

            if (newRows.length) {
                accountGrid.api.setRowData(rows.concat(newRows))
            }

            saveData()

        }

        if (activeCat != 0) {

            accountGrid.api.setFilterModel({
                category: {
                    type: 'equals',
                    filter: activeCat
                }
            })

        }

    }
}

async function exportData() {

    const rows = getSelectedRows()

    if (rows.length > 0) {

        const columns = columnDefs.filter(item => item.field).map(item => {
            if (item.headerName) {
                return {
                    key: item.field,
                    header: item.headerName
                }
            } else {
                return {
                    key: item.field,
                    header: item.field
                }
            }
        })

        await window.api.send('exportData', {rows, columns})

    }
}


function deleteSelect() {


    Swal.fire({
        title: 'Bạn có chắc muốn xóa',
        text: 'Hành động này không thể hoàn tác',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {

            const selectedRows = getSelectedRows()
            accountGrid.api.applyTransaction({ remove: selectedRows })

            saveData()

        }

    })
}

function selectRange() {

    const range = accountGrid.api.getCellRanges()

    let start, end 

    if (range[0].startRow.rowIndex < range[0].endRow.rowIndex) {
        start = range[0].startRow.rowIndex
        end = range[0].endRow.rowIndex
    } else {
        end = range[0].startRow.rowIndex
        start = range[0].endRow.rowIndex
    }

    const selected = []

    accountGrid.api.deselectAll()

    accountGrid.api.forEachNode(function (node) {
        
        if (node.rowIndex >= start && node.rowIndex <= end) {
            node.setSelected(true)
        }

    })

}

function updatePassword(account, newPassword) {
    
    const data = account.split('|')

    data[1] = newPassword

    return data.join('|')

}


function updateRecoveryEmail(account, newEmail) {

    const data = account.split('|')

    const emailIndex = data.findIndex((row) => { 
        return row.match(/@outlook|@hotmail|@gmail|@yahoo/g) 
    })

    const recoverEmailIndex = data.findIndex((row) => { 
        return row.match(/@getnada.com|@abyssmail.com|@dropjar.com|@getairmail.com|@givmail.com|@inboxbear.com|@robot-mail.com|@tafmail.com|@vomoto.com/g) 
    })

    if (recoverEmailIndex !== -1) {

        data[recoverEmailIndex] = newEmail

    } else if (emailIndex !== -1) {

        data.splice(emailIndex + 2, 0, newEmail)
    
    }
    
    return data.join('|')

}

function updatePassMailInsta(account, newPass) {

    const data = account.split('|')

    const emailIndex = data.findIndex((row) => { 
        return row.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
    })
    

    if (emailIndex !== -1) {
        data[emailIndex+1] = newPass
    }

    return data.join('|')

}

function updateEmailInsta(account, newEmail) {

    const data = account.split('|')

    const emailIndex = data.findIndex((row) => { 
        return row.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
    })
    
    const cookiesIndex = data.findIndex(row => { 
        return row.includes('ds_user_id=') 
    })

    if (emailIndex !== -1) {
        data[emailIndex] = newEmail
    } else {
        if (cookiesIndex !== -1) {
            data.splice(cookiesIndex + 1, 0, newEmail)
        }
    }

    return data.join('|')

}

function updateEmail(account, newEmail, newEmailPassword) {
    
    const data = account.split('|')

    const emailIndex = data.findIndex((row) => { 
        return row.match(/@outlook|@hotmail|@gmail|@yahoo/g) 
    })

    const tokenIndex = data.findIndex((row) => { 
        return row.startsWith('EAA')
    })

    const cookiesIndex = data.findIndex(row => { 
        return row.includes('c_user=') 
    })

    if (emailIndex === -1) {

        if (tokenIndex !== -1 && cookiesIndex === -1) {
            data[tokenIndex+1] = newEmail
            data[tokenIndex+2] = newEmailPassword
        }
        
        if (tokenIndex === -1 && cookiesIndex !== -1) {
            data[cookiesIndex+1] = newEmail
            data[cookiesIndex+2] = newEmailPassword
        }
        
        if (tokenIndex !== -1 && cookiesIndex !== -1) {
            data[cookiesIndex+1] = newEmail
            data[cookiesIndex+2] = newEmailPassword
        }
        
        if (tokenIndex === -1 && cookiesIndex === -1) {
            data.splice(3, 0, newEmail)
            data.splice(4, 0, newEmailPassword)
        }

    } else {

        data[emailIndex] = newEmail
        data[emailIndex+1] = newEmailPassword

    }

    return data.join('|')

}

function update2Fa(account, twofa) {

    const data = account.split('|')

    data[2] = twofa

    return data.join('|')

}

function updateCookieInsta(account, cookies) {

    const data = account.split('|')

    const cookiesIndex = data.findIndex(row => { 
        return row.includes('ds_user_id=') 
    })

    const twofaIndex = data.findIndex((row) => { 
        return row.replace(/\s/g, '').length === 32
    })

    if (cookiesIndex !== -1) {
        data[cookiesIndex] = cookies
    } else if (twofaIndex !== -1) {
        data.splice(twofaIndex + 1, 0, cookies)
    } else {
        data.splice(3, 0, cookies)
    }

    return data.join('|')

}

function updateCookie(account, cookies) {

    const data = account.split('|')

    const cookiesIndex = data.findIndex(row => { 
        return row.includes('c_user=') 
    })

    const twofaIndex = data.findIndex((row) => { 
        return row.replace(/\s/g, '').length === 32
    })

    if (cookiesIndex !== -1) {
        data[cookiesIndex] = cookies
    } else {
        data.splice(twofaIndex + 1, 0, cookies)
    }

    return data.join('|')

}

function updateToken(account, token) {

    const data = account.split('|')

    const twofaIndex = data.findIndex((row) => { 
        return row.replace(/\s/g, '').length === 32
    })

    const tokenIndex = data.findIndex((row) => { 
        return row.startsWith('EAA')
    })

    if (tokenIndex !== -1) {
        data[tokenIndex] = token
    } else {
        data.splice(twofaIndex + 2, 0, token)
    }

    return data.join('|')

}

async function loadPhone() {
    const data = await window.api.get('getPhoneData')

    let html = ''

    for (let index = 0; index < data.length; index++) {
        html += '<option '+(data[index].selected ? 'selected' : '')+' value="'+data[index].id+'">'+data[index].name+'</option>'
    }

    $('select[name="customPhone"]').html(html)


}

$('.addPhoneForm').on('submit', async function(e) {

    e.preventDefault()

    const data = {
        name: $('.addPhoneForm .serviceName').val(),
        apiGetPhone: $('.addPhoneForm .apiGetPhone').val(),
        phoneValue: $('.addPhoneForm .phoneValue').val(),
        phonePrefix: $('.addPhoneForm .phonePrefix').val(),
        phoneDelay: $('.addPhoneForm .phoneDelay').val(),
        idValue: $('.addPhoneForm .idValue').val(),
        apiGetCode: $('.addPhoneForm .apiGetCode').val(),
        codeValue: $('.addPhoneForm .codeValue').val()
    }

    $('.addPhoneForm .serviceName').val(''),
    $('.addPhoneForm .apiGetPhone').val(''),
    $('.addPhoneForm .phoneValue').val(''),
    $('.addPhoneForm .phonePrefix').val(''),
    $('.addPhoneForm .phoneDelay').val(''),
    $('.addPhoneForm .idValue').val(''),
    $('.addPhoneForm .apiGetCode').val(''),
    $('.addPhoneForm .codeValue').val('')

    await window.api.get('savePhone', data)

    loadPhone()

    $('#addPhoneModal').modal('hide')

})

$('.editPhoneForm').on('submit', async function(e) {

    e.preventDefault()

    const id = $('.editPhoneForm .phoneId').val()

    const data = {
        name: $('.editPhoneForm .serviceName').val(),
        apiGetPhone: $('.editPhoneForm .apiGetPhone').val(),
        phoneValue: $('.editPhoneForm .phoneValue').val(),
        phonePrefix: $('.editPhoneForm .phonePrefix').val(),
        phoneDelay: $('.editPhoneForm .phoneDelay').val(),
        idValue: $('.editPhoneForm .idValue').val(),
        apiGetCode: $('.editPhoneForm .apiGetCode').val(),
        codeValue: $('.editPhoneForm .codeValue').val()
    }


    $('.editPhoneForm .serviceName').val(''),
    $('.editPhoneForm .apiGetPhone').val(''),
    $('.editPhoneForm .phoneValue').val(''),
    $('.editPhoneForm .phonePrefix').val(''),
    $('.editPhoneForm .phoneDelay').val(''),
    $('.editPhoneForm .idValue').val(''),
    $('.editPhoneForm .apiGetCode').val(''),
    $('.editPhoneForm .codeValue').val('')

    console.log(data)

    await window.api.get('updatePhone', {id, data})

    loadPhone()

    $('#editPhoneModal').modal('hide')

})

async function getNumber() {

    $('button[onclick="getNumber()"]').prop('disabled', true)

    const data = await window.api.get('testGetNumber')

    if (data) {
        $('#testNumber').val(data.number)
        $('#testId').val(data.id)
    } else {
        alert('Không thể lấy số')
    }

    $('button[onclick="getNumber()"]').prop('disabled', false)

}

async function getCode() {

    $('button[onclick="getCode()"]').prop('disabled', true)

    const id =  $('#testId').val()

    const data = await window.api.get('testGetCode', id)

    if (data) {

        alert('Code: '+data)
        
    } else {
        alert('Không lấy được code')
    }

    $('button[onclick="getCode()"]').prop('disabled', false)

}

function testPhone() {

    saveSetting()

    $('#testNumber').val('')
    $('#testId').val('')

    $('#testPhoneModal').modal('show')

}

function addPhone() {

    $('#addPhoneModal').modal('show')

}

async function editPhone() {
    
    const selected = $('select[name="customPhone"]').find(':selected').val()

    if (selected) {

        const data = await window.api.get('getPhone', selected)

        $('.phoneId').val(selected)

        $('.editPhoneForm .serviceName').val(data.name),
        $('.editPhoneForm .apiGetPhone').val(data.apiGetPhone),
        $('.editPhoneForm .phoneValue').val(data.phoneValue),
        $('.editPhoneForm .phonePrefix').val(data.phonePrefix),
        $('.editPhoneForm .phoneDelay').val(data.phoneDelay),
        $('.editPhoneForm .idValue').val(data.idValue),
        $('.editPhoneForm .apiGetCode').val(data.apiGetCode),
        $('.editPhoneForm .codeValue').val(data.codeValue)

        $('#editPhoneModal').modal('show')

    }

}

function deletePhone() {
    
    const selected = $('select[name="customPhone"]').find(':selected').val()

    if (selected) {
        Swal.fire({
            title: 'Bạn có chắc muốn xóa',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then(async (res) => {
            if (res.isConfirmed) {

                await window.api.get('deletePhone', selected)

                loadPhone()

            }
        })
    }

}

// setInterval(() => {

//     if (!scrolling) {
//         const running = []

//         accountGrid.api.forEachNodeAfterFilterAndSort(node => {
//             if (node.data.status === 'RUNNING') {
//                 running.push(node.data.id)
//             }
//         })

//         if (running[0]) {
//             accountGrid.api.ensureIndexVisible(running[0], 'top')
//         }

//     }
// }, 2000)

// $('body').on('mousedown', function () {
//     scrolling = true
// })


// $('body').on('mouseup', function () {
//     scrolling = false
// })

document.onkeyup = function(e) {
    if (e.ctrlKey && e.shiftKey && e.which == 85) {
        $('#accFileSo').removeClass('d-none')
    }
}