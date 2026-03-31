import React, { useContext, createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Basit CartContext (web CartContext'in RN uyarlaması) ───────────────────
const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // AsyncStorage'dan sepeti yükle
    useEffect(() => {
        AsyncStorage.getItem('cart').then((data) => {
            if (data) setCartItems(JSON.parse(data));
        });
    }, []);

    const saveCart = (items) => {
        setCartItems(items);
        AsyncStorage.setItem('cart', JSON.stringify(items));
    };

    const addToCart = (product, quantity = 1) => {
        const existing = cartItems.find((i) => i.product.id === product.id);
        if (existing) {
            saveCart(
                cartItems.map((i) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                )
            );
        } else {
            saveCart([...cartItems, { product, quantity }]);
        }
    };

    const removeFromCart = (productId) =>
        saveCart(cartItems.filter((i) => i.product.id !== productId));

    const updateQuantity = (productId, qty) => {
        if (qty <= 0) return removeFromCart(productId);
        saveCart(cartItems.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)));
    };

    const clearCart = () => saveCart([]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
