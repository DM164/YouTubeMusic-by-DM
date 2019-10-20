//checks the value the first time you open the settings
checkDRPValue()

//Closes settings when you click outside the settings window
document.getElementById('AS1').addEventListener('click', function(){
    document.querySelector('.appSettingsWindow').style.display='block'
    document.querySelector('.dimm').style.display='block'
})

document.getElementById('dimmB').addEventListener('click', function(){
    document.querySelector('.appSettingsWindow').style.display = 'none'
    document.querySelector('.dimm').style.display = 'none'
})

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