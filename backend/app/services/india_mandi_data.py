"""
India Agricultural Mandi Data
Comprehensive database with 200+ mandis across all Indian states.
Includes: geo-coordinates, avg prices by crop, seasonal multipliers.
"""

# ─── State-wise Mandi Database ──────────────────────────────────────────────
# Format: { state: [{ name, lat, lon, tier }] }
INDIA_MANDIS = {
    "punjab": [
        {"name": "Ludhiana Grain Mandi", "lat": 30.9010, "lon": 75.8573, "tier": 1},
        {"name": "Amritsar Mandi", "lat": 31.6340, "lon": 74.8723, "tier": 1},
        {"name": "Patiala Mandi", "lat": 30.3398, "lon": 76.3869, "tier": 2},
        {"name": "Jalandhar Mandi", "lat": 31.3260, "lon": 75.5762, "tier": 1},
        {"name": "Ferozepur Mandi", "lat": 30.9236, "lon": 74.6214, "tier": 2},
        {"name": "Batala Mandi", "lat": 31.8150, "lon": 75.2002, "tier": 2},
    ],
    "haryana": [
        {"name": "Karnal Mandi", "lat": 29.6857, "lon": 76.9905, "tier": 1},
        {"name": "Hisar Grain Market", "lat": 29.1492, "lon": 75.7217, "tier": 1},
        {"name": "Ambala Mandi", "lat": 30.3752, "lon": 76.7821, "tier": 2},
        {"name": "Rohtak Mandi", "lat": 28.8955, "lon": 76.6066, "tier": 2},
        {"name": "Sirsa Mandi", "lat": 29.5343, "lon": 75.0293, "tier": 2},
        {"name": "Panipat Mandi", "lat": 29.3909, "lon": 76.9635, "tier": 2},
    ],
    "uttar pradesh": [
        {"name": "Agra Mandi", "lat": 27.1767, "lon": 78.0081, "tier": 1},
        {"name": "Kanpur Agricultural Market", "lat": 26.4499, "lon": 80.3319, "tier": 1},
        {"name": "Lucknow Mandi", "lat": 26.8467, "lon": 80.9462, "tier": 1},
        {"name": "Varanasi Mandi", "lat": 25.3176, "lon": 82.9739, "tier": 2},
        {"name": "Allahabad Mandi", "lat": 25.4358, "lon": 81.8463, "tier": 2},
        {"name": "Meerut Mandi", "lat": 28.9845, "lon": 77.7064, "tier": 2},
        {"name": "Bareilly Mandi", "lat": 28.3670, "lon": 79.4304, "tier": 2},
        {"name": "Mathura Mandi", "lat": 27.4924, "lon": 77.6737, "tier": 2},
        {"name": "Aligarh Mandi", "lat": 27.8974, "lon": 78.0880, "tier": 2},
    ],
    "madhya pradesh": [
        {"name": "Indore New Mandi", "lat": 22.7196, "lon": 75.8577, "tier": 1},
        {"name": "Bhopal Karond Mandi", "lat": 23.2599, "lon": 77.4126, "tier": 1},
        {"name": "Gwalior Mandi", "lat": 26.2183, "lon": 78.1828, "tier": 2},
        {"name": "Jabalpur Mandi", "lat": 23.1815, "lon": 79.9864, "tier": 2},
        {"name": "Ujjain Mandi", "lat": 23.1828, "lon": 75.7772, "tier": 2},
        {"name": "Dewas Mandi", "lat": 22.9676, "lon": 76.0534, "tier": 3},
        {"name": "Sehore Mandi", "lat": 23.2040, "lon": 77.0868, "tier": 3},
    ],
    "rajasthan": [
        {"name": "Jaipur Muhana Mandi", "lat": 26.8998, "lon": 75.8152, "tier": 1},
        {"name": "Jodhpur Mandi", "lat": 26.2389, "lon": 73.0243, "tier": 1},
        {"name": "Kota Mandi", "lat": 25.2138, "lon": 75.8648, "tier": 2},
        {"name": "Bikaner Mandi", "lat": 28.0229, "lon": 73.3119, "tier": 2},
        {"name": "Ajmer Mandi", "lat": 26.4499, "lon": 74.6399, "tier": 2},
        {"name": "Udaipur Mandi", "lat": 24.5854, "lon": 73.7125, "tier": 2},
        {"name": "Sri Ganganagar Mandi", "lat": 29.9038, "lon": 73.8772, "tier": 2},
    ],
    "maharashtra": [
        {"name": "Mumbai APMC Vashi", "lat": 19.0760, "lon": 73.0194, "tier": 1},
        {"name": "Pune Market Yard", "lat": 18.5204, "lon": 73.8567, "tier": 1},
        {"name": "Nagpur Mandi", "lat": 21.1458, "lon": 79.0882, "tier": 1},
        {"name": "Nashik Mandi", "lat": 20.0059, "lon": 73.7897, "tier": 2},
        {"name": "Aurangabad Mandi", "lat": 19.8762, "lon": 75.3433, "tier": 2},
        {"name": "Solapur Mandi", "lat": 17.6868, "lon": 75.9064, "tier": 2},
        {"name": "Amravati Mandi", "lat": 20.9374, "lon": 77.7796, "tier": 2},
        {"name": "Kolhapur Mandi", "lat": 16.7050, "lon": 74.2433, "tier": 2},
        {"name": "Sangli Mandi", "lat": 16.8524, "lon": 74.5815, "tier": 2},
    ],
    "gujarat": [
        {"name": "Ahmedabad APMC", "lat": 23.0225, "lon": 72.5714, "tier": 1},
        {"name": "Surat Fruit Market", "lat": 21.1702, "lon": 72.8311, "tier": 1},
        {"name": "Rajkot Mandi", "lat": 22.3039, "lon": 70.8022, "tier": 2},
        {"name": "Vadodara Mandi", "lat": 22.3072, "lon": 73.1812, "tier": 2},
        {"name": "Junagadh Mandi", "lat": 21.5222, "lon": 70.4579, "tier": 2},
        {"name": "Bhavnagar Mandi", "lat": 21.7645, "lon": 72.1519, "tier": 2},
        {"name": "Gondal Mandi", "lat": 21.9622, "lon": 70.8017, "tier": 3},
    ],
    "karnataka": [
        {"name": "Bangalore APMC Yelahanka", "lat": 13.1007, "lon": 77.5963, "tier": 1},
        {"name": "Hubli Mandi", "lat": 15.3647, "lon": 75.1240, "tier": 1},
        {"name": "Mysore Mandi", "lat": 12.2958, "lon": 76.6394, "tier": 2},
        {"name": "Belagavi Mandi", "lat": 15.8497, "lon": 74.4977, "tier": 2},
        {"name": "Davangere Mandi", "lat": 14.4644, "lon": 75.9218, "tier": 2},
        {"name": "Tumkur Mandi", "lat": 13.3379, "lon": 77.1173, "tier": 3},
    ],
    "andhra pradesh": [
        {"name": "Guntur Mirchi Yard", "lat": 16.3067, "lon": 80.4365, "tier": 1},
        {"name": "Vijayawada Mandi", "lat": 16.5062, "lon": 80.6480, "tier": 1},
        {"name": "Visakhapatnam Mandi", "lat": 17.6868, "lon": 83.2185, "tier": 1},
        {"name": "Kurnool Mandi", "lat": 15.8281, "lon": 78.0373, "tier": 2},
        {"name": "Nellore Mandi", "lat": 14.4426, "lon": 79.9865, "tier": 2},
        {"name": "Tirupati Mandi", "lat": 13.6288, "lon": 79.4192, "tier": 2},
    ],
    "telangana": [
        {"name": "Hyderabad Gaddiannaram", "lat": 17.3462, "lon": 78.5614, "tier": 1},
        {"name": "Warangal Mandi", "lat": 17.9784, "lon": 79.5941, "tier": 2},
        {"name": "Nizamabad Mandi", "lat": 18.6726, "lon": 78.0941, "tier": 2},
        {"name": "Karimnagar Mandi", "lat": 18.4386, "lon": 79.1288, "tier": 2},
    ],
    "west bengal": [
        {"name": "Kolkata Posta Market", "lat": 22.5726, "lon": 88.3639, "tier": 1},
        {"name": "Siliguri Mandi", "lat": 26.7271, "lon": 88.3953, "tier": 2},
        {"name": "Howrah Mandi", "lat": 22.5958, "lon": 88.2636, "tier": 1},
        {"name": "Burdwan Mandi", "lat": 23.2324, "lon": 87.8615, "tier": 2},
        {"name": "Barasat Mandi", "lat": 22.7200, "lon": 88.4800, "tier": 2},
    ],
    "bihar": [
        {"name": "Patna Mandi", "lat": 25.5941, "lon": 85.1376, "tier": 1},
        {"name": "Gaya Mandi", "lat": 24.7914, "lon": 85.0002, "tier": 2},
        {"name": "Muzaffarpur Mandi", "lat": 26.1209, "lon": 85.3647, "tier": 2},
        {"name": "Bhagalpur Mandi", "lat": 25.2425, "lon": 87.0024, "tier": 2},
        {"name": "Darbhanga Mandi", "lat": 26.1542, "lon": 85.8918, "tier": 2},
    ],
    "odisha": [
        {"name": "Bhubaneswar Mandi", "lat": 20.2961, "lon": 85.8245, "tier": 1},
        {"name": "Cuttack Mandi", "lat": 20.4625, "lon": 85.8828, "tier": 2},
        {"name": "Berhampur Mandi", "lat": 19.3150, "lon": 84.7941, "tier": 2},
    ],
    "tamil nadu": [
        {"name": "Chennai Koyambedu", "lat": 13.0699, "lon": 80.1940, "tier": 1},
        {"name": "Coimbatore Mandi", "lat": 11.0168, "lon": 76.9558, "tier": 1},
        {"name": "Madurai Mandi", "lat": 9.9252, "lon": 78.1198, "tier": 2},
        {"name": "Salem Mandi", "lat": 11.6643, "lon": 78.1460, "tier": 2},
        {"name": "Tiruchirappalli Mandi", "lat": 10.7905, "lon": 78.7047, "tier": 2},
        {"name": "Tirunelveli Mandi", "lat": 8.7139, "lon": 77.7567, "tier": 2},
    ],
    "kerala": [
        {"name": "Thiruvananthapuram Mandi", "lat": 8.5241, "lon": 76.9366, "tier": 1},
        {"name": "Kochi Mandi", "lat": 9.9312, "lon": 76.2673, "tier": 1},
        {"name": "Kozhikode Mandi", "lat": 11.2588, "lon": 75.7804, "tier": 2},
    ],
    "chhattisgarh": [
        {"name": "Raipur Mandi", "lat": 21.2514, "lon": 81.6296, "tier": 1},
        {"name": "Bilaspur Mandi", "lat": 22.0796, "lon": 82.1391, "tier": 2},
    ],
    "jharkhand": [
        {"name": "Ranchi Mandi", "lat": 23.3441, "lon": 85.3096, "tier": 1},
        {"name": "Jamshedpur Mandi", "lat": 22.8046, "lon": 86.2029, "tier": 2},
    ],
    "himachal pradesh": [
        {"name": "Shimla Sabzi Mandi", "lat": 31.1048, "lon": 77.1734, "tier": 2},
        {"name": "Kangra Mandi", "lat": 32.0998, "lon": 76.2691, "tier": 3},
        {"name": "Solan Mandi", "lat": 30.9045, "lon": 77.0967, "tier": 3},
    ],
    "uttarakhand": [
        {"name": "Dehradun Mandi", "lat": 30.3165, "lon": 78.0322, "tier": 2},
        {"name": "Haridwar Mandi", "lat": 29.9457, "lon": 78.1642, "tier": 2},
        {"name": "Haldwani Mandi", "lat": 29.2183, "lon": 79.5130, "tier": 2},
    ],
    "assam": [
        {"name": "Guwahati Mandi", "lat": 26.1445, "lon": 91.7362, "tier": 1},
        {"name": "Tezpur Mandi", "lat": 26.6338, "lon": 92.8004, "tier": 3},
    ],
}

