import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="brand-link">
          <img src={logo} alt="CodeMultia Logo" className="brand-icon" />
          CodeMultia
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/join">Join Room</Link></li>
        <li><Link to="/create">Create Room</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
