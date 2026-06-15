// src/api.js
const DEFAULT_BASE = 'http://localhost:8080/users';
const API_BASE = import.meta.env.VITE_API_BASE ? import.meta.env.VITE_API_BASE.replace(/\/$/, '') : DEFAULT_BASE;

// small helper to build url
function url(path) {
  // allow path with or without leading slash
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };

  if (body && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body; // browser will set multipart boundary
  }

  try {
    const res = await fetch(url(path), opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = text; }

    if (!res.ok) {
      const message = (data && data.message) || res.statusText || 'Request failed';
      const error = new Error(message);
      error.status = res.status;
      error.raw = data;
      throw error;
    }

    return data;
  } catch (err) {
    // network error or thrown error -- rethrow with more context
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      // very common when backend is offline or CORS blocked
      const e = new Error('Network error: failed to fetch. Is the backend running and CORS allowed?');
      e.original = err;
      throw e;
    }
    throw err;
  }
}

/*
  NOTE: backend endpoints:
    POST http://localhost:8080/users/register
    POST http://localhost:8080/users/login
*/

export async function registerJSON(payload) {
  // calls POST http://.../users/register
  return request('/register', { method: 'POST', body: payload });
}

export async function registerFormData(formData) {
  // same but with FormData
  return request('/register', { method: 'POST', body: formData });
}

export async function login(credentials) {
  return request('/login', { method: 'POST', body: credentials });
}

export function saveToken(token) {
  localStorage.setItem('auth_token', token);
}

export function getToken() {
  return localStorage.getItem('auth_token');
}

export function logout() {
  localStorage.removeItem('auth_token');
}
export async function getUserAndProfile() {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // If no token, request will still be attempted (server may accept ?token)
  return request('/get_user_and_profile', { method: 'GET', headers });
}