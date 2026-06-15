// src/components/Register.jsx
import React, { useState } from 'react';
import { registerJSON, registerFormData, saveToken } from '../api';

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [file, setFile] = useState(null);
  const [useFormData, setUseFormData] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function onFileChange(e) {
    setFile(e.target.files[0] || null);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setSending(true);
    try {
      let res;
      if (useFormData) {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('username', form.username);
        fd.append('email', form.email);
        fd.append('password', form.password);
        if (file) fd.append('profilePicture', file);
        console.log('Sending FormData to:', /* optional */);
        res = await registerFormData(fd);
      } else {
        const base64 = await fileToBase64(file);
        const payload = { ...form, profilePicture: base64 };
        console.log('Sending JSON payload to register:', payload);
        res = await registerJSON(payload);
      }

      console.log('Register response:', res);
      if (res.token) saveToken(res.token);
      setMsg({ type: 'success', text: res.message || 'Registered' });
      onSuccess && onSuccess(res);
    } catch (err) {
      // err may be Error with .raw (from api.js)
      console.error('Register error', err);
      const serverDetail = err.raw ? JSON.stringify(err.raw) : null;
      const text = `${err.message || 'Registration failed'}${serverDetail ? ' — server: ' + serverDetail : ''}`;
      setMsg({ type: 'error', text });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container">
      <h2>Create account</h2>
      <p className="small-muted">You can toggle file upload method (FormData requires backend support such as multer)</p>

      <label style={{ display: 'block', marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={useFormData}
          onChange={() => setUseFormData(v => !v)}
          style={{ marginRight: 8 }}
        />
        Use multipart/form-data (file upload)
      </label>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input name="name" value={form.name} onChange={onChange} required />
        </div>
        <div>
          <label>Username</label>
          <input name="username" value={form.username} onChange={onChange} required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" value={form.email} onChange={onChange} type="email" required />
        </div>
        <div>
          <label>Password</label>
          <input name="password" value={form.password} onChange={onChange} type="password" required />
        </div>
        <div>
          <label>Profile picture (optional)</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
        </div>

        {msg && <div className={msg.type === 'error' ? 'error' : 'success'} style={{ marginTop: 8 }}>{msg.text}</div>}

        <button type="submit" disabled={sending} style={{ marginTop: 12 }}>
          {sending ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
