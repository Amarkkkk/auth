import api from './api';

export const getTasks = async (params) => {
    const response = await api.get("/tasks", {params});
    return response.data;
};

export const updateTask = async (id, form) => {
    try {
        const response = await api.put(`/tasks/${id}`, form);
        return response.data;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error.response ? error.response.data : error;
    }
};