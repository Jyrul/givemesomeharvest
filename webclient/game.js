let ws;
connect();

let joinCount = 0;
const NO_TEAM = 0;
const RED = 1;
const BLUE = 2;

const IDLE_TTL = 30;
const ITEM_MAX_COUNT = 40;
const ITEM_SPAWN_RATE = 3000;
const SPRITE_SIZE_MODIFIER = 0.2;
const ANIM_SIZE_MODIFIER = 2;

let mapsIndex = 0;

let players = {};
let sprites = {};
let screens = {};
let cars = [];
let maps = [];
let items;

const scores = {
  RED: 0,
  BLUE: 0,
};

const bounds = {
  itemSpawn: {
    x: 0.2,
    y: 0.12,
    width: 0.54,
    height: 0.21,
  },
  drops: [
    { team: RED, x: 0.26, y: 0.8, width: 0.09, height: 0.2 },
    { team: BLUE, x: 0.65, y: 0.8, width: 0.09, height: 0.2 },
  ],
};

function preload() {
  pixelFont = loadFont("fonts/PressStart2P.ttf"); // adapte le nom si besoin

  maps.push(loadImage("images/Map/Map_tete_de_mort.png"));
  maps.push(loadImage("images/Map/Map_usine.png"));

  sprites = {
    man: {
      idle: loadImage(
        "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_bouge_pas.png"
      ),
      up: loadImage(
        "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Haut.gif"
      ),
      down: loadImage(
        "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Bas.gif"
      ),
      left: loadImage(
        "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Gauche.gif"
      ),
      right: loadImage(
        "images/Demenageurs/normale/Demenageur_Breton_Sans_Coli_Droite.gif"
      ),
    },
    car: {
      left: [
        loadImage("images/Camaro/Camaro_Bleu_Gauche.png"),
        loadImage("images/Camaro/Camaro_Jaune_Gauche.png"),
        loadImage("images/Camaro/Camaro_Rouge_Gauche.png"),
        loadImage("images/Camaro/Camaro_Vert_Gauche.png"),
      ],
      right: [
        loadImage("images/Camaro/Camaro_Bleu_Droite.png"),
        loadImage("images/Camaro/Camaro_Jaune_Droite.png"),
        loadImage("images/Camaro/Camaro_Rouge_Droite.png"),
        loadImage("images/Camaro/Camaro_Vert_Droite.png"),
      ],
    },
    items: [
      [
        {
          itemSprite: loadImage("images/Meubles/petit colis/Chaise.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Chaise_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Chaise_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Chaise_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Chaise_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Chaise_Droite.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/petit colis/Colis_Petit.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Droite.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/petit colis/Colis_Petit2.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Bas2.gif"
            ),
            up: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Haut2.gif"
            ),
            down: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Bas2.gif"
            ),
            left: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Gauche2.gif"
            ),
            right: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Petit_Coli_Droite2.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/petit colis/Pouf.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Pouf_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Pouf_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Pouf_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Pouf_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/petit colis/Demenageur_Breton_Pouf_Droite.gif"
            ),
          },
        },
      ],
      [
        {
          itemSprite: loadImage("images/Meubles/moyen colis/Colis_Moyen.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Droite.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/moyen colis/Colis_Moyen2.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Bas2.gif"
            ),
            up: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Haut2.gif"
            ),
            down: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Bas2.gif"
            ),
            left: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Gauche2.gif"
            ),
            right: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Coli_Moyen_Droite2.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/moyen colis/Fragile.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Fragile_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Fragile_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Fragile_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Fragile_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/moyen colis/Demenageur_Breton_Fragile_Droite.gif"
            ),
          },
        },
      ],
      [
        {
          itemSprite: loadImage("images/Meubles/grand colis/Canap.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Canap_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Canap_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Canap_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Canap_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Canap_Droite.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/grand colis/Lave_Linge.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Lave_Linge_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Lave_Linge_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Lave_Linge_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Lave_Linge_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Lave_Linge_Droit.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/grand colis/Plante.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Plante_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Plante_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Plante_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Plante_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Plante_Droite.gif"
            ),
          },
        },
        {
          itemSprite: loadImage("images/Meubles/grand colis/Table.png"),
          carrierSprite: {
            idle: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Table_Bas.gif"
            ),
            up: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Table_Haut.gif"
            ),
            down: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Table_Bas.gif"
            ),
            left: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Table_Gauche.gif"
            ),
            right: loadImage(
              "images/Demenageurs/grand colis/Demenageur_Breton_Table_Droit.gif"
            ),
          },
        },
      ],
    ],
  };

  screens = {
    end: loadImage("images/Map/Ecran_resultats.png"),
  };
}

