# ✅ GreenGuardian Deployment Checklist

## 🎉 Configuration Complete!

All your API keys have been configured. Here's what's ready:

### Backend APIs Configured ✓
- ✅ MongoDB Atlas (Database)
- ✅ OpenWeatherMap (Weather data)
- ✅ AirVisual (Air quality)
- ✅ Pl@ntNet (Plant identification)
- ✅ IPinfo (Location detection)
- ✅ NASA API (Soil moisture - optional)

### Frontend Services Configured ✓
- ✅ Firebase (Authentication & Realtime DB)
- ✅ Mapbox (Interactive maps)
- ✅ Gemini AI (Optional AI features)
- ✅ Backend API connection

---

## 🚀 Start Your App

```bash
cd /Users/balasankar/Downloads/GreenGuardian

# Stop any running services
./stop-all.sh

# Start everything
./run-all.sh
```

**Your app will be available at:**
- Frontend: http://localhost:9002
- Backend API: http://localhost:4000

---

## 🧪 Test Your Setup

```bash
# Validate environment
./validate-env.sh

# Test all APIs
./test-apis.sh

# Check logs
tail -f backend.log
tail -f frontend.log
```

---

## 🔍 What Each Service Does

### Backend Services (http://localhost:4000)

| Endpoint | API Used | Purpose |
|----------|----------|---------|
| `/api/health` | - | Health check |
| `/api/location/detect` | IPinfo | Auto-detect user's city |
| `/api/environment` | OpenWeather + AirVisual | Get weather & air quality |
| `/api/identify` | Pl@ntNet | Identify plants from photos |
| `/api/plants` | MongoDB | Search plant catalog |
| `/api/recommendations` | All APIs | Smart plant suggestions |

### Frontend Features (http://localhost:9002)

| Page | Services Used | Purpose |
|------|---------------|---------|
| `/` | - | Landing page |
| `/login` | Firebase Auth | User authentication |
| `/dashboard` | Firebase + Backend | User dashboard |
| `/dashboard/recommendations` | Backend API | Get personalized plant suggestions |
| `/dashboard/identify` | Backend API + Pl@ntNet | Upload & identify plants |
| `/dashboard/map` | Mapbox | Interactive green spaces map |
| `/dashboard/shop` | Backend API | Browse plant catalog |
| `/dashboard/profile` | Firebase | User profile |

---

## 📊 API Quotas & Limits

### Free Tier Limits
- **MongoDB Atlas**: 512 MB storage
- **OpenWeatherMap**: 1,000 calls/day
- **AirVisual**: 10,000 calls/month
- **Pl@ntNet**: 500 identifications/day
- **IPinfo**: 50,000 requests/month
- **Firebase**: 10GB storage, 50K reads/day
- **Mapbox**: 50,000 map loads/month
- **NASA API**: 1,000 calls/hour

### Rate Limiting (Backend)
- 60 requests per minute per IP
- Automatic throttling prevents quota exhaustion

---

## 🔒 Security Checklist

### Backend Security ✓
- ✅ Helmet.js security headers enabled
- ✅ CORS configured (only allows your frontend)
- ✅ Rate limiting active (60 req/min)
- ✅ Input validation & sanitization
- ✅ File upload restrictions (5MB, images only)
- ✅ Environment variables validated (Zod)
- ✅ MongoDB connection encrypted (TLS)

### Frontend Security ✓
- ✅ Firebase Authentication enabled
- ✅ API keys properly scoped (NEXT_PUBLIC_ only for client-safe keys)
- ✅ Backend API key not exposed to frontend
- ✅ HTTPS ready (for production deployment)

---

## 🐛 Common Issues & Solutions

### Issue: Backend won't start
**Solution:**
```bash
cd backend
npm run build
npm start
```
Check `backend.log` for specific errors.

### Issue: Frontend can't connect to backend
**Solution:**
- Ensure backend is running: `curl http://localhost:4000/api/health`
- Check `.env.local` has `NEXT_PUBLIC_API_BASE=http://localhost:4000`
- Verify CORS in `backend/.env`: `FRONTEND_ORIGIN=http://localhost:9002`

### Issue: MongoDB connection fails
**Solution:**
- Check if IP is whitelisted in MongoDB Atlas → Network Access
- Verify username/password are correct (no < > brackets)
- Test connection: `mongosh "mongodb+srv://admin:GreenGuardian2024@..."`

### Issue: "API key invalid" errors
**Solution:**
- Check `backend/.env` has correct keys (no quotes, no spaces)
- Verify API key is active (some require email verification)
- Check quota hasn't been exceeded

### Issue: Plant identification fails
**Solution:**
- Ensure image is < 5MB and format is JPEG/PNG/WebP
- Check Pl@ntNet daily quota (500 IDs/day)
- Verify `PLANTNET_API_KEY` is correct

---

## 📈 Next Steps

### 1. Test All Features
- ✅ Sign up / Login with Firebase
- ✅ Get location-based recommendations
- ✅ Upload a plant photo for identification
- ✅ Browse plant catalog
- ✅ View interactive map

### 2. Monitor Usage
```bash
# Watch logs in real-time
tail -f backend.log | grep -i error

# Check MongoDB stats
./view-db.sh
```

### 3. Production Deployment (Optional)

**Backend Options:**
- Vercel: `cd backend && vercel`
- Railway: `railway up`
- Render: Connect GitHub repo

**Frontend Options:**
- Vercel: `vercel`
- Netlify: `netlify deploy`

**Update Environment Variables:**
- Set `NODE_ENV=production`
- Set `FRONTEND_ORIGIN` to your deployed frontend URL
- Set `NEXT_PUBLIC_API_BASE` to your deployed backend URL
- Never commit `.env` or `.env.local` files!

---

## 🎯 Performance Tips

### Backend Optimization
- ✅ Parallel API calls (already implemented)
- ✅ MongoDB query limits (50 results max)
- ✅ Lean queries for faster responses
- ✅ Automatic temp file cleanup

### Frontend Optimization
- Use Next.js Image component for plant images
- Implement lazy loading for plant catalog
- Cache API responses (React Query recommended)
- Add loading skeletons for better UX

---

## 📞 Support

### Debugging Commands
```bash
# Full diagnostic
./diagnose.sh

# Test specific endpoint
curl http://localhost:4000/api/health
curl http://localhost:4000/api/location/detect
curl "http://localhost:4000/api/plants?query=aloe"

# Check environment
cat backend/.env | grep -v "^#"
cat .env.local | grep -v "^#"

# View logs
tail -100 backend.log
tail -100 frontend.log
```

### Log Locations
- Backend: `/Users/balasankar/Downloads/GreenGuardian/backend.log`
- Frontend: `/Users/balasankar/Downloads/GreenGuardian/frontend.log`

---

## 🌟 You're All Set!

Everything is configured and ready to go. Run `./run-all.sh` and start exploring GreenGuardian! 🌱

**Happy Planting!** 🎉
