var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/scores");
var ScoreModel = require("../models/score");

ScoreModel.remove({}, function(err){
  console.log(err);
});

var human = new ScoreModel({type: 'human', score: 100});
var cats = new ScoreModel({type: 'cat', score: 0});

human.save({function(err){
  if (err){
    console.log(err);
  } else {
    console.log('human was saved');
  }
}});

cats.save({function(err){
  if (err){
    console.log(err);
  } else {
    console.log('cats was saved');
  }
}});
