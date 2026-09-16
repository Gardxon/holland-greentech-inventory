# Integrate Your Artifact Dashboard with Backend

Your artifact dashboard needs to connect to your FastAPI backend. Here's how.

---

## Step 1: Export the Artifact

### Option A: From Claude Artifact (Recommended)

1. Open your artifact: https://claude.ai/artifact/8f9eT2mDg8f5quDageJABn
2. Look for **"Export"** or **"Download"** button
3. Download as **HTML**
4. Save to: `C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_api\app\static\dashboard.html`

### Option B: Copy Raw HTML

1. Right-click on artifact → **"Inspect"** (View Page Source)
2. Select all HTML
3. Copy to new file: `dashboard.html`
4. Save in: `stock_api/app/static/`

---

## Step 2: Create Static Files Folder

Create folder if it doesn't exist:
```
stock_api/
├── app/
│   ├── main.py
│   ├── static/          ← Create this folder
│   │   └── dashboard.html
│   └── ...
```

**PowerShell command:**
```powershell
mkdir "C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_api\app\static" -Force
```

---

## Step 3: Update Backend to Serve Dashboard

Edit `stock_api/app/main.py` and update the root route:

**Find this section:**
```python
@app.get("/", response_class=HTMLResponse)
async def root():
    if dist_dir.exists():
        index_path = dist_dir / "index.html"
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "<h1>React dashboard not found. Build the frontend first.</h1>"
```

**Replace with:**
```python
@app.get("/", response_class=HTMLResponse)
async def root():
    # Try artifact dashboard first
    artifact_path = Path(__file__).parent / "static" / "dashboard.html"
    if artifact_path.exists():
        with open(artifact_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    # Fall back to React build
    if dist_dir.exists():
        index_path = dist_dir / "index.html"
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    return "<h1>Dashboard not found</h1>"
```

---

## Step 4: Connect Dashboard to API

Your dashboard HTML needs to know where your API is. Add this near the top of your dashboard HTML:

**Find the `<head>` section and add:**

```html
<script>
  // Configure API endpoint
  const API_BASE = window.location.origin;
  
  // Or if API is on different domain:
  // const API_BASE = "https://hgt-stock-system.onrender.com";
</script>
```

---

## Step 5: Update API Calls in Dashboard

In the dashboard HTML, update all API calls to use the correct endpoints.

### Common pattern:

**Before:**
```javascript
fetch('/api/products')
```

**After:**
```javascript
fetch(`${API_BASE}/products`)
```

### Example API Endpoints to Connect:

```javascript
// Get all products
fetch(`${API_BASE}/products`)

// Get branches
fetch(`${API_BASE}/branches`)

// Get inventory for branch
fetch(`${API_BASE}/inventory/branch/1`)

// Record a sale
fetch(`${API_BASE}/sales`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 1,
    quantity: 10,
    price: 100
  })
})

// Get dashboard stats
fetch(`${API_BASE}/dashboard/stats`)
```

---

## Step 6: Mount Static Files

In `stock_api/app/main.py`, add after the CORS middleware:

```python
from fastapi.staticfiles import StaticFiles

# Mount static files folder
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
```

---

## Step 7: Test Locally

### Start your backend:

```powershell
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES\stock_api"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Open in browser:
```
http://localhost:8000
```

You should see your dashboard!

---

## Step 8: Verify API Connections

Open browser **DevTools** (F12) → **Console** tab

Check if you see any errors like:
- `CORS error` → May need to update CORS in backend
- `Cannot GET /products` → API endpoint issue
- `Cannot connect` → Backend not running

### Fix CORS if needed:

In `stock_api/app/main.py`, ensure CORS allows your domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

After testing, restrict to:
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:8000",
    "https://hgt-stock-system.onrender.com"
],
```

---

## Step 9: Deploy Updated Code

Commit your changes:

```powershell
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES"
git add .
git commit -m "Add integrated dashboard"
git push origin main
```

Render will automatically redeploy! 🚀

---

## Step 10: Test on Render

Once deployed, visit:
```
https://hgt-stock-system.onrender.com
```

You should see your dashboard fully functional with live data from your API.

---

## Troubleshooting

### Dashboard loads but no data appears

**Check:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Look for failed requests (red)
4. Click on failed request → see error details
5. Common fixes:
   - Wrong API endpoint
   - CORS not configured
   - Backend not running

### "Cannot GET /products"

**Fix:**
1. Make sure backend router includes `/products` endpoint
2. Check `stock_api/app/routers/products.py` exists
3. Verify it's imported in `main.py`

### Dashboard looks weird (no styling)

**Check:**
1. CSS files imported correctly in HTML
2. CSS files available in static folder
3. Check CSS file paths are relative or use absolute URLs

### API works but dashboard not updating

**Check:**
1. Verify JavaScript is using correct API base URL
2. Check browser console for errors
3. Verify data format matches what dashboard expects

---

## API Endpoints Reference

Your backend provides these endpoints:

```
# Products
GET    /products              - Get all products
POST   /products              - Create product
PUT    /products/{id}         - Update product
DELETE /products/{id}         - Delete product

# Branches
GET    /branches              - Get all branches
POST   /branches              - Create branch
PUT    /branches/{id}         - Update branch

# Inventory
GET    /inventory/branch/{id} - Get stock at branch
PUT    /inventory/update      - Update stock

# Sales
GET    /sales                 - Get all sales
POST   /sales                 - Record sale

# Dashboard
GET    /dashboard/stats       - Dashboard statistics

# Health
GET    /health               - API health check
GET    /docs                 - Interactive API docs (Swagger)
```

---

## Next Steps

1. ✅ Export artifact HTML
2. ✅ Save to `stock_api/app/static/`
3. ✅ Connect API endpoints
4. ✅ Test locally
5. ✅ Commit and push
6. ✅ Render auto-deploys
7. ✅ Visit live URL to test

---

**Your integrated system is ready!** 🎉
