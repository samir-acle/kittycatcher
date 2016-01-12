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

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
  players.push(new Player(socket.id));
  io.emit('generated', players);
  // socket.on('clicked', function(color){
  //   console.log('this color is:',color);
  //   io.emit('received', '10-4');
  // });
  // socket.on('disconnect', function)
  socket.on('disconnect', function(){
    Player.delete(socket.id, players);
    console.log(players);
  });
});

server.listen(3000, function(){
  console.log('listening on port 3000');
});
