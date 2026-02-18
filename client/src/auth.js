import api from './api';

export function setToken(token) {
  localStorage.setItem('tms_token', token);
  try { window.dispatchEvent(new Event('tms_auth_changed')); } catch(e){}
}

export function getToken() {
  return localStorage.getItem('tms_token');
}

export function setUser(user) {
  localStorage.setItem('tms_user', JSON.stringify(user));
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('tms_user')); } catch { return null; }
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data;
  setToken(token);
  setUser(user);
  return res.data;
}

export async function register(name, email, password, role='user') {
  const res = await api.post('/auth/register', { name, email, password, role });
  const { token, user } = res.data;
  setToken(token);
  setUser(user);
  return res.data;
}

export function logout() {
  localStorage.removeItem('tms_token');
  localStorage.removeItem('tms_user');
  try { window.dispatchEvent(new Event('tms_auth_changed')); } catch(e){}
}
