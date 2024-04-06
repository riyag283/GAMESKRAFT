const mongoose = require("mongoose");

const gameInfoSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      required: true,
    },
    skillScore: {
      type: Number,
      required: true,
    },
    interestLevel: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
); // This is important if you don't want Mongoose to automatically add an _id field to each GameInfo object

const userSchema = new mongoose.Schema({
  _id: String,
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  blockedIds: {
    type: [String],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  gameInterest: {
    type: [gameInfoSchema], // This tells Mongoose that gameInterest is an array of GameInfo objects
    required: false,
  },
});

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
