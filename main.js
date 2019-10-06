// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, globalShortcut, shell, dialog, Tray, Menu } = require('electron')
const path = require('path')

// Disable error dialogs
dialog.showErrorBox = function(title, content) {
    console.log(`${title}\n${content}`);
};

//Update the app automatically NOT WORKING ATM
require('update-electron-app')({
  repo: 'DM164/Unoffical-YouTube-Music-App',
  updateInterval: '1 hour',
  notifyUser: true
})

//Discord rich presence client
let client = require('discord-rich-presence')('611219815138590731');

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
const ClientVersion = '0.7.1'

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
    }, 4000);
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
  globalShortcut.register('Ctrl+Up', function () {
    mainWindow.webContents.send('volume-up')
  });
  globalShortcut.register('Ctrl+Down', function () {
    mainWindow.webContents.send('volume-down')
  });

 // Make a toggle for this (change to app shortcut, not global)
  // globalShortcut.register('Ctrl+R', function () {
  //   console.log('no reload')
  // });
  // globalShortcut.register('Ctrl+Shift+I', function () {
  //   console.log('no dev tools')
  // });

  //Overlay commands
  ipcMain.on('overlay-play-pause', function(){
    mainWindow.webContents.send('play-pause-request')
  })
  ipcMain.on('overlay-next', function(){
    mainWindow.webContents.send('next-track-request')
  })
  ipcMain.on('overlay-previous', function(){
    mainWindow.webContents.send('previous-track-request')
  })

  ipcMain.on('overlay-volume-up', function(){
    mainWindow.webContents.send('volume-up')
  })
  ipcMain.on('overlay-volume-down', function(){
    mainWindow.webContents.send('volume-down')
  })

mainWindow.webContents.executeJavaScript(`

const topBarJS = document.createElement('script');
topBarJS.setAttribute('src', 'https://dl.dropbox.com/s/6jf7mb1921ae8nc/topBar.js?dl=0')
topBarJS.setAttribute('defer', '')
document.querySelector('body').prepend(topBarJS);

const javascript = document.createElement('script');
javascript.setAttribute('src', 'https://dl.dropbox.com/s/4bc4z4siyheclsr/customscript.js?dl=0')
javascript.setAttribute('defer', '')
document.querySelector('body').prepend(javascript);

const stylesheet = document.createElement('link');
stylesheet.setAttribute("rel", "stylesheet");
stylesheet.setAttribute("href", "https://dl.dropbox.com/s/k2ta8h2yuj0uh20/style.css?dl=0");


document.querySelector('head').appendChild(stylesheet);
`)

//Overlay
let overlayOpen = false
globalShortcut.register('Alt + 1', function () {
  overlayToggle();
});

function overlayToggle() {
  if(overlayOpen == false){
    createOverlay();
    overlayOpen = true;
  } else {
    overlay.close();
    overlay = null;
    overlayOpen = false;
  }
}

//Opens the Github page to download the latest version of the client
ipcMain.on('openReleases', function(){
    shell.openExternal('https://github.com/DM164/Unoffical-YouTube-Music-App/releases');
});


let songTitle = 'Title'
let songArtist = 'Artist'
let playerVolume = '0'
let endTimestamp = '0:00'
let mediaStatus =  'paused'

