// components/navbar/Navbar.jsx
import './Navbar.css';
import ThemeOption from '../themes/ThemeOption';
import appIcon from '../../assets/icons/app-icon.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Prompt from '../utils/Prompt';
import useAuth from '../../hooks/userAuth'; // ✅ use the hook that reads AuthContext

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  const isActive = (path) => (location.pathname === path ? 'active' : 'inactive');

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowPrompt(true);
  };

  const handleConfirmLogout = () => {
    setShowPrompt(false);
    logout();
    navigate('/logout');
  };

  const handleCancelLogout = () => {
    setShowPrompt(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/chess" className="navbar-brand-link">
            <img src={appIcon} alt="App Icon" className="app-icon" />
            <span className="brand-name">ChessApp</span>
          </Link>
        </div>

        <ul className="navbar-links">
          <li><Link to="/chess" className={isActive('/chess')}>Chess</Link></li>
          {isAuthenticated ? (
            <>
              <li>
                <a href="/logout" className={isActive("/logout")}
                   onClick={handleLogoutClick}>
                  Logout{user?.username ? `: ${user.username}` : ""}
                </a>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className={isActive('/login')}>Login</Link></li>
              <li><Link to="/register" className={isActive('/register')}>Register</Link></li>
            </>
          )}
        </ul>

        <div className="theme-options">
          <ThemeOption theme="light" />
          <ThemeOption theme="dark" />
        </div>
      </nav>
      <Prompt
        open={showPrompt}
        title={`Logout${user?.username ? `: ${user.username}` : ''}`}
        message="Are you sure you want to log out? You will be signed out and redirected."
        okText="Log out"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
};

export default Navbar;
