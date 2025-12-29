
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';

export default function FarmerLayout() {
    const location = useLocation();

    return (
        <div className="max-w-[480px] mx-auto h-full relative bg-bg-surface text-text-main font-sans overflow-hidden">
            {/* Key added to force re-render and trigger animation on route change */}
            <div key={location.pathname} className="h-full overflow-y-auto pb-28 animate-slide-up">
                <Outlet />
            </div>
            <BottomNavbar />
        </div>
    );
}
