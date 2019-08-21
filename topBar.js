const remoteB = require('electron').remote;

let topBar = document.createElement('div');
topBar.setAttribute("class", "topBar")

//Top bar buttons
const closeButton = document.createElement('button');
const closeButtonImg = document.createElement('img');
closeButton.setAttribute('id', 'closeApp');
closeButtonImg.src = 'https://www.dropbox.com/s/3zgaknbjc5vrz0c/icons8-multiply-14.png?raw=1'
closeButton.appendChild(closeButtonImg);

const maximizeApp = document.createElement('button');
const maximizeButtonImg = document.createElement('img');
maximizeApp.setAttribute('id', 'maximizeApp');
maximizeButtonImg.src = 'https://www.dropbox.com/s/ap8dgpfwqwxzlh4/icons8-full-screen-14.png?raw=1'
maximizeApp.appendChild(maximizeButtonImg);

const minimizeApp = document.createElement('button');
const minimizeButtonImg = document.createElement('img');
minimizeApp.setAttribute('id', 'minimizeApp');
minimizeButtonImg.src = 'https://www.dropbox.com/s/l65mi8w1yaljx8u/minimizeApp.png?raw=1'
minimizeApp.appendChild(minimizeButtonImg);

topBar.appendChild(closeButton);
topBar.appendChild(maximizeApp);
topBar.appendChild(minimizeApp);

document.querySelector('body').prepend(topBar);


//Buttons on Top Bar
document.getElementById("closeApp").addEventListener("click", function(){
    const window = remoteB.getCurrentWindow();
    window.close();
});
document.getElementById("minimizeApp").addEventListener("click", function (e) {
    const window = remoteB.getCurrentWindow();
    window.minimize(); 
});
document.getElementById("maximizeApp").addEventListener("click", function (e) {
    const window = remoteB.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();          
    } else {
        window.unmaximize();
    }
});