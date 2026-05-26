import React from "react";
import "../styles/About.css";

const features = [
  {
    title: "Real-time sync",
    description: "Every edit is pushed instantly to everyone in the room via WebSockets.",
  },
  {
    title: "Integrated chat",
    description: "Talk through problems without leaving the editor.",
  },
  {
    title: "Code execution",
    description: "Run Python, C++, Java, C, and JavaScript through the Judge0 API.",
  },
  {
    title: "Room sessions",
    description: "Create or join a room with a short ID—no account required.",
  },
  {
    title: "Monaco Editor",
    description: "A professional editor experience with syntax highlighting.",
  },
  {
    title: "Host controls",
    description: "When the host leaves, the room closes for everyone.",
  },
];

const stack = ["React", "Vite", "Socket.IO", "Express", "Monaco Editor", "Judge0"];

const About = () => {
  return (
    <div className="app-page about-page">
      <header className="about-hero">
        <span className="page-badge">About the project</span>
        <h1>
          Built for
          <span className="page-accent"> collaborative coding</span>
        </h1>
        <p className="about-lead">
          <strong>CodeMultia</strong> is a real-time pair-programming platform for interviews,
          study groups, and team sessions. Share a room, write code together, chat, and run it—all
          in one place.
        </p>
      </header>

      <section className="about-stack">
        <h2>Powered by</h2>
        <ul className="about-stack-list">
          {stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="about-features">
        <h2>What you can do</h2>
        <div className="about-features-grid">
          {features.map((feature) => (
            <article key={feature.title} className="about-feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="about-credit">
        Created by <strong>Mohd Ahmed Luqman</strong>
      </p>
    </div>
  );
};

export default About;
