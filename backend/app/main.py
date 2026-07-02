import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from app.routers import auth, stego, dashboard
from app.models import database, models

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="StegoVault API",
    description="Secure AI-powered Image Steganography Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "https://stego-vault-khaki.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
for directory in ["uploads", "encoded_images", "decoded_data"]:
    os.makedirs(directory, exist_ok=True)

# Mount static files for access to encoded images
app.mount("/encoded_images", StaticFiles(directory="encoded_images"), name="encoded_images")

@app.get("/")
async def root():
    return {"message": "Welcome to StegoVault API", "status": "healthy"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(stego.router, prefix="/api/stego", tags=["Steganography"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
