document.getElementById('AS1').addEventListener('click', function(){
    document.querySelector('.appSettingsWindow').style.display='block'
    document.querySelector('.dimm').style.display='block'
})

document.getElementById('dimmB').addEventListener('click', function(){
    document.querySelector('.appSettingsWindow').style.display = 'none'
    document.querySelector('.dimm').style.display = 'none'
})