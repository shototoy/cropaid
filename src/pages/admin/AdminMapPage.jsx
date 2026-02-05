import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Tooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth, API_URL } from '../../context/AuthContext';
import { MOCK_DATA } from '../../config/mockData';
import { MapPin, Bug, CloudRain, Sun, Home, Crosshair, X, Filter, ChevronRight } from 'lucide-react';
import { noralaBoundaryCoordinates } from '../../config/noralaBoundary';
import { barangayBoundaries } from '../../config/barangayBoundaries';
import ReportDetailModal from '../../components/ReportDetailModal';
import { API_BASE_URL } from '../../services/api';
import * as turf from '@turf/turf';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createReportIcon = (iconSvg, color, size = 40) => {
    const bgColor = color.replace('text-', '').replace('-500', '');
    const hexColor = {
        'red': '#ef4444',
        'blue': '#3b82f6',
        'orange': '#f97316',
        'green': '#22c55e',
        'gray': '#6b7280',
        'purple': '#a855f7',
        'yellow': '#eab308'
    }[bgColor] || '#3b82f6';

    const innerScale = size / 32; // Adjusted scaling for better visibility

    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="
            background-color: ${hexColor};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            opacity: 0.95;
            transform-origin: center;
        ">
            <div style="transform: scale(${innerScale}); display: flex; align-items: center; justify-content: center;">
                ${iconSvg}
            </div>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    });
};

