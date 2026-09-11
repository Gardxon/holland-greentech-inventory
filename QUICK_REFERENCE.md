# Holland Greentech - Quick Reference Card

Print this page or bookmark it for quick access!

## 🔐 Login Credentials Template

**Admin Account:**
- Email: `kawahaule@gmail.com`
- Password: `[Your password here]`
- Role: Admin

**Staff Account Template:**
- Email: `staff@hollandgreentech.com`
- Password: `[Staff password]`
- Role: Staff

---

## 🌐 Important URLs

| Purpose | URL |
|---------|-----|
| **Live App** | https://holland-greentech-inventory.vercel.app |
| **Database Dashboard** | https://supabase.com/dashboard |
| **Hosting Dashboard** | https://vercel.com/dashboard |
| **Database Backups** | Supabase → Settings → Backups |
| **GitHub Repository** | https://github.com/YOUR_USERNAME/holland-greentech-inventory |

---

## 📋 Menu Items & What They Do

| Menu | Purpose | Who Can Use |
|------|---------|-------------|
| **Dashboard** | See overview & statistics | Admin & Staff |
| **Products** | Add/edit/view all products | Admin (edit), Staff (view) |
| **Sales** | Record customer purchases | Admin & Staff |
| **Stock Movements** | Log inventory in/out | Admin & Staff |
| **Reports** | View analytics & trends | Admin & Staff |
| **Users** | Manage team members | Admin only |

---

## ✨ Main Features

```
📊 DASHBOARD
├─ Total Products
├─ Total Stock Value
├─ Low Stock Alerts
└─ Quick Actions

📦 PRODUCTS
├─ Add new products
├─ Edit product details
├─ View all inventory
└─ Track cost & prices

💰 SALES
├─ Record purchases
├─ Automatic stock update
├─ Sales history
└─ Revenue tracking

📈 STOCK MOVEMENTS
├─ Log stock in
├─ Log stock out
├─ Record adjustments
└─ View audit trail

📉 REPORTS
├─ Stock status report
├─ Sales analysis
├─ Product values
└─ Profit calculations

👥 USERS (Admin)
├─ Create staff accounts
├─ Assign roles
├─ Delete users
└─ Manage permissions
```

---

## 🚀 Common Tasks (Quick Steps)

### Add a Product
1. Click **Products**
2. Click **+ Add Product**
3. Fill in: Name, SKU, Quantity, Prices, Location, Supplier
4. Click **Add Product**
⏱️ Takes: 1 minute

### Record a Sale
1. Click **Sales**
2. Click **+ Record Sale**
3. Select Product → Qty → Price
4. Click **Record Sale**
5. Stock automatically reduces ✅
⏱️ Takes: 30 seconds

### Update Stock
1. Click **Stock Movements**
2. Click **+ Record Movement**
3. Select Product → Type (In/Out) → Qty → Notes
4. Click **Record Movement**
⏱️ Takes: 1 minute

### View Report
1. Click **Reports**
2. Pick report type (Stock/Sales/Values)
3. Apply date filters if needed
4. View analytics
⏱️ Takes: 2 minutes

### Add Staff Member
1. Click **Users** (Admin only)
2. Click **+ Add User**
3. Enter Email, Password, Role
4. Click **Create User**
5. Send login info to staff member
⏱️ Takes: 1 minute

---

## 📊 Data Entry Reference

### Product Fields
```
Product Name*    → e.g., "Solar Panel 500W"
SKU             → e.g., "SP-500"
Quantity*       → e.g., 50
Cost Price*     → e.g., 150000 (in TZS)
Selling Price*  → e.g., 250000 (in TZS)
Location*       → e.g., "Warehouse A"
Supplier*       → e.g., "Global Solar Corp"
```
*Required fields

### Sale Fields
```
Product*        → Select from dropdown
Quantity*       → e.g., 5
Unit Price      → Auto-filled (can override)
Total           → Auto-calculated
```

### Stock Movement Fields
```
Product*        → Select from dropdown
Type*           → In / Out / Adjustment / Damage
Quantity*       → e.g., 10
Notes           → Optional: "Received from supplier"
```

---

## 📱 Access From Anywhere

✅ **Desktop** - Full access to all features
✅ **Tablet** - Responsive interface
✅ **Phone** - Mobile-friendly
✅ **Different Locations** - No special setup needed
✅ **Remote Staff** - Cloud-based, internet required

---

## 🔒 Security Checklist

