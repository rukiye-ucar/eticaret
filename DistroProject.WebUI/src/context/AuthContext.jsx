import { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                return {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    isPremium: data.isPremium,
                    balance: data.balance,
                };
            }
        } catch (err) {
            console.error('Failed to fetch user info:', err);
        }
        return null;
    };

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                // Quick decode for role first
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({
                        role: payload.role || 'Customer'
                    });
                } catch (error) {
                    console.error("Invalid token:", error);
                    localStorage.removeItem('token');
                }
                // Fetch full info
                const fullUser = await fetchMe();
                if (fullUser) setUser(fullUser);
            }
            setLoading(false);
        };
        init();
    }, []);

    const refreshUser = async () => {
        const fullUser = await fetchMe();
        if (fullUser) setUser(fullUser);
    };

    const login = async (token) => {
        localStorage.setItem('token', token);
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                role: payload.role || 'Customer'
            });
            // Fetch full info
            const fullUser = await fetchMe();
            if (fullUser) setUser(fullUser);
            return true;
        } catch (error) {
            console.error("Login token error:", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        message.info('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
