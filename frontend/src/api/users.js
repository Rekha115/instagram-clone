import api from './axios';

// GET /api/users/search?q=&page=&limit=
export const searchUsersRequest = (q, params = {}) =>
  api.get('/users/search', { params: { q, ...params } });

// GET /api/users/suggested?limit=  (protected)
export const getSuggestedUsersRequest = (limit = 5) =>
  api.get('/users/suggested', { params: { limit } });

// PATCH /api/users/me  body: { fullName, bio, website, gender }  (protected)
export const updateProfileRequest = (payload) => api.patch('/users/me', payload);

// PATCH /api/users/me/avatar  multipart field name MUST be "profilePicture"  (protected)
export const updateAvatarRequest = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return api.patch('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// GET /api/users/me/saved?page=&limit=  (protected)
export const getSavedPostsRequest = (params = {}) => api.get('/users/me/saved', { params });

// GET /api/users/:username
export const getProfileRequest = (username) => api.get(`/users/${username}`);

// POST /api/users/:username/follow  (protected)
export const followUserRequest = (username) => api.post(`/users/${username}/follow`);

// DELETE /api/users/:username/follow  (protected)
export const unfollowUserRequest = (username) => api.delete(`/users/${username}/follow`);

// GET /api/users/:username/followers?page=&limit=
export const getFollowersRequest = (username, params = {}) =>
  api.get(`/users/${username}/followers`, { params });

// GET /api/users/:username/following?page=&limit=
export const getFollowingRequest = (username, params = {}) =>
  api.get(`/users/${username}/following`, { params });
