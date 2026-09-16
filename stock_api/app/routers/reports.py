from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, Sales, InventoryLevel, Branch, StockMovement, User
from datetime import datetime, timedelta
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from io import BytesIO

router = APIRouter(prefix="/reports", tags=["reports"])

def create_excel_workbook():
    """Helper to create a styled Excel workbook"""
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    return wb

def style_header_row(ws, row_num, headers):
    """Style header row"""
    fill = PatternFill(start_color="3A6B4F", end_color="3A6B4F", fill_type="solid")
    font = Font(color="FFFFFF", bold=True)
    alignment = Alignment(horizontal="center", vertical="center")
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )

    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=row_num, column=col_num)
        cell.value = header
        cell.fill = fill
        cell.font = font
        cell.alignment = alignment
        cell.border = border

@router.get("/stock-report/{branch_id}")
def stock_report(branch_id: int, db: Session = Depends(get_db)):
    """Generate stock report for a branch"""
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    wb = create_excel_workbook()
    ws = wb.create_sheet("Stock Report")

    # Title
    ws['A1'] = "HGT Stock & Sales System - Stock Report"
    ws['A1'].font = Font(bold=True, size=14)
    ws.merge_cells('A1:H1')

    # Branch info
    ws['A2'] = f"Branch: {branch.name} ({branch.branch_type})"
    ws['A3'] = f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    ws['A3'].font = Font(italic=True)

    # Headers
    headers = ["SKU", "Product Name", "Category", "Pack Size", "Quantity On Hand", "Unit Price (TSH)", "Total Value (TSH)", "Reorder Level"]
    style_header_row(ws, 5, headers)

    # Get inventory for this branch
    inventory = db.query(InventoryLevel).filter(InventoryLevel.branch_id == branch_id).all()

    total_value = 0
    for row_idx, inv in enumerate(inventory, 6):
        product = inv.product
        value = inv.quantity_on_hand * (product.unit_price or 0)
        total_value += value

        ws.cell(row=row_idx, column=1).value = product.sku
        ws.cell(row=row_idx, column=2).value = product.name
        ws.cell(row=row_idx, column=3).value = product.category or ""
        ws.cell(row=row_idx, column=4).value = product.pack_size or ""
        ws.cell(row=row_idx, column=5).value = inv.quantity_on_hand
        ws.cell(row=row_idx, column=6).value = product.unit_price or 0
        ws.cell(row=row_idx, column=7).value = value
        ws.cell(row=row_idx, column=8).value = product.reorder_level

        # Format numbers
        ws.cell(row=row_idx, column=5).number_format = '0'
        ws.cell(row=row_idx, column=6).number_format = '#,##0.00'
        ws.cell(row=row_idx, column=7).number_format = '#,##0.00'

    # Total row
    total_row = len(inventory) + 6
    ws.cell(row=total_row, column=4).value = "TOTAL:"
    ws.cell(row=total_row, column=4).font = Font(bold=True)
    ws.cell(row=total_row, column=7).value = total_value
    ws.cell(row=total_row, column=7).font = Font(bold=True)
    ws.cell(row=total_row, column=7).number_format = '#,##0.00'

    # Adjust column widths
    ws.column_dimensions['A'].width = 12
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 12
    ws.column_dimensions['E'].width = 15
    ws.column_dimensions['F'].width = 15
    ws.column_dimensions['G'].width = 18
    ws.column_dimensions['H'].width = 14

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=stock_report_{branch.name}_{datetime.now().strftime('%Y%m%d')}.xlsx"}
    )

