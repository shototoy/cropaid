import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

export default function ConnectionStatus() {
    const { isMockMode } = useAuth();
    const [isDisconnected, setIsDisconnected] = useState(false);

    useEffect(() => {
        if (isMockMode) return;

        let intervalId;

        const checkConnection = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

                const response = await fetch(`${API_URL}/health`, {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    if (isDisconnected) setIsDisconnected(false);
                } else {
                    if (!isDisconnected) setIsDisconnected(true);
                }
            } catch (error) {
                if (!isDisconnected) setIsDisconnected(true);
            }
        };
        intervalId = setInterval(checkConnection, 5000);
        checkConnection();

        return () => clearInterval(intervalId);
    }, [isMockMode, isDisconnected]);

    if (!isDisconnected) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border-b-4 border-red-500 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WifiOff size={32} className="text-red-500" />
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Lost</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    We can't reach the server right now. The app will automatically reconnect when the server is back online.
                </p>

                <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 py-2 px-4 rounded-full">
                        <RefreshCw size={14} className="animate-spin" />
                        Attempting to reconnect...
                    </div>
                </div>
            </div>
        </div>
    );
}
