"use strict"

function setSocketListeners(socket){
  socket.on('gameUpdated:humanScore', function(data){
    console.log('human score updated');
    helpers.setHumanScore(data.score);
  });

  socket.on('gameUpdated:catScore', function(data){
    helpers.setCatScore(data.score);
  });
}

function setSocketListeners(socket){
  socket.on('gameUpdated:catScore', function(data){
    helpers.setCatScore(data.score);
  });
}
