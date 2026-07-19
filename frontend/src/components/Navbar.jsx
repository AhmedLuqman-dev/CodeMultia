import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/join", label: "Join Room" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="" className="navbar-logo-img" />
          <span className="navbar-brand-text">
            Code<span className="navbar-brand-accent">Multia</span>
          </span>
        </Link>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`navbar-menu ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <ul className="navbar-links">
            {navItems.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " is-active" : ""}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="navbar-actions">
            <Link to="/create" className="navbar-cta">
              Create Room
            </Link>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
