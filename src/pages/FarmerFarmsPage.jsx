import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { barangayBoundaries } from '../config/barangayBoundaries';
import { ArrowLeft, Save, Plus, MapPin, Calendar, Sprout, Tractor, ShieldCheck, Ruler } from 'lucide-react';

export default function FarmerFarmsPage() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFarm, setEditingFarm] = useState(null); // null = list view, object = edit/create mode

    // Fetch user's farms
    useEffect(() => {
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

        if (token) fetchFarms();
    }, [token]);

    const handleSave = async (e) => {
        e.preventDefault();
        // Implement save logic (POST/PUT)
        alert("Save functionality available soon!");
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
                        <h1 className="text-lg font-bold text-gray-800">{editingFarm.id ? 'Edit Farm' : 'Add New Farm'}</h1>
                    </div>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                        <Save size={18} />
                        Save
                    </button>
                </div>

                <div className="p-4 space-y-6 max-w-lg mx-auto">
                    {/* 1. Basic Location & Size */}
                    <Section title="Location & Size" icon={<MapPin size={18} />}>
                        <div className="grid grid-cols-2 gap-3">
                            <Select
                                label="Barangay"
                                options={Object.keys(barangayBoundaries).sort()}
                                value={editingFarm.location_barangay}
                            />
                            <Input label="Sitio" value={editingFarm.location_sitio} />
                            <Input label="Latitude" value={editingFarm.latitude} />
                            <Input label="Longitude" value={editingFarm.longitude} />
                            <div className="col-span-2">
                                <Input label="Farm Size (ha)" type="number" value={editingFarm.farm_size_hectares} />
                            </div>
                        </div>
                    </Section>

                    {/* 2. Boundaries */}
                    <Section title="Boundaries (Adjacent)" icon={<Ruler size={18} />}>
                        <div className="space-y-3">
                            <Input label="North" placeholder="e.g. Desamero Land" value={editingFarm.boundary_north} />
                            <Input label="South" placeholder="e.g. River" value={editingFarm.boundary_south} />
                            <Input label="East" placeholder="e.g. Highway" value={editingFarm.boundary_east} />
                            <Input label="West" placeholder="e.g. Irrigation Canal" value={editingFarm.boundary_west} />
                        </div>
                    </Section>

                    {/* 3. Planting Details */}
                    <Section title="Planting Details" icon={<Sprout size={18} />}>
                        <div className="grid grid-cols-2 gap-3">
                            <Select label="Planting Method" options={['Direct Seeding', 'Transplanting']} value={editingFarm.planting_method} />
                            <Input label="Current Crop" value={editingFarm.current_crop} />
                            <Input label="Date of Sowing" type="date" value={editingFarm.date_of_sowing} />
                            {editingFarm.planting_method === 'Transplanting' && (
                                <Input label="Date Transplanting" type="date" value={editingFarm.date_of_transplanting} />
                            )}
                            <Input label="Date of Harvest (Est)" type="date" value={editingFarm.date_of_harvest} />
                        </div>
                    </Section>

                    {/* 4. Land & Irrigation */}
                    <Section title="Land & Irrigation" icon={<Tractor size={18} />}>
                        <div className="grid grid-cols-2 gap-3">
                            <Select label="Land Category" options={['Irrigated', 'Rainfed', 'Upland']} value={editingFarm.land_category} />
                            <Select label="Toography" options={['Flat', 'Rolling', 'Hilly']} value={editingFarm.topography} />
                            <Select label="Soil Type" options={['Clay Loam', 'Silty Clay Loam', 'Silty Loam', 'Sandy Loam', 'Others']} value={editingFarm.soil_type} />
                            <Select label="Irrigation Source" options={['NIA/CIS', 'Deep Well', 'SWIP', 'STW']} value={editingFarm.irrigation_source} />
                            <Select label="Tenural Status" options={['Owner', 'Lessee', 'Tenant']} value={editingFarm.tenural_status} />
                        </div>
                    </Section>

                    {/* 5. Insurance Coverage */}
                    <Section title="Insurance Coverage" icon={<ShieldCheck size={18} />}>
                        <div className="space-y-3">
                            <Input label="Type of Cover" placeholder="Multi-Risk / Natural Disaster" value={editingFarm.cover_type} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Amount Cover (PHP)" type="number" value={editingFarm.amount_cover} />
                                <Input label="Premium (PHP)" type="number" value={editingFarm.insurance_premium} />
                            </div>
                            <div className="pt-2 border-t border-dashed">
                                <label className="text-xs font-bold text-gray-500 uppercase">CLTIP - ADSS</label>
                                <div className="grid grid-cols-2 gap-3 mt-1">
                                    <Input label="Sum Insured" type="number" value={editingFarm.cltip_sum_insured} />
                                    <Input label="Premium" type="number" value={editingFarm.cltip_premium} />
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
                        onClick={() => setEditingFarm({})}
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
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
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

const Input = ({ label, type = "text", value, placeholder, onChange }) => (
    <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
        <input
            type={type}
            defaultValue={value}
            placeholder={placeholder}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50"
        />
    </div>
);

const Select = ({ label, options, value }) => (
    <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
        <select defaultValue={value} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50">
            <option value="">Select...</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);
