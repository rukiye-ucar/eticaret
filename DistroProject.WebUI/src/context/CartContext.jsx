import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../api/axiosInstance';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch cart from API when user logs in
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get('/Cart');
            setCartItems(response.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Load cart when auth state changes
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (product, qty = 1) => {
        if (!isAuthenticated) return;
        try {
            await axiosInstance.post('/Cart', {
                productId: product.id,
                quantity: qty
            });
            await fetchCart(); // Reload cart from server
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const removeFromCart = async (productId) => {
        if (!isAuthenticated) return;
        try {
            await axiosInstance.delete(`/Cart/${productId}`);
            setCartItems(prev => prev.filter(item => item.product.id !== productId));
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!isAuthenticated) return;
        if (quantity < 1) {
            await removeFromCart(productId);
            return;
        }
        try {
            await axiosInstance.put(`/Cart/${productId}`, { quantity });
            setCartItems(prev =>
                prev.map(item =>
                    item.product.id === productId
                        ? { ...item, quantity }
                        : item
                )
            );
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) return;
        try {
            await axiosInstance.delete('/Cart');
            setCartItems([]);
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartItemCount,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};
