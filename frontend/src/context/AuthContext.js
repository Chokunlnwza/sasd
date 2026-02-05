import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load saved auth data on app start
    useEffect(() => {
        loadAuthData();
    }, []);

    const loadAuthData = async () => {
        try {
            const savedToken = await AsyncStorage.getItem('token');
            const savedUser = await AsyncStorage.getItem('user');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (err) {
            console.error('Error loading auth data:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveAuthData = async (userData, userToken) => {
        try {
            await AsyncStorage.setItem('token', userToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
            console.error('Error saving auth data:', err);
        }
    };

    const clearAuthData = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        } catch (err) {
            console.error('Error clearing auth data:', err);
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await apiLogin(username, password);
            const { data } = response.data;

            const userData = {
                _id: data._id,
                username: data.username,
                role: data.role,
            };

            setUser(userData);
            setToken(data.token);
            await saveAuthData(userData, data.token);

            return { success: true, role: data.role };
        } catch (err) {
            const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, password, role = 'member') => {
        try {
            setError(null);
            setLoading(true);

            const response = await apiRegister(username, password, role);
            const { data } = response.data;

            const userData = {
                _id: data._id,
                username: data.username,
                role: data.role,
            };

            setUser(userData);
            setToken(data.token);
            await saveAuthData(userData, data.token);

            return { success: true, role: data.role };
        } catch (err) {
            const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await clearAuthData();
    };

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        isMember: user?.role === 'member',
        login,
        register,
        logout,
        clearError: () => setError(null),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
