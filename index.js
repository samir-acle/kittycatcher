var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Player = require('./models/player.js');
var players = [];
//var clients = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//TODO: encapsulate io in game object andmove to new file
//TODO: client[soket.id] = socket - need or no?
io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);

  socket.on('joinGame', function(){
    var currentPlayer = new Player(socket.id);
    players.push(currentPlayer);
    //TODO: should i send player object instead of just id?
    //TODO: combine with broadcast to make dry- on client side?
    socket.emit('joinSuccess', {players: players, id: socket.id});
    socket.broadcast.emit('gameUpdated:add', {player: currentPlayer});
  });

  socket.on('keyboard:left', function(){
    //this = socket
    // var movingPlayer = Player.findById(socket.id, players);
    io.emit('playerMovement:left', {id: socket.id});
  });

  socket.on('keyboard:right', function(){
    io.emit('playerMovement:right', {id: socket.id});
  });

  socket.on('keyboard:up', function(){
    io.emit('playerMovement:up', {id: socket.id});
  });

  socket.on('keyboard:down', function(){
    io.emit('playerMovement:down', {id: socket.id});
  });

  socket.on('position:update', function(x,y){
    var player = Player.findById(socket.id, players);
    player.x = x;
    player.y = y;
  });

  socket.on('disconnect', function(){
    Player.delete(socket.id, players);
    socket.broadcast.emit('gameUpdated:remove', {id: socket.id});
  });
});

server.listen(3000, function(){
  console.log('listening on port 3000');
});
