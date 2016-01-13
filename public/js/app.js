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

  socket.on('gameUpdated:remove', function(data){
    var playerIndex = helpers.getIndexByID(data.id, game.playersArray);

    if (playerIndex > -1) {
      game.playersArray[playerIndex].sprite.destroy();
      game.playersArray.splice(playerIndex, 1);
      console.log('player has disconnected');
    }
  });

  socket.on('gameUpdated:add', function(data){
    var newPlayer = data.player;
    game.playersArray.push(newPlayer);
    game.addSprite(newPlayer);
  });
});
