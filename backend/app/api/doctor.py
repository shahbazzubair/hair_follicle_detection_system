import os
import shutil
import uuid
from datetime import datetime

import numpy as np
from PIL import Image
from bson import ObjectId
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.core.database import db

# --- AI MODEL INITIALIZATION ---
hair_model = None
try:
    import tensorflow as tf
    MODEL_PATH = "ai_model/hair_model.h5"
    if os.path.exists(MODEL_PATH):
        hair_model = tf.keras.models.load_model(MODEL_PATH)
        print("✅ AI Model Loaded Successfully!")
    else:
        print(f"⚠️ AI Model file not found at: {MODEL_PATH}")
except Exception as e:
    print(f"⚠️ AI Model Loading Error: {e}")

router = APIRouter()
scan_collection = db["scans"]

# --- HELPER FUNCTIONS ---
def analyze_image_with_ai(image_path: str):
    if hair_model is None:
        raise HTTPException(status_code=503, detail="Pretrained AI model is not available.")
    
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Target scan image file missing on server.")

    try:
        img = Image.open(image_path).convert("RGB")
        img = img.resize((224, 224))
        
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = hair_model.predict(img_array)
        class_names = [
            "Norwood Stage 1", "Norwood Stage 2", "Norwood Stage 3",
            "Norwood Stage 4", "Norwood Stage 5", "Norwood Stage 6", 
            "Norwood Stage 7"
        ]
        
        predicted_index = np.argmax(predictions[0])
        if predicted_index < len(class_names):
            return class_names[predicted_index]
        return "Analysis Complete"

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail="Error during AI processing.")

# --- ROUTES ---

@router.get("/data/{doctor_name}")
async def get_doctor_data(doctor_name: str):
    scans_cursor = scan_collection.find({"doctorName": doctor_name})
    all_scans = await scans_cursor.to_list(length=500)

    pending_scans = []
    completed_reports = []

    for scan in all_scans:
        scan_data = {
            "id": str(scan["_id"]),
            "patientName": scan.get("patientName"),
            "imagePath": scan.get("imagePath"),
            "status": scan.get("status"),
            "date": scan.get("date"),
            "baldnessStage": scan.get("baldnessStage", ""),
            "doctorId": scan.get("doctorId"),
            "isDirectAnalysis": scan.get("isDirectAnalysis", False)
        }
        if scan.get("status") == "Pending":
            pending_scans.append(scan_data)
        elif scan.get("status") == "Processed":
            completed_reports.append(scan_data)

    return {"scans": pending_scans, "reports": completed_reports}

@router.put("/process-scan/{scan_id}")
async def process_scan(scan_id: str):
    scan = await scan_collection.find_one({"_id": ObjectId(scan_id)})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    local_image_path = scan["imagePath"].lstrip("/")
    ai_result = analyze_image_with_ai(local_image_path)

    await scan_collection.update_one(
        {"_id": ObjectId(scan_id)},
        {"$set": {"status": "Processed", "baldnessStage": ai_result}}
    )
    return {"status": "success", "message": "Scan processed successfully"}

@router.post("/direct-analysis")
async def direct_analysis(
    doctorName: str = Form(...),
    patientName: str = Form(...),
    image: UploadFile = File(...)
):
    upload_dir = "static/uploads/scans"
    os.makedirs(upload_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4()}_{image.filename}"
    local_path = os.path.join(upload_dir, unique_filename)

    with open(local_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    ai_result = analyze_image_with_ai(local_path)

    scan_doc = {
        "patientName": patientName,
        "doctorId": "Direct",
        "doctorName": doctorName,
        "imagePath": f"/{upload_dir}/{unique_filename}",
        "status": "Processed",
        "baldnessStage": ai_result,
        "isDirectAnalysis": True,
        "date": datetime.utcnow().isoformat()
    }
    await scan_collection.insert_one(scan_doc)
    return {"status": "success"}

@router.get("/profile/{doctor_name}")
async def get_profile(doctor_name: str):
    doctor = await db["users"].find_one({
        "fullName": {"$regex": f"^{doctor_name.strip()}$", "$options": "i"}
    })
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return {
        "_id": str(doctor["_id"]),
        "fullName": doctor.get("fullName", ""),
        "speciality": doctor.get("speciality", doctor.get("specialization", "")),
        "contactNumber": doctor.get("contactNumber", doctor.get("phone", "")),
        "profileImage": doctor.get("profileImage", ""),
        "weeklySchedule": doctor.get("weeklySchedule", [])
    }

@router.post("/upload-profile-image")
async def upload_profile_image(file: UploadFile = File(...)):
    upload_dir = "static/uploads/profile"
    os.makedirs(upload_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"imagePath": f"/static/uploads/profile/{unique_filename}"}

@router.put("/update-profile")
async def update_profile(data: dict):
    doctor_name = data.get("doctorName", "").strip()
    if not doctor_name:
        raise HTTPException(status_code=400, detail="Doctor name is required")

    doctor = await db["users"].find_one({
        "fullName": {"$regex": f"^{doctor_name}$", "$options": "i"},
        "role": "doctor"
    })
    if not doctor:
        raise HTTPException(status_code=404, detail=f"Doctor '{doctor_name}' not found in database")

    update_data = {
        "specialization": data.get("speciality", ""),
        "phone": data.get("contactNumber", ""),
        "weeklySchedule": data.get("weeklySchedule", []),
        "profileImage": data.get("profileImage", "")
    }

    await db["users"].update_one({"_id": doctor["_id"]}, {"$set": update_data})
    return {"status": "success", "message": "Doctor profile updated successfully"}

@router.get("/all-doctors")
async def get_all_doctors():
    doctors_cursor = db["users"].find({"role": "doctor"})
    doctors = await doctors_cursor.to_list(length=100)

    return [
        {
            "id": str(doctor["_id"]),
            "fullName": doctor.get("fullName", ""),
            "speciality": doctor.get("specialization", ""),
            "contactNumber": doctor.get("phone", ""),
            "profileImage": doctor.get("profileImage", ""),
            "weeklySchedule": doctor.get("weeklySchedule", [])
        }
        for doctor in doctors
    ]