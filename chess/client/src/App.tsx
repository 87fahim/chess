import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Layout from './components/Layout';
import Missed from './components/missedroutes/Missed';
import Logout from './components/logout/Logout';
import ChessPage from './components/chess/ChessPage';
import './App.css';

function App() {
  const location = useLocation();
  const isChessRoute = location.pathname.startsWith('/chess');

  return (
    <div className={`App ${isChessRoute ? 'app-theme--chess' : 'app-theme--site'}`}>
      <div className="background-overlay" />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Redirect root to chess */}
            <Route index element={<Navigate to="/chess" replace />} />

            {/* Public */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="logout" element={<Logout />} />
            <Route path="unauthorized" element={<div>Unauthorized</div>} />

            {/* Chess */}
            <Route path="chess" element={<ChessPage />} />

            {/* 404 */}
            <Route path="*" element={<Missed />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
