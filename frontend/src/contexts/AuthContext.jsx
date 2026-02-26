import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    // Flag: true when login() just set the token with user data already in hand.
    // In that case, the token-change effect should NOT re-fetch the profile.
    const skipFetchRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        // If login() already provided the user data, skip the network fetch
        if (skipFetchRef.current) {
            skipFetchRef.current = false;
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                logout();
            } else {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                fetchUserProfile();
            }
        } catch (err) {
            logout();
        }
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to load user profile', error);
            // Only force logout on explicit 401 — don't log out on transient network failures
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken, userData) => {
        // Mark that we already have the user — no need to re-fetch from /auth/me
        skipFetchRef.current = true;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
