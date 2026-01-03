import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, Bug, CloudRain, Sun, Phone, FileText, CheckCircle, XCircle, Clock, Image } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';

export default function ReportDetailModal({ report, onClose, onStatusUpdate }) {
    const { token, isMockMode } = useAuth();
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoData, setPhotoData] = useState(null);
    const [adminNotes, setAdminNotes] = useState(report?.admin_notes || '');
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    useEffect(() => {
        if (report?.has_photo || report?.photo_base64) {
            loadPhoto();
        }
    }, [report]);

    const loadPhoto = async () => {
        if (!report?.id || isMockMode) return;
        
        setPhotoLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/reports/${report.id}/photo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPhotoData(data.photo);
            }
        } catch (err) {
            console.error('Failed to load photo:', err);
        } finally {
            setPhotoLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        
        if (isMockMode) {
            setTimeout(() => {
                onStatusUpdate?.(report.id, newStatus, adminNotes);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/reports/${report.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, adminNotes })
            });

            if (!response.ok) throw new Error('Failed to update status');
            
            onStatusUpdate?.(report.id, newStatus, adminNotes);
        } catch (err) {
            alert('Error updating status: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pest': return <Bug size={24} className="text-red-500" />;
            case 'flood': return <CloudRain size={24} className="text-blue-500" />;
            case 'drought': return <Sun size={24} className="text-orange-500" />;
            default: return <FileText size={24} className="text-gray-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            verified: 'bg-blue-100 text-blue-700 border-blue-200',
            resolved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200'
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const parseDetails = (details) => {
        if (!details) return {};
        if (typeof details === 'string') {
            try { return JSON.parse(details); } catch { return {}; }
        }
        return details;
    };

    const details = parseDetails(report?.details);

    if (!report) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div 
                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                report.type?.toLowerCase() === 'pest' ? 'bg-red-100' :
                                report.type?.toLowerCase() === 'flood' ? 'bg-blue-100' : 'bg-orange-100'
                            }`}>
                                {getTypeIcon(report.type)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 capitalize">{report.type} Report</h2>
                                <p className="text-sm text-gray-500">ID: {report.id?.slice(0, 8) || 'N/A'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-sm font-medium text-gray-500">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getStatusBadge(report.status)}`}>
                                {report.status}
                            </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <User size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400">Farmer</p>
                                    <p className="text-sm font-medium">{report.first_name} {report.last_name}</p>
                                    <p className="text-xs text-gray-500">RSBSA: {report.rsbsa_id || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400">Contact</p>
                                    <p className="text-sm font-medium">{report.cellphone || 'Not available'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400">Location</p>
                                    <p className="text-sm font-medium">{report.location || report.farm_barangay || 'Not specified'}</p>
                                    {report.latitude && report.longitude && (
                                        <p className="text-xs text-gray-500">
                                            {parseFloat(report.latitude).toFixed(6)}, {parseFloat(report.longitude).toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400">Submitted</p>
                                    <p className="text-sm font-medium">{formatDate(report.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Report Details */}
                        {Object.keys(details).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Report Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    {details.cropType && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Crop Type:</span>
                                            <span className="font-medium">{details.cropType}</span>
                                        </div>
                                    )}
                                    {details.pestType && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Pest Type:</span>
                                            <span className="font-medium">{details.pestType}</span>
                                        </div>
                                    )}
                                    {details.severity && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Severity:</span>
                                            <span className="font-medium">{details.severity}</span>
                                        </div>
                                    )}
                                    {details.affectedArea && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Affected Area:</span>
                                            <span className="font-medium">{details.affectedArea} ha</span>
                                        </div>
                                    )}
                                    {details.farmArea && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Total Farm Area:</span>
                                            <span className="font-medium">{details.farmArea} ha</span>
                                        </div>
                                    )}
                                    {details.description && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Description:</p>
                                            <p className="text-sm">{details.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Photo */}
                        {(report.has_photo || photoData) && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Photo Evidence</h3>
                                {photoLoading ? (
                                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : photoData ? (
                                    <img 
                                        src={photoData} 
                                        alt="Report evidence" 
                                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setShowPhotoModal(true)}
                                    />
                                ) : (
                                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                        <Image size={24} className="mr-2" />
                                        Photo available - click to load
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Notes */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Admin Notes</h3>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                rows={3}
                                placeholder="Add notes about this report..."
                            />
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
                        {report.status !== 'rejected' && (
                            <button
                                onClick={() => handleStatusUpdate('rejected')}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                                <XCircle size={16} />
                                Reject
                            </button>
                        )}
                        {report.status === 'pending' && (
                            <button
                                onClick={() => handleStatusUpdate('verified')}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                            >
                                <Clock size={16} />
                                Verify
                            </button>
                        )}
                        {(report.status === 'pending' || report.status === 'verified') && (
                            <button
                                onClick={() => handleStatusUpdate('resolved')}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <CheckCircle size={16} />
                                Resolve
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            {showPhotoModal && photoData && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
                    onClick={() => setShowPhotoModal(false)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
                        onClick={() => setShowPhotoModal(false)}
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={photoData} 
                        alt="Report evidence full view" 
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
        </>
    );
}
