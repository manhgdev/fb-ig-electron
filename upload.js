const SftpUpload = require('sftp-upload')

const options = {
    host:'103.90.224.225',
    username:'root',
    password: '4k9Ym61ZIhiAWx796YVn0mVK',
    excludedFolders: ['./releases/win-unpacked'],
    path: './releases',
    remoteDir: '/www/wwwroot/toolfb.vn/public/update',
    dryRun: false,
}

const sftp = new SftpUpload(options)

sftp.on('error', function(err) {
    console.log(err)
})
.on('uploading', function(progress) {
    console.log('Uploading', progress.file)
})
.on('completed', function() {
    console.log('Upload Completed')
})
.upload()