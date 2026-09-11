from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, InventoryLevel, Branch
from app.schemas import ProductCreate, ProductUpdate, Product as ProductSchema
import openpyxl
from io import BytesIO

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/products", response_model=ProductSchema)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

@router.post("/stock/add")
def add_stock_to_branch(branch_id: int, product_id: int, quantity: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    inventory = db.query(InventoryLevel).filter(
        InventoryLevel.branch_id == branch_id,
        InventoryLevel.product_id == product_id
    ).first()

    if inventory:
        inventory.quantity_on_hand += quantity
    else:
        inventory = InventoryLevel(
            branch_id=branch_id,
            product_id=product_id,
            quantity_on_hand=quantity
        )
        db.add(inventory)

    db.commit()
    return {"message": f"Added {quantity} units to {branch.name}"}

@router.post("/products/import-excel")
async def import_products_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = await file.read()
        wb = openpyxl.load_workbook(BytesIO(contents))
        ws = wb.active

        imported = 0
        errors = []

        for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            try:
                if not row[0]:
                    continue

                sku = str(row[0]).strip()
                name = str(row[1]).strip() if row[1] else ""
                category = str(row[2]).strip() if row[2] and len(row) > 2 else None
                pack_size = str(row[3]).strip() if row[3] and len(row) > 3 else None
                unit_price = float(row[4]) if row[4] and len(row) > 4 else 0
                reorder_level = int(row[5]) if row[5] and len(row) > 5 else 10

                existing = db.query(Product).filter(Product.sku == sku).first()

                if existing:
                    existing.name = name
                    existing.category = category
                    existing.pack_size = pack_size
                    existing.unit_price = unit_price
                    existing.reorder_level = reorder_level
                else:
                    product = Product(
                        sku=sku,
                        name=name,
                        category=category,
                        pack_size=pack_size,
                        unit_price=unit_price,
                        reorder_level=reorder_level
                    )
                    db.add(product)

                imported += 1
            except Exception as e:
                errors.append(f"Row {row_idx}: {str(e)}")

        db.commit()
        return {
            "message": f"Imported {imported} products",
            "count": imported,
            "errors": errors
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")
