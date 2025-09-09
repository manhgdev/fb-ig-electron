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
        field: 'status',
        headerName: 'Trạng thái',
        filter: 'agSetColumnFilter',
        cellRenderer: (params) => {

            let text = ''

            if (params.data.status == 101) {
                text = '<span class="d-flex align-items-center"><span style="width: 7px; height: 7px" class="d-flex bg-secondary rounded-circle me-2"></span><strong class="text-info">Đóng</strong></span>'
            }

            if (params.data.status == 999) {
                text = '<span class="d-flex align-items-center"><span style="width: 7px; height: 7px" class="d-flex bg-info rounded-circle me-2"></span><strong class="text-secondary">Hold</strong></span>'
            }

            if (params.data.status == 1 || params.data.status == 100) {
                text = '<span class="d-flex align-items-center"><span style="width: 7px; height: 7px" class="d-flex bg-success rounded-circle me-2"></span><strong class="text-success">Hoạt động</strong></span>'
            }

            if (params.data.status == 2) {
                text = '<span class="d-flex align-items-center"><span style="width: 7px; height: 7px" class="d-flex bg-danger rounded-circle me-2"></span><strong class="text-danger">Vô hiệu hóa</strong></span>'
            }

            if (params.data.status == 3) {
                text = '<span class="d-flex align-items-center"><span style="width: 7px; height: 7px" class="d-flex bg-warning rounded-circle me-2"></span><strong class="text-warning">Cần thanh toán</strong></span>'
            }

            return text
        }
    },
    { 
        field: 'account',
        headerName: 'Tài khoản',
        minWidth: 250,
        cellRenderer: (params) => {

            return `
                <span class="d-flex flex-column" style="line-height: initial">
                    <strong style="font-size: 14px; margin-bottom: 3px">${params.data.account}</strong>
                    <span>${params.data.adId}</span>
                </span>
            `
        }
    },
    { 
        field: 'id',
        hide: true,
    },
    { 
        field: 'adId',
        headerName: 'ID TKQC',
    },
    { 
        field: 'uid',
        headerName: 'UID',
        filter: 'agTextColumnFilter'
    },
    { 
        field: 'process',
        headerName: 'Process',
    },
    { 
        field: 'message',
        headerName: 'Message',
    },
    { 
        field: 'balance',
        headerName: 'Số dư',
    },
    { 
        field: 'threshold',
        headerName: 'Ngưỡng',
    },
    { 
        field: 'remain',
        headerName: 'Ngưỡng còn lại',
    },
    { 
        field: 'limit',
        headerName: 'Limit',
    },
    { 
        field: 'spend',
        headerName: 'Tổng tiêu',
    },
    { 
        field: 'currency',
        headerName: 'Tiền tệ',
    },
    { 
        field: 'adminNumber',
        headerName: 'SL Admin',
    },
    { 
        field: 'role',
        headerName: 'Quyền sở hữu',
    },
    { 
        field: 'payment',
        headerName: 'Thanh toán',
        minWidth: 200,
        cellRenderer: (params) => {

            let data = ''

            if (params.data.payment) {

                const payments = JSON.parse(params.data.payment)

                if (payments.length > 0) {

                    const cards = payments.map(item => {

                        if (item.credential.__typename === 'AdsToken') {
                            item.img = '../public/img/credit.svg'
    
                            item.credential.last_four_digits = 1007
    
                        }

                        if (item.credential.__typename === 'PaymentPaypalBillingAgreement') {
                            item.img = '../public/img/paypal.svg'

                            item.credential.last_four_digits = 'PayPal'

                        }
    
                        if (item.credential.__typename === 'DirectDebit') {
                            item.img = '../public/img/direct.svg'
    
                        }
    
                        if (item.credential.card_association === 'AMERICANEXPRESS') {
                            item.img = '../public/img/amex.svg'
                        }
    
                        if (item.credential.card_association === 'VISA') {
                            item.img = '../public/img/visa.svg'
                        }
    
                        if (item.credential.card_association === 'MASTERCARD') {
                            item.img = '../public/img/mastercard.svg'
                        }

                        return item

                    })
 
                    let primary = (cards.filter(item => item.is_primary))[0]

                    if (!primary) {

                        primary = cards[0]

                    }

                    data = '<div class="accountPayments" style="line-height: initial;">'

                    let status = ''

                    if (primary.usability === 'USABLE') {
                        status = '<span class="badge rounded-pill text-bg-success">Hoạt động</span>'
                    }

                    if (primary.usability === 'PENDING_VERIFICATION' || primary.usability === 'UNVERIFIED_OR_PENDING_AUTH') {
                        status = '<span class="badge rounded-pill text-bg-warning">Xác minh</span>'
                    }

                    if (primary.usability === 'ADS_PAYMENTS_RESTRICTED' || primary.usability === 'UNVERIFIABLE') {
                        status = '<span class="badge rounded-pill text-bg-danger">Hạn chế</span>'
                    }

                    data += `
                        <div class="d-flex align-items-center">
                            <img src="${primary.img}" class="me-2"><strong>${primary.credential.last_four_digits}</strong><span class="mx-1">&#8226;</span><span>${status}</span>
                        </div>

                    `

                    if (cards.length > 1) {
                        data += `
                            <strong class="more text-primary d-block" style="margin-top: 2px">${cards.length - 1} thẻ khác...</strong>
                            <div class="subMenu d-none">
                        `

                        cards.forEach(item => {

                            let exp = ''
                            let status = ''

                            if (!item.credential.email) {
                                exp = `<small>Ngày hết hạn: ${item.credential.expiry_month}/${item.credential.expiry_year}</small>`
                            } else {
                                exp = `<small>${item.credential.email}</small>`
                            }

                            if (item.usability === 'USABLE') {
                                status = '<span class="badge rounded-pill text-bg-success">Hoạt động</span>'
                            }
        
                            if (item.usability === 'PENDING_VERIFICATION' || item.usability === 'UNVERIFIED_OR_PENDING_AUTH') {
                                status = '<span class="badge rounded-pill text-bg-warning">Xác minh</span>'
                            }
        
                            if (item.usability === 'ADS_PAYMENTS_RESTRICTED' || item.usability === 'UNVERIFIABLE') {
                                status = '<span class="badge rounded-pill text-bg-danger">Hạn chế</span>'
                            }
    
                            if (item.credential.__typename === 'AdsToken') { 
                                exp = ''
                            }

                            data += `
                                <div class="cardItem d-flex align-items-center">
                                    <img src="${item.img}" height="20" class="me-3"> 
                                    <div>
                                        <span class="d-block"><strong>${item.credential.last_four_digits}</strong> &#8226; ${status}</span>
                                        ${exp}
                                    </div>
                                </div>
                            `

                        })

                        data += '</div>'
                        
                    }

                    data += '</div>'

                }

            }

            return data

        }
    },
    { 
        field: 'nextBillDate',
        headerName: 'Ngày lập hóa đơn',
    },
    { 
        field: 'nextBillDay',
        headerName: 'Số ngày đến hạn TT',
    },
    { 
        field: 'country',
        headerName: 'Quốc gia',
    },
    { 
        field: 'reason',
        headerName: 'Lý do khóa',
    },
    { 
        field: 'createdTime',
        headerName: 'Ngày tạo',
    },
    { 
        field: 'type',
        headerName: 'Loại',
    },
    { 
        field: 'bm',
        headerName: 'BM',
    },
    { 
        field: 'timezone',
        headerName: 'Múi giờ',
    },
    { 
        field: 'card',
        hide: true
    },
]

