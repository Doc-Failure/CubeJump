Game = {};
var w = 600;
var h = 200;
var playerTint= getRandomColor();
var playerScore=3;
var fps=0;
var oldCube=0;
var healtBarSize=0;
/*================================================================ UTIL
*/
function randInt(num) {
  return Math.floor(Math.random() * num)
};

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '0x';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


/*================================================================ PLAY
*/
Game.Play = function(game) {};
Game.Play.prototype = {
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
        var bmd = game.add.bitmapData(200,40);
         bmd.ctx.beginPath();
         bmd.ctx.rect(0,0,720,15);
         bmd.ctx.fillStyle = '#00685e';
         bmd.ctx.fill();
         this.healthBar = game.add.sprite(game.world.centerX-100,game.world.centerY/3,bmd);
         this.healtBarSize = this.healthBar.width; 
         this.healthBar.width = (this.healtBarSize/5)*playerScore;
         this.healthBar.anchor.y = 0.5;

    this.labelTuto = game.add.text(Math.floor(w / 2) + 0.5, h - 35 + 0.5, 'Press the space bar to Start!', {
        font: '18px Arial',
        fill: '#fff',
        align: 'center'
      });
    this.labelTuto.anchor.setTo(0.5, 0.5);
    // player
    this.player = this.game.add.sprite(80, h * 2 / 3 - 20, 'player');
    this.game.physics.arcade.enable(this.player);
    this.player.body.bounce.y = 0;
    this.player.body.gravity.y = 10000;
    this.player.anchor.setTo(0.5, 0.5);
    this.player.tint =playerTint;
    // cube
    this.cubes = game.add.group();
    // line
    this.line = this.game.add.sprite(w / 2, Math.floor(h * 2 / 3), 'line');
    this.game.physics.arcade.enableBody(this.line);
    this.line.anchor.setTo(0.5, 0.2);
    this.line.body.immovable = true;
    // sound
    this.hitSound = game.add.audio('hit');
    this.jumpSound = game.add.audio('jump');
    // emitter
    this.emitter = game.add.emitter(0, 0, 200);
    this.emitter.makeParticles('pixel');
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);
    // input
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    // load game
    this.spaceKey.onDown.add(this.loadGame, this);
  },
  loadGame: function(){ 
    this.spaceKey.onDown.remove(this.loadGame, this); 
    this.playerScore = 2;
    if(this.labelTuto){
      this.labelTuto.destroy();
    }
    this.labelTuto = game.add.text(Math.floor(w / 2) + 0.5, h - 35 + 0.5, 'Press space to jump!', {
          font: '18px Arial',
          fill: '#fff',
          align: 'center'
        });
    this.labelTuto.anchor.setTo(0.5, 0.5);
    if (this.player.y > this.line.y) {
      this.initPlayer();
    }
    this.drawCube(300);
    this.drawCube(550);

  }, 
  initPlayer: function() {
      this.player.body.gravity.y = 0;
      this.player.x = 60;
      this.player.y = h * 2 / 3 - this.player.height / 2 - 30;
      this.player.angle = 0;
  },
  update: function() {
    game.physics.arcade.collide(this.player, this.line);
    if (this.spaceKey.isDown && this.player.body.touching.down) {
      this.hitSound.play('', 0, 0.2);
      this.playerJump(-400);
    }else{
      if(this.player.body.touching.down){
        this.playerJump(-70);
      } 
    }
    this.cubes.forEachAlive(function(cube) {
      if(cube.x<60){
        this.drawCube(550);
        cube.kill();
      }
    }, this);
    this.player.body.gravity.y = 800;
    game.physics.arcade.overlap(this.player, this.cubes, this.playerHit, null, this);
  },
  playerJump: function(jumpSpeed) {
    this.player.body.velocity.y = jumpSpeed;
    this.rotation = this.game.add.tween(this.player).to({
      angle: this.player.angle + 180
    }, 0, Phaser.Easing.Linear.None);
    this.rotation.start();
  },
  playerHit: function(player, hit) {
    if(oldCube!=hit.id){
        oldCube=hit.id;
        this.hitSound.play('', 0, 0.2);
        if(player.tint==hit.tint){
          if(this.playerScore<5){
            this.playerScore++;
          }
          this.emitter.x = player.x + player.width / 2;
          this.emitter.y = player.y + player.height / 2;
          this.emitter.start(true, 300, null, 8);  
          this.playerJump(-400);
        }else{
          if(this.playerScore>0){
            this.playerScore--;
          }else{
            this.labelTuto.destroy();
            this.labelTuto = game.add.text(Math.floor(w / 2) + 0.5, h - 35 + 0.5, 'Press the spacebar to restart!', {
              font: '18px Arial',
              fill: '#fff',
              align: 'center'
            });
            this.labelTuto.anchor.setTo(0.5, 0.5);
            this.cubes.removeAll();
            this.spaceKey.onDown.add(this.loadGame, this);
          }
        }        
        this.healthBar.width = (this.healtBarSize /5)*(this.playerScore);
     }
  },
  //I need to change this ...
  drawCube: function(x) {
    var cube;
    var height=100;
    var width=100;
  
    this.cube = this.game.add.sprite(height,width, 'cube');
    this.cube.x = x;
    this.cube.y = this.line.y-this.cube.height;
    this.game.physics.arcade.enable(this.cube);
    this.cube.body.velocity.x = -150;
    this.cube.id=randInt(100000);
    this.player.body.gravity.y = 100;
    if(randInt(5)>1){
      this.cube.tint= getRandomColor();
    }else{
      this.cube.tint= this.player.tint;
    }
    this.cubes.add(this.cube);
  }
};
 

var game = new Phaser.Game(w, h, Phaser.AUTO, 'game-box');
game.state.add('Play', Game.Play);
game.state.start('Play');
