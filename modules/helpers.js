module.exports = {
  findRoom: function(rooms, max, roomPlayers){
    console.log('room players in findRoom',roomPlayers);
    for (var i = 0; i < rooms.length; i++){
      var room = rooms[i];
      if (roomPlayers[room] < max){
        return room;
      }
    }
    return false;
  },
  getPlayers: function(room, clients, players) {

    if (!players) return [];

    var playersInRoom = [];

    players.forEach(function(player) {
      if (clients[player.id] === room) {
        playersInRoom.push(player);
      }
    });

    return playersInRoom;
  }
};
