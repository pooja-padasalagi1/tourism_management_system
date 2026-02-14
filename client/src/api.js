import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api'
});

// attach token automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tms_token');
  if (token) cfg.headers = { ...cfg.headers, Authorization: 'Bearer ' + token };
  return cfg;
});

export default api;
