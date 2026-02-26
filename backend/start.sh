#!/bin/bash
# Start script for Railway or manual server runs
export PORT="${PORT:-5000}"
echo "Starting CropSense AI Backend on 0.0.0.0:$PORT"
uvicorn app.main:app --host 0.0.0.0 --port $PORT
