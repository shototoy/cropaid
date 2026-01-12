
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Splash() {
    const navigate = useNavigate();

    const { loading, user } = useAuth();

    useEffect(() => {
        if (loading) return;

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
