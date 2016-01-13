var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Player = require('./models/player.js');
var players = [];
var port = process.env.PORT || 3000;
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
    console.log('players before push', players);
    var newPlayer = new Player(socket.id);
    players.push(newPlayer);
    console.log('players after joingame and push', players);
    console.log('socket', socket.id);

    //TODO: should i send player object instead of just id?
    //TODO: combine with broadcast to make dry- on client side?
    socket.emit('joinSuccess', {players: players, id: socket.id});
    socket.broadcast.emit('gameUpdated:add', {player: newPlayer});
  });

  socket.on('keyboard:left', function(){
    //this = socket
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.x -= 5;
    io.emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:right', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.x += 5;
    io.emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:up', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.y -= 5;
    io.emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:down', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.y += 5;
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
