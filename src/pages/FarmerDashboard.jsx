import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, LogOut, User } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';

export default function FarmerDashboard() {
    const navigate = useNavigate();

    return (
        <Layout className="bg-surface">
            <div className="flex justify-between items-center mb-8 pt-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary m-0">Hello, Farmer</h1>
                    <p className="text-sm text-text-muted">Welcome to CropAid</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center border border-primary">
                    <User size={20} className="text-primary" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-auto">
                <div
                    onClick={() => navigate('/report')}
                    className="bg-white p-6 rounded-md shadow-md flex flex-col items-center text-center cursor-pointer transition-transform active:scale-95 border-l-4 border-l-primary hover:shadow-lg"
                >
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                        <FileText size={32} className="text-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-text-main mb-1">Report Issue</h2>
                    <p className="text-sm text-text-muted">Submit flood or pest reports</p>
                </div>

                <div
                    onClick={() => navigate('/status')}
                    className="bg-white p-6 rounded-md shadow-md flex flex-col items-center text-center cursor-pointer transition-transform active:scale-95 border-l-4 border-blue-500 hover:shadow-lg"
                >
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <Activity size={32} className="text-blue-500" />
                    </div>
                    <h2 className="text-lg font-bold text-text-main mb-1">Report Status</h2>
                    <p className="text-sm text-text-muted">Track your submissions</p>
                </div>
            </div>

            <Button
                variant="secondary"
                onClick={() => navigate('/login')}
                className="mt-4 bg-red-100 text-red-600 hover:bg-red-200"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
            >
                <LogOut size={18} className="mr-2" />
                Logout
            </Button>
        </Layout>
    );
}
