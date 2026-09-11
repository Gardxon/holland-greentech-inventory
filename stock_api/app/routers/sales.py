from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/sales", tags=["sales"])

@router.post("/", response_model=schemas.Sales)
def create_sale(sale: schemas.SalesCreate, user_id: int = Query(1), db: Session = Depends(get_db)):
    inventory = db.query(models.InventoryLevel).filter(
        models.InventoryLevel.branch_id == sale.branch_id,
        models.InventoryLevel.product_id == sale.product_id
    ).first()

    if not inventory or inventory.quantity_on_hand < sale.quantity_sold:
        raise HTTPException(status_code=400, detail="Insufficient inventory")

    inventory.quantity_on_hand -= sale.quantity_sold

    sale_record = models.Sales(
        product_id=sale.product_id,
        branch_id=sale.branch_id,
        customer_id=sale.customer_id,
        quantity_sold=sale.quantity_sold,
        unit_price=sale.unit_price,
        total_amount=sale.quantity_sold * sale.unit_price,
        payment_method=sale.payment_method,
        currency=sale.currency,
        notes=sale.notes,
        created_by=user_id
    )
    db.add(sale_record)
    db.commit()
    db.refresh(sale_record)
    return sale_record

@router.get("/", response_model=List[schemas.Sales])
def get_sales(skip: int = Query(0), limit: int = Query(50), branch_id: int = None,
              start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Sales)

    if branch_id:
        query = query.filter(models.Sales.branch_id == branch_id)

    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(models.Sales.created_at >= start)

    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(models.Sales.created_at <= end)

    return query.order_by(models.Sales.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/summary")
def get_sales_summary(days: int = Query(30), db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=days)
    sales = db.query(models.Sales).filter(models.Sales.created_at >= start_date).all()

    total_sales = sum(s.total_amount for s in sales)
    total_quantity = sum(s.quantity_sold for s in sales)
    transaction_count = len(sales)

    return {
        "total_sales_amount": total_sales,
        "total_quantity_sold": total_quantity,
        "transaction_count": transaction_count,
        "average_transaction": total_sales / transaction_count if transaction_count > 0 else 0,
        "period_days": days
    }
