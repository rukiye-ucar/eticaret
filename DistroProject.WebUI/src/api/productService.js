import axiosInstance from './axiosInstance';

export const getProducts = async () => {
    try {
        const response = await axiosInstance.get('/Products');
        return response.data;
    } catch (error) {
        console.error("Error occurred while fetching products:", error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await axiosInstance.get('/Categories');
        return response.data;
    } catch (error) {
        console.error("Error occurred while fetching categories:", error);
        throw error;
    }
};