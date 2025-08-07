const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: CLIENT_URL,
  methods: ["GET", "POST"]
}));

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

const rooms = {};
const roomHosts = {};

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = { code: "", language: "python" };
      roomHosts[roomId] = socket.id;
      console.log(`👑 ${socket.id} is host of room ${roomId}`);
    }

    socket.emit("load-code", rooms[roomId].code || "");
    socket.emit("language-change", rooms[roomId].language || "python");
  });

  socket.on("code-change", ({ roomId, code }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].code = code;
    socket.to(roomId).emit("code-change", code);
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].language = language;
    socket.to(roomId).emit("language-change", language);
  });

  socket.on("send-chat", ({ roomId, user, message }) => {
    socket.to(roomId).emit("receive-chat", { user, message });
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`🚪 ${socket.id} left room ${roomId}`);

    if (roomHosts[roomId] === socket.id) {
      console.log(`❌ Host ${socket.id} left. Closing room ${roomId}`);
      socket.to(roomId).emit("room-closed");
      delete rooms[roomId];
      delete roomHosts[roomId];
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    for (const roomId in roomHosts) {
      if (roomHosts[roomId] === socket.id) {
        console.log(`❌ Host ${socket.id} disconnected. Closing room ${roomId}`);
        socket.to(roomId).emit("room-closed");
        delete rooms[roomId];
        delete roomHosts[roomId];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
