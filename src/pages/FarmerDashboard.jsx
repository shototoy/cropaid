
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, Home, User, LogOut, X, Map, Bell, Newspaper, LayoutGrid, Sun } from 'lucide-react';
import Layout from '../components/Layout';
import BottomNavbar from '../components/BottomNavbar';

export default function FarmerDashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <>
            {/* Header / Top Bar */}
            <div className="bg-primary text-white p-5 pt-8 rounded-b-3xl shadow-md relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={toggleSidebar} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                        <User size={24} className="text-white" />
                    </button>
                    <div className="text-right">
                        <h1 className="text-xl font-bold m-0">Hello, Farmer</h1>
                        <p className="text-xs text-white/80 m-0">Norala, South Cotabato</p>
                    </div>
                </div>

                {/* Weather / Status Card */}
                <div className="bg-white text-text-main p-4 rounded-xl shadow-lg flex justify-between items-center mb-[-40px]">
                    <div className="flex flex-col">
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Current Weather</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Sun size={24} className="text-yellow-500" />
                            <span className="text-2xl font-bold">32°C</span>
                        </div>
                        <span className="text-[10px] text-text-muted">Sunny, Low Chance of Rain</span>
                    </div>
                    <div className="h-10 w-[1px] bg-gray-200"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Active Reports</span>
                        <span className="text-2xl font-bold text-primary">0</span>
                        <span className="text-[10px] text-text-muted">No pending issues</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-16 px-5 py-4">
                {/* Quick Actions Grid (Updated) */}
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Quick Services</h3>
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col items-center gap-2" onClick={() => { }}>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm cursor-pointer hover:bg-orange-200 transition-colors">
                            <Map size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Farm<br />Map</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={() => { }}>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm cursor-pointer hover:bg-red-200 transition-colors">
                            <Bell size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Advisories</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={() => { }}>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm cursor-pointer hover:bg-blue-200 transition-colors">
                            <Newspaper size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">News</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={toggleSidebar}>
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm cursor-pointer hover:bg-gray-200 transition-colors">
                            <LayoutGrid size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">More</span>
                    </div>
                </div>

                {/* Promo / Info Section */}
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Latest Advisory</h3>
                <div className="bg-gradient-to-r from-primary to-primary-light text-white p-4 rounded-xl shadow-md mb-4">
                    <h4 className="font-bold text-sm mb-1">Pest Alert: Rice Black Bug</h4>
                    <p className="text-xs opacity-90">Farmers in Brgy. San Jose are advised to monitor fields due to reported sightings.</p>
                </div>
            </div>

            {/* Sidebar (Full Screen Overlay) */}
            <div className={`fixed top-0 left-0 w-full h-full z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Backdrop */}
                <div className="absolute top-0 left-0 w-full h-full bg-primary" onClick={toggleSidebar}></div>

                {/* Sidebar Content */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col p-6 text-white">
                    {/* Close Button (Top Left - matching profile button) */}
                    <div className="flex justify-between items-center mb-6 mt-8"> {/* Added mt-8 to match header pt-8 */}
                        <button onClick={toggleSidebar} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                            <X size={24} className="text-white" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 text-primary shadow-lg border-4 border-white/20">
                            <User size={40} />
                        </div>
                        <h2 className="text-2xl font-bold">Juan Dela Cruz</h2>
                        <p className="text-white/70 text-sm">RSBSA: 12-34-56-789</p>
                    </div>

                    <div className="flex-1">
                        <div className="space-y-4">
                            <div className="p-4 bg-white/10 rounded-lg flex items-center gap-3">
                                <User size={20} />
                                <span className="font-medium">My Profile</span>
                            </div>
                            <div className="p-4 bg-white/10 rounded-lg flex items-center gap-3">
                                <Activity size={20} />
                                <span className="font-medium">History</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-white text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-auto"
                    >
                        <LogOut size={20} />
                        LOGOUT
                    </button>
                </div>
            </div>
        </>
    );
}
