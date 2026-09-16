# Member Onboarding & Access Guide
## HGT Stock & Sales System

---

## **Complete Member Lifecycle**

### **Phase 1: Admin Creates Member Account**

**What the Admin Does:**
1. Log in to system as Admin (PIN: 1234)
2. Click **"👥 Manage Members"** in sidebar
3. Click **"+ Add Member"** button
4. Fill in member details:
   - **Username**: Member's unique login name (e.g., "john_arusha")
   - **PIN Code**: Initial 4-digit password (e.g., "2024")
   - **Branch**: Select member's location (Arusha, Morogoro, Dar es Salaam, etc.)
   - **Is Admin**: Leave unchecked (only for admins)
5. Click **"Add Member"** button
6. System confirms: "Member added!"

**What Gets Created:**
- ✅ Username stored in system
- ✅ PIN securely stored
- ✅ Branch assignment for data access
- ✅ Staff role (not admin privileges)

**Output for Member:**
Admin notifies the member with:
```
Welcome to HGT Stock & Sales System!

System URL: https://holland-greentech-inventory.onrender.com
Username: john_arusha
Initial PIN: 2024
Branch: Arusha

Please log in and change your PIN immediately for security.
```

---

### **Phase 2: Member's First Login**

**Step 1: Access the System**
1. Open browser
2. Go to: https://holland-greentech-inventory.onrender.com
3. See the login screen

**Step 2: Enter Credentials**
- Username field: Enter the username (e.g., `john_arusha`)
- PIN Code field: Enter the initial PIN (e.g., `2024`)
- Click **"Login"** button

**Step 3: Welcome!**
Member now sees the **Staff Dashboard** with access to:
- 📊 **Dashboard** - Overview of system stats
- 👤 **Manage Customers** - Add/view/delete customers
- 💰 **Record Sales** - Record sales transactions
- 📦 **Stock Requests** - Request/return stock from warehouse
- 📊 **My Reports** - View and download branch reports
- 🔒 **Change PIN** - Update password (appears in header)

---

### **Phase 3: Member Changes PIN (Security)**

**Important:** Members should change their initial PIN immediately!

**Steps to Change PIN:**
1. After logging in, look at the top-right header
2. Click **"🔒 Change PIN"** button
3. Modal form appears with:
   - **Current PIN**: Enter the PIN they were given (e.g., `2024`)
   - **New PIN**: Enter desired new 4-digit PIN (e.g., `5678`)
   - **Confirm New PIN**: Re-enter the new PIN to verify
4. Click **"Change PIN"** button
5. System confirms: "PIN changed successfully!"
6. Auto-logout occurs
7. Member logs in again with new PIN

**PIN Rules:**
- ✅ Must be exactly 4 digits (0-9)
- ✅ Cannot be shared with others
- ✅ Should be memorable but not obvious
- ✅ Can be changed anytime from "🔒 Change PIN" menu
- ✅ Old PIN is no longer valid after change

**Example:**
- **Initial PIN:** `2024` (given by admin)
- **Member changes to:** `5678` (their choice)
- **Next login uses:** `5678` (old PIN no longer works)

---

### **Phase 4: Member Uses the System**

**Member Can:**
1. ✅ View dashboard with their branch's statistics
2. ✅ Add customers to the system
3. ✅ Record sales transactions
4. ✅ Request stock from warehouse
5. ✅ Return defective stock to warehouse
6. ✅ Download reports (stock, sales)
7. ✅ Change PIN anytime

**Member Cannot:**
- ❌ Add/manage products (admin-only)
- ❌ Manage other members (admin-only)
- ❌ View other branch data
- ❌ Access admin reports

---

## **Member Account Management Reference**

### **How Admins Manage Members**

**View All Members:**
1. Click **"👥 Manage Members"**
2. See table with all staff members showing:
   - Username
   - Branch assigned
   - Role (Admin/Staff)
   - Status (Active)
   - Actions (Deactivate button)

**Deactivate a Member:**
1. Find member in list
2. Click **"Deactivate"** button
3. Member can no longer log in
4. Their data remains in system

**Forgot PIN?**
- Member must contact admin
- Admin creates new member account with new username/PIN
- Old account should be deactivated
- OR admin can update member via API (requires technical access)

---

## **Common Member Questions**

### **Q: I forgot my PIN**
**A:** Contact your admin. They will:
1. Create you a new member account with a new PIN
2. The old account will be deactivated
3. Use the new credentials to log in

### **Q: Can I have multiple accounts?**
**A:** No. One username per person. If you need access from multiple devices, use the same username and PIN.

### **Q: Is my data private?**
**A:** Yes. Members only see their own branch's data. Other branches' sales, stock, and customer info is hidden.

### **Q: What if I see an error when logging in?**
**A:** Check that:
- Username is spelled correctly (case-sensitive)
- PIN is exactly 4 digits
- You entered your NEW PIN (if you changed it recently)
- You're using the correct URL: https://holland-greentech-inventory.onrender.com

### **Q: Can I change my PIN anytime?**
**A:** Yes! Click **"🔒 Change PIN"** in the header after logging in.

### **Q: What happens if I log out?**
**A:** Your session ends securely. You must log in again with username + PIN.

---

## **Admin Quick Reference: Member Creation Checklist**

**Before creating member account:**
- [ ] Verify member name and branch assignment
- [ ] Generate unique username (e.g., firstname_branch)
- [ ] Create secure initial PIN (4 digits)

**After creating member account:**
- [ ] Communicate credentials securely (don't email PIN in plain text)
- [ ] Tell member to log in and change PIN immediately
- [ ] Confirm member can access system
- [ ] Test member's branch data access

**Maintenance:**
- [ ] Regularly review active members
- [ ] Deactivate staff no longer needing access
- [ ] Monitor which members access which branches
- [ ] Backup PIN change records

---

## **Security Best Practices**

### **For Members:**
1. ✅ Change your initial PIN on first login
2. ✅ Use a PIN you won't forget but others can't guess
3. ✅ Never share your PIN with colleagues
4. ✅ Log out before leaving your device
5. ✅ Report any suspicious activity to admin

### **For Admins:**
1. ✅ Don't use sequential PINs (1234, 1111, etc.)
2. ✅ Verify member identity before creating account
3. ✅ Communicate PINs through secure channels
4. ✅ Deactivate accounts for departed staff promptly
5. ✅ Review member access logs regularly

---

## **System Architecture for Member Access**

```
┌─────────────────────────────────────────┐
│   Member (Branch Staff)                 │
│   Login: username + PIN                 │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Authentication    │
        │   (FastAPI Auth)    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Supabase Database  │
        │  (Stable, Secure)   │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Branch-Filtered    │
        │  Data Access        │
        └──────────┬──────────┘
                   │
┌──────────────────▼──────────────────────┐
│   Member Dashboard                      │
│   - Customers (branch-specific)         │
│   - Sales (branch-specific)             │
│   - Stock Requests (branch-specific)    │
│   - Reports (branch-specific)           │
└─────────────────────────────────────────┘
```

---

## **Version History**

- **v1.0** (2026-09-16): Initial member onboarding system
  - Admin member creation ✅
  - PIN-based login ✅
  - PIN change feature ✅
  - Branch-based data access ✅

---

**Questions?** Contact your admin or system administrator.
