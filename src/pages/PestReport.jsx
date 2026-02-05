import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Check } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import FarmSelector from '../components/FarmSelector';
import PhotoUpload from '../components/PhotoUpload';
import { useAuth, API_URL } from '../context/AuthContext';
import { getCurrentPosition, processFileInput } from '../services/api';

export default function PestReport() {
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
        crop: '',
        pestType: [],
        severity: '',
        damage: '',
        description: '',
        latitude: null,
        longitude: null,
        photoBase64: null
    });
    const [pestOptions, setPestOptions] = useState([]);
    const [isCustomPest, setIsCustomPest] = useState(false);
    const [customPestName, setCustomPestName] = useState('');

    const togglePest = (pestName) => {
        setFormData(prev => {
            const current = prev.pestType;
            if (current.includes(pestName)) {
                return { ...prev, pestType: current.filter(p => p !== pestName) };
            } else {
                return { ...prev, pestType: [...current, pestName] };
            }
        });
    };

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

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`${API_URL}/options`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setPestOptions(data.pests || []);
                }
            } catch (e) {
                console.error("Failed to load options", e);
            }
        };

        fetchOptions();
    }, [token]);

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
        if (!formData.farmId) {
            setError('Please select a farm');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                type: 'pest',
                farmId: formData.farmId,
                location: formData.location,
                details: {
                    cropType: formData.crop,
                    pestType: [
                        ...formData.pestType,
                        ...(isCustomPest && customPestName ? [customPestName] : [])
                    ].join(', '),
                    severity: formData.severity,
                    affectedArea: formData.damage,
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
            <Header title="Report Pest Issue" showBack onBack={() => navigate(-1)} />

            <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    { }
                    <div className={`p-3 rounded-lg text-sm ${formData.latitude ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {geoStatus}
                    </div>

                    {/* Unified Photo Upload */}
                    <PhotoUpload
                        photoBase64={formData.photoBase64}
                        onPhotoChange={(base64) => {
                            setFormData(prev => ({ ...prev, photoBase64: base64 }));
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
                        label="Crop Planted"
                        placeholder="e.g. Rice (RC216)"
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    />

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Type of Pest (Select all that apply)</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {pestOptions.map((p, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => togglePest(p.name)}
                                    className={`p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${formData.pestType.includes(p.name)
                                        ? 'bg-primary/10 border-primary text-primary font-bold'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.pestType.includes(p.name) ? 'bg-primary border-primary' : 'border-gray-300'
                                        }`}>
                                        {formData.pestType.includes(p.name) && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm">{p.name}</span>
                                </div>
                            ))}
                            <div
                                onClick={() => setIsCustomPest(!isCustomPest)}
                                className={`p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${isCustomPest
                                    ? 'bg-primary/10 border-primary text-primary font-bold'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isCustomPest ? 'bg-primary border-primary' : 'border-gray-300'
                                    }`}>
                                    {isCustomPest && <Check size={12} className="text-white" />}
                                </div>
                                <span className="text-sm">Other</span>
                            </div>
                        </div>

                        {isCustomPest && (
                            <Input
                                placeholder="Specify other pest name..."
                                value={customPestName}
                                onChange={(e) => setCustomPestName(e.target.value)}
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Severity Level</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                            value={formData.severity}
                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        >
                            <option value="">Select Severity</option>
                            <option value="Low">Low (Minor visible damage)</option>
                            <option value="Medium">Medium (Noticeable patches)</option>
                            <option value="High">High (Widespread infestation)</option>
                            <option value="Critical">Critical (Total crop failure risk)</option>
                        </select>
                    </div>

                    <Input
                        label="Estimated Damage"
                        placeholder="e.g. 10% of field, 50 sacks"
                        value={formData.damage}
                        onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
                    />

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description / Notes</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[100px]"
                            placeholder="Describe the situation..."
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
