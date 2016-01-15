"use strict"

function setSocketListeners(socket){
  socket.on('gameUpdated:humanScore', function(data){
    helpers.setHumanScore(data.score);
  });
}
