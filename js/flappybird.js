// Coins
let coins = []; // Stockage des pièces
let coinImg;    // Image de la pièce
let coinWidth = 20;
let coinHeight = 20;
let playerMoney = 0; // Initialiser l'argent du joueur
coinImg = new Image();
coinImg.src = "png/Coin.png.png";

//board
let board;
let boardWidth = 360;  // Largeur du background
let boardHeight = 640; // Hauteur du background
let context;


// Difficulter du jeux
let gameDifficulty;

// Theme choisit
let themeChoix
document.getElementById("theme").addEventListener("change", choixDuTheme);



//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8; // Largeur pour qu'il soit au début
let birdY = boardHeight / 2; // Hauteur pour qu'il soit au milieu
let birdImg = new Image();
birdImg.src = "png/flappybird.png";

let bird = { // Creation du bird plus "constructeur"
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
let espaceAudessus = 0;
let espaceEnDessous = 0;

let topPipeImg = new Image();
topPipeImg.src = "png/toppipe.png";

let bottomPipeImg = new Image();
bottomPipeImg.src = "png/bottompipe.png";

//physics de base
let velocityX = -2; //pipes moving left speed
let gravity = 0.4;  // gravité
let velocityY = 0; //bird jump speed

let gameOver = false;
let score = 0;

// leaderboard
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let scoreSaved = false; // Nouveau : empêche les prompts en boucle



// Chargement des sons
const flapSound = new Audio('sounds/flap.mp3');
const hitSound = new Audio('sounds/hit-sound.mp3');
const pointSound = new Audio('sounds/point.mp3');
const dieSound  = new Audio('sounds/die.mp3');



let isMuted = false; // État initial du son (non muet)


// Gestion du bouton Muet
document.getElementById('mute-button').addEventListener('click', () => {
    isMuted = !isMuted; // Basculer l'état muet/non muet
    if (isMuted) {
        flapSound.muted = true;
        hitSound.muted = true;
        pointSound.muted = true;
        document.getElementById('mute-button').textContent = '🔇'; // Changer l'icône du bouton
    } else {
        flapSound.muted = false;
        hitSound.muted = false;
        pointSound.muted = false;
        document.getElementById('mute-button').textContent = '🔊'; // Changer l'icône du bouton
    }
});
window.addEventListener('click', function() {
    // Activer les sons après un clic
    flapSound.play();
});



function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('board').style.display = 'block';

    // Récupérer la difficulté sélectionnée
    gameDifficulty = document.getElementById('difficulty').value;

    // Setter la difficulé
    modificationDesParametre(gameDifficulty);

    // Load theme
    loadTheme(themeChoix);

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");


    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    //restartGame(); // Démarrer avec la configuration initiale

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // 1500 = 1.5 seconde --> un tuyaux tous les 1.5 sec
    document.addEventListener("keydown", moveBird);
    setInterval(placeCoin, 1500); // Génère une pièce toutes les 2 secondes

}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        if (!scoreSaved) {
            saveScore(score); // Sauvegarde le score une seule fois
            scoreSaved = true;// Empêche le prompt de se répéter
            if (!isMuted) {
                dieSound.play(); }// Jouer le son de defaite
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
            playerMoney += 10;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            if (!isMuted) {
                hitSound.play(); }// Jouer le son de collision
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
            if (!isMuted) {
                pointSound.currentTime = 0; // Réinitialiser le son au début
                pointSound.play();          // Jouer le son du point
            }

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
    espaceAudessus = topPipe.y + topPipe.height; // Le bas du tuyau supérieur
    espaceEnDessous = bottomPipe.y;
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    // Vérifie si le leaderboard est affiché
    const leaderboardVisible = document.getElementById('leaderboard').style.display === 'block';

    if (leaderboardVisible) {
        return; // Ne rien faire si le leaderboard est visible
    }

    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        velocityY = -6;


        if (!isMuted) {
            flapSound.currentTime = 0; // Réinitialiser le son au début
            flapSound.play();         // Jouer le son du saut
        }

        //bird.y = Math.max(bird.y - 10, 0);

        if (gameOver && (e.code === "Space" || e.code === "KeyX")) {
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

    // Utilisation de setTimeout pour garantir l'affichage du prompt
    setTimeout(() => {
        let playerName = prompt("Entrez votre nom pour le leaderboard :");

        // Si le joueur annule ou ne saisit pas de nom
        if (!playerName || playerName.trim() === "") {
            restartGame(); // Retourner directement au jeu
            return;
        }

        let replaced = false;

        // Ajouter la difficulté traduite
        const difficultyInFrench = translateDifficulty(gameDifficulty);

        // Parcourir le leaderboard pour insérer le nouveau score
        for (let i = leaderboard.length - 1; i >= 0; i--) {
            if (score > leaderboard[i].score) {
                leaderboard[i] = { name: `${difficultyInFrench} ${playerName}`, score: score }; // Remplacer score et nom
                replaced = true;
                break; // Arrêter la boucle une fois remplacé
            }
        }

        // Ajouter le score si le leaderboard contient moins de 10 entrées
        if (!replaced && leaderboard.length < 10) {
            leaderboard.push({ name: `${difficultyInFrench} ${playerName}`, score: score });
        }

        // Trier les scores du meilleur au moins bon
        leaderboard.sort((a, b) => b.score - a.score);

        // Sauvegarder dans le stockage local
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        // Afficher le leaderboard
        displayLeaderboard();

        scoreSaved = true; // Empêche les prompts multiples
    }, 10); // Légère pause pour éviter les conflits
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

// Méthode pour afficher le menu option quand on appuit sur le button
function displayOption(){
    const optionMenu = document.getElementById('optionMenu');
    const buttonStart = document.getElementById('buttonStart');
    const buttonSelection = document.getElementById('difficulty');
    const buttonClassement = document.getElementById('buttonLeaderboard');

    buttonStart.style.display = 'none';        // Cache le button start,selection et le classement
    buttonSelection.style.display = 'none';
    buttonClassement.style.display = 'none';

    optionMenu.style.display = 'block';        // Fait apparaitre le menu option
}

// Équivalent du returnToMenu, mais qui ne fais pas perdre les donner pour le theme
function optionToMenu(){
    const menu = document.getElementById('menu');
    const optionMenu = document.getElementById('optionMenu');
    const buttonStart = document.getElementById('buttonStart');
    const buttonSelection = document.getElementById('difficulty');
    const buttonClassement = document.getElementById('buttonLeaderboard');


    buttonStart.style.display = 'flex';
    buttonSelection.style.display = 'flex';
    buttonClassement.style.display = 'flex';

    optionMenu.style.display = 'none';
}

function restartGame() {
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('board').style.display = 'block';

    // Récupérer la difficulté sélectionnée
    gameDifficulty = document.getElementById('difficulty').value;

    console.log(gameDifficulty);
    // Setter la difficulé
    modificationDesParametre(gameDifficulty);

    gameOver = false;
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    scoreSaved = false;


}
let gameStarted = false;
function placeCoin() {
    if (gameOver) return;
    let randomY = Math.random() * (espaceEnDessous - espaceAudessus) + espaceAudessus; // Position Y aléatoire
    let coin = {
        x: boardWidth, // Toujours à l'extérieur à droite du board
        y: randomY,
        width: coinWidth,
        height: coinHeight
    };
    coins.push(coin);


}

// Modifie les parametre de vitesse saut et gravité selon la difficulter choisit
function modificationDesParametre(difficulty) {
    switch (difficulty) {
        case 'easy':
            velocityX = -2;
            gravity = 0.3;
            velocityY = 0;
            break;
        case 'medium':
            velocityX = -4;
            gravity = 0.3;
            velocityY = 0;
            break;
        case 'hard':
            velocityX = -8;
            gravity = 0.3;
            velocityY = 0;
            break;
    }
}

// Change les tuyaux et le flappy bird tout dépendant du theme que l'utilisateur à choisit
function loadTheme(){
    switch(themeChoix) {
        case "themeNormal":
            birdImg.src = "/png/flappybird.png";
            topPipeImg.src = "/png/toppipe.png";
            bottomPipeImg.src = "/png/bottompipe.png";
            break;
        case "themeRouge":
            birdImg.src = "/png/redflappybird.png";
            topPipeImg.src = "/png/toppipered.png";
            bottomPipeImg.src = "/png/bottompipered.png";
            break;
        case "themeMauve":
            birdImg.src = "/png/purpleflappybird.png";
            topPipeImg.src = "/png/toppipepurple.png";
            bottomPipeImg.src = "/png/bottompipepurple.png";
            break;
        case "themeNoirEtBlanc":
            birdImg.src = "/png/blackandwhiteflappybird.png";
            topPipeImg.src = "/png/blackandwhitetoppipe.png";
            bottomPipeImg.src = "/png/blackandwhitebottompipe.png";

            break;
    }
}

// Recupere la valeur du theme dans le selector, puis si c'est le theme noir et blanc on met les tout affichage en noir et blanc
function choixDuTheme() {
    // Récupérer la valeur du thème sélectionné
    themeChoix = document.getElementById("theme").value;
    console.log("Thème choisi :", themeChoix); // Afficher le thème pour vérification

    if(themeChoix === "themeNoirEtBlanc"){
        document.getElementById("menu").style.filter = "grayscale(100%)"
        document.getElementById("optionMenu").style.filter = "grayscale(100%)"
        document.getElementById("board").style.filter = "grayscale(100%)"
    }
    // Si l'utilisateur retourne sur le theme rouge,normal ou mauve on rajuste les couleurs
    else if (themeChoix === "themeRouge" || themeChoix === "themeNormal" || themeChoix === "themeMauve") {
        document.getElementById("menu").style.filter = "grayscale(0%)"
        document.getElementById("optionMenu").style.filter = "grayscale(0%)"
        document.getElementById("board").style.filter = "grayscale(0%)"
    }
}
function translateDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 'Facile   ';
        case 'medium':
            return 'Moyen    ';
        case 'hard':
            return 'Difficile';
        default:
            return 'Facile   ';
    }
}






