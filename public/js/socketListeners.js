"use strict"

function setSocketListeners(socket){
  socket.on('gameUpdated:humanScore', function(data){
    helpers.setHumanScore(data.score);
  });
}

function setSocketListeners(socket){
  socket.on('gameUpdated:catScore', function(data){
    helpers.setCatScore(data.score);
  });
}
