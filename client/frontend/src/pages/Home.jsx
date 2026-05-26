import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const features = [
  {
    title: "Live editing",
    description: "See every keystroke sync instantly across all collaborators in the room.",
  },
  {
    title: "Built-in chat",
    description: "Discuss ideas without leaving the editor or switching apps.",
  },
  {
    title: "Run your code",
    description: "Execute Python, C++, Java, C, and JavaScript with one click.",
  },
  {
    title: "Private rooms",
    description: "Share a room ID and start pairing in seconds—no account required.",
  },
];

const Home = () => {
  return (
    <div className="app-page home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-badge">Collaborative coding platform</span>
          <h1>
            Build together in
            <span className="home-title-accent"> real time</span>
          </h1>
          <p className="home-lead">
            CodeMultia brings pair programming, interviews, and study sessions into one
            shared workspace—with Monaco Editor, instant sync, and integrated chat.
          </p>
          <div className="home-cta">
            <Link to="/create" className="home-btn home-btn-primary">
              Create Room
            </Link>
            <Link to="/join" className="home-btn home-btn-secondary">
              Join Room
            </Link>
          </div>
          <div className="home-stats">
            <div className="home-stat">
              <strong>5</strong>
              <span>Languages</span>
            </div>
            <div className="home-stat-divider" aria-hidden="true" />
            <div className="home-stat">
              <strong>0</strong>
              <span>Sign-up needed</span>
            </div>
            <div className="home-stat-divider" aria-hidden="true" />
            <div className="home-stat">
              <strong>Live</strong>
              <span>Sync & chat</span>
            </div>
          </div>
        </div>

        <div className="home-preview" aria-hidden="true">
          <div className="home-preview-window">
            <div className="home-preview-toolbar">
              <span className="home-dot home-dot-red" />
              <span className="home-dot home-dot-yellow" />
              <span className="home-dot home-dot-green" />
              <span className="home-preview-title">collab-room.py</span>
            </div>
            <pre className="home-preview-code">
              <code>
                <span className="code-keyword">def</span>{" "}
                <span className="code-fn">solve</span>(nums):
                {"\n"}
                {"    "}
                <span className="code-keyword">return</span>{" "}
                <span className="code-builtins">sum</span>(nums)
                {"\n"}
                {"\n"}
                <span className="code-comment"># synced with your team</span>
                {"\n"}
                <span className="code-fn">print</span>(
                <span className="code-fn">solve</span>([1, 2, 3]))
                <span className="home-cursor" />
              </code>
            </pre>
          </div>
          <div className="home-preview-chat">
            <p className="home-chat-label">Live chat</p>
            <div className="home-chat-bubble home-chat-them">
              <span>Alex</span> Ready when you are
            </div>
            <div className="home-chat-bubble home-chat-you">
              <span>You</span> Running tests now
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <h2>Everything you need to code as a team</h2>
        <div className="home-features-grid">
          {features.map((feature) => (
            <article key={feature.title} className="home-feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
