
# 🔧 GreenGuardian Backend Architecture

## Overview

The backend is a **TypeScript Express API** that powers GreenGuardian's intelligent plant recommendation system by integrating multiple external services and providing a secure, scalable REST API.

---

## 🎯 Core Functionality

### 1. **Plant Recommendation Engine**
**Location:** `/api/recommendations`

**What it does:**
- Takes user's GPS coordinates (lat/lon) and living space type (indoor/balcony/outdoor)
- Fetches real-time weather and air quality data
- Queries MongoDB for plants matching the space type
- **Smart Scoring Algorithm:**
  - ✅ Temperature compatibility (±3°C tolerance)
  - ✅ Sunlight requirements vs cloudiness
  - ✅ Air quality triggers (recommends purifying plants when AQI > 80)
  - ✅ User preferences (pet-friendly, low maintenance, etc.)
- Returns top 20 ranked plant suggestions

**Example:**
```bash
GET /api/recommendations?lat=12.97&lon=77.59&space=indoor&preferences=air_purifying,pet_friendly
```

**Response:**
```json
{
  "context": {
    "lat": 12.97,
    "lon": 77.59,
    "space": "indoor",
    "tempC": 28.5,
    "cloudiness": 40,
    "aqiUS": 95
  },
  "items": [
    {
      "plant": {
        "name": "Snake Plant",
        "scientificName": "Dracaena trifasciata",
        "airPurifying": true,
        "petFriendly": false,
        "waterNeeds": "low"
      },
      "score": 8
    }
  ]
}
```

---

### 2. **Auto-Location Detection**
**Location:** `/api/location/detect`

**What it does:**
- Detects user's location from IP address using **IPinfo API**
- Extracts city, region, country, and GPS coordinates
- Works with proxy IPs via `X-Forwarded-For` header

**Example:**
```bash
GET /api/location/detect
```

**Response:**
```json
{
  "ip": "103.21.58.12",
  "city": "Bangalore",
  "region": "Karnataka",
  "country": "IN",
  "lat": 12.9716,
  "lon": 77.5946
}
```

---

### 3. **Environmental Data Aggregation**
**Location:** `/api/environment`

**What it does:**
- Combines data from 3 APIs in parallel:
  - **OpenWeatherMap**: Temperature, humidity, cloudiness, sunrise/sunset
  - **AirVisual**: Air Quality Index (AQI)
  - **NASA (optional)**: Soil moisture data
- Provides comprehensive environmental context for plant recommendations

**Example:**
```bash
GET /api/environment?lat=12.97&lon=77.59
```

**Response:**
```json
{
  "lat": 12.97,
  "lon": 77.59,
  "weather": {
    "tempC": 28.5,
    "humidity": 65,
    "cloudiness": 40,
    "conditions": "Clear",
    "sunrise": "2024-01-15T00:45:00.000Z",
    "sunset": "2024-01-15T12:15:00.000Z"
  },
  "air": {
    "aqiUS": 95
  },
  "soil": {
    "soilMoisture": null,
    "source": null
  }
}
```

---

### 4. **Plant Identification (Image Recognition)**
**Location:** `/api/identify`

**What it does:**
- Accepts plant photo uploads (JPEG, PNG, WebP, HEIC, HEIF)
- Sends to **Pl@ntNet API** for AI-powered species identification
- Returns top 5 matches with:
  - Scientific name
  - Common names
  - Confidence score
  - Genus and family classification

**Example:**
```bash
POST /api/identify
Content-Type: multipart/form-data
Body: image=<file>
```

**Response:**
```json
{
  "results": [
    {
      "score": 0.9234,
      "species": "Rosa chinensis",
      "commonNames": ["China Rose", "Chinese Hibiscus"],
      "genus": "Rosa",
      "family": "Rosaceae"
    }
  ]
}
```

---

### 5. **Plant Catalog Search**
**Location:** `/api/plants`

**What it does:**
- Full-text search across plant database
- Filter by:
  - Name/scientific name (text search)
  - Space type (indoor/balcony/outdoor)
  - Tags (air_purifying, low_maintenance, etc.)
- Falls back to regex search if MongoDB text index is missing

