"use strict";

$(document).ready(function(){
  var socket = io();

  socket.emit('joinGame');

  socket.on('joinSuccess', function(data){
    console.log(data);
    var game = new Game({socket: socket});
    game.playerId = data.id;
    game.playersArray = data.players;
    game.init();
  });
});
