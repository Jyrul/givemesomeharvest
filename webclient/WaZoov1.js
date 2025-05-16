// ----- VARIABLES GLOBALES -----
// Cercles Joueurs
let redCircleX, redCircleY, blueCircleX, blueCircleY;
let redSpeed, blueSpeed; // Vitesse actuelle, peut changer
let redBaseSpeed = 5,
  blueBaseSpeed = 5; // Vitesse de base
let circleSize = 50;
let circleRadius = circleSize / 2;

// Direction des joueurs
let redLastMoveDx = 0,
  redLastMoveDy = -1;
let blueLastMoveDx = 0,
  blueLastMoveDy = -1;

let redDirection = "idle";
let blueDirection = "idle";

let redLastDirection = "bas";
let blueLastDirection = "bas";

// Carrés marron
let squares = [];
let baseSquareSize = 20;
let maxSquaresOnScreen = 100;
let dropDistanceFactor; // Pour calculer où déposer le carré

const SQUARE_TYPES = {
  NORMAL: { points: 1, speedDivisor: 1, sizeMultiplier: 1, typeName: "NORMAL" },
  MOYEN: { points: 2, speedDivisor: 2, sizeMultiplier: 2, typeName: "MOYEN" },
  GRAND: { points: 3, speedDivisor: 3, sizeMultiplier: 3, typeName: "GRAND" },
};
let squareColors = {};

// Index des carrés portés (-1 si aucun)
let redCarryingSquareIndex = -1;
let blueCarryingSquareIndex = -1;

// Scores
let scoreGauche = 0;
let scoreDroit = 0;
let redPlayerScore = 0;
let bluePlayerScore = 0;
let scoreDisplaySize = 32;

// Zones de Dépôt
let depositZoneGauche = { x: 0, y: 0, w: 100, h: 50, color: null };
let depositZoneDroit = { x: 0, y: 0, w: 100, h: 50, color: null };

// Timer et état du jeu
let timerDuration = 2 * 60;
let startTime;
let remainingTime;
let gameState = "playing";
let gameOverDisplayStartTime = 0;
const RESTART_DELAY_MS = 7000;

// Positions de départ
let startOffsetX;
let startOffsetY;

// NOUVEAU: Pour le délai de spawn des boîtes
const SPAWN_DELAY = 2000; // 2 secondes en millisecondes
let lastSpawnTime = 0;

let greenVehicles = [];
let lastVehicleSpawn = 0;
const VEHICLE_SPAWN_INTERVAL = 1800; // ms
const VEHICLE_MIN_SPEED = 3;
const VEHICLE_MAX_SPEED = 7;
const ROAD_Y = () => height / 2; // Fonction pour la position verticale de la route
const ROAD_HEIGHT = 140; // Hauteur visuelle de la route (plus épais)
const VEHICLE_SPEED = 5; // Vitesse unique pour toutes les voitures

// Ajoute en haut :
let scoreGauchePos = { x: 175, y: 790 };
let scoreDroitPos = { x: 1230, y: 790 };

let nextVehicleSpawnTime = 0; // Ajoute cette variable

let mapTeteDeMortImg; // Image de fond
let endScreenImg;

let carImagesDroite = [];
let carImagesGauche = [];

let redIsDead = false;
let blueIsDead = false;
let redRespawnTime = 0;
let blueRespawnTime = 0;
const RESPAWN_DELAY = 1200; // ms (1.2 secondes)

let pointAnimations = [];

// Pour chaque direction et pour l'état "aucune direction"
let redGifs = {};
let blueGifs = {};

let pixelFont;

let grandColisImgs = [
  {
    img: null,
    w: 60,
    h: 60,
    path: "images/Meubles/grand colis/Colis_Gros.png",
  },
  { img: null, w: 64, h: 80, path: "images/Meubles/grand colis/Plante.png" },
  { img: null, w: 70, h: 90, path: "images/Meubles/grand colis/Frigo.png" },
];

let moyenColisImgs = [];

let chaiseImg;

let moyenColisImg, grandColisImg;

