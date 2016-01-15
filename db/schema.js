var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScoreSchema = new Schema ({
  human: Number,
  cats: Number
});

var ScoreModel = mongoose.model('Score', ScoreSchema);
