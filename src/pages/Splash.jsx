
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Splash() {
    const navigate = useNavigate();

    const { loading, user } = useAuth();
    const { token } = useAuth(); // Need token if available, but users might not be logged in yet? 
    // Actually, Splash redirects based on `user`. If `user` exists, token likely exists in context or localStorage.
    // But `useAuth` hook provides `token` state.

    // However, if we fetch news publicly, it might be fine?
    // /api/news is likely protected.
    // If user is authenticated, we preload.

    useEffect(() => {
        if (loading) return;

        // Preload Data if User exists
        if (user) {
            const preloadData = async () => {
                try {
                    // We can try to fetch from local storage token if available, using the auth context token might be tricky if it's not ready?
                    // But `user` is ready, so `token` should be ready.
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
            // Actually, waiting 2 seconds is plenty for a fetch.
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
