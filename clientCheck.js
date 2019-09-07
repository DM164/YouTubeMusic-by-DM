//Checks if the client is up to date or not
checkClientVersion()
function checkClientVersion(){
    ipcRenderer.send('versionCheck')
    ipcRenderer.on('versionCheckAnswer', function(event, arg){
        if (arg >= '0.4.0'){
            console.log('Client up to date')
        } else {
            console.log('Your client is outdated')
        }
    })
}