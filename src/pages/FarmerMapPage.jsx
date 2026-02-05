import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Tooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { MOCK_DATA } from '../config/mockData';
import { MapPin, Bug, CloudRain, Sun, Home, Crosshair, Edit2, Save, X } from 'lucide-react';
import { noralaBoundaryCoordinates } from '../config/noralaBoundary';
import { barangayBoundaries } from '../config/barangayBoundaries';
import { API_BASE_URL } from '../services/api';
import * as turf from '@turf/turf';

// Icons SVG strings
const Icons = {
    pest: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13a6 6 0 0 0-6-6"/><path d="M18 13a6 6 0 0 1 6-6"/><path d="M17.47 9c1.93-.2 3.53-1.9 3.53-1.9 3.53-4"/></svg>',
    flood: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 20v4"/><path d="M8 20v4"/><path d="M12 20v4"/></svg>',
    drought: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    mix: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    farm: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
};

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
        'purple': '#a855f7',
        'gray': '#6b7280'
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
        iconAnchor: [size / 2, size / 2], // Center anchor for circular
        popupAnchor: [0, -size / 2]
    });
};

const createFarmIcon = (iconSvg, color, size = 32) => {
    const bgColor = color.replace('text-', '').replace('-500', '');
    const hexColor = {
        'red': '#ef4444',
        'blue': '#3b82f6',
        'orange': '#f97316',
        'green': '#22c55e',
        'gray': '#6b7280'
    }[bgColor] || '#3b82f6';

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
        iconAnchor: [size / 2, size], // Bottom anchor
        popupAnchor: [0, -size]
    });
};


// Icons definition moved to top to be available for reportIcons


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

const farmIcon = (zoom, color = 'green') => {

    const calculatedSize = 22 + (zoom - 12) * 3;
    const size = Math.max(18, Math.min(40, calculatedSize));
    return createFarmIcon(Icons.farm, color, size);
};

const deleteFarmIcon = () => {
    return L.divIcon({
        className: 'delete-badge',
        html: `<div style="background:#ef4444; color:white; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3); font-size:12px; line-height:1;">×</div>`,
        iconSize: [18, 18],
        iconAnchor: [-10, 10], // Offset to upper right relative to center of a 32px icon roughly
        popupAnchor: [0, 0]
    });
};

