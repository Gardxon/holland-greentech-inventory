from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List
import csv
import io

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/bulk-import")
def bulk_import_products(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Bulk import products from CSV file"""
    try:
        contents = file.file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(contents))

        imported_count = 0
        skipped_count = 0
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                # Check if product with this SKU already exists
                existing = db.query(models.Product).filter(models.Product.sku == row['sku']).first()
                if existing:
                    skipped_count += 1
                    continue

                # Create product
                product = models.Product(
                    sku=row['sku'],
                    name=row['product_name'],
                    category=row['category'],
                    pack_size=row['pack_size'] if row['pack_size'] else None,
                    unit_price=float(row['unit_price']),
                    reorder_level=int(row.get('reorder_level', 10)),
                    is_active=True
                )
                db.add(product)
                imported_count += 1
            except Exception as e:
                skipped_count += 1
                errors.append(f"Row {row_num}: {str(e)}")

        db.commit()

        return {
            "status": "success",
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": errors[:10]  # Return first 10 errors
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

@router.post("/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=list[schemas.Product])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Product).offset(skip).limit(limit).all()

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product
