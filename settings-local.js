const { ipcRenderer, remote } = require('electron')

//checks the value the first time you open the settings
checkDRPValue()

//DRP functionality
let DRPvalue = localStorage.getItem('DRP');

document.querySelector('.DRPSwitch').addEventListener('click', function(){
    if (DRPvalue == "true"){
        document.querySelector('.DRPindicator').setAttribute('class', 'DRPindicator');
        localStorage.setItem('DRP', false);
    } else if (DRPvalue == "false") {
        document.querySelector('.DRPindicator').setAttribute('class', 'DRPindicator DRPactive');
        localStorage.setItem('DRP', true);
    }
    ipcRenderer.send('relaunch-app')
    console.log(`DRPvalue is "${DRPvalue}"`);
})

function checkDRPValue(){
    let DRPvalue2 = localStorage.getItem('DRP')
    if (DRPvalue2 == "false"){
        document.querySelector('.DRPindicator').setAttribute('class', 'DRPindicator');
    } else if (DRPvalue2 == "true") {
        document.querySelector('.DRPindicator').setAttribute('class', 'DRPindicator DRPactive');
    }
}

//Buttons on Top Bar
document.getElementById("closeApp").addEventListener("click", function(){
    const window = remote.getCurrentWindow();
    window.hide();
});
document.getElementById("minimizeApp").addEventListener("click", function (e) {
    const window = remote.getCurrentWindow();
    window.minimize(); 
});