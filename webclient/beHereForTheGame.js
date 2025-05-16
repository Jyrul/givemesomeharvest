// ----- VARIABLES GLOBALES -----

// Cercles Joueurs
let circleSize = 50;
let circleRadius = 25;

// Positions de départ
let startOffsetX;
let startOffsetY;

// Carrés
let squares = [];
let baseSquareSize = 20;
let maxSquaresOnScreen = 10;

// Scores
let scoreGauche = 0;
let scoreDroit = 0;
let scoreDisplaySize = 32;

const SQUARE_TYPES = {
  NORMAL: { points: 1, speedDivisor: 1, sizeMultiplier: 1, typeName: "NORMAL" },
  MOYEN: { points: 2, speedDivisor: 2, sizeMultiplier: 2, typeName: "MOYEN" },
  GRAND: { points: 3, speedDivisor: 3, sizeMultiplier: 3, typeName: "GRAND" },
};
let squareColors = {};

// NOUVEAU: Pour le délai de spawn des boîtes
const SPAWN_DELAY = 2000; // 2 secondes en millisecondes
let lastSpawnTime = 0;

// Zones de Dépôt
let depositZoneGauche = { x: 0, y: 0, w: 100, h: 50, color: null };
let depositZoneDroit = { x: 0, y: 0, w: 100, h: 50, color: null };

// Timer et état du jeu
let timerDuration = 30;
let startTime;
let remainingTime;
let gameState = "playing";
let gameOverDisplayStartTime = 0;
const RESTART_DELAY_MS = 7000;

// Servuer

// ----- SETUP -----
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);

  ws = new WebSocket(`ws://${location.hostname}:8080`);

  squareColors[SQUARE_TYPES.NORMAL.typeName] = color(139, 69, 19);
  squareColors[SQUARE_TYPES.MOYEN.typeName] = color(160, 82, 45);
  squareColors[SQUARE_TYPES.GRAND.typeName] = color(210, 105, 30);

  let zoneColor = color(255, 255, 0, 70);

  depositZoneGauche.w = 100;
  depositZoneGauche.h = 50;
  depositZoneGauche.x = depositZoneGauche.w / 2 + 20;
  depositZoneGauche.y = height - depositZoneGauche.h / 2 - 20;
  depositZoneGauche.color = zoneColor;

  depositZoneDroit.w = 100;
  depositZoneDroit.h = 50;
  depositZoneDroit.x = width - depositZoneDroit.w / 2 - 20;
  depositZoneDroit.y = height - depositZoneDroit.h / 2 - 20;
  depositZoneDroit.color = zoneColor;

  startOffsetX = 150;
  startOffsetY = 150;

  resetGame();
}

// ----- RESET GAME -----
function resetGame() {
  scoreGauche = 0;
  scoreDroit = 0;
  players.forEach((item, index, players) => {
    players[index].score = 0;

    players[index].x = players[index].radius + startOffsetX;
    players[index].y = height - players[index].radius - startOffsetY;

    players[index].speed = players[index].baseSpeed;

    players[index].lastMoveDx = 0;
    players[index].lastMoveDy = -1;

    players[index].carryingSquareIndex = -1;
  });

  squares = [];

  startTime = millis();
  gameState = "playing";
  gameOverDisplayStartTime = 0;
  remainingTime = timerDuration;
  lastSpawnTime = millis() - SPAWN_DELAY; // Permet un premier spawn potentiellement immédiat après reset
}

// ----- SPAWN NEW SQUARE -----
function trySpawnNewSquare() {
  // Vérifier si le délai est écoulé avant de tenter un spawn
  if (millis() - lastSpawnTime < SPAWN_DELAY) {
    return;
  }

  let activeSquaresCount = 0;
  for (let sq of squares) {
    if (!sq.isDeposited) {
      activeSquaresCount++;
    }
  }

  if (activeSquaresCount < maxSquaresOnScreen) {
    let typeKeys = Object.keys(SQUARE_TYPES);
    let randomTypeKey = random(typeKeys);
    let type = SQUARE_TYPES[randomTypeKey];

    let newActualSize = baseSquareSize * type.sizeMultiplier;
    squares.push({
      x: random(width / 2 - width / 5, width / 2 + width / 5),
      y: newActualSize / 2 + 30,
      actualSize: newActualSize,
      points: type.points,
      speedDivisor: type.speedDivisor,
      typeName: type.typeName,
      isCarried: false,
      carriedBy: null,
      isDeposited: false,
    });
    lastSpawnTime = millis(); // Mettre à jour le temps du dernier spawn réussi
  }
}

