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
});
