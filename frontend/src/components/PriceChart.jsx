import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const PriceChart = ({ data }) => {
    if (!data || !data.predicted_prices) return null;

    // Generate mock dates for the next 7 days based on the 7 data points
    const chartData = data.predicted_prices.map((price, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            price: price
        };
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-nature-500" />
                    Price Forecast (7 Days)
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">Trend:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${data.trend === 'upward' ? 'bg-nature-100 text-nature-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {data.trend.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">({Math.round(data.confidence_score * 100)}% conf)</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['auto', 'auto']} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`₹${value}`, 'Predicted Price']}
                        />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#16a34a"
                            strokeWidth={3}
                            dot={{ stroke: '#16a34a', strokeWidth: 2, r: 4, fill: '#fff' }}
                            activeDot={{ r: 6, fill: '#16a34a' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceChart;
