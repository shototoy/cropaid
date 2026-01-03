
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Splash() {
    const navigate = useNavigate();

    const { loading } = useAuth();

    useEffect(() => {
        const timer = new Promise(resolve => setTimeout(resolve, 2000));

        Promise.all([timer, !loading]).then(() => {
            // Once minimum time passed AND loading is done
            if (!loading) {
                navigate('/login');
            }
        });
    }, [navigate, loading]);

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
