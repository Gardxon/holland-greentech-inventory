# 🌐 Tailscale Network Setup - Multi-Branch Access

Tailscale creates a secure private network connecting your central server to all 6 branch offices. All traffic is encrypted and private.

---

## What is Tailscale?

- **Private VPN Network** - Only your devices can connect
- **Zero Configuration** - Just install and login
- **Secure** - All traffic encrypted end-to-end
- **Free** - Up to 100 devices on free tier
- **Works Everywhere** - Windows, Mac, Linux, iOS, Android

---

## Step 1: Install Tailscale on Central Server (Arusha HQ)

### Download
1. Go to: https://tailscale.com/download/windows
2. Download the Windows installer
3. Run the installer
4. Accept license and complete installation

### Login to Tailscale
1. Tailscale icon appears in system tray (bottom right)
2. Click the icon → "Connect"
3. Browser opens, sign in with:
   - Google account, OR
   - Microsoft account, OR
   - GitHub account
4. Accept and authorize
5. **Connected!** ✓

### Get Your Server's Tailscale IP
1. Click Tailscale icon → "Taildrop" (or settings)
2. Look for "Your Tailscale IP" (e.g., `100.11.22.33`)
3. **Write this down** - branches will use this to connect

Example output:
```
Tailscale IP: 100.11.22.33
Status: Connected
```

**Note:** This is your SERVER'S address on the private network.

---

## Step 2: Install Tailscale on Each Branch Computer

### For Each of 6 Branches (Dar, Dodoma, Iringa, Manyara, etc.)

**On Branch Computer:**
1. Go to: https://tailscale.com/download/windows
2. Download and run installer
3. Click Tailscale icon → "Connect"
4. Sign in with **SAME ACCOUNT as server**
   - Must use same Google/Microsoft/GitHub account!
5. Accept and authorize
6. **Connected!** ✓

---

## Step 3: Verify Network Connection

### From Any Branch Computer

Open **Command Prompt** and test:

```bash
ping 100.11.22.33
```

Expected output:
```
Reply from 100.11.22.33: bytes=32 time=25ms TTL=64
```

**Success!** ✓ Branch can reach server.

---

## Step 4: Access Your API from Branches

### From Any Branch Computer Browser

Open: **http://100.11.22.33:8000/docs**

You should see:
- Swagger API documentation
- All 20+ endpoints
- Interactive testing

**Your system is now accessible from all branches!** 🎉

---

## Step 5: Test Stock Management

From any branch computer, try:

### 1. View All Branches
```
GET /branches
```
Should show: Arusha, Morogoro, Dar, Dodoma, Iringa, Manyara

### 2. View Products
```
GET /products?skip=0&limit=10
```
Should show first 10 of 197 products

### 3. Check Stock at Your Branch
```
GET /inventory/branch/3
```
(Change branch ID for different locations)

### 4. Log a Transfer
```
POST /movements
{
  "product_id": 1,
  "from_branch_id": 1,
  "to_branch_id": 3,
  "quantity": 50,
  "movement_type": "transfer",
  "reference_number": "TRF-001",
  "notes": "Transfer from HQ to Dar branch"
}
```

---

## Network Map

```
                    INTERNET
                       |
        (Private Tailscale Network)
                       |
        ┌──────────────┼──────────────┐
        |              |              |
    Arusha HQ      Morogoro         Dar
    (Server)      (Sub-branch)   (Sub-branch)
    100.x.x.1     100.x.x.2      100.x.x.3
        |              |              |
        └──────────────┼──────────────┘
                       |
              (All connected securely)
                       |
              Dodoma, Iringa, Manyara
              (Also connected)
```

Each branch gets a unique Tailscale IP and can reach the server.

---

## Troubleshooting

### "Connection refused" from branch

**Problem:** Branch can't reach server  
**Solution:**
1. Check server Tailscale is running (icon in tray)
2. Check branch Tailscale is running
3. Verify both using **same login account**
4. Restart Tailscale on both machines

### "Wrong password or can't login"

