import React from 'react';
import './Navbar.css';


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <ul className="navbar-links">
          <li><a href="#home" className="active">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#furniture">Furniture</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
      {/* Center Logo */}
      <div className="navbar-center">
        <a href="/" className="logo">HoloDecor</a>
      </div>
      <div className="navbar-right">
        <div className="search-bar">
          <input type="text" placeholder="Search" />
          <button className="search-button">🔍</button>
        </div>
        <div className="icons">
          <span>🛒</span>
          <span>👤</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar