# 📝 Complete Setup Guide for GreenGuardian

## Current Status
✅ Backend built successfully  
✅ Frontend dependencies installed  
❌ **API keys need to be configured in `backend/.env`**

---

## 🔑 Step-by-Step: Get All API Keys (15 minutes)

### 1️⃣ MongoDB Atlas (Database) - 5 minutes

**Why needed:** Stores plant catalog and user data

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Create Organization → Skip survey → Click "Build a Database"
4. Choose **M0 FREE** tier → AWS → Closest region → "Create Deployment"
5. **Security:**
   - Username: `greenguardian` (or your choice)
   - Password: Generate secure password → **SAVE IT!**
   - Click "Create Database User"
6. **Network Access:**
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
7. **Get Connection String:**
   - Click "Connect" button
   - Choose "Connect your application"
   - Copy the connection string
   - **Replace `<password>` with your actual password**

Example result:
```
mongodb+srv://greenguardian:MyP@ssw0rd123@cluster0.abc123.mongodb.net/greenguardian?retryWrites=true&w=majority
```

Paste this into `backend/.env` as `MONGODB_URI`

---

### 2️⃣ OpenWeatherMap (Weather Data) - 2 minutes

**Why needed:** Provides temperature, humidity, and weather conditions

1. Go to: https://home.openweathermap.org/users/sign_up
2. Sign up with email
3. **Check email** and click verification link
4. Go to: https://home.openweathermap.org/api_keys
5. Copy the "Default" API key (or create a new one)

Example result:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Paste this into `backend/.env` as `OPENWEATHER_API_KEY`

---

### 3️⃣ AirVisual (Air Quality) - 2 minutes

**Why needed:** Provides Air Quality Index (AQI) data

1. Go to: https://www.iqair.com/air-pollution-data-api
2. Fill the form:
   - Name
   - Email
   - Organization: "Personal Project" or your name
   - Use case: "Urban plant recommendation app"
3. Click "Request API Access"
4. **Check email immediately** (usually instant)
5. Copy the API key from email

Example result:
```
abcd1234-ef56-gh78-ij90-klmnopqrstuv
```

Paste this into `backend/.env` as `AIRVISUAL_API_KEY`

---

### 4️⃣ Pl@ntNet (Plant Identification) - 3 minutes

**Why needed:** Identifies plant species from photos

1. Go to: https://my.plantnet.org/
2. Click "Sign Up" → Use email or Google
3. After login, go to: https://my.plantnet.org/account/api
4. Click "Create API Key"
5. Name: "GreenGuardian"
6. Click "Generate"
7. Copy the API key

Example result:
```
2024abc123def456ghi789jklmnop
```

Paste this into `backend/.env` as `PLANTNET_API_KEY`

---

### 5️⃣ IPinfo (Location Detection) - 2 minutes

**Why needed:** Detects user's city from IP address

1. Go to: https://ipinfo.io/signup
2. Sign up with email or GitHub
3. After login, you'll see your token on the dashboard
4. Copy the "Access Token"

Example result:
```
1a2b3c4d5e6f7g
```

Paste this into `backend/.env` as `IPINFO_TOKEN`

---

## 📋 Final Checklist

Open `backend/.env` and verify it looks like this:

```dotenv
PORT=4000
FRONTEND_ORIGIN=http://localhost:9002,http://localhost:3000

MONGODB_URI=mongodb+srv://greenguardian:MyP@ssw0rd123@cluster0.abc123.mongodb.net/greenguardian?retryWrites=true&w=majority
OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
AIRVISUAL_API_KEY=abcd1234-ef56-gh78-ij90-klmnopqrstuv
PLANTNET_API_KEY=2024abc123def456ghi789jklmnop
IPINFO_TOKEN=1a2b3c4d5e6f7g
NASA_API_KEY=
```

**Important:**
- ✅ NO spaces around `=` signs
- ✅ NO quotes around values
- ✅ Replace ALL placeholder text with real keys
- ✅ Save the file

---

## 🚀 Start the App

After configuring `backend/.env`:

```bash
# From the GreenGuardian directory
cd /Users/balasankar/Downloads/GreenGuardian

# Stop any running services
./stop-all.sh

# Start everything
./run-all.sh

# Open in browser
open http://localhost:9002
```

---

## 🧪 Test Your Setup

```bash
# Run diagnostic
./test-apis.sh

# Expected output:
# ✓ Health Check: PASS
# ✓ Location Detection: PASS
# ✓ Environment Data: PASS
# ✓ Plants Search: PASS
# ✓ All tests passed!
```

---

## 🐛 Troubleshooting

### Error: "MONGODB_URI is required"
**Fix:** You didn't fill in MongoDB URI in `backend/.env`

### Error: "MongoDB connection failed"
**Fix:**
- Ensure IP is whitelisted in MongoDB Atlas → Network Access
- Check username/password are correct (no < > brackets)
- Verify connection string format

### Error: "Weather data fetch failed"
**Fix:**
- Verify OPENWEATHER_API_KEY is correct
- Check email verification (OpenWeather requires it)
- Wait 10 minutes after signup for activation

### Frontend shows "Failed to fetch"
**Fix:**
- Ensure backend is running: `curl http://localhost:4000/api/health`
- Check `FRONTEND_ORIGIN` in `backend/.env` includes your frontend URL
- Verify `.env.local` has `NEXT_PUBLIC_API_BASE=http://localhost:4000`

---

## 📞 Need Help?

1. Check logs: `tail -f backend.log`
2. Run diagnostics: `./diagnose.sh`
3. Verify all keys are filled: `cat backend/.env | grep -v "^#"`

---

**You're almost there! Just fill in those API keys and you'll be running GreenGuardian in minutes.** 🌱
