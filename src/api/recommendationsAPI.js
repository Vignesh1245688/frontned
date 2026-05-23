import api from './axiosConfig';

// Personalized Feed
export const getFeed = () => api.get('recommendations/feed/');
export const getUpNext = () => api.get('recommendations/up-next/');

// Weak Topics
export const getWeakTopics = () => api.get('recommendations/weak-topics/');

// Daily Tasks
export const getDailyTasks = () => api.get('recommendations/daily-tasks/');
export const completeTask = (taskId) => api.post('recommendations/daily-tasks/', { task_id: taskId });

// Study Plan
export const getStudyPlans = () => api.get('recommendations/study-plan/');
export const getStudyPlan = (id) => api.get(`recommendations/study-plan/?id=${id}`);
export const createStudyPlan = (data) => api.post('recommendations/study-plan/', data);
export const completeStudyDay = (planId, dayNumber) =>
  api.post(`recommendations/study-plan/${planId}/day/${dayNumber}/complete/`);

// Analytics
export const getAdvancedAnalytics = () => api.get('recommendations/analytics/');

// Learning Profile
export const getLearningProfile = () => api.get('recommendations/learning-profile/');
export const updateLearningProfile = (data) => api.put('recommendations/learning-profile/', data);

// Revision Queue
export const getRevisionQueue = () => api.get('recommendations/revision-queue/');
export const processReview = (topic, rating) =>
  api.post('recommendations/revision-queue/', { topic, rating });

// Streak
export const getStreak = () => api.get('recommendations/streak/');

// Activity Tracking
export const trackActivity = (data) => api.post('recommendations/track-activity/', data);

// Recommendation Actions
export const dismissRecommendation = (id) =>
  api.post(`recommendations/action/${id}/`, { action: 'dismiss' });
export const completeRecommendation = (id) =>
  api.post(`recommendations/action/${id}/`, { action: 'complete' });

// Daily Revision Quiz
export const getDailyRevision = () => api.get('recommendations/daily-revision/');
export const submitDailyRevision = (results) =>
  api.post('recommendations/daily-revision/', { results });

// Gamification
export const getLeaderboard = () => api.get('recommendations/leaderboard/');
