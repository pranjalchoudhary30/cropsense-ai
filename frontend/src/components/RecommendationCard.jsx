import React from 'react';
import { Store, TrendingUp, AlertCircle } from 'lucide-react';

const RecommendationCard = ({ recommendation, spoilage }) => {
    if (!recommendation) return null;

    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-nature-50 rounded-bl-full -z-10 opacity-50"></div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
                    <Store className="w-5 h-5 mr-2 text-nature-500" />
                    Best Market to Sell
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-1">Recommended Mandi</p>
                    <p className="text-2xl font-bold text-slate-800">{recommendation.best_mandi}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Expected Price</p>
                        <p className="text-lg font-semibold text-nature-600 flex items-center">
                            ₹{recommendation.predicted_price} <TrendingUp className="w-4 h-4 ml-1" />
                        </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Est. Profit</p>
                        <p className="text-lg font-semibold text-slate-800">₹{recommendation.expected_profit}</p>
                    </div>
                </div>

                <p className="text-sm text-slate-600 bg-nature-50 p-3 rounded-lg border border-nature-100">
                    <span className="font-medium text-nature-700">Why?</span> {recommendation.explanation}
                </p>
            </div>

            {spoilage && (
                <div className={`p-4 rounded-xl border flex items-start ${spoilage.risk_level === 'High'
                        ? 'bg-red-50 border-red-100 text-red-800'
                        : 'bg-amber-50 border-amber-100 text-amber-800'
                    }`}>
                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-sm">Spoilage Risk: {spoilage.risk_level} ({Math.round(spoilage.spoilage_probability * 100)}%)</p>
                        <p className="text-xs mt-1 opacity-90">{spoilage.suggestion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationCard;
