import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function MockModeOverlay() {
    const { isMockMode } = useAuth();

    if (!isMockMode) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-[9999] font-bold text-sm shadow-lg">
            Cannot connect to server. Serving Mock Data
        </div>
    );
}
