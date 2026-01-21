from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class Material(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    quantity: int
    unit_cost: float
    line_total: float = 0

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str = ""
    address: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    address: str = ""

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    customer_phone: str
    customer_address: str
    job_type: str  # Residential Service / Panel Upgrade / EV Charger / Commercial
    status: str = "Quoted"  # Quoted / Scheduled / In Progress / Complete
    materials: List[Material] = []
    labor_hours: float = 0
    labor_rate: float = 85.0
    markup_percent: float = 20.0
    materials_total: float = 0
    labor_total: float = 0
    quote_total: float = 0
    photos: List[str] = []
    notes: str = ""
    scheduled_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class JobCreate(BaseModel):
    customer_id: str
    customer_name: str
    customer_phone: str
    customer_address: str
    job_type: str
    materials: List[Material] = []
    labor_hours: float = 0
    notes: str = ""
    scheduled_date: Optional[str] = None

class JobUpdate(BaseModel):
    status: Optional[str] = None
    materials: Optional[List[Material]] = None
    labor_hours: Optional[float] = None
    notes: Optional[str] = None
    scheduled_date: Optional[str] = None
    markup_percent: Optional[float] = None

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    customer_id: str
    customer_name: str
    amount: float
    status: str = "Pending"  # Pending / Paid / Overdue
    due_date: str
    paid_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class InvoiceCreate(BaseModel):
    job_id: str
    customer_id: str
    customer_name: str
    amount: float
    due_date: str

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    paid_date: Optional[str] = None

class AIEstimateRequest(BaseModel):
    job_type: str
    photo_count: int = 1

class AIEstimateResponse(BaseModel):
    materials: List[Material]
    labor_hours: float
    confidence: float

# ============= HELPER FUNCTIONS =============

def calculate_job_totals(materials: List[Material], labor_hours: float, labor_rate: float, markup_percent: float):
    materials_total = sum(m.quantity * m.unit_cost for m in materials)
    labor_total = labor_hours * labor_rate
    subtotal = materials_total + labor_total
    quote_total = subtotal * (1 + markup_percent / 100)
    return materials_total, labor_total, quote_total

# Mock AI estimation data
MOCK_MATERIALS = {
    "Residential Service": [
        {"name": "20A Circuit Breaker", "quantity": 2, "unit_cost": 12.99},
        {"name": "12/2 Romex Wire (100ft)", "quantity": 1, "unit_cost": 89.99},
        {"name": "Outlet Receptacle", "quantity": 4, "unit_cost": 3.49},
        {"name": "Wire Nuts (box)", "quantity": 1, "unit_cost": 8.99},
        {"name": "Electrical Box", "quantity": 4, "unit_cost": 2.99},
    ],
    "Panel Upgrade": [
        {"name": "200A Main Panel", "quantity": 1, "unit_cost": 289.99},
        {"name": "200A Main Breaker", "quantity": 1, "unit_cost": 89.99},
        {"name": "Grounding Rod (8ft)", "quantity": 2, "unit_cost": 18.99},
        {"name": "#4 Copper Ground Wire (25ft)", "quantity": 1, "unit_cost": 124.99},
        {"name": "Panel Cover", "quantity": 1, "unit_cost": 34.99},
        {"name": "Wire Connectors Kit", "quantity": 1, "unit_cost": 24.99},
    ],
    "EV Charger": [
        {"name": "Level 2 EV Charger (48A)", "quantity": 1, "unit_cost": 549.99},
        {"name": "50A Circuit Breaker", "quantity": 1, "unit_cost": 34.99},
        {"name": "6/3 Wire (50ft)", "quantity": 1, "unit_cost": 189.99},
        {"name": "NEMA 14-50 Outlet", "quantity": 1, "unit_cost": 24.99},
        {"name": "Weatherproof Box", "quantity": 1, "unit_cost": 19.99},
    ],
    "Commercial": [
        {"name": "Commercial Panel 400A", "quantity": 1, "unit_cost": 899.99},
        {"name": "LED Panel Light (4x2)", "quantity": 8, "unit_cost": 64.99},
        {"name": "EMT Conduit 3/4\" (10ft)", "quantity": 12, "unit_cost": 8.99},
        {"name": "Conduit Fittings Kit", "quantity": 2, "unit_cost": 45.99},
        {"name": "Wire #10 THHN (500ft)", "quantity": 2, "unit_cost": 189.99},
        {"name": "Commercial Outlets (20A)", "quantity": 12, "unit_cost": 12.99},
    ]
}

MOCK_LABOR_HOURS = {
    "Residential Service": 4,
    "Panel Upgrade": 8,
    "EV Charger": 5,
    "Commercial": 16
}

# ============= ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "VoltMaster Pro API"}

# ----- Customers -----

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    customer_obj = Customer(**customer.model_dump())
    doc = customer_obj.model_dump()
    await db.customers.insert_one(doc)
    return customer_obj

@api_router.get("/customers", response_model=List[Customer])
async def get_customers():
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted"}

# ----- Jobs -----

@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate):
    materials = [Material(**m.model_dump()) for m in job_data.materials]
    for m in materials:
        m.line_total = m.quantity * m.unit_cost
    
    materials_total, labor_total, quote_total = calculate_job_totals(
        materials, job_data.labor_hours, 85.0, 20.0
    )
    
    job = Job(
        customer_id=job_data.customer_id,
        customer_name=job_data.customer_name,
        customer_phone=job_data.customer_phone,
        customer_address=job_data.customer_address,
        job_type=job_data.job_type,
        materials=materials,
        labor_hours=job_data.labor_hours,
        materials_total=materials_total,
        labor_total=labor_total,
        quote_total=quote_total,
        notes=job_data.notes,
        scheduled_date=job_data.scheduled_date
    )
    
    doc = job.model_dump()
    await db.jobs.insert_one(doc)
    return job

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(status: Optional[str] = None):
    query = {}
    if status and status != "All":
        if status == "Active":
            query["status"] = {"$in": ["Scheduled", "In Progress"]}
        else:
            query["status"] = status
    jobs = await db.jobs.find(query, {"_id": 0}).to_list(1000)
    return jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.put("/jobs/{job_id}", response_model=Job)
