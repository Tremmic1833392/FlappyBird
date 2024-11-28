//board
let coins = []; // Stockage des pièces
let coinImg;    // Image de la pièce
let coinWidth = 20;
let coinHeight = 20;
let board;
let boardWidth = 360;  // Largeur du background
let boardHeight = 640; // Hauteur du background
let context;
let playerMoney = 0; // Initialiser l'argent du joueur

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
    coinImg = new Image();
    coinImg.src = "png/Coin.png.png";
    setInterval(placeCoin, 2000); // Génère une pièce toutes les 2 secondes

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
    if (gameStarted) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0);
    }
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
            playerMoney += 10;
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
    context.fillText("Gain: ", 5, 90); // Affichage du gain
    context.fillText(playerMoney, 120, 90); // Affiche la valeur de l'argent du joueur
    // Coins
    for (let i = 0; i < coins.length; i++) {
        let coin = coins[i];
        coin.x += velocityX; // La pièce se déplace à gauche
        context.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);

        // Vérifiez si l'oiseau a touché la pièce
        if (detectCollision(bird, coin)) {
            coins.splice(i, 1); // Supprimez la pièce du tableau
            playerMoney += 5;  // Augmentez les gains
            i--; // Ajustez l'index après suppression
        }
    }

// Supprimer les pièces hors écran
    while (coins.length > 0 && coins[0].x < -coinWidth) {
        coins.shift();
    }

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
    if (e.code === "ArrowUp" )/*|| e.code === "ArrowUp" || e.code === "KeyX") {
        velocityY = -6;
*/
    {bird.y = Math.max(bird.y - 10, 0);}
    else if (e.code==="ArrowDown")
    {bird.y = Math.min(bird.y + 10, boardHeight - bird.height);}
        if (gameOver && (e.code === "Space" || e.code === "KeyX")) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            scoreSaved = false; // Réinitialiser l'indicateur

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
let gameStarted = false;
function placeCoin() {
    if (gameOver) return;

    let randomY = Math.random() * (boardHeight - coinHeight); // Position Y aléatoire
    let coin = {
        x: boardWidth, // Toujours à l'extérieur à droite du board
        y: randomY,
        width: coinWidth,
        height: coinHeight
    };
    coins.push(coin);
}