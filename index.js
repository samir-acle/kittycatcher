var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Player = require('./models/player.js');
var players = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//TODO: encapsulate io in game object andmove to new file
io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);

  var currentPlayer;
  // var userID = players.length > 0 ? Player.generateID(players) : 1;
  // var player = new Player(userID, socket.id);
  socket.on('joinGame', function(){
    currentPlayer = new Player(socket.id);
    players.push(currentPlayer);
    socket.emit('joinSuccess', {players: players, id: socket.id} );
  });

  socket.on('left', function(player){
    io.emit('moved left', players);
  });

  socket.on('right', function(player){
    io.emit('moved right', players);
  });

  socket.on('up', function(player){
    io.emit('moved up', players);
  });

  socket.on('down', function(player){
    io.emit('moved down', players);
  });

  socket.on('new position', function(x,y){
    player.x = x;
    player.y = y;
  });

  socket.on('disconnect', function(){
    Player.delete(socket.id, players);
    console.log(players);
  });
});

server.listen(3000, function(){
  console.log('listening on port 3000');
});
