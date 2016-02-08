var express = require('express');
var mongoose = require('mongoose');
var randomString = require('random-string');


mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/scores");
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Player = require('./models/player.js');
var ScoreModel = require('./models/score');

var players = [];
var GAME_HEIGHT = 600;
var GAME_WIDTH = 800;
var STEP = 5;
var port = process.env.PORT || 3000;

var roomPlayers = {};
var clients = {};
var humans = {};
var rooms = [];
var MAX_PLAYERS = 4;
var collidedCount = 0;
var collisionScore = 1;
var marcoScore = 30;
var helpers = require('./modules/helpers.js');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


//TODO: encapsulate io in game object andmove to new file
//TODO: client[soket.id] = socket - need or no?
io.on('connection', function(socket){
  socket.on('join:request', function(){
    console.log('connection clients ', clients);
    console.log('connection roomPlayers ', roomPlayers);
    console.log('connection rooms ', rooms);
    console.log('connection humans ', humans);
    //is there an empty room?
    //helperfunction to iterate through rooms until find one that has < MAX_PLAYERS
    //return room or false

    var room = helpers.findRoom(rooms, MAX_PLAYERS, roomPlayers);
    console.log('room that will join', room);
    console.log('roomaplyers after findroom', roomPlayers);

    //if so, join it
    //if not create new room
    if (!room) {
      console.log('creating new room');
      room = randomString();
      rooms.push(room);
      console.log('rooms array', rooms);
      console.log('roomaplyers in create new room join', roomPlayers);
    }
    socket.join(room);

    //keep track of rooms and # of players and if has human (later - single room for now)
    clients[socket.id] = room;
    roomPlayers[room] = roomPlayers[room] ? roomPlayers[room] + 1 : 1;
    console.log('roomaplyers after join', roomPlayers);

    var character;
    if (!humans[room]){
      character = 'human';
      humans[room] = socket.id;
    } else {
      character = 'cat';
    }

    var newPlayer = new Player(socket.id, character, GAME_WIDTH, GAME_HEIGHT);
    players.push(newPlayer);
    console.log('new player', newPlayer);

    //retrieve scores from the DB
    ScoreModel.find({}, function(err,docs){
      socket.emit('join:success', {
        players: helpers.getPlayers(clients[socket.id],clients, players),
        id: socket.id,
        height: GAME_HEIGHT,
        width: GAME_WIDTH,
        scores: docs
      });
    });

    socket.broadcast.to(room).emit('gameUpdated:add', {player: newPlayer});
  });

  socket.on('player:stats', function(data){
    var player = Player.findById(socket.id, players);
    player.HEIGHT = data.height;
    player.WIDTH = data.width;
  });

  //TODO: DRY this up a bit keyboard:* (regexp?)
  //TODO: might be able to limit so it only sends moved position to reduce data transfer
  socket.on('keyboard:left', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.x = movingPlayer.x <= STEP ? 0 : movingPlayer.x - STEP;
    io.to(clients[socket.id]).emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:right', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.x += STEP;

    if (movingPlayer.x + movingPlayer.WIDTH >= GAME_WIDTH){
      movingPlayer.x = GAME_WIDTH - movingPlayer.WIDTH;
    }
    io.to(clients[socket.id]).emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:up', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.y = movingPlayer.y <= STEP ? 0 : movingPlayer.y - STEP;
    io.to(clients[socket.id]).emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('keyboard:down', function(){
    var movingPlayer = Player.findById(socket.id, players);
    movingPlayer.y += STEP;
    if (movingPlayer.y + movingPlayer.HEIGHT >= GAME_HEIGHT){
      movingPlayer.y = GAME_HEIGHT - movingPlayer.HEIGHT;
    }
    io.to(clients[socket.id]).emit('gameUpdated:movement', {player: movingPlayer});
  });

  socket.on('catCaught', function(data){
    // collidedCount += 1;
    ScoreModel.find({type: 'human'}, function(err,docs){
      docs[0].score += collisionScore;
      docs[0].save(function(err){
        if (err) {
          console.log('error');
        } else {
          io.emit('gameUpdated:humanScore',{score: docs[0].score});
        }
      });
    });

    io.emit('gameUpdated:kill', {id: data.id});
  });

  socket.on('marcoPolo', function(data){
    // collidedCount += 1;
    ScoreModel.find({type: 'human'}, function(err,docs){
      docs[0].score -= marcoScore;
      docs[0].score = docs[0].score < 0 ? 0 : docs[0].score;
      docs[0].save(function(err){
        if (err) {
          console.log('error');
        } else {
          io.emit('gameUpdated:humanScore',{score: docs[0].score});
        }
      });
    });
  });

  socket.on('catPoints', function(){
    ScoreModel.find({type: 'cat'}, function(err,docs){
      var points = players.length === 0 ? 0 : players.length - 1;
      docs[0].score += points * 10;
      docs[0].save(function(err){
        if (err) {
          console.log('error');
        } else {
          io.emit('gameUpdated:catScore',{score: docs[0].score});
        }
      });
    });
  });

  socket.on('disconnect', function(){
    var currentRoom = clients[socket.id];
    //delete player from players array
    var deletedPlayer = Player.delete(socket.id, players) || '';
    //update roomPlayers count
    roomPlayers[currentRoom] -= 1;
    //delete room if empty
    if (roomPlayers[currentRoom] === 0) {
      rooms.splice(rooms.indexOf(currentRoom),1);
      delete humans[currentRoom];
      delete roomPlayers[currentRoom];
      delete currentRoom;
      console.log('roomaplyers after delete', roomPlayers);
      return;
    }

    console.log('del play', deletedPlayer);
    console.log(deletedPlayer.type === 'human');
    //tell players in room that a player has left
    socket.broadcast.to(currentRoom).emit('gameUpdated:remove', {id: socket.id});

    if (!deletedPlayer) return; //figure out why i need this

    if (deletedPlayer[0].type === 'human'){
      console.log('human deleted');
      var playersInRoom = helpers.getPlayers(currentRoom, clients, players);
      console.log('playersInRoom if humn del', playersInRoom);
      var newHuman = playersInRoom[Math.floor(Math.random() * playersInRoom.length)];
      // if (!newHuman) return; //probably dont need this
      newHuman.type = 'human';
      humans[currentRoom] = newHuman.id; //pick random player to be new human
      socket.broadcast.emit('gameUpdated:lostHuman', {human: newHuman.id});
      console.log('human deleted');
    }

    //delete user from clients object
    delete currentRoom;
  });
});

server.listen(port, function(){
  console.log('listening on port ' + port);
});