**Example:**
```bash
GET /api/plants?query=aloe&space=indoor&tags=air_purifying
```

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Aloe Vera",
    "scientificName": "Aloe vera",
    "minTempC": 13,
    "maxTempC": 32,
    "sunlight": "full",
    "waterNeeds": "low",
    "spaces": ["indoor", "balcony", "outdoor"],
    "tags": ["succulent", "low_water"],
    "airPurifying": false,
    "petFriendly": false,
    "imageUrl": "https://images.unsplash.com/..."
  }
]
```

---

## 🔐 Security Features

### 1. **CORS Protection**
- Whitelist-based origin validation
- Supports single origin, comma-separated list, or wildcard (*)
- Rejects unauthorized cross-origin requests with 403

### 2. **Rate Limiting**
- 60 requests per minute per IP
- Prevents API abuse and DDoS attacks
- Uses `express-rate-limit`

### 3. **Input Validation**
- ✅ Latitude/longitude bounds (-90 to 90, -180 to 180)
- ✅ Query string length limits (64 chars)
- ✅ Space type enum validation (indoor/balcony/outdoor only)
- ✅ Zod schema validation for environment variables

### 4. **File Upload Security**
- Max size: 5MB
- Allowed types: JPEG, PNG, WebP, HEIC, HEIF only
- Automatic cleanup after processing
- Periodic temp folder cleanup (12-hour old files)

### 5. **Security Headers (Helmet.js)**
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- Hides X-Powered-By header

### 6. **Error Handling**
- Never exposes stack traces to clients (500 errors)
- Logs all errors server-side
- Global unhandled rejection handlers

---

## 🗄️ Database (MongoDB Atlas)

### Plant Schema
```typescript
{
  name: string                    // Common name
  scientificName: string          // Latin name
  minTempC: number               // Min temperature (°C)
  maxTempC: number               // Max temperature (°C)
  sunlight: "full" | "partial" | "shade"
  waterNeeds: "low" | "medium" | "high"
  spaces: ["indoor" | "balcony" | "outdoor"]
  tags: string[]                 // air_purifying, pet_friendly, etc.
  airPurifying: boolean
  petFriendly: boolean
  heightCm?: number
  spreadCm?: number
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### Indexes
- Text index on: `name`, `scientificName`, `tags`
- Single field indexes on: `name`, `scientificName`

### Seeding
- Auto-seeds 10 starter plants on first run
- Seeds from `backend/src/plants.seed.json`
- Can manually re-seed: `npm run seed`

---

## 🌐 External API Integrations

| Service | Purpose | Endpoint | Free Tier |
|---------|---------|----------|-----------|
| **IPinfo** | IP geolocation | `ipinfo.io` | 50k req/month |
| **OpenWeatherMap** | Weather data | `api.openweathermap.org` | 1k calls/day |
| **AirVisual** | Air quality | `api.airvisual.com` | 10k calls/month |
| **Pl@ntNet** | Plant identification | `my-api.plantnet.org` | 500 IDs/day |
| **NASA (optional)** | Soil moisture | `api.nasa.gov` | 1k calls/hour |

### Error Handling
- All API calls have 10-second timeout
- Graceful fallbacks (e.g., AirVisual failure returns null AQI)
- Detailed error messages for debugging

---

## 🚀 Performance Optimizations

### 1. **Parallel API Calls**
```typescript
const [weather, air, soil] = await Promise.all([
  fetchWeather(lat, lon),
  fetchAirQuality(lat, lon),
  fetchSoilMoisture(lat, lon)
]);
```

### 2. **MongoDB Query Limits**
- Plants search: 50 results max
- Recommendations: 500 plants queried, top 20 returned

### 3. **File Cleanup**
- Immediate deletion after plant identification
- Cron-style cleanup of old temp files (12+ hours)

### 4. **Lean Queries**
```typescript
PlantModel.find(query).limit(50).lean()
```
Returns plain objects (not Mongoose documents) for faster serialization.

---

## 📁 File Structure

```
backend/
├── src/
│   ├── index.ts           # Express app, routes, middleware
│   ├── env.ts             # Environment validation (Zod)
│   ├── db.ts              # MongoDB connection helper
│   ├── plantModel.ts      # Mongoose schema + model
│   ├── external.ts        # External API wrappers
│   ├── plants.seed.json   # Initial plant data
│   └── seed.ts            # Manual seeding script
├── package.json
├── tsconfig.json
└── .env                   # API keys (not committed)
```

---

## 🔄 Request Flow

### Example: Get Recommendations
```
1. Client → GET /api/recommendations?lat=12.97&lon=77.59&space=indoor
2. Backend validates lat/lon bounds
3. Backend calls OpenWeatherMap & AirVisual in parallel
4. Backend queries MongoDB for indoor plants
5. Backend scores each plant using algorithm
6. Backend returns top 20 sorted by score
7. Client → Displays personalized recommendations
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Seed database
npm run seed
```

---

## 🧪 Testing

```bash
# Test all endpoints
../test-apis.sh

# Health check
curl http://localhost:4000/api/health

# Test recommendations
curl "http://localhost:4000/api/recommendations?lat=12.97&lon=77.59&space=indoor"

# Test plant identification
curl -X POST -F "image=@plant.jpg" http://localhost:4000/api/identify
```

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB connection fails
**Solution:** 
- Check MONGODB_URI in `.env`
- Whitelist IP in MongoDB Atlas → Network Access
- Verify database user has read/write permissions

### Issue: API key errors
**Solution:**
- Verify keys in `backend/.env` (no quotes, no spaces)
- Check if API has been activated (some need email verification)
- Confirm quotas haven't been exceeded

### Issue: CORS errors
**Solution:**
- Set `FRONTEND_ORIGIN=http://localhost:9002` (exact match)
- Or use `FRONTEND_ORIGIN=*` for development

### Issue: Plant identification fails
**Solution:**
- Ensure image is JPEG/PNG/WebP < 5MB
- Check PLANTNET_API_KEY is valid
- Verify daily quota (500 IDs/day on free tier)

---

## 📊 Monitoring & Logs

### Console Logs
```typescript
[api] listening on http://localhost:4000
[api] CORS: http://localhost:9002
[db] connected
[seed] inserted 10 plants
[error] Weather data fetch failed. Check OPENWEATHER_API_KEY.
```

### Log Files (when using run-all.sh)
- `backend.log` - All backend output
- `frontend.log` - Frontend output

---

## 🔮 Future Enhancements

1. **Caching Layer** (Redis)
   - Cache weather/air data for 1 hour per location
   - Reduce external API calls by 90%

2. **User Profiles**
   - Save favorite plants
   - Track planting history
   - Personalized recommendations over time

3. **Notification System**
   - Watering reminders
   - Weather alerts for outdoor plants
   - Air quality warnings

4. **Advanced Search**
   - Fuzzy matching
   - Multi-language support
   - Image-based similarity search

5. **Analytics Dashboard**
   - API usage metrics
   - Popular plants by region
   - Recommendation success rate

---

**Summary:** Your backend is a robust, secure, production-ready API that intelligently combines real-time environmental data with a smart plant recommendation algorithm to help users make eco-friendly choices. 🌱
