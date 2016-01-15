require('../db/schema');
var mongoose = require('mongoose');
var ScoreModel = mongoose.model('Score');

module.exports = ScoreModel;
