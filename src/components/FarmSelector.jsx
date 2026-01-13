
import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Tractor } from 'lucide-react';

export default function FarmSelector({ onSelect, selectedFarmId, required = true }) {
    const { token } = useAuth();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const response = await fetch(`${API_URL}/farmer/farms`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFarms(data);
                    // If only one farm exists, auto-select it
                    if (data.length === 1 && !selectedFarmId) {
                        onSelect(data[0]);
                    }
                } else {
                    setError('Failed to load farms');
                }
            } catch (err) {
                console.error(err);
                setError('Error loading farms');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchFarms();
    }, [token]);

    const handleChange = (e) => {
        const farmId = e.target.value;
        if (!farmId) {
            onSelect(null);
            return;
        }
        const farm = farms.find(f => f.id == farmId);
        onSelect(farm);
    };

    if (loading) return <div className="text-xs text-gray-500">Loading farms...</div>;
    if (error) return <div className="text-xs text-red-500">{error}</div>;

    if (farms.length === 0) {
        return (
            <div className="flex flex-col gap-1 opacity-70">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Select Affected Farm
                </label>
                <div className="w-full px-3 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 italic">
                    Currently No Farms registered
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Select Affected Farm {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Tractor size={18} />
                </div>
                <select
                    value={selectedFarmId || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none"
                    required={required}
                >
                    <option value="">-- Select a Farm --</option>
                    {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>
                            {farm.location_barangay} ({farm.farm_size_hectares} ha) - {farm.current_crop || 'No Crop'}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
            </div>
        </div>
    );
}