function preload() {
  pixelFont = loadFont("fonts/PressStart2P.ttf"); // adapte le nom si besoin
  mapTeteDeMortImg = loadImage("images/Map/Map_tete_de_mort.png");
  endScreenImg = loadImage("images/Map/Ecran_resultats.png");
  carImagesDroite = [
    loadImage("images/Camaro/Camaro_Bleu_Gauche.png"),
    loadImage("images/Camaro/Camaro_Jaune_Gauche.png"),
    loadImage("images/Camaro/Camaro_Rouge_Gauche.png"),
    loadImage("images/Camaro/Camaro_Vert_Gauche.png"),
  ];
  carImagesGauche = [
    loadImage("images/Camaro/Camaro_Bleu_Droite.png"),
    loadImage("images/Camaro/Camaro_Jaune_Droite.png"),
    loadImage("images/Camaro/Camaro_Rouge_Droite.png"),
    loadImage("images/Camaro/Camaro_Vert_Droite.png"),
  ];

  // Rouge (et bleu, même gifs si tu veux)
  redGifs = {
    haut: loadImage(
      "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Haut.gif"
    ),
    bas: loadImage(
      "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Bas.gif"
    ),
    gauche: loadImage(
      "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Gauche.gif"
    ),
    droite: loadImage(
      "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Droite.gif"
    ),
    idle: loadImage(
      "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_bouge_pas.png"
    ),
  };
  blueGifs = redGifs; // Si tu veux les mêmes pour bleu, sinon dupliques et changes les chemins
  chaiseImg = loadImage("images/Meubles/petit colis/Chaise.png");
  moyenColisImg = loadImage("images/Meubles/moyen colis/Colis_Moyen2.png");
  grandColisImg = loadImage("images/Meubles/grand colis/Colis_Gros.png");
  for (let obj of grandColisImgs) {
    obj.img = loadImage(obj.path);
  }
}

// ----- SETUP -----
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);

  redSpeed = redBaseSpeed;
  blueSpeed = blueBaseSpeed;

  squareColors[SQUARE_TYPES.NORMAL.typeName] = color(139, 69, 19);
  squareColors[SQUARE_TYPES.MOYEN.typeName] = color(160, 82, 45);
  squareColors[SQUARE_TYPES.GRAND.typeName] = color(210, 105, 30);

  let zoneColor = color(255, 255, 0, 70);

  depositZoneGauche.w = 80;
  depositZoneGauche.h = 80;
  depositZoneGauche.x = 450;
  depositZoneGauche.y = 800; // En haut à gauche
  depositZoneGauche.color = zoneColor;

  depositZoneDroit.w = 80;
  depositZoneDroit.h = 80;
  depositZoneDroit.x = 1080;
  depositZoneDroit.y = 800; // En haut à droite
  depositZoneDroit.color = zoneColor;

  startOffsetX = 150;
  startOffsetY = 150;

  resetGame();
}

// ----- RESET GAME -----
function resetGame() {
  scoreGauche = 0;
  scoreDroit = 0;
  redPlayerScore = 0;
  bluePlayerScore = 0;

  redCircleX = circleRadius + startOffsetX;
  redCircleY = height - circleRadius - startOffsetY;
  blueCircleX = width - circleRadius - startOffsetX;
  blueCircleY = height - circleRadius - startOffsetY;

  redSpeed = redBaseSpeed;
  blueSpeed = blueBaseSpeed;

  redLastMoveDx = 0;
  redLastMoveDy = -1;
  blueLastMoveDx = 0;
  blueLastMoveDy = -1;

  redCarryingSquareIndex = -1;
  blueCarryingSquareIndex = -1;

  squares = [];

  startTime = millis();
  gameState = "playing";
  gameOverDisplayStartTime = 0;
  remainingTime = timerDuration;
  lastSpawnTime = millis() - SPAWN_DELAY; // Permet un premier spawn potentiellement immédiat après reset
  nextVehicleSpawnTime = millis() + 2000;
}