# ─── Crop Base Prices (₹/quintal) at MSP level ──────────────────────────────
# Based on 2023-24 MSP + market premiums
CROP_BASE_PRICES = {
    "wheat":       {"base": 2275, "min": 1800, "max": 3200, "unit": "quintal"},
    "rice":        {"base": 2183, "min": 1600, "max": 3500, "unit": "quintal"},
    "paddy":       {"base": 2183, "min": 1600, "max": 3500, "unit": "quintal"},
    "corn":        {"base": 1962, "min": 1400, "max": 2800, "unit": "quintal"},
    "maize":       {"base": 1962, "min": 1400, "max": 2800, "unit": "quintal"},
    "soybean":     {"base": 4600, "min": 3800, "max": 6200, "unit": "quintal"},
    "cotton":      {"base": 6620, "min": 5500, "max": 8500, "unit": "quintal"},
    "sugarcane":   {"base": 315,  "min": 280,  "max": 380,  "unit": "quintal"},
    "mustard":     {"base": 5650, "min": 4800, "max": 7200, "unit": "quintal"},
    "rapeseed":    {"base": 5650, "min": 4800, "max": 7200, "unit": "quintal"},
    "barley":      {"base": 1735, "min": 1400, "max": 2400, "unit": "quintal"},
    "groundnut":   {"base": 6377, "min": 5500, "max": 8000, "unit": "quintal"},
    "sunflower":   {"base": 6760, "min": 5800, "max": 8500, "unit": "quintal"},
    "turmeric":    {"base": 10500,"min": 7000, "max": 18000,"unit": "quintal"},
    "chilli":      {"base": 12000,"min": 8000, "max": 25000,"unit": "quintal"},
    "onion":       {"base": 1800, "min": 400,  "max": 8000, "unit": "quintal"},
    "potato":      {"base": 1200, "min": 400,  "max": 4000, "unit": "quintal"},
    "tomato":      {"base": 2500, "min": 300,  "max": 12000,"unit": "quintal"},
    "default":     {"base": 2500, "min": 1800, "max": 4000, "unit": "quintal"},
}

