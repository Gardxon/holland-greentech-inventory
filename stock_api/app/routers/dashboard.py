from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from datetime import datetime, timedelta
import csv
import io

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    branches = db.query(models.Branch).count()
    products = db.query(models.Product).count()

    inventories = db.query(models.InventoryLevel).all()
    total_stock_units = sum(inv.quantity_on_hand for inv in inventories)
    total_stock_value = sum(inv.quantity_on_hand * inv.product.unit_price for inv in inventories)

    movements = db.query(models.StockMovement).count()
    sales = db.query(models.Sales).count()

    recent_movements = db.query(models.StockMovement).order_by(
        models.StockMovement.created_at.desc()
    ).limit(10).all()

    low_stock_items = []
    for inv in inventories:
        if inv.quantity_on_hand <= inv.product.reorder_level:
            low_stock_items.append({
                "product_id": inv.product_id,
                "product_name": inv.product.name,
                "sku": inv.product.sku,
                "quantity_on_hand": inv.quantity_on_hand,
                "reorder_level": inv.product.reorder_level,
                "branch": inv.branch.name
            })

    return {
        "total_branches": branches,
        "total_products": products,
        "total_stock_units": total_stock_units,
        "total_stock_value": round(total_stock_value, 2),
        "total_movements": movements,
        "total_sales": sales,
        "low_stock_items": low_stock_items,
        "recent_movements_count": len(recent_movements)
    }

@router.get("/inventory-by-branch")
def get_inventory_by_branch(db: Session = Depends(get_db)):
    branches = db.query(models.Branch).all()
    result = []

    for branch in branches:
        inventories = db.query(models.InventoryLevel).filter(
            models.InventoryLevel.branch_id == branch.id
        ).all()

        total_units = sum(inv.quantity_on_hand for inv in inventories)
        total_value = sum(inv.quantity_on_hand * inv.product.unit_price for inv in inventories)

        result.append({
            "branch_id": branch.id,
            "branch_name": branch.name,
            "branch_type": branch.branch_type,
            "total_units": total_units,
            "total_value": round(total_value, 2),
            "product_count": len(inventories)
        })

    return result

@router.get("/export-inventory/csv")
def export_inventory_csv(db: Session = Depends(get_db)):
    inventories = db.query(models.InventoryLevel).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Branch", "SKU", "Product Name", "Quantity On Hand", "Unit Price",
        "Stock Value", "Reorder Level", "Last Updated"
    ])

    for inv in inventories:
        writer.writerow([
            inv.branch.name,
            inv.product.sku,
            inv.product.name,
            inv.quantity_on_hand,
            inv.product.unit_price,
            round(inv.quantity_on_hand * inv.product.unit_price, 2),
            inv.product.reorder_level,
            inv.last_updated.strftime("%Y-%m-%d %H:%M:%S")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory_report.csv"}
    )

@router.get("/export-sales/csv")
def export_sales_csv(days: int = 30, db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=days)
    sales = db.query(models.Sales).filter(models.Sales.created_at >= start_date).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Branch", "SKU", "Product Name", "Quantity Sold",
        "Unit Price", "Total Amount", "Sold By"
    ])

    for sale in sales:
        writer.writerow([
            sale.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            sale.branch.name,
            sale.product.sku,
            sale.product.name,
            sale.quantity_sold,
            sale.unit_price,
            round(sale.total_amount, 2),
            sale.user.username if sale.user else "Unknown"
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=sales_report_{days}days.csv"}
    )

@router.get("/export-movements/csv")
def export_movements_csv(db: Session = Depends(get_db)):
    movements = db.query(models.StockMovement).order_by(
        models.StockMovement.created_at.desc()
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Type", "SKU", "Product Name", "From Branch", "To Branch",
        "Quantity", "Reference", "Notes", "Created By"
    ])

    for mov in movements:
        from_branch = mov.from_branch.name if mov.from_branch else "-"
        writer.writerow([
            mov.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            mov.movement_type,
            mov.product.sku,
            mov.product.name,
            from_branch,
            mov.to_branch.name,
            mov.quantity,
            mov.reference_number or "",
            mov.notes or "",
            mov.user.username if mov.user else "Unknown"
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=movements_report.csv"}
    )
