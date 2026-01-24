import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, Filter, AlertTriangle, Eye, CheckCircle, XCircle, Printer } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { MOCK_DATA } from '../../config/mockData';
import ReportDetailModal from '../../components/ReportDetailModal';
import { useDebounce } from '../../utils/debounce';

export default function AdminReports() {
    const { token, isMockMode } = useAuth();
    const [searchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const location = useLocation();

    // Initialize Active Tab from URL param
    useEffect(() => {
        const statusParam = searchParams.get('status');
        if (statusParam) {
            // Capitalize first letter to match tab names (e.g. 'pending' -> 'Pending')
            const tabName = statusParam.charAt(0).toUpperCase() + statusParam.slice(1);
            if (['All', 'Pending', 'Verified', 'Resolved'].includes(tabName)) {
                setActiveTab(tabName);
            }
        }
    }, [searchParams]);

    // Auto-open modal if navigated from notification
    useEffect(() => {
        if (location.state?.openReportId && reports.length > 0) {
            const reportToOpen = reports.find(r => r.id.toString() === location.state.openReportId.toString());
            if (reportToOpen) {
                setSelectedReport(reportToOpen);
                // Clear state so it doesn't re-open on refresh/nav
                window.history.replaceState({}, document.title);
            }
        }
    }, [reports, location.state]);

    const fetchReports = async () => {
        setLoading(true);
        if (isMockMode) {
            // Mock Data
            setTimeout(() => {
                setReports(MOCK_DATA.admin.Reports);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/reports`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch reports');
            const data = await response.json();
            // Backend returns { reports: [...] } or array directly
            const reportsArray = data.reports || data;
            // Normalize field names
            const normalizedReports = reportsArray.map(r => ({
                ...r,
                type: r.report_type || r.type,
                first_name: r.farmer_first_name || r.first_name || 'Unknown',
                last_name: r.farmer_last_name || r.last_name || 'Farmer',
                rsbsa_id: r.farmer_rsbsa_id || r.rsbsa_id || 'N/A',
                cellphone: r.farmer_cellphone || r.cellphone || 'N/A',
                // details is already in r, only populate if missing but description exists (mock data legacy)
                details: r.details || (r.description ? { description: r.description } : {})
            }));
            setReports(normalizedReports);
        } catch (err) {
            console.error(err);
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token || isMockMode) fetchReports();
    }, [token, isMockMode]);

    const handleStatusUpdate = async (id, newStatus) => {
        if (isMockMode) {
            // Mock Update - just update local state for visual feedback
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/reports/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            // Refresh list
            fetchReports();
        } catch (err) {
            alert('Error updating status: ' + err.message);
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesTab = activeTab === 'All' || r.status === activeTab.toLowerCase();
        const searchLower = debouncedSearchTerm.toLowerCase();
        // Safe access checks
        const matchesSearch =
            (r.type && r.type.toLowerCase().includes(searchLower)) ||
            (r.first_name && r.first_name.toLowerCase().includes(searchLower)) ||
            (r.last_name && r.last_name.toLowerCase().includes(searchLower)) ||
            (r.location && r.location.toLowerCase().includes(searchLower));
        return matchesTab && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'verified': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'critical': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const handleExport = (report) => {
        let details = {};
        try {
            details = typeof report.details === 'string' ? JSON.parse(report.details) : report.details;
        } catch (e) {
            details = { description: report.details };
        }
        if (!details || typeof details !== 'object') details = {};

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>CropAid Report Summary #${report.id}</title>
                <style>
                    @page { size: auto; margin: 3mm; }
                    body { font-family: 'Arial', sans-serif; line-height: 1.3; color: #333; margin: 0; padding: 10px; width: 100%; box-sizing: border-box; }
                    .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-bottom: 10px; }
                    .logo { font-size: 18px; font-weight: bold; color: #16a34a; }
                    .title { font-size: 12px; margin-top: 2px; font-weight: normal; }
                    .section { margin-bottom: 8px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; page-break-inside: avoid; }
                    .section-header { background: #f9fafb; padding: 4px 8px; font-weight: bold; border-bottom: 1px solid #ddd; color: #555; font-size: 10px; text-transform: uppercase; }
                    .section-content { padding: 6px 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; }
                    .field { margin-bottom: 0px; }
                    .label { font-size: 9px; color: #666; display: block; margin-bottom: 0px; }
                    .value { font-size: 10px; font-weight: 600; }
                    .full-width { grid-column: span 2; }
                    .status-badge { display: inline-block; padding: 1px 6px; border-radius: 99px; font-size: 9px; font-weight: bold; text-transform: uppercase; border: 1px solid #ccc; }
                    .footer { margin-top: 15px; text-align: center; font-size: 9px; color: #888; border-top: 1px solid #eee; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">CropAid</div>
                    <div class="title">Complete Report Summary</div>
                </div>

                <div class="section">
                    <div class="section-header">Report Information</div>
                    <div class="section-content">
                        <div class="field">
                            <span class="label">Report ID</span>
                            <span class="value">#${report.id}</span>
                        </div>
                        <div class="field">
                            <span class="label">Date Submitted</span>
                            <span class="value">${new Date(report.created_at).toLocaleString()}</span>
                        </div>
                        <div class="field">
                            <span class="label">Type</span>
                            <span class="value" style="text-transform: capitalize">${report.type}</span>
                        </div>
                        <div class="field">
                            <span class="label">Status</span>
                            <span class="value status-badge">${report.status}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">Farmer Profile</div>
                    <div class="section-content">
                        <div class="field">
                            <span class="label">Name</span>
                            <span class="value">${report.farmer_first_name || report.first_name} ${report.farmer_last_name || report.last_name}</span>
                        </div>
                        <div class="field">
                            <span class="label">RSBSA ID</span>
                            <span class="value">${report.farmer_rsbsa_id || report.rsbsa_id || 'N/A'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Address</span>
                            <span class="value">${report.farmer_address_sitio || ''}, ${report.farmer_address_barangay || ''}</span>
                        </div>
                        <div class="field">
                            <span class="label">Contact</span>
                            <span class="value">${report.farmer_cellphone || report.cellphone || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">Farm Details</div>
                    <div class="section-content">
                        <div class="field">
                            <span class="label">Farm Location</span>
                            <span class="value">${report.farm_barangay || report.location || 'N/A'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Size / Coordinates</span>
                            <span class="value">${report.farm_size ? report.farm_size + ' ha' : 'N/A'} (${report.latitude}, ${report.longitude})</span>
                        </div>
                        <div class="field">
                            <span class="label">Land & Soil</span>
                            <span class="value">${report.farm_land_category || 'N/A'} | ${report.farm_soil_type || 'N/A'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Topography / Irrigation</span>
                            <span class="value">${report.farm_topography || 'N/A'} | ${report.farm_irrigation_source || 'N/A'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Planting Method</span>
                            <span class="value">${report.farm_planting_method || 'N/A'}</span>
                        </div>
                         <div class="field">
                            <span class="label">Current Crop</span>
                            <span class="value">${report.farm_current_crop || details.cropType || 'N/A'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Key Dates (Sowing/Trans/Harv)</span>
                            <span class="value">
                                ${formatDate(report.farm_date_of_sowing) || '-'} / 
                                ${formatDate(report.farm_date_of_transplanting) || '-'} / 
                                ${formatDate(report.farm_date_of_harvest) || '-'}
                            </span>
                        </div>
                        <div class="field">
                            <span class="label">Tenural Status</span>
                            <span class="value">${report.farm_tenural_status || 'N/A'}</span>
                        </div>
                        <div class="field full-width">
                            <span class="label">Boundaries (N / S / E / W)</span>
                            <span class="value">
                                ${report.boundary_north || '-'} / ${report.boundary_south || '-'} / 
                                ${report.boundary_east || '-'} / ${report.boundary_west || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">Insurance Information</div>
                    <div class="section-content">
                         <div class="field">
                            <span class="label">Cover Type</span>
                            <span class="value">${report.farm_cover_type || 'None'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Details</span>
                            <span class="value">Amt: ${report.farm_amount_cover || 0} | Prem: ${report.farm_insurance_premium || 0}</span>
                        </div>
                        <div class="field full-width">
                            <span class="label">CLTIP Details</span>
                            <span class="value">Sum Insured: ${report.farm_cltip_sum_insured || 0} | Premium: ${report.farm_cltip_premium || 0}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">Incident Report Details</div>
                    <div class="section-content">
                        <div class="field">
                            <span class="label">Incident Type</span>
                            <span class="value" style="text-transform: capitalize">${report.type}</span>
                        </div>
                         <div class="field">
                            <span class="label">Severity / Damage</span>
                            <span class="value">${details.severity || 'N/A'} | ${details.damageLevel || 'N/A'}</span>
                        </div>
                        <div class="field full-width">
                            <span class="label">Description</span>
                            <span class="value">${details.description || 'N/A'}</span>
                        </div>
                        ${details.affectedArea ? `
                        <div class="field">
                            <span class="label">Affected Area Reported</span>
                            <span class="value">${details.affectedArea} ha</span>
                        </div>` : ''}
                        ${details.pestType ? `
                        <div class="field">
                            <span class="label">Pest Type</span>
                            <span class="value">${details.pestType}</span>
                        </div>` : ''}
                        ${details.damageTypes && details.damageTypes.length > 0 ? `
                        <div class="field full-width">
                            <span class="label">Damage Types</span>
                            <span class="value">${details.damageTypes.join(', ')}</span>
                        </div>` : ''}
                    </div>
                </div>

                ${report.admin_notes ? `
                <div class="section">
                    <div class="section-header">Admin Notes</div>
                    <div class="section-content">
                        <div class="field full-width">
                            <span class="value">${report.admin_notes}</span>
                        </div>
                    </div>
                </div>` : ''}

                <div class="footer">
                    Generated on ${new Date().toLocaleString()} by CropAid System
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="space-y-6">
            {/* Redundant header removed */}

            {/* Tabs & Search */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md self-start md:self-auto">
                    {['All', 'Pending', 'Verified', 'Resolved'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        className="w-full md:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading && <p className="text-center py-8 text-gray-500">Loading reports...</p>}

                {!loading && filteredReports.length === 0 && (
                    <p className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                        No reports found.
                    </p>
                )}

                {filteredReports.map((report) => {
                    let details = {};
                    if (report.details) {
                        try {
                            details = typeof report.details === 'string' ? JSON.parse(report.details) : report.details;
                        } catch (e) {
                            // Fallback for plain string details
                            details = { description: report.details };
                        }
                    }
                    // Ensure details is an object to prevent crashes
                    if (!details || typeof details !== 'object') details = {};

                    return (
                        <div key={report.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(report.status)} uppercase tracking-wide`}>
                                            {report.status}
                                        </span>
                                        {details.severity && (
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityColor(details.severity)} uppercase tracking-wide`}>
                                                {details.severity}
                                            </span>
                                        )}
                                        {details.damageTypes && details.damageTypes.map(type => (
                                            <span key={type} className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-purple-50 text-purple-700 border-purple-200 uppercase tracking-wide">
                                                {type}
                                            </span>
                                        ))}
                                        <span className="text-xs text-gray-400 font-medium">{formatDate(report.created_at)}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 capitalize">
                                        <AlertTriangle size={18} className="text-primary" />
                                        {report.type === 'mix' ? 'Multiple Issues Report' : `${report.type} Report`}
                                        {details.severity && <span className="text-gray-600"> - {details.severity} Severity</span>}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed italic">
                                        "{details.description || 'No description provided'}"
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                {report.farmer_first_name ? report.farmer_first_name.charAt(0) : (report.first_name ? report.first_name.charAt(0) : '?')}
                                            </div>
                                            {report.farmer_first_name || report.first_name} {report.farmer_last_name || report.last_name}
                                        </span>
                                        <span>•</span>
                                        <span>{report.farm_barangay || report.location}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:border-l md:border-gray-100 md:pl-6 shrink-0 pt-4 md:pt-0 border-t border-gray-100 mt-2 md:mt-0">
                                    {/* View Button */}
                                    <button
                                        onClick={() => setSelectedReport(report)}
                                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
                                    >
                                        <Eye size={20} />
                                        <span className="text-[10px] uppercase font-bold">View</span>
                                    </button>

                                    {/* Export Button - Always Visible */}
                                    <button
                                        onClick={() => handleExport(report)}
                                        className="flex flex-col items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors p-2 rounded-md hover:bg-indigo-50"
                                    >
                                        <Printer size={20} />
                                        <span className="text-[10px] uppercase font-bold">Export</span>
                                    </button>

                                    {report.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(report.id, 'verified')}
                                                className="flex flex-col items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors p-2 rounded-md hover:bg-emerald-50"
                                            >
                                                <CheckCircle size={20} />
                                                <span className="text-[10px] uppercase font-bold">Verify</span>
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(report.id, 'rejected')}
                                                className="flex flex-col items-center gap-1 text-red-600 hover:text-red-700 transition-colors p-2 rounded-md hover:bg-red-50"
                                            >
                                                <XCircle size={20} />
                                                <span className="text-[10px] uppercase font-bold">Reject</span>
                                            </button>
                                        </>
                                    )}
                                    {report.status === 'verified' && (
                                        <button
                                            onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                            className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-md hover:bg-blue-50"
                                        >
                                            <CheckCircle size={20} />
                                            <span className="text-[10px] uppercase font-bold">Resolve</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onStatusUpdate={(id, newStatus) => {
                        handleStatusUpdate(id, newStatus);
                        setSelectedReport(null);
                    }}
                />
            )}
        </div>
    );
}
