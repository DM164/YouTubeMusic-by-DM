const { remote } = require('electron');
const { ipcRenderer } = require('electron')

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
        rawTimestamp = rawTimestamp.substr(7);
        console.log(`Raw timestamp: ${rawTimestamp}`);

        //TODO finish timestamp
        let minutesAlt = 0
        let secondsAlt = 0

        let timestamp = minutesAlt + secondsAlt

        let titleVar = document.getElementsByClassName('title style-scope ytmusic-player-bar')[0].innerText
        
        let artistVar = document.getElementsByClassName('byline style-scope ytmusic-player-bar')[0].innerHTML

        if (artistVar.length < 85){
            artistVar = artistVar.substr(57)
            artistVar = artistVar.substring(0, artistVar.length - 7);
        } else {
            artistVar = 'Audio only'
        }

        let data = {
            artist: artistVar,
            title: titleVar,
            endtimestamp: timestamp
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