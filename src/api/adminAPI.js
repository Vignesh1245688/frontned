import api from './axiosConfig';

// Analytics
export const getAdminAnalytics = () => api.get('admin-panel/analytics/');

// User Management
export const getAdminUsers = (page = 1, search = '') => 
  api.get(`admin-panel/users/?page=${page}&search=${search}`);
export const getAdminUserDetail = (userId) => api.get(`admin-panel/users/${userId}/`);
export const adminUserAction = (userId, action) => 
  api.post(`admin-panel/users/${userId}/action/`, { action });

// Moderation
export const getModerationQueue = () => api.get('admin-panel/moderation/');
export const moderationAction = (resourceId, action) => 
  api.post(`admin-panel/moderation/${resourceId}/action/`, { action });

// Notifications
export const broadcastNotification = (message, target = 'all') => 
  api.post('admin-panel/notifications/', { message, target });
export const getNotificationHistory = () => api.get('admin-panel/notifications/');

// Content Management
export const uploadAdminResource = (formData) => api.post('resources/community/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
