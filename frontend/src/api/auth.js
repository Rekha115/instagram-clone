import api from './axios';

// POST /api/auth/register  body: { username, fullName, email, password }
export const registerRequest = (payload) => api.post('/auth/register', payload);

// POST /api/auth/login  body: { identifier, password } (identifier = email OR username)
export const loginRequest = (payload) => api.post('/auth/login', payload);

// POST /api/auth/logout  (protected)
export const logoutRequest = () => api.post('/auth/logout');

// GET /api/auth/me  (protected) - used to restore session on app load
export const getMeRequest = () => api.get('/auth/me');

// GET /api/auth/check-username/:username -> { available: boolean }
export const checkUsernameRequest = (username) => api.get(`/auth/check-username/${username}`);

