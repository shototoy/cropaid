import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function PhotoUpload({ photoBase64, onPhotoChange, label = "Photo Evidence" }) {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            onPhotoChange(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        onPhotoChange(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-3">{label}</label>

            {photoBase64 ? (
                <div className="relative">
                    <img
                        src={photoBase64}
                        alt="Evidence preview"
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-md transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {/* Camera Button */}
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all shadow-sm group"
                    >
                        <div className="p-3 bg-gray-100 rounded-full mb-2 group-hover:bg-green-100 transition-colors">
                            <Camera size={24} className="text-gray-600 group-hover:text-green-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-green-700">Camera</span>
                    </button>

                    {/* Gallery Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm group"
                    >
                        <div className="p-3 bg-gray-100 rounded-full mb-2 group-hover:bg-blue-100 transition-colors">
                            <ImageIcon size={24} className="text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Gallery</span>
                    </button>

                    {/* Hidden Inputs */}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={cameraInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            )}
        </div>
    );
}
