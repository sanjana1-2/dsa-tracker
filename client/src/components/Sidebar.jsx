import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Activity, Sun, Moon } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.body.classList.toggle('light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo text-gradient mono">{'<DSA 90/>'}</h2>
        <p className="sub mono">Pattern-First Execution</p>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/questions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <List size={18} />
          <span>Question Bank</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Activity size={18} />
          <span>Analytics</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={() => setDark(d => !d)}
          className="theme-toggle"
          aria-label="Toggle theme"
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
