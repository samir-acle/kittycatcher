var express = require('express');
var mongoose = require('mongoose');


mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/scores");
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

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
var games = [];
var MAX_PLAYERS = 10;
var room;
var collidedCount = 0;
var collisionScore = 1;
var marcoScore = 30;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//for testing database
app.get('/scores', function(req,res){
  ScoreModel.find({}, function(err,docs){
    res.json(docs);
  });
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
    var newPlayer = new Player(socket.id, character, GAME_WIDTH, GAME_HEIGHT);
    players.push(newPlayer);
    console.log(newPlayer);

    //retrieve scores from the DB
    ScoreModel.find({}, function(err,docs){
      console.log('scores', docs);
      socket.emit('join:success', {
        players: players,
        id: socket.id,
        height: GAME_HEIGHT,
        width: GAME_WIDTH,
        scores: docs
      });
    });

    //TODO: should i send player object instead of just id?
    //TODO: combine with broadcast to make dry- on client side?
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

  socket.on('catCaught', function(data){
    // collidedCount += 1;
    console.log('IN collision:human');
    console.log(data);
    ScoreModel.find({type: 'human'}, function(err,docs){
      docs[0].score += collisionScore;
      docs[0].save(function(err){
        if (err) {
          console.log('error');
        } else {
          console.log('no error');
          io.emit('gameUpdated:humanScore',{score: docs[0].score});
        }
      });
    });

    io.emit('gameUpdated:kill', {id: data.id});
  });

  socket.on('marcoPolo', function(data){
    // collidedCount += 1;
    console.log('IN marcoPolo');
    console.log(data);
    ScoreModel.find({type: 'human'}, function(err,docs){
      docs[0].score -= marcoScore;
      docs[0].score = docs[0].score < 0 ? 0 : docs[0].score;
      docs[0].save(function(err){
        if (err) {
          console.log('error');
        } else {
          console.log('no error');
          io.emit('gameUpdated:humanScore',{score: docs[0].score});
        }
      });
    });
  });

  socket.on('disconnect', function(){
    var deletedPlayer = Player.delete(socket.id, players) || '';
    console.log('del play', deletedPlayer);
    console.log(deletedPlayer.type === 'human');

    socket.broadcast.emit('gameUpdated:remove', {id: socket.id});

    if (!deletedPlayer) return;

    if (deletedPlayer[0].type === 'human'){
      console.log('human deleted');
      humans[clients[socket.id]] = false;
      var newHuman = players[Math.floor(Math.random() * players.length)];
      newHuman.type = 'human';
      humans[clients[socket.id]] = true; //pick random player to be new human
      socket.broadcast.emit('gameUpdated:lostHuman', {human: newHuman.id});
      console.log('human deleted');
    }
  });
});

server.listen(port, function(){
  console.log('listening');
});
