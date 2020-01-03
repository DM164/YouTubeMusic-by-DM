const { ipcRenderer, remote } = require('electron')

if (localStorage.getItem('first-time') === undefined){
    localStorage.setItem('theme', 'dark')
} else {
    localStorage.setItem('first-time', false)
}

let volumeCache = '100%'
let time = '0:00'
let thumb = 'assets/overlay/artwork.png'
let theme = localStorage.getItem('theme')

//Checks what theme to use
if (theme === 'light'){
    document.querySelector('#theme').href='light-overlay.css'
} else {
    document.querySelector('#theme').href='dark-overlay.css'
}

document.querySelector('.play').addEventListener('click', function(){
    ipcRenderer.send('overlay-play-pause')
});
document.querySelector('.pause').addEventListener('click', function(){
    ipcRenderer.send('overlay-play-pause')
});
document.querySelector('.next').addEventListener('click', function(){
    ipcRenderer.send('overlay-next')
});
document.querySelector('.previous').addEventListener('click', function(){
    ipcRenderer.send('overlay-previous')
});

document.querySelector('.up').addEventListener('click', function(){
    ipcRenderer.send('overlay-volume-up')
})
document.querySelector('.down').addEventListener('click', function(){
    ipcRenderer.send('overlay-volume-down')
})

document.querySelector('#open-app').addEventListener('click', function(){
    ipcRenderer.send('open-mainWindow');
})
document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
    if (e.target.className === 'close-overlay'){
        ipcRenderer.send('overlay-close')
    }
})

//Button to change the theme
document.querySelector('#switch').addEventListener('click', function(){
    if (theme === 'dark'){
        document.querySelector('#theme').href='light-overlay.css'
        localStorage.setItem('theme', 'light')
        theme = 'light'
    } else {
        document.querySelector('#theme').href='dark-overlay.css'
        localStorage.setItem('theme', 'dark')
        theme = 'dark'
    }
})

//Button to open next playing view
document.querySelector('#more').addEventListener('click', function(){
    document.getElementsByClassName('overlay-next-playing')[0].style.display='block'
})

setInterval(() => {
    ipcRenderer.send('request-volume-data')
    ipcRenderer.send('request-time-data')
    ipcRenderer.send('request-overlay-data')
}, 100);

ipcRenderer.on('requested-time-data', function(event, arg){
    if (arg == undefined){
        time = '0:00'
    } else {
        time = arg
        localStorage.setItem('time', time)
    }
    document.querySelector('#timestamp').innerText=localStorage.getItem('time')
})

ipcRenderer.on('requested-volume-data', function(event, arg){
    if (arg == undefined){
        volumeCache = 0 + '%'
    } else {
        volumeCache = arg +'%'
        localStorage.setItem('volumeCache', volumeCache)
    }
    document.querySelector('.value').innerText=localStorage.getItem('volumeCache')
})

ipcRenderer.on('requested-overlay-data', function(event, arg){
    if (arg[4] === undefined || arg[4] === null || arg[4] === 'https://music.youtube.com/'){
        //nothing
    } else {
        thumb = arg[4]
    }
})
ipcRenderer.on('requested-overlay-data', function(event, arg){
    if (arg[6] === false || arg[6] === null || arg[6] === undefined){
        document.querySelector('.DRPStatus-text').innerText='Discord is disconnected'
        document.querySelector('.circle').style.background='#d23636'
    } else {
        document.querySelector('.DRPStatus-text').innerText='Discord is connected'
        document.querySelector('.circle').style.background='#45d471'
    }
})
ipcRenderer.on('requested-overlay-data', function(event, arg){
    if (arg[0] == 'Title' && arg[1] == 'Artist'){
        //do nothing
    } else {
        document.querySelector('.title').innerText=arg[0]
        document.querySelector('.artist').innerText=arg[1]
        document.querySelector('#end-timestamp').innerText=arg[3]
        document.querySelector('#albumImg').src=thumb
        if (arg[5] === 'paused'){
            document.querySelector('.pause').style.display='none'
            document.querySelector('.play').style.display='inline-block'
        } else {
            document.querySelector('.play').style.display='none'
            document.querySelector('.pause').style.display='inline-block'
        }
    }
})