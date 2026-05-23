import api from './axiosConfig';

export const getNotifications = async () => {
    try {
        const response = await api.get('/users/notifications/');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch notifications' };
    }
};

export const deleteNotification = async (id) => {
    try {
        const response = await api.delete(`/users/notifications/${id}/delete/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete notification' };
    }
};
