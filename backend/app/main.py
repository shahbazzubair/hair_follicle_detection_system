import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import db
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.patient import router as patient_router
from app.api.doctor import router as doctor_router

app = FastAPI(title="HFD AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(patient_router, prefix="/api/patient", tags=["Patient"])
app.include_router(doctor_router, prefix="/api/doctor", tags=["Doctor"])

@app.on_event("startup")
async def startup_db_client():
    print("🚀 FastAPI Server Started!")
    print("🔌 Database connected successfully.")

@app.get("/")
async def root():
    return {"status": "online", "message": "Welcome to the HFD AI!"}