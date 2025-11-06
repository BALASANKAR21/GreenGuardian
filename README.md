# 🌱 GreenGuardian – Smart Urban Planting Advisor

> "Helping cities go green, one smart choice at a time"

GreenGuardian is a smart assistant designed to help urban residents select the most suitable plants for their living spaces using real-time environmental data.
## Features

-  **Auto-Location Detection** – Detects your city automatically
-  **Weather-Based Recommendations** – Suggests plants based on climate
-  **Plant Identification** – Upload photos to identify plant species
-  **Interactive Map** – Shows local green spaces and planting areas
-  **Air Quality Awareness** – Recommends air-purifying plants
-  **Space-Optimized** – Indoor, balcony, or outdoor suggestions

## Tech Stack

- **Frontend:** React/Next.js
- **Backend:** TypeScript + Express
- **Database:** MongoDB Atlas
- **APIs:** OpenWeatherMap, AirVisual, Pl@ntNet, IPinfo

## Quick Start

### 1. Automated Setup (Recommended)

```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

Follow the prompts to configure API keys, then:

```bash
# Start everything
./run-all.sh

# Stop everything
./stop-all.sh
```

### 2. Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and fill in:
# - MONGODB_URI (MongoDB Atlas connection string)
# - OPENWEATHER_API_KEY (https://openweathermap.org/api)
# - AIRVISUAL_API_KEY (https://www.iqair.com/air-pollution-data-api)
# - PLANTNET_API_KEY (https://my.plantnet.org/)
# - IPINFO_TOKEN (https://ipinfo.io/)

# Run development server
npm run dev

# Or build and run production
npm run build
npm start
```

Backend runs on: http://localhost:4000

#### Frontend

```bash
# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_BASE=http://localhost:4000" > .env.local

# Run development server
npm run dev
```

Frontend runs on: http://localhost:3000

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Location Detection
```bash
GET /api/location/detect
```

### Environment Data
```bash
GET /api/environment?lat=12.97&lon=77.59
```

### Plant Identification
```bash
POST /api/identify
Content-Type: multipart/form-data
Body: image (file)
```

### Search Plants
```bash
GET /api/plants?query=aloe&space=indoor&tags=air_purifying
```

### Get Recommendations
```bash
GET /api/recommendations?lat=12.97&lon=77.59&space=indoor&preferences=air_purifying,pet_friendly
```

## Database Access

### MongoDB Compass (GUI)
1. Download from: https://www.mongodb.com/try/download/compass
2. Connect using your MONGODB_URI from .env

### mongosh (CLI)
```bash
# Use the helper script
./view-db.sh

# Or manually
mongosh "your-mongodb-uri"
use greenguardian
db.plants.find().limit(5)
```

## Configuration

### Backend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4000) |
| `FRONTEND_ORIGIN` | Yes | Allowed CORS origins |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `AIRVISUAL_API_KEY` | Yes | AirVisual API key |
| `PLANTNET_API_KEY` | Yes | Pl@ntNet API key |
| `IPINFO_TOKEN` | Yes | IPinfo token |
| `NASA_API_KEY` | No | Optional NASA SMAP API key |

### Frontend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE` | Yes | Backend API URL |

## Development

### Seeding Database
```bash
cd backend
npm run seed
```

### Viewing Logs
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:4000/api/health

# Get plants
curl "http://localhost:4000/api/plants?query=aloe"

# Get recommendations
curl "http://localhost:4000/api/recommendations?lat=12.97&lon=77.59&space=indoor"
```

## Security Features

- ✅ Helmet.js security headers
- ✅ CORS with origin whitelist
- ✅ Rate limiting (60 req/min)
- ✅ Input validation & sanitization
- ✅ File upload size/type restrictions
- ✅ Auto-cleanup of temp files
- ✅ Environment variable validation

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_ORIGIN` in backend/.env matches your frontend URL exactly
- For development, you can use `FRONTEND_ORIGIN=*` (not recommended for production)

### MongoDB Connection Failed
- Verify your MONGODB_URI is correct
- Check if your IP is whitelisted in MongoDB Atlas (Network Access)
- Ensure database user has read/write permissions

### API Key Errors
- Verify all required API keys are set in backend/.env
- Check if API keys have correct permissions/quotas
- Some APIs require email verification before activation

### Port Already in Use
```bash
# Find process using port 4000
lsof -ti:4000 | xargs kill -9

# Or change PORT in backend/.env
```

## Project Structure

```
GreenGuardian/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Main server
│   │   ├── env.ts            # Environment validation
│   │   ├── db.ts             # MongoDB connection
│   │   ├── plantModel.ts     # Plant schema
│   │   ├── external.ts       # External API calls
│   │   └── plants.seed.json  # Initial plant data
│   ├── package.json
│   └── .env
├── src/
│   └── lib/
│       └── utils.ts          # Frontend utilities
├── setup.sh                  # Automated setup script
├── run-all.sh               # Start all services
├── stop-all.sh              # Stop all services
├── view-db.sh               # Database viewer
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review backend logs: `tail -f backend.log`
- Verify all API keys are valid and have quota remaining
- Ensure MongoDB Atlas allows your IP address

---

**GreenGuardian** brings tech and nature together. It empowers citizens to make smart, eco-friendly planting decisions—turning cities greener, cleaner, and smarter. 🌿
