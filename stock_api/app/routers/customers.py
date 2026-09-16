from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Customer
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/customers", tags=["customers"])

class CustomerCreate(BaseModel):
    name: str
    contact: str
    location: str
    category: str  # "Farmer", "Agrovet", "Company", "Other"

class CustomerResponse(BaseModel):
    id: int
    name: str
    contact: str
    location: str
    category: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=list[CustomerResponse])
def get_all_customers(db: Session = Depends(get_db)):
    """Get all active customers"""
    return db.query(Customer).filter(Customer.is_active == True).order_by(Customer.name).all()

@router.get("/by-category/{category}", response_model=list[CustomerResponse])
def get_customers_by_category(category: str, db: Session = Depends(get_db)):
    """Get customers by category"""
    return db.query(Customer).filter(
        Customer.category == category,
        Customer.is_active == True
    ).order_by(Customer.name).all()

@router.post("", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer"""
    # Check if customer with same name and contact already exists
    existing = db.query(Customer).filter(
        Customer.name == customer.name,
        Customer.contact == customer.contact
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Customer with this name and contact already exists")

    db_customer = Customer(**customer.dict(), is_active=True)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerCreate, db: Session = Depends(get_db)):
    """Update a customer"""
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for key, value in customer.dict().items():
        setattr(db_customer, key, value)

    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete (deactivate) a customer"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.is_active = False
    db.commit()
    return {"message": "Customer deleted"}

@router.get("/search/{query}", response_model=list[CustomerResponse])
def search_customers(query: str, db: Session = Depends(get_db)):
    """Search customers by name or contact"""
    return db.query(Customer).filter(
        (Customer.name.ilike(f"%{query}%") | Customer.contact.ilike(f"%{query}%")),
        Customer.is_active == True
    ).limit(20).all()
