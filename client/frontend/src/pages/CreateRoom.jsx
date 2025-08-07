import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../styles/Room.css";

const CreateRoom = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    const newRoomId = uuidv4().slice(0, 6);
    setRoomId(newRoomId);
    navigate(`/editor/${newRoomId}`);
  };

  return (
    <div className="create-room-container">
      <div className="create-room-card">
        <h2>Create a New Collaboration Room</h2>
        <button onClick={handleCreate} className="generate-btn">
          Generate & Join Room
        </button>

        {roomId && (
          <p className="room-id-display">
            Your Room ID: <strong>{roomId}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;
