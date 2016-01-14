var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Player = require('./models/player.js');
var players = [];
var GAME_HEIGHT = 600;
var GAME_WIDTH = 800;
var STEP = 5;
var port = process.env.PORT || 3000;

var roomPlayers = {};
var clients = {};
var humans = {};
var games = [];
var MAX_PLAYERS = 10;
var room;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//TODO: encapsulate io in game object andmove to new file
//TODO: client[soket.id] = socket - need or no?
io.on('connection', function(socket){
  socket.on('join:request', function(){
    //is there an empty room?
    //helperfunction to iterate through rooms until find one that has < MAX_PLAYERS
    //return -1 or index
    //if so, join it
    //if not create new room
    //keep track of rooms and # of players and if has human (later - single room for now)
    room = 'first room';
    if (!games) {
      games.push(room);
    }

    clients[socket.id] = room;
    roomPlayers[room] = roomPlayers[room] ? roomPlayers[room] + 1 : 0;
    var character;
    if (!humans[room]){
      character = 'human';
      humans[room] = true;
    } else {
      character = 'cat';
    }
    var newPlayer = new Player(socket.id, character);
    players.push(newPlayer);
    console.log(newPlayer);

    //TODO: should i send player object instead of just id?
    //TODO: combine with broadcast to make dry- on client side?
    socket.emit('join:success', {
      players: players,
      id: socket.id,
      height: GAME_HEIGHT,
      width: GAME_WIDTH
    });
    socket.broadcast.emit('gameUpdated:add', {player: newPlayer});
  });

  socket.on('player:stats', function(data){
    var player = Player.findById(socket.id, players);
    player.HEIGHT = data.height;
    player.WIDTH = data.width;
  });

  //TODO: DRY this up a bit keyboard:* (regexp?)
  //TODO: might be able to limit so it only sends moved position to reduce data transfer
  socket.on('keyboard:left', function(){
    //this = socket
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.x = movingPlayer.x <= STEP ? 0 : movingPlayer.x - STEP;
    io.emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:right', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.x += STEP;

    if (movingPlayer.x + movingPlayer.WIDTH >= GAME_WIDTH){
      movingPlayer.x = GAME_WIDTH - movingPlayer.WIDTH;
    }
    io.emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:up', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.y = movingPlayer.y <= STEP ? 0 : movingPlayer.y - STEP;
    io.emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:down', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.y += STEP;
    if (movingPlayer.y + movingPlayer.HEIGHT >= GAME_HEIGHT){
      movingPlayer.y = GAME_HEIGHT - movingPlayer.HEIGHT;
    }
    io.emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('collision', function(){
    console.log('collided');
  });

  socket.on('disconnect', function(){
    var deletedPlayer = Player.delete(socket.id, players);

    if (deletedPlayer.type === 'human'){
      var newHuman = players[Math.floor(Math.random() * players.length)]; //pick random player to be new human
      socket.broadcast.emit('gameUpdated:lostHuman', {human: newHuman.id});
    }

    socket.broadcast.emit('gameUpdated:remove', {id: socket.id});
  });
});

server.listen(port, function(){
  console.log('listening');
});
