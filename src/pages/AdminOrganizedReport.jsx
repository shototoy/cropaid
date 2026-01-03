
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Home, FileText } from 'lucide-react';

export default function AdminOrganizedReport() {
    const navigate = useNavigate();

    const reports = [
        { id: 1, farmer: 'Juan Dela Cruz', location: 'Purok 1, San Jose', farmArea: '2.5 ha', affectedArea: '1.0 ha', crop: 'Rice', stage: 'Vegetative', cause: 'Pest Infestation', pestType: 'Rodents' },
        { id: 2, farmer: 'Pedro Penduko', location: 'Purok 2, San Miguel', farmArea: '3.0 ha', affectedArea: '3.0 ha', crop: 'Corn', stage: 'Flowering', cause: 'Flooding', pestType: 'N/A' }
    ];

    return (
        <div className="p-4 min-h-screen bg-gray-50 flex flex-col">
            <h1 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="text-primary" size={24} />
                Organized Report Summary
            </h1>

            {/* Desktop Table View */}
            <div className="hidden lg:block flex-1 overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Name of Farmer</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Location</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Farm Area</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Affected Area</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Crop</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Stage</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Cause</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Pest Type</th>
                            <th className="p-3 border border-gray-200 text-left text-sm font-semibold">Proof</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="p-3 border border-gray-200 text-sm">{r.farmer}</td>
                                <td className="p-3 border border-gray-200 text-sm">{r.location}</td>
                                <td className="p-3 border border-gray-200 text-sm">{r.farmArea}</td>
                                <td className="p-3 border border-gray-200 text-sm">{r.affectedArea}</td>
                                <td className="p-3 border border-gray-200 text-sm">{r.crop}</td>
                                <td className="p-3 border border-gray-200 text-sm">{r.stage}</td>
                                <td className="p-3 border border-gray-200 text-sm">{r.cause}</td>
                                <td className="p-3 border border-gray-200 text-sm">{r.pestType}</td>
                                <td className="p-3 border border-gray-200 text-sm text-primary hover:underline cursor-pointer">View</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden flex-1 space-y-3">
                {reports.map((r) => (
                    <div key={r.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-gray-800">{r.farmer}</h3>
                                <p className="text-xs text-gray-500">{r.location}</p>
                            </div>
                            <button className="text-primary text-xs font-medium hover:underline">View Proof</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-gray-500">Farm Area:</span>
                                <span className="ml-1 font-medium">{r.farmArea}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Affected:</span>
                                <span className="ml-1 font-medium">{r.affectedArea}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Crop:</span>
                                <span className="ml-1 font-medium">{r.crop}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Stage:</span>
                                <span className="ml-1 font-medium">{r.stage}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500">Cause:</span>
                                <span className="ml-1 font-medium">{r.cause}</span>
                                {r.pestType !== 'N/A' && <span className="text-gray-500 ml-2">({r.pestType})</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                    <Download size={18} />
                    Download Report
                </button>
                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                >
                    <Home size={18} />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
