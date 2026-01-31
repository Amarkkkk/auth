import api from './api';

const authService = {
    // register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if  (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },
    // login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.data.token){
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },
    // logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    // get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    // check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
    // get user profile
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    // update Profile
    updateProfile: async (userData) => {
        const response = await api.put('/auth/update-profile', userData);
        if (response.data.data.user){
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },
    // change password
    changePassword: async (password) => {
        const response = await api.put('/auth/change-password', password);
        return response.data;
    }
};

export default authService;