**Problem:** Can't login to Tailscale  
**Solution:**
1. Use a Google, Microsoft, or GitHub account
2. Make sure it's the SAME account on server and branches
3. If new account, create one at https://tailscale.com

### "Ping works but browser can't connect"

**Problem:** Ping 100.x.x.x works but http://100.x.x.x:8000 fails  
**Solution:**
1. Wait 30 seconds for server to fully start
2. Check server is still running (`Uvicorn running on...`)
3. Try: http://localhost:8000/docs (on server only)
4. Firewall may block port 8000 - open it in Windows Firewall

### "Other branch can't see our products/stock"

**Problem:** Branch sees API but no data  
**Solution:**
1. Data was imported - check at http://localhost:8000/docs (server only)
2. All branches see same database (PostgreSQL)
3. Try GET /branches to verify connection works

---

## Security Tips

1. **Use strong passwords** on your Google/Microsoft/GitHub account
2. **Share login credentials carefully** - use secure method to give branch staff the account
3. **Disable unused devices** - go to https://tailscale.com/admin/machines to manage
4. **Monthly backups** - back up PostgreSQL database weekly

---

## User Access (Per Branch)

### Option A: Shared Account (Simpler)
- All staff use same Tailscale login
- Everyone can access API
- Good for teams that trust each other

### Option B: Individual Accounts (Better)
- Each staff member signs up for Tailscale
- All use same organization (same Google Workspace, etc.)
- Can track who made what changes
- Requires more management

For now, **use Option A** (shared login).

---

## Daily Operation

### Each Day
1. **Server:** Tailscale stays running (runs in background)
2. **Branches:** Tailscale stays running
3. **Access:** Open http://100.x.x.x:8000/docs from any branch
4. **Log transfers:** Use Swagger UI to record movements
5. **Check stock:** View inventory by branch in real-time

### If Server Restarts
1. Tailscale reconnects automatically
2. API comes back online in ~30 seconds
3. Branches automatically reconnect

---

## Advanced: Custom DNS Names

Instead of remembering IP addresses, you can use device names:

```
http://arusha-hq:8000/docs
```

Setup:
1. Go to https://tailscale.com/admin/machines
2. Find your server machine
3. Set "Machine name" to "arusha-hq"
4. Branch computers can now use: `http://arusha-hq:8000/docs`

---

## Performance Expectations

- **Speed:** Instant (local network speed)
- **Latency:** 25-50ms typical
- **Reliability:** 99.9% uptime
- **Security:** Military-grade encryption

---

## Getting Help

If issues occur:
1. Check Tailscale status: https://status.tailscale.com
2. Restart Tailscale app (exit, then relaunch)
3. Check firewall settings
4. Contact: support@tailscale.com

---

## Next Steps

1. ✅ Install Tailscale on server
2. ✅ Get server's Tailscale IP (e.g., 100.11.22.33)
3. ✅ Install Tailscale on all 6 branches
4. ✅ Test ping from each branch
5. ✅ Open http://[SERVER-IP]:8000/docs from each branch
6. ✅ Train staff to use API

---

## Quick Reference Card

**For Each Branch Computer:**

```
Server IP:     100.11.22.33  (replace with your actual IP)
API Access:    http://100.11.22.33:8000/docs
Test Ping:     ping 100.11.22.33
Login:         Use same account as server
Status:        Connected = working
```

Print this card and give to branch staff!

---

## Checklist

- [ ] Installed Tailscale on server (Arusha HQ)
- [ ] Server connected and showing Tailscale IP
- [ ] Installed Tailscale on Morogoro warehouse
- [ ] Installed Tailscale on Dar sub-branch
- [ ] Installed Tailscale on Dodoma sub-branch
- [ ] Installed Tailscale on Iringa sub-branch
- [ ] Installed Tailscale on Manyara sub-branch
- [ ] All machines using SAME login account
- [ ] Tested ping from each branch to server
- [ ] Tested http://[SERVER-IP]:8000/docs from each branch
- [ ] Trained staff to use API
- [ ] Set up device name (optional)

---

**Your multi-branch network is ready!** 🌐

All 6 branch offices now have secure, real-time access to the central inventory system.
