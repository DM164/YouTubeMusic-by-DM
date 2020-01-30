// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, globalShortcut, shell, dialog, Tray, Menu } = require('electron')
const path = require('path')

// Disable error dialogs
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};

//Client Version (PACKAGE.JSON HAS TO BE CHANGED MANUALLY)
const ClientVersion = '3.0.0'

//Production
process.env.NODE_ENV = 'production'

//Update the app automatically
const { autoUpdater } = require("electron-updater")
autoUpdater.checkForUpdatesAndNotify()
if (autoUpdater.isUpdateAvailable) {
  autoUpdater.quitAndInstall()
}

//Discord rich presence client
let client = require('discord-rich-presence')('611219815138590731');
let clientIsConnected = true;

//Discord rich presence icons
const largeImg = 'rpc_icon'
const largeImageText = `YouTube Music App by DM (v${ClientVersion})`

//Discord rich presence active setting switch
let discordRichPresence = null;

ipcMain.on('send-DRPstatus', function (event, arg) {
  discordRichPresence = arg.lel
  if (discordRichPresence == "true") {
    idleDRP()
  } else {
    client.disconnect()
    clientIsConnected = false;
  }
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createSplash() {
  let splash = new BrowserWindow({
    width: 500,
    height: 180,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    icon: __dirname + '/assets/icons/png/icon.png',
    backgroundColor: '#000000',
    frame: false,
    show: false,
    resizable: false
  })
  splash.loadFile('index.html')
  createWindow()

  splash.once('ready-to-show', () => {
    splash.show()
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.executeJavaScript(`
      
    const topBarJS = document.createElement('script');
    topBarJS.setAttribute('src', 'https://dl.dropbox.com/s/dhoar8i0zkhhhd4/topBar.js?dl=0')
    topBarJS.setAttribute('defer', '')
    document.querySelector('body').prepend(topBarJS);
    
    const retrieveServerData = document.createElement('script');
    retrieveServerData.setAttribute('src', 'https://dl.dropbox.com/s/q45u3wo8zaqthnv/serverData.js?dl=0')
    retrieveServerData.setAttribute('defer', '')
    document.querySelector('body').prepend(retrieveServerData);
    
    const javascript = document.createElement('script');
    javascript.setAttribute('src', 'https://dl.dropbox.com/s/y9j9n1tt2l06bsc/customscript_2.0.js?dl=0')
    javascript.setAttribute('defer', '')
    document.querySelector('body').prepend(javascript);
    
    const stylesheet = document.createElement('link');
    stylesheet.setAttribute("rel", "stylesheet");
    stylesheet.setAttribute("href", "https://dl.dropbox.com/s/sgb2h7emq0uk8y4/style.css?dl=0");
    document.querySelector('head').appendChild(stylesheet);
    `)
    setTimeout(() => {
      mainWindow.show()
      splash.close();
      splash = null;
    }, 1000);
  })
  ipcMain.on('versionCheck:splash', () => {
    splash.webContents.send('versionCheckAnswer', ClientVersion)
  })
}

function createWindow() {
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
  globalShortcut.register('CommandOrControl+Up', function () {
    mainWindow.webContents.send('volume-up')
  });
  globalShortcut.register('CommandOrControl+Down', function () {
    mainWindow.webContents.send('volume-down')
  });

  //Overlay
  globalShortcut.register('Alt + 1', function () {
    overlayToggle();
  });

  //Overlay commands
  ipcMain.on('overlay-play-pause', function () {
    mainWindow.webContents.send('play-pause-request')
  })
  ipcMain.on('overlay-next', function () {
    mainWindow.webContents.send('next-track-request')
  })
  ipcMain.on('overlay-previous', function () {
    mainWindow.webContents.send('previous-track-request')
  })

  ipcMain.on('overlay-volume-up', function () {
    mainWindow.webContents.send('volume-up')
  })
  ipcMain.on('overlay-volume-down', function () {
    mainWindow.webContents.send('volume-down')
  })

  ipcMain.on('overlay-close', function () {
    overlayToggle()
  })

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
        
    const topBarJS = document.createElement('script');
    topBarJS.setAttribute('src', 'https://dl.dropbox.com/s/dhoar8i0zkhhhd4/topBar.js?dl=0')
    topBarJS.setAttribute('defer', '')
    document.querySelector('body').prepend(topBarJS);
    
    const retrieveServerData = document.createElement('script');
    retrieveServerData.setAttribute('src', 'https://dl.dropbox.com/s/q45u3wo8zaqthnv/serverData.js?dl=0')
    retrieveServerData.setAttribute('defer', '')
    document.querySelector('body').prepend(retrieveServerData);
    
    const javascript = document.createElement('script');
    javascript.setAttribute('src', 'https://dl.dropbox.com/s/y9j9n1tt2l06bsc/customscript_2.0.js?dl=0')
    javascript.setAttribute('defer', '')
    document.querySelector('body').prepend(javascript);
    
    const stylesheet = document.createElement('link');
    stylesheet.setAttribute("rel", "stylesheet");
    stylesheet.setAttribute("href", "https://dl.dropbox.com/s/sgb2h7emq0uk8y4/style.css?dl=0");
    document.querySelector('head').appendChild(stylesheet);
    `)
  })

  //Opens the Github page to download the latest version of the client
  ipcMain.on('openReleases', function () {
    shell.openExternal('https://github.com/DM164/Unoffical-YouTube-Music-App/releases');
  });


  let songTitle = 'Title'
  let songArtist = 'Artist'
  let playerVolume = '0'
  let endTimestamp = '0:00'
  let mediaStatus = 'paused'

  //DISCORD RICH PRESENCE (new)
  mainWindow.webContents.on('media-started-playing', function () {
    mediaStatus = 'playing'

    mainWindow.webContents.send('request-song-data')
    ipcMain.on('requested-data', function (event, arg) {

      client.updatePresence({
        details: arg.title, //Song title
        state: arg.artist, //Artist
        largeImageKey: largeImg,
        largeImageText: largeImageText,
        smallImageKey: 'play',
        smallImageText: 'Playing a song',
        instance: true,
      });

      //store artist and title in case the user pauses the song or opens the overlay
      songTitle = arg.title
      songArtist = arg.artist
      playerVolume = arg.volume
      endTimestamp = arg.endTimestamp
      thumb = arg.thumb
    });


    mainWindow.webContents.on('media-paused', function () {
      mediaStatus = 'paused'

      client.updatePresence({
        details: songTitle, //Song title
        state: songArtist, //Artist
        largeImageKey: largeImg,
        largeImageText: largeImageText,
        smallImageKey: 'pause',
        smallImageText: 'Paused',
        instance: true,
      });
    })

    //Overlay data request
    ipcMain.on('request-overlay-data', function () {
      mainWindow.webContents.send('request-song-data')
      let data = [
        title = songTitle,
        artist = songArtist,
        volume = playerVolume,
        endTimestamp = endTimestamp,
        thumb = thumb,
        mediaStatus = mediaStatus,
        DRPStatus = clientIsConnected
      ]
      overlay.webContents.send('requested-overlay-data', data)
    })

    //Volume request
    ipcMain.on('request-volume-data', function () {
      mainWindow.send('request-volume-data')
    })
    ipcMain.on('requested-volume-data', function (event, arg) {
      overlay.send('requested-volume-data', arg)
    })
    //Timestamp request
    ipcMain.on('request-time-data', function () {
      mainWindow.send('request-time-data')
    })
    ipcMain.on('requested-time-data', function (event, arg) {
      overlay.send('requested-time-data', arg)
    })

  })


  ipcMain.on('open-mainWindow', function () {
    mainWindow.show();
    overlay.close()
    overlayOpen = false;
  });

  ipcMain.on('restart-app', function () {
    createWarning('In order to chane this option you are going to have to restart the app.')
  });

  ipcMain.on('relaunch-app', function () {
    createWarning('In order to change this option you are going to have to restart the app.')
  });
  ipcMain.on('relaunch-app:confirmed', function () {
    app.relaunch();
    app.exit();
  });
  ipcMain.on('closeApp:close', function () {
    app.quit();
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

let tray = null
const titleIcon = path.join(__dirname + '/assets/tray/tray-title-icon.png')
const openAppIcon = path.join(__dirname + '/assets/tray/open.png')
const DRPIconDisconnect = path.join(__dirname + '/assets/tray/DisconnectDRP.png')
const DRPIconConnect = path.join(__dirname + '/assets/tray/ConnectDRP.png')
const openOverlayIcon = path.join(__dirname + '/assets/tray/overlay.png')
const quitAppIcon = path.join(__dirname + '/assets/tray/close.png')

app.on('ready', () => {
  createSplash()

  tray = new Tray(path.join(__dirname + '/assets/tray/tray-light.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'YouTube Music by DM', type: 'normal', icon: titleIcon, enabled: false },
    { label: 'separator', type: 'separator' },
    { label: 'Disconnect DiscordRP', icon: DRPIconDisconnect, click: function trayfunction2() { client.disconnect(); clientIsConnected = false } },
    { label: 'Connect DiscordRP', icon: DRPIconConnect, click: function trayfunction4() { if (clientIsConnected === false) { createNewPresence(); clientIsConnected = true } } },
    { label: 'Discord separator', type: 'separator' },
    { label: 'Open App', type: 'normal', icon: openAppIcon, click: function trayfunction1() { mainWindow.show() } },
    { label: 'Open Overlay', accelerator: 'Alt + 1', icon: openOverlayIcon, click: function trayfunction3() { overlayToggle() } },
    { label: 'Quit App', accelerator: 'CommandOrControl + Q', icon: quitAppIcon, click: function () { createWarning('Do you really want to quit the app?') } }
  ])
  tray.setToolTip('YouTube Music by DM')
  tray.setContextMenu(contextMenu)

  //Build menu from template
  const topMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(topMenu)
})

function createNewPresence() {
  client = require('discord-rich-presence')('611219815138590731');
  mainWindow.webContents.send('play-pause-request')
  client.updatePresence({
    details: 'Not listening to anything',
    largeImageKey: largeImg,
    largeImageText: largeImageText,
    smallImageKey: 'menus',
    smallImageText: 'In the menus',
    instance: true,
  })
  setTimeout(() => {
    mainWindow.webContents.send('play-pause-request')
  }, 100);
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
function idleDRP() {
  client.updatePresence({
    details: 'Not listening to anything',
    largeImageKey: largeImg,
    largeImageText: largeImageText,
    smallImageKey: 'menus',
    smallImageText: 'In the menus',
    instance: true,
  });
}

//Toggle the Overlay
let overlayOpen = false
function overlayToggle() {
  if (overlayOpen == false) {
    createOverlay();
    overlayOpen = true;
  } else {
    overlay.close();
    overlay = null;
    overlayOpen = false;
  }
}

//Overlay window
function createOverlay() {
  // Create the browser window.
  overlay = new BrowserWindow({
    width: 900,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    show: false,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    fullscreen: true
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

ipcMain.on('open:settings', function () {
  createSettings()
});
//Settings window
function createSettings() {
  // Create the browser window.
  settings = new BrowserWindow({
    width: 522,
    height: 422,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    show: false,
    frame: false,
    resizable: false
  })

  settings.loadFile('settings.html');
  settings.show();

  // Emitted when the window is closed.
  settings.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    settings = null
  })
}

//Notifications
function createWarning(arg) {
  // Create the browser window.
  warning = new BrowserWindow({
    width: 400,
    height: 180,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    resizable: false,
    frame: false,
    show: false
  })

  warning.loadFile('warning.html')
  setTimeout(() => {
    warning.webContents.send('data-warning', arg)
    warning.show()
  }, 300);

  // Emitted when the window is closed.
  warning.on('closed', function () {
    warning = null
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

ipcMain.on('versionCheck', function () {
  mainWindow.webContents.send('versionCheckAnswer', ClientVersion)
})

// New top menu template (edit, view, ect.) (we used it for shortcuts), only for pruduction
const mainMenuTemplate = [
  {
    label: 'App',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', //shortcut to quit, checks if the app is running on win32 or on darwin(MacOS)
        click() {
          createWarning('Do you really want to quit the app?')
        }
      },
      {
        label: 'Open YouTube',
        accelerator: 'Alt + 3',
        click() {
          createYTWindow();
        }
      },
      {
        label: 'Open YouTube',
        accelerator: 'Esc',
        click() {
          if (overlayOpen === true) {
            overlayToggle()
          }
        }
      }
    ]
  }
]