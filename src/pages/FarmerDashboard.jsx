
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, Home, User, LogOut, X, Bell, Newspaper, LayoutGrid, Sun, Cloud, CloudRain, CloudLightning, Menu, Megaphone, AlertTriangle, CheckCircle, ChevronRight, MapPin, Tractor } from 'lucide-react';
import Layout from '../components/Layout';
import BottomNavbar from '../components/BottomNavbar';
import { API_URL, useAuth } from '../context/AuthContext';
import { MOCK_DATA } from '../config/mockData';
import { fetchWeather, getCurrentPosition } from '../services/api';

export default function FarmerDashboard() {
    const navigate = useNavigate();
    const { user, logout, token, isMockMode } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dashboardProfile, setDashboardProfile] = useState(null); // Local profile state from API
    const [weather, setWeather] = useState(null);
    const [liveWeather, setLiveWeather] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [carouselItems, setCarouselItems] = useState(() => {
        try {
            const cached = sessionStorage.getItem('preload_news');
            if (cached) {
                const items = JSON.parse(cached);
                const newsList = Array.isArray(items) ? items : items.news || [];

                const top5 = newsList.slice(0, 5);
                const recentItems = top5.filter(item => {
                    const date = item.created_at || item.date;
                    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                    return new Date(date) > threeDaysAgo;
                });
                if (recentItems.length > 0) return recentItems;
            }
        } catch (e) {
            console.error("Cache load error", e);
        }
        return [{ isDefault: true }];
    });
    const [stats, setStats] = useState({ active_reports: 0 });
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedAdvisory, setSelectedAdvisory] = useState(null);

    const profile = dashboardProfile || user;

    const getWeather = async () => {
        try {
            let lat = 6.5294; // Default: Norala, South Cotabato, Philippines
            let lon = 124.6647;

            try {
                const coords = await getCurrentPosition();
                lat = coords.latitude;
                lon = coords.longitude;
            } catch (err) {

            }

            const weatherData = await fetchWeather(lat, lon);
            setLiveWeather(weatherData);
        } catch (err) {

        }
    };

    useEffect(() => {
        getWeather();

        const interval = setInterval(getWeather, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (isMockMode) {
                const username = user?.username || 'james';
                const mockDashboard = MOCK_DATA.getFarmerDashboard(username);
                setStats(mockDashboard.stats);
                setWeather(mockDashboard.weather);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/farmer/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats({
                        ...data.stats,
                        active_reports: data.stats.pending
                    });
                    setWeather(data.weather);
                    if (data.profile) setDashboardProfile(data.profile);
                }
            } catch (error) {
                console.error("Failed to load dashboard", error);
            }
        };

        if (token || isMockMode) fetchDashboardData();
    }, [token, isMockMode, user]);

    useEffect(() => {
        const pollNotifications = async () => {
            if (isMockMode) {
                setUnreadCount(prev => prev > 0 ? prev : 2); // Simulating 2 unread in mock
                return;
            }
            try {
                const response = await fetch(`${API_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (error) {
                console.error("Notification polling error", error);
            }
        };

        pollNotifications();
        const interval = setInterval(pollNotifications, 30000);
        return () => clearInterval(interval);
    }, [token, isMockMode]);

    useEffect(() => {
        const fetchAdvisories = async () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            let items = [];

            if (isMockMode) {

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

                }
            }


            const top5 = items.slice(0, 5);

            const recentItems = top5.filter(item => {
                const date = item.created_at || item.date;
                return new Date(date) >= threeDaysAgo;
            });

            const normalizedItems = recentItems.map(item => ({
                id: item.id,
                title: item.title,
                message: item.content ? (item.content.substring(0, 100) + '...') : item.summary,
                type: item.type,
                priority: item.priority,
                date: item.created_at || item.date
            }));

            setCarouselItems([...normalizedItems, { isDefault: true }]);
        };

        if (token || isMockMode) fetchAdvisories();
    }, [token, isMockMode]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % carouselItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselItems.length]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const getWeatherIcon = (condition) => {
        if (!condition) return <Sun size={24} className="text-yellow-500" />;
        const cond = condition.toLowerCase();
        if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain size={24} className="text-blue-500" />;
        if (cond.includes('cloud') || cond.includes('overcast')) return <Cloud size={24} className="text-gray-500" />;
        return <Sun size={24} className="text-yellow-500" />;
    };

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
            { }
            <div className="bg-primary pb-20 pt-12 px-6 rounded-b-[2.5rem] relative shadow-lg">
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

                { }
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

            { }
            <div className="mt-2 px-5 py-4">
                { }
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Quick Services</h3>
                <div className="grid grid-cols-5 gap-2 mb-6">
                    <div className="flex flex-col items-center gap-2" onClick={() => navigate('/notifications')}>
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-primary/90 transition-colors relative">
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm scale-110 animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Notifs</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={() => navigate('/news')}>
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
                            <Newspaper size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">News</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={() => navigate('/my-map')}>
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
                            <MapPin size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Map</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={() => navigate('/my-farms')}>
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
                            <Home size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Farms</span>
                    </div>
                    <div className="flex flex-col items-center gap-2" onClick={toggleSidebar}>
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
                            <LayoutGrid size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">More</span>
                    </div>
                </div>

                { }
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

                <div className="relative overflow-hidden rounded-xl shadow-md min-h-[140px] flex">
                    <div
                        className="w-full flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                        {carouselItems.map((item, index) => (
                            <div key={index} className="w-full flex-shrink-0">
                                {item.isDefault ? (
                                    <div className="bg-primary text-white p-4 h-full flex items-center gap-4">
                                        <div className="bg-white/20 p-3 rounded-full">
                                            <CheckCircle size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">System Monitoring Active</h4>
                                            <p className="text-xs opacity-90 mt-1">No other critical alerts at this time. Stay safe!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`${getCardStyle(item.priority)} h-full flex relative overflow-hidden`}>
                                        {/* Main Content Area - Click to view news list */}
                                        <div className="flex-1 p-4 flex flex-col justify-center relative z-10" onClick={() => navigate('/news')}>
                                            <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 pointer-events-none">
                                                {getTypeIcon(item.type, "w-24 h-24")}
                                            </div>

                                            <div className="flex items-start justify-between relative z-10 pointer-events-none">
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
                                            </div>
                                        </div>

                                        {/* Read More Strip - Click to expand */}
                                        <div
                                            className="w-10 bg-black/10 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors z-20 group"
                                            onClick={(e) => { e.stopPropagation(); setSelectedAdvisory(item); }}
                                        >
                                            <div className="transform -rotate-90 whitespace-nowrap flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-bold text-white">Read More</span>
                                                <ChevronRight size={10} className="text-white transform rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            { }
            {createPortal(
                <div className="fixed inset-0 z-[100] flex justify-center pointer-events-none">
                    <div className="w-full max-w-[480px] h-full relative overflow-hidden">
                        { }
                        <div className={`absolute inset-0 bg-white pointer-events-auto flex flex-col shadow-2xl transform transition-transform duration-300 ease-out z-[101] max-w-[300px] rounded-r-3xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                            { }
                            <div className="p-6 bg-primary/5 border-b border-primary/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border-2 border-primary/20">
                                        <User size={32} />
                                    </div>
                                    <button onClick={toggleSidebar} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{profile?.name || 'Farmer'}</h2>
                                <p className="text-gray-500 text-xs font-medium mt-1">RSBSA: <span className="text-primary">{profile?.rsbsa || 'N/A'}</span></p>
                            </div>

                            { }
                            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                                <MenuItem icon={<User size={20} />} label="My Profile" onClick={() => { toggleSidebar(); navigate('/profile'); }} />
                                <MenuItem icon={<MapPin size={20} />} label="Map" onClick={() => { toggleSidebar(); navigate('/my-map'); }} />
                                <MenuItem icon={<Tractor size={20} />} label="My Farms" onClick={() => { toggleSidebar(); navigate('/my-farms'); }} />
                                <div className="h-px bg-gray-100 my-2"></div>
                                <MenuItem icon={<Newspaper size={20} />} label="News & Advisories" onClick={() => { toggleSidebar(); navigate('/news'); }} />
                                <MenuItem icon={<Activity size={20} />} label="Report History" onClick={() => { toggleSidebar(); navigate('/status'); }} />
                            </div>

                            { }
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={logout}
                                    className="w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Log Out</span>
                                </button>
                                <p className="text-center text-[10px] text-gray-300 mt-4">Version 1.2.0 • CropAid</p>
                            </div>
                        </div>

                        { }
                        {isSidebarOpen && (
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300" onClick={toggleSidebar}></div>
                        )}
                    </div>
                </div>,
                document.body
            )}
            {/* Expanded Advisory Overlay */}
            {selectedAdvisory && createPortal(
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedAdvisory(null)}></div>
                    <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-up ${getCardStyle(selectedAdvisory.priority)}`}>
                        <div className="p-6 relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedAdvisory(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors z-50"
                            >
                                <X size={20} />
                            </button>

                            {/* Background Icon */}
                            <div className="absolute -right-10 -bottom-10 opacity-10 transform rotate-12 pointer-events-none">
                                {getTypeIcon(selectedAdvisory.type, "w-64 h-64")}
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                                        {selectedAdvisory.type}
                                    </span>
                                    <span className="text-xs opacity-90 uppercase font-bold tracking-wider">
                                        {selectedAdvisory.priority} Priority
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold leading-tight mb-4">{selectedAdvisory.title}</h3>

                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10 mb-4 h-64 overflow-y-auto">
                                    <p className="text-sm leading-relaxed opacity-95">
                                        {selectedAdvisory.message}
                                    </p>
                                    <p className="mt-4 text-xs opacity-60 font-medium">
                                        Released: {new Date(selectedAdvisory.date).toLocaleString()}
                                    </p>
                                </div>

                                <button
                                    onClick={() => { setSelectedAdvisory(null); navigate('/news'); }}
                                    className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-50 transition-transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>View Full Details</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

const MenuItem = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary cursor-pointer transition-colors group">
        <div className="text-gray-400 group-hover:text-primary transition-colors">{icon}</div>
        <span className="font-medium text-sm">{label}</span>
        <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
    </div>
);
