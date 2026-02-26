class SpoilageModel:
    def __init__(self):
        pass

    async def calculate_risk(self, temperature: float, humidity: float, storage_type: str, transit_days: int) -> dict:
        """
        Risk calculation for spoilage probability based on weather and transit.
        """
        risk_level = "Medium"
        probability = 0.45
        suggestion = "Use cold storage or reduce transit time."

        if temperature > 30 and humidity > 70:
            risk_level = "High"
            probability = 0.85
            suggestion = "Immediate sale recommended; high spoilage probability."

        return {
            "spoilage_probability": probability,
            "risk_level": risk_level,
            "suggestion": suggestion
        }
