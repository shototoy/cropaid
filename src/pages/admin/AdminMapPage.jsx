import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Tooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth, API_URL } from '../../context/AuthContext';
import { MOCK_DATA } from '../../config/mockData';
import { MapPin, Bug, CloudRain, Sun, Home, Crosshair, X, Filter } from 'lucide-react';
import { noralaBoundaryCoordinates } from '../../config/noralaBoundary';
import { barangayBoundaries } from '../../config/barangayBoundaries';
import { API_BASE_URL } from '../../services/api';
import * as turf from '@turf/turf';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const createReportIcon = (iconSvg, color, size = 32) => {
    const bgColor = color.replace('text-', '').replace('-500', '');
    const hexColor = {
        'red': '#ef4444',
        'blue': '#3b82f6',
        'orange': '#f97316',
        'green': '#22c55e',
        'gray': '#6b7280',
        'purple': '#a855f7' // Added purple for Mix
    }[bgColor] || '#3b82f6';

    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="
            background-color: ${hexColor};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            opacity: 0.9;
            transform: scale(${size / 36}); 
            transform-origin: center;
        ">${iconSvg}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    });
};
const createFarmIcon = (iconSvg, color, size = 32) => {
    const hexColor = '#6b7280';

    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="
            background-color: ${hexColor};
            width: ${size}px;
            height: ${size}px;
            border-radius: 12px;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transform: scale(${size / 28});
            transform-origin: center;
        ">${iconSvg}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size]
    });
};
const Icons = {
    pest: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13a6 6 0 0 0-6-6"/><path d="M18 13a6 6 0 0 1 6-6"/><path d="M17.47 9c1.93-.2 3.53-1.9 3.53-1.9 3.53-4"/></svg>',
    flood: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 20v4"/><path d="M8 20v4"/><path d="M12 20v4"/></svg>',
    drought: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    mix: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', // Star/Mix icon
    farm: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
};

const reportIcons = (type, zoom) => {
    const farmSizeRaw = 22 + (zoom - 12) * 3;
    const farmSize = Math.max(18, Math.min(40, farmSizeRaw));
    const size = farmSize * 0.9;

    const typeKey = type?.toLowerCase();

    if (typeKey === 'pest') return createReportIcon(Icons.pest, 'red', size);
    if (typeKey === 'flood') return createReportIcon(Icons.flood, 'blue', size);
    if (typeKey === 'drought') return createReportIcon(Icons.drought, 'orange', size);
    if (typeKey === 'mix') return createReportIcon(Icons.mix, 'purple', size);
    return createReportIcon(Icons.pest, 'gray', size);
};

const farmIcon = (zoom, color = 'gray') => {
    const calculatedSize = 22 + (zoom - 12) * 3;
    const size = Math.max(18, Math.min(40, calculatedSize));
    return createFarmIcon(Icons.farm, color, size);
};

function MapController({ setZoom }) {
    useMapEvents({
        zoomend(e) {
            setZoom(e.target.getZoom());
        }
    });
    return null;
}

