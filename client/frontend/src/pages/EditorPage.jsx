import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import OnlineUsersList from "../components/OnlineUsersList";
import { socket, normalizeRoomUsers } from "../utils/socket";
import "../styles/EditorPage.css";

const USERNAME_KEY = "codemultia_username";

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "javascript", label: "JavaScript" },
];

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef(null);
  const roomIdRef = useRef(roomId);

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [outputRunBy, setOutputRunBy] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  roomIdRef.current = roomId;

  const displayUsers = useMemo(() => {
    if (onlineUsers.length > 0) return onlineUsers;
    if (!username) return [];
    return [{ id: "self", name: username }];
  }, [onlineUsers, username]);

  useEffect(() => {
    const fromState = location.state?.username;
    const fromStorage = sessionStorage.getItem(USERNAME_KEY);
    const resolved = (fromState || fromStorage || "").trim();

    if (!resolved) {
      navigate("/join", { state: { roomId }, replace: true });
      return;
    }

    setUsername(resolved);
    sessionStorage.setItem(USERNAME_KEY, resolved);
  }, [location.state, navigate, roomId]);

  useEffect(() => {
    if (!roomId || !username) return;

    const onRoomUsers = (users) => {
      setOnlineUsers(normalizeRoomUsers(users));
    };
    const onLoadCode = (loadedCode) => setCode(loadedCode);
    const onCodeChange = (newCode) => setCode(newCode);
    const onLanguageChange = (lang) => setLanguage(lang);
    const onReceiveChat = ({ user, message }) =>
      setChatMessages((prev) => [...prev, { user, message }]);
    const onRunStarted = ({ runBy }) => {
      setIsRunning(true);
      setOutput(`Running (started by ${runBy})…`);
      setOutputRunBy(runBy);
    };
    const onCodeOutput = ({ output: result, runBy, error }) => {
      setIsRunning(false);
      setOutput(error ? `[Error] ${result}` : result);
      setOutputRunBy(runBy);
    };
    const onRoomClosed = () => {
      alert("The host has left. This room is now closed.");
      navigate("/");
    };

    socket.on("room-users", onRoomUsers);
    socket.on("load-code", onLoadCode);
    socket.on("code-change", onCodeChange);
    socket.on("language-change", onLanguageChange);
    socket.on("receive-chat", onReceiveChat);
    socket.on("run-started", onRunStarted);
    socket.on("code-output", onCodeOutput);
    socket.on("room-closed", onRoomClosed);

    const joinRoom = () => {
      socket.emit("join", { roomId, username }, (users) => {
        setOnlineUsers(normalizeRoomUsers(users));
      });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("room-users", onRoomUsers);
      socket.off("load-code", onLoadCode);
      socket.off("code-change", onCodeChange);
      socket.off("language-change", onLanguageChange);
      socket.off("receive-chat", onReceiveChat);
      socket.off("run-started", onRunStarted);
      socket.off("code-output", onCodeOutput);
      socket.off("room-closed", onRoomClosed);
      socket.emit("user-left", { roomId: roomIdRef.current });
    };
  }, [roomId, username, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleEditorChange = (value) => {
    setCode(value ?? "");
    socket.emit("code-change", { roomId, code: value ?? "" });
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
    socket.emit("send-chat", { roomId, user: username, message });
    setChatMessages((prev) => [...prev, { user: "You", message, isSelf: true }]);
    setChatInput("");
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput("Executing…");
    socket.emit("run-code", { roomId, code, language, user: username });
  };

  const handleLeaveRoom = () => {
    if (window.confirm("Are you sure you want to leave the room?")) {
      socket.emit("leave-room", { roomId });
      navigate("/");
    }
  };

  if (!username) {
    return null;
  }

  return (
    <div className="editor-page">
      <div className="editor-layout">
        <main className="editor-main">
          <header className="editor-toolbar">
            <div className="editor-toolbar-left">
              <span className="editor-live-dot" title="Connected" />
              <div className="editor-room-block">
                <span className="editor-room-label">Room</span>
                <code className="editor-room-id">{roomId}</code>
              </div>
            </div>
            <div className="editor-toolbar-right">
              <select
                className="editor-lang-select"
                onChange={handleLanguageChange}
                value={language}
                aria-label="Programming language"
              >
                {LANGUAGES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="editor-run-btn"
                onClick={handleRunCode}
                disabled={isRunning}
              >
                {isRunning ? "Running…" : "Run"}
              </button>
            </div>
          </header>

          <div className="editor-monaco-wrap">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
              }}
            />
          </div>

          <div className="editor-output">
            <div className="editor-output-header">
              <span>
                Output
                {outputRunBy && !isRunning && (
                  <span className="editor-output-meta"> · run by {outputRunBy}</span>
                )}
              </span>
              {output && !isRunning && (
                <button
                  type="button"
                  className="editor-output-clear"
                  onClick={() => {
                    setOutput("");
                    setOutputRunBy("");
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <pre className="editor-output-body">
              {isRunning && !output
                ? "Executing…"
                : output || "Click Run to execute your code. Everyone in the room will see the result."}
            </pre>
          </div>
        </main>

        <aside className="editor-sidebar">
          <section className="editor-panel editor-panel-users">
            <OnlineUsersList users={displayUsers} currentUsername={username} />
          </section>

          <section className="editor-panel">
            <h3 className="editor-panel-title">Session</h3>
            <p className="editor-session-name">
              Signed in as <strong>{username}</strong>
            </p>
            <div className="editor-room-row">
              <code className="editor-room-id-sm">{roomId}</code>
              <button
                type="button"
                className="editor-copy-btn"
                onClick={handleCopyRoomId}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button
              type="button"
              className="editor-leave-btn"
              onClick={handleLeaveRoom}
            >
              Leave Room
            </button>
          </section>

          <section className="editor-panel editor-chat-panel">
            <h3 className="editor-panel-title">Live chat</h3>
            <div className="editor-chat-messages">
              {chatMessages.length === 0 ? (
                <p className="editor-chat-empty">No messages yet. Say hello.</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`editor-chat-bubble${msg.isSelf ? " is-self" : ""}`}
                  >
                    <span className="editor-chat-user">{msg.user}</span>
                    <span className="editor-chat-text">{msg.message}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="editor-chat-form" onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message…"
                className="editor-chat-input"
              />
              <button type="submit" className="editor-chat-send">
                Send
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default EditorPage;
