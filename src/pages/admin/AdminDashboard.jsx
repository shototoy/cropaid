import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, CloudRain, ArrowUp, ArrowDown, Bug, Droplets, Sun, TrendingUp } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { MOCK_DATA } from '../../config/mockData';

// Simple Bar Chart Component
function SimpleBarChart({ data, title }) {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 truncate">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${item.color || 'bg-primary'}`}
                            style={{ width: `${Math.max((item.value / maxValue) * 100, 10)}%` }}
                        >
                            <span className="text-xs font-bold text-white">{item.value}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Donut Chart Component
function DonutChart({ data, centerLabel, centerValue }) {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    let cumulativePercent = 0;
    
    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };
    
    return (
        <div className="flex items-center justify-center gap-6">
            <div className="relative">
                <svg viewBox="-1.2 -1.2 2.4 2.4" width="140" height="140" className="transform -rotate-90">
                    {data.map((slice, i) => {
                        const percent = slice.value / total;
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        cumulativePercent += percent;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                        
                        return (
                            <path
                                key={i}
                                d={pathData}
                                fill={slice.color}
                                className="transition-all duration-300 hover:opacity-80"
                            />
                        );
                    })}
                    <circle cx="0" cy="0" r="0.6" fill="white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{centerValue}</span>
                    <span className="text-xs text-gray-500">{centerLabel}</span>
                </div>
            </div>
            <div className="space-y-2">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-600">{item.label}: {item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { token, isMockMode } = useAuth();
    const [stats, setStats] = useState({
        totalFarmers: 0,
        pendingReports: 0,
        resolvedReports: 0,
        verifiedReports: 0,
        rejectedReports: 0,
        totalReports: 0,
        weatherAlerts: 1
    });
    const [reportsByType, setReportsByType] = useState([]);
    const [reportsByBarangay, setReportsByBarangay] = useState([]);
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            if (isMockMode) {
                // Enhanced Mock Data
                setStats({
                    ...MOCK_DATA.admin.Stats,
                    verifiedReports: 2,
                    rejectedReports: 1,
                    totalReports: 6
                });
                setReportsByType([
                    { type: 'pest', count: 3 },
                    { type: 'flood', count: 2 },
                    { type: 'drought', count: 1 }
                ]);
                setReportsByBarangay([
                    { barangay: 'San Jose', count: 3 },
                    { barangay: 'Liberty', count: 3 }
                ]);
                setRecentReports(MOCK_DATA.admin.Reports.slice(0, 5));
                setLoading(false);
                return;
            }

            try {
                // Fetch Stats (includes reportsByType and reportsByBarangay)
                const statsRes = await fetch(`${API_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsRes.json();

                // Fetch Recent Activity (Reports)
                const reportsRes = await fetch(`${API_URL}/admin/reports?limit=5`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const reportsData = await reportsRes.json();
                
                const reportsArray = reportsData.reports || reportsData;
                const normalizedReports = reportsArray.map(r => ({
                    ...r,
                    type: r.report_type || r.type,
                    first_name: r.farmer_name?.split(' ')[0] || r.first_name || 'Unknown'
                }));

                setStats({
                    totalFarmers: statsData.totalFarmers || 0,
                    pendingReports: statsData.pendingReports || 0,
                    resolvedReports: statsData.resolvedReports || 0,
                    verifiedReports: statsData.verifiedReports || 0,
                    rejectedReports: statsData.rejectedReports || 0,
                    totalReports: statsData.totalReports || 0,
                    weatherAlerts: 1
                });
                setReportsByType(statsData.reportsByType || []);
                setReportsByBarangay(statsData.reportsByBarangay || []);
                setRecentReports(normalizedReports.slice(0, 5));
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token || isMockMode) fetchData();
    }, [token, isMockMode]);

    const statCards = [
        { label: 'Total Farmers', value: stats.totalFarmers, icon: Users, color: 'bg-blue-500' },
        { label: 'Pending Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'bg-amber-500' },
        { label: 'Resolved Issues', value: stats.resolvedReports, icon: CheckCircle, color: 'bg-emerald-500' },
        { label: 'Weather Alerts', value: stats.weatherAlerts, icon: CloudRain, color: 'bg-red-500' },
    ];

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
    };

    // Prepare chart data
    const typeChartData = [
        { label: 'Pest', value: reportsByType.find(r => r.type === 'pest')?.count || 0, color: 'bg-red-500' },
        { label: 'Flood', value: reportsByType.find(r => r.type === 'flood')?.count || 0, color: 'bg-blue-500' },
        { label: 'Drought', value: reportsByType.find(r => r.type === 'drought')?.count || 0, color: 'bg-orange-500' }
    ];

    const statusDonutData = [
        { label: 'Pending', value: stats.pendingReports, color: '#f59e0b' },
        { label: 'Verified', value: stats.verifiedReports, color: '#3b82f6' },
        { label: 'Resolved', value: stats.resolvedReports, color: '#10b981' },
        { label: 'Rejected', value: stats.rejectedReports, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const barangayChartData = reportsByBarangay.slice(0, 5).map(b => ({
        label: b.barangay || 'Unknown',
        value: b.count,
        color: 'bg-primary'
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : stat.value}</h3>
                            </div>
                            <div className={`${stat.color} p-2 rounded-md text-white shadow-sm opacity-90`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reports by Type Chart */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Bug size={18} className="text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900">Reports by Type</h3>
                    </div>
                    {loading ? (
                        <div className="h-32 flex items-center justify-center text-gray-400">Loading...</div>
                    ) : (
                        <SimpleBarChart data={typeChartData} />
                    )}
                </div>

                {/* Status Donut Chart */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900">Report Status</h3>
                    </div>
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-gray-400">Loading...</div>
                    ) : statusDonutData.length > 0 ? (
                        <DonutChart 
                            data={statusDonutData} 
                            centerLabel="Total" 
                            centerValue={stats.totalReports || stats.pendingReports + stats.resolvedReports + stats.verifiedReports + stats.rejectedReports} 
                        />
                    ) : (
                        <div className="h-40 flex items-center justify-center text-gray-400">No data</div>
                    )}
                </div>

                {/* Reports by Barangay */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={18} className="text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900">Top Barangays</h3>
                    </div>
                    {loading ? (
                        <div className="h-32 flex items-center justify-center text-gray-400">Loading...</div>
                    ) : barangayChartData.length > 0 ? (
                        <SimpleBarChart data={barangayChartData} />
                    ) : (
                        <div className="h-32 flex items-center justify-center text-gray-400">No location data</div>
                    )}
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Incident Reports</h3>
                <div className="space-y-4">
                    {loading && <p className="text-sm text-gray-400">Loading activity...</p>}

                    {!loading && recentReports.length === 0 && <p className="text-sm text-gray-400">No recent activity.</p>}

                    <div className="grid gap-3">
                        {recentReports.map((report) => (
                            <div key={report.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                                    ${report.type?.toLowerCase() === 'pest' ? 'bg-red-100 text-red-600' :
                                        report.type?.toLowerCase() === 'flood' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}
                                >
                                    {report.type?.toLowerCase() === 'pest' ? <Bug size={18} /> :
                                     report.type?.toLowerCase() === 'flood' ? <Droplets size={18} /> : <Sun size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 truncate">
                                        <span className="font-bold">{report.first_name || 'Farmer'}</span> reported <span className="font-medium capitalize">{report.type}</span> issue
                                    </p>
                                    <p className="text-xs text-gray-400">{report.location || 'Unknown location'}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                        report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        report.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {report.status}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">{formatDate(report.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
