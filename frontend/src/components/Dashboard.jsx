// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getUserAndProfile, logout } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserAndProfile();
        if (!mounted) return;
        setData(res);
      } catch (err) {
        console.error('Failed to fetch user/profile:', err);
        // show server raw if present
        const serverRaw = err.raw ? JSON.stringify(err.raw) : null;
        setError((err.message || 'Failed to fetch data') + (serverRaw ? ' — server: ' + serverRaw : ''));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div className="container">
        <h2>Dashboard</h2>
        <p className="small-muted">Loading your data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Dashboard</h2>
        <div className="error">Error: {error}</div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => window.location.reload()}>Retry</button>
          <button style={{ marginLeft: 8 }} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  // your backend returns { userprofile } according to your controller
  // try to normalize it: userprofile.userId is populated user doc
  const userprofile = data?.userprofile || data;
  const user = userprofile?.userId || userprofile?.user || null;
  const profileFields = userprofile ? { ...userprofile } : null;
  // remove populated userId from profileFields for display
  if (profileFields && profileFields.userId) delete profileFields.userId;

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2>Dashboard</h2>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <section style={{ marginTop: 12 }}>
        <h3>User</h3>
        {user ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt="profile"
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            <div>
              <div><strong>Name:</strong> {user.name || '—'}</div>
              <div><strong>Username:</strong> {user.username || '—'}</div>
              <div><strong>Email:</strong> {user.email || '—'}</div>
            </div>
          </div>
        ) : (
          <div className="small-muted">No user object found in response.</div>
        )}
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Profile</h3>
        {profileFields ? (
          <div>
            {Object.keys(profileFields).length === 0 && <div className="small-muted">Profile object empty.</div>}
            {Object.entries(profileFields).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
            ))}
          </div>
        ) : (
          <div className="small-muted">No profile object found in response.</div>
        )}
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Raw response (debug)</h3>
        <pre style={{ background: '#f7fafc', padding: 12, borderRadius: 8, maxHeight: 320, overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </section>
    </div>
  );
}
