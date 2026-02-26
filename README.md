# 🌾 CropSense AI  
### Smarter Harvest. Better Profits.

CropSense AI is an AI-powered agricultural intelligence platform that helps farmers decide **when to harvest** and **where to sell** their crops by analyzing historical mandi price data, weather forecasts, and predictive models.

Our mission is to reduce post-harvest losses and maximize farmer income through data-driven decision support.

---

## 🚀 Problem Statement

Farmers often face:

- Unpredictable mandi price fluctuations  
- Weather uncertainty affecting harvest timing  
- Poor market selection  
- Post-harvest spoilage losses  

Studies suggest up to **30–40% of produce loss** occurs due to poor timing and market mismatch.

CropSense AI provides intelligent, explainable recommendations to solve this problem.

---

## 🧠 How CropSense AI Works

1. Farmer selects crop and location  
2. System analyzes:
   - Historical mandi price trends  
   - Real-time weather forecasts  
   - Market demand patterns  
3. AI predicts:
   - Expected price (next 7 days)  
   - Best mandi to sell  
   - Expected profit  
   - Spoilage risk probability  
4. System provides a clear explanation of why the recommendation was made  

---

## 🏗 Tech Stack

### Backend
- Python
- FastAPI
- MongoDB
- Pandas
- Scikit-learn
- Prophet (Time Series Forecasting)

### Frontend
- React (Vite)
- Axios
- Chart.js / Recharts
- Responsive modern UI

### Database
- MongoDB (NoSQL, scalable)

---

## 📂 Project Structure

```
cropsense-ai/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── database.py
│   │   ├── main.py
│   │
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│
└── README.md
```

---

## 🔌 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|------------|
| `/health` | GET | System status |
| `/predict-price` | POST | Predict crop price (7 days) |
| `/weather` | GET | Weather forecast |
| `/recommend-market` | POST | Best mandi recommendation |
| `/spoilage-risk` | POST | Spoilage probability |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/cropsense-ai.git
cd cropsense-ai
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create a `.env` file inside backend folder:

```
MONGO_URI=your_mongodb_connection_string
WEATHER_API_KEY=your_weather_api_key
```

Backend runs at:
```
http://localhost:8000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

## 📊 Features

✔ AI-based price prediction  
✔ Weather-based harvest insights  
✔ Market (mandi) comparison  
✔ Profit estimation  
✔ Spoilage risk calculation  
✔ Explainable AI recommendations  
✔ Clean, farmer-friendly dashboard  

---

## 🎯 Hackathon Objective

CropSense AI is designed as a scalable AgriTech solution that:

- Increases farmer profitability  
- Reduces food waste  
- Encourages data-driven agriculture  
- Can scale across India  

---

## 🔮 Future Improvements

- Regional language support  
- SMS / WhatsApp alerts  
- Mobile app version  
- Real-time mandi data scraping  
- Map-based mandi visualization  
- AI chatbot assistant  

---

## 👥 Team

Developed by Tech crew

---

## 📜 License

This project is built for educational and hackathon purposes.
