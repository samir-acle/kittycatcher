var Player = function(id){
  // this.userID = userID;
  this.id = id;
  this.x = Math.floor(Math.random() * 200);
  this.y = Math.floor(Math.random() * 200);
  this.type = 'cat';
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

// //TODO: do I need or not????
// Player.generateID = function(players){
//   console.log('generating id');
//   var newID = Math.floor(Math.random() * 100) - 1;
//   var unique = Player.checkUniqueID(newID, players);
//
//   if (unique){
//     return newID;
//   } else {
//     return generateID(players);
//   }
// };
//
// Player.checkUniqueID = function(id, players){
//   console.log('checking id');
//   for(var i =0; i < players.length; i++){
//     if (players[i].userID === id) {
//       return false;
//     } else {
//       return true;
//     }
//   }
// };

module.exports = Player;
