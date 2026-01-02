import { useState, useEffect } from 'react';
import Map from '../components/Map';
import './ReportsMap.css';

const ReportsMap = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/admin/reports', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            } else {
                setReports(getMockReports());
            }
        } catch (error) {
            setReports(getMockReports());
        } finally {
            setLoading(false);
        }
    };

    const getMockReports = () => [
        {
            id: '1',
            type: 'pest',
            status: 'pending',
            location: 'Barangay San Jose',
            details: { description: 'Black bug infestation in rice fields', severity: 'High' },
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            latitude: 6.5019,
            longitude: 124.8019
        },
        {
            id: '2',
            type: 'flood',
            status: 'verified',
            location: 'Barangay Liberty',
            details: { description: 'River overflow affecting corn crops', severity: 'Critical' },
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            latitude: 6.4950,
            longitude: 124.8100
        },
        {
            id: '3',
            type: 'drought',
            status: 'resolved',
            location: 'Barangay Poblacion',
            details: { description: 'Water shortage in irrigation system', severity: 'Medium' },
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            latitude: 6.5080,
            longitude: 124.7950
        },
        {
            id: '4',
            type: 'pest',
            status: 'verified',
            location: 'Barangay Esperanza',
            details: { description: 'Armyworm outbreak in corn fields', severity: 'High' },
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            latitude: 6.5100,
            longitude: 124.8080
        },
        {
            id: '5',
            type: 'flood',
            status: 'pending',
            location: 'Barangay Matapol',
            details: { description: 'Heavy rainfall causing waterlogging', severity: 'Medium' },
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            latitude: 6.4980,
            longitude: 124.7980
        }
    ];

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.type === filter);

    const stats = {
        total: reports.length,
        pest: reports.filter(r => r.type === 'pest').length,
        flood: reports.filter(r => r.type === 'flood').length,
        drought: reports.filter(r => r.type === 'drought').length,
        pending: reports.filter(r => r.status === 'pending').length,
    };

    if (loading) {
        return (
            <div className="reports-map-page">
                <div className="loading">Loading map...</div>
            </div>
        );
    }

    return (
        <div className="reports-map-page">
            <div className="map-header">
                <div className="header-content">
                    <h1>Reports Map</h1>
                    <p>Norala, South Cotabato, Philippines</p>
                </div>
                <div className="map-stats">
                    <div className="stat-card">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Reports</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
            </div>
            <div className="map-filters">
                <button
                    className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('all')}
                >
                    All ({stats.total})
                </button>
                <button
                    className={filter === 'pest' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('pest')}
                >
                    🐛 Pest ({stats.pest})
                </button>
                <button
                    className={filter === 'flood' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('flood')}
                >
                    🌊 Flood ({stats.flood})
                </button>
                <button
                    className={filter === 'drought' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('drought')}
                >
                    ☀️ Drought ({stats.drought})
                </button>
            </div>
            <Map reports={filteredReports} />
        </div>
    );
};

export default ReportsMap;
