import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth, API_URL } from '../context/AuthContext';
import { Newspaper, AlertTriangle, Leaf, Bug, CloudRain, Sun, Calendar, ChevronRight, Bell, Megaphone } from 'lucide-react';
const MOCK_NEWS = [
    {
        id: 1,
        title: 'Pest Alert: Black Bug Infestation Warning',
        summary: 'The Municipal Agriculture Office has detected increased black bug activity in several barangays. Farmers are advised to monitor their rice fields closely.',
        content: 'The Municipal Agriculture Office has detected increased black bug activity in several barangays including Poblacion, San Miguel, and Benigno Aquino. Farmers are advised to monitor their rice fields closely and report any signs of infestation immediately.',
        type: 'alert',
        category: 'pest',
        date: new Date(Date.now() - 86400000).toISOString(),
        priority: 'high'
    },
    {
        id: 2,
        title: 'Weather Advisory: Dry Season Preparations',
        summary: 'With the dry season approaching, farmers should begin preparing water conservation strategies for their crops.',
        content: 'The Philippine Atmospheric, Geophysical and Astronomical Services Administration (PAGASA) forecasts below-normal rainfall in the coming months. Farmers are encouraged to implement water-saving irrigation techniques and consider drought-resistant crop varieties.',
        type: 'advisory',
        category: 'weather',
        date: new Date(Date.now() - 172800000).toISOString(),
        priority: 'medium'
    },
    {
        id: 3,
        title: 'New Seed Distribution Program',
        summary: 'The DA is distributing free high-yield rice seeds to registered farmers this month.',
        content: 'The Department of Agriculture, in partnership with the local government, will be distributing free certified high-yield rice seeds to all RSBSA-registered farmers. Distribution will be at the Municipal Agriculture Office starting Monday.',
        type: 'news',
        category: 'program',
        date: new Date(Date.now() - 259200000).toISOString(),
        priority: 'low'
    },
    {
        id: 4,
        title: 'Flood Warning: Low-lying Areas',
        summary: 'Continuous rain expected. Farmers in flood-prone areas should take precautions.',
        content: 'PAGASA has issued a flood warning for low-lying areas due to continuous rainfall. Farmers are advised to harvest mature crops if possible and move equipment to higher ground. The CropAid system is ready to receive flood damage reports.',
        type: 'alert',
        category: 'flood',
        date: new Date(Date.now() - 345600000).toISOString(),
        priority: 'high'
    },
    {
        id: 5,
        title: 'Free Pest Control Training',
        summary: 'Learn integrated pest management techniques at this free workshop.',
        content: 'The Municipal Agriculture Office is conducting a free Integrated Pest Management (IPM) training for farmers. Topics include biological pest control, proper pesticide application, and early detection methods. Register at the MAO office.',
        type: 'news',
        category: 'training',
        date: new Date(Date.now() - 432000000).toISOString(),
        priority: 'low'
    },
    {
        id: 6,
        title: 'Fertilizer Subsidy Application Open',
        summary: 'Apply now for discounted fertilizer under the government subsidy program.',
        content: 'The Fertilizer Subsidy Program is now accepting applications. Eligible farmers can receive up to 50% discount on fertilizers. Bring your RSBSA card and valid ID to the Municipal Agriculture Office to apply.',
        type: 'news',
        category: 'program',
        date: new Date(Date.now() - 518400000).toISOString(),
        priority: 'medium'
    }
];

