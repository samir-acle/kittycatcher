var Player = function(id){
  this.userID = Math.floor(Math.random() * 100) - 1;
  this.socketID = id;
};

Player.delete = function(id, players){
 for(var i = 0; i < players.length; i++){
   if (players[i].socketID === id) {
     return players.splice(i, 1);
   }
 }
};

module.exports = Player;
