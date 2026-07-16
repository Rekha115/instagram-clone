import api from './axios';

// GET /api/posts/feed?page=&limit=  (protected) -> { posts, page, hasMore }
export const getFeedRequest = (params = {}) => api.get('/posts/feed', { params });

// GET /api/posts/explore?page=&limit=  (optionalAuth) -> { posts, page, hasMore }
export const getExploreRequest = (params = {}) => api.get('/posts/explore', { params });

// GET /api/posts/reels?page=&limit=  (optionalAuth) -> { reels, page, hasMore }
export const getReelsRequest = (params = {}) => api.get('/posts/reels', { params });

// GET /api/posts/user/:username?page=&limit=  -> { posts, page, hasMore }
// NOTE: backend returns a reduced shape here: { _id, media, likesCount, commentsCount, createdAt }
export const getUserPostsRequest = (username, params = {}) =>
  api.get(`/posts/user/${username}`, { params });

// POST /api/posts  multipart, field name MUST be "media" (up to 10 files, 50MB each)
// fields: caption, location, postType ('post' | 'reel')
export const createPostRequest = (files, { caption = '', location = '', postType = 'post' } = {}) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('media', file));
  formData.append('caption', caption);
  formData.append('location', location);
  formData.append('postType', postType);
  return api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// GET /api/posts/:postId  (optionalAuth)
export const getPostByIdRequest = (postId) => api.get(`/posts/${postId}`);

// PATCH /api/posts/:postId  body: { caption, location }  (protected, author only)
export const updatePostRequest = (postId, payload) => api.patch(`/posts/${postId}`, payload);

// DELETE /api/posts/:postId  (protected, author only)
export const deletePostRequest = (postId) => api.delete(`/posts/${postId}`);

// POST /api/posts/:postId/like  (protected) -> { likesCount }
export const likePostRequest = (postId) => api.post(`/posts/${postId}/like`);

// DELETE /api/posts/:postId/like  (protected) -> { likesCount }
export const unlikePostRequest = (postId) => api.delete(`/posts/${postId}/like`);

// POST /api/posts/:postId/save  (protected)
export const savePostRequest = (postId) => api.post(`/posts/${postId}/save`);

// DELETE /api/posts/:postId/save  (protected)
export const unsavePostRequest = (postId) => api.delete(`/posts/${postId}/save`);
