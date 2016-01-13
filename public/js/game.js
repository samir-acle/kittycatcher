"use strict";

var Game = function(data){
  this.playersArray = [];
  this.socket = data.socket;
  this.WIDTH = 800;
  this.HEIGHT = 600;
  this.speed = 1;
};

Game.prototype.addSprite = function(player){
  player.sprite = this.game.add.sprite(player.x, player.y, player.type);
  this.game.physics.enable(player.sprite, Phaser.Physics.ARCADE);
  player.sprite.body.collideWorldBounds = true;
};

Game.prototype.init = function(){
  var self = this;
  console.log('in game init');
  self.game = new Phaser.Game(self.WIDTH, self.HEIGHT, Phaser.CANVAS, '');

  var mainState = {
    preload: function(){
      self.game.load.image('cat', '../images/domestic2.svg');
    },
    create: mainCreateFunction,
    update: mainUpdateFunction.bind(self)
  };

  self.game.state.add('Main', mainState);
  self.game.state.start('Main');

  var cursors;

  function preload(){
    self.game.load.image('cat', '../images/domestic2.svg');
  }

  function mainCreateFunction(){
    // game.world.setBounds(0, 0, 1920, 1920);
    self.game.physics.startSystem(Phaser.Physics.ARCADE);
    //disbale automatic pausing of the game if leave the tab
    self.game.stage.disableVisibilityChange = true;
    cursors = self.game.input.keyboard.createCursorKeys();

    // loop through players and create
    self.playersArray.forEach(function(player){
      console.log(player);
      self.addSprite(player);
    });

    //TODO: maybe make player class?
    // player = game.add.sprite(game.world.centerX, game.world.centerY, 'cat');
    // game.physics.p2.enable(player);

    // game.camera.follow(player);
    setSocketListeners();
  }

//TODO: refactor - dont need data.id if change on server, but whats best practice?
  function setSocketListeners(){
    self.socket.on('playerMovement:left', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.x += self.speed * -5;
      //TODO: update position on server side then send back?
      if (self.currentPlayer.id === data.id) {
        self.socket.emit('position:update', {
          id: data.id,
          x: movingPlayer.sprite.x,
          y: movingPlayer.sprite.y
        });
      }
    });

    self.socket.on('playerMovement:right', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.x += self.speed * 5;

      if (self.currentPlayer.id === data.id) {
        self.socket.emit('position:update', {
          id: data.id,
          x: movingPlayer.sprite.x,
          y: movingPlayer.sprite.y
        });
      }
    });

    self.socket.on('playerMovement:up', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.y += self.speed * -5;

      if (self.currentPlayer.id === data.id) {
        self.socket.emit('position:update', {
          id: data.id,
          x: movingPlayer.sprite.x,
          y: movingPlayer.sprite.y
        });
      }
    });

    self.socket.on('playerMovement:down', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.y += self.speed * 5;
      if (self.currentPlayer.id === data.id) {
        self.socket.emit('position:update', {
          id: data.id,
          x: movingPlayer.sprite.x,
          y: movingPlayer.sprite.y
        });
      }
    });
  }

  function mainUpdateFunction(){
    if (cursors.left.isDown){
      this.socket.emit('keyboard:left');
    } else if (cursors.right.isDown){
      this.socket.emit('keyboard:right');
    }

    if (cursors.up.isDown){
      this.socket.emit('keyboard:up');
    } else if (cursors.down.isDown){
      this.socket.emit('keyboard:down');
    }

    // for(var i = 0; i < this.playersArray.length; i++){
    //   this.playersArray[i].sprite.body.velocity.x = 0;
    //   this.playersArray[i].sprite.body.velocity.y = 0;
    // }
  }
}
