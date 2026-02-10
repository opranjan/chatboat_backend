const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

/**
 * GET /api/messages/:sessionId
 * Returns full chat history
 */
router.get("/:sessionId", async (req, res) => {
  try {
    const messages = await Message.find({
      sessionId: req.params.sessionId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("❌ Load messages failed:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

module.exports = router;
