
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Home, Activity } from 'lucide-react';

export default function BottomNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[440px] bg-white rounded-2xl border border-gray-100 flex justify-between items-center px-4 pb-2 pt-2 shadow-xl z-40 h-[70px]">
            {/* Left: Report */}
            <div
                className={`flex-1 flex flex-col items-center justify-center h-12 rounded-xl cursor-pointer transition-all duration-300 ${isActive('/report') ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-primary'}`}
                onClick={() => navigate('/report')}
            >
                <FileText size={24} className={isActive('/report') ? 'mb-0' : 'mb-1'} />
                {!isActive('/report') && <span className="text-[10px] font-medium">Report</span>}
            </div>

            {/* Center: Home (Raised) */}
            <div className="relative -top-8 mx-4">
                <div
                    className={`w-16 h-16 rounded-full border-4 border-[#F5F7F6] flex items-center justify-center shadow-lg cursor-pointer transform transition-all duration-300 ${isActive('/dashboard') ? 'bg-primary scale-110' : 'bg-white'}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <Home size={28} className={isActive('/dashboard') ? 'text-white' : 'text-gray-400'} />
                </div>
            </div>

            {/* Right: Status */}
            <div
                className={`flex-1 flex flex-col items-center justify-center h-12 rounded-xl cursor-pointer transition-all duration-300 ${isActive('/status') ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-primary'}`}
                onClick={() => navigate('/status')}
            >
                <Activity size={24} className={isActive('/status') ? 'mb-0' : 'mb-1'} />
                {!isActive('/status') && <span className="text-[10px] font-medium">Status</span>}
            </div>
        </div>
    );
}
