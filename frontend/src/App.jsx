// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import { logout, getToken } from './api';

function Home() {
  return (
    <div className="container">
      <h2>Welcome</h2>
      <p className="small-muted">This is a minimal frontend for your auth endpoints.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          {getToken() ? <span className="small-muted">Signed in ✓</span> : <span className="small-muted">Not signed in</span>}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register onSuccess={() => console.log('registered')} />} />
        <Route path="/login" element={<Login onSuccess={() => console.log('logged in')} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
