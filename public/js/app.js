"use strict";
var game;

$(document).ready(function(){
  var socket = io();
  setSocketListeners(socket);

  socket.emit('join:request');

  socket.on('join:success', function(data){
    game = new Game({data: data, socket: socket});
    game.init();
    setInitialScores(data.scores);
    console.log('time', game.catScoreTime);
  });

  function setInitialScores(scores){
    scores.forEach(function(score){
      if(score.type === 'cat'){
        helpers.setCatScore(score.score);
      } else {
        helpers.setHumanScore(score.score);
      }
    });
  }
});
