const express = require("express");
const http = require("http");
const cors = require("cors");
require("./db");

const uploadRoutes = require("./routes/upload");
const messageRoutes = require("./routes/messages"); 
const { initSocket } = require("./socket");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", uploadRoutes);
app.use("/api/messages", messageRoutes); // 🔥 ADD

const server = http.createServer(app);
initSocket(server);

server.listen(7001, () => {
  console.log("Server running on port 7001");
});
