let players = [];

let features = [];

function setup () {
  createCanvas(600, 600);

  players = [
    {x: 50, y: 50, speedX: 1, speedY: 1, size: 20, take: false},
    {x: 50, y: 100, speedX: 1, speedY: 1, size: 20, take: false},
    {x: 100, y: 100, speedX: 1, speedY: 1, size: 20, take: false},
    {x: 100, y: 50, speedX: 1, speedY: 1, size: 20, take: false}
  ];

  features = [
    {x: 300, y: 300, speedX: 0, speedY: 0, size: 10, tekken: false}
  ];
}

function draw() {
  background(100);

  //Dessiner le joueur
  fill(200);
  circle(players[0].x, players[0].y, players[0].size);

  //Déplacer le joueur
  players.forEach((item, index, players) => {
    playersControler(item.x, item.y, item.speedX, item.speedY);
  });
  
  //Dessiner les bagages
  fill(100, 255, 255),
  circle(features[index].x, features[index].y, features[index].size);
    
  let distanceForTake = players[0].size + features[index].size;
  checkCollisionForFeatures(players[0].x, players[0].y, features[0].x, features[0].y, distanceForTake);
}

function checkCollisionForFeatures(pX, pY, fX, fY, range) {
  if (dist(pX, pY, fX, fY) < range) {
    features[index].take = 0;
  }
}

function playersControler(x, y, speedX, speedY) {
  if (keyIsDown(UP_ARROW)) {
    players[0].y -= speedY;
  } else if (keyIsDown(DOWN_ARROW)) {
    players[0].y += speedY;
  }else if (keyIsDown(RIGHT_ARROW)) {
    players[0].x += speedX;
  } else if (keyIsDown(LEFT_ARROW)) {
    players[0].x -= speedX;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}