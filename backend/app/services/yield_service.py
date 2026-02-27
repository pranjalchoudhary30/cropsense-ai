"""
Yield & Profit Prediction Engine.

Logic flow:
  1. Fetch real-time weather for the given coordinates.
  2. Look up crop knowledge-base (base yield, ideal conditions, MSP price, costs).
  3. Compute adjustment factors from weather + soil + irrigation.
  4. Return structured prediction with profit/loss and risk level.
"""
import hashlib
import math
import httpx
from datetime import datetime
from typing import Optional

from app.config import settings
from app.models.yield_model import (
    YieldPredictionRequest,
    YieldPredictionResult,
    WeatherData,
)


# ── Crop Knowledge Base ───────────────────────────────────────────────────────
# All yield values are in metric tonnes per acre (season average for India).
# MSP / market prices in ₹ per tonne (approx 2024-25 values).
CROP_DB = {
    "wheat": {
        "display": "Wheat",
        "base_yield_acre": 1.8,          # tonnes/acre
        "ideal_temp": (15, 25),          # °C
        "ideal_rainfall": (300, 500),    # mm/season
        "soil_bonus": {"alluvial": 0.15, "black": 0.08, "clay": 0.05, "red": -0.05, "sandy": -0.15},
        "msp_price": 23850,              # ₹/tonne
        "seed_cost_acre": 1500,
        "fertilizer_cost_acre": 5000,
        "labor_cost_acre": 4000,
        "irrigation_bonus": 0.18,
    },
    "rice": {
        "display": "Rice",
        "base_yield_acre": 2.0,
        "ideal_temp": (22, 32),
        "ideal_rainfall": (900, 1500),
        "soil_bonus": {"alluvial": 0.15, "clay": 0.10, "black": 0.05, "red": 0.0, "sandy": -0.20},
        "msp_price": 23100,
        "seed_cost_acre": 1200,
        "fertilizer_cost_acre": 5500,
        "labor_cost_acre": 5000,
        "irrigation_bonus": 0.20,
    },
    "cotton": {
        "display": "Cotton",
        "base_yield_acre": 0.5,
        "ideal_temp": (25, 35),
        "ideal_rainfall": (600, 900),
        "soil_bonus": {"black": 0.20, "alluvial": 0.08, "red": 0.05, "clay": -0.05, "sandy": -0.10},
        "msp_price": 70060,              # ₹/tonne (long staple)
        "seed_cost_acre": 2000,
        "fertilizer_cost_acre": 4500,
        "labor_cost_acre": 5500,
        "irrigation_bonus": 0.15,
    },
    "soybean": {
        "display": "Soybean",
        "base_yield_acre": 0.75,
        "ideal_temp": (20, 30),
        "ideal_rainfall": (450, 700),
        "soil_bonus": {"black": 0.12, "alluvial": 0.08, "clay": 0.05, "red": 0.0, "sandy": -0.10},
        "msp_price": 49300,
        "seed_cost_acre": 2500,
        "fertilizer_cost_acre": 3000,
        "labor_cost_acre": 3000,
        "irrigation_bonus": 0.12,
    },
    "tomato": {
        "display": "Tomato",
        "base_yield_acre": 8.0,
        "ideal_temp": (18, 27),
        "ideal_rainfall": (400, 600),
        "soil_bonus": {"alluvial": 0.15, "red": 0.10, "black": 0.05, "clay": -0.05, "sandy": 0.05},
        "msp_price": 8000,               # ₹/tonne (market avg)
        "seed_cost_acre": 3000,
        "fertilizer_cost_acre": 6000,
        "labor_cost_acre": 8000,
        "irrigation_bonus": 0.25,
    },
    "maize": {
        "display": "Maize",
        "base_yield_acre": 1.8,
        "ideal_temp": (18, 27),
        "ideal_rainfall": (500, 800),
        "soil_bonus": {"alluvial": 0.12, "black": 0.08, "red": 0.05, "clay": -0.05, "sandy": -0.10},
        "msp_price": 22000,
        "seed_cost_acre": 2000,
        "fertilizer_cost_acre": 4000,
        "labor_cost_acre": 3500,
        "irrigation_bonus": 0.15,
    },
    "sugarcane": {
        "display": "Sugarcane",
        "base_yield_acre": 35.0,
        "ideal_temp": (25, 35),
        "ideal_rainfall": (1200, 1800),
        "soil_bonus": {"alluvial": 0.15, "black": 0.10, "clay": 0.05, "red": -0.05, "sandy": -0.15},
        "msp_price": 3400,               # ₹/tonne (FRP)
        "seed_cost_acre": 4000,
        "fertilizer_cost_acre": 7000,
        "labor_cost_acre": 8000,
        "irrigation_bonus": 0.20,
    },
}

