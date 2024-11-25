//board
let board;
let boardWidth = 360;  // Largeur du background
let boardHeight = 640; // Hauteur du background
let context;

// Difficulter du jeux
let gameDifficulty;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8; // Largeur pour qu'il soit au début
let birdY = boardHeight / 2; // Hauter pour qu'il soit au milieu
let birdImg; // Image du bird

let bird = { // Creation du bird plus "constructeur"
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics de base
let velocityX = -2; //pipes moving left speed
let gravity = 0.4;
let velocityY = 0; //bird jump speed

let gameOver = false;
let score = 0;

// leaderboard
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let scoreSaved = false; // Nouveau : empêche les prompts en boucle

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

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('board').style.display = 'block';

    // Récupérer la difficulté sélectionnée
    gameDifficulty = document.getElementById('difficulty').value;

    // Setter la difficulé
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

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        if (!scoreSaved) {
            saveScore(score); // Sauvegarde le score une seule fois
            scoreSaved = true; // Empêche le prompt de se répéter
        }
        context.fillText("GAME OVER", 45, 320);
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
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

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
}

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

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            scoreSaved = false; // Réinitialiser l'indicateur
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// leaderboard
function saveScore(score) {
    if (scoreSaved) return; // Empêche d'exécuter plusieurs fois la sauvegarde

    let playerName = prompt("Entrez votre nom pour le leaderboard :");

    if (playerName) {
        let replaced = false;

        // Parcourir le leaderboard en commençant par la 10ème position
        for (let i = leaderboard.length - 1; i >= 0; i--) {
            if (score > leaderboard[i].score) {
                leaderboard[i] = { name: playerName, score: score }; // Remplacer score et nom
                replaced = true;
                break; // Arrêter la boucle une fois remplacé
            }
        }

        // Si le leaderboard contient moins de 10 scores, ajouter directement
        if (!replaced && leaderboard.length < 10) {
            leaderboard.push({ name: playerName, score: score });
        }

        // Trier les scores du meilleur au moins bon
        leaderboard.sort((a, b) => b.score - a.score);

        // Sauvegarder dans le stockage local
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        // Afficher le leaderboard
        displayLeaderboard();

        scoreSaved = true; // Empêche les prompts multiples
    }
}



function returnToMenu() {
    window.location.reload();
}

function displayLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    const leaderboardList = document.getElementById('leaderboard-list');

    leaderboardList.innerHTML = ""; // Efface l'ancien contenu
    leaderboard.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(listItem);
    });

    leaderboardDiv.style.display = 'block'; // Afficher le leaderboard
}


function restartGame() {
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('board').style.display = 'block';

    gameOver = false;
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    scoreSaved = false;
}
