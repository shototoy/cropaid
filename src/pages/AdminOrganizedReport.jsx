import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Home, FileText, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function AdminOrganizedReport() {
    const navigate = useNavigate();
    const reportRef = useRef(null);
    const [exporting, setExporting] = React.useState(false);

    const reports = [
        { id: 1, farmer: 'Juan Dela Cruz', location: 'Purok 1, San Jose', farmArea: '2.5 ha', affectedArea: '1.0 ha', crop: 'Rice', stage: 'Vegetative', cause: 'Pest Infestation', pestType: 'Rodents' },
        { id: 2, farmer: 'Pedro Penduko', location: 'Purok 2, San Miguel', farmArea: '3.0 ha', affectedArea: '3.0 ha', crop: 'Corn', stage: 'Flowering', cause: 'Flooding', pestType: 'N/A' }
    ];

    const handleDownload = async () => {
        if (!reportRef.current) return;
        setExporting(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // Retain high quality
                logging: false,
                useCORS: true
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `Organized_Report_Summary_${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export report.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="p-4 min-h-screen bg-gray-50 flex flex-col items-center">
            {}
            <div className="w-full max-w-[816px] flex flex-col sm:flex-row gap-3 mb-6">
                <button
                    onClick={handleDownload}
                    disabled={exporting}
                    className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                    {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {exporting ? 'Exporting...' : 'Download as PNG'}
                </button>
                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                >
                    <Home size={18} />
                    Back to Dashboard
                </button>
            </div>

            {}
            <div
                ref={reportRef}
                id="report-summary-export"
                className="bg-white shadow-xl p-8 w-full max-w-[816px] min-h-[1056px] text-gray-800"
                style={{ aspectRatio: '8.5/11' }}
            >
                <div className="mb-8 border-b-2 border-primary pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
                            <FileText size={28} />
                            CropAid
                        </h1>
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-1">Organized Report Summary</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">Date Generated</p>
                        <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="overflow-hidden bg-white">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-200">
                                <th className="p-3 text-xs font-bold uppercase text-gray-600">Farmer</th>
                                <th className="p-3 text-xs font-bold uppercase text-gray-600">Location</th>
                                <th className="p-3 text-xs font-bold uppercase text-gray-600 text-right">Area (Ha)</th>
                                <th className="p-3 text-xs font-bold uppercase text-gray-600 text-right">Affected</th>
                                <th className="p-3 text-xs font-bold uppercase text-gray-600">Crop / Stage</th>
                                <th className="p-3 text-xs font-bold uppercase text-gray-600">Cause</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reports.map((r, index) => (
                                <tr key={r.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className="p-3 text-sm font-medium text-gray-900">{r.farmer}</td>
                                    <td className="p-3 text-sm text-gray-600">{r.location}</td>
                                    <td className="p-3 text-sm text-gray-600 text-right">{r.farmArea}</td>
                                    <td className="p-3 text-sm font-bold text-red-600 text-right">{r.affectedArea}</td>
                                    <td className="p-3 text-sm text-gray-600">
                                        <div className="font-medium">{r.crop}</div>
                                        <div className="text-xs text-gray-400">{r.stage}</div>
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        <span className="font-medium">{r.cause}</span>
                                        {r.pestType !== 'N/A' && <span className="block text-xs italic text-gray-500">{r.pestType}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-center text-gray-400">
                    <p>Generated by CropAid System • {new Date().toLocaleString()}</p>
                </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">Preview of Letter Size (8.5" x 11") Layout</p>
        </div>
    );
}
