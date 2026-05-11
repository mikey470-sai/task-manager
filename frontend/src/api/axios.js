import axios from 'axios';

const api = axios.create({
  baseURL: 'https://task-manager-production-f0dd.up.railway.app'
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;