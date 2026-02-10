const { Server } = require("socket.io");
const Agent = require("./models/Agent");
const Message = require("./models/Message");
const Session = require("./models/Session");
const { translateText } = require("./utils/translate");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log("🟢 SOCKET CONNECTED:", socket.id);

    /* ===================== AGENT JOIN ===================== */
    socket.on("agent_join", async ({ name }) => {
      const agent = await Agent.findOneAndUpdate(
        { name },
        { socketId: socket.id, online: true, language: "en" },
        { upsert: true, new: true }
      );

      const sessions = await Session.find({
        agentId: agent._id,
        status: "active",
      });

      socket.emit("existing_sessions", sessions);
    });

    /* ===================== USER JOIN ===================== */
    socket.on("user_join", async (user) => {
      const agent = await Agent.findOne({ online: true });
      if (!agent) {
        socket.emit("bot_message", { message: "All agents are busy 🙏" });
        return;
      }

      const sessionId = `${user.id}_${Date.now()}`;

      await Session.create({
        sessionId,
        userId: user.id,
        agentId: agent._id,
        language: user.language || "en",
        status: "active",
      });

      socket.join(sessionId);

      io.to(agent.socketId).emit("new_session", {
        sessionId,
        user,
      });

      socket.emit("session_started", { sessionId });
    });

    /* ===================== UPDATE LANGUAGE ===================== */
    socket.on("update_language", async ({ sessionId, language }) => {
      await Session.updateOne({ sessionId }, { language });
      console.log("🌐 User language updated:", language);
    });

    /* ===================== JOIN SESSION ===================== */
    socket.on("join_session", (sessionId) => {
      socket.join(sessionId);
    });

    /* ===================== SEND MESSAGE ===================== */
    socket.on("send_message", async (data) => {
      const session = await Session.findOne({ sessionId: data.sessionId });
      if (!session) return;

      // 🔥 SAVE MESSAGE (MongoDB generates _id)
      const msg = await Message.create({
        sessionId: data.sessionId,
        sender: data.sender,
        message: data.message,
        type: "text",
      });

      let translated = data.message;

      // USER → AGENT (English)
      if (data.sender === "user") {
        translated = await translateText(data.message, "en");
      }

      // AGENT → USER (user language)
      if (data.sender === "agent") {
        translated = await translateText(
          data.message,
          session.language || "en"
        );
      }

      io.to(data.sessionId).emit("receive_message", {
        messageId: msg._id.toString(), // 🔥 REQUIRED
        sessionId: data.sessionId,
        sender: data.sender,
        message: data.message,
        translated,
        time: new Date(),
      });
    });

    /* ======================================================
       TRANSLATE ON DEMAND (FINAL FIX)
    ====================================================== */
    socket.on("translate_text", async (data) => {
      const { messageId, text, lang } = data;

      console.log("🌐 [TRANSLATE_REQUEST]");
      console.log("   MessageId:", messageId);
      console.log("   Text:", text);
      console.log("   Target:", lang);

      try {
        const translated = await translateText(text, lang);

        socket.emit("translated_text", {
          messageId,               // 🔥 CRITICAL
          translated: translated || text,
          lang,
        });

      } catch (err) {
        console.error("❌ [TRANSLATE_ERROR]", err.message);

        socket.emit("translated_text", {
          messageId,               // 🔥 STILL REQUIRED
          translated: text,
          lang,
        });
      }
    });

    /* ===================== DISCONNECT ===================== */
    socket.on("disconnect", async () => {
      await Agent.updateOne(
        { socketId: socket.id },
        { online: false }
      );
    });
  });
}

module.exports = { initSocket };
