import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import NotificationBell from './NotificationBell';
import { Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [headerAction, setHeaderAction] = useState(null);
    const location = useLocation();
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
    const getPageHeader = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return { title: 'Dashboard Overview', subtitle: 'Summary of farm activities and reports.' };
        if (path.includes('farmers')) return { title: 'Farmer Management', subtitle: 'View and manage registered farmers and their land.' };
        if (path.includes('reports')) return { title: 'Incident Reports', subtitle: 'Track and manage farm incidents and claims.' };
        if (path.includes('map')) return { title: 'Farm Map', subtitle: 'Geospatial view of registered farms and reports.' };
        if (path.includes('settings')) return { title: 'System Settings', subtitle: 'Manage application preferences and configurations.' };
        if (path.includes('news')) return { title: 'News & Advisories', subtitle: 'Manage announcements, weather alerts, and farmer advisories.' };
        return { title: 'Admin Panel', subtitle: 'CropAid Administration' };
    };

    const headerInfo = getPageHeader();

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-inter">
            <AdminSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {}
                <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between shrink-0">
                    {}
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden lg:block">
                            <h1 className="text-2xl font-bold text-gray-900">{headerInfo.title}</h1>
                            <p className="text-sm text-gray-500">{headerInfo.subtitle}</p>
                        </div>
                    </div>

                    {}
                    <div className="flex items-center gap-3">
                        {headerAction}
                        <NotificationBell />
                    </div>
                </header>

                {}
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    <div className={`flex-1 ${location.pathname.includes('map') ? 'p-0 overflow-hidden' : 'p-4 lg:p-8 overflow-y-auto'}`}>
                        <div className={`mx-auto h-full ${location.pathname.includes('map') ? 'max-w-none' : 'max-w-7xl'}`}>
                            <Outlet context={{ setHeaderAction }} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
