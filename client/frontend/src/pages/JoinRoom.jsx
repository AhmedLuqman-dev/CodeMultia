import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Room.css";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/editor/${roomId.trim()}`);
    }
  };

  return (
    <div className="create-room-container">
      <div className="create-room-card">
        <h2>Join an Existing Room</h2>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="room-input"
        />
        <button onClick={handleJoin} className="generate-btn">
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
