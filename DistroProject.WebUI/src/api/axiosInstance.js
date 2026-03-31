import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: window.location.hostname === 'localhost' ? 'http://localhost:5296/api' : 'http://192.168.0.199:5296/api',
    headers: {
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json'
    }
});


// Automatically attach JWT token to every request
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;