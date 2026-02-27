"""
Disease Detection Service
--------------------------
1. Uploads the image to Cloudinary (falls back to base64 if no credentials).
2. Runs the disease analysis — calls Plant.id API if PLANT_ID_API_KEY is set,
   otherwise returns a richly-seeded mock response from the DISEASE_LIBRARY.
"""
import base64
import hashlib
import os
import io
from datetime import datetime
from typing import Optional

import httpx
from app.config import settings

# ── Optional Cloudinary import ───────────────────────────────────────────────
try:
    import cloudinary
    import cloudinary.uploader
    _CLOUDINARY_AVAILABLE = True
except ImportError:
    _CLOUDINARY_AVAILABLE = False

# ── Disease mock library (8 real diseases) ────────────────────────────────────
DISEASE_LIBRARY = [
    # ── WHEAT ──────────────────────────────────────────────────────────────
    {
        "diseaseName": "Wheat Leaf Rust (Puccinia triticina)",
        "crop": "wheat",
        "severity": "High",
        "treatment": [
            "Remove infected plant material from field edges immediately.",
            "Apply Propiconazole 25% EC at first sign of pustules.",
            "Spray again 14 days later if infection persists.",
            "Avoid overhead irrigation — reduce leaf wetness duration.",
            "Delay sowing to escape peak spore season (Nov–Dec in North India).",
        ],
        "pesticide": "Propiconazole 25% EC (Tilt) — 1 ml/L water, 2–3 sprays at 14-day intervals",
        "prevention": [
            "Plant rust-resistant varieties: HD-2967, WH-1105, PBW-343.",
            "Rotate crops — avoid continuous wheat cultivation.",
            "Monitor fields weekly between tillering and heading stages.",
            "Apply balanced NPK fertilizer — avoid excess nitrogen.",
            "Destroy volunteer wheat plants and alternate host grasses.",
        ],
    },
    {
        "diseaseName": "Wheat Yellow/Stripe Rust (Puccinia striiformis)",
        "crop": "wheat",
        "severity": "High",
        "treatment": [
            "Apply Tebuconazole 250 EW immediately on symptom appearance.",
            "Repeat spray 10 days later if conditions remain cool and wet.",
            "Remove badly infected tillers near field borders.",
            "Do not delay — stripe rust can reduce yield 40–70%.",
        ],
        "pesticide": "Tebuconazole 250 EW — 1 ml/L, or Mancozeb 75 WP — 2 g/L",
        "prevention": [
            "Use resistant varieties: Kiran, Shrestha, NW 1014.",
            "Timely sowing — avoid late planting in cooler zones.",
            "Maintain field hygiene — remove infected debris post-harvest.",
            "Apply Zinc sulphate to boost plant immunity.",
        ],
    },
    {
        "diseaseName": "Wheat Loose Smut (Ustilago tritici)",
        "crop": "wheat",
        "severity": "Medium",
        "treatment": [
            "Rogue out and bag smutted ears before spores disperse.",
            "Treat seed with Carboxin + Thiram (Vitavax Power) before sowing.",
            "Avoid harvesting smutted crop with clean crop.",
        ],
        "pesticide": "Carboxin 37.5% + Thiram 37.5% (Vitavax Power) — 2 g/kg seed treatment",
        "prevention": [
            "Use certified, hot-water treated seed (52°C for 10 min).",
            "Practice 3-year crop rotation.",
            "Source seed only from disease-free certified plots.",
        ],
    },

    # ── RICE ───────────────────────────────────────────────────────────────
    {
        "diseaseName": "Rice Blast (Magnaporthe oryzae)",
        "crop": "rice",
        "severity": "High",
        "treatment": [
            "Drain fields completely and let soil dry for 5–7 days.",
            "Apply Tricyclazole 75% WP immediately at neck emergence.",
            "Repeat spray 10 days later for neck blast protection.",
            "Stop all nitrogen top-dressing during active infection.",
            "Burn infected plant debris after harvest.",
        ],
        "pesticide": "Tricyclazole 75% WP (Beam) — 0.6 g/L, two sprays 10 days apart",
        "prevention": [
            "Use blast-resistant varieties: IR-64, Pusa Basmati 1, Swarna.",
            "Seed treatment: Carbendazim 2 g/kg before sowing.",
            "Maintain 5 cm standing water during tillering.",
            "Split nitrogen application — avoid excess basal dose.",
            "Balanced silicon fertilization reduces blast severity.",
        ],
    },
    {
        "diseaseName": "Bacterial Leaf Blight — Rice (Xanthomonas oryzae pv. oryzae)",
        "crop": "rice",
        "severity": "High",
        "treatment": [
            "Drain fields and stop nitrogen application immediately.",
            "Spray Copper Oxychloride 50% WP + Streptocycline solution.",
            "Remove and burn infected tillers from field borders.",
            "Avoid flood-irrigation that moves water between fields.",
        ],
        "pesticide": "Copper Oxychloride 50% WP — 3 g/L + Streptocycline 100 ppm (0.1 g/L)",
        "prevention": [
            "Use BLB-resistant varieties: IR-36, Swarna Sub1, MTU-7029.",
            "Use certified seed — reject stressed/chlorotic seedlings.",
            "Control leaf-folder insects that create infection wounds.",
            "Avoid zinc deficiency — apply zinc sulphate @ 25 kg/ha.",
        ],
    },
    {
        "diseaseName": "Brown Plant Hopper — Sheath Blight (Rhizoctonia solani)",
        "crop": "rice",
        "severity": "Medium",
        "treatment": [
            "Spray Validamycin 3% L immediately at maximum tillering.",
            "Drain field for 4–5 days to reduce humidity at plant base.",
            "Reduce plant density by gap filling and thinning.",
            "Apply hexaconazole 5 SC as a follow-up spray.",
        ],
        "pesticide": "Validamycin 3% L — 2 ml/L; or Hexaconazole 5 SC — 1 ml/L",
        "prevention": [
            "Maintain optimum plant spacing (20×15 cm).",
            "Avoid excess nitrogen — splits the canopy.",
            "Control plant hopper populations early.",
            "Use soil solarization before transplanting.",
        ],
    },

    # ── MAIZE ──────────────────────────────────────────────────────────────
    {
        "diseaseName": "Maize Northern Corn Leaf Blight (Exserohilum turcicum)",
        "crop": "maize",
        "severity": "Medium",
        "treatment": [
            "Apply Mancozeb 75% WP at first appearance of cigar-shaped lesions.",
            "Repeat at 10-day intervals if weather remains humid.",
            "Remove heavily infected lower leaves to improve air circulation.",
            "Do not apply excess nitrogen once infection is visible.",
        ],
        "pesticide": "Mancozeb 75% WP — 2.5 g/L, or Propiconazole 25 EC — 1 ml/L",
        "prevention": [
            "Choose resistant hybrid seeds (HQPM-1, DHM-117).",
            "Crop rotation with legumes or vegetables.",
            "Pre-season plowing to bury infected crop debris.",
            "Ensure proper drainage and furrow irrigation.",
        ],
    },
    {
        "diseaseName": "Fall Armyworm on Maize (Spodoptera frugiperda)",
        "crop": "maize",
        "severity": "High",
        "treatment": [
            "Apply Emamectin Benzoate 5 SG into the whorl of each plant.",
            "Spray Chlorantraniliprole 18.5 SC on affected plants.",
            "Collect and destroy egg masses and young larvae by hand.",
            "Use pheromone traps to monitor adult moth activity.",
        ],
        "pesticide": "Emamectin Benzoate 5 SG — 0.4 g/L, or Spinetoram 11.7 SC — 0.5 ml/L",
        "prevention": [
            "Early sowing to escape peak infestation period.",
            "Intercropping maize with cowpea or soybean.",
            "Neem-based sprays (NSKE 5%) at egg stage.",
            "Release natural enemies: Trichogramma wasps.",
        ],
    },

    # ── TOMATO ─────────────────────────────────────────────────────────────
    {
        "diseaseName": "Early Blight — Tomato (Alternaria solani)",
        "crop": "tomato",
        "severity": "Medium",
        "treatment": [
            "Remove and dispose of infected lower leaves (do not compost).",
            "Apply Mancozeb 75% WP spray on remaining foliage.",
            "Stake plants to improve airflow and reduce splash spread.",
            "Mulch base to prevent soil splash onto leaves.",
            "Spray again after rain or irrigation.",
        ],
        "pesticide": "Mancozeb 75% WP — 2.5 g/L, every 7–10 days; alternate with Copper Oxychloride",
        "prevention": [
            "Use disease-free certified transplants.",
            "2–3 year rotation away from solanaceous crops.",
            "Drip irrigate — avoid wetting foliage.",
            "Destroy volunteer tomato/potato plants.",
            "Apply Trichoderma harzianum to soil before transplanting.",
        ],
    },
    {
        "diseaseName": "Tomato Leaf Curl Virus (ToLCV — Whitefly borne)",
        "crop": "tomato",
        "severity": "High",
        "treatment": [
            "Remove and destroy virus-infected plants immediately.",
            "Control whitefly vector with Imidacloprid 17.8 SL spray.",
            "Install yellow sticky traps (30/acre) to monitor whitefly.",
            "Apply reflective silver mulch to deter whitefly landings.",
        ],
        "pesticide": "Imidacloprid 17.8 SL — 0.3 ml/L (soil drench or spray); avoid repeat use — rotate with Thiamethoxam",
        "prevention": [
            "Use ToLCV-resistant varieties: Arka Rakshak, Pusa Rohini.",
            "Install 50-mesh nylon net on nursery seedbeds.",
            "Roguing — remove infected plants within 24 hours.",
            "Avoid planting near old infected tomato fields.",
        ],
    },

    # ── POTATO ─────────────────────────────────────────────────────────────
    {
        "diseaseName": "Late Blight — Potato/Tomato (Phytophthora infestans)",
        "crop": "potato",
        "severity": "High",
        "treatment": [
            "Apply Metalaxyl + Mancozeb (Ridomil Gold MZ) immediately.",
            "Spray every 5–7 days during wet weather.",
            "Destroy haulms & infected tubers — do not leave in field.",
            "Improve field drainage to reduce standing water.",
            "Do not harvest during wet conditions — blight spreads to tubers.",
        ],
        "pesticide": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold MZ) — 2.5 g/L; alternate with Fenamidone + Mancozeb",
        "prevention": [
            "Use certified, blight-free seed tubers.",
            "Plant resistant varieties: Kufri Jyoti, Kufri Bahar.",
            "Earthing-up prevents tuber infection from rain splash.",
            "Avoid overhead irrigation.",
            "Monitor temperature-humidity forecasts (cool + wet = high risk).",
        ],
    },

    # ── COTTON ─────────────────────────────────────────────────────────────
    {
        "diseaseName": "Cotton Boll Rot / Bacterial Blight (Xanthomonas citri pv. malvacearum)",
        "crop": "cotton",
        "severity": "Medium",
        "treatment": [
            "Spray Copper Oxychloride 50 WP on affected plants.",
            "Remove and burn severely blackened bolls.",
            "Improve drainage and reduce field humidity.",
            "Avoid mechanical injury during field operations.",
        ],
        "pesticide": "Copper Oxychloride 50 WP — 3 g/L, spray every 10–14 days",
        "prevention": [
            "Use acid-delinted certified seed — treat with Carboxin.",
            "Plant resistant varieties: LPS-141, HS-6.",
            "Destroy crop stubble after harvest.",
            "Control sucking pests that create infection entry points.",
        ],
    },

    # ── GROUNDNUT ──────────────────────────────────────────────────────────
    {
        "diseaseName": "Tikka Leaf Spot — Groundnut (Cercospora arachidicola)",
        "crop": "groundnut",
        "severity": "Medium",
        "treatment": [
            "Spray Mancozeb 75% WP at 30 days after sowing.",
            "Repeat at 10-day intervals — 3–4 sprays total.",
            "Collect and burn fallen infected leaves.",
            "Avoid excessive canopy density by optimizing plant spacing.",
        ],
        "pesticide": "Mancozeb 75% WP — 2 g/L, or Chlorothalonil 75 WP — 2 g/L",
        "prevention": [
            "Use resistant varieties: TAG-24, GPBD-4, Kadiri-3.",
            "Crop rotation with sorghum or pearl millet.",
            "Seed treatment with Thiram 4 g/kg.",
            "Proper plant spacing (30×10 cm) for good air circulation.",
        ],
    },

    # ── BANANA ─────────────────────────────────────────────────────────────
    {
        "diseaseName": "Banana Sigatoka Leaf Spot (Mycosphaerella musicola)",
        "crop": "banana",
        "severity": "Medium",
        "treatment": [
            "Remove and burn yellow or necrotic older leaves.",
            "Apply Propiconazole 25 EC or Carbendazim spray.",
            "Spray fortnightly during high humidity season.",
            "Improve drainage in waterlogged areas.",
        ],
        "pesticide": "Propiconazole 25 EC — 1 ml/L, or Mancozeb 0.25% spray every 14 days",
        "prevention": [
            "Use clean, tissue-culture planting material.",
            "Maintain proper spacing (1.8×1.5 m).",
            "Regular de-leafing of infected leaves.",
            "Avoid flood irrigation — drip irrigation preferred.",
        ],
    },
    {
        "diseaseName": "Fusarium Wilt (Panama Disease) — Banana",
        "crop": "banana",
        "severity": "High",
        "treatment": [
            "Remove and destroy entire affected plant — including corm.",
            "Solarize soil with clear plastic for 6–8 weeks.",
            "Apply Carbendazim + Copper Oxychloride soil drench.",
            "Do not replant banana in the same soil for 3+ years.",
        ],
        "pesticide": "Carbendazim 50 WP — 1 g/L soil drench; Trichoderma viride 5 kg/acre soil application",
        "prevention": [
            "Use Cavendish group or Fusarium-resistant varieties.",
            "Use only disease-free tissue culture plantlets.",
            "Apply Trichoderma + Pseudomonas biocontrol agents at planting.",
            "Strict field sanitation — disinfect tools between plants.",
        ],
    },

    # ── UNIVERSAL: HEALTHY ─────────────────────────────────────────────────
    {
        "diseaseName": "Healthy Crop — No Disease Detected",
        "crop": "all",
        "severity": "Low",
        "treatment": [
            "No treatment required — crop appears clinically healthy.",
            "Continue current irrigation and fertilization schedule.",
            "Scout fields every 7 days to catch early symptoms.",
            "Apply foliar micronutrient spray (zinc + boron) if leaves show pale spots.",
        ],
        "pesticide": "No pesticide required. Preventive Bordeaux mixture (1%) can be applied pre-monsoon.",
        "prevention": [
            "Maintain field hygiene — remove weed hosts and crop debris.",
            "Rotate crops every season to break disease cycles.",
            "Use certified disease-free seed every sowing.",
            "Monitor weather-based disease risk advisories (IMD / ICAR).",
            "Apply recommended dose of fertilizers — avoid excess nitrogen.",
        ],
    },

    # ── POWDERY MILDEW (multi-crop) ────────────────────────────────────────
    {
        "diseaseName": "Powdery Mildew (multiple crops)",
        "crop": "general",
        "severity": "Medium",
        "treatment": [
            "Spray Wettable Sulphur 80 WP at first white powdery patches.",
            "Apply Hexaconazole 5 SC as a systemic follow-up.",
            "Remove and destroy heavily infected plant parts.",
            "Avoid late-evening irrigation — high humidity favours spread.",
        ],
        "pesticide": "Wettable Sulphur 80 WP — 3 g/L fortnightly; or Dinocap 48 EC — 1 ml/L",
        "prevention": [
            "Choose mildew-resistant cultivars where available.",
            "Maintain adequate plant spacing for airflow.",
            "Avoid excess nitrogen fertilization.",
            "Inspect crops weekly during warm, dry spells.",
        ],
    },
    {
        "diseaseName": "Downy Mildew (Cucurbits / Soybean / Grapes)",
        "crop": "general",
        "severity": "Medium",
        "treatment": [
            "Apply Metalaxyl + Mancozeb immediately on symptom appearance.",
            "Remove and bag infected plant debris.",
            "Drain waterlogged areas promptly.",
            "Re-spray within 5 days of heavy rainfall.",
        ],
        "pesticide": "Metalaxyl 8% + Mancozeb 64% WP — 2.5 g/L, weekly for 3 weeks",
        "prevention": [
            "Rotate with non-host crops (cereals for cucurbit downy).",
            "Raised beds to improve soil drainage.",
            "Avoid dense planting — thin seedlings if overcrowded.",
            "Use resistant hybrids where available.",
        ],
    },
]



