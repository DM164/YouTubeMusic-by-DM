const { ipcRenderer } = require('electron')

let firstStart = localStorage.getItem('firstStart') || 'true'

//Version of the latest client
const latestClient = '0.7.1'

//Discord Rich Presence LocalStorage
if (firstStart == 'true'){
    localStorage.setItem('DRP', 'true');
    localStorage.setItem('firstStart', 'false');
} else {
    console.log('already started this app once')
}
setTimeout(() => {
    sendDRPstatus()
}, 3000);
function sendDRPstatus(){
    let something = {
        lel: localStorage.getItem('DRP')
    }
    ipcRenderer.send('send-DRPstatus', something)
}

//app settings
const settingsTrigger = document.querySelector('.style-scope ytmusic-settings-button')
let opened = false

settingsTrigger.addEventListener('click', function(){

    if (opened == false){
        const settingsDiv = document.createElement('div');
        settingsDiv.setAttribute('class', 'appSettings');
        settingsDiv.setAttribute('id', 'AS1');
        
        const settingsTitle = document.createElement('h3');
        settingsTitle.innerText = 'App settings'
        settingsDiv.appendChild(settingsTitle);

        const settingsImg = document.createElement('img');
        settingsImg.src = 'https://www.dropbox.com/s/vg552ia5mhdoyme/electron%20logo.png?raw=1'
        settingsImg.setAttribute('class', 'settingsImg')
        settingsDiv.appendChild(settingsImg);
        
        document.getElementsByClassName('menu-container style-scope ytd-multi-page-menu-renderer')[0].appendChild(settingsDiv)
       
        //Setttings Window
        const appSettingsWindow = document.createElement('div');
        appSettingsWindow.setAttribute('class', 'appSettingsWindow');
        appSettingsWindow.style.display = 'none'
        document.querySelector('body').prepend(appSettingsWindow);

        //settings elements
        const AppSettignsTitle = document.createElement('h1');
        AppSettignsTitle.setAttribute('class', 'AppSettingsTitle');
        AppSettignsTitle.innerText = 'App Settings'
        document.querySelector('.appSettingsWindow').appendChild(AppSettignsTitle);
    
        const line1 = document.createElement('div');
        line1.setAttribute('class', 'line1');
        document.querySelector('.appSettingsWindow').appendChild(line1);

        //DRP settings
        const DRPcontainer = document.createElement('div');
        DRPcontainer.setAttribute('class', 'DRPContainer');

        const DRPTitle = document.createElement('h2');
        DRPTitle.setAttribute('class', 'DPRTitle');
        DRPTitle.innerText= 'Discord Rich Presence'

        const DPRDescription = document.createElement('p');
        DPRDescription.setAttribute('class', 'DRPDesc')
        DPRDescription.innerText= 'Decide whether or not to show what you are listening to on Discord. (Requires a restart)'

        //DRP Switch (ON / OFF)
        const DRPSwitch = document.createElement('div');
        DRPSwitch.setAttribute('class', 'DRPSwitch');

        const DRPindicator = document.createElement('div');
        DRPindicator.setAttribute('class', 'DRPindicator');
        
        DRPcontainer.append(DRPTitle);
        DRPcontainer.append(DPRDescription);
        DRPcontainer.append(DRPSwitch);
        DRPSwitch.append(DRPindicator);
        document.querySelector('.appSettingsWindow').append(DRPcontainer);

        //Background dimming
        const backgroundDimm = document.createElement('div');
        backgroundDimm.setAttribute('class', 'dimm');
        backgroundDimm.setAttribute('id', 'dimmB');
        backgroundDimm.style.display = 'none'
        document.querySelector('body').prepend(backgroundDimm);

        //Settings javascript file
        const settingsJs = document.createElement('script');
        settingsJs.setAttribute('src', 'https://dl.dropbox.com/s/5utxjsqw486h4vp/settings.js?dl=0')
        document.querySelector('body').appendChild(settingsJs);

        opened = true
    } else {
        return console.log('opened is true')
    }
});

// Get timestamp from HTML document
// document.querySelector(".time-info.ytmusic-player-bar").innerText

ipcRenderer.on('request-song-data', function(){
    setTimeout(() => {

        let rawTimestamp = document.querySelector(".time-info.ytmusic-player-bar").innerText;
        endTimestamp = rawTimestamp.substr(7);

        let titleVar = document.getElementsByClassName('title style-scope ytmusic-player-bar')[0].innerText
        let artistVar = document.getElementsByClassName('byline style-scope ytmusic-player-bar')[0].innerHTML
        let volumeVar = document.getElementById('expand-volume-slider').value
        let thumbVar = document.getElementsByClassName('image style-scope ytmusic-player-bar')[0].src

        if (artistVar.length < 85){
            artistVar = artistVar.substr(57)
            artistVar = artistVar.substring(0, artistVar.length - 7);
        } else {
            artistVar = 'Audio only'
        }

        let data = {
            artist: artistVar,
            title: titleVar,
            volume: volumeVar,
            endTimestamp: endTimestamp,
            thumb: thumbVar
        }
        ipcRenderer.send('requested-data', data);
    }, 1000);
});

//Media control
ipcRenderer.on('next-track-request', function(){
    document.getElementsByClassName('next-button style-scope ytmusic-player-bar')[0].click();
})
ipcRenderer.on('play-pause-request', function(){
    document.querySelector('#play-pause-button').click();
})
ipcRenderer.on('previous-track-request', function(){
    document.getElementsByClassName('previous-button style-scope ytmusic-player-bar')[0].click();
})

let current = document.getElementById('expand-volume-slider').value

ipcRenderer.on('volume-up', function(){
    current = current + 5
    if (current > 100){
        current = 100
    }
    document.getElementById('expand-volume-slider').value=current
})
ipcRenderer.on('volume-down', function(){
    current = current - 5
    if (current < 0){
        current = 0
    }
    document.getElementById('expand-volume-slider').value=current
})

ipcRenderer.on('request-volume-data', function(){
    current = document.getElementById('expand-volume-slider').value
    ipcRenderer.send('requested-volume-data', current)
})
ipcRenderer.on('request-time-data', function(){
    let rawTimestamp2 = document.querySelector(".time-info.ytmusic-player-bar").innerText;
    let timestamp = rawTimestamp2.slice(0, -7);
    ipcRenderer.send('requested-time-data', timestamp)
})

//Client Version popup
const versionNotification = document.createElement('div');
versionNotification.setAttribute('id', 'notification');
const notificationText = document.createElement('p');
notificationText.setAttribute('class', 'notification-text');
notificationText.innerText = 'Your Client is outdated.';
const notificationImg = document.createElement('img');
notificationImg.setAttribute('class', 'notification-img')
notificationImg.setAttribute('src', 'https://www.dropbox.com/s/umitkbwt3p885jj/update.png?raw=1');

versionNotification.append(notificationText);
versionNotification.append(notificationImg);
document.querySelector('body').prepend(versionNotification);

document.getElementById('notification').addEventListener('click', function(){
    openBrowser()
})
function openBrowser(){
    ipcRenderer.send('openReleases')
}

//Checks if the client is up to date or not
checkClientVersion()
function checkClientVersion(){
    ipcRenderer.send('versionCheck')
    ipcRenderer.on('versionCheckAnswer', function(event, arg){
        if (arg >= latestClient){
            console.log('Client up to date')//TODO: create a popup window and save how many times it poped up
        } else {
            setTimeout(() => {
                document.getElementById('notification').style.display='block'
            }, 4000);
            console.log('Your client is outdated')
        }
    })
}