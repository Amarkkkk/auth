import axios from "axios"

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// automatically attach token to every request if it exists
api.interceptors.request.use(
    (config) => {
        // get token from local storage
        const token = localStorage.getItem("token");
        // if token exists, attach it to the request headers
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }        
        return config;
    }, 
    (error) => Promise.reject(error)
);

export default api;