// ----- SPAWN NEW SQUARE -----
function trySpawnNewSquare() {
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

    // Taille augmentée de 10 en 10 selon le type
    let newActualSize =
      baseSquareSize * type.sizeMultiplier +
      (type.typeName === "NORMAL" ? 0 : type.typeName === "MOYEN" ? 10 : 20);

    let spawnX = random(width / 2 - width / 6, width / 2 + width / 6);
    let spawnY = random(height / 2 - 100, height / 2 + 100) - 200;

    let img = null;
    let w = undefined,
      h = undefined;

    if (type.typeName === "GRAND") {
      let choix = random(grandColisImgs);
      img = choix.img;
      w = choix.w;
      h = choix.h;
    } else if (type.typeName === "MOYEN") {
      img = moyenColisImg;
      w = 50;
      h = 50;
    } else if (type.typeName === "NORMAL") {
      img = chaiseImg;
      w = 40;
      h = 40;
    }

    squares.push({
      x: spawnX,
      y: spawnY,
      actualSize: newActualSize,
      points: type.points,
      speedDivisor: type.speedDivisor,
      typeName: type.typeName,
      isCarried: false,
      carriedBy: null,
      isDeposited: false,
      vx: 0,
      vy: 0,
      isMoving: false,
      img: img,
      customW: w,
      customH: h,
    });
    lastSpawnTime = millis();
  }
}

