import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import { useAuth, API_URL } from '../context/AuthContext';
import { MOCK_DATA } from '../config/mockData';
import { MapPin, Bug, CloudRain, Sun, Clock, CheckCircle, Home, Crosshair } from 'lucide-react';
import { noralaBoundaryCoordinates } from '../config/noralaBoundary';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (iconSvg, bgColor) => {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${bgColor};
            width: 36px;
            height: 36px;
            border-radius: 12px;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        ">${iconSvg}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

const farmIcon = createIcon(`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>`, '#22c55e'); // Green with Home icon

const reportIcons = {
    pest: createIcon(`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="8" height="14" x="8" y="6" rx="4"></rect>
        <path d="m25 19-3-3"></path>
        <path d="m19 8 3-3"></path>
        <path d="m2 19 3-3"></path>
        <path d="m2 8 3-3"></path>
        <path d="m2 13 3 0"></path>
        <path d="m19 13 3 0"></path>
    </svg>
    `, '#ef4444'), // Red with Bug icon (simplified)

    flood: createIcon(`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
        <path d="M16 14v6"></path>
        <path d="M8 14v6"></path>
        <path d="M12 16v6"></path>
    </svg>
    `, '#3b82f6'), // Blue with CloudRain icon

    drought: createIcon(`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
    `, '#f59e0b'), // Orange with Sun icon

    default: createIcon(`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
    `, '#6b7280')
};

// Component to center map on user location
function LocationMarker({ farmLocation, setUserLocation }) {
    const map = useMap();
    const [position, setPosition] = useState(null);

    useEffect(() => {
        map.locate().on("locationfound", (e) => {
            setPosition(e.latlng);
            setUserLocation(e.latlng);
        });
    }, [map]);

    // If we have farm location, center on it
    useEffect(() => {
        if (farmLocation) {
            map.setView([farmLocation.lat, farmLocation.lng], 15);
        }
    }, [farmLocation, map]);

    return position ? (
        <Circle
            center={position}
            radius={50}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3 }}
        />
    ) : null;
}

