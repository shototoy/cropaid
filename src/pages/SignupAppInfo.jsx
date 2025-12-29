import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SignupAppInfo() {
    const navigate = useNavigate();
    const location = useLocation();
    const prevData = location.state || {}; // Actually this is the last step now

    // Merge previous data with local state if needed for final submission
    // But this component was originally Step 1.
    // We will treat it as "App Info" step.

    const [formData, setFormData] = useState({
        ...prevData,
        email: '',
        rsbsa: '',
        password: ''
    });

    const handleSignIn = () => {
        // Here we would typically submit 'formData' to the backend
        console.log("Submitting Full Registration Data:", formData);
        alert("Registration Successful!");
        navigate('/login');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header title="Sign Up – App Information" showBack />

            <div className="flex-1 p-5 flex flex-col justify-center">
                <div className="flex flex-col gap-4 mb-8">
                    <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <Input label="RSBSA Number" value={formData.rsbsa} onChange={(e) => setFormData({ ...formData, rsbsa: e.target.value })} />
                    <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>

                <div className="text-center">
                    <Button variant="secondary" onClick={handleSignIn} className="w-auto px-10 mx-auto shadow-md text-black">
                        SIGN-IN
                    </Button>
                </div>
            </div>
        </div>
    );
}
