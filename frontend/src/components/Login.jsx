// src/components/Login.jsx
import React, { useState } from 'react';
import { login, saveToken } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await login(form);
      if (res.token) {
        saveToken(res.token);
        setMsg({ type: 'success', text: 'Logged in' });
        onSuccess && onSuccess(res);
        navigate('/dashboard');
      } else {
        setMsg({ type: 'error', text: res.message || 'Login succeeded but no token returned' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input name="email" value={form.email} onChange={onChange} type="email" required />
        </div>
        <div>
          <label>Password</label>
          <input name="password" value={form.password} onChange={onChange} type="password" required />
        </div>

        {msg && <div className={msg.type === 'error' ? 'error' : 'success'} style={{ marginTop: 8 }}>{msg.text}</div>}

        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
