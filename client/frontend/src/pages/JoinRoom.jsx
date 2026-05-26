import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Room.css";

const USERNAME_KEY = "codemultia_username";

const JoinRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledRoom = location.state?.roomId || "";

  const [name, setName] = useState(() => sessionStorage.getItem(USERNAME_KEY) || "");
  const [roomId, setRoomId] = useState(prefilledRoom);
  const trimmedId = roomId.trim();
  const trimmedName = name.trim();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!trimmedId || !trimmedName) return;

    sessionStorage.setItem(USERNAME_KEY, trimmedName);
    navigate(`/editor/${trimmedId}`, { state: { username: trimmedName } });
  };

  return (
    <div className="app-page room-page">
      <div className="room-card">
        <span className="page-badge">Join session</span>
        <h1>Enter a room</h1>
        <p className="room-lead">
          Enter your name and the room ID shared by your teammate to join the live editor.
        </p>

        <form className="room-form" onSubmit={handleJoin}>
          <label htmlFor="join-name" className="room-label">
            Your name
          </label>
          <input
            id="join-name"
            type="text"
            placeholder="e.g. Ahmed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="room-input"
            autoComplete="name"
            autoFocus
            maxLength={32}
          />
          <label htmlFor="room-id" className="room-label">
            Room ID
          </label>
          <input
            id="room-id"
            type="text"
            placeholder="e.g. a3f9c2"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="room-input room-input-mono"
            autoComplete="off"
          />
          <button
            type="submit"
            className="room-btn room-btn-primary"
            disabled={!trimmedId || !trimmedName}
          >
            Join Room
          </button>
        </form>

        <p className="room-footer-text">
          Need a new space?{" "}
          <Link to="/create" className="room-link">
            Create a room
          </Link>
        </p>
      </div>
    </div>
  );
};

export default JoinRoom;
