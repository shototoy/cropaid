
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BottomNavbar from '../components/BottomNavbar';

export default function UnifiedReport() {
    const navigate = useNavigate();

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold text-primary mb-6">Select Report Type</h1>

            <button
                onClick={() => navigate('/report/pest')}
                className="w-full p-4 mb-3 bg-primary text-white rounded shadow-md hover:bg-primary-dark transition-colors font-medium text-left"
            >
                Report Pest Issue
            </button>

            <button
                onClick={() => navigate('/report/flood')}
                className="w-full p-4 mb-3 bg-primary text-white rounded shadow-md hover:bg-primary-dark transition-colors font-medium text-left"
            >
                Report Flood Damage
            </button>

            <button
                onClick={() => navigate('/report/pest')}
                className="w-full p-4 mb-3 bg-primary text-white rounded shadow-md hover:bg-primary-dark transition-colors font-medium text-left"
            >
                Report Pest & Flood
            </button>
        </div>
    );
}
