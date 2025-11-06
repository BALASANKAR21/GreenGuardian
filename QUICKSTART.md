# 🚀 GreenGuardian Quick Start

## Prerequisites
- Node.js 18+ installed
- API keys from the services below

## Get API Keys (5-10 minutes)

### 1. MongoDB Atlas (Required)
- Go to: https://www.mongodb.com/cloud/atlas/register
- Create free account → Create cluster (M0 free tier)
- Click "Connect" → "Connect your application"
- Copy connection string
- Replace `<password>` with your password

### 2. OpenWeatherMap (Required)
- Go to: https://home.openweathermap.org/users/sign_up
- Sign up → Go to "API keys" tab
- Copy the default API key

### 3. AirVisual (Required)
- Go to: https://www.iqair.com/air-pollution-data-api
- Request API access → Check email for instant approval
- Copy API key from email

### 4. Pl@ntNet (Required)
- Go to: https://my.plantnet.org/
- Create account → Go to "API" section
- Generate API key → Copy it

### 5. IPinfo (Required)
- Go to: https://ipinfo.io/signup
- Sign up → Copy access token from dashboard

## Installation

```bash
cd /Users/balasankar/Downloads/GreenGuardian

# Run auto-configuration
chmod +x auto-configure.sh
./auto-configure.sh

# Choose option 1 (Interactive) and paste your API keys
```

## Run

```bash
# Start everything
./run-all.sh

# Open in browser
open http://localhost:9002
```

## Test

```bash
# Test all API endpoints
chmod +x test-apis.sh
./test-apis.sh
```

## Stop

```bash
./stop-all.sh
```

## Troubleshooting

### "MongoDB connection failed"
- Check if your IP is whitelisted in MongoDB Atlas
- Go to "Network Access" → Add IP Address → "Allow from anywhere" (for testing)

### "API key invalid"
- Verify keys are correctly pasted in `backend/.env`
- No extra spaces or quotes
- Check if API has been activated (some require email verification)

### Port already in use
```bash
# Kill processes on ports
lsof -ti:4000 | xargs kill -9
lsof -ti:9002 | xargs kill -9
```

### Still having issues?
```bash
# Run diagnostics
./diagnose.sh

# Check logs
tail -f backend.log
tail -f frontend.log
```

## Next Steps

1. **Test plant identification**: Upload a plant photo at `/dashboard/identify`
2. **Get recommendations**: Visit `/dashboard/recommendations` 
3. **Browse plants**: Check out `/dashboard/shop`
4. **View map**: See green spaces at `/dashboard/map`

---

Need help? Check the full [README.md](./README.md)
