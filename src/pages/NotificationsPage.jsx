import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth, API_URL } from '../context/AuthContext';
import { Bell, CheckCircle, AlertTriangle, Info, FileText, Clock, Check, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { token, isMockMode } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    // Mock notifications for demo
    const mockNotifications = [
        {
            id: 1,
            type: 'status_change',
            title: 'Report Verified',
            message: 'Your pest report has been verified by the admin. An agricultural officer will visit soon.',
            is_read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            reference_id: '101'
        },
        {
            id: 2,
            type: 'advisory',
            title: 'Weather Advisory',
            message: 'Heavy rainfall expected in the next 48 hours. Please secure your crops and drainage systems.',
            is_read: false,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            reference_id: null
        },
        {
            id: 3,
            type: 'system',
            title: 'Welcome to CropAid!',
            message: 'Thank you for registering. Start by submitting your first farm report.',
            is_read: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            reference_id: null
        },
        {
            id: 4,
            type: 'status_change',
            title: 'Report Resolved',
            message: 'Your drought report has been marked as resolved. Thank you for your patience.',
            is_read: true,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            reference_id: '102'
        }
    ];

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);

            if (isMockMode) {
                setTimeout(() => {
                    setNotifications(mockNotifications);
                    setLoading(false);
                }, 500);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch notifications');
                
                const data = await response.json();
                setNotifications(data.notifications || data);
            } catch (err) {
                console.error(err);
                // Fall back to mock data if API fails
                setNotifications(mockNotifications);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token, isMockMode]);

    const markAsRead = async (id) => {
        if (isMockMode) {
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            return;
        }

        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        if (isMockMode) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            return;
        }

        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id) => {
        if (isMockMode) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            return;
        }

        try {
            await fetch(`${API_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'status_change':
                return <CheckCircle size={20} className="text-blue-500" />;
            case 'advisory':
                return <AlertTriangle size={20} className="text-amber-500" />;
            case 'new_report':
                return <FileText size={20} className="text-green-500" />;
            case 'system':
            default:
                return <Info size={20} className="text-gray-500" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'read') return n.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <Header title="Notifications" showBack onBack={() => navigate(-1)} />

            <div className="flex-1 overflow-y-auto">
                {/* Filter Tabs */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                            { key: 'read', label: 'Read' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                    filter === key
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary font-medium hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No notifications</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer ${
                                        notification.is_read
                                            ? 'border-gray-100'
                                            : 'border-primary/20 bg-primary/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            notification.is_read ? 'bg-gray-100' : 'bg-white'
                                        }`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`text-sm font-semibold ${
                                                    notification.is_read ? 'text-gray-700' : 'text-gray-900'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {!notification.is_read && (
                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                    )}
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className={`text-xs mt-1 line-clamp-2 ${
                                                notification.is_read ? 'text-gray-500' : 'text-gray-600'
                                            }`}>
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                {notification.reference_id && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/status');
                                                        }}
                                                        className="text-xs text-primary font-medium hover:underline"
                                                    >
                                                        View Report →
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors ml-auto"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
