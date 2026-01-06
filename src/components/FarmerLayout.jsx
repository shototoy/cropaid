import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';
import { useAuth } from '../context/AuthContext';

export default function FarmerLayout() {
    const location = useLocation();
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-surface">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[480px] mx-auto h-full relative bg-bg-surface text-text-main font-sans overflow-hidden">
            {/* Key added to force re-render and trigger animation on route change */}
            <div key={location.pathname} className={`h-full overflow-y-auto animate-slide-up ${location.pathname !== '/my-map' ? 'pb-28' : ''}`}>
                <Outlet />
            </div>
            {location.pathname !== '/my-map' && <BottomNavbar />}
        </div>
    );
}
