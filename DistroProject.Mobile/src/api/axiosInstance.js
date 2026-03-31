import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// BASE_URL → Bölüm 5'e bakın
// Mobil Etkin Nokta (Windows hotspot) üzerinden bağlanıyorsanız bilgisayarın
// hotspot IP'si 192.168.137.1'dir — WiFi IP'si (192.168.0.199) değil
const BASE_URL = 'http://192.168.137.1:5296/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
    },
});

// localStorage → AsyncStorage (async interceptor)
axiosInstance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
