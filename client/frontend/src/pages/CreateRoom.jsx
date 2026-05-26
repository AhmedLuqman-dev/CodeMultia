import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../styles/Room.css";

const USERNAME_KEY = "codemultia_username";

const CreateRoom = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(() => sessionStorage.getItem(USERNAME_KEY) || "");

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newRoomId = uuidv4().slice(0, 6);
    sessionStorage.setItem(USERNAME_KEY, trimmedName);
    navigate(`/editor/${newRoomId}`, { state: { username: trimmedName } });
  };

  return (
    <div className="app-page room-page">
      <div className="room-card">
        <span className="page-badge">New session</span>
        <h1>Create a room</h1>
        <p className="room-lead">
          Start a fresh collaboration space. You will get a short room ID to share with others.
        </p>

        <form className="room-form" onSubmit={handleCreate}>
          <label htmlFor="create-name" className="room-label">
            Your name
          </label>
          <input
            id="create-name"
            type="text"
            placeholder="e.g. Ahmed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="room-input"
            autoComplete="name"
            autoFocus
            maxLength={32}
          />
          <button
            type="submit"
            className="room-btn room-btn-primary"
            disabled={!name.trim()}
          >
            Generate &amp; Join Room
          </button>
        </form>

        <p className="room-footer-text">
          Already have a room ID?{" "}
          <Link to="/join" className="room-link">
            Join instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CreateRoom;
