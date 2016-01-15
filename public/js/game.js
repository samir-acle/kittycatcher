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
  this.checkingCollision = false;
  this.catScoreTime = moment();
  this.humanResetTime = moment();
  this.playerDropTime = moment();
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

Game.prototype.playPreloadFunction = function(){  //TODO: do these need to be proto or can be class methods?
  this.game.load.image('cat', '../images/domestic2.svg');
  this.game.load.image('human', '../images/human.png');
  this.game.load.image('grass', '../images/grass_template2.jpg');
  this.game.load.audio('meow', '../audio/meow.mp3');
};

Game.prototype.playCreateFunction = function(){
  //set up game world with keyboard inputs
  this.game.physics.startSystem(Phaser.Physics.ARCADE);
  this.game.stage.disableVisibilityChange = true;

  this.game.add.sprite(0,0,'grass');
  //add input events
  this.cursors = this.game.input.keyboard.createCursorKeys();
  this.marco = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  //load sounds
  this.meow = this.game.add.audio('meow');

  //create mask to hide cats
  this.mask = this.game.add.graphics(0,0);

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

  //set mask to follow human
  if (this.mask) {
    this.mask.x = this.human.x + (this.human.sprite.width / 2);
    this.mask.y = this.human.y + (this.human.sprite.height / 2);
  }

  if (this.checkIfHuman()){
    var catTime = moment().diff(this.catScoreTime, 'seconds');
    console.log(catTime);
    if (catTime > 2) {
      this.socket.emit('catPoints');
      this.catScoreTime = moment();
    }
  }

  var humanTime = moment().diff(this.humanResetTime, 'seconds');
  if (humanTime > 20) {
    // this.socket.emit('catPoints');
    // this.catScoreTime = moment();
    console.log('reset human');
    this.humanResetTime = moment();
  }

  var catTime = moment().diff(this.catScoreTime, 'seconds');
  if (catTime > 2) {
    this.socket.emit('catPoints');
    this.catScoreTime = moment();
  }
};

Game.prototype.setSocketListeners = function(){
  this.socket.on('gameUpdated:movement', this.updatePlayer.bind(this));
  this.socket.on('gameUpdated:add', this.addPlayer.bind(this));
  this.socket.on('gameUpdated:remove', this.removePlayer.bind(this));
  this.socket.on('gameUpdated:lostHuman', this.setNewHuman.bind(this));
  this.socket.on('gameUpdated:kill', this.killPlayer.bind(this));
};

Game.prototype.killPlayer = function(data){
  if (this.socketID === data.id) {
    console.log('you were caught');
  }

  if(!this.meow.isPlaying){
    this.meow.play();
  }
};

Game.prototype.setNewHuman = function(data){
  console.log('data for new hum', data);
  var newHuman = helpers.getPlayerByID(data.human, this.players);
  newHuman.type = 'human';
  newHuman.sprite.destroy();
  newHuman.addSprite(this.game);
  this.mask.clear();
  this.storeHuman();
};

Game.prototype.updatePlayer = function(player){
  var playerToUpdate = helpers.getPlayerByID(player.player.id, this.players);//TODO: rename to getByID
  playerToUpdate.setPosition({
    x : player.player.x,
    y : player.player.y
  });
  if (this.checkIfHuman()){
    this.checkHumanOthersCollisions();
  }
};

Game.prototype.removePlayer = function(data){
  var playerIndex = helpers.getIndexByID(data.id, this.players);

  if (playerIndex > -1) {
    this.others.remove(this.players[playerIndex].sprite, true);
    this.players.splice(playerIndex, 1);
  }
};

Game.prototype.checkHumanOthersCollisions = function(){
  //collide separates, overlap does not, try both for fun
  var overlap = this.game.physics.arcade.overlap(this.human.sprite, this.others, function(currentSprite, otherSprite){
    this.catScoreTime = moment();
    this.socket.emit('catCaught', {id: otherSprite.id});
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

  //added here so only happens on actual keypress
  this.marco.onDown.add(function(){
    if (!this.preventMarco){
      this.marcoPolo();
    }
  }, this);
};

Game.prototype.marcoPolo = function(){
  this.socket.emit('marcoPolo');

  this.others.mask = this.game.add.graphics(0,0);// this.mask = null;
  this.others.mask.beginFill(0xffffff);
  this.others.mask.drawRect(0,0,this.WIDTH,this.HEIGHT);

  this.mask.clear();
  var marcoTimeoutID = window.setTimeout(function(){
    this.others.mask.clear();
    this.addMask();
  }.bind(this), 400);
  this.preventMarco = true;
  var preventMarcoTimeoutID = window.setTimeout(function(){
    this.preventMarco = false;
  }.bind(this), 5000);
};
//TODO: since bringin human to font, get rid of storing mask in game object?
//TODO: or change so only mask human and bring to font?
Game.prototype.addMask = function(){
  if (!this.mask.filling){
    this.mask = this.game.add.graphics(0,0);
    this.mask.beginFill(0xffffff);
    this.mask.drawEllipse(0, 0, this.human.sprite.width, this.human.sprite.height);
  }

  this.others.mask = this.mask;
};