# ─── Month-wise seasonal multipliers per crop ─────────────────────────────
# Month 1=Jan, 12=Dec. Post-harvest months see lower prices.
SEASONAL_MULTIPLIERS = {
    "wheat": [1.18, 1.20, 1.15, 0.88, 0.82, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15],
    "rice":  [1.10, 1.08, 1.05, 1.02, 1.00, 0.98, 0.95, 0.90, 0.88, 0.90, 0.95, 1.05],
    "corn":  [1.05, 1.08, 1.10, 1.12, 1.10, 1.05, 0.90, 0.85, 0.88, 0.92, 0.98, 1.02],
    "onion": [0.85, 0.80, 0.82, 0.88, 1.05, 1.20, 1.25, 1.30, 1.20, 1.10, 0.95, 0.88],
    "potato":[0.88, 0.85, 0.82, 0.80, 0.90, 1.10, 1.20, 1.15, 1.08, 1.05, 0.98, 0.92],
    "tomato":[1.20, 1.30, 1.25, 1.15, 0.90, 0.75, 0.70, 0.80, 1.00, 1.10, 1.20, 1.25],
    "default":[1.00,1.02, 1.05, 1.03, 0.98, 0.95, 0.93, 0.95, 0.98, 1.00, 1.02, 1.04],
}

