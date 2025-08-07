import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../styles/EditorPage.css";
import { executeCode } from "../utils/judge0";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("join", roomId);

    socket.on("connect", () => {
      console.log("🟢 Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from server");
    });

    socket.on("load-code", (loadedCode) => setCode(loadedCode));
    socket.on("code-change", (newCode) => setCode(newCode));
    socket.on("language-change", (lang) => setLanguage(lang));
    socket.on("receive-chat", ({ user, message }) =>
      setChatMessages((prev) => [...prev, { user, message }])
    );

    socket.on("room-closed", () => {
      alert("🚪 The host has left. This room is now closed.");
      navigate("/");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("load-code");
      socket.off("code-change");
      socket.off("language-change");
      socket.off("receive-chat");
      socket.off("room-closed");
    };
  }, [roomId, navigate]);

  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit("language-change", { roomId, language: newLang });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim() === "") return;
    const message = chatInput.trim();
    const user = username || "Anonymous";
    socket.emit("send-chat", { roomId, user, message });
    setChatMessages((prev) => [...prev, { user: "You", message }]);
    setChatInput("");
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied to clipboard!");
  };

  const handleRunCode = async () => {
    const result = await executeCode(code, language);
    setOutput(result);
  };

  const handleLeaveRoom = () => {
    const confirmLeave = window.confirm("Are you sure you want to leave the room?");
    if (confirmLeave) {
      socket.emit("leave-room", { roomId });
      navigate("/");
    }
  };

  return (
    <div className="collab-container">
      <div className="editor-pane">
        <div className="editor-header">
          <h2>Collaborative Editor</h2>
          <div className="editor-controls">
            <select onChange={handleLanguageChange} value={language}>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button className="run-button" onClick={handleRunCode}>
              Run
            </button>
          </div>
        </div>
        <Editor
          height="60vh"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          onMount={(editor) => (editorRef.current = editor)}
        />

        <div className="terminal-output">
          <h3>Output:</h3>
          <pre>{output || "Click 'Run' to execute your code......"}</pre>
        </div>
      </div>

      <div className="sidebar-pane">
        <div className="room-info-card">
          <h3>Room Info</h3>
          <p className="room-id">
            Room ID: <strong>{roomId}</strong>
            <button className="copy-btn" onClick={handleCopyRoomId}>
              Copy
            </button>
          </p>
          <button className="leave-room-btn" onClick={handleLeaveRoom}>
            Leave Room
          </button>
        </div>

        <div className="username-card">
          <h3>Enter Your Name</h3>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Ahmed"
            className="username-input"
          />
        </div>

        <div className="chat-section">
          <h3>Live Chat</h3>
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className="chat-message">
                <strong className="chat-user">{msg.user}:</strong>{" "}
                <span className="chat-text">{msg.message}</span>
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button type="submit" className="chat-send-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