function draw() {
  if (mapTeteDeMortImg) {
    image(mapTeteDeMortImg, 0, 0, width, height);
  } else {
    background(200);
  }

  textFont(pixelFont);

  if (gameState === "playing") {
    trySpawnNewSquare();
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

  updateMovingSquares(); // <-- Ajoute ceci ici

  drawSquares();
  handleGreenVehicles();
  drawGreenVehicles();

  // Gestion du respawn
  if (redIsDead && millis() > redRespawnTime) {
    // Respawn dans la zone jaune de gauche (corrigé)
    redCircleX = depositZoneGauche.x;
    redCircleY = depositZoneGauche.y;
    redIsDead = false;
  }
  if (blueIsDead && millis() > blueRespawnTime) {
    // Respawn dans la zone jaune de droite (corrigé)
    blueCircleX = depositZoneDroit.x;
    blueCircleY = depositZoneDroit.y;
    blueIsDead = false;
  }

  drawScores();
  drawPointAnimations();
  drawPlayers();
  displayTimer();

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
  if (redCarryingSquareIndex !== -1) {
    let sq = squares[redCarryingSquareIndex];
    let depositedThisFrame = false;

    if (
      redCircleX > depositZoneGauche.x - depositZoneGauche.w / 2 &&
      redCircleX < depositZoneGauche.x + depositZoneGauche.w / 2 &&
      redCircleY > depositZoneGauche.y - depositZoneGauche.h / 2 &&
      redCircleY < depositZoneGauche.y + depositZoneGauche.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreGauche += sq.points;
      redPlayerScore += sq.points;
      pointAnimations.push({
        x: scoreGauchePos.x + 40, // Ajuste selon la position de ton score
        y: scoreGauchePos.y,
        value: "+" + sq.points,
        color: color(255, 215, 0),
        alpha: 255,
        vy: -1.2,
      });
      depositedThisFrame = true;
      redSpeed = redBaseSpeed;
      redCarryingSquareIndex = -1;
    }

    if (
      !depositedThisFrame &&
      redCarryingSquareIndex !== -1 &&
      redCircleX > depositZoneDroit.x - depositZoneDroit.w / 2 &&
      redCircleX < depositZoneDroit.x + depositZoneDroit.w / 2 &&
      redCircleY > depositZoneDroit.y - depositZoneDroit.h / 2 &&
      redCircleY < depositZoneDroit.y + depositZoneDroit.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreDroit += sq.points;
      redPlayerScore += sq.points;
      redSpeed = redBaseSpeed;
      redCarryingSquareIndex = -1;
    }
  }

  // --- Joueur Bleu ---
  if (blueCarryingSquareIndex !== -1) {
    let sq = squares[blueCarryingSquareIndex];
    let depositedThisFrame = false;

    if (
      blueCircleX > depositZoneGauche.x - depositZoneGauche.w / 2 &&
      blueCircleX < depositZoneGauche.x + depositZoneGauche.w / 2 &&
      blueCircleY > depositZoneGauche.y - depositZoneGauche.h / 2 &&
      blueCircleY < depositZoneGauche.y + depositZoneGauche.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreGauche += sq.points;
      bluePlayerScore += sq.points;
      depositedThisFrame = true;
      blueSpeed = blueBaseSpeed;
      blueCarryingSquareIndex = -1;
    }

    if (
      !depositedThisFrame &&
      blueCarryingSquareIndex !== -1 &&
      blueCircleX > depositZoneDroit.x - depositZoneDroit.w / 2 &&
      blueCircleX < depositZoneDroit.x + depositZoneDroit.w / 2 &&
      blueCircleY > depositZoneDroit.y - depositZoneDroit.h / 2 &&
      blueCircleY < depositZoneDroit.y + depositZoneDroit.h / 2
    ) {
      sq.isCarried = false;
      sq.carriedBy = null;
      sq.isDeposited = true;
      scoreDroit += sq.points;
      bluePlayerScore += sq.points;
      pointAnimations.push({
        x: scoreDroitPos.x + 40,
        y: scoreDroitPos.y,
        value: "+" + sq.points,
        color: color(255, 215, 0),
        alpha: 255,
        vy: -1.2,
      });
      blueSpeed = blueBaseSpeed;
      blueCarryingSquareIndex = -1;
    }
  }
}

// ----- GESTION DES TOUCHES APPUYÉES (ACTION UNIQUE) -----
function keyPressed() {
  // Déposer pour le joueur Rouge (touche E)
  if ((key === "e" || key === "E") && redCarryingSquareIndex !== -1) {
    let sq = squares[redCarryingSquareIndex];
    sq.isCarried = false;
    sq.carriedBy = null;

    let force = 18 / sq.speedDivisor;
    sq.vx = redLastMoveDx * force;
    sq.vy = redLastMoveDy * force;
    sq.isMoving = true;

    let w = sq.displayW || sq.actualSize;
    let h = sq.displayH || sq.actualSize;
    dropDistanceFactor = circleRadius + w / 2 + 5;
    sq.x = redCircleX + redLastMoveDx * dropDistanceFactor;
    sq.y = redCircleY + redLastMoveDy * dropDistanceFactor;
    sq.x = constrain(sq.x, w / 2, width - w / 2);
    sq.y = constrain(sq.y, h / 2, height - h / 2);

    redSpeed = redBaseSpeed;
    redCarryingSquareIndex = -1;
  }

  // Déposer pour le joueur Bleu (touche P)
  if ((key === "p" || key === "P") && blueCarryingSquareIndex !== -1) {
    let sq = squares[blueCarryingSquareIndex];
    sq.isCarried = false;
    sq.carriedBy = null;

    let force = 18 / sq.speedDivisor;
    sq.vx = blueLastMoveDx * force;
    sq.vy = blueLastMoveDy * force;
    sq.isMoving = true;

    let w = sq.displayW || sq.actualSize;
    let h = sq.displayH || sq.actualSize;
    dropDistanceFactor = circleRadius + w / 2 + 5;
    sq.x = blueCircleX + blueLastMoveDx * dropDistanceFactor;
    sq.y = blueCircleY + blueLastMoveDy * dropDistanceFactor;
    sq.x = constrain(sq.x, w / 2, width - w / 2);
    sq.y = constrain(sq.y, h / 2, height - h / 2);

    blueSpeed = blueBaseSpeed;
    blueCarryingSquareIndex = -1;
  }
}

// ----- GESTION DES ENTRÉES JOUEURS -----
function handlePlayerInput() {
  // --- ROUGE ---
  if (!redIsDead) {
    let redIntentX = 0;
    let redIntentY = 0;
    if (keyIsDown(90)) {
      redIntentY = -1;
      redDirection = "haut";
    } // Z
    else if (keyIsDown(83)) {
      redIntentY = 1;
      redDirection = "bas";
    } // S
    else if (keyIsDown(81)) {
      redIntentX = -1;
      redDirection = "gauche";
    } // Q
    else if (keyIsDown(68)) {
      redIntentX = 1;
      redDirection = "droite";
    } // D
    else {
      redDirection = "idle";
    }

    // Priorité à l'axe X
    if (redIntentX !== 0) {
      redIntentY = 0;
    }

    if (redIntentX !== 0 || redIntentY !== 0) {
      redCircleX += redIntentX * redSpeed;
      redCircleY += redIntentY * redSpeed;
      redLastMoveDx = redIntentX;
      redLastMoveDy = redIntentY;
    }
    redCircleX = constrain(redCircleX, circleRadius, width - circleRadius);
    redCircleY = constrain(redCircleY, circleRadius, height - circleRadius);
  } else {
    redDirection = "idle";
  }

  // --- BLEU ---
  if (!blueIsDead) {
    let blueIntentX = 0;
    let blueIntentY = 0;
    if (keyIsDown(79)) {
      blueIntentY = -1;
      blueDirection = "haut";
    } // O
    else if (keyIsDown(76)) {
      blueIntentY = 1;
      blueDirection = "bas";
    } // L
    else if (keyIsDown(75)) {
      blueIntentX = -1;
      blueDirection = "gauche";
    } // K
    else if (keyIsDown(77)) {
      blueIntentX = 1;
      blueDirection = "droite";
    } // M
    else {
      blueDirection = "idle";
    }

    if (blueIntentX !== 0) {
      blueIntentY = 0;
    }

    if (blueIntentX !== 0 || blueIntentY !== 0) {
      blueCircleX += blueIntentX * blueSpeed;
      blueCircleY += blueIntentY * blueSpeed;
      blueLastMoveDx = blueIntentX;
      blueLastMoveDy = blueIntentY;
    }
    blueCircleX = constrain(blueCircleX, circleRadius, width - circleRadius);
    blueCircleY = constrain(blueCircleY, circleRadius, height - circleRadius);
  } else {
    blueDirection = "idle";
  }
}

// ----- COLLISION ENTRE JOUEURS -----
function resolvePlayerCollision() {
  let distanceVal = dist(redCircleX, redCircleY, blueCircleX, blueCircleY);
  let overlap = circleSize - distanceVal;

  if (overlap > 0 && distanceVal > 0) {
    let dx = blueCircleX - redCircleX;
    let dy = blueCircleY - redCircleY;
    let normalX = dx / distanceVal;
    let normalY = dy / distanceVal;
    redCircleX -= normalX * (overlap / 2);
    redCircleY -= normalY * (overlap / 2);
    blueCircleX += normalX * (overlap / 2);
    blueCircleY += normalY * (overlap / 2);
    redCircleX = constrain(redCircleX, circleRadius, width - circleRadius);
    redCircleY = constrain(redCircleY, circleRadius, height - circleRadius);
    blueCircleX = constrain(blueCircleX, circleRadius, width - circleRadius);
    blueCircleY = constrain(blueCircleY, circleRadius, height - circleRadius);
  } else if (distanceVal === 0) {
    redCircleX += random(-1, 1);
    redCircleY += random(0, 1);
    blueCircleX += random(-1, 1);
    blueCircleY += random(-1, 0);
  }
}

// ----- INTERACTIONS AVEC LES CARRÉS -----
function handleSquareInteractions() {
  for (let i = squares.length - 1; i >= 0; i--) {
    let sq = squares[i];
    if (!sq.isCarried && !sq.isDeposited) {
      let w = sq.displayW || sq.actualSize;
      let h = sq.displayH || sq.actualSize;
      if (
        redCarryingSquareIndex === -1 &&
        checkCircleRectCollision(
          redCircleX,
          redCircleY,
          circleRadius,
          sq.x,
          sq.y,
          w,
          h
        )
      ) {
        sq.isCarried = true;
        sq.carriedBy = "red";
        redCarryingSquareIndex = i;
        redSpeed = redBaseSpeed / sq.speedDivisor;
      } else if (
        blueCarryingSquareIndex === -1 &&
        checkCircleRectCollision(
          blueCircleX,
          blueCircleY,
          circleRadius,
          sq.x,
          sq.y,
          w,
          h
        )
      ) {
        sq.isCarried = true;
        sq.carriedBy = "blue";
        blueCarryingSquareIndex = i;
        blueSpeed = blueBaseSpeed / sq.speedDivisor;
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
  text("pts " + scoreGauche, scoreGauchePos.x, scoreGauchePos.y);
  textAlign(LEFT, TOP);
  text("pts " + scoreDroit, scoreDroitPos.x, scoreDroitPos.y);
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
  // Affiche l'image de fond de l'écran de fin
  if (endScreenImg) {
    image(endScreenImg, 0, 0, width, height);
  } else {
    fill(0, 0, 0, 180);
    rect(width / 2, height / 2, width, height);
  }
  textSize(64);
  textAlign(CENTER, CENTER);
  text("", width / 2, height / 2 - 120);

  // Scores d'équipe centrés et en jaune
  textSize(48);
  fill(255, 255, 0);
  text("Équipe Rouge : " + scoreGauche, width / 2, height / 2 - 20);
  text("Équipe Bleue : " + scoreDroit, width / 2, height / 2 + 40);

  // Timer de redémarrage
  textSize(28);
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
  let squaresToDraw = [];
  for (let sq of squares) {
    if (!sq.isCarried && !sq.isDeposited) {
      squaresToDraw.push(sq);
    }
  }
  squaresToDraw.sort((a, b) => b.actualSize - a.actualSize);

  for (let sq of squaresToDraw) {
    let w = sq.actualSize;
    let h = sq.actualSize;

    if (sq.typeName === "GRAND" && sq.customW && sq.customH) {
      w = sq.customW;
      h = sq.customH;
    } else if (sq.typeName === "MOYEN") {
      w = 50;
      h = 50;
    } else if (sq.typeName === "NORMAL") {
      w = 40;
      h = 40;
    }

    sq.displayW = w;
    sq.displayH = h;

    if (sq.img) {
      push();
      imageMode(CENTER);
      image(sq.img, sq.x, sq.y, w, h);
      pop();
    } else {
      fill(squareColors[sq.typeName]);
      rect(sq.x, sq.y, w, h);
    }
  }
}

function drawPlayers() {
  let sizeW = 80,
    sizeH = 80; // 90 - 2 = 88

  if (!redIsDead) {
    let gifToShow;
    let angle = 0;
    if (redDirection === "idle") {
      gifToShow = redGifs["idle"];
      if (redLastDirection === "haut") angle = 0;
      else if (redLastDirection === "droite") angle = HALF_PI;
      else if (redLastDirection === "bas") angle = PI;
      else if (redLastDirection === "gauche") angle = -HALF_PI;
    } else {
      gifToShow = redGifs[redDirection];
      redLastDirection = redDirection;
    }
    push();
    translate(redCircleX, redCircleY);
    rotate(angle);
    imageMode(CENTER);
    image(gifToShow, 0, 0, sizeW, sizeH);
    pop();
  }

  if (!blueIsDead) {
    let gifToShow;
    let angle = 0;
    if (blueDirection === "idle") {
      gifToShow = blueGifs["idle"];
      if (blueLastDirection === "haut") angle = 0;
      else if (blueLastDirection === "droite") angle = HALF_PI;
      else if (blueLastDirection === "bas") angle = PI;
      else if (blueLastDirection === "gauche") angle = -HALF_PI;
    } else {
      gifToShow = blueGifs[blueDirection];
      blueLastDirection = blueDirection;
    }
    push();
    translate(blueCircleX, blueCircleY);
    rotate(angle);
    imageMode(CENTER);
    image(gifToShow, 0, 0, sizeW, sizeH);
    pop();
  }
}

function handleGreenVehicles() {
  // Spawn d'un nouveau véhicule à intervalle aléatoire (jamais plus rapide que 2 sec)
  if (millis() > nextVehicleSpawnTime) {
    let vehicleHeight = random(30, 50);
    let vehicleWidth = random(60, 120);

    // Bande du haut (droite -> gauche)
    let laneYTop = ROAD_Y() - ROAD_HEIGHT / 4 - 10; // Remonté de 10 pixels
    greenVehicles.push({
      x: width + vehicleWidth / 2,
      y: laneYTop,
      w: vehicleWidth,
      h: vehicleHeight,
      speed: -VEHICLE_SPEED,
      hasHitRed: false,
      hasHitBlue: false,
      img: random(carImagesGauche), // <-- image aléatoire gauche
    });

    // Bande du bas (gauche -> droite)
    let laneYBot = ROAD_Y() + ROAD_HEIGHT / 4 - 10; // Remonté de 10 pixels
    greenVehicles.push({
      x: -vehicleWidth / 2,
      y: laneYBot,
      w: vehicleWidth,
      h: vehicleHeight,
      speed: VEHICLE_SPEED,
      hasHitRed: false,
      hasHitBlue: false,
      img: random(carImagesDroite), // <-- image aléatoire droite
    });
    // Prochain spawn dans 2 à 4 secondes
    nextVehicleSpawnTime = millis() + random(2000, 4000);
  }

  // Déplacement, suppression et collision avec joueurs
  const CAR_W = 150;
  const CAR_H = 35;

  for (let i = greenVehicles.length - 1; i >= 0; i--) {
    let v = greenVehicles[i];
    v.x += v.speed;

    // Collision avec joueur rouge (1 seule fois)
    if (
      !v.hasHitRed &&
      !redIsDead &&
      // Collision cercle-rectangle avec la taille exacte de la voiture
      checkCircleRectCollision(
        redCircleX,
        redCircleY,
        circleRadius,
        v.x,
        v.y,
        CAR_W,
        CAR_H
      )
    ) {
      if (redCarryingSquareIndex !== -1) {
        squares[redCarryingSquareIndex].isCarried = false;
        squares[redCarryingSquareIndex].carriedBy = null;
        squares.splice(redCarryingSquareIndex, 1);
        redCarryingSquareIndex = -1;
        redSpeed = redBaseSpeed;
      }
      redIsDead = true;
      redRespawnTime = millis() + RESPAWN_DELAY;
      v.hasHitRed = true;
    }

    // Collision avec joueur bleu (1 seule fois)
    if (
      !v.hasHitBlue &&
      !blueIsDead &&
      checkCircleRectCollision(
        blueCircleX,
        blueCircleY,
        circleRadius,
        v.x,
        v.y,
        CAR_W,
        CAR_H
      )
    ) {
      if (blueCarryingSquareIndex !== -1) {
        squares[blueCarryingSquareIndex].isCarried = false;
        squares[blueCarryingSquareIndex].carriedBy = null;
        squares.splice(blueCarryingSquareIndex, 1);
        blueCarryingSquareIndex = -1;
        blueSpeed = blueBaseSpeed;
      }
      blueIsDead = true;
      blueRespawnTime = millis() + RESPAWN_DELAY;
      v.hasHitBlue = true;
    }

    // Suppression si hors écran
    if (
      (v.speed < 0 && v.x + v.w / 2 < 0) ||
      (v.speed > 0 && v.x - v.w / 2 > width)
    ) {
      greenVehicles.splice(i, 1);
    }
  }
}

function drawGreenVehicles() {
  const CAR_W = 150;
  const CAR_H = 35;
  for (let v of greenVehicles) {
    if (v.img) {
      image(v.img, v.x - CAR_W / 2, v.y - CAR_H / 2, CAR_W, CAR_H);
    } else {
      fill(0, 200, 0);
      rect(v.x, v.y, CAR_W, CAR_H, 10);
    }
  }
}

// ----- REDIMENSIONNEMENT FENÊTRE -----
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  depositZoneGauche.x = -80;
  depositZoneGauche.y = -80; // En haut à gauche
  depositZoneDroit.x = 80;
  depositZoneDroit.y = 80; // En haut à droite
  redCircleX = constrain(redCircleX, circleRadius, width - circleRadius);
  redCircleY = constrain(redCircleY, circleRadius, height - circleRadius);
  blueCircleX = constrain(blueCircleX, circleRadius, width - circleRadius);
  blueCircleY = constrain(blueCircleY, circleRadius, height - circleRadius);

  for (let sq of squares) {
    if (!sq.isCarried && !sq.isDeposited) {
      sq.x = constrain(sq.x, sq.actualSize / 2, width - sq.actualSize / 2);
      // On pourrait aussi contraindre Y si les carrés peuvent être poussés verticalement
      // sq.y = constrain(sq.y, sq.actualSize / 2, height - sq.actualSize /2);
    }
  }
}

function updateMovingSquares() {
  for (let sq of squares) {
    if (sq.isMoving && !sq.isCarried && !sq.isDeposited) {
      sq.x += sq.vx;
      sq.y += sq.vy;
      // Friction
      sq.vx *= 0.92;
      sq.vy *= 0.92;
      // Stop si très lent
      if (abs(sq.vx) < 0.2 && abs(sq.vy) < 0.2) {
        sq.vx = 0;
        sq.vy = 0;
        sq.isMoving = false;
      }
      // Contrainte aux bords
      sq.x = constrain(sq.x, sq.actualSize / 2, width - sq.actualSize / 2);
      sq.y = constrain(sq.y, sq.actualSize / 2, height - sq.actualSize / 2);
    }
  }
}

function drawPointAnimations() {
  textAlign(LEFT, BOTTOM);
  textSize(32);
  for (let i = pointAnimations.length - 1; i >= 0; i--) {
    let anim = pointAnimations[i];
    fill(red(anim.color), green(anim.color), blue(anim.color), anim.alpha);
    text(anim.value, anim.x, anim.y);
    anim.y += anim.vy;
    anim.alpha -= 4;
    if (anim.alpha <= 0) {
      pointAnimations.splice(i, 1);
    }
  }
}