async def update_job(job_id: str, update_data: JobUpdate):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if "materials" in update_dict:
        materials = [Material(**m) if isinstance(m, dict) else m for m in update_dict["materials"]]
        for m in materials:
            m.line_total = m.quantity * m.unit_cost
        update_dict["materials"] = [m.model_dump() for m in materials]
        
        labor_hours = update_dict.get("labor_hours", job["labor_hours"])
        markup = update_dict.get("markup_percent", job["markup_percent"])
        materials_total, labor_total, quote_total = calculate_job_totals(
            materials, labor_hours, job["labor_rate"], markup
        )
        update_dict["materials_total"] = materials_total
        update_dict["labor_total"] = labor_total
        update_dict["quote_total"] = quote_total
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.jobs.update_one({"id": job_id}, {"$set": update_dict})
    updated_job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    return updated_job

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    result = await db.jobs.delete_one({"id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted"}

# ----- Invoices -----

@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate):
    invoice = Invoice(**invoice_data.model_dump())
    doc = invoice.model_dump()
    await db.invoices.insert_one(doc)
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(status: Optional[str] = None):
    query = {}
    if status and status != "All":
        query["status"] = status
    invoices = await db.invoices.find(query, {"_id": 0}).to_list(1000)
    return invoices

@api_router.put("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, update_data: InvoiceUpdate):
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    await db.invoices.update_one({"id": invoice_id}, {"$set": update_dict})
    updated_invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    return updated_invoice

# ----- AI Estimation (MOCK) -----

@api_router.post("/estimate", response_model=AIEstimateResponse)
async def generate_estimate(request: AIEstimateRequest):
    """Mock AI estimation - returns predefined materials based on job type"""
    job_type = request.job_type
    if job_type not in MOCK_MATERIALS:
        job_type = "Residential Service"
    
    # Create materials with random slight variations
    materials = []
    for m in MOCK_MATERIALS[job_type]:
        quantity = m["quantity"] + random.randint(-1, 2)
        if quantity < 1:
            quantity = 1
        materials.append(Material(
            name=m["name"],
            quantity=quantity,
            unit_cost=m["unit_cost"],
            line_total=quantity * m["unit_cost"]
        ))
    
    labor_hours = MOCK_LABOR_HOURS.get(job_type, 4) + random.uniform(-1, 2)
    confidence = 0.85 + random.uniform(0, 0.12)
    
    return AIEstimateResponse(
        materials=materials,
        labor_hours=round(labor_hours, 1),
        confidence=round(confidence, 2)
    )

# ----- Stats -----

@api_router.get("/stats")
async def get_stats():
    """Get dashboard statistics"""
    from datetime import timedelta
    
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()
    
    # Get all jobs
    all_jobs = await db.jobs.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate stats
    active_jobs = len([j for j in all_jobs if j.get("status") in ["Scheduled", "In Progress"]])
    pending_quotes = len([j for j in all_jobs if j.get("status") == "Quoted"])
    
    # This week's revenue (completed jobs)
    completed_this_week = [
        j for j in all_jobs 
        if j.get("status") == "Complete" and j.get("updated_at", "") >= week_ago
    ]
    week_revenue = sum(j.get("quote_total", 0) for j in completed_this_week)
    
    return {
        "week_revenue": round(week_revenue, 2),
        "active_jobs": active_jobs,
        "pending_quotes": pending_quotes,
        "total_jobs": len(all_jobs)
    }

# ----- PDF Generation (MOCK) -----

@api_router.post("/jobs/{job_id}/generate-pdf")
async def generate_pdf(job_id: str):
    """Mock PDF generation - returns success message"""
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "message": "Quote PDF generated successfully",
        "filename": f"quote_{job_id[:8]}.pdf",
        "job_id": job_id,
        "mock": True
    }

# ============= APP SETUP =============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
