import api from './axios';

// GET /api/notifications?page=&limit=  (protected)
export const getNotificationsRequest = (params = {}) => api.get('/notifications', { params });

// GET /api/notifications/unread-count  (protected)
export const getUnreadCountRequest = () => api.get('/notifications/unread-count');

// PATCH /api/notifications/:notificationId/read  (protected)
export const markNotificationReadRequest = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);

// PATCH /api/notifications/read-all  (protected)
export const markAllNotificationsReadRequest = () => api.patch('/notifications/read-all');
