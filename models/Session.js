// const mongoose = require("mongoose");

// const SessionSchema = new mongoose.Schema({
//   sessionId: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   userId: {
//     type: String,
//     required: true,
//   },
//   agentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Agent",
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["active", "closed", "waiting"], // ✅ ADD active
//     default: "active",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Session", SessionSchema);






const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true },
  userId: String,
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  language: { type: String, default: "en" }, // 🔥 REQUIRED
  status: {
    type: String,
    enum: ["active", "closed", "waiting"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Session", SessionSchema);

