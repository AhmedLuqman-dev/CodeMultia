import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} CodeMultia. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
