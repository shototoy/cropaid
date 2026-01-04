
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, Home, User, LogOut, X, Bell, Newspaper, LayoutGrid, Sun, Cloud, CloudRain, CloudLightning, Menu, Megaphone, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import BottomNavbar from '../components/BottomNavbar';
import { API_URL, useAuth } from '../context/AuthContext';
import { MOCK_DATA } from '../config/mockData';
import { fetchWeather, getCurrentPosition } from '../services/api';

export default function FarmerDashboard() {
    const navigate = useNavigate();
    const { profile, logout, token, isMockMode } = useAuth(); // Changed from user, authLoading
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [weather, setWeather] = useState(null); // New state for weather data (from dashboardData)
    const [liveWeather, setLiveWeather] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0); // New state for carousel
    const [carouselItems, setCarouselItems] = useState([{ isDefault: true }]); // New state for carousel
    const [stats, setStats] = useState({ active_reports: 0 }); // New state for stats (from dashboardData)

    // Fetch live weather data
    const getWeather = async () => {
        try {
            let lat = 6.5294; // Default: Norala, South Cotabato, Philippines
            let lon = 124.6647;

            try {
                const coords = await getCurrentPosition();
                lat = coords.latitude;
                lon = coords.longitude;
            } catch (err) {
                // Use default Norala coordinates if GPS unavailable
            }

            const weatherData = await fetchWeather(lat, lon);
            setLiveWeather(weatherData);
        } catch (err) {
            // Weather fetch failed silently - will use fallback data
        }
    };

    useEffect(() => {
        getWeather();
        // Refresh every 15 minutes
        const interval = setInterval(getWeather, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch dashboard data (profile and stats)
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (isMockMode) {
                const username = profile?.username || 'james';
                const mockDashboard = MOCK_DATA.getFarmerDashboard(username);
                setStats(mockDashboard.stats);
                setWeather(mockDashboard.weather); // Set weather from mock dashboard
                return;
            }

            try {
                const response = await fetch(`${API_URL}/farmer/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                    setWeather(data.weather); // Set weather from API dashboard
                }
            } catch (error) {
                console.error("Failed to load dashboard", error);
            }
        };

        if (token || isMockMode) fetchDashboardData();
    }, [token, isMockMode, profile]); // Depend on profile for mock mode username

    // Fetch latest advisory (Carousel Logic)
    useEffect(() => {
        const fetchAdvisories = async () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            let items = [];

            if (isMockMode) {
                // Mock news data (Fallback / Mock Mode)
                const MOCK_NEWS = [
                    { id: 1, title: 'Pest Alert: Black Bug Infestation Warning', summary: 'The Municipal Agriculture Office has detected increased black bug activity in several barangays. Farmers are advised to monitor their rice fields closely.', type: 'alert', priority: 'high', date: new Date(Date.now() - 86400000).toISOString() },
                    { id: 2, title: 'Weather Advisory: Dry Season Preparations', summary: 'With the dry season approaching, farmers should begin preparing water conservation strategies for their crops.', type: 'advisory', priority: 'medium', date: new Date(Date.now() - 172800000).toISOString() },
                    { id: 3, title: 'New Seed Distribution Program', summary: 'The DA is distributing free high-yield rice seeds to registered farmers this month.', type: 'news', priority: 'low', date: new Date(Date.now() - 259200000).toISOString() }
                ];
                items = MOCK_NEWS;
            } else {
                try {
                    const response = await fetch(`${API_URL}/news`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const newsList = Array.isArray(data) ? data : data.news || [];
                        items = newsList;
                    }
                } catch (err) {
                    // Fail silently, show default
                }
            }

            // Carousel Logic:
            // 1. Take Top 5 from raw list
            const top5 = items.slice(0, 5);

            // 2. Filter Top 5 for "Recent" (last 3 days)
            const recentItems = top5.filter(item => {
                const date = item.created_at || item.date;
                return new Date(date) >= threeDaysAgo;
            });

            // 3. Normalize items for display
            const normalizedItems = recentItems.map(item => ({
                id: item.id,
                title: item.title,
                message: item.content ? (item.content.substring(0, 100) + '...') : item.summary,
                type: item.type,
                priority: item.priority,
                date: item.created_at || item.date
            }));

            // 4. Append Default Card
            setCarouselItems([...normalizedItems, { isDefault: true }]);
        };

        if (token || isMockMode) fetchAdvisories();
    }, [token, isMockMode]);

    // Carousel Auto-Play
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % carouselItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselItems.length]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Get weather icon component
    const getWeatherIcon = (condition) => {
        if (!condition) return <Sun size={24} className="text-yellow-500" />;
        const cond = condition.toLowerCase();
        if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain size={24} className="text-blue-500" />;
        if (cond.includes('cloud') || cond.includes('overcast')) return <Cloud size={24} className="text-gray-500" />;
        return <Sun size={24} className="text-yellow-500" />;
    };

    // Styling Helpers matching NewsPage/AdminNews
    const getCardStyle = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-amber-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    };

    const getTypeIcon = (type, className = "text-white") => {
        switch (type) {
            case 'alert': return <AlertTriangle size={20} className={className} />;
            case 'weather': return <CloudRain size={20} className={className} />;
            case 'advisory': return <Megaphone size={20} className={className} />;
            default: return <Newspaper size={20} className={className} />;
        }
    };

    return (
        <>
            {/* Header Area */}
            <div className="bg-primary pb-20 pt-8 px-6 rounded-b-[2.5rem] relative shadow-lg">
                <div className="flex justify-between items-center text-white mb-6">
                    <div className="flex items-center gap-3" onClick={toggleSidebar}>
                        <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center cursor-pointer backdrop-blur-sm">
                            <Menu size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs opacity-80 font-medium">Welcome back,</span>
                            <span className="font-bold text-lg leading-tight">{profile?.name || 'Farmer'}</span>
                        </div>
                    </div>
                </div>

                {/* Weather Card */}
                <div className="bg-white text-text-main p-4 rounded-xl shadow-lg flex justify-between items-center mb-[-40px]">
                    <div className="flex flex-col">
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Current Weather</span>
                        <div className="flex items-center gap-2 mt-1">
                            {liveWeather ? (
                                getWeatherIcon(liveWeather.condition)
                            ) : (
                                <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full"></div>
                            )}
                            <span className="text-2xl font-bold">{liveWeather?.temperature || weather?.temp || 32}°C</span>
                        </div>
                        <span className="text-[10px] text-text-muted">
                            {liveWeather?.condition || weather?.condition || 'Sunny'}, {profile?.barangay || 'Norala'}
                        </span>
                    </div>
                    <div className="h-10 w-[1px] bg-gray-200"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Active Reports</span>
                        <span className="text-2xl font-bold text-primary">{stats?.active_reports || 0}</span>
                        <span className="text-[10px] text-text-muted">{stats?.active_reports > 0 ? 'Pending issues' : 'No pending issues'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-16 px-5 py-4">
                {/* Quick Actions Grid */}
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Quick Services</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center gap-2" onClick={() => navigate('/notifications')}>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm cursor-pointer hover:bg-red-200 transition-colors">
                            <Bell size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Notifications</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={() => navigate('/news')}>
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

                {/* Latest Advisory Carousel */}
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3 flex justify-between items-center">
                    <span>Latest Advisory</span>
                    {carouselItems.length > 1 && (
                        <div className="flex gap-1">
                            {carouselItems.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSlide === idx ? 'bg-primary' : 'bg-gray-300'}`}
                                ></div>
                            ))}
                        </div>
                    )}
                </h3>

                <div className="relative overflow-hidden rounded-xl shadow-md min-h-[100px]">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                        {carouselItems.map((item, index) => (
                            <div key={index} className="w-full flex-shrink-0">
                                {item.isDefault ? (
                                    <div className="bg-emerald-50 text-emerald-800 p-4 h-full flex items-center gap-4">
                                        <div className="bg-emerald-100 p-3 rounded-full">
                                            <CheckCircle size={24} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">System Monitoring Active</h4>
                                            <p className="text-xs opacity-80 mt-1">No other critical alerts at this time. Stay safe!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`${getCardStyle(item.priority)} p-4 h-full flex flex-col justify-center relative overflow-hidden`} onClick={() => navigate('/news')}>
                                        {/* Background Decorative Icon */}
                                        <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12">
                                            {getTypeIcon(item.type, "w-24 h-24")}
                                        </div>

                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase backdrop-blur-sm">
                                                        {item.type}
                                                    </span>
                                                    <span className="text-[10px] opacity-80 uppercase font-medium">
                                                        {item.priority}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-sm mb-1 line-clamp-1">{item.title}</h4>
                                                <p className="text-xs opacity-90 line-clamp-2 leading-relaxed">
                                                    {item.message}
                                                </p>
                                            </div>
                                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                                {getTypeIcon(item.type)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar (Full Screen Overlay) - Portal Used to Escape Setup Stacking Context */}
            {createPortal(
                <div className="fixed inset-0 z-[100] flex justify-center pointer-events-none">
                    <div className="w-full max-w-[480px] h-full relative overflow-hidden">
                        <div className={`absolute inset-0 bg-primary pointer-events-auto flex flex-col p-6 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            {/* Close Button (Top Left - matching profile button) */}
                            <div className="flex justify-between items-center mb-6 mt-8">
                                <button onClick={toggleSidebar} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                    <X size={24} className="text-white" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 text-primary shadow-lg border-4 border-white/20">
                                    <User size={40} />
                                </div>
                                <h2 className="text-2xl font-bold">{profile?.name || 'Farmer'}</h2>
                                <p className="text-white/70 text-sm">RSBSA: {profile?.rsbsa}</p>
                            </div>

                            <div className="flex-1">
                                <div className="space-y-4">
                                    <div onClick={() => { toggleSidebar(); navigate('/profile'); }} className="p-4 bg-white/10 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-colors">
                                        <User size={20} />
                                        <span className="font-medium">My Profile</span>
                                    </div>
                                    <div onClick={() => { toggleSidebar(); navigate('/status'); }} className="p-4 bg-white/10 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-colors">
                                        <Activity size={20} />
                                        <span className="font-medium">Report History</span>
                                    </div>
                                    <div onClick={() => { toggleSidebar(); navigate('/notifications'); }} className="p-4 bg-white/10 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-colors">
                                        <Bell size={20} />
                                        <span className="font-medium">Notifications</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full bg-white text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-auto"
                            >
                                <LogOut size={20} />
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
