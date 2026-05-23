import api from './axiosConfig';

export const getCategories = () => api.get('categories/');
export const getExams = (params) => api.get('exams/', { params });
export const submitExam = (data) => api.post('exams/submit/', data);
export const getPendingExams = () => api.get('exams/pending/');
export const reviewPendingExam = (exam_id, action) => api.post('exams/pending/', { exam_id, action });
