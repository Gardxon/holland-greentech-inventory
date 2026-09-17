from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, Base, get_db
from app.routers import products, branches, inventory, stock_movements, sales, stock_requests, dashboard, admin, auth, reports, customers
import app.models as models

# Try to create tables on startup, but don't crash if database is unreachable
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables on startup: {str(e)}")
    print("Tables will be created when /migrate-db endpoint is called")

app = FastAPI(
    title="Stock Management API",
    description="Central stock and sales control system with multi-branch support",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(branches.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(inventory.router)
app.include_router(stock_movements.router)
app.include_router(sales.router)
app.include_router(stock_requests.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(reports.router)

dist_dir = Path(__file__).parent.parent.parent / "stock_frontend" / "dist"

@app.get("/", response_class=HTMLResponse)
async def root():
    # Serve artifact dashboard
    static_dir = Path(__file__).parent / "static"
    dashboard_path = static_dir / "dashboard.html"
    if dashboard_path.exists():
        with open(dashboard_path, 'r', encoding='utf-8') as f:
            return f.read()

    # Fall back to React build
    if dist_dir.exists():
        index_path = dist_dir / "index.html"
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "<h1>Dashboard not found</h1>"

if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

@app.get("/health")
def health_check():
    # Deployment v2
    return {"status": "healthy"}

@app.post("/seed-data")
def seed_database(db: Session = Depends(get_db)):
    """Seed database with initial branches and demo data"""

    existing_branches = db.query(models.Branch).count()
    if existing_branches > 0:
        return {"message": "Database already seeded"}

    warehouses = [
        models.Branch(name="Arusha", location="Arusha - Head Office", branch_type="warehouse"),
        models.Branch(name="Morogoro", location="Morogoro", branch_type="warehouse"),
    ]

    branches_list = [
        models.Branch(name="Dar es Salaam", location="Dar es Salaam", branch_type="sub_branch"),
        models.Branch(name="Dodoma", location="Dodoma", branch_type="sub_branch"),
        models.Branch(name="Iringa", location="Iringa", branch_type="sub_branch"),
        models.Branch(name="Manyara", location="Manyara", branch_type="sub_branch"),
    ]

    all_branches = warehouses + branches_list
    for branch in all_branches:
        db.add(branch)

    db.commit()

    # Create default admin user
    admin_user = models.User(
        username="admin",
        email="admin@hgt.local",
        hashed_password="1234",  # PIN: 1234
        branch_id=warehouses[0].id,  # Arusha warehouse
        is_admin=True,
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    demo_products = [
        models.Product(sku="PROD001", name="Product 1", description="Demo Product 1", unit_price=10.00),
        models.Product(sku="PROD002", name="Product 2", description="Demo Product 2", unit_price=20.00),
        models.Product(sku="PROD003", name="Product 3", description="Demo Product 3", unit_price=15.00),
    ]

    for product in demo_products:
        db.add(product)

    db.commit()

    return {
        "message": "Database seeded successfully",
        "branches": len(all_branches),
        "products": len(demo_products)
    }

@app.post("/migrate-db")
def migrate_database(db: Session = Depends(get_db)):
    """Migrate database schema - add request_type column to stock_requests table"""
    try:
        # Try to add the request_type column if it doesn't exist
        db.execute(text("ALTER TABLE stock_requests ADD COLUMN request_type VARCHAR DEFAULT 'request'"))
        db.commit()
        return {"message": "Database migrated successfully - request_type column added"}
    except Exception as e:
        # Column might already exist, try a different approach
        try:
            # Recreate the table with the new schema
            db.execute(text("DROP TABLE IF EXISTS stock_requests CASCADE"))
            db.commit()
            models.StockRequest.__table__.create(engine)
            db.commit()
            return {"message": "Database migrated successfully - stock_requests table recreated"}
        except Exception as e2:
            return {"message": f"Migration note: {str(e)}"}
