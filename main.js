// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, globalShortcut, shell } = require('electron')
const path = require('path')

//Update the app automatically
require('update-electron-app')({
  repo: 'DM164/Unoffical-YouTube-Music-App',
  updateInterval: '1 hour',
  notifyUser: true
})

//Discord rich presence client
const client = require('discord-rich-presence')('611219815138590731');

//Discord rich presence icons
const largeImg = 'rpc_icon'
const largeImageText = 'YouTube Music App by DM (iGoof#0982 on Discord)'

//Discord rich presence active setting switch
let discordRichPresence = null;

ipcMain.on('send-DRPstatus', function(event, arg){
  discordRichPresence = arg.lel
  if (discordRichPresence == "true"){
    idleDRP()
  }
})

//Electron Client Version
const ClientVersion = '0.6.0'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createSplash() {
  let splash = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    icon: __dirname + '/assets/icons/png/icon.png',
    backgroundColor: '#1f1f1f',
    frame: false,
    show: false,
    'minHeight': 625,
    'minWidth': 950,
  })
  splash.loadFile('index.html')
  createWindow()
  setTimeout(() => {
    splash.show()
  }, 1000);
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show()
      splash.close();
      splash = null;
    }, 2000);
  })
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    icon: __dirname + '/assets/icons/png/icon.png',
    backgroundColor: '#1f1f1f',
    frame: false,
    'minHeight': 625,
    'minWidth': 950,
    show: false
  })

  //Shortcuts
  globalShortcut.register('MediaNextTrack', function () {
    mainWindow.webContents.send('next-track-request')
  });
  globalShortcut.register('mediaplaypause', function () {
    mainWindow.webContents.send('play-pause-request')
  });
  globalShortcut.register('mediaprevioustrack', function () {
    mainWindow.webContents.send('previous-track-request')
  });
  globalShortcut.register('mediastop', function () {
    createNotification()
    console.log('mediastop pressed');
  });

  //Overlay commands
  ipcMain.on('overlay-play-pause', function(){
    mainWindow.webContents.send('play-pause-request')
  })
  
mainWindow.webContents.executeJavaScript(`

const topBarJS = document.createElement('script');
topBarJS.setAttribute('src', 'https://dl.dropbox.com/s/6jf7mb1921ae8nc/topBar.js?dl=0')
topBarJS.setAttribute('defer', '')
document.querySelector('body').prepend(topBarJS);

const stylesheet = document.createElement('link');
stylesheet.setAttribute("rel", "stylesheet");
stylesheet.setAttribute("href", "https://dl.dropbox.com/s/k2ta8h2yuj0uh20/style.css?dl=0");

const javascript = document.createElement('script');
javascript.setAttribute('src', 'https://dl.dropbox.com/s/4bc4z4siyheclsr/customscript.js?dl=0')
javascript.setAttribute('defer', '')
document.querySelector('body').prepend(javascript);

document.querySelector('head').appendChild(stylesheet);
`)

//Overlay
let overlayOpen = false
globalShortcut.register('Alt + 1', function () {
  if(overlayOpen == false){
    createOverlay();
    overlayOpen = true;
  } else {
    overlay.close();
    overlay = null;
    overlayOpen = false;
  }
});

//Opens the Github page to download the latest version of the client
ipcMain.on('openReleases', function(){
    shell.openItem('https://github.com/DM164/Unoffical-YouTube-Music-App/releases');
});


let songTitle = 'Title'
let songArtist = 'Artist'

//DISCORD RICH PRESENCE (new)
  mainWindow.webContents.on('media-started-playing', function(){
  
    if (discordRichPresence == "true"){
    mainWindow.webContents.send('request-song-data', 'data reached customscript.js')
    ipcMain.on('requested-data', function(event, arg){
  
      console.log(`Data arrived: Title: ${arg.title}, Artist: ${arg.artist}` )
  
      client.updatePresence({
        details: arg.title, //Song title
        state: arg.artist, //Artist
        startTimestamp: Date.now(),
        endTimestamp: Date.now() + 240000,
        largeImageKey: largeImg,
        largeImageText: largeImageText,
        smallImageKey: 'play',
        smallImageText: 'Playing a song',
        instance: true,
      });
  
      //store artist and title in case the user pauses the song
      songTitle = arg.title
      songArtist = arg.artist
    });
    }
  })
  mainWindow.webContents.on('media-paused', function(){
    if(discordRichPresence == "true"){
      console.log('media was paused right now')
      client.updatePresence({
        details: songTitle, //Song title
        state: songArtist, //Artist
        largeImageKey: largeImg,
        largeImageText: largeImageText,
        smallImageKey: 'pause',
        smallImageText: 'Paused',
        instance: true,
      });
    }
  })


ipcMain.on('closeApp:close', function(){
  app.close();
});

  // App Splashscreen
  mainWindow.loadURL('https://music.youtube.com/');

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    overlay = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () =>{
  createSplash()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

//DISCORD RICH PRESENCE at startup
function idleDRP(){
    client.updatePresence({
      details: 'Not listening to anything',
      largeImageKey: largeImg,
      largeImageText: largeImageText,
      smallImageKey: 'menus',
      smallImageText: 'In the menus',
      instance: true,
    });
}

//Overlay window
function createOverlay () {
  // Create the browser window.
  overlay = new BrowserWindow({
    width: 100,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    show: false,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    fullscreen: true,
    resizable: false
  })

  overlay.loadFile('overlay.html')
  overlay.show();

  // Emitted when the window is closed.
  overlay.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    overlay = null
  })
}

//Notifications
function createNotification() {
  // Create the browser window.
  notification = new BrowserWindow({
    width: 100,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    show: false,
    transparent: true,
    frame: false,
    skipTaskbar: true
  })

  notification.loadFile('notification.html')
  notification.maximize();
  notification.setIgnoreMouseEvents(true);
  notification.show();

  setTimeout(() => {
    notification.close();
  }, 5000);

  // Emitted when the window is closed.
  notification.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    notification = null
  })
}

ipcMain.on('versionCheck', function(){
  mainWindow.webContents.send('versionCheckAnswer', ClientVersion)
})