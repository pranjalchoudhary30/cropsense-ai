"""
Multi-Mandi Recommendation Engine
Scores 200+ Indian mandis based on: predicted price, transport distance,
road connectivity tier, and demand factor to recommend the best selling point.
"""
import math
from typing import List, Dict
from app.services.price_forecasting import PriceForecastingService
from app.services.weather_service import get_city_coords
from app.services.india_mandi_data import (
    get_crop_key, get_state_from_location, get_mandis_for_state,
    INDIA_MANDIS, CROP_BASE_PRICES, STATE_PRICE_FACTORS, TIER_PREMIUMS,
    get_seasonal_multiplier
)
from datetime import datetime


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Calculate great-circle distance in km."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


TRANSPORT_COST_PER_KM = 2.5   # ₹ per quintal per km (avg truck)
MAX_VIABLE_DISTANCE_KM = 600  # beyond this, transport costs outweigh gain


class RecommendationEngine:
    def __init__(self):
        self.price_service = PriceForecastingService()

    def _get_candidate_mandis(self, state: str, lat: float, lon: float) -> List[Dict]:
        """Gather mandis: home state + nearby state mandis within 400km."""
        candidates = []
        seen = set()
        for s, mandi_list in INDIA_MANDIS.items():
            for m in mandi_list:
                key = m["name"]
                if key in seen:
                    continue
                dist = haversine_km(lat, lon, m["lat"], m["lon"])
                if dist <= MAX_VIABLE_DISTANCE_KM:
                    seen.add(key)
                    candidates.append({**m, "state": s, "distance_km": round(dist, 1)})
        # Sort by distance, take top 15 candidates to rank
        candidates.sort(key=lambda x: x["distance_km"])
        return candidates[:15]

    def _score_mandi(self, mandi: Dict, base_price: float, crop_key: str) -> Dict:
        """Score a mandi and return enriched dict with recommendation metrics."""
        dist_km = mandi["distance_km"]
        tier = mandi["tier"]
        state = mandi["state"]

        # Price at this mandi
        state_factor = STATE_PRICE_FACTORS.get(state, 1.0)
        tier_premium = TIER_PREMIUMS.get(tier, 1.0)
        month = datetime.utcnow().month
        seasonal = get_seasonal_multiplier(crop_key, month)
        mandi_price = round(base_price * state_factor * tier_premium * seasonal)

        # Transport cost (₹/quintal)
        transport_cost = round(dist_km * TRANSPORT_COST_PER_KM, 0)

        # Net price after transport
        net_price = mandi_price - transport_cost

        # Demand score: tier-1 mandis have higher liquidity
        demand_score = {1: 95, 2: 78, 3: 60}.get(tier, 70)

        # Composite score: weighted sum
        score = (
            0.50 * (mandi_price / base_price) * 100 +
            0.25 * (1 - dist_km / MAX_VIABLE_DISTANCE_KM) * 100 +
            0.25 * demand_score
        )

        return {
            **mandi,
            "mandi_price": mandi_price,
            "transport_cost_per_qt": int(transport_cost),
            "net_price_per_qt": int(net_price),
            "demand_score": demand_score,
            "composite_score": round(score, 1),
            "estimated_profit_per_qt": int(net_price - (base_price * 0.7)),
        }

    async def recommend_market(self, crop: str, location: str) -> dict:
        crop_key = get_crop_key(crop)
        state = get_state_from_location(location)
        (lat, lon), resolved_city = get_city_coords(location)

        # Get base price from ML model
        price_data = await self.price_service.predict_price(crop, location)
        base_price = price_data["start_price"]

        # Get candidate mandis
        candidates = self._get_candidate_mandis(state, lat, lon)

        if not candidates:
            # Last resort fallback
            mandis_state = get_mandis_for_state(state)
            candidates = [{**m, "state": state, "distance_km": 50} for m in mandis_state]

        # Score all candidates
        scored = [self._score_mandi(m, base_price, crop_key) for m in candidates]
        scored.sort(key=lambda x: x["composite_score"], reverse=True)

        best = scored[0]
        top3 = scored[:3]

        confidence = min(0.97, 0.70 + (best["composite_score"] / 100) * 0.27)

        # Build explanation
        reasoning_parts = []
        if best["distance_km"] < 100:
            reasoning_parts.append(f"Only {best['distance_km']}km away — low transport cost.")
        if best["tier"] == 1:
            reasoning_parts.append("Grade-A mandi with high liquidity and daily auctions.")
        if best["mandi_price"] > base_price:
            premium = round((best["mandi_price"] / base_price - 1) * 100, 1)
            reasoning_parts.append(f"{premium}% above your local base price.")
        if best["demand_score"] > 85:
            reasoning_parts.append("Strong buyer demand drives competitive bidding.")

        explanation = " ".join(reasoning_parts) or (
            f"Best net price after ₹{best['transport_cost_per_qt']}/qt transport."
        )

        return {
            "best_mandi": best["name"],
            "best_mandi_state": best["state"].title(),
            "distance_km": best["distance_km"],
            "predicted_price": best["mandi_price"],
            "net_price": best["net_price_per_qt"],
            "transport_cost": best["transport_cost_per_qt"],
            "expected_profit_per_qt": best["estimated_profit_per_qt"],
            "confidence": round(confidence, 2),
            "confidence_pct": round(confidence * 100, 0),
            "explanation": explanation,
            "top_mandis": [
                {
                    "name": m["name"],
                    "state": m["state"].title(),
                    "distance_km": m["distance_km"],
                    "price": m["mandi_price"],
                    "net_price": m["net_price_per_qt"],
                    "score": m["composite_score"],
                    "transport_cost": m["transport_cost_per_qt"],
                    "tier": m["tier"],
                }
                for m in top3
            ],
            "crop": crop,
            "location": resolved_city,
        }
