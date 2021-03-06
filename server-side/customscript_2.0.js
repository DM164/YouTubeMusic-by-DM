const { ipcRenderer } = require('electron')

let firstStart = localStorage.getItem('firstStart') || 'true'

//Version of the latest client
let latestClient = localStorage.getItem('latestRelease')

//Discord Rich Presence LocalStorage
if (firstStart == 'true') {
    localStorage.setItem('DRP', 'true');
    localStorage.setItem('firstStart', 'false');
} else {
    console.log('already started this app once')
}
setTimeout(() => {
    sendDRPstatus()
}, 3000);
function sendDRPstatus() {
    let something = {
        lel: localStorage.getItem('DRP')
    }
    ipcRenderer.send('send-DRPstatus', something)
}

//app settings
const settingsTrigger = document.querySelector('.style-scope ytmusic-settings-button')
let opened = false

settingsTrigger.addEventListener('click', function () {

    if (opened == false) {
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
        
        // open settings window
        document.getElementById('AS1').addEventListener('click', function () {
            ipcRenderer.send('open:settings')
        })

        opened = true
    } else {
        return console.log('opened is true')
    }
});

ipcRenderer.on('request-song-data', function () {
    sendData()
});
setInterval(() => {
    sendData()
}, 10000);

function sendData() {
    let rawTimestamp = document.querySelector(".time-info.ytmusic-player-bar").innerText;
    endTimestamp = rawTimestamp.substr(7);

    let titleVar = document.getElementsByClassName('title style-scope ytmusic-player-bar')[0].innerText
    let artistVar = document.getElementsByClassName('byline style-scope ytmusic-player-bar')[0].innerHTML
    let volumeVar = document.getElementById('expand-volume-slider').value
    let thumbVar = document.getElementsByClassName('image style-scope ytmusic-player-bar')[0].src

    if (artistVar.length < 85 && artistVar > 7) {
        artistVar = artistVar.substr(57)
        artistVar = artistVar.substring(0, artistVar.length - 7);
    } else {
        let artistVarAudioOnly = document.getElementsByClassName("middle-controls")[0].outerText
        if (artistVarAudioOnly.length > 85) {
            artistVarAudioOnly = artistVarAudioOnly.slice(0, 84) + '...'
        }
        artistVar = artistVarAudioOnly.slice(titleVar.length, artistVarAudioOnly.length)
    }

    let data = {
        artist: artistVar,
        title: titleVar,
        volume: volumeVar,
        endTimestamp: endTimestamp,
        thumb: thumbVar
    }
    ipcRenderer.send('requested-data', data);
};

//Media control
ipcRenderer.on('next-track-request', function () {
    document.getElementsByClassName('next-button style-scope ytmusic-player-bar')[0].click();
})
ipcRenderer.on('play-pause-request', function () {
    document.querySelector('#play-pause-button').click();
})
ipcRenderer.on('previous-track-request', function () {
    document.getElementsByClassName('previous-button style-scope ytmusic-player-bar')[0].click();
})

let current = document.getElementById('expand-volume-slider').value

ipcRenderer.on('volume-up', function () {
    current = current + 5
    if (current > 100) {
        current = 100
    }
    document.getElementById('expand-volume-slider').value = current
})
ipcRenderer.on('volume-down', function () {
    current = current - 5
    if (current < 0) {
        current = 0
    }
    document.getElementById('expand-volume-slider').value = current
})

ipcRenderer.on('request-volume-data', function () {
    current = document.getElementById('expand-volume-slider').value
    ipcRenderer.send('requested-volume-data', current)
})
ipcRenderer.on('request-time-data', function () {
    let rawTimestamp2 = document.querySelector(".time-info.ytmusic-player-bar").innerText;
    let timestamp = ''
    if (rawTimestamp2.length > 13) {
        timestamp = rawTimestamp2.slice(0, -9)
    } else {
        timestamp = rawTimestamp2.slice(0, -7);
    }
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

document.getElementById('notification').addEventListener('click', function () {
    openBrowser()
})
function openBrowser() {
    ipcRenderer.send('openReleases')
}

//Checks if the client is up to date or not
checkClientVersion()
function checkClientVersion() {
    ipcRenderer.send('versionCheck')
    ipcRenderer.on('versionCheckAnswer', function (event, arg) {
        if (arg == latestClient) {
            console.log('Client up to date')
        } else {
            setTimeout(() => {
                document.getElementById('notification').style.display = 'block'
            }, 4000);
            console.log('Your client is outdated')
        }
    })
}