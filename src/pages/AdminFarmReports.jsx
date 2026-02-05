import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Assuming Header component exists and should be used or using similar style

export default function AdminFarmReports() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Using a custom header div to match previous style but with Tailwind and padding */}
            <div className="p-4 pt-8">
                <h1 className="text-lg font-bold mb-4">Farm Condition Report</h1>
            </div>

            <div className="flex-1 px-4 mb-4">
                <div className="p-3 border-b border-gray-100 flex flex-col gap-1">
                    <div className="flex justify-between">
                        <span className="font-bold">Juan Dela Cruz</span>
                        <span className="text-xs text-gray-500">10/27/2023</span>
                    </div>
                    <span className="text-sm">Purok 1, San Jose</span>
                    <span className="text-red-600 font-bold text-sm">Major Pest Infestation</span>
                </div>

                <div className="p-3 border-b border-gray-100 flex flex-col gap-1">
                    <div className="flex justify-between">
                        <span className="font-bold">Pedro Penduko</span>
                        <span className="text-xs text-gray-500">10/28/2023</span>
                    </div>
                    <span className="text-sm">Purok 2, San Miguel</span>
                    <span className="text-blue-600 font-bold text-sm">Severe Flooding</span>
                </div>
            </div>

            <div className="p-4 pb-8">
                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="w-full py-3 bg-gray-200 text-black rounded cursor-pointer font-bold"
                >
                    Home
                </button>
            </div>
        </div>
    );
}
