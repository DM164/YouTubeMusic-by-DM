// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')


//Discord rich presence client
const client = require('discord-rich-presence')('611219815138590731');

//Discord rich presence icons
const largeImg = 'rpc_icon'
const largeImageText = 'YouTube Music App by DM (iGoof#0982 on Discord)'

//Discord rich presence active setting switch
let discordRichPresence = true; //TODO: add a setting to deactivate this


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    icon: 'Icons/YTMIcon.png',
    backgroundColor: '#1f1f1f',
    frame: false,
    'minHeight': 700,
    'minWidth': 1100
  })
  
mainWindow.webContents.on('did-finish-load', function() {
  // mainWindow.webContents.insertCSS('html,body{ background-color: #FF0000 !important;}')
  // mainWindow.webContents.insertHTML('data:text/html,<p>Hello, World!</p>');
  mainWindow.webContents.executeJavaScript(`

  const stylesheet = document.createElement('link');
  stylesheet.setAttribute("rel", "stylesheet");
  stylesheet.setAttribute("href", "https://dl.dropbox.com/s/k2ta8h2yuj0uh20/style.css?dl=0");
  
  const javascript = document.createElement('script');
  javascript.setAttribute('src', 'https://dl.dropbox.com/s/4bc4z4siyheclsr/customscript.js?dl=0')
  javascript.setAttribute('defer', '')
  document.querySelector('body').appendChild(javascript);

  const topBarJS = document.createElement('script');
  topBarJS.setAttribute('src', 'https://dl.dropbox.com/s/6jf7mb1921ae8nc/topBar.js?dl=0')
  topBarJS.setAttribute('defer', '')
  document.querySelector('body').appendChild(topBarJS);
  
  document.querySelector('head').appendChild(stylesheet);
  `)
});

let songTitle = 'Title'
let songArtist = 'Artist'

//DISCORD RICH PRESENCE (new)
mainWindow.webContents.on('media-started-playing', function(){

  mainWindow.webContents.send('request-song-data', 'data reached customscript.js')
  ipcMain.on('requested-data', function(event, arg){

    console.log(`Data arrived: Title: ${arg.title}, Artist: ${arg.artist}` )

    if ( arg.artist.length > 30 ){
      songArtist = 'Audio only'
    } else {
      songArtist = arg.artist
    }

    client.updatePresence({
      details: arg.title, //Song title
      state: songArtist, //Artist
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
  });

})
mainWindow.webContents.on('media-paused', function(){
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
})


ipcMain.on('closeApp:close', function(){
  app.close();
});

  // App Splashscreen
  mainWindow.loadFile('index.html')

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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



//discord rich presence (old)
if (discordRichPresence == true){ //checks if user turned rich presence on or off

  //DISCORD RICH PRESENCE at startup   
  client.updatePresence({
    details: 'Not listening to anything', //Song title or app status
    largeImageKey: largeImg,
    largeImageText: largeImageText,
    smallImageKey: 'menus',
    smallImageText: 'In the menus',
    instance: true,
  });
}