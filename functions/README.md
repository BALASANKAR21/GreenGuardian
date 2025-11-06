# GreenGuardian Backend (Firebase Functions)

## Setup

1. **Install dependencies**
   ```bash
   cd functions
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env` and fill in your MongoDB URI and API keys.
   ```bash
   cp .env.example .env
   # Edit .env and add your real keys
   ```

3. **Build the functions**
   ```bash
   npm run build
   ```

4. **Serve locally (emulator)**
   ```bash
   npm run serve
   ```
   - Functions available at: `http://localhost:5001/<your-project-id>/us-central1/<functionName>`

5. **Test MongoDB connection**
   - Call the test endpoint:
   ```bash
   curl http://localhost:5001/<your-project-id>/us-central1/testDbConnection
   ```
   - Should return `{ success: true, collections: [...] }` if connected.

6. **Deploy to Firebase**
   ```bash
   firebase deploy --only functions
   ```

## Main Endpoints
- `/onboardUser` – User onboarding/profile
- `/getUserProfile` – Get user profile
- `/recommendPlants` – Plant recommendations
- `/identifyPlant` – Plant image identification
- `/getWeather` – Weather data proxy
- `/getGreenSpaces` – Green spaces/map data
- `/testDbConnection` – Test MongoDB connection

## Notes
- Store secrets in `.env` (local) or use `firebase functions:config:set` for production.
- Extend each function as needed for your business logic and API integrations.
