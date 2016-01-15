var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ScoreSchema = new Schema ({
  type: String,
  score: Number
});

var ScoreModel = mongoose.model('Score', ScoreSchema);