function setup() {
  imageMode(CENTER);
  const viewDimensions = document
    .querySelector("#viewArea")
    .getBoundingClientRect();
  createCanvas(viewDimensions.width, viewDimensions.height);

  items = new Array(ITEM_MAX_COUNT).fill(0).map(() => {
    const weight = Math.trunc(Math.random() * 3) + 1;
    const spriteCategory = sprites.items[weight - 1];
    const spriteIndex = Math.trunc(Math.random() * spriteCategory.length);
    const sprite = spriteCategory[spriteIndex];

    return {
      x: Math.random() * bounds.itemSpawn.width + bounds.itemSpawn.x,
      y: Math.random() * bounds.itemSpawn.height + bounds.itemSpawn.y,
      weight,
      held: false,
      active: false,
      sprite,
      _spriteCategory: spriteCategory,
      _spriteIndex: spriteIndex,
    };
  });
}

function draw() {
  // console.log(mouseX / width, mouseY / height);

  imageMode(CORNER);
  image(maps[mapsIndex], 0, 0, width, height);
  imageMode(CENTER);

  const liveGroundedItems = items.filter((item) => item.active && !item.held);

  // update loop
  Object.entries(players).forEach(([playerId, player]) => {
    player.x += player.vx * player.speed * player.speedModifier;
    player.y += player.vy * player.speed * player.speedModifier;

    liveGroundedItems.forEach((pickup) => {
      if (
        !player.carryItem &&
        dist(
          pickup.x * width,
          pickup.y * height,
          player.x * width,
          player.y * height
        ) < player.size
      ) {
        player.carryItem = pickup;
        pickup.held = true;
      }
    });

    // TODO
    // if (player.lastUpdate < Date.now() - IDLE_TTL) {
    //   delete players[playerId];
    // }
  });

  items.forEach((item) => {
    bounds.drops.forEach((drop) => {
      const dcx = (drop.x + drop.width * 0.5) * width;
      const dcy = (drop.y + drop.height * 0.5) * height;

      if (
        dist(dcx, dcy, item.x * width, item.y * height) <
        drop.width * width
      ) {
        switch (drop.team) {
          case RED:
            scores.RED += item.weight;
            break;
          case BLUE:
            scores.BLUE += item.weight;
            break;
        }

        item.active = false;
        item.x = -1;
        item.y = -1;
      }
    });
  });

  // render loop
  bounds.drops.forEach((spawn) => {
    fill(255, 255, 255, 255 * 0.3);
    noStroke();
    rect(
      spawn.x * width,
      spawn.y * height,
      spawn.width * width,
      spawn.height * height
    );
  });

  Object.values(players).forEach((player) => {
    const x = player.x * width - player.size;
    const y = player.y * height - player.size;

    if (!player.carryItem || !player.carryItem.held) {
      switch (true) {
        case player.vx == 0 && player.vy == 0:
          image(sprites.man.idle, x, y, player.size, player.size);
          break;
        case player.vx > 0 && player.vy == 0:
          image(sprites.man.right, x, y, player.size, player.size);
          break;
        case player.vx < 0 && player.vy == 0:
          image(sprites.man.left, x, y, player.size, player.size);
          break;
        case player.vx == 0 && player.vy < 0:
          image(sprites.man.up, x, y, player.size, player.size);
          break;
        case player.vx == 0 && player.vy > 0:
          image(sprites.man.down, x, y, player.size, player.size);
          break;
      }
    } else {
      switch (true) {
        case player.vx == 0 && player.vy == 0:
          image(
            player.carryItem.sprite.carrierSprite.idle,
            x,
            y,
            player.size * ANIM_SIZE_MODIFIER,
            player.size * ANIM_SIZE_MODIFIER
          );
          break;
        case player.vx > 0 && player.vy == 0:
          image(
            player.carryItem.sprite.carrierSprite.right,
            x,
            y,
            player.size * ANIM_SIZE_MODIFIER,
            player.size * ANIM_SIZE_MODIFIER
          );
          break;
        case player.vx < 0 && player.vy == 0:
          image(
            player.carryItem.sprite.carrierSprite.left,
            x,
            y,
            player.size * ANIM_SIZE_MODIFIER,
            player.size * ANIM_SIZE_MODIFIER
          );
          break;
        case player.vx == 0 && player.vy < 0:
          image(
            player.carryItem.sprite.carrierSprite.up,
            x,
            y,
            player.size * ANIM_SIZE_MODIFIER,
            player.size * ANIM_SIZE_MODIFIER
          );
          break;
        case player.vx == 0 && player.vy > 0:
          image(
            player.carryItem.sprite.carrierSprite.down,
            x,
            y,
            player.size * ANIM_SIZE_MODIFIER,
            player.size * ANIM_SIZE_MODIFIER
          );
          break;
      }
    }
  });

  items.forEach((item) => {
    if (item.active && !item.held) {
      image(
        item.sprite.itemSprite,
        item.x * width,
        item.y * height,
        item.sprite.itemSprite.width * SPRITE_SIZE_MODIFIER,
        item.sprite.itemSprite.height * SPRITE_SIZE_MODIFIER
      );
    }
  });

  push();
  textSize(32);
  stroke(0);
  strokeWeight(4);

  fill(255, 0, 0);
  text(scores.RED, width * 0.5 - 0.1 * width, 0.05 * height);

  fill(0, 0, 255);
  text(scores.BLUE, width * 0.5 + 0.1 * width, 0.05 * height);
  pop();
}

