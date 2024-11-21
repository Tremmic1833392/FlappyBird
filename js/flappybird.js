
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
let birdX = boardWidth/8; // Largeur pour qu'il soit au début
let birdY = boardHeight/2; // Hauter pour qu'il soit au milieu
let birdImg; // Image du bird

let bird = {  // Creation du bird plus "constructeur"
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
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


function modificationDesParametre(difficulty) {
    switch (difficulty) {
        case 'easy':
            velocityX = -2;    // Les tuyaux se déplacent normalement
            gravity = 0.4;     // La gravité est normal
            velocityY = 0;    // Le saut du bird normal
            break;
        case 'medium':
            velocityX = -4;    // Les tuyaux se deplace un peu plus vite
            gravity = 0.2;     // Gravité normale
            velocityY = -4;    // Saut normal
            break;
        case 'hard':
            velocityX = -10;    // Les tuyaux se déplacent extremement vite
            gravity = 0.6;     // Gravité plus forte
            velocityY = -8;    // Le saut du bird est plus faible
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
    birdImg.onload = function() {
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
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
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
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    // Affichage du game over losque la fonction est true
    if (gameOver) {
        context.fillText("GAME OVER",45,320);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

