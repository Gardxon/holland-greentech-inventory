# 🚀 LAUNCH GUIDE - 3 Steps to Get Running

## Prerequisites
- ✓ Python installed
- ✓ PostgreSQL installed
- ✓ Dependencies installing...

---

## Step 1: Create Database (5 mins)

**Open pgAdmin** (or SQL command line):

1. Right-click **Databases** → **Create** → **Database**
2. Name: `stock_db`
3. Click **Save**

**Done!** ✓

---

## Step 2: Start the API Server (30 secs)

Open **Command Prompt**, navigate to stock_api folder:

```bash
cd C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_api

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Started server process [1234]
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

✓ Server is running!

---

## Step 3: Import Your Data (2 mins)

**In a NEW Command Prompt window:**

```bash
cd C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_api

python migrate_excel.py "C:\Users\User\Desktop\INVETORY FILE AND SALES\HGT Inventory & Sales System.xlsx"
```

**Expected output:**
```
✓ Created branch: Main Warehouse
✓ Created branch: Arusha
✓ Created branch: Moro
✓ Created branch: Dar es Salaam
✓ Created branch: Dodoma
✓ Created branch: Iringa
✓ Created branch: Manyara
✓ Migrated 197 products
✓ Processed 0 stock movements
✅ Migration completed successfully!
```

---

## NOW YOU'RE LIVE! 🎉

### 📱 Access the System

**API Documentation (Swagger UI):**
- Open: http://localhost:8000/docs

**Try These:**
1. Click **GET /branches** → "Try it out" → "Execute"
2. Click **GET /products** → "Try it out" → "Execute"
3. Click **GET /inventory/branch/2** → "Try it out" → "Execute"

---

## Next: Test a Stock Transfer

In Swagger UI, click **POST /movements**:

```json
{
  "product_id": 1,
  "from_branch_id": 2,
  "to_branch_id": 3,
  "quantity": 50,
  "movement_type": "transfer",
  "reference_number": "TEST-001",
  "notes": "Test transfer"
}
```

Click "Execute" → See the transfer logged!

---

## 🌐 Access from Branch Offices (Tailscale)

Once server is stable:

1. Install Tailscale on central server and each branch
2. Run `tailscale up` on both
3. Get server's Tailscale IP: `tailscale status`
4. From any branch, open: `http://[server-tailscale-ip]:8000/docs`

---

## 📊 Check the Data

In Swagger UI:

**View All Products:**
```
GET /products
```

**View Stock at Arusha:**
```
GET /inventory/branch/2
```

**View All Movements:**
```
GET /movements
```

---

## ❌ Having Issues?

### Database Connection Error
- [ ] Is PostgreSQL running? (Check Services)
- [ ] Does `stock_db` exist? (Check pgAdmin)
- [ ] Is `.env` password correct?

### Port 8000 Already in Use
```bash
python -m uvicorn app.main:app --port 8001
```

### Import Fails
- [ ] Excel file closed?
- [ ] File path correct?
- [ ] Database connected?

---

## 📁 What's in This Folder

```
stock_api/
├── app/
│   ├── main.py              ← Main API server
│   ├── models.py            ← Database structure
│   ├── database.py          ← PostgreSQL connection
│   └── routers/             ← API endpoints
├── migrate_excel.py         ← Import your data
├── requirements.txt         ← Python packages
├── .env                     ← Database credentials
├── LAUNCH.md               ← You are here
├── SETUP_GUIDE.md          ← Detailed setup
├── README.md               ← Full documentation
└── QUICK_START.md          ← Quick reference
```

---

## 🎯 You're All Set!

1. ✓ Server running on localhost:8000
2. ✓ Data imported from Excel
3. ✓ API ready for use
4. ⏭️ Next: Set up Tailscale for branch access

**Questions?** Check SETUP_GUIDE.md or README.md

---

**System is running and ready! 🚀**
