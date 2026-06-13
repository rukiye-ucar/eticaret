import axios from 'axios';

// Production'da frontend ve backend aynı domain'de çalışır (albatrosrov.com)
// Bu yüzden relative URL kullanıyoruz: /api
// Development'ta Vite proxy üzerinden yönlendirme yapılır (vite.config.js'e proxy ekleyin)
const axiosInstance = axios.create({
    baseURL: '/api',
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