function MapController({ isEditing, onLocationSelect, setZoom }) {
    useMapEvents({
        click(e) {
            if (isEditing && onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
        zoomend(e) {
            setZoom(e.target.getZoom());
        }
    });
    return null;
}

const LocationMarker = ({ farmLocation, setUserLocation }) => {
    const map = useMapEvents({
        locationfound(e) {
            setUserLocation(e.latlng);

        },
    });

    useEffect(() => {
        map.locate();
    }, [map]);

    useEffect(() => {
        if (farmLocation) {
            map.flyTo([farmLocation.lat, farmLocation.lng], 16);
        }
    }, [farmLocation, map]);

    return null;
};



export default function FarmerMapPage() {
    const { user, token, isMockMode } = useAuth();

    const defaultCenter = [6.5206, 124.6623];

    const [userLocation, setUserLocation] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        farm: true,
        pest: true,
        flood: true,
        drought: true,
        mix: true
    });
    const [viewMode, setViewMode] = useState('all');

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedFarm, setEditedFarm] = useState({
        lat: null,
        lng: null,
        barangay: '',
        size: ''
    });

    const [reports, setReports] = useState([]);
    const [myFarms, setMyFarms] = useState([]); // Array of my farms
    const [otherFarms, setOtherFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(11);
    const [cropOptions, setCropOptions] = useState([]);
    const [isCustomCrop, setIsCustomCrop] = useState(false);

    const [editingId, setEditingId] = useState(null); // null = not editing, 'new' = adding, number = editing specific id

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isMockMode) {
                    setReports(MOCK_DATA.reports);
                    setMyFarms([{
                        id: 'mock-farm-1',
                        lat: 6.5206,
                        lng: 124.6623,
                        barangay: 'Poblacion',
                        size: 2.5,
                        current_crop: 'Rice',
                        planting_method: 'Transplanting'
                    }]);
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

                    if (user?.id) {
                        try {

                            const farmsRes = await fetch(`${API_BASE_URL}/farmer/farms`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (farmsRes.ok) {
                                const farms = await farmsRes.json();
                                setMyFarms(farms);
                            }
                        } catch (e) { console.error("Error fetching farms", e); }

                        try {
                            const farmsRes = await fetch(`${API_BASE_URL}/public/farms`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (farmsRes.ok) {
                                const farmsData = await farmsRes.json();

                                setOtherFarms(farmsData.filter(f => f.owner !== user.name));
                            }
                        } catch (e) { console.error("Error fetching community farms", e); }
                    }
                }
            } catch (error) {
                console.error("Data load error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, isMockMode]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`${API_BASE_URL}/options`, { headers }); // Assuming API_BASE_URL matches API_URL
                if (response.ok) {
                    const data = await response.json();
                    setCropOptions(data.crops || []);
                }
            } catch (e) { console.error("Error fetching options", e); }
        };
        fetchOptions();
    }, [token]);

    useEffect(() => {
        if (editingId && editingId !== 'new') {
            const farmToEdit = myFarms.find(f => f.id === editingId);
            if (farmToEdit) {
                setEditedFarm({
                    lat: farmToEdit.lat,
                    lng: farmToEdit.lng,
                    barangay: farmToEdit.barangay || '',
                    size: farmToEdit.size || '',
                    current_crop: farmToEdit.current_crop || ''
                });
                setIsCustomCrop(false);




            }
        } else if (editingId === 'new') {

            setEditedFarm({
                lat: defaultCenter[0],
                lng: defaultCenter[1],
                barangay: '',
                size: '',
                current_crop: ''
            });
            setIsCustomCrop(false);
        }
    }, [editingId, myFarms]);

    const handleSaveFarm = async () => {
        setSaving(true);
        try {
            if (editingId === 'new') {

                const res = await fetch(`${API_BASE_URL}/farmer/farm`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(editedFarm)
                });
                if (res.ok) {
                    const newFarm = await res.json();
                    setMyFarms([...myFarms, newFarm]);
                    setEditingId(null); // Go back to list or close? Close manager for now.
                    setIsEditing(false);
                }
            } else {

                const res = await fetch(`${API_BASE_URL}/farmer/farm/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(editedFarm)
                });
                if (res.ok) {
                    setMyFarms(myFarms.map(f => f.id === editingId ? { ...f, ...editedFarm } : f));
                    setEditingId(null);
                    setIsEditing(false);
                }
            }
        } catch (e) { console.error("Error saving farm", e); }
        setSaving(false);
    };

    const handleDeleteFarm = async (id) => {
        if (!confirm("Are you sure you want to delete this farm?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/farmer/farm/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMyFarms(myFarms.filter(f => f.id !== id));
            }
        } catch (e) { console.error("Error deleting farm", e); }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setIsEditing(false);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    handleLocationSelect(latitude, longitude);
                },
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
        }
    };

    const toggleFilter = (type) => {
        setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const identifyBarangay = (lat, lng) => {
        const point = turf.point([lng, lat]);

        for (const [name, data] of Object.entries(barangayBoundaries)) {
            const polyCoords = [data.coordinates.map(c => [c[1], c[0]])];
            const poly = turf.polygon(polyCoords);

            if (turf.booleanPointInPolygon(point, poly)) {
                return name;
            }
        }
        return '';
    };

    const handleLocationSelect = (lat, lng) => {
        const detectedBarangay = identifyBarangay(lat, lng);
        setEditedFarm(prev => ({
            ...prev,
            lat,
            lng,
            barangay: detectedBarangay || prev.barangay
        }));
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredReports = useMemo(() => {
        return reports.map(r => {
            // Create a seeded random offset based on report ID to keep it consistent but randomized
            const seed = r.id ? r.id.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
            const offsetLat = (Math.sin(seed) * 0.00015); // increased spread
            const offsetLng = (Math.cos(seed) * 0.00015);

            return {
                ...r,
                displayLayout: {
                    lat: (r.latitude || 0) + offsetLat,
                    lng: (r.longitude || 0) + offsetLng
                }
            };
        }).filter(r => {

            if (r.latitude === null || r.latitude === undefined || r.longitude === null || r.longitude === undefined) return false;

            const rawType = r.type || r.report_type;
            if (!rawType) return false;

            const type = rawType.trim().toLowerCase();

            if (!activeFilters[type]) return false;

            if (viewMode === 'personal') {
                if (isMockMode) return r.user_id === 'my-id';
                return user?.id && r.user_id === user.id;
            }

            return true;
        });
    }, [reports, activeFilters, viewMode, user, isMockMode]);

    const mapCenter = (editingId && editedFarm.lat)
        ? [editedFarm.lat, editedFarm.lng]
        : (myFarms.length > 0 ? [myFarms[0].lat, myFarms[0].lng] : defaultCenter);

    return (
        <div className="flex flex-col h-[100dvh] bg-white relative">
            <Header title={viewMode === 'personal' ? "Personal Map" : "Community Map"} showBack />

            <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between gap-3 shadow-sm z-[1000]">
                <div className="bg-gray-100 p-1 rounded-lg flex w-full max-w-[200px]">
                    <button
                        onClick={() => setViewMode('all')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'all' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Community
                    </button>
                    <button
                        onClick={() => setViewMode('personal')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'personal' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Personal
                    </button>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-primary text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <Edit2 size={14} />
                        Manage Farms
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="absolute top-16 left-0 right-0 z-[1000] bg-white shadow-md p-3 animate-slide-down border-b border-gray-100 max-h-[60vh] overflow-y-auto">
                    {!editingId ? (

                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-gray-800">Manage Farms</h3>
                                    <p className="text-[10px] text-gray-500">Tap a farm on the map to edit or delete.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-100 text-gray-600 font-bold py-2 px-4 rounded-lg text-xs"
                                    >
                                        Done
                                    </button>
                                    <button
                                        onClick={() => setEditingId('new')}
                                        className="bg-primary text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 font-bold shadow-sm"
                                    >
                                        + Add New
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                {myFarms.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        No farms added yet.
                                    </div>
                                ) : (
                                    myFarms.map(farm => (
                                        <div
                                            key={farm.id}
                                            onClick={() => setEditingId(farm.id)}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 active:scale-[0.99] transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(!farm.lat || !farm.lng) ? 'bg-amber-100 text-amber-600' : 'bg-primary text-white'}`}>
                                                    {(!farm.lat || !farm.lng) ? <MapPin size={16} className="opacity-50" /> : <MapPin size={16} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm">{farm.location_barangay || farm.barangay || 'Unknown Location'}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {farm.current_crop || 'No Crop'} • {farm.farm_size_hectares || farm.size || '?'} ha
                                                        {(!farm.lat || !farm.lng) && <span className="text-amber-600 font-bold ml-1">(No Location)</span>}
                                                    </span>
                                                </div>
                                            </div>
                                            <Edit2 size={14} className="text-gray-400" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Edit2 size={16} className="text-primary" />
                                    {editingId === 'new' ? 'New Farm' : 'Edit Farm'}
                                </h3>
                                <button onClick={getCurrentLocation} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1 font-medium transition-colors">
                                    <Crosshair size={14} />
                                    Get Location
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 p-1">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex flex-col gap-2">


                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Latitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={editedFarm.lat || ''}
                                                onChange={(e) => handleLocationSelect(parseFloat(e.target.value), editedFarm.lng)}
                                                className="w-full text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-primary"
                                                placeholder="0.0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Longitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={editedFarm.lng || ''}
                                                onChange={(e) => handleLocationSelect(editedFarm.lat, parseFloat(e.target.value))}
                                                className="w-full text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-primary"
                                                placeholder="0.0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 border-t border-gray-200 pt-2 mt-1">
                                        <div>
                                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Size</label>
                                            <div className="font-bold text-gray-700 text-sm">
                                                {editedFarm.size ? `${editedFarm.size} ha` : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Crop</label>
                                            <div className="font-bold text-gray-700 text-sm">
                                                {editedFarm.current_crop || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2 px-1">
                                    <div className="text-[10px] text-gray-500 italic flex items-center gap-1">
                                        <Crosshair size={10} />
                                        Tap map to pin location
                                    </div>
                                    <button
                                        onClick={() => window.location.href = `/my-farms?edit=${editingId}`}
                                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                                    >
                                        Edit Full Details <Edit2 size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-2 mt-2">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-200 text-xs transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSaveFarm}
                                    disabled={saving || !editedFarm.lat}
                                    className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 text-xs transition-colors disabled:opacity-70"
                                >
                                    {saving ? 'Saving...' : <><Save size={14} /> Update Location</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}


            <div className="flex-1 relative overflow-hidden">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
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
                            pathOptions={{
                                color: '#15803d',
                                weight: 5, // Thicker outer boundary
                                opacity: 0.8,
                                fill: false
                            }}
                        />

                        { }
                        {Object.entries(barangayBoundaries).map(([name, data]) => (
                            <Polygon
                                key={name}
                                positions={data.coordinates}
                                pathOptions={{
                                    color: 'white',
                                    weight: 3, // Thicker inter-barangay borders
                                    opacity: 0.8,
                                    fillColor: data.color,
                                    fillOpacity: 0.05 // Lighter fill
                                }}
                            >
                                <Tooltip sticky direction="center" className="bg-transparent border-0 font-bold text-xs shadow-none text-gray-700">
                                    {name}
                                </Tooltip>
                            </Polygon>
                        ))}

                        {!isEditing && (
                            <LocationMarker
                                farmLocation={null}
                                setUserLocation={setUserLocation}
                            />
                        )}

                        { }
                        {viewMode === 'all' && activeFilters.farm && otherFarms.map(farm => (
                            <Marker
                                key={farm.id}
                                position={[farm.lat, farm.lng]}
                                icon={farmIcon(zoom, 'gray')}
                                opacity={0.7}
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
                        {(editingId && editedFarm.lat) ? (
                            <Marker position={[editedFarm.lat, editedFarm.lng]} icon={farmIcon(zoom, 'green')}>
                                <Popup>New Location</Popup>
                            </Marker>
                        ) : null}

                        { }
                        {!editingId && activeFilters.farm && myFarms.map(farm => {

                            if (!farm.lat || !farm.lng) return null;

                            return (
                                <React.Fragment key={farm.id}>
                                    <Marker
                                        position={[farm.lat, farm.lng]}
                                        icon={farmIcon(zoom, 'green')}
                                        eventHandlers={{
                                            click: () => {
                                                if (isEditing) {
                                                    setEditingId(farm.id); // Only edit if manager is already open
                                                }

                                            }
                                        }}
                                    >
                                        { }
                                        {!isEditing && (
                                            <Popup>
                                                <div className="text-center p-1">
                                                    <p className="font-bold text-primary">🏠 My Farm</p>
                                                    <p className="text-xs text-gray-800 font-bold">{farm.current_crop || 'No Crop'}</p>
                                                    <p className="text-xs text-gray-500">{farm.barangay} • {farm.size} ha</p>
                                                    {farm.planting_method && <p className="text-[10px] text-gray-400 italic">{farm.planting_method}</p>}
                                                </div>
                                            </Popup>
                                        )}
                                    </Marker>

                                    { }
                                    {isEditing && (
                                        <Marker
                                            position={[farm.lat, farm.lng]}
                                            icon={deleteFarmIcon()}
                                            zIndexOffset={1000}
                                            eventHandlers={{
                                                click: (e) => {
                                                    L.DomEvent.stopPropagation(e); // Prevent map click
                                                    handleDeleteFarm(farm.id);
                                                }
                                            }}
                                        >
                                        </Marker>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        <MapController
                            isEditing={!!editingId}
                            onLocationSelect={handleLocationSelect}
                            setZoom={setZoom}
                        />

                        { }
                        {!isEditing && filteredReports.map((report) => (
                            <Marker
                                key={report.id}
                                position={[report.displayLayout.lat, report.displayLayout.lng]}
                                icon={reportIcons(report.type || report.report_type, zoom)}
                                eventHandlers={{ click: () => setSelectedReport(report) }}
                            >
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {
                !isEditing && (
                    <div className="absolute bottom-6 left-4 z-[1000] flex flex-col gap-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2 pb-4 flex flex-col gap-2 w-32">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Filters</span>

                            <button
                                onClick={() => toggleFilter('farm')}
                                className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.farm
                                    ? 'bg-primary border-primary text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.farm ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                                    <Home size={12} />
                                </div>
                                <span className="text-[10px] font-bold">Farms</span>
                            </button>

                            <button
                                onClick={() => toggleFilter('pest')}
                                className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.pest
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.pest ? 'bg-red-500 text-white' : 'bg-gray-300 text-white'}`}>
                                    <Bug size={12} />
                                </div>
                                <span className="text-[10px] font-bold">Pest</span>
                            </button>

                            <button
                                onClick={() => toggleFilter('flood')}
                                className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.flood
                                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                                    : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.flood ? 'bg-blue-500 text-white' : 'bg-gray-300 text-white'}`}>
                                    <CloudRain size={12} />
                                </div>
                                <span className="text-[10px] font-bold">Flood</span>
                            </button>

                            <button
                                onClick={() => toggleFilter('drought')}
                                className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.drought
                                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                                    : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.drought ? 'bg-orange-500 text-white' : 'bg-gray-300 text-white'}`}>
                                    <Sun size={12} />
                                </div>
                                <span className="text-[10px] font-bold">Drought</span>
                            </button>

                            <button
                                onClick={() => toggleFilter('mix')}
                                className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${activeFilters.mix
                                    ? 'bg-purple-50 border-purple-200 text-purple-800'
                                    : 'bg-gray-50 border-gray-300 text-gray-400 grayscale'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFilters.mix ? 'bg-purple-500 text-white' : 'bg-gray-300 text-white'}`}>
                                    <div dangerouslySetInnerHTML={{ __html: Icons.mix.replace('width="24"', 'width="12"').replace('height="24"', 'height="12"') }} style={{ display: 'flex' }} />
                                </div>
                                <span className="text-[10px] font-bold">Mixed</span>
                            </button>
                        </div>


                    </div>
                )
            }

            {
                selectedReport && !isEditing && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-5 z-[1100] animate-slide-up border-t border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl text-white shadow-sm ${(selectedReport.type || selectedReport.report_type) === 'pest' ? 'bg-red-500' :
                                    (selectedReport.type || selectedReport.report_type) === 'flood' ? 'bg-blue-500' :
                                        (selectedReport.type || selectedReport.report_type) === 'mix' ? 'bg-purple-500' :
                                            'bg-orange-500'
                                    }`}>
                                    {(selectedReport.type || selectedReport.report_type) === 'pest' ? <Bug size={24} /> :
                                        (selectedReport.type || selectedReport.report_type) === 'flood' ? <CloudRain size={24} /> :
                                            (selectedReport.type || selectedReport.report_type) === 'mix' ? <div dangerouslySetInnerHTML={{ __html: Icons.mix }} style={{ width: 24, height: 24, display: 'flex' }} /> :
                                                <Sun size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 capitalize">{selectedReport.type || selectedReport.report_type} Alert</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} /> {selectedReport.location} • {formatDate(selectedReport.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                                    <X size={20} />
                                </button>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(selectedReport.status)}`}>
                                    {selectedReport.status}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl mb-4 text-sm text-gray-600 border border-gray-100 italic">
                            "{selectedReport.details ? (typeof selectedReport.details === 'string' ? JSON.parse(selectedReport.details).description : selectedReport.details.description) : 'No description provided.'}"
                        </div>

                        {selectedReport.photo_base64 && (
                            <div className="mb-4 rounded-xl overflow-hidden h-40 border border-gray-200">
                                <img src={selectedReport.photo_base64} alt="Report" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {(isMockMode ? selectedReport.user_id === 'my-id' : user?.id && selectedReport.user_id === user.id) && (
                            <div className="w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-lg text-xs text-center border border-blue-100">
                                This is your report
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
}
