import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Phone, Mail, Calendar, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

export default function FarmerDetailModal({ farmer, onClose, onStatusUpdate }) {
    const { token, isMockMode } = useAuth();
    const [loading, setLoading] = useState(false);
    const [farmerDetails, setFarmerDetails] = useState(farmer);
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    useEffect(() => {
        if (farmer?.id && !isMockMode) {
            fetchFarmerReports();
        } else if (isMockMode) {
            // Mock reports for this farmer
            setReports([
                { id: 1, type: 'pest', status: 'pending', created_at: new Date().toISOString() },
                { id: 2, type: 'flood', status: 'resolved', created_at: new Date(Date.now() - 86400000).toISOString() }
            ]);
        }
    }, [farmer]);

    const fetchFarmerReports = async () => {
        setReportsLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/farmers/${farmer.id}/reports`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReports(data.reports || data);
            }
        } catch (err) {
            console.error('Failed to fetch farmer reports:', err);
        } finally {
            setReportsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setLoading(true);
        const newStatus = !farmerDetails.is_active;

        if (isMockMode) {
            setTimeout(() => {
                setFarmerDetails(prev => ({ ...prev, is_active: newStatus }));
                onStatusUpdate?.(farmer.id, newStatus);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/farmers/${farmer.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');
            
            setFarmerDetails(prev => ({ ...prev, is_active: newStatus }));
            onStatusUpdate?.(farmer.id, newStatus);
        } catch (err) {
            alert('Error updating status: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
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

    if (!farmer) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                            <User size={28} className="text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-bold">{farmerDetails.first_name} {farmerDetails.last_name}</h2>
                            <p className="text-sm text-white/80">RSBSA: {farmerDetails.rsbsa_id || 'N/A'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Account Status */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-gray-700">Account Status</h3>
                            <p className="text-sm text-gray-500">
                                {farmerDetails.is_active !== false ? 'Farmer can access the system' : 'Farmer account is deactivated'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleStatus}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                farmerDetails.is_active !== false
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } disabled:opacity-50`}
                        >
                            {farmerDetails.is_active !== false ? (
                                <>
                                    <ToggleRight size={20} />
                                    Active
                                </>
                            ) : (
                                <>
                                    <ToggleLeft size={20} />
                                    Inactive
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm font-medium">{farmerDetails.email || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-400">Contact Number</p>
                                <p className="text-sm font-medium">{farmerDetails.cellphone || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-400">Address</p>
                                <p className="text-sm font-medium">{farmerDetails.address_barangay || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-400">Registered</p>
                                <p className="text-sm font-medium">{formatDate(farmerDetails.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Farm Information */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Farm Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Farm Location:</span>
                                <span className="font-medium">{farmerDetails.location_barangay || farmerDetails.farm_barangay || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Farm Size:</span>
                                <span className="font-medium">
                                    {farmerDetails.farm_size_hectares 
                                        ? `${farmerDetails.farm_size_hectares} hectares` 
                                        : 'Not set'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Reports:</span>
                                <span className="font-medium">{farmerDetails.report_count || reports.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Reports */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Recent Reports</h3>
                        {reportsLoading ? (
                            <div className="py-8 text-center text-gray-400">Loading reports...</div>
                        ) : reports.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-lg">
                                <FileText size={24} className="mx-auto mb-2" />
                                No reports found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {reports.slice(0, 5).map((report) => (
                                    <div 
                                        key={report.id} 
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                report.type === 'pest' ? 'bg-red-500' :
                                                report.type === 'flood' ? 'bg-blue-500' : 'bg-orange-500'
                                            }`}></div>
                                            <span className="text-sm font-medium capitalize">{report.type} Report</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBadge(report.status)}`}>
                                                {report.status}
                                            </span>
                                            <span className="text-xs text-gray-400">{formatDate(report.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
