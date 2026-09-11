# Complete Setup Guide - Stock Management API

## What We've Built

A **FastAPI + PostgreSQL** web application for managing multi-branch inventory and sales:
- **Central server** runs the API
- **6 branch offices** access via web browser over Tailscale private network
- **Real-time inventory** tracking across all branches
- **Stock movements** logged (transfers, warehouse receipts, sales)
- **Easy data migration** from Excel files

---

## Step 1: Create PostgreSQL Database

Open **pgAdmin** or use command line:

### Using pgAdmin (GUI)
1. Open pgAdmin (usually at http://localhost:5050)
2. Right-click "Databases" → "Create" → "Database"
3. Name it: `stock_db`
4. Click "Save"

### Using Command Line (Windows)
Open Command Prompt as Administrator and run:
```bash
psql -U postgres
```

Then paste these commands:
```sql
CREATE DATABASE stock_db;
\q
```

---

## Step 2: Verify Database Connection

Edit `.env` file in the `stock_api` folder if your PostgreSQL credentials are different:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/stock_db
DEBUG=True
```

Default PostgreSQL user is usually `postgres`.

---

## Step 3: Install Python Dependencies

Navigate to the `stock_api` folder in Command Prompt:

```bash
cd C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_api

python -m pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- SQLAlchemy (database ORM)
- psycopg2 (PostgreSQL driver)
- openpyxl & pandas (Excel migration)
- uvicorn (server)

---

## Step 4: Start the Server

Still in the `stock_api` folder:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Step 5: Test the API

Open your browser to:

### Interactive Documentation
- http://localhost:8000/docs (Swagger UI - best for testing)
- http://localhost:8000/redoc (ReDoc - read-only docs)

### Initialize Demo Data
- http://localhost:8000/seed-data (creates 2 warehouses + 6 branches + 3 demo products)

---

## Step 6: Migrate Your Excel Data

**In a NEW Command Prompt window** (keep the server running), navigate to stock_api folder:

```bash
python migrate_excel.py "C:\Users\User\Desktop\INVETORY FILE AND SALES\HGT Inventory & Sales System.xlsx"
```

This script will:
1. ✓ Create branches for each location (Arusha, Moro, Dar, Dodoma, Iringa, Manyara)
2. ✓ Import all 197 products with SKU and pricing
3. ✓ Import current stock levels from your Excel file
4. ✓ Prepare database for logging new stock movements

**Output will show:**
```
✓ Migrated 197 products
✓ Created 6 branches
✅ Migration completed successfully!
```

---

## Step 7: Verify Data Migration

In Swagger UI (http://localhost:8000/docs), try:

### 1. List all branches
```
GET /branches
```

### 2. View products
```
GET /products?skip=0&limit=10
```

### 3. Check inventory at Arusha branch
```
GET /inventory/branch/2
```

---

## Step 8: Set Up Tailscale for Branch Access

Once the server is stable, set up secure network access:

### On Central Server (Head Office)
1. Download Tailscale: https://tailscale.com/download/windows
2. Install and run
3. Click "Connect" and authenticate
4. Note the Tailscale IP (e.g., `100.11.22.33`)

### On Each Branch Computer
1. Install Tailscale
2. Click "Connect"
3. Open browser to: `http://100.11.22.33:8000/docs`
4. Start using!

---

## API Quick Reference

### Stock Management Endpoints

**Branches**
```
GET    /branches              - List all branches
POST   /branches              - Create a branch
GET    /branches/{id}         - Get branch details
PUT    /branches/{id}         - Update branch
```

**Products**
```
GET    /products              - List all products
POST   /products              - Create a product
GET    /products/{id}         - Get product details
PUT    /products/{id}         - Update product
```

**Inventory**
```
GET    /inventory/branch/{branch_id}           - Stock at a branch
GET    /inventory/product/{product_id}         - Stock across all branches
GET    /inventory/{branch_id}/{product_id}     - Specific stock level
POST   /inventory/{branch_id}/{product_id}     - Create inventory entry
```

**Stock Movements** (most important!)
```
POST   /movements              - Log a transfer/receipt
GET    /movements              - View all movements
GET    /movements/branch/{branch_id}  - Movements for a branch
GET    /movements/history?product_id=X&branch_id=Y  - Filter movements
```

---

## Example: Log a Stock Transfer

**Request:**
```json
POST /movements
{
  "product_id": 5,
  "from_branch_id": 2,
  "to_branch_id": 3,
  "quantity": 100,
  "movement_type": "transfer",
  "reference_number": "TRF-2026-001",
  "notes": "Transfer 100 units from Arusha to Moro"
}
```

**Response:**
```json
{
  "id": 1,
  "product_id": 5,
  "from_branch_id": 2,
  "to_branch_id": 3,
  "quantity": 100,
  "movement_type": "transfer",
  "reference_number": "TRF-2026-001",
  "notes": "Transfer 100 units from Arusha to Moro",
  "created_by": 1,
  "created_at": "2026-09-10T12:30:45"
}
```

**Automatic inventory updates:**
- Arusha: -100 units
- Moro: +100 units
- Movement logged in history

---

## Troubleshooting

### "Connection refused" error when starting server

**Problem:** Cannot connect to PostgreSQL
**Solution:**
1. Check PostgreSQL is running (Services → PostgreSQL)
2. Verify `stock_db` database exists (use pgAdmin)
3. Check `.env` file has correct credentials
4. Try: `psql -U postgres -d stock_db` to test connection

### "Port 8000 already in use"

**Problem:** Another service using port 8000
**Solution:** Use a different port
```bash
python -m uvicorn app.main:app --port 8001
```

### Migration script errors

**Problem:** Excel import fails
**Solution:**
1. Make sure file path is correct
2. File should be: `HGT Inventory & Sales System.xlsx`
3. Run from the `stock_api` folder
4. Check Excel file isn't open in another program

### Tailscale not connecting

**Problem:** Cannot access from branch
**Solution:**
1. Both machines must have Tailscale installed and running
2. Find server's Tailscale IP with: `tailscale status`
3. Verify firewall allows port 8000

---

## Database Schema

```
BRANCHES
├─ id (primary key)
├─ name (e.g., "Arusha")
├─ location
├─ branch_type (warehouse / sub_branch)
├─ is_active
└─ created_at

PRODUCTS
├─ id
├─ sku (e.g., "HGT-001")
├─ name
├─ description
├─ unit_price
├─ reorder_level
├─ is_active
└─ created_at

INVENTORY_LEVELS
├─ id
├─ branch_id → BRANCHES
├─ product_id → PRODUCTS
├─ quantity_on_hand
└─ last_updated

STOCK_MOVEMENTS (transaction log)
├─ id
├─ product_id → PRODUCTS
├─ from_branch_id → BRANCHES (nullable for receipts)
├─ to_branch_id → BRANCHES
├─ quantity
├─ movement_type (transfer/receipt/sale/adjustment)
├─ reference_number
├─ notes
├─ created_by → USERS
└─ created_at
```

---

## What's Next?

1. ✓ **Data**: Excel → PostgreSQL (via migration script)
2. ✓ **Access**: Central server running (localhost:8000)
3. ⏭️ **Network**: Set up Tailscale for branch connectivity
4. ⏭️ **Users**: Add branch staff logins (auth endpoints ready)
5. ⏭️ **Backups**: Schedule PostgreSQL backups
6. ⏭️ **Training**: Teach staff to use the Swagger UI

---

## Support

- **API Docs:** http://localhost:8000/docs
- **Server Logs:** Watch the Command Prompt window
- **Database Admin:** pgAdmin at http://localhost:5050

---

**🚀 Ready to go!**
