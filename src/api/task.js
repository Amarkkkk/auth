import api from './api';

export const getTasks = async (params) => {
    const response = await api.get("/tasks", {params});
    return response.data;
};