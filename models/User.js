const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  language: String,
  socketId: String
});

module.exports = mongoose.model("User", UserSchema);
