"use strict";

var Game = function(data){
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
  // this.isHuman = false;
};

Game.prototype.checkIfHuman = function(){
  if (this.currentPlayer.type === 'human'){
    return true;
  } else {
    return false;
  }
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
  this.game.load.image('human', '../images/human.png');
};

Game.prototype.playCreateFunction = function(){
  //set up game world with keyboard inputs
  this.game.physics.startSystem(Phaser.Physics.ARCADE);
  this.game.stage.disableVisibilityChange = true;
  this.cursors = this.addKeyboard();

  //create groups
  this.others = this.game.add.group();
  this.allPlayers = this.game.add.group();

  //add players to map
  this.playersData.forEach(function(player){
    this.addPlayer({player: player});
  }, this);

  //set player of local browser
  this.currentPlayer = helpers.getPlayerByID(this.socketID, this.players);

  //TODO: refactor out?
  //send player stats to server for game logic purposes
  this.socket.emit('player:stats', {
    width: this.currentPlayer.sprite.width,
    height: this.currentPlayer.sprite.height
  });
  this.setSocketListeners();

  //keep track of who is the human for easy retrieval
  this.storeHuman();
};

//TODO: combine below functions?
Game.prototype.updateOthers = function(player){
  if(player.id !== this.socketID){
    this.others.add(player.sprite);
  }
};

Game.prototype.addPlayer = function(player){
    var newPlayer = new Player(player.player);
    newPlayer.addSprite(this.game);
    this.players.push(newPlayer);
    this.updateOthers(newPlayer);
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

  // this.storeHuman();
  //ensure human always top layer of canvas
  this.game.world.bringToTop(this.human.sprite);

  if (!this.mask) return;

  //set mask to follow human
  this.mask.x = Math.floor(this.human.sprite.x - this.human.sprite.width / 2);
  this.mask.y = Math.floor(this.human.sprite.y - this.human.sprite.height / 2);
};

Game.prototype.setSocketListeners = function(){
  this.socket.on('gameUpdated:movement', this.updatePlayer.bind(this));
  this.socket.on('gameUpdated:add', this.addPlayer.bind(this));
  this.socket.on('gameUpdated:remove', this.removePlayer.bind(this));
  this.socket.on('gameUpdated:lostHuman', this.setNewHuman.bind(this));
};

Game.prototype.setNewHuman = function(data){
  var newHuman = helpers.findById(data.human, this.players);
  newHuman.type = 'human';
  //TODO: make sure x and y stay the same
  newHuman.sprite.destroy();
  this.addPlayer(newHuman);
};

Game.prototype.updatePlayer = function(player){
  var playerToUpdate = helpers.getPlayerByID(player.player.id, this.players);//TODO: rename to getByID
  playerToUpdate.setPosition({
    x : player.player.x,
    y : player.player.y
  });
  this.checkHumanOthersCollisions();
};

Game.prototype.removePlayer = function(data){
  var playerIndex = helpers.getIndexByID(data.id, this.players);

  if (playerIndex > -1) {
    this.players[playerIndex].sprite.destroy();
    this.players.splice(playerIndex, 1);
  }
};

Game.prototype.checkHumanOthersCollisions = function(){
  //collide separates, overlap does not, try both for fun
  this.game.physics.arcade.overlap(this.human.sprite, this.others, function(currentSprite, otherSprite){
    console.log('player and human collide');
    this.socket.emit('collision', {id: otherSprite.id});
  }.bind(this));
};

Game.prototype.storeHuman = function(){
  for (var i = 0; i < this.players.length; i++){
    if (this.players[i].type === 'human') {
      this.human = this.players[i];
    }
  }
  //TODO: do i nee to store this or just return as variable, only used when settting mask
  // this.checkIfHuman();

  if (!this.checkIfHuman()) return;
  this.addMask();
};

//TODO: since bringin human to font, get rid of storing mask in game object?
//TODO: or change so only mask human and bring to font?
Game.prototype.addMask = function(){
  // if (!this.isHuman) return;

  this.createMask();
  console.log('adding mask');

  this.others.mask = this.mask;

  //TODO: update positioning
  this.mask.x = 0;
  this.mask.y = 0;
};

Game.prototype.createMask = function(){
  if (this.mask) return;

  this.mask = this.game.add.graphics(0,0);
  this.mask.beginFill(0x000000);
  this.mask.drawCircle(200, 200, 200);
};
