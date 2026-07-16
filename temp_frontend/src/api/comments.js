import api from './axios';

// GET /api/posts/:postId/comments?page=&limit=
export const getCommentsRequest = (postId, params = {}) =>
  api.get(`/posts/${postId}/comments`, { params });

// POST /api/posts/:postId/comments  body: { text, parentComment? }  (protected)
export const addCommentRequest = (postId, text, parentComment = null) =>
  api.post(`/posts/${postId}/comments`, { text, parentComment });

// DELETE /api/posts/:postId/comments/:commentId  (protected: comment author OR post author)
export const deleteCommentRequest = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);
