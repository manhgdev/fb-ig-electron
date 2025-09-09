const instaColumns = [
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
    },
    { 
        field: 'username',
        headerName: 'Username',
    },
    { 
        field: 'password',
        headerName: 'Password',
    },
    { 
        field: 'email',
        headerName: 'Email',
    },
    { 
        field: 'cookie',
        headerName: 'Cookie',
    },
    { 
        field: 'process',
        headerName: 'Process',
    },
    { 
        field: 'message',
        headerName: 'Message',
        width: 150,
        minWidth: 150
    },
    { 
        field: 'status',
        headerName: 'Status',
    },
]

const instaGrid = {
    rowSelection: 'multiple',
    suppressContextMenu: true,
    suppressMovableColumns: true,
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
    columnDefs: instaColumns,
    rowData: [],
    localeText: {
        noRowsToShow: lang.noRowsToShow,
    },
    getRowId: function(params) {
        return params.data.id
    },
    // onFirstDataRendered: function(e) {
        
       

    // },
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
}

$(document).ready(async function() {

    loadSetting('instaSettings')

    const gridDiv = document.querySelector('#accounts')

    new agGrid.Grid(gridDiv, instaGrid)    

    setTimeout(async () => {

        let savedState = localStorage.getItem('state_insta') || '[]'

        savedState = JSON.parse(savedState)

        instaGrid.columnApi.applyColumnState({ 
            state: savedState, 
            applyOrder: true 
        })

        setInterval(() => {

            const state = instaGrid.columnApi.getColumnState()
            localStorage.setItem('state_insta', JSON.stringify(state))

            if ($('body').hasClass('setting-loaded')) {
                saveSetting('instaSettings')
            }
        
        }, 5000)

    })

})

$('#searchSubmit').click(function() {
    instaGrid.api.setQuickFilter($('#search').val())
})

$('#search').change(function() {
    instaGrid.api.setQuickFilter($('#search').val())
})

$('#customizeModal').on('show.bs.modal', async function (event) {

    const disabledCols = ['0', 'id']
    
    const state = instaGrid.columnApi.getColumnState().filter(item => {
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
    window.api.send('closeApp')
}

async function run() {

    if (!$('#start').is(':disabled') && $('body').hasClass('setting-loaded')) {

        instaGrid.api.setRowData([])

        $('#start').prop('disabled', true)

        saveSetting('instaSettings')

        setTimeout(() => {
            $('#start').addClass('d-none')
            $('#start').prop('disabled', false)
            $('#stop').removeClass('d-none')
        }, 3000)

        instaGrid.api.forEachNode(item => {
            instaGrid.api.getRowNode(parseInt(item.data.id)).setDataValue('process', '')
        })

        const proxy = JSON.parse(localStorage.getItem('proxy')).filter(item => item)

        await window.api.get('runInsta', {proxy})

        $('#stop').addClass('d-none')
        $('#start').prop('disabled', false)
        $('#stop').prop('disabled', false)
        $('#start').removeClass('d-none')

    }

}

async function stop() {

    $('#stop').prop('disabled', true)
    await window.api.send('stopInsta')

}

function getSelectedRows() {

    const rows = []

    instaGrid.api.forEachNodeAfterFilterAndSort(node => {
        if (node.selected) {
            rows.push(node.data)
        }
    })

    return rows
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

    console.log(data)

    instaGrid.api.getRowNode(parseInt(data.id)).setDataValue('process', data.status)

})

window.api.receive('message', (data) => {

    instaGrid.api.getRowNode(parseInt(data.id)).setDataValue('message', data.message)

})

window.api.receive('updateData', (data) => {

    if (data.email) { instaGrid.api.getRowNode(parseInt(data.id)).setDataValue('email', data.email) }
    if (data.username) { instaGrid.api.getRowNode(parseInt(data.id)).setDataValue('username', data.username) }
    if (data.cookie) { instaGrid.api.getRowNode(parseInt(data.id)).setDataValue('cookie', data.cookie) }

})

window.api.receive('insertAccount', (item) => {

    instaGrid.api.applyTransaction({
        add: [item],
    })

})

window.api.receive('updateErrorCount', (count) => {

    $('#instaError').text(count)
})

window.api.receive('updateSuccessCount', (count) => {

    $('#instaSuccess').text(count)
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
