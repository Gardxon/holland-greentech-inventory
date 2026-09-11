# Stock Management API

A modern, multi-branch inventory and sales control system built with FastAPI and PostgreSQL.

## Features

- **Multi-branch support**: Manage inventory across warehouses and sub-branches
- **Real-time stock tracking**: Track inventory levels at each location
- **Stock movements**: Log transfers between branches and warehouse-to-branch receipts
- **Product management**: Manage products with SKU, pricing, and reorder levels
- **Centralized database**: All data stored in PostgreSQL for reliable access
- **REST API**: Easy integration with web browsers and mobile apps
- **Tailscale ready**: Access via secure private network from any branch

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL 12+
- Tailscale (for secure branch connectivity)

### Installation

1. **Clone and navigate to project**:
   ```bash
   cd stock_api
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or
   source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database**:
   - Create a PostgreSQL database: `stock_db`
   - Copy `.env.example` to `.env`
   - Update DATABASE_URL with your credentials:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/stock_db
     ```

5. **Initialize database**:
   ```bash
   python -m uvicorn app.main:app --reload
   # Visit http://localhost:8000/seed-data to initialize
   ```

### Running the Server

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Access the API at:
- **Swagger docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API root**: http://localhost:8000

## API Endpoints

### Branches
- `GET /branches` - List all branches
- `POST /branches` - Create a branch
- `GET /branches/{id}` - Get branch details
- `PUT /branches/{id}` - Update branch

### Products
- `GET /products` - List all products
- `POST /products` - Create a product
- `GET /products/{id}` - Get product details
- `PUT /products/{id}` - Update product

### Inventory
- `GET /inventory/branch/{branch_id}` - Get stock levels for a branch
- `GET /inventory/product/{product_id}` - Get stock levels across all branches
- `GET /inventory/{branch_id}/{product_id}` - Get specific stock level
- `POST /inventory/{branch_id}/{product_id}` - Create inventory entry

### Stock Movements
- `POST /movements` - Record stock movement (transfer/receipt/sale)
- `GET /movements` - List all movements
- `GET /movements/branch/{branch_id}` - Get movements for a branch
- `GET /movements/history` - Get movement history with filters

## Data Migration

To migrate from Excel inventory files:

```bash
python migrate_excel.py --file "path/to/inventory.xlsx"
```

This script will:
1. Read all sheets from the Excel file
2. Map data to the database schema
3. Create branches, products, and inventory levels
4. Preserve all historical stock movements

## Deployment with Tailscale

1. **Install Tailscale** on central server and all branch computers
2. **Join Tailscale network**: `tailscale up`
3. **Find server's Tailscale IP**: `tailscale status` (e.g., 100.11.22.33)
4. **Access from any branch**: Open browser to `http://100.11.22.33:8000/docs`

## Database Schema

### Tables
- `branches` - Warehouse and sub-branch locations
- `products` - Product catalog with SKU and pricing
- `inventory_levels` - Current stock at each branch
- `stock_movements` - Log of all transfers and transactions
- `users` - User accounts (future auth implementation)

## Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/database
DEBUG=True
```

## Support

For issues or questions, check the API documentation at `/docs` (Swagger UI).
