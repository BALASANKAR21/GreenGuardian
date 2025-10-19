# GreenGuardian: Local Development & Testing Guide

## Backend (Firebase Functions)

1. Install dependencies:
   ```sh
   cd functions
   npm install
   ```

2. Start the Firebase emulator:
   ```sh
   npx firebase emulators:start
   ```
   - Your functions will be available at: http://localhost:5001/[YOUR_PROJECT_ID]/us-central1/[functionName]

3. Test endpoints using Postman, Insomnia, or curl. Example:
   ```sh
   curl http://localhost:5001/YOUR_PROJECT_ID/us-central1/testDbConnection
   ```

## MongoDB Connection Test

- To verify MongoDB Atlas connection, run:
  ```sh
  node test-mongo.js
  ```
  - You should see: `Pinged your deployment. You successfully connected to MongoDB!`

## Frontend (Next.js)

1. Install dependencies:
   ```sh
   npm install
   ```

2. Start the development server:
   ```sh
   npm run dev
   ```
   - App will be available at: http://localhost:3000

3. Ensure `.env.local` is set up with your Firebase and API keys.

---

**Note:** Never commit secrets or passwords to your repository. Use environment variables for all sensitive data.