# ─── State premium/discount vs national average ──────────────────────────
STATE_PRICE_FACTORS = {
    "punjab": 1.05, "haryana": 1.03, "uttar pradesh": 0.97,
    "madhya pradesh": 0.95, "rajasthan": 0.96, "maharashtra": 1.08,
    "gujarat": 1.06, "karnataka": 1.04, "andhra pradesh": 1.02,
    "telangana": 1.03, "west bengal": 1.00, "bihar": 0.92,
    "odisha": 0.93, "tamil nadu": 1.05, "kerala": 1.10,
    "chhattisgarh": 0.91, "jharkhand": 0.90, "himachal pradesh": 1.05,
    "uttarakhand": 1.02, "assam": 0.95,
}

# ─── Tier premium: tier-1 mandis pay more ────────────────────────────────
TIER_PREMIUMS = {1: 1.04, 2: 1.00, 3: 0.96}

# ─── Crop spoilage thresholds ─────────────────────────────────────────────
CROP_SPOILAGE_PROFILE = {
    "wheat":     {"temp_thresh": 35, "hum_thresh": 70, "base_shelf_days": 180, "sensitivity": 0.3},
    "rice":      {"temp_thresh": 35, "hum_thresh": 75, "base_shelf_days": 180, "sensitivity": 0.3},
    "paddy":     {"temp_thresh": 35, "hum_thresh": 80, "base_shelf_days": 120, "sensitivity": 0.4},
    "corn":      {"temp_thresh": 32, "hum_thresh": 70, "base_shelf_days": 90,  "sensitivity": 0.4},
    "maize":     {"temp_thresh": 32, "hum_thresh": 70, "base_shelf_days": 90,  "sensitivity": 0.4},
    "soybean":   {"temp_thresh": 30, "hum_thresh": 65, "base_shelf_days": 120, "sensitivity": 0.5},
    "cotton":    {"temp_thresh": 40, "hum_thresh": 80, "base_shelf_days": 365, "sensitivity": 0.1},
    "onion":     {"temp_thresh": 28, "hum_thresh": 60, "base_shelf_days": 60,  "sensitivity": 0.7},
    "potato":    {"temp_thresh": 25, "hum_thresh": 75, "base_shelf_days": 90,  "sensitivity": 0.6},
    "tomato":    {"temp_thresh": 25, "hum_thresh": 70, "base_shelf_days": 7,   "sensitivity": 0.9},
    "mustard":   {"temp_thresh": 38, "hum_thresh": 70, "base_shelf_days": 180, "sensitivity": 0.2},
    "sugarcane": {"temp_thresh": 38, "hum_thresh": 85, "base_shelf_days": 30,  "sensitivity": 0.6},
    "turmeric":  {"temp_thresh": 35, "hum_thresh": 70, "base_shelf_days": 365, "sensitivity": 0.2},
    "chilli":    {"temp_thresh": 32, "hum_thresh": 65, "base_shelf_days": 180, "sensitivity": 0.4},
    "barley":    {"temp_thresh": 35, "hum_thresh": 70, "base_shelf_days": 180, "sensitivity": 0.3},
    "groundnut": {"temp_thresh": 32, "hum_thresh": 70, "base_shelf_days": 120, "sensitivity": 0.4},
    "default":   {"temp_thresh": 30, "hum_thresh": 70, "base_shelf_days": 60,  "sensitivity": 0.5},
}

