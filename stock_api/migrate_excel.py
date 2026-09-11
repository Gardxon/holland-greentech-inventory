#!/usr/bin/env python
"""
Migrate inventory data from Excel to PostgreSQL database
"""

import openpyxl
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
import sys

def migrate_from_excel(excel_file):
    """Migrate data from Excel workbook to database"""

    if not os.path.exists(excel_file):
        print(f"Error: File not found: {excel_file}")
        sys.exit(1)

    wb = openpyxl.load_workbook(excel_file)
    db = SessionLocal()

    try:
        # Define branches based on your locations
        branches_data = [
            ("Arusha", "Arusha - Head Office", "warehouse"),
            ("Morogoro", "Morogoro", "warehouse"),
            ("Dar es Salaam", "Dar es Salaam", "sub_branch"),
            ("Dodoma", "Dodoma", "sub_branch"),
            ("Iringa", "Iringa", "sub_branch"),
            ("Manyara", "Manyara", "sub_branch"),
        ]

        # Create branches
        print("Creating branches...")
        branches = {}
        for name, location, branch_type in branches_data:
            existing = db.query(models.Branch).filter(models.Branch.name == name).first()
            if existing:
                branches[name] = existing.id
                print(f"  [OK] Branch exists: {name}")
            else:
                branch = models.Branch(name=name, location=location, branch_type=branch_type)
                db.add(branch)
                db.flush()
                branches[name] = branch.id
                print(f"  [OK] Created branch: {name}")

        db.commit()

        # Migrate products from Master Products sheet
        print("\nMigrating products...")
        ws_products = wb["Master Products"]

        product_count = 0
        for row_idx, row in enumerate(ws_products.iter_rows(min_row=2, values_only=True), start=2):
            if row[0] is None:  # Skip empty rows
                continue

            try:
                sku = str(row[0]).strip() if row[0] else None
                product_name = str(row[1]).strip() if row[1] else "Unknown"
                category = str(row[3]).strip() if row[3] else "Other"
                pack_size = row[2] if row[2] else 1
                price = row[6] if isinstance(row[6], (int, float)) else 0
                selling_price = row[7] if isinstance(row[7], (int, float)) else 0
                reorder_point = row[8] if isinstance(row[8], (int, float)) else 0

                if not sku:
                    continue

                # Check if product already exists
                existing = db.query(models.Product).filter(models.Product.sku == sku).first()
                if existing:
                    print(f"  - Product already exists: {sku}")
                    continue

                product = models.Product(
                    sku=sku,
                    name=product_name,
                    description=f"{category} - Pack Size: {pack_size}",
                    unit_price=selling_price if selling_price > 0 else price,
                    reorder_level=int(reorder_point) if reorder_point else 10
                )
                db.add(product)
                db.flush()

                # Create inventory levels for each branch
                stock_arusha = row[9] if isinstance(row[9], (int, float)) else 0
                stock_morogoro = row[10] if isinstance(row[10], (int, float)) else 0

                if stock_arusha > 0:
                    inv = models.InventoryLevel(
                        branch_id=branches.get("Arusha"),
                        product_id=product.id,
                        quantity_on_hand=int(stock_arusha)
                    )
                    db.add(inv)

                if stock_morogoro > 0:
                    inv = models.InventoryLevel(
                        branch_id=branches.get("Morogoro"),
                        product_id=product.id,
                        quantity_on_hand=int(stock_morogoro)
                    )
                    db.add(inv)

                product_count += 1
                if product_count % 50 == 0:
                    print(f"  [OK] Processed {product_count} products...")

            except Exception as e:
                print(f"  ⚠ Error processing row {row_idx}: {str(e)}")
                continue

        db.commit()
        print(f"[OK] Migrated {product_count} products")

        # Migrate stock movements if data exists
        if "Stock Movements" in wb.sheetnames:
            print("\nMigrating stock movements...")
            ws_movements = wb["Stock Movements"]

            movement_count = 0
            for row_idx, row in enumerate(ws_movements.iter_rows(min_row=2, values_only=True), start=2):
                if row[0] is None:  # Skip empty rows
                    continue

                try:
                    movement_date = row[0]
                    movement_type = str(row[1]).strip().lower() if row[1] else "transfer"
                    product_name = str(row[2]).strip() if row[2] else None
                    quantity = row[7] if isinstance(row[7], (int, float)) else 0

                    if not product_name or quantity == 0:
                        continue

                    # Find product by name (as fallback)
                    product = db.query(models.Product).filter(
                        models.Product.name.like(f"%{product_name}%")
                    ).first()

                    if product:
                        movement_count += 1

                except Exception as e:
                    print(f"  ⚠ Error processing movement row {row_idx}: {str(e)}")
                    continue

            print(f"[OK] Processed {movement_count} stock movements (requires manual review)")

        print("\n[SUCCESS] Migration completed successfully!")
        print(f"\nSummary:")
        print(f"  - Branches: {len(branches)}")
        print(f"  - Products: {product_count}")
        print(f"\nNext steps:")
        print(f"  1. Start the server: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000")
        print(f"  2. Access at: http://localhost:8000/docs")
        print(f"  3. View inventory by branch via API")

    except Exception as e:
        print(f"\n[ERROR] Migration failed: {str(e)}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    excel_file = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\User\Desktop\INVETORY FILE AND SALES\HGT Inventory & Sales System.xlsx"
    migrate_from_excel(excel_file)
