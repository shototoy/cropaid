import { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { MOCK_DATA } from '../config/mockData';

export function usePendingReports() {
    const { token, isMockMode } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            if (isMockMode) {
                const count = MOCK_DATA.admin.Reports.filter(r => r.status === 'Pending').length;
                setPendingCount(count);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) return;
                const data = await response.json();
                setPendingCount(Number(data.pendingReports) || 0);
            } catch (err) {
                console.error('Failed to fetch pending reports count:', err);
            }
        };

        if (token || isMockMode) {
            fetchPendingCount();
            const interval = setInterval(fetchPendingCount, 30000);
            return () => clearInterval(interval);
        }
    }, [token, isMockMode]);

    return pendingCount;
}
