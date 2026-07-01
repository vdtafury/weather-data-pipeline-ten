import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudLightning } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Cities Archive', path: '/cities' },
    { name: 'Route Planner', path: '/planner' },
    { name: 'Showcase', path: '/showcase' }
  ];

  return (
    <header className="site-header glass-panel">
      <div className="header-container">
        <Link to="/" className="logo">
          <CloudLightning color="#d4af37" size={28} />
          <span>Weather<span style={{color: 'var(--accent)', fontWeight: 800}}>Engine</span></span>
        </Link>
        <nav className="nav-links">
          {navItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
