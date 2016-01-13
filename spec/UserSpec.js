describe("User", function() {
  var io = require('socket.io-client');
  var socket;
  var Player = require('./models/player.js');

  beforeEach(function(done){
    socket = io.connect('http://localhost:3000', {
      'reconnection delay' : 0,
      'reopen delay' : 0,
      'force new connection' : true
    });

    socket.on('connect', function(){
      console.log('worked...');
      done();
    });

    socket.on('disconnect', function() {
      console.log('disonnceted... ');
    });
  });


  // it("should have a corresponding cat on the page", function(){
  //
  // });
  //
  // it("should be able to see other users cats on the page", function(){
  //
  // });

  describe("when a user goes to this site", function(){
    it("a userId should be generated", function(done){

    });

    it("should receive a userID", function(done){

    });

    it("should be the only user with its userID", function(){
      var players = [];
    });
  });

  describe("when a user exits the site", function(){
    it("should be deleted from memory", function(){

    });
  });

});

describe("Cat", function(){

  it("should be associated with a userID", function(){

  });

  it("should respond to input from the user with the same userID", function(){

  });

  it("should not respond to input from other users", function(){

  });
});