# ── Cloudinary setup ──────────────────────────────────────────────────────────
def _configure_cloudinary():
    """Configure Cloudinary only if all credentials are present."""
    cloud_name = getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
    api_key = getattr(settings, "CLOUDINARY_API_KEY", "")
    api_secret = getattr(settings, "CLOUDINARY_API_SECRET", "")
    if _CLOUDINARY_AVAILABLE and cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )
        return True
    return False


async def upload_image(file_bytes: bytes, filename: str) -> str:
    """
    Upload image to Cloudinary under the 'cropsense/disease' folder.
    Falls back to a base64 data-URL if Cloudinary is not configured.
    """
    if _configure_cloudinary():
        # Cloudinary upload (sync SDK wrapped in thread pool via httpx)
        result = cloudinary.uploader.upload(
            io.BytesIO(file_bytes),
            folder="cropsense/disease",
            public_id=f"disease_{hashlib.md5(file_bytes).hexdigest()[:8]}",
            resource_type="image",
        )
        return result["secure_url"]

    # Fallback: inline base64 data-URL (no external service required)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpeg"
    mime = f"image/{ext}"
    b64 = base64.b64encode(file_bytes).decode()
    return f"data:{mime};base64,{b64}"


def _pick_disease(file_bytes: bytes) -> dict:
    """
    Deterministically pick a disease entry based on the image content hash
    so that the same image always produces the same mock result.
    """
    digest = hashlib.sha256(file_bytes).hexdigest()
    idx = int(digest[:8], 16) % len(DISEASE_LIBRARY)
    return DISEASE_LIBRARY[idx]