export default function FarmerMapPage() {
    const { token, isMockMode, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [farmData, setFarmData] = useState(null);
    const [reports, setReports] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filter, setFilter] = useState('all');

    // Default center: Norala, South Cotabato
    const defaultCenter = [6.5294, 124.6647];

    useEffect(() => {
        const fetchData = async () => {
            if (isMockMode) {
                const username = user?.username || 'james';
                const data = MOCK_DATA.getFarmerDashboard(username);

                // Mock farm location
                setFarmData({
                    name: data.profile?.name || 'My Farm',
                    lat: 6.5294 + (Math.random() * 0.01 - 0.005),
                    lng: 124.6647 + (Math.random() * 0.01 - 0.005),
                    size: '2.5 hectares',
                    barangay: data.profile?.barangay || 'Poblacion'
                });

                // Mock reports with locations
                const mockReports = (data.history || []).map((r, idx) => ({
                    ...r,
                    latitude: 6.5294 + (Math.random() * 0.02 - 0.01),
                    longitude: 124.6647 + (Math.random() * 0.02 - 0.01)
                }));
                setReports(mockReports);
                setLoading(false);
                return;
            }

            try {
                // Fetch farmer's profile to get farm data
                const profileRes = await fetch(`${API_URL}/farmer/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    if (profile.farm_latitude && profile.farm_longitude) {
                        setFarmData({
                            name: 'My Farm',
                            lat: parseFloat(profile.farm_latitude),
                            lng: parseFloat(profile.farm_longitude),
                            size: profile.farm_size_hectares ? `${profile.farm_size_hectares} hectares` : 'Unknown',
                            barangay: profile.barangay || profile.farm_barangay
                        });
                    }
                }

                // Fetch farmer's reports with locations
                const reportsRes = await fetch(`${API_URL}/reports/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (reportsRes.ok) {
                    const reportsData = await reportsRes.json();
                    // Handle both array and object with reports property
                    const reportsArray = Array.isArray(reportsData) ? reportsData : (reportsData.reports || reportsData.history || []);
                    setReports(reportsArray.filter(r => r.latitude && r.longitude));
                }
            } catch (err) {
                console.error('Failed to fetch map data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, isMockMode, user]);

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700',
            verified: 'bg-blue-100 text-blue-700',
            resolved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });
    };

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.type === filter || r.report_type === filter);

    const mapCenter = farmData
        ? [farmData.lat, farmData.lng]
        : defaultCenter;

    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="My Farm Map" showBack />

            {/* Filter Tabs */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex gap-2 overflow-x-auto">
                {['all', 'pest', 'flood', 'drought'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === type
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {type === 'all' ? 'All Reports' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <MapContainer
                        center={mapCenter}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        {/* Norala Municipality Boundary */}
                        <Polygon
                            positions={noralaBoundaryCoordinates}
                            pathOptions={{
                                color: '#1B5E20',
                                weight: 6,
                                opacity: 1,
                                fillColor: '#4CAF50',
                                fillOpacity: 0.3
                            }}
                        />

                        <LocationMarker
                            farmLocation={farmData ? { lat: farmData.lat, lng: farmData.lng } : null}
                            setUserLocation={setUserLocation}
                        />

                        {/* Farm Location Marker */}
                        {farmData && (
                            <Marker
                                position={[farmData.lat, farmData.lng]}
                                icon={farmIcon}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <p className="font-bold text-primary">🏠 My Farm</p>
                                        <p className="text-xs text-gray-500">{farmData.barangay}</p>
                                        <p className="text-xs text-gray-500">{farmData.size}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Report Markers */}
                        {filteredReports.map((report) => (
                            <Marker
                                key={report.id}
                                position={[report.latitude, report.longitude]}
                                icon={reportIcons[report.type || report.report_type] || reportIcons.default}
                                eventHandlers={{
                                    click: () => setSelectedReport(report)
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[150px]">
                                        <p className="font-bold capitalize">{report.type || report.report_type} Report</p>
                                        <p className="text-xs text-gray-500">{formatDate(report.created_at)}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs capitalize ${getStatusBadge(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                {/* Legend */}
                <div className="absolute bottom-20 left-3 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                    <p className="text-xs font-bold text-gray-500 mb-2">LEGEND</p>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-green-500 text-white flex items-center justify-center">
                                <Home size={12} />
                            </div>
                            <span>My Farm</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-red-500 text-white flex items-center justify-center">
                                <Bug size={12} />
                            </div>
                            <span>Pest Report</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center">
                                <CloudRain size={12} />
                            </div>
                            <span>Flood Report</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-orange-500 text-white flex items-center justify-center">
                                <Sun size={12} />
                            </div>
                            <span>Drought Report</span>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="absolute top-3 right-3 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                    <p className="text-xs font-bold text-gray-500 mb-2">MY REPORTS</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-lg font-bold text-red-500">{reports.filter(r => (r.type || r.report_type) === 'pest').length}</p>
                            <p className="text-[10px] text-gray-400">Pest</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-blue-500">{reports.filter(r => (r.type || r.report_type) === 'flood').length}</p>
                            <p className="text-[10px] text-gray-400">Flood</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-orange-500">{reports.filter(r => (r.type || r.report_type) === 'drought').length}</p>
                            <p className="text-[10px] text-gray-400">Drought</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Report Detail Panel */}
            {selectedReport && (
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 z-[1001] animate-slide-up">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold capitalize flex items-center gap-2">
                                {(selectedReport.type || selectedReport.report_type) === 'pest' && <Bug size={18} className="text-red-500" />}
                                {(selectedReport.type || selectedReport.report_type) === 'flood' && <CloudRain size={18} className="text-blue-500" />}
                                {(selectedReport.type || selectedReport.report_type) === 'drought' && <Sun size={18} className="text-orange-500" />}
                                {selectedReport.type || selectedReport.report_type} Report
                            </h3>
                            <p className="text-xs text-gray-400">{formatDate(selectedReport.created_at)}</p>
                        </div>
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusBadge(selectedReport.status)}`}>
                            {selectedReport.status}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} />
                            {selectedReport.location || selectedReport.barangay || 'Unknown location'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
