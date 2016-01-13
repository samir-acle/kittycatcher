"use strict";

var Game = function(data){
  this.playersArray = [];
  this.socket = data.socket;
};

Game.prototype.addSprite = function(player){
  player.sprite = this.game.add.sprite(player.x, player.y, player.type);
  this.game.physics.enable(player.sprite, Phaser.Physics.ARCADE);
  player.sprite.body.collideWorldBounds = true;
};

Game.prototype.init = function(){
  var self = this;
  console.log('in game init');
  self.game = new Phaser.Game(800, 600, Phaser.CANVAS, '');

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
      self.addSprite(player);
    });

    // player = game.add.sprite(game.world.centerX, game.world.centerY, 'cat');
    // game.physics.p2.enable(player);

    // game.camera.follow(player);
    setSocketListeners();
  }

  function setSocketListeners(){
    self.socket.on('playerMovement:left', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.body.velocity.x = -200;
      // self.socket.emit('new position', {x: player.body.x, y: player.body.y});
    });

    self.socket.on('playerMovement:right', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.body.velocity.x = 200;
      // self.socket.emit('new position', {x: player.body.x, y: player.body.y});
    });

    self.socket.on('playerMovement:up', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.body.velocity.y = -200;
      // self.socket.emit('new position', {x: player.body.x, y: player.body.y});
    });

    self.socket.on('playerMovement:down', function(data){
      var movingPlayer = helpers.getPlayerByID(data.id, self.playersArray);
      movingPlayer.sprite.body.velocity.y = 200;
      // self.socket.emit('new position', {x: player.body.x, y: player.body.y});
    });
  }

  function mainUpdateFunction(){
    for(var i = 0; i < this.playersArray.length; i++){
      this.playersArray[i].sprite.body.velocity.x = 0;
      this.playersArray[i].sprite.body.velocity.y = 0;
    }

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
  }
}


//TODO: issue with movement - since using velocity,when holding down, browsers stop