// ----- DRAW (BOUCLE PRINCIPALE) -----
function draw() {
  background(200);

  trySpawnNewSquare();

  players.forEach((item, index, players) => {
    if (gameState === "playing") {
    handlePlayerInput();
    resolvePlayerCollision();
    handleSquareInteractions();
    handleDepositsAndScores();

    let elapsedTime = (millis() - startTime) / 1000;
    remainingTime = timerDuration - elapsedTime;
      if (remainingTime <= 0) {
        remainingTime = 0;
        gameState = "gameOver";
        gameOverDisplayStartTime = millis();
      }
    }

    drawDepositZones();
    drawScores();
    drawSquares(); // Modifié pour l'ordre de dessin
    drawPlayers();
    displayTimer();
  });
  

  if (gameState === "gameOver") {
    displayGameOverScreen();
    if (millis() - gameOverDisplayStartTime > RESTART_DELAY_MS) {
      resetGame();
    }
  }
}

// ----- GESTION DU DÉPÔT AUTOMATIQUE ET SCORES -----
function handleDepositsAndScores() {
  // --- Joueur Rouge ---
  if (players[0].carryingSquareIndex !== -1) {
    let sq = squares[players[0].carryingSquareIndex];
    let depositedThisFrame = false;

    if (
      players[0].x > depositZoneGauche.x - depositZoneGauche.w / 2 &&
      players[0].x < depositZoneGauche.x + depositZoneGauche.w / 2 &&
      players[0].y > depositZoneGauche.y - depositZoneGauche.h / 2 &&
      players[0].y < depositZoneGauche.y + depositZoneGauche.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreGauche += sq.points;
      players[0].score += sq.points;
      depositedThisFrame = true;
      players[0].speed = players[0].baseSpeed;
      players[0].carryingSquareIndex = -1;
    }

    if (
      !depositedThisFrame &&
      players[0].carryingSquareIndex !== -1 &&
      players[0].x > depositZoneDroit.x - depositZoneDroit.w / 2 &&
      players[0].x < depositZoneDroit.x + depositZoneDroit.w / 2 &&
      players[0].y > depositZoneDroit.y - depositZoneDroit.h / 2 &&
      players[0].y < depositZoneDroit.y + depositZoneDroit.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreDroit += sq.points;
      players[0].score += sq.points;
      players[0].speed = players[0].baseSpeed;
      players[0].carryingSquareIndex = -1;
    }
  }

  // --- Joueur Bleu ---
  if (players[1].carryingSquareIndex !== -1) {
    let sq = squares[players[1].carryingSquareIndex];
    let depositedThisFrame = false;

    if (
      players[1].x > depositZoneGauche.x - depositZoneGauche.w / 2 &&
      players[1].x < depositZoneGauche.x + depositZoneGauche.w / 2 &&
      players[1].y > depositZoneGauche.y - depositZoneGauche.h / 2 &&
      players[1].y < depositZoneGauche.y + depositZoneGauche.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreGauche += sq.points;
      players[1].score += sq.points;
      depositedThisFrame = true;
      players[1].speed = players[1].baseSpeed;
      players[1].carryingSquareIndex = -1;
    }

    if (
      !depositedThisFrame &&
      players[1].carryingSquareIndex !== -1 &&
      players[1].x > depositZoneDroit.x - depositZoneDroit.w / 2 &&
      players[1].x < depositZoneDroit.x + depositZoneDroit.w / 2 &&
      players[1].y > depositZoneDroit.y - depositZoneDroit.h / 2 &&
      players[1].y < depositZoneDroit.y + depositZoneDroit.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreDroit += sq.points;
      players[1].score += sq.points;
      players[1].speed = players[1].baseSpeed;
      players[1].carryingSquareIndex = -1;
    }
  }
}

