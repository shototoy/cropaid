import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { mockReports } from '../data/mockReports';
import './ReportsMap.css';

const ReportsMap = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('http://localhost:3000/api/admin/reports', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setReports(data);
                    setLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.log('Using mock data');
        }
        setReports(mockReports);
        setLoading(false);
    };

    const handleReportClick = (reportId) => {
        navigate(`/admin/reports?highlight=${reportId}`);
    };

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.type === filter);

    const stats = {
        total: reports.length,
        pest: reports.filter(r => r.type === 'pest').length,
        flood: reports.filter(r => r.type === 'flood').length,
        drought: reports.filter(r => r.type === 'drought').length,
        pending: reports.filter(r => r.status === 'pending').length,
        verified: reports.filter(r => r.status === 'verified').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
    };

    if (loading) {
        return (
            <div className="reports-map-page">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading map data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-map-page">
            <div className="map-header">
                <div className="header-content">
                    <h1>Reports Map</h1>
                    <p>Norala, South Cotabato, Philippines</p>
                    <div className="header-info">
                        <span className="info-badge">📍 {reports.length} Active Locations</span>
                        <span className="info-badge">🗺️ 5 Barangays</span>
                    </div>
                </div>
                <div className="map-stats">
                    <div className="stat-card total">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Reports</span>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-card verified">
                        <span className="stat-value">{stats.verified}</span>
                        <span className="stat-label">Verified</span>
                    </div>
                    <div className="stat-card resolved">
                        <span className="stat-value">{stats.resolved}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                </div>
            </div>
            <div className="map-filters">
                <button
                    className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('all')}
                >
                    All Reports ({stats.total})
                </button>
                <button
                    className={filter === 'pest' ? 'filter-btn active pest' : 'filter-btn pest'}
                    onClick={() => setFilter('pest')}
                >
                    🐛 Pest ({stats.pest})
                </button>
                <button
                    className={filter === 'flood' ? 'filter-btn active flood' : 'filter-btn flood'}
                    onClick={() => setFilter('flood')}
                >
                    🌊 Flood ({stats.flood})
                </button>
                <button
                    className={filter === 'drought' ? 'filter-btn active drought' : 'filter-btn drought'}
                    onClick={() => setFilter('drought')}
                >
                    ☀️ Drought ({stats.drought})
                </button>
            </div>
            <Map reports={filteredReports} onReportClick={handleReportClick} />
            <div className="map-footer">
                <div className="footer-info">
                    <p>💡 <strong>Tip:</strong> Click on any marker to zoom in and view details</p>
                    <p>🔍 Hover over barangay boundaries to see names</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsMap;
