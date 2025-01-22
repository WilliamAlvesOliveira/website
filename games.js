function openwindow(game){
    let gamescreen = document.querySelector(".games");
    let gameFrame = document.getElementById('gameFrame');
    gamescreen.style.display = "flex";
    gameframe.src = game;
}

function closewindow(){
    let gamescreen = document.querySelector(".games");
    gamescreen.style.display = "none";
}