//DISCORD RICH PRESENCE (new)
  mainWindow.webContents.on('media-started-playing', function(){
    mediaStatus = 'playing'

    mainWindow.webContents.send('request-song-data')
    ipcMain.on('requested-data', function(event, arg){
      console.log(`Data arrived: Title: ${arg.title}, Artist: ${arg.artist}, Volume: ${arg.volume}, End Timestamp: ${arg.endTimestamp}` )
      
      if (discordRichPresence == "true"){
      client.updatePresence({
        details: arg.title, //Song title
        state: arg.artist, //Artist
        // startTimestamp: Date.now(),
        // endTimestamp: Date.now() + 240000,
        largeImageKey: largeImg,
        largeImageText: largeImageText,
        smallImageKey: 'play',
        smallImageText: 'Playing a song',
        instance: true,
      });
      }

      //store artist and title in case the user pauses the song or opens the overlay
      songTitle = arg.title
      songArtist = arg.artist
      playerVolume = arg.volume
      endTimestamp = arg.endTimestamp
      thumb = arg.thumb
      });


    mainWindow.webContents.on('media-paused', function(){
      mediaStatus = 'paused'

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

    //Overlay data request
    ipcMain.on('request-overlay-data', function(){
      mainWindow.webContents.send('request-song-data')
        let data = [
          title = songTitle,
          artist = songArtist,
          volume = playerVolume,
          endTimestamp = endTimestamp,
          thumb = thumb,
          mediaStatus = mediaStatus
        ]
        overlay.webContents.send('requested-overlay-data', data)
    })

    //Volume request
    ipcMain.on('request-volume-data', function(){
      mainWindow.send('request-volume-data')
    })
    ipcMain.on('requested-volume-data', function(event, arg){
      overlay.send('requested-volume-data', arg)
    })
    //Timestamp request
    ipcMain.on('request-time-data', function(){
      mainWindow.send('request-time-data')
    })
    ipcMain.on('requested-time-data', function(event, arg){
      overlay.send('requested-time-data', arg)
    })

  })


ipcMain.on('open-mainWindow', function(){
  mainWindow.show();
  overlay.close()
  overlayOpen = false;
});

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
let tray = null
const titleIcon = path.join(__dirname + '/assets/tray/tray-title-icon.png')
const openAppIcon = path.join(__dirname + '/assets/tray/open.png')
const KillDRP = path.join(__dirname + '/assets/tray/killDRP.png')
const openOverlayIcon = path.join(__dirname + '/assets/tray/overlay.png')
const quitAppIcon = path.join(__dirname + '/assets/tray/close.png')

app.on('ready', () =>{
  createSplash()

  tray = new Tray(path.join(__dirname + '/assets/tray/tray-light.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'YouTube Music by DM', type: 'normal', icon: titleIcon, enabled: false},
    { label: 'separator', type: 'separator'},
    { label: 'Open App', type:'normal', icon: openAppIcon, click: function trayfunction1() { mainWindow.show() }},
    { label: 'Disconnect DiscordRP', icon: KillDRP, click: function trayfunction2() { client.disconnect() }},
    { label: 'Reconnect DiscordRP', icon: KillDRP, click: function trayfunction4() { createNewPresence() }},
    { label: 'Open Overlay', accelerator: 'Alt + 1', icon: openOverlayIcon, click: function trayfunction3() { createNotification() }},
    { label: 'Quit App', accelerator: 'Ctrl + Q', icon: quitAppIcon, click: function(){ app.quit() }}
  ])
  tray.setToolTip('YouTube Music by DM')
  tray.setContextMenu(contextMenu)

  //Build menu from template
  const topMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Insert menu
  Menu.setApplicationMenu(topMenu)
})

function createNewPresence() {
  client = require('discord-rich-presence')('611219815138590731');
  client.updatePresence({
    details: 'Not listening to anything',
    largeImageKey: largeImg,
    largeImageText: largeImageText,
    smallImageKey: 'menus',
    smallImageText: 'In the menus',
    instance: true,
  })
}

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

  overlay.loadFile('overlay.html');
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
    skipTaskbar: true,
    resizable: false
  })

  notification.loadFile('notification.html')
  notification.maximize();
  notification.show();
  notification.setIgnoreMouseEvents(true);

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
function createYTWindow() {
  // Create the browser window.
  YTWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
  })

  YTWindow.loadURL('https://www.youtube.com/')

  YTWindow.on('closed', function () {
    YTWindow = null
  })
}

ipcMain.on('versionCheck', function(){
  mainWindow.webContents.send('versionCheckAnswer', ClientVersion)
})

// New top menu template (edit, view, ect.) (we used it for shortcuts), only for pruduction
const mainMenuTemplate = [
  {
      label:'App',
      submenu:[
          {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', //shortcut to quit, checks if the app is running on win32 or on darwin(MacOS)
            click(){
                app.quit();
            }
          },
          {
            label: 'Open YouTube',
            accelerator: 'Alt + 3',
            click(){
                createYTWindow();
            }
          }
      ]
  }
]