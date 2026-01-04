import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Plus, Trash2, Megaphone, CloudRain, AlertTriangle, FileText, Info, Newspaper } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';

export default function AdminNews() {
    const { token, isMockMode } = useAuth();
    const { setHeaderAction } = useOutletContext();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'news', // news, advisory, weather, alert
        priority: 'normal' // low, normal, medium, high, critical
    });

    // Inject "Post Update" button into header
    useEffect(() => {
        setHeaderAction(
            <button
                onClick={() => setShowForm(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-colors whitespace-nowrap ${showForm
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-primary text-white hover:bg-primary/90'
                    }`}
            >
                {showForm ? 'Cancel' : <><Plus size={16} /> Post Update</>}
            </button>
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction, showForm]);

    const fetchNews = async () => {
        setLoading(true);
        if (isMockMode) {
            // Mock Data
            setTimeout(() => {
                setNews([
                    { id: 1, title: 'El Nino Advisory', content: 'Prepare for dry season. Conserve water.', type: 'advisory', priority: 'high', created_at: new Date().toISOString() },
                    { id: 2, title: 'Distribution of Seeds', content: 'Seed distribution at Municipality Hall on Monday.', type: 'news', priority: 'normal', created_at: new Date().toISOString() }
                ]);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/news`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNews(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token || isMockMode) fetchNews();
    }, [token, isMockMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isMockMode) {
            setNews([{ ...formData, id: Date.now(), created_at: new Date().toISOString() }, ...news]);
            setShowForm(false);
            setFormData({ title: '', content: '', type: 'news', priority: 'normal' });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchNews();
                setShowForm(false);
                setFormData({ title: '', content: '', type: 'news', priority: 'normal' });
            } else {
                alert('Failed to post news');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        if (isMockMode) {
            setNews(news.filter(n => n.id !== id));
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchNews();
        } catch (err) {
            console.error(err);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'advisory': return <Megaphone size={18} />;
            case 'weather': return <CloudRain size={18} />;
            case 'alert': return <AlertTriangle size={18} />;
            default: return <Newspaper size={18} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'low': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200'; // normal
        }
    };

    const getIconColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-red-500 bg-red-50';
            case 'high': return 'text-orange-500 bg-orange-50';
            case 'medium': return 'text-amber-500 bg-amber-50';
            case 'low': return 'text-gray-400 bg-gray-50';
            default: return 'text-blue-500 bg-blue-50'; // normal
        }
    }

    return (
        <div className="space-y-6">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="flex justify-between items-center lg:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">News & Advisories</h1>
                    <p className="text-gray-500 text-sm">Manage announcements, weather alerts, and farmer advisories.</p>
                </div>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Post</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="news">General News</option>
                                    <option value="advisory">Advisory</option>
                                    <option value="weather">Weather Update</option>
                                    <option value="alert">Emergency Alert</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. Heavy Rain Warning"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Write the full details here..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm"
                            >
                                Publish Post
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 py-10">Loading updates...</p>
                ) : news.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200 text-gray-400">
                        <Bell size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No active news or advisories.</p>
                    </div>
                ) : (
                    news.map(item => (
                        <div key={item.id} className={`p-5 rounded-lg border flex items-start gap-4 transition-all hover:shadow-md bg-white border-gray-200`}>
                            <div className={`p-3 rounded-full flex-shrink-0 ${getIconColor(item.priority)}`}>
                                {getTypeIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getPriorityColor(item.priority)}`}>
                                        {item.priority}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {item.type}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        • {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