# ── Soil type name normaliser ─────────────────────────────────────────────────
SOIL_KEY_MAP = {
    "black soil": "black",
    "black": "black",
    "red soil": "red",
    "red": "red",
    "alluvial": "alluvial",
    "alluvial soil": "alluvial",
    "sandy": "sandy",
    "sandy soil": "sandy",
    "clay": "clay",
    "clay soil": "clay",
}

# ── Recommendation knowledge base ─────────────────────────────────────────────
CROP_TIPS = {
    "wheat":     ["Sow between mid-October and mid-November for best yield.",
                  "Apply Urea in 3 split doses (basal, CRI, heading).",
                  "Irrigate at CRI, tillering, jointing, flowering & grain filling.",
                  "Monitor for yellow rust — apply Propiconazole at first sign."],
    "rice":      ["Transplant 25-day old seedlings at 20×15 cm spacing.",
                  "Maintain 5 cm water during tillering; drain before harvest.",
                  "Apply potassium to strengthen stalks and reduce lodging.",
                  "Scout for blast during booting — spray Tricyclazole if needed."],
    "cotton":    ["Sow BT hybrid seeds in black soil for maximum boll count.",
                  "Apply Nitrogen in 3 splits; avoid excess N after flowering.",
                  "Spray Spinosad for bollworm control at early instar stage.",
                  "Pick cotton at 60% boll opening for best fibre quality."],
    "soybean":   ["Treat seed with Rhizobium + PSB culture before sowing.",
                  "Sow at 45×5 cm spacing; ideal soil temp > 18°C.",
                  "Scout for girdle beetle at seedling stage — use light traps.",
                  "Harvest when 95% pods turn brown (avoid yield losses)."],
    "tomato":    ["Transplant into raised beds; mulch with black polythene.",
                  "Train plants on stakes or net; remove suckers weekly.",
                  "Drip-irrigate at 80% ET; avoid water stress at fruit set.",
                  "Apply Calcium nitrate spray to prevent blossom end rot."],
    "maize":     ["Sow at 60×20 cm; ensure soil temp > 15°C.",
                  "Apply Zinc sulphate @ 25 kg/ha to prevent deficiency.",
                  "Spray Emamectin Benzoate into whorl for Fall Armyworm control.",
                  "Harvest at 25–30% grain moisture; dry to 12–14% before storage."],
    "sugarcane": ["Use disease-free sets treated with Carbendazim before planting.",
                  "Apply Trash mulching to conserve soil moisture.",
                  "Earth up at 45 and 90 days to prevent lodging.",
                  "Intercrop with legumes (soybean/cowpea) in the first 60 days."],
}


# ── Weather Fetch ─────────────────────────────────────────────────────────────
async def _fetch_weather(lat: float, lon: float) -> WeatherData:
    """Fetch current weather from OpenWeatherMap; fall back to mock if key missing."""
    api_key = getattr(settings, "openweather_api_key", None)

    if api_key:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        )
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                d = resp.json()
                return WeatherData(
                    temperature=d["main"]["temp"],
                    humidity=d["main"]["humidity"],
                    rainfall_forecast=_estimate_seasonal_rainfall(d),
                    wind_speed=d["wind"]["speed"],
                    description=d["weather"][0]["description"].title(),
                )
        except Exception:
            pass  # fall through to mock

    # ── Deterministic mock based on coordinates ──
    return _mock_weather(lat, lon)


def _estimate_seasonal_rainfall(owm_data: dict) -> float:
    """Estimate seasonal rainfall from OWM current rain data (1h) * season multiplier."""
    rain_1h = owm_data.get("rain", {}).get("1h", 0)
    return round(rain_1h * 4320, 1)   # 4320 = hours in 6-month season


def _mock_weather(lat: float, lon: float) -> WeatherData:
    """Deterministic mock weather using geographic position."""
    # Use lat/lon hash for variety
    seed = int(hashlib.md5(f"{lat:.2f}{lon:.2f}".encode()).hexdigest(), 16) % 1000

    # Temperature: warmer in southern lat, cooler in northern
    base_temp = 20 + (20 - abs(lat)) * 0.5 + (seed % 8) - 4
    temperature = round(max(10, min(42, base_temp)), 1)

    # Humidity: higher near coast / rivers (longitude 70-85 = India's humid belt)
    humidity = round(40 + (seed % 40) + max(0, 15 - abs(lon - 77)), 1)
    humidity = min(95, humidity)

    # Seasonal rainfall estimate (mm)
    rainfall = round(300 + (seed % 500) + abs(lat - 23) * 15, 1)

    wind_speed = round(2 + (seed % 15) * 0.5, 1)
    descs = ["Clear Sky", "Partly Cloudy", "Broken Clouds", "Light Showers", "Overcast"]
    description = descs[seed % len(descs)]

    return WeatherData(
        temperature=temperature,
        humidity=humidity,
        rainfall_forecast=rainfall,
        wind_speed=wind_speed,
        description=description,
    )