@router.get("/sales-report/{branch_id}")
def sales_report(branch_id: int, days: int = 30, db: Session = Depends(get_db)):
    """Generate sales report for a branch"""
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    from_date = datetime.now() - timedelta(days=days)

    wb = create_excel_workbook()
    ws = wb.create_sheet("Sales Report")

    # Title
    ws['A1'] = "HGT Stock & Sales System - Sales Report"
    ws['A1'].font = Font(bold=True, size=14)
    ws.merge_cells('A1:I1')

    # Info
    ws['A2'] = f"Branch: {branch.name}"
    ws['A3'] = f"Period: Last {days} days (from {from_date.strftime('%Y-%m-%d')})"
    ws['A4'] = f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    ws['A4'].font = Font(italic=True)

    # Headers
    headers = ["Date", "SKU", "Product", "Customer", "Qty Sold", "Unit Price (TSH)", "Total (TSH)", "Payment", "Recorded By"]
    style_header_row(ws, 6, headers)

    # Get sales for this branch
    sales = db.query(Sales).filter(
        Sales.branch_id == branch_id,
        Sales.created_at >= from_date
    ).order_by(Sales.created_at.desc()).all()

    total_sales = 0
    for row_idx, sale in enumerate(sales, 7):
        total = sale.quantity_sold * sale.unit_price
        total_sales += total

        ws.cell(row=row_idx, column=1).value = sale.created_at.strftime('%Y-%m-%d')
        ws.cell(row=row_idx, column=2).value = sale.product.sku
        ws.cell(row=row_idx, column=3).value = sale.product.name
        ws.cell(row=row_idx, column=4).value = sale.customer.name if sale.customer else "-"
        ws.cell(row=row_idx, column=5).value = sale.quantity_sold
        ws.cell(row=row_idx, column=6).value = sale.unit_price
        ws.cell(row=row_idx, column=7).value = total
        ws.cell(row=row_idx, column=8).value = sale.payment_method
        ws.cell(row=row_idx, column=9).value = sale.user.username if sale.user else "-"

        # Format numbers
        ws.cell(row=row_idx, column=5).number_format = '0'
        ws.cell(row=row_idx, column=6).number_format = '#,##0.00'
        ws.cell(row=row_idx, column=7).number_format = '#,##0.00'

    # Total row
    total_row = len(sales) + 7
    ws.cell(row=total_row, column=5).value = "TOTAL:"
    ws.cell(row=total_row, column=5).font = Font(bold=True)
    ws.cell(row=total_row, column=7).value = total_sales
    ws.cell(row=total_row, column=7).font = Font(bold=True)
    ws.cell(row=total_row, column=7).number_format = '#,##0.00'

    # Adjust column widths
    widths = [12, 12, 20, 20, 10, 15, 15, 12, 15]
    for i, width in enumerate(widths, 1):
        ws.column_dimensions[chr(64+i)].width = width

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=sales_report_{branch.name}_{datetime.now().strftime('%Y%m%d')}.xlsx"}
    )

@router.get("/inventory-report")
def inventory_report(db: Session = Depends(get_db)):
    """Generate inventory report for all branches"""
    wb = create_excel_workbook()

    branches = db.query(Branch).filter(Branch.is_active == True).all()
    total_inventory_value = 0

    for branch in branches:
        ws = wb.create_sheet(branch.name[:31])  # Excel sheet name limit

        # Title
        ws['A1'] = f"Inventory Report - {branch.name}"
        ws['A1'].font = Font(bold=True, size=12)
        ws.merge_cells('A1:G1')

        # Headers
        headers = ["SKU", "Product", "Qty", "Unit Price", "Value (TSH)", "Reorder Level", "Status"]
        style_header_row(ws, 3, headers)

        # Get inventory
        inventory = db.query(InventoryLevel).filter(InventoryLevel.branch_id == branch.id).all()

        for row_idx, inv in enumerate(inventory, 4):
            product = inv.product
            value = inv.quantity_on_hand * (product.unit_price or 0)
            total_inventory_value += value

            status = "OK"
            if inv.quantity_on_hand <= 0:
                status = "OUT OF STOCK"
            elif inv.quantity_on_hand <= product.reorder_level:
                status = "LOW"

            ws.cell(row=row_idx, column=1).value = product.sku
            ws.cell(row=row_idx, column=2).value = product.name
            ws.cell(row=row_idx, column=3).value = inv.quantity_on_hand
            ws.cell(row=row_idx, column=4).value = product.unit_price or 0
            ws.cell(row=row_idx, column=5).value = value
            ws.cell(row=row_idx, column=6).value = product.reorder_level
            ws.cell(row=row_idx, column=7).value = status

            ws.cell(row=row_idx, column=3).number_format = '0'
            ws.cell(row=row_idx, column=4).number_format = '#,##0.00'
            ws.cell(row=row_idx, column=5).number_format = '#,##0.00'

        # Adjust columns
        for i, width in enumerate([12, 20, 10, 15, 18, 15, 15], 1):
            ws.column_dimensions[chr(64+i)].width = width

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=inventory_report_{datetime.now().strftime('%Y%m%d')}.xlsx"}
    )
