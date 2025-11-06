# 🔧 GreenGuardian Troubleshooting Guide

## Current Issues & Solutions

### Issue 1: "MONGODB_URI is required" ❌

**Problem:** Backend `.env` file is missing MongoDB connection string.

**Solution:**
```bash
# Open backend/.env and add your MongoDB URI
cd /Users/balasankar/Downloads/GreenGuardian
nano backend/.env

# Add this line (using YOUR MongoDB URI):
MONGODB_URI=mongodb+srv://admin:GreenGuardian2024@greenguardian.ozndg2y.mongodb.net/greenguardian?retryWrites=true&w=majority
```

**Verify MongoDB Atlas Setup:**
1. Go to: https://cloud.mongodb.com/
2. Check "Network Access" → Your IP should be whitelisted (or use 0.0.0.0/0 for testing)
3. Check "Database Access" → User `admin` should exist with `GreenGuardian2024` password
4. Test connection:
```bash
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('✓ Connected')).catch(e => console.log('✗ Failed:', e.message));"
```

---

### Issue 2: Frontend fails to start on port 3000 ❌

**Problem:** Frontend is trying to start on port 3000 but should use 9002.

**Solution:**
```bash
# Check your package.json dev script
cat package.json | grep "dev"

# It should say:
# "dev": "next dev --turbopack -p 9002"

# If not, edit package.json and change the dev script
```

**Also check:**
```bash
# Make sure no other process is using port 9002
lsof -ti:9002 | xargs kill -9

# Restart
./stop-all.sh
./run-all.sh
```

---

### Issue 3: Backend won't start ❌

**Check logs:**
```bash
tail -50 backend.log
```

**Common causes:**

**A) Port 4000 already in use:**
```bash
# Kill the process
lsof -ti:4000 | xargs kill -9

# Restart
./run-all.sh
```

**B) Missing dependencies:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
cd ..
./run-all.sh
```

**C) Environment validation failed:**
```bash
# Validate your .env
./validate-env.sh

# Check the file directly
cat backend/.env

# Ensure no placeholder text remains
# Should NOT contain: "your_", "YOUR_", "REPLACE", "here"
```

---

### Issue 4: "Fast Refresh had to perform a full reload" ⚠️

**Problem:** Turbopack warning about lockfiles.

**Solution:**
```bash
# Remove the extra lockfile
rm /Users/balasankar/package-lock.json

# Keep only the project lockfile
# /Users/balasankar/Downloads/GreenGuardian/package-lock.json
```

---

## Quick Fixes

### Complete Reset
```bash
cd /Users/balasankar/Downloads/GreenGuardian

# Stop everything
./stop-all.sh
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:9002 | xargs kill -9 2>/dev/null

# Clean install backend
cd backend
rm -rf node_modules dist
npm install
npm run build
cd ..

# Clean install frontend
rm -rf node_modules .next
npm install

# Validate configuration
./validate-env.sh

# Start fresh
./run-all.sh
```

### Check What's Running
```bash
# Check backend
curl http://localhost:4000/api/health

# Check frontend
curl http://localhost:9002

# Check logs
tail -f backend.log
tail -f frontend.log
```

### Manual Start (for debugging)
```bash
# Terminal 1: Backend
cd /Users/balasankar/Downloads/GreenGuardian/backend
npm run dev

# Terminal 2: Frontend
cd /Users/balasankar/Downloads/GreenGuardian
npm run dev

# Terminal 3: Test
curl http://localhost:4000/api/health
curl http://localhost:9002
```

---

## Verification Checklist

Run these commands to verify everything is set up correctly:

```bash
cd /Users/balasankar/Downloads/GreenGuardian

# ✓ Check backend .env
cat backend/.env | grep -E "MONGODB_URI|OPENWEATHER|AIRVISUAL|PLANTNET|IPINFO"

# ✓ Validate environment
./validate-env.sh

# ✓ Check frontend .env.local
cat .env.local | grep NEXT_PUBLIC_API_BASE

# ✓ Check package.json dev script
cat package.json | grep '"dev"'

# ✓ Check ports are free
lsof -ti:4000 || echo "Port 4000 is free ✓"
lsof -ti:9002 || echo "Port 9002 is free ✓"

# ✓ Check backend dependencies
cd backend && npm list --depth=0 && cd ..

# ✓ Check frontend dependencies
npm list --depth=0 | head -20
```

---

## Expected Output

### Successful Start
```bash
./run-all.sh

# You should see:
Starting GreenGuardian...

Starting backend on port 4000...
Waiting for backend to start...
✓ Backend started (PID: 12345)
  Logs: /Users/balasankar/Downloads/GreenGuardian/backend.log
  API: http://localhost:4000/api/health

Starting frontend on port 9002...
Waiting for frontend to start...
✓ Frontend started (PID: 12346)
  Logs: /Users/balasankar/Downloads/GreenGuardian/frontend.log
  App: http://localhost:9002

═══════════════════════════════════════
GreenGuardian is running!
═══════════════════════════════════════

Access:
  Frontend: http://localhost:9002
  Backend:  http://localhost:4000
```

### Successful Validation
```bash
./validate-env.sh

# You should see:
🔍 Validating backend/.env configuration...

Checking required variables:
✓ MONGODB_URI is configured
✓ OPENWEATHER_API_KEY is configured
✓ AIRVISUAL_API_KEY is configured
✓ PLANTNET_API_KEY is configured
✓ IPINFO_TOKEN is configured

Checking optional variables:
✓ NASA_API_KEY is configured

═══════════════════════════════════════════════
✓ Configuration valid!

You can now start the app:
  ./run-all.sh
```

---

## Still Having Issues?

1. **Check the exact error:** Look at the last 50 lines of logs
   ```bash
   tail -50 backend.log
   tail -50 frontend.log
   ```

2. **Run diagnostics:**
   ```bash
   ./diagnose.sh
   ```

3. **Test backend manually:**
   ```bash
   cd backend
   npm run dev
   # Watch for any error messages
   ```

4. **Verify MongoDB connection:**
   ```bash
   cd backend
   node -e "require('mongoose').connect(process.env.MONGODB_URI || 'YOUR_URI').then(() => console.log('OK')).catch(e => console.log('FAIL:', e.message))"
   ```

5. **Check API keys are valid:**
   - OpenWeather: https://home.openweathermap.org/api_keys
   - AirVisual: Check email for API key
   - Pl@ntNet: https://my.plantnet.org/account/api
   - IPinfo: https://ipinfo.io/account/home

---

## Contact & Support

If none of these solutions work:

1. Save your logs:
   ```bash
   cp backend.log backend-error.log
   cp frontend.log frontend-error.log
   ```

2. Document your issue:
   - What command did you run?
   - What error did you see?
   - What's in the logs?
   - Have you followed all the steps above?

3. Check official docs:
   - MongoDB Atlas: https://www.mongodb.com/docs/atlas/
   - Next.js: https://nextjs.org/docs
   - Express: https://expressjs.com/

---

**Remember:** Most issues are caused by:
1. Missing or incorrect MongoDB URI
2. Ports already in use
3. Missing API keys in backend/.env
4. Frontend trying to use wrong port

Run `./validate-env.sh` and `./diagnose.sh` first! 🔍
