import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); useEffect(() => {
        const token = localStorage.getItem('token'); if (token) {
            // Optionally, verify token with server 
            // // For now, assume valid 
            // // You can decode JWT or call an endpoint to get user info 
            // // Since we have user in response, but for simplicity, set from token or something 
            // // Actually, better to store user in localStorage too 
            const storedUser = localStorage.getItem('user'); if (storedUser) { setUser(JSON.parse(storedUser)); }
        }
        setLoading(false);
    }, []); const login = (userData, token) => {
        setUser(userData); localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(userData));
    };
    const logout = () => { setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); };
    return (<AuthContext.Provider value={{ user, login, logout, loading }}> {children} </AuthContext.Provider>);
};