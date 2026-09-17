import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const configuredBaseUrl = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : undefined;
const apiBaseUrl = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000/api`
  : configuredBaseUrl?.startsWith('https://') || window.location.protocol !== 'https:'
    ? configuredBaseUrl || '/api'
    : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopsphere_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
