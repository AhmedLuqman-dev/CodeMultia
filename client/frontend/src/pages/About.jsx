import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <div className="page about-container">
      <h2>About <span className="highlight">CodeMultia - By Mohd Ahmed Luqman</span></h2>
      <p>
        <strong>CodeMultia</strong> is a collaborative development platform tailored for live coding. 
        Powered by WebSockets and Judge0 API, it offers fast synchronization, multi-language support, and a seamless coding experience.
      </p>
      <div className="features-card">
        <h3>🔧 Features</h3>
        <ul>
          <li>Real-time code collaboration</li>
          <li>Instant chat messaging</li>
          <li>Multiple programming languages</li>
          <li>Room-based session management</li>
          <li>Modern Monaco code editor integration</li>
          
        </ul>
      </div>
    </div>
  );
};

export default About;
