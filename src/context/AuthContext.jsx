import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CREDENTIALS } from '../config/mockData';
import { setApiMockMode } from '../services/api';

const AuthContext = createContext(null);
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isMockMode, setIsMockMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch(`${API_URL}/health`, { method: 'GET' });
                if (response.ok) {
                    setIsMockMode(false);
                    setApiMockMode(false);
                } else {
                    setIsMockMode(true);
                    setApiMockMode(true);
                }
            } catch (err) {
                setIsMockMode(true);
                setApiMockMode(true);
            } finally {
                const storedUser = localStorage.getItem('user');
                if (localStorage.getItem('token') && storedUser) {
                    setUser(JSON.parse(storedUser));
                }
                setLoading(false);
            }
        };
        checkConnection();
    }, []);

    const login = async (identifier, password) => {
        if (isMockMode) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockUser = MOCK_CREDENTIALS.users.find(
                        u => u.username === identifier && u.password === password
                    );

                    if (mockUser) {
                        const fakeToken = 'mock-jwt-token-123';
                        setToken(fakeToken);
                        setUser(mockUser);
                        localStorage.setItem('token', fakeToken);
                        localStorage.setItem('user', JSON.stringify(mockUser));

                        if (mockUser.role === 'admin') navigate('/admin-dashboard');
                        else navigate('/dashboard');

                        resolve({ success: true });
                    } else {
                        resolve({ success: false, error: 'Invalid mock credentials' });
                    }
                }, 800); // Simulate network delay
            });
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
                return { success: false, error: errorData.error || 'Invalid credentials' };
            }

            const data = await response.json();
            setToken(data.token);
            const userWithRole = { ...data.user, role: data.role };
            setUser(userWithRole);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userWithRole));

            if (data.role === 'admin') navigate('/admin-dashboard');
            else navigate('/dashboard');
            return { success: true };
        } catch (error) {
            console.error("Network error during login:", error);
            return { success: false, error: 'Unable to connect to server' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isMockMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