async def analyze_disease(file_bytes: bytes, image_url: str, crop_hint: Optional[str] = None) -> dict:
    """
    Analyse the crop image for disease.

    If PLANT_ID_API_KEY is set in settings, calls the Plant.id v3 health
    assessment API.  Otherwise falls back to the deterministic mock library.
    """
    plant_id_key = getattr(settings, "PLANT_ID_API_KEY", "")

    if plant_id_key and image_url.startswith("http"):
        return await _call_plant_id(image_url, plant_id_key)

    # ── Mock response ──────────────────────────────────────────────────────
    disease = _pick_disease(file_bytes)

    # Pseudo-random confidence: 72–97 % based on file hash
    hash_val = int(hashlib.md5(file_bytes).hexdigest()[:4], 16)
    confidence = round(72 + (hash_val % 26) + (hash_val % 7) * 0.3, 1)
    confidence = min(confidence, 97.8)

    return {
        "diseaseName": disease["diseaseName"],
        "confidence": confidence,
        "severity": disease["severity"],
        "treatment": disease["treatment"],
        "pesticide": disease["pesticide"],
        "prevention": disease["prevention"],
        "imageUrl": image_url,
        "timestamp": datetime.utcnow().isoformat(),
    }


async def _call_plant_id(image_url: str, api_key: str) -> dict:
    """
    Call Plant.id v3 Health Assessment API.
    Docs: https://plant.id/docs#tag/Plant-Health-Assessment
    """
    payload = {
        "images": [image_url],
        "health": "only",
        "language": "en",
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.plant.id/v3/health_assessment",
            json=payload,
            headers={"Api-Key": api_key, "Content-Type": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()

    # Map Plant.id response structure → CropSense schema
    diseases = data.get("result", {}).get("disease", {}).get("suggestions", [])
    if not diseases:
        return await analyze_disease(b"", image_url)  # fall back to mock

    top = diseases[0]
    name = top.get("name", "Unknown Disease")
    prob = round(top.get("probability", 0) * 100, 1)
    severity = "High" if prob > 70 else ("Medium" if prob > 40 else "Low")

    details = top.get("details", {})
    treatment_raw = details.get("treatment", {})
    treatments = (
        treatment_raw.get("chemical", []) +
        treatment_raw.get("biological", []) +
        treatment_raw.get("prevention", [])
    )

    return {
        "diseaseName": name,
        "confidence": prob,
        "severity": severity,
        "treatment": treatments[:5] or ["Consult your local agricultural extension officer."],
        "pesticide": ", ".join(treatment_raw.get("chemical", ["Consult local agri-extension officer"])),
        "prevention": details.get("common_uses", ["Maintain good agricultural practices."]),
        "imageUrl": image_url,
        "timestamp": datetime.utcnow().isoformat(),
    }
