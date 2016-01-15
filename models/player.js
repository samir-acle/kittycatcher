var Player = function(id, type, width, height){
  // this.userID = userID;
  this.id = id;
  this.x = type === 'human' ? width / 2 : Math.floor(Math.random() * 200);
  this.y = type === 'human' ? height / 2 : Math.floor(Math.random() * 200);
  this.type = type;
};

Player.delete = function(id, players){
  console.log('deleting', id);
   for(var i = 0; i < players.length; i++){
     if (players[i].id === id) {
       return players.splice(i, 1);
     }
   }
};

Player.findById = function(id, players){
  for(var i = 0; i < players.length; i++){
    if (players[i].id === id) {
      return players[i];
    }
  }
 };

module.exports = Player;