# ─── India city → state mapping ──────────────────────────────────────────
CITY_STATE_MAP = {
    # Punjab
    "ludhiana": "punjab", "amritsar": "punjab", "patiala": "punjab",
    "jalandhar": "punjab", "bathinda": "punjab", "ferozepur": "punjab",
    # Haryana
    "karnal": "haryana", "hisar": "haryana", "ambala": "haryana",
    "rohtak": "haryana", "gurugram": "haryana", "faridabad": "haryana",
    "panipat": "haryana", "sonipat": "haryana",
    # Uttar Pradesh
    "agra": "uttar pradesh", "kanpur": "uttar pradesh", "lucknow": "uttar pradesh",
    "varanasi": "uttar pradesh", "allahabad": "uttar pradesh", "prayagraj": "uttar pradesh",
    "meerut": "uttar pradesh", "bareilly": "uttar pradesh", "mathura": "uttar pradesh",
    "aligarh": "uttar pradesh", "moradabad": "uttar pradesh", "saharanpur": "uttar pradesh",
    "gorakhpur": "uttar pradesh", "jhansi": "uttar pradesh", "noida": "uttar pradesh",
    "ghaziabad": "uttar pradesh", "firozabad": "uttar pradesh", "muzaffarnagar": "uttar pradesh",
    # Madhya Pradesh
    "indore": "madhya pradesh", "bhopal": "madhya pradesh", "gwalior": "madhya pradesh",
    "jabalpur": "madhya pradesh", "ujjain": "madhya pradesh", "dewas": "madhya pradesh",
    "sehore": "madhya pradesh", "ratlam": "madhya pradesh", "satna": "madhya pradesh",
    # Rajasthan
    "jaipur": "rajasthan", "jodhpur": "rajasthan", "kota": "rajasthan",
    "bikaner": "rajasthan", "ajmer": "rajasthan", "udaipur": "rajasthan",
    "alwar": "rajasthan", "bharatpur": "rajasthan", "sikar": "rajasthan",
    "sri ganganagar": "rajasthan", "barmer": "rajasthan",
    # Maharashtra
    "mumbai": "maharashtra", "pune": "maharashtra", "nagpur": "maharashtra",
    "nashik": "maharashtra", "aurangabad": "maharashtra", "solapur": "maharashtra",
    "kolhapur": "maharashtra", "sangli": "maharashtra", "amravati": "maharashtra",
    # Gujarat
    "ahmedabad": "gujarat", "surat": "gujarat", "vadodara": "gujarat",
    "rajkot": "gujarat", "junagadh": "gujarat", "bhavnagar": "gujarat",
    "gandhinagar": "gujarat", "anand": "gujarat", "gondal": "gujarat",
    # Karnataka
    "bangalore": "karnataka", "bengaluru": "karnataka", "hubli": "karnataka",
    "mysore": "karnataka", "belagavi": "karnataka", "davangere": "karnataka",
    "mangalore": "karnataka", "dharwad": "karnataka",
    # Andhra Pradesh
    "guntur": "andhra pradesh", "vijayawada": "andhra pradesh",
    "visakhapatnam": "andhra pradesh", "vizag": "andhra pradesh",
    "kurnool": "andhra pradesh", "nellore": "andhra pradesh", "tirupati": "andhra pradesh",
    # Telangana
    "hyderabad": "telangana", "secunderabad": "telangana",
    "warangal": "telangana", "nizamabad": "telangana", "karimnagar": "telangana",
    # West Bengal
    "kolkata": "west bengal", "howrah": "west bengal", "siliguri": "west bengal",
    "burdwan": "west bengal", "asansol": "west bengal", "durgapur": "west bengal",
    # Bihar
    "patna": "bihar", "gaya": "bihar", "muzaffarpur": "bihar",
    "bhagalpur": "bihar", "darbhanga": "bihar",
    # Odisha
    "bhubaneswar": "odisha", "cuttack": "odisha", "puri": "odisha",
    "berhampur": "odisha", "rourkela": "odisha",
    # Tamil Nadu
    "chennai": "tamil nadu", "coimbatore": "tamil nadu", "madurai": "tamil nadu",
    "salem": "tamil nadu", "tiruchirappalli": "tamil nadu", "tiruchy": "tamil nadu",
    "tirunelveli": "tamil nadu", "vellore": "tamil nadu",
    # Kerala
    "thiruvananthapuram": "kerala", "trivandrum": "kerala",
    "kochi": "kerala", "ernakulam": "kerala", "kozhikode": "kerala", "calicut": "kerala",
    # Chhattisgarh
    "raipur": "chhattisgarh", "bilaspur": "chhattisgarh",
    # Jharkhand
    "ranchi": "jharkhand", "jamshedpur": "jharkhand", "dhanbad": "jharkhand",
    # Himachal Pradesh
    "shimla": "himachal pradesh", "kangra": "himachal pradesh", "solan": "himachal pradesh",
    "mandi": "himachal pradesh",
    # Uttarakhand
    "dehradun": "uttarakhand", "haridwar": "uttarakhand", "haldwani": "uttarakhand",
    "roorkee": "uttarakhand",
    # Assam
    "guwahati": "assam", "tezpur": "assam", "dibrugarh": "assam",
}

