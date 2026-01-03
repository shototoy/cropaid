
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, CloudRain, Sun, AlertTriangle } from 'lucide-react';

export default function UnifiedReport() {
    const navigate = useNavigate();

    const reportTypes = [
        {
            id: 'pest',
            title: 'Pest Infestation',
            description: 'Report insect damage, plant diseases, or pest problems',
            icon: Bug,
            color: 'bg-red-500',
            bgColor: 'bg-red-50',
            route: '/report/pest'
        },
        {
            id: 'flood',
            title: 'Flood Damage',
            description: 'Report flooding, waterlogging, or water damage to crops',
            icon: CloudRain,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            route: '/report/flood'
        },
        {
            id: 'drought',
            title: 'Drought Damage',
            description: 'Report water shortage, dry conditions, or drought stress',
            icon: Sun,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            route: '/report/drought'
        }
    ];

    return (
        <div className="p-5">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">Submit a Report</h1>
                <p className="text-sm text-gray-500 mt-1">Choose the type of incident you want to report</p>
            </div>

            <div className="space-y-4">
                {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <button
                            key={type.id}
                            onClick={() => navigate(type.route)}
                            className={`w-full p-4 ${type.bgColor} rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4`}
                        >
                            <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center`}>
                                <Icon size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{type.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                            </div>
                            <div className="text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Info Card */}
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-800 text-sm">Important Reminder</h4>
                        <p className="text-xs text-amber-700 mt-1">
                            Please ensure your GPS is enabled for accurate location tracking. 
                            Take clear photos of the affected area to help with assessment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
