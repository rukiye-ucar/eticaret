
// DistroProject.Mobile/src/api/productService.js
// Web'deki dosyayla TAMAMEN AYNI — hiçbir değişiklik gerekmez
import axiosInstance from './axiosInstance';

export const getProducts = async () => {
    const response = await axiosInstance.get('/Products');
    return response.data;
};

export const getCategories = async () => {
    const response = await axiosInstance.get('/Categories');
    return response.data;
};
