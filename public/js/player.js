"use strict";

var Player = function(data){
  //set name
  this.id = data.id;
  this.x = data.x;
  this.y = data.y;
  this.speed = 1;
  this.animal = data.type;
};

Player.prototype.addSprite = function(game){
  this.sprite = game.add.sprite(this.x, this.y, this.animal);
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.collideWorldBounds = true;
  return this.sprite;
};

Player.prototype.setPosition = function(pos){
  this.sprite.x = pos.x;
  this.sprite.y = pos.y;
  console.log(pos);
  return pos;//TODO: need return?
};

Player.prototype.getPosition = function(){
  var pos = {
    x: this.sprite.x,
    y: this.sprite.y
  };
  return pos;
};