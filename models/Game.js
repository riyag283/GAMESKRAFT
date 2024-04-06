const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  _id: String,
  name: String,
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
