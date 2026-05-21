import api from "./api";

export const signup = async (userData) => {
    const response = await api.post("/auth/register", {
        name: userData.name,
        email: userData.email,        
        bio: userData.bio,
        phone: userData.phone,
        password: userData.password,
    }); 
    return response.data;
};

