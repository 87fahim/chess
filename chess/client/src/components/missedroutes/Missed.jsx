import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ margin: '0 10px' }}>
          Go to Homepage
        </Link>
        <Link to="/login" style={{ margin: '0 10px' }}>
          Login
        </Link>
        <Link to="/register" style={{ margin: '0 10px' }}>
          Register
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
