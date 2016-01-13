"use strict";
var game;

$(document).ready(function(){
  var socket = io();

  socket.emit('join:request');

  socket.on('join:success', function(data){
    game = new Game({data: data, socket: socket});
    var currentPlayer = helpers.getPlayerByID(data.id, game.players);
    console.log('currentplayer', currentPlayer);
    game.currentPlayer = currentPlayer;
    game.init();
  });
  
});