- [ ] Changed admin password from default
- [ ] Saved backup copies of passwords
- [ ] Enabled 2FA on Google/GitHub (if using)
- [ ] Reviewed backup status in Supabase weekly
- [ ] Informed staff about password safety
- [ ] Restricted access to admin account
- [ ] Kept API keys confidential

---

## 📞 Getting Help

### Error: Can't Log In
1. Check email spelling
2. Verify email confirmation
3. Try password reset on login page
4. Contact admin if still stuck

### Error: Product Not Saving
1. Check all required fields (marked with *)
2. Ensure you're logged in as Admin
3. Try again
4. Check browser console (F12)

### Error: Stock Not Updating
1. Verify quantity is available
2. Check product is active in database
3. Refresh page and try again

### Forgot Password
1. Click "Sign In" on login page
2. Click password reset option (if available)
3. Or contact admin to reset

### System Slow
1. Check internet speed
2. Try different browser
3. Clear cache (Ctrl+Shift+Delete)

---

## 💾 Backup & Maintenance

### Daily
- System auto-backups (Supabase)

### Weekly
- ✅ Check dashboard for anomalies
- ✅ Review sales trends
- ✅ Check low stock items

### Monthly
- ✅ Verify backups exist (Supabase)
- ✅ Review profit margins
- ✅ Update product prices if needed
- ✅ Reconcile physical counts

### Quarterly
- ✅ Change admin password
- ✅ Review user access
- ✅ Archive old sales data
- ✅ Update supplier info

---

## 🎯 Key Stats to Monitor

**Daily:**
- Low stock alerts ⚠️
- Sales count
- Stock movements

**Weekly:**
- Total revenue
- Top selling products
- Inventory value

**Monthly:**
- Profit margins
- Avg transaction value
- Product performance
- Staff activity

---

## 🌐 Browser Recommendations

**Best Experience With:**
- ✅ Chrome (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)

**Minimum Requirements:**
- JavaScript enabled
- Cookies enabled
- HTTPS support
- 1024x768 screen

---

## 🔧 Troubleshooting Quick Guide

```
Issue                          Solution
─────────────────────────────────────────────
Can't access app               Check internet & URL
Login fails                    Verify email/password
Products won't save            Check all required fields
Stock not updating             Refresh page
Reports not loading            Clear cache
Slow performance               Check internet speed
Can't see recent changes       Refresh browser (F5)
Mobile not responsive          Use latest browser
Database connection error      Check Supabase status
```

---

## 📈 Performance Tips

1. **Clear cache monthly** - Speeds up loading
2. **Refresh page daily** - Ensures fresh data
3. **Use modern browser** - Better performance
4. **Good internet connection** - Faster loading
5. **Don't keep too many tabs** - Reduces lag

---

## 🎓 Training Checklist

### For Admins
- [ ] Can log in and access all features
- [ ] Can add/edit/delete products
- [ ] Can create and manage users
- [ ] Can view all reports
- [ ] Can record sales and stock movements
- [ ] Understands backup system
- [ ] Knows how to reset passwords

### For Staff
- [ ] Can log in with credentials
- [ ] Can record sales
- [ ] Can update stock movements
- [ ] Can view reports
- [ ] Knows to inform admin of issues
- [ ] Understands role restrictions

---

## ⏰ Time Tracking

| Task | Time |
|------|------|
| Add product | 1 min |
| Record sale | 30 sec |
| Stock movement | 1 min |
| View report | 2 min |
| Create user | 1 min |
| Check dashboard | 2 min |

**Daily average:** 15-30 minutes total

---

## 💡 Pro Tips

1. **Batch data entry** - Add multiple products at once
2. **Use keyboard shortcuts** - Tab to move between fields
3. **Search first** - Use Ctrl+F to find products
4. **Export data** - Use browser's print function
5. **Set reminders** - For monthly backups check
6. **Name SKUs clearly** - Makes finding easier
7. **Use notes** - For stock movements context

---

## 🎯 Next Actions

1. **Today**: Log in and explore dashboard
2. **Tomorrow**: Add first 5-10 products
3. **This week**: Invite staff members
4. **Next week**: Record first sales
5. **Ongoing**: Review reports weekly

---

**System**: Holland Greentech Inventory v1.0
**Hosted**: Vercel (Global CDN)
**Database**: Supabase (Auto-backup daily)
**Status**: ✅ Live & Production Ready

🟢 **System Status**: Online
⏰ **Last Check**: [Check app dashboard]
📈 **Uptime**: 99.9%

---

**Questions?** Read:
- README.md - Full documentation
- DEPLOYMENT_GUIDE.md - Setup details
- GETTING_STARTED.md - Step-by-step guide
