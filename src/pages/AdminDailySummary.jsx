
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Home, ChevronRight } from 'lucide-react';

export default function AdminDailySummary() {
    const navigate = useNavigate();

    const summaries = [
        { id: 1, title: 'Daily Summary - Oct 27', count: 5, date: '2024-10-27' },
        { id: 2, title: 'Daily Summary - Oct 28', count: 8, date: '2024-10-28' },
        { id: 3, title: 'Daily Summary - Oct 29', count: 3, date: '2024-10-29' },
    ];

    return (
        <div className="p-4 min-h-screen bg-gray-50 flex flex-col">
            <h1 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-primary" size={24} />
                Daily Report Summary
            </h1>

            <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
                {summaries.map((summary, index) => (
                    <div 
                        key={summary.id} 
                        className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                            index !== summaries.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 text-sm md:text-base">{summary.title}</h3>
                                <p className="text-xs text-gray-500">{summary.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <span className="text-primary font-bold text-sm md:text-base">{summary.count} Reports</span>
                            <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1">
                                VIEW
                                <ChevronRight size={14} className="hidden sm:inline" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate('/admin-dashboard')}
                className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors font-medium"
            >
                <Home size={18} />
                Back to Dashboard
            </button>
        </div>
    );
}
