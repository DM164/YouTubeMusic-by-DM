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

ipcRenderer.on('request-song-data', function(){
    setTimeout(() => {

        let titleVar = document.getElementsByClassName('title style-scope ytmusic-player-bar')[0].innerHTML
        
        let artistVar = document.getElementsByClassName('byline style-scope ytmusic-player-bar')[0].innerHTML
        let data = {
            artist: artistVar,
            title: titleVar
        }
        ipcRenderer.send('requested-data', data);
    }, 1000);
});