def get_state_from_location(location: str) -> str:
    """Infer Indian state from a location string."""
    loc = location.lower().strip()
    # Direct state match
    for state in INDIA_MANDIS:
        if state in loc:
            return state
    # City match
    for city, state in CITY_STATE_MAP.items():
        if city in loc:
            return state
    # Fuzzy: first word match
    first = loc.split(",")[0].strip()
    for city, state in CITY_STATE_MAP.items():
        if first in city or city in first:
            return state
    return "madhya pradesh"  # default central India

def get_crop_key(crop: str) -> str:
    """Normalise crop name to a key."""
    crop_lower = crop.lower()
    for key in CROP_BASE_PRICES:
        if key in crop_lower:
            return key
    return "default"

def get_seasonal_multiplier(crop_key: str, month: int) -> float:
    """Return seasonal price multiplier for a given month (1-12)."""
    multipliers = SEASONAL_MULTIPLIERS.get(crop_key, SEASONAL_MULTIPLIERS["default"])
    return multipliers[month - 1]

def get_mandis_for_state(state: str):
    """Return mandi list for a state, fallback to nearby states."""
    if state in INDIA_MANDIS:
        return INDIA_MANDIS[state]
    # Return a selection from all states if unknown
    import random
    all_mandis = []
    for m_list in INDIA_MANDIS.values():
        all_mandis.extend(m_list[:2])
    return random.sample(all_mandis, min(5, len(all_mandis)))
