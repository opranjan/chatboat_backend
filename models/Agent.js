const mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
  name: String,
  socketId: String,
  online: Boolean
});

module.exports = mongoose.model("Agent", AgentSchema);
