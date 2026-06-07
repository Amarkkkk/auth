import api from './api';

export const updateSubtask = async (id, form) => {
    try {
        const response = await api.put(`/subtasks/${id}`, form);
        return response.data;
    } catch (error) {
        console.error("Error updating subtask:", error);
        throw error;
    }
}