
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Splash() {
    const navigate = useNavigate();

    const { loading, user } = useAuth();
    const { token } = useAuth(); // Need token if available, but users might not be logged in yet? 

    useEffect(() => {
        if (loading) return;
        if (user) {
            const preloadData = async () => {
                try {
                    const storedToken = localStorage.getItem('token');
                    if (storedToken) {
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/news`, {
                            headers: { 'Authorization': `Bearer ${storedToken}` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            sessionStorage.setItem('preload_news', JSON.stringify(data));
                        }
                    }
                } catch (e) {
                    console.error("Preload failed", e);
                }
            };
            preloadData(); // Fire and forget, don't await blocking navigation too much?
        }

        const timer = setTimeout(() => {
            if (user) {
                if (user.role === 'admin') navigate('/admin-dashboard');
                else navigate('/dashboard');
            } else {
                navigate('/login');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate, loading, user]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'white'
        }}>
            <img
                src={logo}
                alt="CropAid Logo"
                style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'contain'
                }}
            />
        </div>
    );
}
