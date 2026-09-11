from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db
from app import models, schemas
from datetime import datetime

router = APIRouter(prefix="/movements", tags=["stock_movements"])

@router.post("/", response_model=schemas.StockMovement)
def create_stock_movement(movement: schemas.StockMovementCreate, user_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if movement.from_branch_id:
        from_branch = db.query(models.Branch).filter(models.Branch.id == movement.from_branch_id).first()
        if not from_branch:
            raise HTTPException(status_code=404, detail="From branch not found")

    to_branch = db.query(models.Branch).filter(models.Branch.id == movement.to_branch_id).first()
    if not to_branch:
        raise HTTPException(status_code=404, detail="To branch not found")

    if movement.from_branch_id:
        from_inventory = db.query(models.InventoryLevel).filter(
            and_(
                models.InventoryLevel.branch_id == movement.from_branch_id,
                models.InventoryLevel.product_id == movement.product_id
            )
        ).first()

        if not from_inventory or from_inventory.quantity_on_hand < movement.quantity:
            raise HTTPException(status_code=400, detail="Insufficient inventory at source branch")

        from_inventory.quantity_on_hand -= movement.quantity
        from_inventory.last_updated = datetime.utcnow()

    to_inventory = db.query(models.InventoryLevel).filter(
        and_(
            models.InventoryLevel.branch_id == movement.to_branch_id,
            models.InventoryLevel.product_id == movement.product_id
        )
    ).first()

    if not to_inventory:
        to_inventory = models.InventoryLevel(
            branch_id=movement.to_branch_id,
            product_id=movement.product_id,
            quantity_on_hand=0
        )
        db.add(to_inventory)

    to_inventory.quantity_on_hand += movement.quantity
    to_inventory.last_updated = datetime.utcnow()

    db_movement = models.StockMovement(
        product_id=movement.product_id,
        from_branch_id=movement.from_branch_id,
        to_branch_id=movement.to_branch_id,
        quantity=movement.quantity,
        movement_type=movement.movement_type,
        reference_number=movement.reference_number,
        notes=movement.notes,
        created_by=user_id
    )

    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

@router.get("/", response_model=list[schemas.StockMovement])
def list_movements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.StockMovement).order_by(models.StockMovement.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/branch/{branch_id}", response_model=list[schemas.StockMovement])
def get_branch_movements(branch_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.StockMovement).filter(
        models.StockMovement.to_branch_id == branch_id
    ).order_by(models.StockMovement.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/history", response_model=list[schemas.StockMovement])
def get_movement_history(product_id: int = None, branch_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.StockMovement)

    if product_id:
        query = query.filter(models.StockMovement.product_id == product_id)

    if branch_id:
        query = query.filter(
            (models.StockMovement.from_branch_id == branch_id) |
            (models.StockMovement.to_branch_id == branch_id)
        )

    return query.order_by(models.StockMovement.created_at.desc()).offset(skip).limit(limit).all()
