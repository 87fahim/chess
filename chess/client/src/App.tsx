import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Layout from './components/Layout';
import Missed from './components/missedroutes/Missed';
import Logout from './components/logout/Logout';
import Chess from './components/chess';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="background-overlay" />

      <div className="app-content">
        <Navbar />

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
            <Route path="chess" element={<Chess showMoveList orientation="white" allowUndo allowReset />} />

            {/* 404 */}
            <Route path="*" element={<Missed />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
