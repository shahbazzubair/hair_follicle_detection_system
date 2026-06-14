import motor.motor_asyncio

MONGO_URL = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.hair_follicle_db 

user_collection = db.users
scan_collection = db.scans
report_collection = db.reports

print("✅ Database connection established: hair_follicle_db")