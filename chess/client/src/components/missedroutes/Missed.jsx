import React from 'react';
import { Link } from 'react-router-dom';
import './Missed.css';

function NotFound() {
  return (
    <div className="notfound-container">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <div className="notfound-links">
        <Link to="/">
          Go to Homepage
        </Link>
        <Link to="/login">
          Login
        </Link>
        <Link to="/register">
          Register
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
