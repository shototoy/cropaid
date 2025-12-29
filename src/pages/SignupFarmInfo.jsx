import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SignupFarmInfo() {
    const navigate = useNavigate();
    const location = useLocation();
    const prevData = location.state || {};

    const [formData, setFormData] = useState({
        ...prevData,
        sitio: '',
        barangay: '',
        municipality: '',
        province: '',
        boundaryNorth: '',
        boundarySouth: '',
        boundaryEast: '',
        boundaryWest: '',
        isConfirmed: false
    });

    const handleNext = () => {
        if (!formData.isConfirmed) {
            alert("Please confirm the information is true and correct.");
            return;
        }
        navigate('/signup/app-info', { state: formData });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header title="Sign Up – FARM" showBack />

            <div className="flex-1 p-5 flex flex-col">
                <div className="mb-4 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-center mb-4 uppercase tracking-wide">Farm Location</h3>
                    <Input label="Sitio/Purok" value={formData.sitio} onChange={(e) => setFormData({ ...formData, sitio: e.target.value })} />
                    <Input label="Barangay" value={formData.barangay} onChange={(e) => setFormData({ ...formData, barangay: e.target.value })} />
                    <Input label="Municipality" value={formData.municipality} onChange={(e) => setFormData({ ...formData, municipality: e.target.value })} />
                    <Input label="Province" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} />
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-center mb-4 uppercase tracking-wide">Boundaries</h3>
                    <Input label="North" value={formData.boundaryNorth} onChange={(e) => setFormData({ ...formData, boundaryNorth: e.target.value })} />
                    <Input label="South" value={formData.boundarySouth} onChange={(e) => setFormData({ ...formData, boundarySouth: e.target.value })} />
                    <Input label="East" value={formData.boundaryEast} onChange={(e) => setFormData({ ...formData, boundaryEast: e.target.value })} />
                    <Input label="West" value={formData.boundaryWest} onChange={(e) => setFormData({ ...formData, boundaryWest: e.target.value })} />
                </div>

                <div className="mb-8 px-2">
                    <label className="flex items-start text-xs font-bold leading-tight cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={formData.isConfirmed}
                            onChange={(e) => setFormData({ ...formData, isConfirmed: e.target.checked })}
                            className="mt-0.5 mr-2 accent-primary h-4 w-4"
                        />
                        I hereby certify that the above information are true and correct to the best of my knowledge.
                    </label>
                </div>

                <div className="mb-8 text-center">
                    <Button variant="secondary" onClick={handleNext} className="w-auto px-10 mx-auto shadow-md text-black">
                        NEXT
                    </Button>
                </div>
            </div>
        </div>
    );
}
