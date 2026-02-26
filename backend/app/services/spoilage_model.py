"""
Physics-based Spoilage Risk Model
Accounts for crop-specific thresholds, temperature, humidity, transit time,
and storage type using an Arrhenius-inspired decay model.
"""
import math
from app.services.india_mandi_data import CROP_SPOILAGE_PROFILE, get_crop_key


class SpoilageModel:
    def __init__(self):
        pass

    def _arrhenius_factor(self, temperature: float, reference_temp: float = 25.0) -> float:
        """
        Arrhenius-inspired temperature factor.
        Every 10°C above reference roughly doubles decay rate.
        Returns multiplier (>1 means faster spoilage).
        """
        delta_t = temperature - reference_temp
        return math.exp(0.069 * delta_t)   # ln(2)/10 ≈ 0.069

    def _humidity_factor(self, humidity: float, threshold: float) -> float:
        """Humidity contribution to mould/microbial growth."""
        if humidity <= threshold:
            return 1.0
        excess = humidity - threshold
        return 1.0 + (excess / 30.0) ** 1.5

    def _storage_multiplier(self, storage_type: str) -> float:
        """How well the storage type preserves freshness."""
        mapping = {
            "cold storage": 0.20,    # 80% slower
            "refrigerated": 0.25,
            "warehouse": 1.00,
            "silo": 0.70,
            "open": 2.20,
            "jute bags": 1.30,
            "plastic bags": 1.20,
            "default": 1.00,
        }
        return mapping.get(storage_type.lower(), 1.00)

    async def calculate_risk(
        self,
        temperature: float,
        humidity: float,
        storage_type: str = "warehouse",
        transit_days: int = 3,
        crop: str = "default",
    ) -> dict:
        crop_key = get_crop_key(crop) if crop and crop != "default" else "default"
        profile = CROP_SPOILAGE_PROFILE.get(crop_key, CROP_SPOILAGE_PROFILE["default"])

        temp_thresh = profile["temp_thresh"]
        hum_thresh  = profile["hum_thresh"]
        base_shelf  = profile["base_shelf_days"]
        sensitivity = profile["sensitivity"]

        # ── Compute decay rate ─────────────────────────────────────────────
        temp_factor    = self._arrhenius_factor(temperature, reference_temp=22.0)
        hum_factor     = self._humidity_factor(humidity, hum_thresh)
        storage_factor = self._storage_multiplier(storage_type)

        effective_decay_rate = temp_factor * hum_factor * storage_factor * sensitivity
        # Normalise to daily loss fraction
        daily_loss_pct = min(effective_decay_rate * 2.5, 15.0)   # cap at 15%/day

        # Probability over transit period
        # P(spoilage) = 1 - exp(-k * t) where k is daily rate, t is days
        k = daily_loss_pct / 100
        raw_probability = 1 - math.exp(-k * transit_days)
        # Clip and scale to 0-1
        probability = max(0.02, min(0.97, raw_probability))

        # ── Risk level ─────────────────────────────────────────────────────
        if probability >= 0.70:
            risk_level = "Critical"
            color = "#ef4444"
        elif probability >= 0.45:
            risk_level = "High"
            color = "#f97316"
        elif probability >= 0.25:
            risk_level = "Medium"
            color = "#eab308"
        else:
            risk_level = "Low"
            color = "#22c55e"

        # ── Suggestion ─────────────────────────────────────────────────────
        suggestions = []
        if temperature > temp_thresh:
            suggestions.append(f"Temperature {temperature}°C exceeds safe limit ({temp_thresh}°C) for {crop or 'this crop'}.")
        if humidity > hum_thresh:
            suggestions.append(f"Humidity {humidity}% is above the mould threshold ({hum_thresh}%).")
        if storage_type.lower() in ["open", "jute bags"]:
            suggestions.append("Upgrade to enclosed warehouse or silo to reduce exposure.")
        if transit_days > base_shelf // 10:
            suggestions.append(f"Long transit ({transit_days}d) is risky. Plan for ≤{base_shelf // 10} days.")
        if probability > 0.40:
            suggestions.append("Consider immediate sale or cold storage to prevent losses.")
        if not suggestions:
            suggestions.append(f"Conditions are within safe range. Expected shelf life ~{int(base_shelf / max(effective_decay_rate, 0.5))} days.")

        # Estimated value loss
        estimated_loss_pct = round(probability * 100 * sensitivity, 1)

        return {
            "spoilage_probability": round(probability, 3),
            "probability_pct": round(probability * 100, 1),
            "risk_level": risk_level,
            "risk_color": color,
            "estimated_value_loss_pct": estimated_loss_pct,
            "daily_loss_pct": round(daily_loss_pct, 2),
            "suggestion": " ".join(suggestions),
            "factors": {
                "temperature_factor": round(temp_factor, 2),
                "humidity_factor": round(hum_factor, 2),
                "storage_factor": round(storage_factor, 2),
            }
        }