# ── Adjustment Factors ────────────────────────────────────────────────────────
def _temp_factor(temp: float, ideal_range: tuple) -> float:
    """1.0 when ideal, degrades linearly outside range."""
    lo, hi = ideal_range
    if lo <= temp <= hi:
        return 1.0
    deviation = min(abs(temp - lo), abs(temp - hi))
    return max(0.55, 1.0 - deviation * 0.025)


def _rainfall_factor(rainfall: float, ideal_range: tuple) -> float:
    lo, hi = ideal_range
    if lo <= rainfall <= hi:
        return 1.0
    if rainfall < lo:
        deficit = (lo - rainfall) / lo
        return max(0.50, 1.0 - deficit * 0.8)
    excess = (rainfall - hi) / hi
    return max(0.65, 1.0 - excess * 0.5)


def _risk_from_factors(combined_factor: float) -> str:
    if combined_factor >= 0.85:
        return "Low"
    elif combined_factor >= 0.65:
        return "Medium"
    return "High"


# ── Main Prediction Function ──────────────────────────────────────────────────
async def predict_yield(req: YieldPredictionRequest) -> YieldPredictionResult:
    crop_key = req.crop.lower().strip()
    if crop_key not in CROP_DB:
        raise ValueError(f"Unsupported crop: {req.crop}")

    crop = CROP_DB[crop_key]
    soil_key = SOIL_KEY_MAP.get(req.soilType.lower().strip(), "alluvial")

    # Convert hectares → acres (1 ha = 2.471 acres)
    land_acres = req.landSize if req.unit == "acres" else req.landSize * 2.471

    # ── Fetch weather ──
    weather = await _fetch_weather(req.latitude, req.longitude)

    # ── Compute factors ──
    t_factor = _temp_factor(weather.temperature, crop["ideal_temp"])
    r_factor = _rainfall_factor(weather.rainfall_forecast, crop["ideal_rainfall"])
    soil_bonus = crop["soil_bonus"].get(soil_key, 0)
    irr_bonus = crop["irrigation_bonus"] if req.irrigation else 0

    combined = t_factor * r_factor * (1 + soil_bonus) * (1 + irr_bonus)
    combined = min(combined, 1.40)   # cap at +40%

    # ── Yield ──
    yield_per_acre = round(crop["base_yield_acre"] * combined, 3)
    total_yield = round(yield_per_acre * land_acres, 2)

    # ── Financials ──
    revenue = round(total_yield * crop["msp_price"])
    cost_per_acre = crop["seed_cost_acre"] + crop["fertilizer_cost_acre"] + crop["labor_cost_acre"]
    total_cost = round(cost_per_acre * land_acres)
    profit = revenue - total_cost

    # ── Risk ──
    risk = _risk_from_factors(t_factor * r_factor)

    # ── Weather summary ──
    weather_summary = (
        f"{weather.description} · {weather.temperature}°C · "
        f"Humidity {weather.humidity}% · Estimated seasonal rainfall {weather.rainfall_forecast} mm"
    )

    # ── Recommendations ──
    base_tips = CROP_TIPS.get(crop_key, [])
    risk_tips = {
        "Low":    "✅ Conditions are near-ideal. Follow standard agronomic practices for maximum yield.",
        "Medium": "⚠️ Moderate risk detected. Consider supplemental irrigation and close pest monitoring.",
        "High":   "🔴 High risk! Weather conditions deviate significantly — consult your local KVK for mitigation strategies.",
    }
    recommendations = [risk_tips[risk]] + base_tips[:4]

    return YieldPredictionResult(
        predictedYield=total_yield,
        yieldPerAcre=yield_per_acre,
        expectedRevenue=revenue,
        estimatedCost=total_cost,
        expectedProfit=profit,
        riskLevel=risk,
        weatherSummary=weather_summary,
        recommendations=recommendations,
        weatherData=weather,
        cropName=crop["display"],
        landSize=req.landSize,
        unit=req.unit,
        timestamp=datetime.utcnow(),
    )
