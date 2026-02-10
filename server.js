const express = require("express");
const http = require("http");
const cors = require("cors");
require("./db");

const uploadRoutes = require("./routes/upload");
const { initSocket } = require("./socket");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", uploadRoutes);

const server = http.createServer(app);
initSocket(server);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