export default function AdminMapPage() {
    const { token, isMockMode } = useAuth();
    const defaultCenter = [6.5206, 124.6623];
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        farm: true,
        pest: true,
        flood: true,
        drought: true,
        mix: true
    });

    const [reports, setReports] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(11);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isMockMode) {
                    setReports(MOCK_DATA.reports);
                } else {
                    try {
                        const reportRes = await fetch(`${API_BASE_URL}/public/reports`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (reportRes.ok) {
                            const reportData = await reportRes.json();
                            setReports(reportData);
                        }
                    } catch (e) { console.error("Error fetching reports", e); }
                    try {
                        const farmsRes = await fetch(`${API_BASE_URL}/public/farms`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (farmsRes.ok) {
                            const farmsData = await farmsRes.json();
                            setFarms(farmsData);
                        }
                    } catch (e) { console.error("Error fetching community farms", e); }
                }
            } catch (error) {
                console.error("Data load error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, isMockMode]);

    const toggleFilter = (type) => {
        setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700',
            verified: 'bg-blue-100 text-blue-700',
            resolved: 'bg-primary text-white',
            rejected: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            if (!r.latitude || !r.longitude) return false;
            const rawType = r.type || r.report_type;
            if (!rawType) return false;
            const type = rawType.trim().toLowerCase();
            if (!activeFilters[type]) return false;
            return true;
        });
    }, [reports, activeFilters]);

    return (
        <div className="flex flex-col h-full bg-white relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <MapContainer
                        center={defaultCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        preferCanvas={true}
                        maxBounds={[[6.43, 124.58], [6.62, 124.75]]}
                        maxBoundsViscosity={1.0}
                        minZoom={12}
                        maxZoom={18}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {}
                        <Polygon
                            positions={noralaBoundaryCoordinates}
                            pathOptions={{ color: '#15803d', weight: 5, fill: false }}
                        />
                        {Object.entries(barangayBoundaries).map(([name, data]) => (
                            <Polygon
                                key={name}
                                positions={data.coordinates}
                                pathOptions={{ color: 'white', weight: 3, fillColor: data.color, fillOpacity: 0.05 }}
                            >
                                <Tooltip sticky direction="center" className="bg-transparent border-0 font-bold text-xs shadow-none text-gray-700">
                                    {name}
                                </Tooltip>
                            </Polygon>
                        ))}

                        <MapController setZoom={setZoom} />

                        {}
                        {activeFilters.farm && farms.map(farm => (
                            <Marker
                                key={farm.id}
                                position={[farm.lat, farm.lng]}
                                icon={farmIcon(zoom)}
                                opacity={0.8}
                            >
                                <Popup>
                                    <div className="text-center p-1">
                                        <div className="font-bold text-sm">{farm.owner}'s Farm</div>
                                        <div className="text-xs text-gray-500">{farm.barangay}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {}
                        {filteredReports.map((report) => (
                            <Marker
                                key={report.id}
                                position={[report.latitude, report.longitude]}
                                icon={reportIcons(report.type || report.report_type, zoom)}
                                eventHandlers={{ click: () => setSelectedReport(report) }}
                            >
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                {}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2 w-32">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Filters</span>

                        <button onClick={() => toggleFilter('farm')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.farm ? 'bg-primary border-primary text-white' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.farm ? 'bg-white text-primary' : 'bg-gray-300 text-white'}`}><Home size={12} /></div>
                            <span className="text-[10px] font-bold">Farms</span>
                        </button>
                        <button onClick={() => toggleFilter('pest')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.pest ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.pest ? 'bg-red-500 text-white' : 'bg-gray-300 text-white'}`}><Bug size={12} /></div>
                            <span className="text-[10px] font-bold">Pest</span>
                        </button>
                        <button onClick={() => toggleFilter('flood')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.flood ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.flood ? 'bg-blue-500 text-white' : 'bg-gray-300 text-white'}`}><CloudRain size={12} /></div>
                            <span className="text-[10px] font-bold">Flood</span>
                        </button>
                        <button onClick={() => toggleFilter('drought')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.drought ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.drought ? 'bg-orange-500 text-white' : 'bg-gray-300 text-white'}`}><Sun size={12} /></div>
                            <span className="text-[10px] font-bold">Drought</span>
                        </button>
                        <button onClick={() => toggleFilter('mix')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.mix ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.mix ? 'bg-purple-500 text-white' : 'bg-gray-300 text-white'}`}>
                                <div dangerouslySetInnerHTML={{ __html: Icons.mix.replace('width="24"', 'width="12"').replace('height="24"', 'height="12"') }} style={{ display: 'flex' }} />
                            </div>
                            <span className="text-[10px] font-bold">Mixed</span>
                        </button>
                    </div>
                </div>

                {}
                {selectedReport && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-auto md:w-80 md:bottom-6 md:right-6 bg-white rounded-xl shadow-2xl p-4 z-[1100] animate-slide-up border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl text-white shadow-sm ${(selectedReport.type || selectedReport.report_type) === 'pest' ? 'bg-red-500' :
                                    (selectedReport.type || selectedReport.report_type) === 'flood' ? 'bg-blue-500' :
                                        (selectedReport.type || selectedReport.report_type) === 'mix' ? 'bg-purple-500' :
                                            'bg-orange-500'
                                    }`}>
                                    {(selectedReport.type || selectedReport.report_type) === 'pest' ? <Bug size={20} /> :
                                        (selectedReport.type || selectedReport.report_type) === 'flood' ? <CloudRain size={20} /> :
                                            (selectedReport.type || selectedReport.report_type) === 'mix' ? <div dangerouslySetInnerHTML={{ __html: Icons.mix }} style={{ width: 20, height: 20, display: 'flex' }} /> :
                                                <Sun size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 capitalize text-sm">{selectedReport.type || selectedReport.report_type} Alert</h3>
                                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <MapPin size={10} /> {selectedReport.location}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-2 mb-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(selectedReport.status)}`}>
                                {selectedReport.status}
                            </span>
                            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 border border-gray-100 italic">
                                "{selectedReport.details ? (typeof selectedReport.details === 'string' ? JSON.parse(selectedReport.details).description : selectedReport.details.description) : 'No description provided.'}"
                            </div>
                        </div>

                        {selectedReport.photo_base64 && (
                            <div className="rounded-lg overflow-hidden h-32 border border-gray-200 mb-2">
                                <img src={selectedReport.photo_base64} alt="Report" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="text-[10px] text-gray-400 text-right">
                            {formatDate(selectedReport.created_at)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
