# 🔧 Fix MongoDB Atlas Connection Issues

## Current Problem

```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

**Cause:** Your current IP address is not allowed to connect to MongoDB Atlas.

---

## ✅ Quick Fix (2 minutes)

### Option 1: Use the Fix Script (Easiest)

```bash
chmod +x fix-mongodb.sh
./fix-mongodb.sh
```

The script will:
1. Detect your IP automatically
2. Guide you through whitelisting it
3. Test the connection

---

### Option 2: Manual Fix

**Step 1: Get Your IP Address**
```bash
curl https://api.ipify.org
# Example output: 103.21.58.142
```

**Step 2: Whitelist Your IP in MongoDB Atlas**

1. Go to: https://cloud.mongodb.com/
2. Log in
3. Select your project: **greenguardian**
4. Click **"Network Access"** (left sidebar)
5. Click **"+ ADD IP ADDRESS"** button
6. Choose one:
   
   **For Security (Recommended):**
   - Click "Add Current IP Address"
   - It will auto-fill your IP
   - Click "Confirm"
   
   **For Testing (Easier but less secure):**
   - Click "Allow Access from Anywhere"
   - IP will be: `0.0.0.0/0`
   - Click "Confirm"
   - ⚠️ This allows connections from any IP (use only for development)

7. Wait 1-2 minutes for changes to take effect

**Step 3: Test Connection**
```bash
cd backend
node -e "require('mongoose').connect(process.env.MONGODB_URI || 'mongodb+srv://admin:GreenGuardian2024@greenguardian.ozndg2y.mongodb.net/greenguardian').then(() => console.log('✓ Connected')).catch(e => console.log('✗ Failed:', e.message))"
```

---

## 🔍 Visual Guide

### MongoDB Atlas Network Access Screen

```
┌─────────────────────────────────────────────────────────┐
│ Network Access                          [+ ADD IP ADDRESS]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  IP Address           Comment          Status   Action  │
│  ───────────────────────────────────────────────────────│
│  103.21.58.142/32    My Computer      Active   [Delete] │
│  0.0.0.0/0           Allow All        Active   [Delete] │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Add IP Address Dialog

```
┌────────────────────────────────────────────┐
│ Add IP Access List Entry                  │
├────────────────────────────────────────────┤
│                                            │
│  ○ Add Current IP Address                 │
│     Your IP: 103.21.58.142                │
│                                            │
│  ○ Allow Access from Anywhere             │
│     IP Address: 0.0.0.0/0                 │
│                                            │
│  Comment (optional):                      │
│  ┌────────────────────────────────────┐   │
│  │ My MacBook                         │   │
│  └────────────────────────────────────┘   │
│                                            │
│              [Cancel]  [Confirm]           │
└────────────────────────────────────────────┘
```

---

## ⚡ After Whitelisting

### Verify Connection
```bash
cd /Users/balasankar/Downloads/GreenGuardian

# Validate env
./validate-env.sh

# Test MongoDB
cd backend
node -e "require('mongoose').connect('mongodb+srv://admin:GreenGuardian2024@greenguardian.ozndg2y.mongodb.net/greenguardian').then(() => console.log('✓ OK')).catch(e => console.log('✗ FAIL:', e.message))"
cd ..

# Start the app
./run-all.sh
```

---

## 🐛 Still Not Working?

### Issue: Connection still fails after whitelisting

**Solution 1: Wait longer**
```bash
# Wait 3-5 minutes, then retry
sleep 180
./run-all.sh
```

**Solution 2: Check if you're using VPN**
```bash
# If using VPN, disconnect it
# Your VPN changes your IP, so whitelist won't work
```

**Solution 3: Use 0.0.0.0/0 for testing**
- In MongoDB Atlas → Network Access
- Delete existing entries
- Add new: `0.0.0.0/0` (Allow from anywhere)
- This works from any IP (less secure, but good for testing)

### Issue: Wrong password or username

**Check your connection string:**
```bash
cat backend/.env | grep MONGODB_URI
```

Should look like:
```
MONGODB_URI=mongodb+srv://admin:GreenGuardian2024@greenguardian.ozndg2y.mongodb.net/greenguardian?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ `<password>` instead of actual password
- ❌ `< >` brackets still present
- ❌ Spaces in the URL
- ❌ Missing `?retryWrites=true&w=majority`

**Fix it:**
```bash
# Edit backend/.env
nano backend/.env

# Make sure MONGODB_URI has:
# 1. Your real username (admin)
# 2. Your real password (GreenGuardian2024)
# 3. No < > brackets
# 4. No spaces
```

### Issue: Cluster name doesn't match

**Your URI has:** `greenguardian.ozndg2y.mongodb.net`

Make sure:
1. Your cluster exists in MongoDB Atlas
2. The cluster name matches
3. The database name is correct: `greenguardian`

---

## 📊 Connection Test Output

### ✅ Success looks like:
```bash
$ node -e "require('mongoose').connect(...)"
✓ Connected
```

### ❌ Failure looks like:
```bash
$ node -e "require('mongoose').connect(...)"
✗ Failed: Could not connect to any servers in your MongoDB Atlas cluster
```

---

## 🎯 Summary

**The fix is simple:**
1. Go to MongoDB Atlas → Network Access
2. Add your IP or use 0.0.0.0/0
3. Wait 2 minutes
4. Run `./run-all.sh`

**Most common solution:** Use **0.0.0.0/0** for development to avoid IP issues.

---

## 🚀 Next Steps

After MongoDB is working:

```bash
# Validate everything
./validate-env.sh

# Start the app
./run-all.sh

# Test APIs
./test-apis.sh

# Open in browser
open http://localhost:9002
```

Your GreenGuardian will be fully functional! 🌱
