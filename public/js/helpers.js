"use strict";

var helpers = {};

helpers.getPlayerByID = function(id, array) {
  var player = array.find(function(el, index, array){
    return el.id === id;
  });
  return player;
};

helpers.getIndexByID = function(id, array) {
  var playerIndex = array.findIndex(function(el, index, array){
    return el.id === id;
  });
  return playerIndex;
};

helpers.setCatScore = function(score){
  $('.cat').text('CATS: ' + score);
};

helpers.setHumanScore = function(score){
  $('.human').text('HUMAN: ' + score);
};
