Game = {};
var w = 600;
var h = 200;
var playerTint= getRandomColor();
var playerSize=1;
/*================================================================ UTIL
*/

function randInt(num) {
  return Math.floor(Math.random() * num)
};

function randDoub(num) {
  return Math.random() * num
};

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '0x';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/*================================================================ LOAD
*/

Game.Load = function(game) {};
Game.Load.prototype = {
  preload: function() {
    game.stage.backgroundColor = '#000000';
    game.load.image('player', 'images/player.png');
    game.load.image('pixel', 'images/pixel.png');
    game.load.image('line', 'images/line.png');
    game.load.image('cube', 'images/cube.png');
    game.load.audio('hit', 'sounds/hit.wav');
    game.load.audio('jump', 'sounds/jump.wav');
  },
  create: function() {
    game.state.start('Play');
  }
};

/*================================================================ PLAY
*/

Game.Play = function(game) {};
Game.Play.prototype = {
  render: function() {
    //this.updateDebug();
  },
  resize: function() {
    //console.log('resize');
  },
  shutdown: function() {
    //console.log('shutdown');
  },
  create: function() {
    // player
    this.player = this.game.add.sprite(80, h * 2 / 3 - 20, 'player');
    this.game.physics.arcade.enable(this.player);
    this.player.body.bounce.y = 0;
    this.player.body.gravity.y = 10000;
    this.player.anchor.setTo(0.5, 0.5);
    this.player.tint =playerTint;

    // cube
    this.cubes = game.add.group();
    //this.cubes.createMultiple(20, 'cube');
    // line
    this.line = this.game.add.sprite(w / 2, Math.floor(h * 2 / 3), 'line');
    this.game.physics.arcade.enableBody(this.line);
    this.line.anchor.setTo(0.5, 0.2);
    this.line.body.immovable = true;

    this.labelTuto = game.add.text(Math.floor(w / 2) + 0.5, h - 35 + 0.5, 'When the cube touch the ground press space to jump!', {
          font: '18px Arial',
          fill: '#fff',
          align: 'center'
        });
        this.labelTuto.anchor.setTo(0.5, 0.5);
    // sound
    this.hitSound = game.add.audio('hit');
    this.jumpSound = game.add.audio('jump');
 
    // input
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // emitter
    this.emitter = game.add.emitter(0, 0, 200);
    this.emitter.makeParticles('pixel');
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);

    // load game
    this.loadGame();
  },
  update: function() {
    game.physics.arcade.collide(this.player, this.line);
   // on the ground && press space
  /* if(this.player.alive && this.isStarted){

      this.isStarted = true
   }*/
    if (this.spaceKey.isDown && this.player.body.touching.down) {
      this.hitSound.play('', 0, 0.2);
      this.playerJump(-400);
      if (!this.isStarted) {
        this.isStarted = true
        //game.add.audio('music').play('', 0, 0.1, true);
      }
    }else{
      if(this.player.body.touching.down){
        this.playerJump(-250);
      } 
    }
  /*  if(this.player.body.touching.down && this.isStarted) {
      this.player.alive = true;
    }*/
    this.cubes.forEachAlive(function(cube) {
      if(cube.x<60){
        this.drawCube(550);
        cube.kill();
      }
    }, this);
    this.player.body.gravity.y = 800;
    game.physics.arcade.overlap(this.player, this.cubes, this.playerHit, null, this);
  },

  loadGame: function(){ 
    if (this.player.y > this.line.y) {
      this.initPlayer();
    }
    this.drawCube(300);
    this.drawCube(550);
  },
  playerJump: function(jumpSpeed) {
    this.player.body.velocity.y = jumpSpeed;
    // spin the player
    this.rotation = this.game.add.tween(this.player).to({
      angle: this.player.angle + 180
    }, 0, Phaser.Easing.Linear.None);
    this.rotation.start();
  },
  playerHit: function(player, hit) {
   // if (this.player.alive) {
    this.hitSound.play('', 0, 0.2);

    if(player.tint==hit.tint){
      this.emitter.x = player.x + player.width / 2;
      this.emitter.y = player.y + player.height / 2;
      this.emitter.start(true, 300, null, 8);  
      playerSize=playerSize*1.1;
      this.game.add.tween(player.scale).to({
          y: playerSize,
          x: playerSize
        }, 6, Phaser.Easing.Linear.None).start();
      this.playerJump(-400);
    
    }else{
      if(playerSize>0.5){
        playerSize=playerSize*0.5;
        this.game.add.tween(player.scale).to({
            y: playerSize,
            x: playerSize
        }, 6, Phaser.Easing.Linear.None).start();
      }else{
        if(this.player.alive){
          this.player.alive = false;  
          this.labelTuto = game.add.text(Math.floor(w / 2) + 0.5, h - 35 + 0.5, 'When the cube touch the ground press space to jump!', {
            font: '18px Arial',
            fill: '#fff',
            align: 'center'
          });
          this.labelTuto.anchor.setTo(0.5, 0.5);
        }
      }
    }
  },
  initPlayer: function() {
      this.player.body.gravity.y = 0;
      this.player.x = 60;
      this.player.y = h * 2 / 3 - this.player.height / 2 - 30;
      this.player.angle = 0;

      if (this.rotation) {
        this.rotation.pause();
      }
  },
  //I need to change this ...
  drawCube: function(x) {
    var cube;
    var height=randDoub(100);
    var width=randDoub(100);
  
    this.cube = this.game.add.sprite(height,width, 'cube');
    this.cube.x = x;
    this.cube.y = this.line.y-this.cube.height;
    this.game.physics.arcade.enable(this.cube);
    this.cube.body.velocity.x = -150;
    this.player.body.gravity.y = 100;
    if(randInt(2)){
      this.cube.tint= getRandomColor();
    }else{
      this.cube.tint= this.player.tint;
    }
    this.cubes.add(this.cube);
  }
};

/*================================================================ END
*/

Game.End = function(game) {};
Game.End.prototype = {
  create: function() {
    console.log("create");
  }
};

var game = new Phaser.Game(w, h, Phaser.AUTO, 'game-box');
game.state.add('Load', Game.Load);
game.state.add('Play', Game.Play);
game.state.add('End', Game.End);
game.state.start('Load');
