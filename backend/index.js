const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const axios = require("axios");
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const IS_PROD = process.env.NODE_ENV === "production";

const MAX_CODE_LENGTH = 64 * 1024;
const MAX_ROOM_ID_LENGTH = 64;
const MAX_USERNAME_LENGTH = 32;
const MAX_CHAT_LENGTH = 2000;
const ROOM_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

app.use(cors({
  origin: CLIENT_URL,
  methods: ["GET", "POST"]
}));

app.use(express.json({ limit: "256kb" }));

const languageMap = {
  python: 71,
  cpp: 54,
  c: 50,
  java: 62,
  javascript: 63,
};

function isValidRoomId(roomId) {
  return (
    typeof roomId === "string" &&
    roomId.length > 0 &&
    roomId.length <= MAX_ROOM_ID_LENGTH &&
    ROOM_ID_PATTERN.test(roomId)
  );
}

function sanitizeUsername(name) {
  if (typeof name !== "string") return "Anonymous";
  const trimmed = name.trim().slice(0, MAX_USERNAME_LENGTH);
  return trimmed || "Anonymous";
}

function isAllowedLanguage(language) {
  return typeof language === "string" && language in languageMap;
}

function sanitizeCode(code) {
  if (typeof code !== "string") return "";
  if (code.length > MAX_CODE_LENGTH) {
    throw new Error(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`);
  }
  return code;
}

async function executeOnJudge0(source_code, language) {
  const safeCode = sanitizeCode(source_code);
  if (!isAllowedLanguage(language)) {
    throw new Error("Unsupported language");
  }
  const langId = languageMap[language];
  if (!process.env.JUDGE0_API_KEY) {
    throw new Error("Server misconfiguration: JUDGE0_API_KEY is not set");
  }

  const apiUrl = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com/submissions";
  const headers = {
    "content-type": "application/json",
    "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
    "X-RapidAPI-Host": process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com",
  };

  const resp = await axios.post(`${apiUrl}?base64_encoded=false&wait=true`, {
    source_code: safeCode,
    language_id: langId,
  }, { headers, timeout: 30000, maxContentLength: 1024 * 1024 });

  const data = resp.data || {};
  return data.stderr || data.compile_output || data.stdout || "No output";
}

app.post("/api/execute", async (req, res) => {
  try {
    const { source_code, language } = req.body;
    const output = await executeOnJudge0(source_code, language);
    return res.json({ output });
  } catch (err) {
    console.error("Execution error:", err?.response?.data || err.message || err);
    const serverMessage = err?.response?.data || err.message || "Execution error";
    return res.status(500).json({
      error: "Execution error",
      ...(IS_PROD ? {} : { details: serverMessage }),
    });
  }
});

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

const rooms = {};
const roomHosts = {};
const roomUsers = {};

function getRoomUserList(roomId) {
  const users = roomUsers[roomId];
  if (!users) return [];
  return Object.entries(users)
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

function syncRoomUsers(roomId) {
  const list = getRoomUserList(roomId);
  io.to(roomId).emit("room-users", list);
  return list;
}

function removeUserFromRoom(socket, roomId) {
  if (!roomId || !roomUsers[roomId]) return;
  delete roomUsers[roomId][socket.id];
  if (Object.keys(roomUsers[roomId]).length === 0) {
    delete roomUsers[roomId];
  } else {
    syncRoomUsers(roomId);
  }
}

function closeRoom(roomId) {
  io.to(roomId).emit("room-closed");
  delete rooms[roomId];
  delete roomHosts[roomId];
  delete roomUsers[roomId];
}

io.on("connection", (socket) => {
  socket.on("join", (payload, callback) => {
    const roomId = typeof payload === "string" ? payload : payload?.roomId;
    const username = (
      typeof payload === "object" ? payload?.username : null
    )?.trim() || "Anonymous";

    if (!isValidRoomId(roomId)) return;

    const safeName = sanitizeUsername(username);
    const previousRoom = socket.data.roomId;
    if (previousRoom && previousRoom !== roomId) {
      removeUserFromRoom(socket, previousRoom);
      socket.leave(previousRoom);
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = safeName;

    if (!rooms[roomId]) {
      rooms[roomId] = { code: "", language: "python", lastOutput: null };
      roomHosts[roomId] = socket.id;
    }

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = {};
    }
    roomUsers[roomId][socket.id] = safeName;

    socket.emit("load-code", rooms[roomId].code || "");
    socket.emit("language-change", rooms[roomId].language || "python");
    if (rooms[roomId].lastOutput) {
      socket.emit("code-output", rooms[roomId].lastOutput);
    }

    const list = syncRoomUsers(roomId);
    if (typeof callback === "function") {
      callback(list);
    }
  });

  socket.on("user-left", ({ roomId }) => {
    const id = roomId || socket.data.roomId;
    if (!id) return;
    removeUserFromRoom(socket, id);
    socket.leave(id);
    if (socket.data.roomId === id) {
      delete socket.data.roomId;
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    if (!isValidRoomId(roomId) || !rooms[roomId]) return;
    if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) return;
    rooms[roomId].code = code;
    socket.to(roomId).emit("code-change", code);
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (!isValidRoomId(roomId) || !rooms[roomId] || !isAllowedLanguage(language)) return;
    rooms[roomId].language = language;
    socket.to(roomId).emit("language-change", language);
  });

  socket.on("send-chat", ({ roomId, user, message }) => {
    if (!isValidRoomId(roomId)) return;
    if (typeof message !== "string" || !message.trim()) return;
    const safeMessage = message.trim().slice(0, MAX_CHAT_LENGTH);
    const safeUser = sanitizeUsername(user);
    socket.to(roomId).emit("receive-chat", { user: safeUser, message: safeMessage });
  });

  socket.on("run-code", async ({ roomId, code, language, user }) => {
    if (!isValidRoomId(roomId) || !rooms[roomId]) return;

    const runBy = sanitizeUsername(user);
    io.to(roomId).emit("run-started", { runBy });

    try {
      const output = await executeOnJudge0(code, language);
      const payload = { output, runBy, error: false };
      rooms[roomId].lastOutput = payload;
      io.to(roomId).emit("code-output", payload);
    } catch (err) {
      const message = IS_PROD
        ? "Execution failed"
        : (err?.response?.data
          ? JSON.stringify(err.response.data)
          : err.message || "Execution failed");
      const payload = { output: message, runBy, error: true };
      rooms[roomId].lastOutput = payload;
      io.to(roomId).emit("code-output", payload);
    }
  });

  socket.on("leave-room", ({ roomId }) => {
    const id = roomId || socket.data.roomId;
    if (!id) return;

    const isHost = roomHosts[id] === socket.id;
    removeUserFromRoom(socket, id);
    socket.leave(id);
    delete socket.data.roomId;

    if (isHost) {
      closeRoom(id);
    }
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const isHost = roomHosts[roomId] === socket.id;
    removeUserFromRoom(socket, roomId);

    if (isHost) {
      closeRoom(roomId);
    }
  });
});

server.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});
