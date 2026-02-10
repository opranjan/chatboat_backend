const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sessionId: String,
  sender: String, // user | agent
  type: String,   // text | voice
  message: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
