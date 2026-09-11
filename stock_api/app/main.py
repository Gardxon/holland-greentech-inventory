from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.routers import products, branches, inventory, stock_movements, sales, stock_requests, dashboard, admin
import app.models as models

Base.metadata.create_all(bind=engine)

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

app.include_router(branches.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(stock_movements.router)
app.include_router(sales.router)
app.include_router(stock_requests.router)
app.include_router(dashboard.router)
app.include_router(admin.router)

dist_dir = Path(__file__).parent.parent.parent / "stock_frontend" / "dist"

@app.get("/", response_class=HTMLResponse)
async def root():
    if dist_dir.exists():
        index_path = dist_dir / "index.html"
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "<h1>React dashboard not found. Build the frontend first.</h1>"

if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

@app.get("/health")
def health_check():
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