export default function NewsPage() {
    const { token, isMockMode } = useAuth();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            if (isMockMode) {
                const mockReports = [
                    { type: 'pest', location: 'San Jose', status: 'verified' },
                    { type: 'pest', location: 'Liberty', status: 'verified' },
                    { type: 'flood', location: 'Poblacion', status: 'verified' },
                ];
                const autoNews = generateNewsFromReports(mockReports);
                const allNews = [...autoNews, ...MOCK_NEWS].sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );

                setTimeout(() => {
                    setNews(allNews);
                    setLoading(false);
                }, 300);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/news`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const newsItems = Array.isArray(data) ? data : data.news || [];
                    const normalizedNews = newsItems.map(a => ({
                        ...a,
                        date: a.created_at || a.date,
                        summary: a.content ? (a.content.substring(0, 100) + '...') : '',
                        category: a.type // Map type to category for icon logic if category is missing
                    }));

                    setNews(normalizedNews);
                } else {
                    setNews([]);
                }
            } catch (err) {
                console.error("News fetch error:", err);
                setNews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [token, isMockMode]);
    const generateNewsFromReports = (reports) => {
        if (!reports || reports.length === 0) return [];

        const grouped = reports.reduce((acc, report) => {
            const type = report.type || report.report_type;
            if (!acc[type]) acc[type] = { count: 0, locations: new Set() };
            acc[type].count++;
            if (report.location) acc[type].locations.add(report.location);
            return acc;
        }, {});

        return Object.entries(grouped).map(([type, data]) => {
            const locations = Array.from(data.locations).join(', ');
            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
            return {
                id: `auto-${type}-${Date.now()}`,
                title: `${typeLabel} Activity Alert: ${data.count} Verified Report${data.count > 1 ? 's' : ''}`,
                summary: `Recent ${type} incidents verified in ${locations || 'the municipality'}. Take precautions.`,
                content: `The Municipal Agriculture Office has verified ${data.count} ${type} report${data.count > 1 ? 's' : ''} from farmers in ${locations || 'various barangays'}. Implement recommended countermeasures.`,
                type: data.count >= 3 ? 'alert' : 'advisory',
                category: type,
                date: new Date().toISOString(),
                priority: data.count >= 3 ? 'high' : 'medium',
                isAutoGenerated: true
            };
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'advisory': return <Megaphone size={18} className="text-amber-500" />;
            case 'weather': return <CloudRain size={18} className="text-blue-500" />;
            case 'alert': return <AlertTriangle size={18} className="text-red-500" />;
            default: return <Newspaper size={18} className="text-primary" />;
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'low': return 'bg-gray-100 text-gray-600 border border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border border-blue-200';
        }
    };

    const getCardStyle = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-50/50 border-l-4 border-red-500';
            case 'high': return 'bg-orange-50/50 border-l-4 border-orange-500';
            case 'medium': return 'bg-amber-50/50 border-l-4 border-amber-500';
            case 'low': return 'bg-white border-l-4 border-gray-300';
            default: return 'bg-blue-50/50 border-l-4 border-blue-500';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredNews = filter === 'all'
        ? news
        : news.filter(item => item.type === filter);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <Header title="News & Advisories" showBack />

            {}
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex gap-2 overflow-x-auto">
                {[
                    { key: 'all', label: 'All', icon: Newspaper },
                    { key: 'alert', label: 'Alerts', icon: AlertTriangle },
                    { key: 'advisory', label: 'Advisories', icon: Bell },
                    { key: 'news', label: 'News', icon: Leaf },
                    { key: 'weather', label: 'Weather', icon: CloudRain }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === tab.key
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filteredNews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Newspaper size={48} className="mb-2 opacity-50" />
                        <p>No news available</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNews.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedArticle(item)}
                                className={`rounded-lg p-4 cursor-pointer hover:shadow-md transition-all shadow-sm ${getCardStyle(item.priority)}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTypeIcon(item.type)}
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide ${getPriorityBadgeColor(item.priority)}`}>
                                                {item.priority}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                                {item.type}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.summary}</p>
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                            {formatDate(item.date)}
                                        </p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400 shrink-0 self-center" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {}
            {selectedArticle && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
                    onClick={() => setSelectedArticle(null)}
                >
                    <div
                        className="bg-white rounded-t-2xl w-full max-w-[480px] max-h-[80vh] overflow-hidden animate-slide-up"
                        onClick={e => e.stopPropagation()}
                    >
                        {}
                        <div className={`p-4 ${selectedArticle.type === 'alert' ? 'bg-red-500' :
                            selectedArticle.type === 'advisory' ? 'bg-blue-500' : 'bg-primary'
                            } text-white`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-white/20">
                                    {selectedArticle.type}
                                </span>
                                <span className="text-xs opacity-80">{formatDate(selectedArticle.date)}</span>
                            </div>
                            <h2 className="text-lg font-bold">{selectedArticle.title}</h2>
                        </div>

                        {}
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {selectedArticle.content}
                            </p>

                            {selectedArticle.type === 'alert' && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-700 flex items-center gap-2">
                                        <AlertTriangle size={14} />
                                        <span>This is an important alert. Please take necessary precautions.</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
