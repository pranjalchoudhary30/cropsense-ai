import React from 'react';
import { Cloud, Droplets, ThermometerSun } from 'lucide-react';

const WeatherCard = ({ data }) => {
    if (!data) return null;

    return (
        <div className="bg-gradient-to-br from-ocean-500 to-ocean-900 p-6 rounded-2xl shadow-md text-white">
            <h3 className="text-lg font-medium opacity-90 flex items-center mb-4">
                <Cloud className="w-5 h-5 mr-2" />
                Weather Forecast
            </h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                    <ThermometerSun className="w-8 h-8 mb-2 opacity-80" />
                    <span className="text-2xl font-bold">{data.temperature}°C</span>
                    <span className="text-xs opacity-70">Temperature</span>
                </div>
                <div className="flex flex-col items-center">
                    <Droplets className="w-8 h-8 mb-2 opacity-80" />
                    <span className="text-2xl font-bold">{data.humidity}%</span>
                    <span className="text-xs opacity-70">Humidity</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                    <Cloud className="w-8 h-8 mb-2 opacity-80" />
                    <span className="text-xl font-bold">{data.rainfall_forecast}</span>
                    <span className="text-xs opacity-70">Rainfall</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
