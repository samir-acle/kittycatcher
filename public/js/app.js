"use strict";
var game;

$(document).ready(function(){
  var socket = io();
  // game;

  socket.emit('joinGame');

  socket.on('joinSuccess', function(data){
    game = new Game({data: data, socket: socket});
    game.currentPlayer = helpers.getPlayerByID(data.id, game.players);
    game.init();
  });
  //
  // socket.on('gameUpdated:remove', function(data){
  //   var playerIndex = helpers.getIndexByID(data.id, game.playersArray);
  //
  //   if (playerIndex > -1) {
  //     game.playersArray[playerIndex].sprite.destroy();
  //     game.playersArray.splice(playerIndex, 1);
  //     console.log('player has disconnected');
  //   }
  // });
  //
  // socket.on('gameUpdated:add', function(data){
  //   var newPlayer = data.player;
  //   game.playersArray.push(newPlayer);
  //   game.addSprite(newPlayer);
  // });
});
