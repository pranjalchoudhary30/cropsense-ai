"""
Real Weather Service — uses Open-Meteo API (100% free, no API key needed)
Provides current conditions + 7-day forecast for any India location.
"""
import httpx
import math
from app.services.india_mandi_data import CITY_STATE_MAP, get_state_from_location

# City → (lat, lon) for major Indian cities
INDIA_CITY_COORDS = {
    "delhi": (28.6139, 77.2090), "new delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777), "pune": (18.5204, 73.8567),
    "bangalore": (12.9716, 77.5946), "bengaluru": (12.9716, 77.5946),
    "hyderabad": (17.3850, 78.4867), "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639), "ahmedabad": (23.0225, 72.5714),
    "surat": (21.1702, 72.8311), "jaipur": (26.9124, 75.7873),
    "lucknow": (26.8467, 80.9462), "kanpur": (26.4499, 80.3319),
    "nagpur": (21.1458, 79.0882), "bhopal": (23.2599, 77.4126),
    "indore": (22.7196, 75.8577), "ludhiana": (30.9010, 75.8573),
    "agra": (27.1767, 78.0081), "varanasi": (25.3176, 82.9739),
    "patna": (25.5941, 85.1376), "amritsar": (31.6340, 74.8723),
    "karnal": (29.6857, 76.9905), "hisar": (29.1492, 75.7217),
    "jodhpur": (26.2389, 73.0243), "kota": (25.2138, 75.8648),
    "guntur": (16.3067, 80.4365), "vijayawada": (16.5062, 80.6480),
    "visakhapatnam": (17.6868, 83.2185), "vizag": (17.6868, 83.2185),
    "coimbatore": (11.0168, 76.9558), "madurai": (9.9252, 78.1198),
    "nashik": (20.0059, 73.7897), "vadodara": (22.3072, 73.1812),
    "rajkot": (22.3039, 70.8022), "mysore": (12.2958, 76.6394),
    "guwahati": (26.1445, 91.7362), "bhubaneswar": (20.2961, 85.8245),
    "ranchi": (23.3441, 85.3096), "dehradun": (30.3165, 78.0322),
    "shimla": (31.1048, 77.1734), "raipur": (21.2514, 81.6296),
    "siliguri": (26.7271, 88.3953), "warangal": (17.9784, 79.5941),
    "kochi": (9.9312, 76.2673), "thiruvananthapuram": (8.5241, 76.9366),
    "trivandrum": (8.5241, 76.9366), "meerut": (28.9845, 77.7064),
    "gwalior": (26.2183, 78.1828), "jabalpur": (23.1815, 79.9864),
    "bareilly": (28.3670, 79.4304), "allahabad": (25.4358, 81.8463),
    "prayagraj": (25.4358, 81.8463), "gorakhpur": (26.7606, 83.3732),
    "howrah": (22.5958, 88.2636), "bikaner": (28.0229, 73.3119),
    "ujjain": (23.1828, 75.7772), "haridwar": (29.9457, 78.1642),
    "mathura": (27.4924, 77.6737), "hubli": (15.3647, 75.1240),
    "belagavi": (15.8497, 74.4977), "davangere": (14.4644, 75.9218),
}

WMO_DESCRIPTIONS = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
    61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Light snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Heavy thunderstorm",
}

def wmo_to_description(code: int) -> str:
    return WMO_DESCRIPTIONS.get(code, "Partly cloudy")

def get_uv_index(lat: float) -> int:
    """Estimate UV index from latitude (India-specific)."""
    abs_lat = abs(lat)
    if abs_lat < 15: return 11
    if abs_lat < 20: return 9
    if abs_lat < 25: return 8
    if abs_lat < 30: return 7
    return 6

def get_city_coords(location: str):
    """Resolve location string to (lat, lon)."""
    loc = location.lower().strip()
    # Exact match
    for city, coords in INDIA_CITY_COORDS.items():
        if city in loc:
            return coords, city.title()
    # Partial first-word match
    first = loc.split(",")[0].strip()
    for city, coords in INDIA_CITY_COORDS.items():
        if first in city or city.startswith(first[:4]):
            return coords, city.title()
    # Default to Bhopal (central India)
    return (23.2599, 77.4126), "Central India"


class WeatherService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    async def get_weather(self, location: str) -> dict:
        (lat, lon), resolved_city = get_city_coords(location)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(self.BASE_URL, params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation",
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max",
                    "timezone": "Asia/Kolkata",
                    "forecast_days": 7,
                })
                resp.raise_for_status()
                data = resp.json()

            current = data.get("current", {})
            daily = data.get("daily", {})

            temp = round(current.get("temperature_2m", 28.5), 1)
            humidity = int(current.get("relative_humidity_2m", 65))
            wind_speed = round(current.get("wind_speed_10m", 12), 1)
            precip = round(current.get("precipitation", 0), 1)
            weather_code = int(current.get("weather_code", 1))
            description = wmo_to_description(weather_code)
            uv_index = get_uv_index(lat)

            # 7-day forecast
            forecast = []
            dates = daily.get("time", [])
            max_temps = daily.get("temperature_2m_max", [])
            min_temps = daily.get("temperature_2m_min", [])
            precip_sums = daily.get("precipitation_sum", [])
            daily_codes = daily.get("weather_code", [])
            for i in range(min(7, len(dates))):
                forecast.append({
                    "date": dates[i],
                    "temp_max": round(max_temps[i], 1) if max_temps else temp + 2,
                    "temp_min": round(min_temps[i], 1) if min_temps else temp - 4,
                    "precipitation": round(precip_sums[i], 1) if precip_sums else 0,
                    "description": wmo_to_description(int(daily_codes[i])) if daily_codes else description,
                })

            return {
                "temperature": temp,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "rainfall_forecast": f"{precip}mm today",
                "description": description,
                "weather_code": weather_code,
                "uv_index": uv_index,
                "resolved_city": resolved_city,
                "lat": lat,
                "lon": lon,
                "forecast": forecast,
            }

        except Exception as e:
            # Graceful fallback with seasonal estimates
            return self._fallback_weather(location, lat, lon, resolved_city)

    def _fallback_weather(self, location: str, lat: float, lon: float, city: str) -> dict:
        import datetime as dt_module
        month = dt_module.datetime.utcnow().month
        # Seasonal temp/humidity for India
        seasonal_temp = [22, 24, 28, 34, 38, 35, 31, 30, 30, 28, 24, 21]
        seasonal_hum  = [55, 50, 45, 40, 45, 70, 80, 82, 78, 65, 55, 55]
        seasonal_rain = [2, 3, 5, 8, 15, 50, 120, 110, 80, 25, 8, 3]

        temp = seasonal_temp[month - 1]
        humidity = seasonal_hum[month - 1]
        rain = seasonal_rain[month - 1]
        desc = "Mostly Sunny" if humidity < 60 else ("Partly Cloudy" if humidity < 75 else "Light Rain")

        return {
            "temperature": float(temp),
            "humidity": humidity,
            "wind_speed": 14.0,
            "rainfall_forecast": f"{rain}mm",
            "description": desc,
            "weather_code": 1,
            "uv_index": get_uv_index(lat),
            "resolved_city": city,
            "lat": lat,
            "lon": lon,
            "forecast": [],
        }
