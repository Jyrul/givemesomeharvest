let redCircleX;
let redCircleY;
let redSpeed = 5; // Vitesse de déplacement

// Variables globales pour le cercle bleu
let blueCircleX;
let blueCircleY;
let blueSpeed = 5; // Vitesse de déplacement

let circleSize = 50; // Diamètre des cercles
let circleRadius = circleSize / 2; // Rayon, utile pour les calculs

// Variable pour savoir si les cercles se touchent (on peut garder pour la couleur)
let colliding = false;

// La fonction setup() est exécutée une seule fois au début
function setup() {
  createCanvas(windowWidth, windowHeight);

  let startOffsetX = 100;
  let startOffsetY = 100;

  // Position initiale du cercle rouge (décalé)
  redCircleX = circleRadius + startOffsetX;
  redCircleY = height - circleRadius - startOffsetY;

  // Position initiale du cercle bleu (décalé)
  blueCircleX = width - circleRadius + startOffsetX;
  blueCircleY = height - circleRadius - startOffsetY;

  noStroke();
}

// La fonction draw() est exécutée en boucle
function draw() {
  background(200);

  // --- Gestion des contrôles (Met à jour les positions) ---
  handleRedCircleInput();
  handleBlueCircleInput();

  // --- DÉTECTION ET RÉSOLUTION DE COLLISION PHYSIQUE ---
  let distance = dist(redCircleX, redCircleY, blueCircleX, blueCircleY);
  let overlap = circleSize - distance; // Combien ils se chevauchent (diamètre - distance)

  // S'il y a chevauchement (overlap > 0)
  if (overlap > 0 && distance > 0) { // distance > 0 pour éviter division par zéro s'ils sont superposés
    colliding = true; // Ils se touchent

    // 1. Calculer le vecteur entre les centres (de rouge vers bleu)
    let dx = blueCircleX - redCircleX;
    let dy = blueCircleY - redCircleY;

    // 2. Normaliser le vecteur (obtenir la direction pure, longueur de 1)
    let normalX = dx / distance;
    let normalY = dy / distance;

    // 3. Repousser chaque cercle de la moitié du chevauchement
    //    le long de la ligne qui les relie (normale)
    //    Le rouge est poussé dans la direction opposée (-normalX, -normalY)
    //    Le bleu est poussé dans la direction de la normale (normalX, normalY)
    redCircleX -= normalX * (overlap / 2);
    redCircleY -= normalY * (overlap / 2);
    blueCircleX += normalX * (overlap / 2);
    blueCircleY += normalY * (overlap / 2);

    // 4. S'assurer qu'ils ne sortent pas de l'écran à cause de la poussée
    redCircleX = constrain(redCircleX, circleRadius, width - circleRadius);
    redCircleY = constrain(redCircleY, circleRadius, height - circleRadius);
    blueCircleX = constrain(blueCircleX, circleRadius, width - circleRadius);
    blueCircleY = constrain(blueCircleY, circleRadius, height - circleRadius);

  } else if (distance === 0) {
      // Cas très rare où ils sont exactement au même endroit:
      // les séparer arbitrairement un peu pour éviter les blocages
      redCircleX += random(-1, 1);
      blueCircleX += random(-1, 1);
      colliding = true;
  } else {
    colliding = false; // Pas de collision/chevauchement
  }
  // --- FIN DÉTECTION ET RÉSOLUTION ---


  // --- Dessin des cercles ---
  // On peut toujours utiliser 'colliding' pour changer la couleur au moment du contact
  if (colliding) {
    fill(255, 0, 0); // Jaune pendant le contact/chevauchement résolu // Rouge normal
  }
  ellipse(redCircleX, redCircleY, circleSize, circleSize);

  // Pour le bleu
  if (colliding) {
    fill(255, 255, 0); // Jaune
  }
  ellipse(blueCircleX, blueCircleY, circleSize, circleSize);
}

// Fonction pour gérer les entrées du cercle rouge (ZQSD)
function handleRedCircleInput() {
  if (keyIsDown(90)) { // Z (Haut)
    redCircleY -= redSpeed;
  }
  if (keyIsDown(83)) { // S (Bas)
    redCircleY += redSpeed;
  }
  if (keyIsDown(81)) { // Q (Gauche)
    redCircleX -= redSpeed;
  }
  if (keyIsDown(68)) { // D (Droite)
    redCircleX += redSpeed;
  }

  // Contrainte pour rester dans l'écran (importante AVANT la résolution de collision)
  redCircleX = constrain(redCircleX, circleRadius, width - circleRadius);
  redCircleY = constrain(redCircleY, circleRadius, height - circleRadius);
}

// Fonction pour gérer les entrées du cercle bleu (OKLM)
function handleBlueCircleInput() {
  if (keyIsDown(79)) { // O (Haut)
    blueCircleY -= blueSpeed;
  }
  if (keyIsDown(76)) { // L (Bas)
    blueCircleY += blueSpeed;
  }
  if (keyIsDown(75)) { // K (Gauche)
    blueCircleX -= blueSpeed;
  }
  if (keyIsDown(77)) { // M (Droite)
    blueCircleX += blueSpeed;
  }

  // Contrainte pour rester dans l'écran
  blueCircleX = constrain(blueCircleX, circleRadius, width - circleRadius);
  blueCircleY = constrain(blueCircleY, circleRadius, height - circleRadius);
}

// --- Redimensionnement de la fenêtre ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // On pourrait avoir besoin de repositionner/vérifier les cercles ici
  // si le redimensionnement cause des chevauchements ou des sorties d'écran.
}