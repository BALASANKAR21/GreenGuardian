#!/usr/bin/env bash
set -euo pipefail

# all-in-one-setup.sh
# Complete setup script that:
# 1. Sets up MongoDB connection
# 2. Configures Firebase
# 3. Builds and starts the full stack
# 4. Seeds demo data
# 5. Generates a demo report

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
FUNCTIONS_DIR="$ROOT_DIR/functions"
NEXT_PORT=9002
EMULATOR_LOG="$FUNCTIONS_DIR/functions.log"
NEXT_LOG="$ROOT_DIR/next.log"
REPORT="$ROOT_DIR/demo-report.txt"
DB_INSPECT="$ROOT_DIR/demo-db.txt"

# Default MongoDB URI (can be overridden by env var)
DEFAULT_MONGODB_URI="mongodb+srv://yrrr83632_db_user:FNYh4hZrAuSWR0XL@greenguardian.ozndg2y.mongodb.net/?retryWrites=true&w=majority&appName=greenguardian"

# Firebase config
FIREBASE_PROJECT_ID="greenguardian-1b7df"
export FIREBASE_PROJECT_ID

# Clean previous logs
rm -f "$EMULATOR_LOG" "$NEXT_LOG" "$REPORT" "$DB_INSPECT"

echo "=== GreenGuardian Full Stack Setup ==="

# Check prerequisites
missing=()
for cmd in node npm firebase mongosh openssl nc; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    missing+=("$cmd")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "Missing required tools: ${missing[*]}"
  echo "Please install: npm, node, firebase-tools, mongosh, openssl"
  exit 1
fi

# Set up MongoDB connection
export MONGODB_URI=${MONGODB_URI:-$DEFAULT_MONGODB_URI}

# Test MongoDB connection and list DBs
echo "Testing MongoDB connection..."
if ! node "$ROOT_DIR/scripts/inspect-mongo.js" > "$DB_INSPECT"; then
  echo "MongoDB connection failed. Trying local fallback..."
  export MONGODB_URI="mongodb://127.0.0.1:27017/greenguardian"
  echo "Switched to local MongoDB: $MONGODB_URI"
  
  # Try to start local MongoDB if installed via brew
  if command -v brew >/dev/null 2>&1; then
    echo "Starting local MongoDB via brew..."
    brew services start mongodb-community@6.0 || true
    sleep 2
  fi
fi

# Create .env.local for Next.js with Firebase config
cat > "$ROOT_DIR/.env.local" << EOL
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBZFysPakXskPgbz6zPvxMHHCgheckmQkA"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="greenguardian-1b7df.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://greenguardian-1b7df-default-rtdb.asia-southeast1.firebasedatabase.app"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="greenguardian-1b7df"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="greenguardian-1b7df.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="72180697477"
NEXT_PUBLIC_FIREBASE_APP_ID="1:72180697477:web:a5b2b89d7be0b812e01cec"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-392TM242WK"
EOL

# Build functions
echo "Building functions..."
cd "$FUNCTIONS_DIR"
npm run build

# Start functions emulator
echo "Starting Firebase Functions emulator..."
(npm run serve) > "$EMULATOR_LOG" 2>&1 &
EMU_PID=$!
echo "Functions emulator PID: $EMU_PID"

# Start Next.js
cd "$ROOT_DIR"
echo "Starting Next.js development server..."
(npm run dev) > "$NEXT_LOG" 2>&1 &
NEXT_PID=$!
echo "Next.js server PID: $NEXT_PID"

# Wait for services to initialize
echo "Waiting for services to initialize (10s)..."
sleep 10

# Seed database
echo "Seeding database..."
node "$FUNCTIONS_DIR/test-atlas.js" || echo "DB seed completed with warnings"

# Generate demo report
{
  echo "=== GreenGuardian Demo Report ==="
  echo "Generated: $(date)"
  echo
  echo "Environment:"
  echo "MongoDB URI: $MONGODB_URI"
  echo "Firebase Project: $FIREBASE_PROJECT_ID"
  echo
  echo "Services:"
  echo "- Functions emulator: http://localhost:5001/$FIREBASE_PROJECT_ID/us-central1/api"
  echo "- Next.js: http://localhost:$NEXT_PORT"
  echo
  echo "Database Inspection:"
  cat "$DB_INSPECT"
  echo
  echo "Functions Log Tail:"
  tail -n 20 "$EMULATOR_LOG"
  echo
  echo "Next.js Log Tail:"
  tail -n 20 "$NEXT_LOG"
  echo
  echo "Quick Demo Steps:"
  echo "1. Open http://localhost:$NEXT_PORT in your browser"
  echo "2. Sign in using Firebase Authentication"
  echo "3. View profile, garden, or environmental data"
  echo "4. Check MongoDB collections in Atlas or local DB"
  echo
  echo "Stack Features:"
  echo "- Next.js frontend with Tailwind CSS"
  echo "- Firebase Functions API with TypeScript"
  echo "- MongoDB database (Atlas or local)"
  echo "- Firebase Authentication"
  echo "- Real-time environmental data"
  echo "- Garden management"
  echo "- Plant identification"
  echo
  echo "To stop the demo:"
  echo "kill $EMU_PID $NEXT_PID"
} > "$REPORT"

echo
echo "=== Setup Complete ==="
echo "Demo report written to: $REPORT"
echo "Next.js URL: http://localhost:$NEXT_PORT"
echo "Functions API: http://localhost:5001/$FIREBASE_PROJECT_ID/us-central1/api"
echo
echo "To view logs:"
echo "tail -f $EMULATOR_LOG  # Functions emulator"
echo "tail -f $NEXT_LOG      # Next.js"
echo
echo "To stop services:"
echo "kill $EMU_PID $NEXT_PID"
echo
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
cleanup() {
  echo
  echo "Cleaning up..."
  kill $EMU_PID 2>/dev/null || true
  kill $NEXT_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait for processes
wait $EMU_PID $NEXT_PID