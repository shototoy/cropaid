import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertTriangle, FileText, User, Bug, CloudRain, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { startNotificationPolling, stopNotificationPolling, markNotificationRead } from '../services/api';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export default function NotificationBell() {
    const { token, isMockMode } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const pollingRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const setupNotifications = async () => {
            if (isMockMode) return;

            if (Capacitor.isNativePlatform()) {
                await LocalNotifications.requestPermissions();
                await LocalNotifications.createChannel({
                    id: 'default',
                    name: 'General Notifications',
                    importance: 5,
                    visibility: 1,
                    vibration: true,
                    sound: 'beep.wav',
                });
            } else if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        };
        setupNotifications();
    }, [isMockMode]);

    const fetchAllNotifications = async () => {
        console.log('[NOTIF BELL] Starting fetch, isMockMode:', isMockMode);
        console.log('[NOTIF BELL] Token:', token ? 'EXISTS' : 'MISSING');

        setLoading(true);

        if (isMockMode) {
            const mockNotifs = [
                {
                    id: 1,
                    type: 'new_report',
                    title: 'New Report from Juan Dela Cruz',
                    message: 'Juan Dela Cruz filed a pest report.',
                    created_at: new Date().toISOString(),
                    is_read: false,
                    reference_id: 'mock-1'
                },
                {
                    id: 2,
                    type: 'new_report',
                    title: 'New Report from Maria Santos',
                    message: 'Maria Santos filed a flood report.',
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    is_read: true,
                    reference_id: 'mock-2'
                }
            ];
            console.log('[NOTIF BELL] Using mock data, count:', mockNotifs.length);
            setNotifications(mockNotifs);
            setUnreadCount(mockNotifs.filter(n => !n.is_read).length);
            setLoading(false);
            return mockNotifs;
        }

        try {
            const url = `${API_URL}/notifications?limit=20`;
            console.log('[NOTIF BELL] Fetching from:', url);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('[NOTIF BELL] Response status:', response.status);
            console.log('[NOTIF BELL] Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('[NOTIF BELL] Raw response:', data);
                console.log('[NOTIF BELL] Data type:', typeof data);

                const notifs = Array.isArray(data) ? data : data.notifications || [];
                console.log('[NOTIF BELL] Extracted notifications, count:', notifs.length);

                setNotifications(notifs);
                if (data.unreadCount !== undefined) {
                    console.log('[NOTIF BELL] Setting unread count:', data.unreadCount);
                    setUnreadCount(data.unreadCount);
                }
                return notifs;
            } else {
                const errorText = await response.text();
                console.error('[NOTIF BELL] Error response:', errorText);
            }
        } catch (err) {
            console.error('[NOTIF BELL] Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
            console.log('[NOTIF BELL] Fetch complete');
        }
        return [];
    };

    useEffect(() => {
        if (token) {
            const initializeNotifications = async () => {
                // Fetch initial state without triggering push
                const initialNotifs = await fetchAllNotifications();
                const maxId = initialNotifs.length > 0 ? Math.max(...initialNotifs.map(n => n.id)) : 0;

                const handleNewNotifications = async (data) => {
                    if (data.notifications && Array.isArray(data.notifications)) {
                        setNotifications(prev => {
                            const newIds = new Set(data.notifications.map(n => n.id));
                            const filteredPrev = prev.filter(n => !newIds.has(n.id));
                            return [...data.notifications, ...filteredPrev];
                        });

                        const newUnread = data.notifications.filter(n => !n.is_read).length;
                        setUnreadCount(prev => prev + newUnread);

                        const unreadNotifications = data.notifications.filter(n => !n.is_read);

                        if (unreadNotifications.length > 0) {
                            if (Capacitor.isNativePlatform()) {
                                await LocalNotifications.schedule({
                                    notifications: unreadNotifications.map(n => ({
                                        title: n.title || 'New Notification',
                                        body: n.message,
                                        id: typeof n.id === 'number' ? n.id : Math.floor(Math.random() * 100000),
                                        schedule: { at: new Date(Date.now() + 100) },
                                        sound: 'beep.wav',
                                        actionTypeId: '',
                                        channelId: 'default',
                                        extra: {
                                            reference_id: n.reference_id
                                        }
                                    }))
                                });
                            } else if (Notification.permission === 'granted') {
                                unreadNotifications.forEach(n => {
                                    new Notification(n.title || 'New Notification', {
                                        body: n.message,
                                        icon: '/icon.png'
                                    });
                                });
                            }
                        }
                    }
                };

                pollingRef.current = startNotificationPolling(token, handleNewNotifications, 10000, maxId);
            };

            initializeNotifications();
        }
        return () => {
            if (pollingRef.current) {
                stopNotificationPolling(pollingRef.current);
            }
        };
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!isOpen) {
            fetchAllNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationRead(token, notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getNotificationIcon = (notification) => {
        const type = notification.type?.toLowerCase();
        const text = (notification.message || '').toLowerCase();

        if (type === 'new_report' || text.includes('report')) {
            if (text.includes('pest')) return <Bug size={18} className="text-red-500" />;
            if (text.includes('flood')) return <CloudRain size={18} className="text-blue-500" />;
            if (text.includes('drought')) return <Sun size={18} className="text-orange-500" />;
            return <FileText size={18} className="text-green-500" />;
        }

        switch (type) {
            case 'alert': return <AlertTriangle size={18} className="text-red-500" />;
            case 'user': return <User size={18} className="text-green-500" />;
            default: return <Bell size={18} className="text-gray-500" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            { }
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
                <Bell size={22} className="text-gray-600" />

                { }
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            { }
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    { }
                    <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary hover:text-primary-dark font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    { }
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/50' : ''
                                        }`}
                                    onClick={() => {
                                        if (!notification.is_read) handleMarkAsRead(notification.id);
                                        if (notification.reference_id) {
                                            navigate('/admin/reports', { state: { openReportId: notification.reference_id } });
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                            <div className="mt-0.5">
                                                {getNotificationIcon(notification)}
                                            </div>
                                            <p className="text-[10px] text-gray-400 text-center leading-tight">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    { }
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-t text-center">
                            <button className="text-xs text-primary hover:text-primary-dark font-medium">
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
