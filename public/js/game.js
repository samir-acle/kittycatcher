"use strict";

var Game = function(data){
  this.WIDTH = 800;
  this.HEIGHT = 600;
  this.states = [
    { stateName: 'play',
      stateFunctions: {
        preload: this.playPreloadFunction.bind(this),
        create: this.playCreateFunction.bind(this),
        update: this.playUpdateFunction.bind(this)
      }
    }
  ],
  this.playersData = data.data.players;
  this.socket = data.socket;
  this.players = [];
};

Game.prototype.init = function(){
  this.game = new Phaser.Game(self.WIDTH, self.HEIGHT, Phaser.CANVAS, ''); //TODO: auto or canvas
  this.addStates();
  this.game.state.start('play'); //TODO: capitalize
};

Game.prototype.addStates = function(){
  this.states.forEach(function(state){
    this.game.state.add(state.stateName, state.stateFunctions);
  }, this);
};

Game.prototype.addKeyboard = function(){
  return this.game.input.keyboard.createCursorKeys();
};

Game.prototype.playPreloadFunction = function(){  //TODO: do these need to be proto or can be class methods?
  this.game.load.image('cat', '../images/domestic2.svg');
};

Game.prototype.playCreateFunction = function(){
  this.game.physics.startSystem(Phaser.Physics.ARCADE);
  this.game.stage.disableVisibilityChange = true;
  console.log('in create this',this);
  console.log('in create this',this.game);
  this.cursors = this.addKeyboard();

  this.playersData.forEach(function(player){
    this.addPlayer({player: player});
  }, this)

  this.setSocketListeners();
};

Game.prototype.addPlayer = function(player){
    var newPlayer = new Player(player.player);
    newPlayer.addSprite(this.game);
    this.players.push(newPlayer);
};

Game.prototype.playUpdateFunction = function(){
  if (this.cursors.left.isDown){
    this.socket.emit('keyboard:left');
  } else if (this.cursors.right.isDown){
    this.socket.emit('keyboard:right');
  }

  if (this.cursors.up.isDown){
    this.socket.emit('keyboard:up');
  } else if (this.cursors.down.isDown){
    this.socket.emit('keyboard:down');
  }
};

Game.prototype.setSocketListeners = function(){
  this.socket.on('gameUpdated:movement', this.updatePlayer.bind(this));
  this.socket.on('gameUpdated:add', this.addPlayer.bind(this));
  this.socket.on('gameUpdated:remove', this.removePlayer.bind(this));
};

Game.prototype.updatePlayer = function(player){
  var playerToUpdate = helpers.getPlayerByID(player.player.id, this.players);//TODO: rename to getByID
  playerToUpdate.setPosition({
    x : player.player.x,
    y : player.player.y
  });
};

Game.prototype.removePlayer = function(data){
  console.log('remove data', data);
  var playerIndex = helpers.getIndexByID(data.id, this.players);

  if (playerIndex > -1) {
    this.players[playerIndex].sprite.destroy();
    this.players.splice(playerIndex, 1);
  }
};
