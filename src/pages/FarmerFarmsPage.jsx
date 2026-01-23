import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { barangayBoundaries } from '../config/barangayBoundaries';
import { ArrowLeft, Save, Plus, MapPin, Calendar, Sprout, Tractor, ShieldCheck, Ruler, Trash2, X } from 'lucide-react';

const INITIAL_FARM_DATA = {
    location_barangay: '', location_sitio: '', latitude: '', longitude: '', farm_size_hectares: '',
    planting_method: '', current_crop: '', date_of_sowing: '', date_of_transplanting: '', date_of_harvest: '',
    land_category: '', topography: '', soil_type: '', irrigation_source: '', tenural_status: '',
    boundary_north: '', boundary_south: '', boundary_east: '', boundary_west: '',
    cover_type: '', amount_cover: '', insurance_premium: '', cltip_sum_insured: '', cltip_premium: ''
};

export default function FarmerFarmsPage() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingFarm, setEditingFarm] = useState(null); // null = list view, object = edit/create mode
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({});
    const [cropOptions, setCropOptions] = useState([]);

    // Handle deep linking from Map page
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId === 'new') {
            setEditingFarm(INITIAL_FARM_DATA); // Open create mode
        } else if (editId && farms.length > 0) {
            const farmToEdit = farms.find(f => f.id.toString() === editId);
            if (farmToEdit) {
                setEditingFarm(farmToEdit);
            }
        }
    }, [searchParams, farms]);

    // Fetch user's farms
    const fetchFarms = async () => {
        try {
            const response = await fetch(`${API_URL}/farmer/farms`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFarms(data);
            }
        } catch (error) {
            console.error("Failed to load farms", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchFarms();
    }, [token]);

    useEffect(() => {
        const fetchCropTypes = async () => {
            try {
                const response = await fetch(`${API_URL}/options`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCropOptions(data.crops || []);
                }
            } catch (error) {
                console.error("Failed to load crop types", error);
            }
        };
        if (token) fetchCropTypes();
    }, [token]);

    // Initialize form data when entering edit mode
    useEffect(() => {
        if (editingFarm) {
            setFormData({
                ...INITIAL_FARM_DATA,
                ...editingFarm
            });
        }
    }, [editingFarm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const isNew = !formData.id;
            const url = isNew ? `${API_URL}/farmer/farm` : `${API_URL}/farmer/farm/${formData.id}`;
            const method = isNew ? 'POST' : 'PUT';

            // Ensure we send values instead of undefined
            const payload = Object.fromEntries(
                Object.entries(formData).map(([key, value]) => [
                    key,
                    value === '' || value === undefined ? null : value
                ])
            );

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || errorData.message || 'Failed to save farm');
            }

            // Refresh list and close editor
            await fetchFarms();
            setEditingFarm(null);
            alert(isNew ? 'Farm added successfully!' : 'Farm updated successfully!');
        } catch (error) {
            console.error(error);
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this farm? This action cannot be undone.')) return;

        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/farmer/farm/${formData.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete farm');

            await fetchFarms();
            setEditingFarm(null);
            alert('Farm deleted successfully.');
        } catch (error) {
            console.error(error);
            alert('Failed to delete farm.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

    // --- FORM VIEW ---
    if (editingFarm) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setEditingFarm(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">{formData.id ? 'Edit Farm' : 'Add New Farm'}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {formData.id && (
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md ${saving ? 'opacity-70' : ''}`}
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6 max-w-lg mx-auto">
                    {/* 1. Basic Location & Size */}
                    <Section title="Location & Size" icon={<MapPin size={18} />}>
                        <div className="grid grid-cols-2 gap-3">
                            <Select
                                name="location_barangay"
                                label="Barangay"
                                options={Object.keys(barangayBoundaries).sort()}
                                value={formData.location_barangay}
                                onChange={handleInputChange}
                            />
                            <Input name="location_sitio" label="Sitio" value={formData.location_sitio} onChange={handleInputChange} />
                            <div className="col-span-2 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input name="latitude" label="Latitude" value={formData.latitude} onChange={handleInputChange} />
                                    <Input name="longitude" label="Longitude" value={formData.longitude} onChange={handleInputChange} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                pos => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        latitude: pos.coords.latitude,
                                                        longitude: pos.coords.longitude
                                                    }));
                                                },
                                                err => alert("Could not fetch location: " + err.message)
                                            );
                                        } else {
                                            alert("Geolocation is not supported by this browser.");
                                        }
                                    }}
                                    className="w-full py-2.5 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                                >
                                    <MapPin size={16} />
                                    Use Current Location
                                </button>
                                <p className="text-[10px] text-gray-500 italic bg-blue-50 p-2 rounded border border-blue-100">
                                    <strong>Note:</strong> You can leave these blank and set the precise location later using the "Farm Map" page.
                                </p>
                            </div>
                            <div className="col-span-2">
                                <Input name="farm_size_hectares" label="Farm Size (ha)" type="number" value={formData.farm_size_hectares} onChange={handleInputChange} />
                            </div>
                        </div>
                    </Section>

                    {/* 2. Boundaries */}
                    <Section title="Boundaries (Adjacent)" icon={<Ruler size={18} />}>
                        <div className="space-y-3">
                            <Input name="boundary_north" label="North" placeholder="e.g. Desamero Land" value={formData.boundary_north} onChange={handleInputChange} />
                            <Input name="boundary_south" label="South" placeholder="e.g. River" value={formData.boundary_south} onChange={handleInputChange} />
                            <Input name="boundary_east" label="East" placeholder="e.g. Highway" value={formData.boundary_east} onChange={handleInputChange} />
                            <Input name="boundary_west" label="West" placeholder="e.g. Irrigation Canal" value={formData.boundary_west} onChange={handleInputChange} />
                        </div>
                    </Section>

                    {/* 3. Planting Details */}
                    <Section title="Planting Details" icon={<Sprout size={18} />}>
                        <div className="grid grid-cols-2 gap-3">
                            <Select name="planting_method" label="Planting Method" options={['Direct Seeding', 'Transplanting']} value={formData.planting_method} onChange={handleInputChange} />

                            {/* Current Crop Dropdown */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Current Crop</label>
                                <select
                                    name="current_crop"
                                    className="w-full bg-white p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[38px]"
                                    value={formData.current_crop}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Crop</option>
                                    {cropOptions.map(crop => (
                                        <option key={crop} value={crop}>{crop}</option>
                                    ))}
                                </select>
                            </div>

                            <Input name="date_of_sowing" label="Date of Sowing" type="date" value={formData.date_of_sowing ? formData.date_of_sowing.split('T')[0] : ''} onChange={handleInputChange} />
                            {formData.planting_method === 'Transplanting' && (
                                <Input name="date_of_transplanting" label="Date Transplanting" type="date" value={formData.date_of_transplanting ? formData.date_of_transplanting.split('T')[0] : ''} onChange={handleInputChange} />
                            )}
                            <Input name="date_of_harvest" label="Date of Harvest (Est)" type="date" value={formData.date_of_harvest ? formData.date_of_harvest.split('T')[0] : ''} onChange={handleInputChange} />
                        </div>
                    </Section>

                    {/* 4. Land & Irrigation */}
                    <Section title="Land & Irrigation" icon={<Tractor size={18} />}>
                        <div className="grid grid-cols-2 gap-3">
                            <Select name="land_category" label="Land Category" options={['Irrigated', 'Rainfed', 'Upland']} value={formData.land_category} onChange={handleInputChange} />
                            <Select name="topography" label="Toography" options={['Flat', 'Rolling', 'Hilly']} value={formData.topography} onChange={handleInputChange} />
                            <Select name="soil_type" label="Soil Type" options={['Clay Loam', 'Silty Clay Loam', 'Silty Loam', 'Sandy Loam', 'Others']} value={formData.soil_type} onChange={handleInputChange} />
                            <Select name="irrigation_source" label="Irrigation Source" options={['NIA/CIS', 'Deep Well', 'SWIP', 'STW']} value={formData.irrigation_source} onChange={handleInputChange} />
                            <Select name="tenural_status" label="Tenural Status" options={['Owner', 'Lessee', 'Tenant']} value={formData.tenural_status} onChange={handleInputChange} />
                        </div>
                    </Section>

                    {/* 5. Insurance Coverage */}
                    <Section title="Insurance Coverage" icon={<ShieldCheck size={18} />}>
                        <div className="space-y-3">
                            <Input name="cover_type" label="Type of Cover" placeholder="Multi-Risk / Natural Disaster" value={formData.cover_type} onChange={handleInputChange} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input name="amount_cover" label="Amount Cover (PHP)" type="number" value={formData.amount_cover} onChange={handleInputChange} />
                                <Input name="insurance_premium" label="Premium (PHP)" type="number" value={formData.insurance_premium} onChange={handleInputChange} />
                            </div>
                            <div className="pt-2 border-t border-dashed">
                                <label className="text-xs font-bold text-gray-500 uppercase">CLTIP - ADSS</label>
                                <div className="grid grid-cols-2 gap-3 mt-1">
                                    <Input name="cltip_sum_insured" label="Sum Insured" type="number" value={formData.cltip_sum_insured} onChange={handleInputChange} />
                                    <Input name="cltip_premium" label="Premium" type="number" value={formData.cltip_premium} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    </Section>

                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-primary px-6 pt-8 pb-12 rounded-b-[2.5rem] shadow-lg relative">
                <div className="flex justify-between items-center text-white mb-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">My Farms</h1>
                    <div className="w-9"></div> {/* Spacer */}
                </div>
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center px-4">
                    <button
                        onClick={() => setEditingFarm(INITIAL_FARM_DATA)} // Empty object for new farm
                        className="bg-white text-primary px-6 py-3 rounded-xl shadow-xl font-bold flex items-center gap-2 hover:bg-gray-50 transform active:scale-95 transition-all w-full max-w-sm justify-center"
                    >
                        <Plus size={20} />
                        Add New Farm
                    </button>
                </div>
            </div>

            <div className="mt-12 px-4 space-y-4 max-w-lg mx-auto">
                {farms.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <Tractor size={48} className="mx-auto mb-2 text-gray-400" />
                        <p>No farms registered yet.</p>
                    </div>
                ) : (
                    farms.map(farm => (
                        <div key={farm.id} onClick={() => setEditingFarm(farm)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <MapPin size={16} />
                                    <span>{farm.location_barangay || 'Unknown Location'}</span>
                                </div>
                                <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                    {farm.farm_size_hectares} ha
                                </span>
                            </div>
                            <h3 className="text-gray-800 font-medium mb-1">{farm.current_crop || 'No active crop'}</h3>
                            <div className="flex gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Sprout size={12} /> {farm.land_category}</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={12} /> {farm.cover_type ? 'Insured' : 'No Insurance'}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// UI Components
const Section = ({ title, icon, children }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3 text-secondary border-b border-gray-100 pb-2">
            {icon}
            <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
        </div>
        {children}
    </div>
);

const Input = ({ name, label, type = "text", value, placeholder, onChange }) => (
    <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
        <input
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50"
        />
    </div>
);

const Select = ({ name, label, options, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50"
        >
            <option value="">Select...</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);
