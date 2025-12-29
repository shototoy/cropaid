
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BottomNavbar from '../components/BottomNavbar';

export default function ReportStatus() {
    const navigate = useNavigate();

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold text-primary mb-4">Report Status</h1>

            <div className="bg-white p-3 mb-3 rounded shadow-sm shadow-gray-200">
                <span className="block font-bold">Flood Report</span>
                <span className="text-orange-500">Status: Under Review</span>
            </div>

            <div className="bg-white p-3 mb-3 rounded shadow-sm shadow-gray-200">
                <span className="block font-bold">Pest Infestation Report</span>
                <span className="text-blue-500">Status: Submitted</span>
            </div>

            <div className="bg-white p-3 mb-3 rounded shadow-sm shadow-gray-200">
                <span className="block font-bold">Drought Report</span>
                <span className="text-green-500">Status: Resolved</span>
            </div>
        </div>
    );
}
