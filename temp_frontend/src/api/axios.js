import axios from 'axios';

// The backend (server.js) mounts everything under /api and reads
// CLIENT_URL for CORS. Default matches backend's default PORT=5000.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  // The backend also sets an httpOnly cookie (see utils/generateToken.js
  // -> sendTokenResponse), so we send credentials on every request.
  withCredentials: true,
});

// Backend returns the JWT in the JSON body too (for Bearer-header
// clients). We store it as a fallback/primary auth mechanism so auth
// keeps working even if the cookie is dropped (e.g. cross-site deploys).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ig_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error shape. The backend returns either
//   { success: false, message }
// or (422 validation) { success: false, message, errors: [{field, message}] }
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const message =
      data?.errors?.[0]?.message || data?.message || error.message || 'Something went wrong';
    return Promise.reject(Object.assign(error, { friendlyMessage: message }));
  }
);

export default api;
export { API_URL };
