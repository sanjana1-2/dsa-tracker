import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty('--bg', '#0d1117');
      root.style.setProperty('--panel', '#161b22');
      root.style.setProperty('--text', '#c9d1d9');
    } else {
      root.style.setProperty('--bg', '#f6f8fa');
      root.style.setProperty('--panel', '#ffffff');
      root.style.setProperty('--text', '#24292f');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDark = () => setDarkMode(!darkMode);

  const location = useLocation();

  return (
    <header className="header-blur dash-header">
      <div>
        <h1 className="text-gradient">DSA Prep Dashboard</h1>
      </div>
      <nav className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
        <Link to="/questions" className={location.pathname === '/questions' ? 'active' : ''}>Question Bank</Link>
        <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>Analytics</Link>
        <button onClick={toggleDark} className="btn outline sm toggle-btn">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
