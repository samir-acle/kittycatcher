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
//var clients = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//TODO: encapsulate io in game object andmove to new file
//TODO: client[soket.id] = socket - need or no?
io.on('connection', function(socket){
  socket.on('join:request', function(){
    var newPlayer = new Player(socket.id);
    players.push(newPlayer);

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

  socket.on('disconnect', function(){
    Player.delete(socket.id, players);
    socket.broadcast.emit('gameUpdated:remove', {id: socket.id});
  });
});

server.listen(port, function(){
  console.log('listening');
});
