import React, { useState } from 'react';
import { Leaf, MapPin } from 'lucide-react';

const CropForm = ({ onSubmit, isLoading }) => {
    const [crop, setCrop] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (crop && location) {
            onSubmit({ crop, location });
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
                <Leaf className="w-5 h-5 mr-2 text-nature-500" />
                Crop Details
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Crop Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-nature-500 focus:border-transparent transition-all"
                        placeholder="e.g., Wheat, Rice, Tomato"
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Your Location</label>
                    <div className="relative">
                        <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-nature-500 focus:border-transparent transition-all"
                            placeholder="e.g., Punjab, Maharashtra"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-nature-600 hover:bg-nature-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center"
                >
                    {isLoading ? 'Analyzing...' : 'Get Insights'}
                </button>
            </form>
        </div>
    );
};

export default CropForm;
