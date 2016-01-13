"use strict";

$(document).ready(function(){
  var socket = io();
  var game;

  socket.emit('joinGame');

  socket.on('joinSuccess', function(data){
    game = new Game({socket: socket});
    game.playersArray = data.players;
    game.currentPlayer = helpers.getPlayerByID(data.id, game.playersArray);
    game.init();
  });

  socket.on('playerDisconnected', function(data){
    var playerIndex = helpers.getIndexByID(data.id, game.playersArray);
    game.playersArray[playerIndex].sprite.destroy();
    game.playersArray.splice(playerIndex, 1);
    console.log('array',game.playersArray);
  });
});
