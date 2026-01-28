import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth, API_URL } from '../context/AuthContext';
import { User, MapPin, Phone, Mail, Calendar, Edit2, Save, X, Camera, Crosshair } from 'lucide-react';
import { MOCK_DATA } from '../config/mockData';
import { noralaBoundaryCoordinates } from '../config/noralaBoundary';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const farmIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="
        background-color: #16a34a;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    ">🌾</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

function LocationPicker({ position, setPosition, isEditing }) {
    useMapEvents({
        click(e) {
            if (isEditing) {
                setPosition([e.latlng.lat, e.latlng.lng]);
            }
        },
    });
    return position ? <Marker position={position} icon={farmIcon} /> : null;
}

export default function FarmerProfile() {
    const navigate = useNavigate();
    const { user, token, isMockMode, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showLocationMap, setShowLocationMap] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        cellphone: '',
        rsbsaId: '',
        barangay: '',
        municipality: '',
        province: '',
        farmSize: '',
        farmBarangay: '',
        farmLatitude: null,
        farmLongitude: null,
        profilePicture: null
    });

    const [editedProfile, setEditedProfile] = useState({ ...profile });
    const [mapPosition, setMapPosition] = useState(null);

    const defaultCenter = [6.5294, 124.6647];

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);

            if (isMockMode) {
                const username = user?.username || 'james';
                const farmer = MOCK_DATA.getFarmerDashboard(username);
                setProfile({
                    firstName: farmer.profile?.name?.split(' ')[0] || 'James',
                    lastName: farmer.profile?.name?.split(' ').slice(1).join(' ') || 'Machico',
                    email: `${username}@example.com`,
                    cellphone: '09123456789',
                    rsbsaId: farmer.profile?.rsbsa || '012-345-6789',
                    barangay: farmer.profile?.address_barangay || 'San Jose',
                    municipality: 'Norala',
                    province: 'South Cotabato',
                    farmSize: '2.5',
                    farmBarangay: farmer.profile?.address_barangay || 'San Jose',
                    farmLatitude: 6.5294,
                    farmLongitude: 124.6647,
                    profilePicture: null
                });
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/farmer/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch profile');

                const data = await response.json();
                setProfile({
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    email: data.email || '',
                    cellphone: data.cellphone || '',
                    rsbsaId: data.rsbsa_id || '',
                    barangay: data.address_barangay || '',
                    municipality: data.address_municipality || 'Norala',
                    province: data.address_province || 'South Cotabato',
                    farmSize: data.farm_size_hectares?.toString() || '',
                    farmBarangay: data.farm_barangay || '',
                    farmLatitude: data.farm_latitude || null,
                    farmLongitude: data.farm_longitude || null,
                    profilePicture: data.profile_picture || null
                });
            } catch (err) {
                console.error(err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, isMockMode, user]);

    useEffect(() => {
        setEditedProfile({ ...profile });
        if (profile.farmLatitude && profile.farmLongitude) {
            setMapPosition([profile.farmLatitude, profile.farmLongitude]);
        }
    }, [profile]);

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
        if (profile.farmLatitude && profile.farmLongitude) {
            setMapPosition([profile.farmLatitude, profile.farmLongitude]);
        }
        setError('');
    };

    const handleProfilePictureClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedProfile({ ...editedProfile, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos = [position.coords.latitude, position.coords.longitude];
                    setMapPosition(newPos);
                    setEditedProfile({
                        ...editedProfile,
                        farmLatitude: position.coords.latitude,
                        farmLongitude: position.coords.longitude
                    });
                    setGettingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setGettingLocation(false);
                    setError('Could not get your location');
                },
                { enableHighAccuracy: true }
            );
        }
    };

    const handleSetupLocation = () => {
        setIsEditing(true);
        setShowLocationMap(true);
    };

    const handleLocationConfirm = () => {
        if (mapPosition) {
            setEditedProfile({
                ...editedProfile,
                farmLatitude: mapPosition[0],
                farmLongitude: mapPosition[1]
            });
        }
        setShowLocationMap(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        if (isMockMode) {
            setTimeout(() => {
                setProfile({ ...editedProfile });
                setIsEditing(false);
                setSuccess('Profile updated successfully!');
                setSaving(false);
            }, 1000);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/farmer/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    cellphone: editedProfile.cellphone,
                    address_barangay: editedProfile.barangay,
                    farm_latitude: editedProfile.farmLatitude,
                    farm_longitude: editedProfile.farmLongitude,
                    profile_picture: editedProfile.profilePicture,
                    farm_barangay: editedProfile.farmBarangay,
                    farm_size_hectares: editedProfile.farmSize
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            setProfile({ ...editedProfile });
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            setError('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                <Header title="My Profile" showBack onBack={() => navigate(-1)} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <Header title="My Profile" showBack onBack={() => navigate(-1)} />

            <div className="flex-1 overflow-y-auto pb-24">
                { }
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                { }
                { }
                <div className="bg-primary text-white pt-8 pb-6 px-6 rounded-b-[40px] shadow-sm">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div
                            className={`relative w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                            onClick={handleProfilePictureClick}
                        >
                            {(isEditing ? editedProfile.profilePicture : profile.profilePicture) ? (
                                <img
                                    src={isEditing ? editedProfile.profilePicture : profile.profilePicture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                    <User size={48} className="text-white" />
                                </div>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity hover:opacity-100">
                                    <Camera size={32} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h2>
                            <p className="text-white/80 text-sm font-medium mt-1 inline-block bg-white/20 px-3 py-1 rounded-full">
                                RSBSA: {profile.rsbsaId}
                            </p>
                            {isEditing && (
                                <p className="text-white/60 text-xs mt-2 animate-pulse">Tap photo to change</p>
                            )}
                        </div>
                    </div>
                </div>

                { }
                <div className="px-4 mt-4">
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        { }
                        <div className="flex justify-end mb-4">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        { }
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                                {success}
                            </div>
                        )}

                        { }
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">Personal Information</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="text-sm font-medium">{profile.email || 'Not set'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Contact Number</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedProfile.cellphone}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, cellphone: e.target.value })}
                                            className="w-full text-sm font-medium bg-white border border-gray-200 rounded px-2 py-1 mt-1"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{profile.cellphone || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Address</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.barangay}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, barangay: e.target.value })}
                                            className="w-full text-sm font-medium bg-white border border-gray-200 rounded px-2 py-1 mt-1"
                                            placeholder="Barangay"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">
                                            {[profile.barangay, profile.municipality, profile.province].filter(Boolean).join(', ') || 'Not set'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>

                    { }
                    <button
                        onClick={handleLogout}
                        className="w-full mt-4 p-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </div>


        </div>
    );
}
