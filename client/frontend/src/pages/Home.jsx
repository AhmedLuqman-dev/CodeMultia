import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="page home-container">
      <div className="home-content">
        <div className="home-description">
          <h1>Welcome to <span className="highlight">CodeMultia</span></h1>
          <p>
            CodeMultia is a collaborative code editor designed for seamless real-time coding, language execution, and instant chat. 
            Perfect for interviews, pair programming, and study groups.
          </p>
          <ul>
            <li>👥 Live multi-user code editing</li>
            <li>💬 Integrated chat support</li>
            <li>🌐 Supports multiple languages</li>
            <li>🔒 Unique room-based collaboration</li>
          </ul>
        </div>
        <div className="home-actions">
          <Link to="/create" className="btn primary">Create Room</Link>
          <Link to="/join" className="btn secondary">Join Room</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
