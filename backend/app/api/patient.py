import os
import shutil
import uuid
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.core.database import user_collection, db

router = APIRouter()
scan_collection = db["scans"]

# --- ROUTES ---

@router.get("/doctors")
async def get_verified_doctors():
    # Enhanced: Aligned status with admin.py ("Approved" instead of "Verified")
    doctors_cursor = user_collection.find({"role": "doctor", "status": "Approved"})
    doctors = await doctors_cursor.to_list(length=100)
    return [
        {
            "id": str(doc["_id"]),
            "fullName": doc.get("fullName"),
            "specialization": doc.get("specialization")
        } for doc in doctors
    ]

@router.get("/data/{username}")
async def get_patient_data(username: str):
    scans_cursor = scan_collection.find({"patientName": username})
    scans = await scans_cursor.to_list(length=100)
    
    formatted_scans = []
    formatted_reports = []
    
    for scan in scans:
        scan_data = {
            "id": str(scan["_id"]),
            "patientName": scan.get("patientName"),
            "doctorName": scan.get("doctorName"),
            "imagePath": scan.get("imagePath"),
            "status": scan.get("status"),
            "date": scan.get("date")
        }
        formatted_scans.append(scan_data)
        
        if scan.get("status") == "Processed":
            formatted_reports.append({
                "scanId": str(scan["_id"]),
                "patientName": scan.get("patientName"),
                "doctorName": scan.get("doctorName"),
                "baldnessStage": scan.get("baldnessStage", "Results Pending"),
                "date": scan.get("date")
            })
            
    return {"scans": formatted_scans, "reports": formatted_reports}

@router.post("/upload-scan")
async def upload_scan(
    patientName: str = Form(...),
    doctorId: str = Form(...),
    image: UploadFile = File(...)
):
    # Enhanced: Safeguard against malformed or missing BSON ObjectIds
    if not ObjectId.is_valid(doctorId):
        raise HTTPException(status_code=400, detail="Invalid Doctor ID format.")

    doctor = await user_collection.find_one({"_id": ObjectId(doctorId)})
    if not doctor:
        raise HTTPException(status_code=44, detail="Selected doctor does not exist.")
        
    doctor_name = doctor.get("fullName", "Unknown")

    upload_dir = "static/uploads/scans"
    os.makedirs(upload_dir, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4()}_{image.filename}"
    file_path = f"/{upload_dir}/{unique_filename}"
    local_path = os.path.join(upload_dir, unique_filename)
    
    with open(local_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    scan_doc = {
        "patientName": patientName,
        "doctorId": doctorId,
        "doctorName": doctor_name,
        "imagePath": file_path,
        "status": "Pending",
        "date": datetime.utcnow().isoformat()
    }
    await scan_collection.insert_one(scan_doc)
    
    return {"status": "success", "message": "Scan uploaded and saved to database."}