import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import FarmSelector from '../components/FarmSelector';
import PhotoUpload from '../components/PhotoUpload';
import { useAuth, API_URL } from '../context/AuthContext';
import { getCurrentPosition, processFileInput } from '../services/api';

export default function DroughtReport() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [geoStatus, setGeoStatus] = useState('Getting location...');
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        farmId: null,
        location: '',

        affectedArea: '',
        crop: '',
        cropStage: '',
        waterSource: '',
        daysSinceRain: '',
        description: '',
        latitude: null,
        longitude: null,
        photoBase64: null
    });

    useEffect(() => {
        const getLocation = async () => {
            try {
                const coords = await getCurrentPosition();
                setFormData(prev => ({
                    ...prev,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                }));
                setGeoStatus(`📍 Location captured (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`);
            } catch (err) {
                setGeoStatus('⚠️ Location unavailable - please enable GPS');
                console.error('Geolocation error:', err);
            }
        };
        getLocation();
    }, []);

    const handlePhotoCapture = async (e) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            const result = await processFileInput(file);
            if (result) {
                setPhotoPreview(result.preview);
                setFormData(prev => ({ ...prev, photoBase64: result.base64 }));
            }
        } catch (err) {
            setError('Failed to capture photo');
            console.error(err);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setFormData(prev => ({ ...prev, photoBase64: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.farmId) {
                throw new Error('Please select a farm');
            }

            const payload = {
                type: 'drought',
                farmId: formData.farmId,
                location: formData.location,
                details: {
                    cropType: formData.crop,
                    cropStage: formData.cropStage,
                    affectedArea: formData.affectedArea,

                    waterSource: formData.waterSource,
                    daysSinceRain: formData.daysSinceRain,
                    description: formData.description
                },
                latitude: formData.latitude,
                longitude: formData.longitude,
                photoBase64: formData.photoBase64
            };

            const response = await fetch(`${API_URL}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to submit report');
            }

            navigate('/report-confirmation');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error submitting report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="Report Drought Damage" showBack onBack={() => navigate(-1)} />

            <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    { }
                    <div className={`p-3 rounded-lg text-sm ${formData.latitude ? 'bg-primary text-white' : 'bg-yellow-50 text-yellow-700'}`}>
                        {geoStatus}
                    </div>

                    { }
                    {/* Unified Photo Upload */}
                    <PhotoUpload
                        photoBase64={formData.photoBase64}
                        onPhotoChange={(base64) => {
                            setFormData(prev => ({ ...prev, photoBase64: base64 }));
                            setPhotoPreview(base64);
                        }}
                    />

                    <FarmSelector
                        selectedFarmId={formData.farmId}
                        onSelect={(farm) => {
                            setFormData(prev => ({
                                ...prev,
                                farmId: farm ? farm.id : null,
                                location: farm ? `${farm.location_barangay}` : '',
                                crop: farm ? farm.current_crop || '' : ''
                            }));
                        }}
                    />

                    <Input
                        label="Affected Area (ha)"
                        type="number"
                        placeholder="0.0"
                        value={formData.affectedArea}
                        onChange={(e) => setFormData({ ...formData, affectedArea: e.target.value })}
                    />

                    <Input
                        label="Crop Planted"
                        placeholder="e.g. Rice (RC216)"
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    />

                    <Input
                        label="Crop Stage"
                        placeholder="e.g. Vegetative, Flowering"
                        value={formData.cropStage}
                        onChange={(e) => setFormData({ ...formData, cropStage: e.target.value })}
                    />

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Water Source Status</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                            value={formData.waterSource}
                            onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
                        >
                            <option value="">Select Status</option>
                            <option value="Normal">Normal - Adequate water supply</option>
                            <option value="Low">Low - Reduced water availability</option>
                            <option value="Critical">Critical - Severely depleted</option>
                            <option value="Dry">Dry - No water source available</option>
                        </select>
                    </div>

                    <Input
                        label="Days Since Last Rain"
                        type="number"
                        placeholder="e.g. 14"
                        value={formData.daysSinceRain}
                        onChange={(e) => setFormData({ ...formData, daysSinceRain: e.target.value })}
                    />

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description / Notes</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[100px]"
                            placeholder="Describe the drought conditions and crop damage..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </form>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
                {error && <div className="text-red-500 text-xs text-center mb-2 font-bold">{error}</div>}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="flex-1 bg-gray-500 text-white hover:bg-gray-600 shadow-none border-none py-3"
                    >
                        CANCEL
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] py-3 text-base shadow-none"
                    >
                        {loading ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
