# CropSense AI 🌾

A production-ready full-stack AI platform designed to help farmers decide optimal harvest timing, best mandis, spoilage risk, and price predictions.

## Architecture & Tech Stack

**Backend**: Python, FastAPI, MongoDB (Motor), Pandas, Scikit-learn, Prophet  
**Frontend**: React (Vite), TailwindCSS, Recharts, Axios, Lucide React

## Features

- **Price Forecasting**: 7-day prediction using ML models.
- **Market Recommendation**: Recommends the best Mandi based on price and transit.
- **Spoilage Risk**: Evaluates the probability of crop spoilage based on weather forecasts.
- **Weather Integration**: Local weather details indicating humidity, temperature, and rainfall.

## Hackathon Enhancements Planned
*(See `backend/app/services/integrations.py` for placeholders)*
1. **SMS & WhatsApp Alerts**: Notify farmers offline.
2. **Regional Language Output**: (e.g., Hindi, Marathi) for accessibility.
3. **Explainable AI (XAI)**: Understand *why* an AI made a suggestion.

## Setup Instructions

### 1. Database Setup
1. Install MongoDB and run it locally, or use MongoDB Atlas.
2. The app uses `mongodb://localhost:27017` by default.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\\Scripts\\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI Server
uvicorn app.main:app --reload
```
API will run on `http://localhost:8000`.  
View Swagger docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App will run on `http://localhost:5173`.
