import React, { useState } from 'react'
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Family Research Manager</h2>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/people">People</Link></li>
        <li><Link to="/sources">Sources</Link></li>
        <li><Link to="/reports">Reports</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;