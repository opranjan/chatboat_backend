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
        {
          socketId: socket.id,
          online: true,
          language: "en",
        },
        { upsert: true, new: true }
      );

      console.log("🟢 Agent online:", agent.name);

      const sessions = await Session.find({
        agentId: agent._id,
        status: "active",
      });

      socket.emit("existing_sessions", sessions);
    });

    /* ===================== USER JOIN (ALWAYS CONNECT) ===================== */
    socket.on("user_join", async (user) => {
      // 🔥 Always get or create agent
      let agent = await Agent.findOne();

      if (!agent) {
        agent = await Agent.create({
          name: "Agent_01",
          online: true,
        });
      }

      // 🔥 Force agent online (auto-heal)
      agent.online = true;
      await agent.save();

      const sessionId = `${user.id}_${Date.now()}`;

      await Session.create({
        sessionId,
        userId: user.id,
        agentId: agent._id,
        language: user.language || "en",
        status: "active",
      });

      socket.join(sessionId);

      // Notify agent if connected
      if (agent.socketId) {
        io.to(agent.socketId).emit("new_session", {
          sessionId,
          user,
        });
      }

      // 🔥 ALWAYS establish session
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

      // Save message
      const msg = await Message.create({
        sessionId: data.sessionId,
        sender: data.sender,
        message: data.message,
        type: "text",
      });

      let translated = data.message;

      if (data.sender === "user") {
        translated = await translateText(data.message, "en");
      }

      if (data.sender === "agent") {
        translated = await translateText(
          data.message,
          session.language || "en"
        );
      }

      io.to(data.sessionId).emit("receive_message", {
        messageId: msg._id.toString(),
        sessionId: data.sessionId,
        sender: data.sender,
        message: data.message,
        translated,
        time: new Date(),
      });
    });

    /* ===================== TRANSLATE ON DEMAND ===================== */
    socket.on("translate_text", async ({ messageId, text, lang }) => {
      try {
        const translated = await translateText(text, lang);

        socket.emit("translated_text", {
          messageId,
          translated: translated || text,
          lang,
        });
      } catch (err) {
        socket.emit("translated_text", {
          messageId,
          translated: text,
          lang,
        });
      }
    });

    /* ===================== DISCONNECT ===================== */
    socket.on("disconnect", async () => {
      console.log("⚠️ Socket disconnected:", socket.id);
      // ❌ Do NOT mark agent offline
      // Agent auto-reconnects on next agent_join
    });
  });
}

module.exports = { initSocket };
