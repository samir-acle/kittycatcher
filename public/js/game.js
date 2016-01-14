"use strict";

var Game = function(data){
  console.log('data', data);
  this.WIDTH = data.data.width;
  this.HEIGHT = data.data.height;
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
  this.socketID = data.data.id;
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
  this.cursors = this.addKeyboard();

  this.playersData.forEach(function(player){
    this.addPlayer({player: player});
  }, this);

  this.currentPlayer = helpers.getPlayerByID(this.socketID, this.players);

  //TODO: refactor out?
  this.socket.emit('player:stats', {
    width: this.currentPlayer.sprite.width,
    height: this.currentPlayer.sprite.height
  });
  this.setSocketListeners();

  //grouping by other players
  this.createGroups();
  this.addMask(this.game);
};

Game.prototype.createGroups = function(){
  this.others = this.game.add.group();

  this.players.forEach(function(player){
    if(player.id !== this.socketID){
      this.others.add(player.sprite);
    }
  }, this);

  console.log(this.others);
}

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

  this.mask.x = this.currentPlayer.sprite.x - (1.5 * this.currentPlayer.sprite.width);
  this.mask.y = this.currentPlayer.sprite.y - (1.5 * this.currentPlayer.sprite.height);

  this.game.world.bringToTop(this.currentPlayer);
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
  this.checkCollisions();
};

Game.prototype.removePlayer = function(data){
  console.log('remove data', data);
  var playerIndex = helpers.getIndexByID(data.id, this.players);

  if (playerIndex > -1) {
    this.players[playerIndex].sprite.destroy();
    this.players.splice(playerIndex, 1);
  }
};

Game.prototype.checkCollisions = function(){
  //collide separates, overlap does not, try both for fun
  console.log('checking collisions');
  this.game.physics.arcade.overlap(this.currentPlayer.sprite, this.others, function(currentSprite, otherSprite){
    this.socket.emit('collision', {id: otherSprite.id});
  }.bind(this));
};

Game.prototype.addMask = function(game){
  this.mask = game.add.graphics(0,0);
  this.mask.beginFill(0xffffff);
  this.mask.drawCircle(200, 200, 200);
  this.others.mask = this.mask;
  this.currentPlayer.hasMask = true;
  this.mask.x = this.currentPlayer.sprite.x;
  this.mask.y = this.currentPlayer.sprite.y;
};