// ----- GESTION DES ENTRÉES JOUEURS -----
function handlePlayerInput() {
  ws.addEventListener("message", async (ev) => {
    const [player, action, ...values] = (await ev.data.text()).split(",");

    console.dir("message", {
      player,
      action,
      values,
    });
  });

  /*
  // TODO NO_TEAM a fusinonner ici
  if (player.team == NO_TEAM) {
    return;
  }

  // Joueur Rouge
  let redIntentX = 0;
  let redIntentY = 0;

  switch (action) {
    case "up":
      redIntentY = -1;
      break;
    case "down":
      redIntentY = 1;
      break;
    case "left":
      redIntentX = -1;
      break;
    case "right":
      redIntentX = 1;
      break;
    default:
      break;
  }

  if (redIntentX !== 0 || redIntentY !== 0) {
    if (redIntentX !== 0 && redIntentY !== 0) {
      let len = sqrt(2);
      players[0].x += (redIntentX / len) * players[0].speed;
      players[0].y += (redIntentY / len) * players[0].speed;
      players[0].lastMoveDx = redIntentX / len;
      players[0].lastMoveDy = redIntentY / len;
    } else {
      players[0].x += redIntentX * players[0].speed;
      players[0].y += redIntentY * players[0].speed;
      players[0].lastMoveDx = redIntentX;
      players[0].lastMoveDy = redIntentY;
    }
  }
  players[0].x = constrain(
    players[0].x,
    players[0].radius,
    width - players[0].radius
  );
  players[0].y = constrain(
    players[0].y,
    players[0].radius,
    height - players[0].radius
  );

  // Joueur Bleu
  let blueIntentX = 0;
  let blueIntentY = 0;
  if (keyIsDown(79)) {
    blueIntentY = -1;
  }
  if (keyIsDown(76)) {
    blueIntentY = 1;
  }
  if (keyIsDown(75)) {
    blueIntentX = -1;
  }
  if (keyIsDown(77)) {
    blueIntentX = 1;
  }

  if (blueIntentX !== 0 || blueIntentY !== 0) {
    if (blueIntentX !== 0 && blueIntentY !== 0) {
      let len = sqrt(2);
      players[1].x += (blueIntentX / len) * players[1].speed;
      players[1].y += (blueIntentY / len) * players[1].speed;
      players[1].lastMoveDx = blueIntentX / len;
      players[1].lastMoveDy = blueIntentY / len;
    } else {
      players[1].x += blueIntentX * players[1].speed;
      players[1].y += blueIntentY * players[1].speed;
      players[1].lastMoveDx = blueIntentX;
      players[1].lastMoveDy = blueIntentY;
    }
  }
  players[1].x = constrain(
    players[1].x,
    players[1].radius,
    width - players[1].radius
  );
  players[1].y = constrain(
    players[1].y,
    players[1].radius,
    height - players[1].radius
  );
  */
}

// ----- COLLISION ENTRE JOUEURS -----
function resolvePlayerCollision() {
  players.forEach((item, index, players) => {
    let distanceVal = dist(
    players[0].x,
    players[0].y,
    players[1].x,
    players[1].y
  );
  let overlap = circleSize - distanceVal;

  if (overlap > 0 && distanceVal > 0) {
    let dx = players[1].x - players[0].x;
    let dy = players[1].y - players[0].y;
    let normalX = dx / distanceVal;
    let normalY = dy / distanceVal;
    players[0].x -= normalX * (overlap / 2);
    players[0].y -= normalY * (overlap / 2);
    players[1].x += normalX * (overlap / 2);
    players[1].y += normalY * (overlap / 2);
    players[0].x = constrain(
      players[0].x,
      players[0].radius,
      width - players[0].radius
    );
    players[0].y = constrain(
      players[0].y,
      players[0].radius,
      height - players[0].radius
    );
    players[1].x = constrain(
      players[1].x,
      players[1].radius,
      width - players[1].radius
    );
    players[1].y = constrain(
      players[1].y,
      players[1].radius,
      height - players[1].radius
    );
  } else if (distanceVal === 0) {
    players[0].x += random(-1, 1);
    players[0].y += random(0, 1);
    players[1].x += random(-1, 1);
    players[1].y += random(-1, 0);
  }
  });
}

// ----- INTERACTIONS AVEC LES CARRÉS -----
function handleSquareInteractions() {
  for (let i = squares.length - 1; i >= 0; i--) {
    let sq = squares[i];
    if (!sq.isCarried && !sq.isDeposited) {
      if (
        players[0].carryingSquareIndex === -1 &&
        checkCircleRectCollision(
          players[0].x,
          players[0].y,
          players[0].radius,
          sq.x,
          sq.y,
          sq.actualSize,
          sq.actualSize
        )
      ) {
        sq.isCarried = true;
        sq.carriedBy = "red";
        players[0].carryingSquareIndex = i;
        players[0].speed = players[0].baseSpeed / sq.speedDivisor;
      } else if (
        players[1].carryingSquareIndex === -1 &&
        checkCircleRectCollision(
          players[1].x,
          players[1].y,
          players[1].radius,
          sq.x,
          sq.y,
          sq.actualSize,
          sq.actualSize
        )
      ) {
        sq.isCarried = true;
        sq.carriedBy = "blue";
        players[1].carryingSquareIndex = i;
        players[1].speed = players[1].baseSpeed / sq.speedDivisor;
      }
    }
  }
}

// ----- FONCTION DE COLLISION CERCLE-RECTANGLE -----
function checkCircleRectCollision(
  circleX,
  circleY,
  circleR,
  rectX,
  rectY,
  rectW,
  rectH
) {
  let testX = circleX;
  let testY = circleY;
  if (circleX < rectX - rectW / 2) testX = rectX - rectW / 2;
  else if (circleX > rectX + rectW / 2) testX = rectX + rectW / 2;
  if (circleY < rectY - rectH / 2) testY = rectY - rectH / 2;
  else if (circleY > rectY + rectH / 2) testY = rectY + rectH / 2;
  let distX = circleX - testX;
  let distY = circleY - testY;
  return sqrt(distX * distX + distY * distY) <= circleR;
}

