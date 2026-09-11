from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter(prefix="/stock-requests", tags=["stock-requests"])

@router.post("/", response_model=schemas.StockRequest)
def create_stock_request(request: schemas.StockRequestCreate, user_id: int = Query(1),
                         db: Session = Depends(get_db)):
    stock_req = models.StockRequest(
        product_id=request.product_id,
        from_branch_id=request.from_branch_id,
        to_branch_id=request.to_branch_id,
        quantity=request.quantity,
        reason=request.reason,
        created_by=user_id,
        status="pending"
    )
    db.add(stock_req)
    db.commit()
    db.refresh(stock_req)
    return stock_req

@router.get("/", response_model=List[schemas.StockRequest])
def get_stock_requests(skip: int = Query(0), limit: int = Query(50),
                       branch_id: int = None, status: str = None,
                       db: Session = Depends(get_db)):
    query = db.query(models.StockRequest)

    if branch_id:
        query = query.filter(
            (models.StockRequest.from_branch_id == branch_id) |
            (models.StockRequest.to_branch_id == branch_id)
        )

    if status:
        query = query.filter(models.StockRequest.status == status)

    return query.order_by(models.StockRequest.created_at.desc()).offset(skip).limit(limit).all()

@router.patch("/{request_id}/approve")
def approve_stock_request(request_id: int, db: Session = Depends(get_db)):
    stock_req = db.query(models.StockRequest).filter(models.StockRequest.id == request_id).first()
    if not stock_req:
        raise HTTPException(status_code=404, detail="Request not found")

    inventory = db.query(models.InventoryLevel).filter(
        models.InventoryLevel.branch_id == stock_req.from_branch_id,
        models.InventoryLevel.product_id == stock_req.product_id
    ).first()

    if not inventory or inventory.quantity_on_hand < stock_req.quantity:
        stock_req.status = "rejected"
        db.commit()
        return {"status": "rejected", "reason": "Insufficient inventory"}

    inventory.quantity_on_hand -= stock_req.quantity

    to_inventory = db.query(models.InventoryLevel).filter(
        models.InventoryLevel.branch_id == stock_req.to_branch_id,
        models.InventoryLevel.product_id == stock_req.product_id
    ).first()

    if to_inventory:
        to_inventory.quantity_on_hand += stock_req.quantity
    else:
        to_inventory = models.InventoryLevel(
            branch_id=stock_req.to_branch_id,
            product_id=stock_req.product_id,
            quantity_on_hand=stock_req.quantity
        )
        db.add(to_inventory)

    stock_req.status = "fulfilled"
    db.commit()
    return {"status": "fulfilled", "message": "Stock transferred successfully"}

@router.patch("/{request_id}/reject")
def reject_stock_request(request_id: int, db: Session = Depends(get_db)):
    stock_req = db.query(models.StockRequest).filter(models.StockRequest.id == request_id).first()
    if not stock_req:
        raise HTTPException(status_code=404, detail="Request not found")

    stock_req.status = "rejected"
    db.commit()
    return {"status": "rejected"}
