//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Difficulter du jeu
let gameDifficulty;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics de base
let velocityX = -2;
let gravity = 0.4;
let velocityY = 0;

let gameOver = false;
let score = 0;

// Variable pour éviter les sauvegardes multiples
let scoreSaved = false;

// Fonction pour changer les paramètres selon la difficulté
function modificationDesParametre(difficulty) {
    switch (difficulty) {
        case 'easy':
            velocityX = -2;
            gravity = 0.4;
            velocityY = 0;
            break;
        case 'medium':
            velocityX = -4;
            gravity = 0.2;
            velocityY = -4;
            break;
        case 'hard':
            velocityX = -10;
            gravity = 0.6;
            velocityY = -8;
            break;
    }
}

// Fonction pour sauvegarder le score dans le local storage
function saveScore(currentScore) {
    let bestScore = JSON.parse(localStorage.getItem('bestScore')) || 0;

    if (currentScore > bestScore) {
        localStorage.setItem('bestScore', JSON.stringify(currentScore));
        console.log("Nouveau meilleur score :", currentScore); // Debug
    } else {
        console.log("Score actuel inférieur au meilleur score :", currentScore); // Debug
    }
}



// Fonction pour afficher le leaderboard
function showLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const scoresList = document.getElementById('scores');

    let bestScore = JSON.parse(localStorage.getItem('bestScore')) || 0;

    if (bestScore === 0) {
        scoresList.innerHTML = '<li>Aucun score enregistré</li>';
    } else {
        scoresList.innerHTML = `<li>Meilleur score : ${bestScore}</li>`;
    }

    leaderboard.style.display = 'block';
    document.getElementById('board').style.display = 'none';
}




// Fonction pour revenir au menu principal
function backToMenu() {
    document.getElementById('leaderboard').style.display = 'none';
    const menu = document.getElementById('menu');
    menu.style.opacity = '1';
    menu.style.pointerEvents = 'auto';
}

// Fonction pour démarrer le jeu
function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('board').style.display = 'block';

    gameDifficulty = document.getElementById('difficulty').value;

    modificationDesParametre(gameDifficulty);

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "/png/flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "png/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "png/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
}

// Fonction pour mettre à jour l'état du jeu
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        if (!scoreSaved) { // Sauvegarder uniquement si cela n'a pas été fait
            saveScore(score); // Appeler la fonction pour enregistrer le score
            scoreSaved = true; // Marquer comme sauvegardé
            document.getElementById('gameOverScreen').style.display = 'block';
            document.getElementById('board').style.display = 'none';
        }
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }


    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
}

// Fonction pour générer les tuyaux
function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

// Fonction pour déplacer l'oiseau
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}


function clearScores() {
    localStorage.removeItem('bestScore'); // Supprimer le meilleur score
    alert('Le classement a été réinitialisé.');
    showLeaderboard();
}



// Fonction pour détecter les collisions
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