const createFarmIcon = (iconSvg, color, size = 48) => {

    const hexColor = '#6b7280';
    const innerScale = size / 32;

    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="
            background-color: ${hexColor};
            width: ${size}px;
            height: ${size}px;
            border-radius: 12px;
            border: 3px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transform-origin: center;
        ">
             <div style="transform: scale(${innerScale}); display: flex; align-items: center; justify-content: center;">
                ${iconSvg}
            </div>
        </div>`,
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



const farmIcon = (zoom, color = 'gray') => {
    // Bigger farm icon calculation
    const calculatedSize = 32 + (zoom - 12) * 4;
    const size = Math.max(28, Math.min(56, calculatedSize));
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleStatusUpdate = async (id, newStatus) => {
        if (isMockMode) {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            setSelectedReport(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/reports/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            // Update local state
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (selectedReport && selectedReport.id === id) {
                setSelectedReport(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            alert('Error updating status: ' + err.message);
        }
    };

    const [filterMode, setFilterMode] = useState('type'); // 'type' | 'status'
    const [activeFilters, setActiveFilters] = useState({
        farm: true,
        pest: true,
        flood: true,
        drought: true,
        mix: true,
        pending: true,
        verified: true,
        resolved: true,
        rejected: true
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
            resolved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const reportIcons = (report, zoom, mode) => {
        // Slightly bigger report icon calculation
        const farmSizeRaw = 28 + (zoom - 12) * 4;
        const farmSize = Math.max(24, Math.min(48, farmSizeRaw));
        const size = farmSize; // Use same base size or slightly smaller? User said "slightly bigger report icon". 
        // Previously it was farmSize * 0.9. Now let's try equal or slightly smaller than the NEW big farm icon.
        // Let's make it 36-50 px range.


        const typeKey = (report.type || report.report_type)?.toLowerCase() || 'pest';

        if (mode === 'status') {
            const statusKey = report.status?.toLowerCase() || 'pending';
            let color = 'gray'; // Pending
            if (statusKey === 'verified') color = 'yellow'; // User requested Yellow for Verified
            if (statusKey === 'resolved') color = 'green';
            if (statusKey === 'rejected') color = 'red';

            // Use the type's icon but with status color
            let iconSvg = Icons.pest;
            if (typeKey.includes('flood')) iconSvg = Icons.flood;
            else if (typeKey.includes('drought')) iconSvg = Icons.drought;
            else if (typeKey.includes('mix')) iconSvg = Icons.mix;

            return createReportIcon(iconSvg, color, size);
        }

        // Type matching
        if (typeKey.includes('pest')) return createReportIcon(Icons.pest, 'red', size);
        if (typeKey.includes('flood')) return createReportIcon(Icons.flood, 'blue', size);
        if (typeKey.includes('drought')) return createReportIcon(Icons.drought, 'orange', size);
        if (typeKey.includes('mix')) return createReportIcon(Icons.mix, 'purple', size);

        return createReportIcon(Icons.pest, 'gray', size);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredReports = useMemo(() => {
        const processed = reports.map(r => {
            let lat = parseFloat(r.latitude);
            let lng = parseFloat(r.longitude);
            let locationResolved = false;

            // If invalid coordinates, try to resolve from location name
            if (isNaN(lat) || isNaN(lng) || !lat || !lng) {
                const locationName = r.location?.trim();
                if (locationName) {
                    let boundary = barangayBoundaries[locationName];
                    // Fuzzy match if direct lookup fails
                    if (!boundary) {
                        const key = Object.keys(barangayBoundaries).find(k => locationName.toLowerCase().includes(k.toLowerCase()));
                        if (key) boundary = barangayBoundaries[key];
                    }

                    if (boundary && boundary.center) {
                        lat = boundary.center[0];
                        lng = boundary.center[1];
                        locationResolved = true;
                    }
                }
            }
            return { ...r, latitude: lat, longitude: lng, _locationResolved: locationResolved };
        });

        const filtered = processed.filter(r => {
            if (!r.latitude || !r.longitude) return false;

            // Normalize type for filtering
            let rawType = r.type || r.report_type;
            if (!rawType) return false;
            rawType = rawType.toLowerCase();

            let typeKey = 'pest';
            if (rawType.includes('flood')) typeKey = 'flood';
            else if (rawType.includes('drought')) typeKey = 'drought';
            else if (rawType.includes('mix')) typeKey = 'mix';
            else if (rawType.includes('pest')) typeKey = 'pest';

            // Type Filter
            if (activeFilters[typeKey] === false) return false;

            // Status Filter
            if (filterMode === 'status') {
                const statusKey = r.status?.toLowerCase() || 'pending';
                if (activeFilters[statusKey] === false) return false;
            }

            return true;
        });

        console.log(`Reports processing: Total=${reports.length}, Filtered=${filtered.length}`);

        // Apply Jitter/Clustering for identical coordinates to avoid stacking
        const groupedByLoc = {};
        filtered.forEach(r => {
            const key = `${r.latitude.toFixed(6)},${r.longitude.toFixed(6)}`;
            if (!groupedByLoc[key]) groupedByLoc[key] = [];
            groupedByLoc[key].push(r);
        });

        const finalReports = [];
        Object.values(groupedByLoc).forEach(group => {
            if (group.length === 1) {
                finalReports.push(group[0]);
            } else {
                // Apply spiral/circle jitter
                const angleStep = (2 * Math.PI) / group.length;
                const radius = 0.00015; // Approx 15-20 meters
                group.forEach((r, index) => {
                    const angle = index * angleStep;
                    const jitteredLat = r.latitude + radius * Math.cos(angle);
                    const jitteredLng = r.longitude + radius * Math.sin(angle);
                    finalReports.push({ ...r, latitude: jitteredLat, longitude: jitteredLng, _originalLat: r.latitude, _originalLng: r.longitude });
                });
            }
        });

        return finalReports;
    }, [reports, activeFilters, filterMode]);

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

                        { }
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

                        { }
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

                        { }
                        {filteredReports.map((report) => (
                            <Marker
                                key={report.id}
                                position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
                                icon={reportIcons(report, zoom, filterMode)}
                                eventHandlers={{ click: () => setSelectedReport(report) }}
                            >
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                { }
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2 w-32 pointer-events-auto">
                        <div className="flex items-center justify-between px-1 mb-1">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Filters</span>
                            <button
                                onClick={() => setFilterMode(prev => prev === 'type' ? 'status' : 'type')}
                                className="text-[10px] text-primary font-bold hover:underline"
                            >
                                {filterMode === 'type' ? 'By Status' : 'By Type'}
                            </button>
                        </div>

                        <button onClick={() => toggleFilter('farm')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.farm ? 'bg-primary border-primary text-white' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.farm ? 'bg-white text-primary' : 'bg-gray-300 text-white'}`}><Home size={12} /></div>
                            <span className="text-[10px] font-bold">Farms</span>
                        </button>

                        <div className="w-full h-px bg-gray-100 my-0.5"></div>

                        {filterMode === 'type' ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <button onClick={() => toggleFilter('pending')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.pending ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.pending ? 'bg-gray-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-[10px] font-bold">Pending</span>
                                </button>
                                <button onClick={() => toggleFilter('verified')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.verified ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.verified ? 'bg-orange-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-[10px] font-bold">Verified</span>
                                </button>
                                <button onClick={() => toggleFilter('resolved')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.resolved ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.resolved ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-[10px] font-bold">Resolved</span>
                                </button>
                                <button onClick={() => toggleFilter('rejected')} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.rejected ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'}`}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.rejected ? 'bg-red-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-[10px] font-bold">Rejected</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Report Info Overlay */}
                {!isModalOpen && selectedReport && (
                    <div
                        className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 md:bottom-6 md:left-6 bg-white rounded-xl shadow-2xl p-4 z-[1100] animate-slide-up border border-gray-100 pointer-events-auto cursor-pointer hover:scale-[1.02] transition-transform group"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="absolute top-2 right-2 text-xs text-gray-400 group-hover:text-primary transition-colors flex items-center gap-1 font-medium">
                            <span>View Full Details</span>
                            <ChevronRight size={14} />
                        </div>
                        <div className="flex justify-between items-start mb-3 mt-4">
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
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedReport(null); setIsModalOpen(false); }}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 absolute top-2 right-2 hidden" // Hidden because whole card is clickable, or make it top-left? Or just rely on outside click/map click? 
                            // Actually, close button is good for UX. Let's position it better or rely on modal close.
                            // If whole card is clickable, X button should stop propagation.
                            >
                                <X size={18} />
                            </button>
                            {/* Re-add Close button positioned top-left or kept top-right but below 'View' text? 
                                Let's put Close button on top-left to avoid conflict with 'View Full Details' 
                             */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedReport(null); setIsModalOpen(false); }}
                                className="absolute top-2 left-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 z-10"
                            >
                                <X size={16} />
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
                {isModalOpen && selectedReport && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none">
                        {/* Modal container needs pointer-events-auto */}
                        <div className="pointer-events-auto w-full h-full">
                            <ReportDetailModal
                                report={{
                                    ...selectedReport,
                                    first_name: selectedReport.first_name || 'Unknown', // Ensure these fields exist match AdminReports expectations
                                    last_name: selectedReport.last_name || '',
                                    rsbsa_id: selectedReport.rsbsa_id || 'N/A', // Pass RSBSA ID
                                    details: selectedReport.details || (selectedReport.description ? { description: selectedReport.description } : {})
                                }}
                                onClose={() => setIsModalOpen(false)}
                                onStatusUpdate={handleStatusUpdate}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
