import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { predictPrice, getWeather, recommendMarket, getSpoilageRisk } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [crop, setCrop] = useState('Wheat (Triticum aestivum)');
    const [location, setLocation] = useState('Punjab, India');

    const [weatherData, setWeatherData] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [recommendationData, setRecommendationData] = useState(null);
    const [spoilageData, setSpoilageData] = useState(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [weather, prediction, recommendation, spoilage] = await Promise.all([
                getWeather(location).catch(() => null),
                predictPrice(crop, location),
                recommendMarket(crop, location),
                getSpoilageRisk({ temperature: 30, humidity: 75, storage_type: 'normal', transit_days: 2 })
            ]);

            setWeatherData(weather);
            setPredictionData(prediction);
            setRecommendationData(recommendation);
            setSpoilageData(spoilage);

        } catch (err) {
            console.error(err);
            setError("Failed to fetch insights.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="text-primary size-8">
                            <span className="material-symbols-outlined !text-[32px] filled">eco</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CropSense AI</h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
                        </button>
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-border-light dark:border-border-dark">
                                <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
                                    <span className="font-bold text-xs uppercase">{user?.name ? user.name.charAt(0) : 'U'}</span>
                                </div>
                                <span className="text-sm font-medium pr-1">{user?.name || 'User'}</span>
                            </button>

                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                                <div className="px-4 py-2 border-b border-border-light dark:border-border-dark">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">
                        {error}
                    </div>
                )}

                {/* Controls Section */}
                <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Crop</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">grass</span>
                                </div>
                                <select
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                    className="form-select block w-full pl-10 pr-10 py-3 text-base border-border-light dark:border-border-dark bg-white dark:bg-surface-dark rounded-lg focus:ring-primary focus:border-primary transition-shadow"
                                >
                                    <option>Wheat (Triticum aestivum)</option>
                                    <option>Corn (Maize)</option>
                                    <option>Rice (Paddy)</option>
                                    <option>Soybean</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">location_on</span>
                                </div>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter region or city"
                                    className="form-input block w-full pl-10 pr-4 py-3 text-base border-border-light dark:border-border-dark bg-white dark:bg-surface-dark rounded-lg focus:ring-primary focus:border-primary transition-shadow placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading}
                                className="w-full md:w-auto px-8 py-3 bg-[#1565C0] hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined">psychology</span>
                                )}
                                {isLoading ? 'Predicting...' : 'Predict'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (Weather & Price) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Weather Forecast Card */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-background-light/50 dark:bg-background-dark/50">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">partly_cloudy_day</span>
                                    Weather Forecast
                                </h3>
                                <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Live</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                                            {weatherData ? `${weatherData.temperature}°C` : '28°C'}
                                        </p>
                                        <p className="text-slate-500 dark:text-slate-400">Mostly Sunny</p>
                                    </div>
                                    <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl text-blue-500">sunny</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                                        <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <span className="material-symbols-outlined">humidity_percentage</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Humidity</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {weatherData ? `${weatherData.humidity}%` : '65%'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                                        <div className="size-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                            <span className="material-symbols-outlined">water_drop</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Rainfall</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {weatherData ? weatherData.rainfall_forecast : '12mm'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Prediction Card */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm flex-1">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-background-light/50 dark:bg-background-dark/50">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">trending_up</span>
                                    Price Prediction
                                </h3>
                                <div className="flex gap-1">
                                    <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="size-2 rounded-full bg-primary"></span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-end gap-2 mb-4">
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                        ₹{predictionData?.predicted_prices?.[6] || '2,450'}
                                    </p>
                                    <p className="text-green-600 dark:text-green-400 font-medium mb-1 flex items-center text-sm">
                                        <span className="material-symbols-outlined text-base">arrow_upward</span>
                                        +8.4%
                                    </p>
                                    <span className="text-slate-400 text-sm mb-1 ml-auto">/ Quintal</span>
                                </div>
                                {/* Chart Placeholder */}
                                <div className="h-48 w-full bg-gradient-to-b from-primary/5 to-transparent rounded-lg border border-border-light dark:border-border-dark relative overflow-hidden group">
                                    <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 50">
                                        <path className="text-primary" d="M0 45 C 20 40, 40 48, 60 25 S 80 10, 100 5" fill="none" stroke="currentColor" strokeWidth="2"></path>
                                        <circle className="fill-primary" cx="100" cy="5" r="2"></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-20 pointer-events-none">
                                        <div className="w-full h-px bg-slate-400 border-dashed border-b"></div>
                                        <div className="w-full h-px bg-slate-400 border-dashed border-b"></div>
                                        <div className="w-full h-px bg-slate-400 border-dashed border-b"></div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white dark:bg-surface-dark shadow-sm px-2 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-300 border border-border-light dark:border-border-dark">
                                        Projected High
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                                    <span>Today</span>
                                    <span>+7 Days</span>
                                    <span>+14 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Recommendation & AI) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* Best Mandi Recommendation */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <span className="material-symbols-outlined !text-[120px]">storefront</span>
                            </div>
                            <div className="px-6 py-5 border-b border-border-light dark:border-border-dark bg-primary/5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                                            Best Mandi Opportunity
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Optimal market selection based on distance & price.</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                                        <span className="material-symbols-outlined text-base">verified</span>
                                        94% Confidence
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    {/* Mandi Image/Map Placeholder */}
                                    <div className="w-full sm:w-1/3 aspect-video sm:aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                                        <img alt="Map showing Mandi location" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuk5gs7HN3JaGIqMEn7oIbLu4JGVSqaNqxJ2mF3-ivQvoHCrp65hrwlUOa1LH0KWBN31zHpGq4YWgoUbLpw6hGSoSTwVSuWG4ZV4gyVEtiBVGQ984AK_DEKlaqoZ61QspKyByAx1XPbGWeGbhbrrQX1akKr832_sPTAO75EmtxOiR4wy4Qrw8mUHKqGEWkpNvNj09_h80c6Hf0dYWH0GZE8thTUeNBPOVBrIOPZB2m58a1FD5rtK2YkZUPkxX9SebYGnxbCHULic0" />
                                        <div className="absolute inset-0 bg-black/10"></div>
                                        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">
                                            24km Away
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                                                {recommendationData ? recommendationData.best_mandi.split(',')[0] : 'Khanna Main Mandi'}
                                            </h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                {recommendationData ? recommendationData.best_mandi : 'GT Road, Khanna, Punjab'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg border border-border-light dark:border-border-dark">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Predicted Price</p>
                                                <p className="text-xl font-bold text-primary">
                                                    ₹{recommendationData ? recommendationData.predicted_price : '2,450'}
                                                    <span className="text-sm font-normal text-slate-400">/qt</span>
                                                </p>
                                            </div>
                                            <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg border border-border-light dark:border-border-dark">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Exp. Profit/Acre</p>
                                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                    ₹{recommendationData ? recommendationData.expected_profit : '18,500'}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors text-sm flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined">navigation</span>
                                            Navigate to Mandi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Explanation Card */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm flex-1">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
                                    AI Insights
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex gap-4">
                                    <div className="shrink-0 pt-1">
                                        <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                            <span className="material-symbols-outlined text-lg">smart_toy</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                            <p>
                                                {recommendationData ? recommendationData.explanation : 'Based on historical trends and current demand spikes in the Ludhiana region, Khanna Mandi is showing a 12% higher rate compared to local averages. The upcoming rainfall predicted in 3 days might disrupt logistics, suggesting an optimal selling window within the next 48 hours to maximize profit.'}
                                            </p>
                                        </div>

                                        {spoilageData && (
                                            <div className={`mt-4 p-3 rounded-lg border flex items-start ${spoilageData.risk_level === 'High'
                                                ? 'bg-red-50 border-red-100 text-red-800'
                                                : 'bg-amber-50 border-amber-100 text-amber-800'
                                                }`}>
                                                <span className="material-symbols-outlined w-5 h-5 mr-3 mt-0.5 flex-shrink-0">warning</span>
                                                <div>
                                                    <p className="font-medium text-sm">Spoilage Risk: {spoilageData.risk_level} ({Math.round(spoilageData.spoilage_probability * 100)}%)</p>
                                                    <p className="text-xs mt-1 opacity-90">{spoilageData.suggestion}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded border border-slate-200 dark:border-slate-700">Demand Spike</span>
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded border border-slate-200 dark:border-slate-700">Weather Risk</span>
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded border border-slate-200 dark:border-slate-700">Historical High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
