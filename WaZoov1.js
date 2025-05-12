let tuile = {
  size : 30, //size of a tuile's side
  column : 0, //column where a tuile is
  line : 0, //line where a tuile is
  number : 40, //number of tuile in the game
  position : {
    heightBtwScreen : 60, //height distance between left screen side and tuiles
    widthBtwScreen : 60, //width distance between left screen side and tuiles
    heightBtwTuiles : 20, //height distance between each tuiles
    widthBtwTuiles : 80, //width distance between each tuiles
  },
  win : {
    happend : false,
    rang : 0,
    side : "",
  },
}

let Tuile_Combinaison = []

let dice = 0;

let players = {
  size : 20,
  number : 1,
  spawn_j1 : {
    x : 40,
    y : 40,
  },
  spawn_j2 : {
    x : 60,
    y : 30,
  },
  spawn_j3 : {
    x : 80,
    y : 40,
  },
  spawn_j4 : {
    x : 100,
    y : 30,
  },
}

let j_position = [
  [40, 40, 0, ""],
  [60, 30, 0, ""],
  [80, 40, 0, ""],
  [100, 30, 0, ""],
] //x, y, ligne, left or right

function setup () {
  createCanvas(600, 600);

  //define Tuile_Combinaison
  for (let index = 0; index < tuile.number; index++) {
    let state = random(0, 1);
    if(state >= 0.5){
      append(Tuile_Combinaison, "right"); //have to go right
    }else{
      append(Tuile_Combinaison, "left"); //have to go left
    }
  }

  console.log(Tuile_Combinaison);
}

function draw () {
  //background
  fill(200, 200, 200);
  rect(0, 0, width, height);

  //draw tuile
  tuile.column = 0;
  tuile.line = 0;
  stroke(0, 0, 0);
  for (let index = 0; index < tuile.number; index++) {
      //Left cases
    fill(50, 50, 50);
      //win ?
    if(tuile.win.happend == true){
      //where ? → change the color of the case you are
      if(index == j_position[0][2] - 1 && j_position[0][3] == "left"){
        fill(100, 255, 100);
      }
    }
    rect(
      tuile.position.widthBtwScreen + tuile.size*2*tuile.column + tuile.position.widthBtwTuiles*tuile.column,
      //distance btw left border and tuiles + longer of tuile by number of column + distance btw each columns
      tuile.position.heightBtwScreen + tuile.size*tuile.line + tuile.position.heightBtwTuiles*tuile.line,
      //distance btw up border and first tuiles + larger of tuile by number of lines + distance btw each lines
      tuile.size,
      tuile.size
    );


      //Right cases
    fill(50, 50, 50);
      //win ?
    if(tuile.win.happend == true){
      //where ? → change the color of the case you are
      if(index == j_position[0][2] - 1 && j_position[0][3] == "right"){
        fill(100, 255, 100);
      }
    }
    rect(
      tuile.position.widthBtwScreen + tuile.size*2*tuile.column + tuile.position.widthBtwTuiles*tuile.column + tuile.size,
      //distance btw left border and tuiles + longer of tuile by number of column + distance btw each columns + size of a tuile's square
      tuile.position.heightBtwScreen + tuile.size*tuile.line + tuile.position.heightBtwTuiles*tuile.line,
      //distance btw up border and first tuiles + larger of tuile by number of lines + distance btw each lines
      tuile.size,
      tuile.size
    );


      //Next line
    tuile.line += 1;


    //if the column full ?
    if(tuile.position.heightBtwScreen + tuile.line*tuile.size + tuile.line*tuile.position.heightBtwTuiles >= width - tuile.size - tuile.position.heightBtwTuiles
      //Total of height column >= width screen less security distance
    ){
      tuile.line = 0;
      tuile.column += 1;
    }
  }

  //players
  noStroke();
  for (let index = 0; index < players.number; index++) {
    
    if(j_position[index][2] == 0 /*at ligne =0*/){
      if(index == 0){
        fill(50, 50, 200); //bleu
        circle(j_position[index][0], j_position[index][1], players.size);
      }else if(index == 1){
        fill(200, 50, 50); //rouge
        circle(j_position[index][0], j_position[index][1], players.size);
      }else if(index == 2){
        fill(190, 190, 50); //jaune
        circle(j_position[index][0], j_position[index][1], players.size);
      }else{
        fill(0, 200, 0); //verte
        circle(j_position[index][0], j_position[index][1], players.size);
      }  
    }else if(j_position[index][2] > 0 /*at ligne >0*/){  
      
      //y
      let rangLessOne = j_position[index][2] - 1; //start with 0
      j_position[index][1] = tuile.position.heightBtwScreen + tuile.size/2 + rangLessOne*tuile.size + rangLessOne*tuile.position.heightBtwTuiles; 
      
      //x
      let directionCoeficien = 0;
      if (j_position[index][3] == "right") {
        directionCoeficien = 1;
      }
      j_position[index][0] = tuile.position.widthBtwScreen + tuile.size/2 + directionCoeficien*tuile.size;
      

      //draw
      if(index == 0){
        fill(50, 50, 200); //bleu
        circle(j_position[index][0], j_position[index][1], players.size);
      }else if(index == 1){
        fill(200, 50, 50); //rouge
        circle(j_position[index][0], j_position[index][1], players.size);
      }else if(index == 2){
        fill(190, 190, 50); //jaune
        circle(j_position[index][0], j_position[index][1], players.size);
      }else{
        fill(0, 200, 0); //verte
        circle(j_position[index][0], j_position[index][1], players.size);
      }
    }
  }
}

function keyPressed(){
  if(keyCode == RIGHT_ARROW){
    j_position[0][3] = "right"; //player is on the right
  }

  if(keyCode == LEFT_ARROW){
    j_position[0][3] = "left"; //player is on the left
  }

  for (let index = 0; index < players.number; index++) {
    //position LR player = same direction of tuile about player rang ?
    if(j_position[index][3] == Tuile_Combinaison[j_position[index][2]]){ //win
      j_position[index][2] += 1;
      tuile.win.happend = true;
      }else{ //lose
      if(index == 0){
        j_position[index][0] = players.spawn_j1.x;
        j_position[index][1] = players.spawn_j1.y;
      }else if(index == 1){
        j_position[index][0] = players.spawn_j2.x;
        j_position[index][1] = players.spawn_j2.y;
      }else if(index == 2){
        j_position[index][0] = players.spawn_j3.x;
        j_position[index][1] = players.spawn_j3.y;
      }else if(index == 3){
        j_position[index][0] = players.spawn_j4.x;
        j_position[index][1] = players.spawn_j4.y;
      }
      j_position[index][2] = 0;
    }
  }
}

//165