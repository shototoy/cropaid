import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth, API_URL } from '../context/AuthContext';
import { User, MapPin, Phone, Mail, Calendar, Edit2, Save, X } from 'lucide-react';
import { MOCK_DATA } from '../config/mockData';

export default function FarmerProfile() {
    const navigate = useNavigate();
    const { user, token, isMockMode, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        farmBarangay: ''
    });

    const [editedProfile, setEditedProfile] = useState({ ...profile });

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
                    farmBarangay: farmer.profile?.address_barangay || 'San Jose'
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
                    farmBarangay: data.farm_barangay || ''
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
    }, [profile]);

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
        setError('');
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
                    address_barangay: editedProfile.barangay
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
                {/* Profile Header */}
                <div className="bg-primary text-white p-6 pb-16 relative">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                            <User size={40} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
                            <p className="text-white/80 text-sm">RSBSA: {profile.rsbsaId}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="px-4 -mt-10">
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        {/* Action Buttons */}
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

                        {/* Messages */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        {/* Personal Info Section */}
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

                        {/* Farm Info Section */}
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">Farm Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Farm Location</p>
                                    <p className="text-sm font-medium">{profile.farmBarangay || 'Not set'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Farm Size</p>
                                    <p className="text-sm font-medium">{profile.farmSize ? `${profile.farmSize} hectares` : 'Not set'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
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
