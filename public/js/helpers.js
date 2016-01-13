"use strict";

var helpers = {};

helpers.getPlayerByID = function(id, array) {
  var player = array.find(function(el, index, array){
    return el.id === id;
  });
  return player;
};