// ----- DESSIN DES ÉLÉMENTS -----
function drawScores() {
  fill(0);
  textSize(scoreDisplaySize);
  textAlign(LEFT, TOP);
  text("Zone G: " + scoreGauche, 20, 20);
  textAlign(RIGHT, TOP);
  text("Zone D: " + scoreDroit, width - 20, 20);
}

function displayTimer() {
  fill(0);
  textSize(scoreDisplaySize + 10);
  textAlign(CENTER, TOP);
  let minutes = floor(remainingTime / 60);
  let seconds = floor(remainingTime % 60);
  text(nf(minutes, 1) + ":" + nf(seconds, 2, 0), width / 2, 20);
}

function displayGameOverScreen() {
  fill(0, 0, 0, 180);
  rect(width / 2, height / 2, width, height);
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("TEMPS ÉCOULÉ !", width / 2, height / 2 - 150);
  fill(255);
  textSize(32);
  text("Score Joueur Rouge : " + players[0].score, width / 2, height / 2 - 50);
  text("Score Joueur Bleu : " + players[1].score, width / 2, height / 2);
  let totalEquipe = players[0].score + players[1].score;
  textSize(38);
  fill(255, 255, 0);
  text("Score Total Équipe : " + totalEquipe, width / 2, height / 2 + 70);
  textSize(24);
  fill(200);
  text(
    "Zone Gauche : " + scoreGauche + " | Zone Droite : " + scoreDroit,
    width / 2,
    height / 2 + 130
  );
  textSize(22);
  fill(255);
  text(
    "La partie va redémarrer dans " +
      floor((RESTART_DELAY_MS - (millis() - gameOverDisplayStartTime)) / 1000) +
      "s",
    width / 2,
    height - 50
  );
}

function drawDepositZones() {
  fill(depositZoneGauche.color);
  rect(
    depositZoneGauche.x,
    depositZoneGauche.y,
    depositZoneGauche.w,
    depositZoneGauche.h
  );
  fill(depositZoneDroit.color);
  rect(
    depositZoneDroit.x,
    depositZoneDroit.y,
    depositZoneDroit.w,
    depositZoneDroit.h
  );
}

// MODIFIÉ: Pour l'ordre de dessin des carrés
function drawSquares() {
  // Filtrer les carrés non portés et non déposés
  let squaresToDraw = [];
  for (let sq of squares) {
    if (!sq.isCarried && !sq.isDeposited) {
      squaresToDraw.push(sq);
    }
  }

  // Trier les carrés à dessiner: les plus gros d'abord, pour que les plus petits soient dessinés par-dessus
  squaresToDraw.sort((a, b) => b.actualSize - a.actualSize);

  // Dessiner les carrés triés
  for (let sq of squaresToDraw) {
    fill(squareColors[sq.typeName]);
    rect(sq.x, sq.y, sq.actualSize, sq.actualSize);
  }
}

function drawPlayers() {
  if (players[0].carryingSquareIndex !== -1) {
    fill(255, 255, 0);
  } else {
    fill(255, 0, 0);
  }
  circle(players[0].x, players[0].y, players[0].size);
  if (players[1].carryingSquareIndex !== -1) {
    fill(255, 255, 0);
  } else {
    fill(0, 0, 255);
  }
  circle(players[1].x, players[1].y, players[1].size);
}

// ----- REDIMENSIONNEMENT FENÊTRE -----
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  depositZoneGauche.x = depositZoneGauche.w / 2 + 20;
  depositZoneGauche.y = height - depositZoneGauche.h / 2 - 20;
  depositZoneDroit.x = width - depositZoneDroit.w / 2 - 20;
  depositZoneDroit.y = height - depositZoneDroit.h / 2 - 20;
  players[0].x = constrain(
    players[0].x,
    players[0].radius,
    width - players[0].radius
  );
  players[0].y = constrain(
    players[0].y,
    players[0].radius,
    height - players[0].radius
  );
  players[1].x = constrain(
    players[1].x,
    players[1].radius,
    width - players[1].radius
  );
  players[1].y = constrain(
    players[1].y,
    players[1].radius,
    height - players[1].radius
  );

  for (let sq of squares) {
    if (!sq.isCarried && !sq.isDeposited) {
      sq.x = constrain(sq.x, sq.actualSize / 2, width - sq.actualSize / 2);
      // On pourrait aussi contraindre Y si les carrés peuvent être poussés verticalement
      // sq.y = constrain(sq.y, sq.actualSize / 2, height - sq.actualSize /2);
    }
  }
}

function playersControler() {
  
}