const cardColumns = [
    {
        resizable: false,
        headerCheckboxSelection: true,
        headerCheckboxSelectionCurrentPageOnly: true,
        checkboxSelection: true,
        showDisabledCheckboxes: true,
        maxWidth: 40,
        suppressMovable: true
    },
    { 
        field: 'id',
        headerName: '#',
        width: 40,
        minWidth: 40,
        suppressMovable: true
    },
    { 
        field: 'cardName',
        headerName: 'Tên trên thẻ',
    },
    { 
        field: 'cardNumber',
        headerName: 'Số thẻ',
    },
    { 
        field: 'expDate',
        headerName: 'Ngày hết hạn',
    },
    { 
        field: 'expMonth',
        hide: true,
    },
    { 
        field: 'expYear',
        hide: true,
    },
    { 
        field: 'cardCsv',
        headerName: 'CCV',
    },
    { 
        field: 'count',
        headerName: 'Lượt dùng',
    },
]

const accountGrid = {
    rowHeight: 50,
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
    },
    columnDefs: columnDefs,
    rowData: [],
    localeText: {
        noRowsToShow: lang.noRowsToShow,
    },
    getRowId: function(params) {
        return params.data.id
    },
    onFirstDataRendered: function(e) {
        
        countStatus(e, 0)

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

const cardGrid = {
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
    columnDefs: cardColumns,
    rowData: [],
    localeText: {
        noRowsToShow: lang.noRowsToShow,
    },
}

$(document).ready(async function() {

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

    $('select[name="timezone"]').html(timezone2Options)
    $('select[name="currency"]').html(currencyOptions)
    $('select[name="country"]').html(countryOptions)

    $('select[name="country"], select[name="timezone"], select[name="currency"]').select2()

    const templateResult = (state) => {

        let count = ''

        if (state.count) {
            count = `<span class="badge rounded-pill text-bg-success">${state.count}</span>`
        }

        return $(`
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong class="d-block">${state.text}</strong>
                    <span>${state.status ?? ''}</span>
                </div>
                ${count}
            </div>
        `)
    }

    $('#accountSelect').select2({
        templateResult
    })

    const gridDiv = document.querySelector('#accounts')
    const cardGridDiv = document.querySelector('#cards')

    new agGrid.Grid(gridDiv, accountGrid)
    new agGrid.Grid(cardGridDiv, cardGrid)

    const adData = await window.api.get('getAdData')
    
    accountGrid.api.setRowData(adData.adAccounts)

    accountGrid.columnApi.autoSizeAllColumns()

    $(document).on('mouseover', 'div[col-id="payment"], div[col-id="hiddenAdmins"]', function() {


        if ($(this).find('.more').length > 0 && $('.moreCard').length === 0) {
            const position = $(this).find('.more').offset()
            const offset = parseInt($(this).find('.more').attr('offset')) || 2
            const html = $(this).find('.subMenu').html()

            $('body').append(`
                <div class="moreCard shadow rounded p-3" style="top: ${position.top+offset}px; left: ${position.left - 10}px">${html}</div>
            `)
        }

    })

    $(document).on('mouseleave', 'div[col-id="payment"], div[col-id="hiddenAdmins"]', function() {
        $('.moreCard').remove()
    })

    $('#accountSelect').select2({
        data: adData.mainAccounts.map(item => {
            item.text = item.id 

            return item
        }),
        templateResult
    })

    setTimeout(async () => {

        let savedState = localStorage.getItem('state_tkqc') || '[]'

        savedState = JSON.parse(savedState)

        accountGrid.columnApi.applyColumnState({ 
            state: savedState, 
            applyOrder: true 
        })

        setInterval(() => {

            const state = accountGrid.columnApi.getColumnState()
            localStorage.setItem('state_tkqc', JSON.stringify(state))
        
        }, 5000)

    }, 2000)


})

$('#campSelect').change(function() {
    $('input[name="fileCamp"]').val($(this)[0].files[0].path)
})

$('#searchSubmit').click(function() {
    accountGrid.api.setQuickFilter($('#search').val())
})

$('#search').change(function() {
    accountGrid.api.setQuickFilter($('#search').val())
})

$('#customizeModal').on('show.bs.modal', async function (event) {

    const disabledCols = ['0', 'id', 'card']
    
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

$('#cards').contextmenu({
    target: '#contextMenuCard',
})

$('#cardModal').on('show.bs.modal', function (event) {

    loadCard()

})

function countStatus(e, category) {

    let status1count = 0
    let status2count = 0
    let status3count = 0
    let status101count = 0
    let status999count = 0

    e.api.forEachNode(node => {

        if (category > 0) {
            if (node.data.status == 1 && node.data.uid == category) {
                status1count++
            }

            if (node.data.status == 2 && node.data.uid == category) {
                status2count++
            }

            if (node.data.status == 3 && node.data.uid == category) {
                status3count++
            }

            if (node.data.status == 101 && node.data.uid == category) {
                status101count++
            }

            if (node.data.status == 999 && node.data.uid == category) {
                status999count++
            }
        } else {
            if (node.data.status == 1) {
                status1count++
            }

            if (node.data.status == 2) {
                status2count++
            }

            if (node.data.status == 3) {
                status3count++
            }

            if (node.data.status == 101) {
                status101count++
            }

            if (node.data.status == 999) {
                status999count++
            }
        }
    
    })
    

    $('.status1Count').text(status1count)
    $('.status2Count').text(status2count)
    $('.status3Count').text(status3count)
    $('.status101Count').text(status101count)
    $('.status999Count').text(status999count)

}

$('#accountSelect').on('select2:select', function (e) {

    const id = parseInt(e.params.data.id)

    if (id > 0) { 

        accountGrid.api.getFilterInstance('uid').setModel({
            type: 'equals',
            filter: id
        })

    } else {
        accountGrid.api.getFilterInstance('uid').setModel(null)
    }

    countStatus(accountGrid, id)

    accountGrid.api.onFilterChanged()

    accountGrid.api.deselectAll()
    accountGrid.api.clearRangeSelection()

    const search = accountGrid.api.getQuickFilter()

    localStorage.setItem('active_category', id)

    accountGrid.api.setQuickFilter('')
    accountGrid.api.setQuickFilter(search)
   
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

$('.dropdown-menu').click(function(e){
    e.stopPropagation()
})

$('.statusFilter').change(function() {

    const status = []

    $('.statusFilter').each(function() {

        if ($(this).is(':checked')) {
            status.push($(this).val())
        }

    })

    if (status.length > 0) {

        accountGrid.api.getFilterInstance('status').setModel({ values: status })

    } else {
        accountGrid.api.getFilterInstance('status').setModel(null)
    }

    accountGrid.api.onFilterChanged()

})

function unmaximizeApp() {
    $('#app').removeClass('maximize')
    window.api.send('unmaximizeApp')
    accountGrid.columnApi.autoSizeAllColumns()
}

function maximizeApp() {
    $('#app').addClass('maximize')
    window.api.send('maximizeApp')
    accountGrid.columnApi.autoSizeAllColumns()
}

function minimizeApp() {
    window.api.send('minimizeApp')
}

async function closeApp() {
    window.api.send('closeApp')
}

function resetColumns() {

    accountGrid.columnApi.resetColumnState()

    localStorage.setItem('state_tkqc', JSON.stringify([]))

    $('#customizeModal').modal('hide')
}

function saveColumns() {

    const disabledCols = ['0', 'id', 'card']
    
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

    localStorage.setItem('state_tkqc', JSON.stringify(data.concat(disabled)))

    $('#customizeModal').modal('hide')

}

async function loadCard() {
    const card = await window.api.get('getCard')

    $('#cardCount').text(card.length)

    cardGrid.api.setRowData(card)
}

async function deleteCard() {
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

            const selectedRows = []

            cardGrid.api.forEachNodeAfterFilterAndSort(node => {
                if (node.selected) {
                    selectedRows.push(node.data)
                }
            })

            cardGrid.api.applyTransaction({ remove: selectedRows })

            window.api.send('deleteCard', selectedRows)

            const data = cardGrid.api.getRenderedNodes()

            $('#cardCount').text(data.length)

        }

    })
}

async function saveCard() {

    const data = cardGrid.api.getRenderedNodes().map(item => {

        item.data.running = false
        item.data.time = ''

        return item.data
    })

    $('#cardCount').text(data.length)

    window.api.send('saveCard', data)

}

async function pasteCard() {

    const clipboard = await navigator.clipboard.readText() ?? ''

    if (clipboard.length > 0) {

        accountGrid.api.clearRangeSelection()
        
        const data = clipboard.split(/\r?\n|\r|\n/g)

        const rows = []

        let i = 0

        cardGrid.api.forEachNode(node => {
            rows.push(node.data)
            i++
        })


        for (let index = 0; index < data.length; index++) {
            
            let row = data[index]

            const cols = row.split('|')

            if (cols.length > 2) {

                rows.push({
                    id: i,
                    cardName: cols[0],
                    cardNumber: cols[1],
                    expMonth: cols[2].split('/')[0],
                    expYear: cols[2].split('/')[1],
                    expDate: cols[2],
                    cardCsv: cols[3],
                    count: 0
                })

            }

            i++
            
        }

        if (rows.length) {
            cardGrid.api.setRowData(rows)
        }

    }

    saveCard()

}

async function run(mode = 'normal') {

    const data = getSelectedRows()

    if (data.length > 0) {

        const setting = saveSetting()

        $('#start').prop('disabled', true)

        setTimeout(() => {
            $('#start').addClass('d-none')
            $('#start').prop('disabled', false)
            $('#stop').removeClass('d-none')
        }, 3000)

        accountGrid.api.forEachNode(item => {
            accountGrid.api.getRowNode(parseInt(item.data.id)).setDataValue('process', '')
        })

        if (setting.ad.addCard.value) {
            await window.api.get('refreshCard')
        }

        await window.api.get('runAd', {data, setting, mode})

        $('#stop').addClass('d-none')
        $('#start').prop('disabled', false)
        $('#stop').prop('disabled', false)
        $('#start').removeClass('d-none')

    }

}

async function stop() {

    $('#stop').prop('disabled', true)
    await window.api.send('stopAd')

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

function saveSetting() {

    const setting = {
        ad: {}
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

    return setting

}

window.api.receive('maximized', () => {

    $('#maximize').addClass('d-none')
    $('#unmaximize').removeClass('d-none')
})

window.api.receive('unmaximized', () => {

    $('#unmaximize').addClass('d-none')
    $('#maximize').removeClass('d-none')
})

window.api.receive('updateStatus', (data) => {

    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('process', data.status)

})

window.api.receive('message', (data) => {

    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('message', data.message)

})

window.api.receive('updateData', (data) => {

    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('account', data.account)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('balance', data.balance)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('bm', data.bm)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('country', data.country)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('createdTime', data.createdTime)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('currency', data.currency)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('limit', data.limit)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('nextBillDate', data.nextBillDate)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('nextBillDay', data.nextBillDay)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('payment', data.payment)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('reason', data.reason)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('role', data.role)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('spend', data.spend)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('status', data.status)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('threshold', data.threshold)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('timezone', data.timezone)
    accountGrid.api.getRowNode(parseInt(data.id)).setDataValue('type', data.type)

})

window.api.receive('error', (message) => {

    Swal.fire({
        title: 'Lỗi',
        html: message,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK',
    })

})