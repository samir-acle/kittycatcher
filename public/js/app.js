"use strict";

$(document).ready(function(){
  var socket = io();

  socket.emit('joinGame');

  socket.on('joinSuccess', function(data){
    var game = new Game({socket: socket});
    game.playersArray = data.players;
    game.currentPlayer = helpers.getPlayerByID(data.id, game.playersArray);
    game.init();
  });
});
