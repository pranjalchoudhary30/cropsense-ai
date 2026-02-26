from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.database import connect_to_mongo, close_mongo_connection
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await connect_to_mongo()
    yield
    # Shutdown logic
    await close_mongo_connection()

app = FastAPI(title="CropSense AI API", version="1.0.0", lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error occurred.", "details": str(exc)}
    )

# Health endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "CropSense AI API"}

# Include Routers
from app.routes import prediction, weather, recommendation, spoilage, crop

app.include_router(prediction.router)
app.include_router(weather.router)
app.include_router(recommendation.router)
app.include_router(spoilage.router)
app.include_router(crop.router)

