from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter(prefix="/inventory", tags=["inventory"])

def format_inventory_with_product(inventory_level):
    return {
        "id": inventory_level.id,
        "branch_id": inventory_level.branch_id,
        "product_id": inventory_level.product_id,
        "quantity_on_hand": inventory_level.quantity_on_hand,
        "last_updated": inventory_level.last_updated,
        "product_sku": inventory_level.product.sku,
        "product_name": inventory_level.product.name,
        "product_price": inventory_level.product.unit_price,
        "stock_value": inventory_level.quantity_on_hand * inventory_level.product.unit_price
    }

@router.get("/branch/{branch_id}", response_model=list[schemas.InventoryLevelWithProduct])
def get_branch_inventory(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(models.Branch).filter(models.Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    inventories = db.query(models.InventoryLevel).filter(
        models.InventoryLevel.branch_id == branch_id
    ).all()

    return [format_inventory_with_product(inv) for inv in inventories]

@router.get("/product/{product_id}", response_model=list[schemas.InventoryLevelWithProduct])
def get_product_inventory(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    inventories = db.query(models.InventoryLevel).filter(
        models.InventoryLevel.product_id == product_id
    ).all()

    return [format_inventory_with_product(inv) for inv in inventories]

@router.get("/{branch_id}/{product_id}", response_model=schemas.InventoryLevelWithProduct)
def get_inventory_level(branch_id: int, product_id: int, db: Session = Depends(get_db)):
    inventory = db.query(models.InventoryLevel).filter(
        and_(
            models.InventoryLevel.branch_id == branch_id,
            models.InventoryLevel.product_id == product_id
        )
    ).first()

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return format_inventory_with_product(inventory)

@router.post("/{branch_id}/{product_id}", response_model=schemas.InventoryLevel)
def create_inventory_level(branch_id: int, product_id: int,
                          quantity: int, db: Session = Depends(get_db)):
    existing = db.query(models.InventoryLevel).filter(
        and_(
            models.InventoryLevel.branch_id == branch_id,
            models.InventoryLevel.product_id == product_id
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Inventory level already exists")

    inventory = models.InventoryLevel(
        branch_id=branch_id,
        product_id=product_id,
        quantity_on_hand=quantity
    )
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    return inventory

@router.post("/add-stock/direct")
def add_stock_direct(branch_id: int = Query(...), product_id: int = Query(...),
                     quantity: int = Query(...), reason: str = Query("Admin adjustment"),
                     db: Session = Depends(get_db)):
    inventory = db.query(models.InventoryLevel).filter(
        and_(
            models.InventoryLevel.branch_id == branch_id,
            models.InventoryLevel.product_id == product_id
        )
    ).first()

    if not inventory:
        inventory = models.InventoryLevel(
            branch_id=branch_id,
            product_id=product_id,
            quantity_on_hand=quantity
        )
        db.add(inventory)
    else:
        inventory.quantity_on_hand += quantity

    db.commit()
    db.refresh(inventory)
    return format_inventory_with_product(inventory)
