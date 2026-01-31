import api from './api';

const taskService = {
    // get all task
    getTasks: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/tasks?${params}`);
        return response.data;
    },
    // get single task
    getTask: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },
    // create task
    createTask: async (taskData) => {
        const response = await api.post('/tasks', taskData);
        return response.data;
    },
    // update task
    updateTask: async (id, taskData) => {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data;
    },
    // delete task
    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },
    // get stats
    getStats: async () => {
        const response = await api.get('/tasks/stats');
        return response.data;
    }
};

export default taskService;