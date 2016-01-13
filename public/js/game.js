"use strict";
var Game = function(data){
  this.playersArray = [];
  this.playersSprites = [];
  this.socket = data.socket;
};

Game.prototype.init = function(){
  var self = this;
  console.log('in game init');
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, '');

  var mainState = {
    preload: function(){
      game.load.image('cat', '../images/domestic2.svg');
    },
    create: mainCreateFunction
  };

  game.state.add('Main', mainState);
  game.state.start('Main');

  var cursors;

  function preload(){
    game.load.image('cat', '../images/domestic2.svg');
  }

  function mainCreateFunction(){
    console.log('in create');
    //TODO: listen for joined game and initial position
    // game.world.setBounds(0, 0, 1920, 1920);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //disbale automatic pausing of the game if leave the tab
    game.stage.disableVisibilityChange = true;
    cursors = game.input.keyboard.createCursorKeys();

    // loop through players and create
    self.playersArray.forEach(function(player){
      player.sprite = game.add.sprite(player.x, player.y, player.type);
      game.physics.enable(player.sprite, Phaser.Physics.ARCADE);
      player.sprite.body.collideWorldBounds = true;
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
