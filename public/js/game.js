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
    create: mainCreateFunction
  };

  self.game.state.add('Main', mainState);
  self.game.state.start('Main');

  var cursors;

  function preload(){
    self.game.load.image('cat', '../images/domestic2.svg');
  }

  function mainCreateFunction(){
    console.log('in create');
    //TODO: listen for joined game and initial position
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
    self.socket.on('moved left', function(){
      player.body.velocity.x = -200;
      socket.emit('new position', {x: player.body.x, y: player.body.y});
    });

    self.socket.on('moved right', function(){
      player.body.velocity.x = 200;
      socket.emit('new position', {x: player.body.x, y: player.body.y});
    });

    self.socket.on('moved up', function(){
      player.body.velocity.y = -200;
      socket.emit('new position', {x: player.body.x, y: player.body.y});
    });

    self.socket.on('moved down', function(){
      player.body.velocity.y = 200;
      socket.emit('new position', {x: player.body.x, y: player.body.y});
    });
  }

  function update(){
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;


      if (cursors.left.isDown){
        self.socket.emit('left');
      } else if (cursors.right.isDown){
        self.socket.emit('right');
      }

      if (cursors.up.isDown){
        self.socket.emit('up');
      } else if (cursors.down.isDown){
        self.socket.emit('down');
      }
    }

}