function windowResized() {
  const viewDimensions = document
    .querySelector("#viewArea")
    .getBoundingClientRect();
  resizeCanvas(viewDimensions.width, viewDimensions.height);
}

function connect() {
  ws = new WebSocket(`ws://${location.hostname}:8080`);

  ws.addEventListener("open", (ev) => {
    console.log("connected");
  });

  ws.addEventListener("close", (ev) => {
    ws = null;
    console.warn("connection closed");
    connect(); // try to reconnect
  });

  ws.addEventListener("message", async (ev) => {
    const [who, action, ...values] = (await ev.data.text()).split(",");

    // console.log({ who, action, values });

    if (who == "game") {
      return;
    }

    switch (action) {
      case "join":
        joinCount++;

        const id = joinCount;

        players[id] = {
          id: id,
          x: 0.5,
          y: 0.5,
          vx: 0,
          vy: 0,
          size: 50,
          speed: 0.001,
          speedModifier: 1,
          team: values[0],
          lastUpdate: Date.now(),
          carryItem: null,
          // carryItem: {
          // 	name:"frigo"
          // }
          score: 0,
        };

        send(`identify,${id},${values[1]}`);
        break;
      case "move":
        const [x, y] = values;
        players[who].vx = x;
        players[who].vy = y;
        players[who].lastUpdate = Date.now();
        break;
      case "dropItem":
        const player = players[who];
        const item = player.carryItem;
        // console.log({ player, item });
        if (player.carryItem) {
          player.carryItem.x = player.x;
          player.carryItem.y = player.y;
          player.carryItem = null;
          // console.log({ player, item });
        }
        break;
    }
  });
}

setInterval(() => {
  // not loaded yet
  // TODO put it in setup
  if (!items) {
    return;
  }

  for (let i = 0; i < items.length; i++) {
    if (!items[i].active) {
      const item = items[i];

      item.x = Math.random() * bounds.itemSpawn.width + bounds.itemSpawn.x;
      item.y = Math.random() * bounds.itemSpawn.height + bounds.itemSpawn.y;

      item.active = true;

      break;
    }
  }
}, ITEM_SPAWN_RATE);

function send(msg) {
  if (ws) {
    ws.send(`game,${msg}`);
  }
}
