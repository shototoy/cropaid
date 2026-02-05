import React, { useEffect } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast({ notification, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'error': return <AlertTriangle size={20} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
            default: return <Bell size={20} className="text-primary" />;
        }
    };

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] w-full max-w-sm px-4 animate-slide-down">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-full flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm">{notification.title}</h4>
                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{notification.message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
