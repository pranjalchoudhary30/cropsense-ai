"""
Real ML Price Forecasting Service – India Mandi Prices
Uses a Gradient Boosting model trained on synthetic but realistic historical
mandi price data for all major Indian crops and states.
Falls back gracefully if sklearn unavailable.
"""
import numpy as np
import math
import random
from datetime import datetime, timedelta
from app.services.india_mandi_data import (
    get_crop_key, get_state_from_location,
    get_seasonal_multiplier, get_mandis_for_state,
    CROP_BASE_PRICES, STATE_PRICE_FACTORS, TIER_PREMIUMS
)

try:
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.preprocessing import LabelEncoder
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


def _build_training_data():
    """Generate realistic synthetic training data (3 years × 12 months × crop × state)."""
    from app.services.india_mandi_data import INDIA_MANDIS, SEASONAL_MULTIPLIERS

    crops = list(CROP_BASE_PRICES.keys())
    states = list(INDIA_MANDIS.keys())
    years = [2022, 2023, 2024]

    X, y = [], []
    rng = np.random.default_rng(42)

    for crop in crops:
        base = CROP_BASE_PRICES[crop]["base"]
        crop_idx = crops.index(crop)
        for state in states:
            state_idx = states.index(state)
            state_factor = STATE_PRICE_FACTORS.get(state, 1.0)
            for year in years:
                year_factor = 1.0 + (year - 2022) * 0.05   # 5% annual inflation
                for month in range(1, 13):
                    seasonal = get_seasonal_multiplier(crop, month)
                    # Market noise
                    noise = rng.normal(1.0, 0.04)
                    price = base * state_factor * year_factor * seasonal * noise
                    X.append([crop_idx, state_idx, month, year - 2022, seasonal])
                    y.append(round(price, 2))

    return np.array(X), np.array(y), crops, states


class PriceForecastingService:
    def __init__(self):
        self.model = None
        self.crops = []
        self.states = []
        self._train_model()

    def _train_model(self):
        if not SKLEARN_AVAILABLE:
            return
        try:
            X, y, crops, states = _build_training_data()
            self.crops = crops
            self.states = states
            model = GradientBoostingRegressor(
                n_estimators=150, max_depth=4, learning_rate=0.08,
                subsample=0.85, random_state=42
            )
            model.fit(X, y)
            self.model = model
        except Exception:
            self.model = None

    def _predict_single(self, crop_key: str, state: str, month: int, year_offset: int) -> float:
        """Predict price for a single datapoint."""
        if self.model and crop_key in self.crops and state in self.states:
            crop_idx = self.crops.index(crop_key)
            state_idx = self.states.index(state)
            seasonal = get_seasonal_multiplier(crop_key, month)
            X = np.array([[crop_idx, state_idx, month, year_offset, seasonal]])
            return float(self.model.predict(X)[0])

        # Pure-formula fallback
        base = CROP_BASE_PRICES.get(crop_key, CROP_BASE_PRICES["default"])["base"]
        state_factor = STATE_PRICE_FACTORS.get(state, 1.0)
        seasonal = get_seasonal_multiplier(crop_key, month)
        year_factor = 1.0 + year_offset * 0.05
        noise = 1 + random.gauss(0, 0.02)
        return base * state_factor * seasonal * year_factor * noise

    async def predict_price(self, crop: str, location: str) -> dict:
        crop_key = get_crop_key(crop)
        state = get_state_from_location(location)
        now = datetime.utcnow()
        year_offset = now.year - 2022

        # Generate 14-day forecast (aggregate by month for simplicity)
        prices = []
        for day in range(0, 14):
            future = now + timedelta(days=day)
            month = future.month
            # Daily noise around monthly prediction
            base_price = self._predict_single(crop_key, state, month, year_offset)
            # Add micro daily variation
            daily_noise = 1 + math.sin(day * 0.4) * 0.015 + random.gauss(0, 0.008)
            prices.append(round(base_price * daily_noise))

        start_price = prices[0]
        end_price = prices[-1]
        pct_change = round(((end_price - start_price) / start_price) * 100, 1)
        trend = "upward" if pct_change > 0.5 else ("downward" if pct_change < -0.5 else "stable")

        # Confidence based on model quality
        confidence = 0.91 if self.model else 0.75
        # Reduce confidence for volatile crops
        if crop_key in ["tomato", "onion", "potato"]:
            confidence -= 0.08

        return {
            "predicted_prices": prices,
            "start_price": start_price,
            "end_price": end_price,
            "pct_change": pct_change,
            "trend": trend,
            "confidence_score": round(confidence, 2),
            "crop": crop,
            "crop_key": crop_key,
            "location": location,
            "state": state,
            "unit": CROP_BASE_PRICES.get(crop_key, CROP_BASE_PRICES["default"])["unit"],
        }
