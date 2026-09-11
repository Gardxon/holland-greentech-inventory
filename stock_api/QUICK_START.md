# Quick Start Guide - Stock Management API

## Prerequisites Check

- [x] Python 3.10+ installed
- [ ] PostgreSQL 12+ installed (or we can use SQLite for quick testing)
- [ ] Tailscale installed (for multi-branch access)

## Installation & Setup

### Step 1: Setup Environment (Windows)

```bash
# Navigate to the stock_api folder
cd C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_api

# Run the setup script
setup.bat

# This will:
# - Create a Python virtual environment
# - Install all dependencies
# - Create a .env file
```

### Step 2: Configure Database

**Option A: Using PostgreSQL (Recommended for Production)**

1. Install PostgreSQL if you haven't already
2. Create a new database:
   ```sql
   CREATE DATABASE stock_db;
   ```
3. Edit `.env` file and update:
   ```
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/stock_db
   ```

**Option B: Using SQLite (Quick Testing)**

If you don't have PostgreSQL, we can use SQLite instead:

1. Edit `app/database.py` and change:
   ```python
   DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./stock.db")
   ```

2. Update `.env`:
   ```
   DATABASE_URL=sqlite:///./stock.db
   ```

### Step 3: Start the Server

```bash
run.bat
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 4: Access the API

Open your browser and visit:
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **API Health**: http://localhost:8000/health
- **Seed Data**: http://localhost:8000/seed-data (creates demo branches & products)

## Migrate Your Data

Once the server is running, migrate your Excel file:

```bash
# Activate virtual environment first
venv\Scripts\activate.bat

# Run migration
python migrate_excel.py "path/to/HGT Inventory & Sales System.xlsx"
```

This will:
1. ✓ Create branches for all your locations
2. ✓ Import all products with SKU and pricing
3. ✓ Import current stock levels
4. ✓ Prepare for stock movement logging

## Test the API

### 1. View all branches
```
GET http://localhost:8000/branches
```

### 2. View products
```
GET http://localhost:8000/products
```

### 3. Check inventory at a branch
```
GET http://localhost:8000/inventory/branch/1
```

### 4. Record a stock movement (transfer)
```
POST http://localhost:8000/movements
{
  "product_id": 1,
  "from_branch_id": 1,
  "to_branch_id": 2,
  "quantity": 100,
  "movement_type": "transfer",
  "reference_number": "TRF-001",
  "notes": "Transfer from warehouse to Arusha branch"
}
```

## Setup Tailscale for Branch Access

Once the server is running reliably on your main computer:

1. Install Tailscale on the central server
2. Install Tailscale on each branch computer
3. Run `tailscale up` on both
4. Find the server's Tailscale IP (e.g., `100.11.22.33`)
5. From branch computers, open browser to: `http://100.11.22.33:8000/docs`

## Troubleshooting

**Issue: "Database connection refused"**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check database exists: `psql -U postgres -l`

**Issue: "Port 8000 already in use"**
- Kill the existing process or change port in run.bat to 8001

**Issue: "openpyxl not found"**
- Run: `pip install openpyxl pandas`

## Next Steps

1. [ ] Deploy to a server at your head office
2. [ ] Set up Tailscale for secure branch access
3. [ ] Train staff on using the system via the browser
4. [ ] Set up daily backups of the PostgreSQL database
5. [ ] Configure user logins (auth endpoints ready in code)

## Support

- API Documentation: http://localhost:8000/docs
- Interactive API Testing: http://localhost:8000/redoc
- Check logs in terminal for errors

## Project Structure

```
stock_api/
├── app/
│   ├── main.py              # FastAPI app & endpoints
│   ├── models.py            # Database models
│   ├── schemas.py           # Request/Response validation
│   ├── database.py          # DB connection
│   └── routers/
│       ├── products.py      # Product CRUD
│       ├── branches.py      # Branch CRUD
│       ├── inventory.py     # Inventory views
│       └── stock_movements.py # Transfer logging
├── requirements.txt         # Python dependencies
├── migrate_excel.py         # Data migration script
├── .env                     # Configuration (created by setup.bat)
└── run.bat                  # Start server script
```

## API Reference

### Branches
- `GET /branches` - List all branches
- `POST /branches` - Create branch
- `GET /branches/{id}` - Get branch
- `PUT /branches/{id}` - Update branch

### Products
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/{id}` - Get product details

### Inventory
- `GET /inventory/branch/{branch_id}` - Stock at branch
- `GET /inventory/product/{product_id}` - Stock across all branches
- `POST /inventory/{branch_id}/{product_id}` - Create inventory entry

### Stock Movements
- `POST /movements` - Log a transfer/receipt/sale
- `GET /movements` - Get all movements
- `GET /movements/branch/{branch_id}` - Movements for a branch
- `GET /movements/history` - Filter movements by product/branch

---

**Ready to go!** Start with `setup.bat` then `run.bat`
