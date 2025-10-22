#!/usr/bin/env bash
set -euo pipefail

# run-local.sh
# Automates: set envs, test MongoDB connection, build & start functions emulator and Next dev server,
# optionally create a Firebase Auth test user (requires service account JSON and project ID).

# Usage:
#   chmod +x run-local.sh
#   ./run-local.sh

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
FUNCTIONS_DIR="$ROOT_DIR/functions"
NEXT_PORT=9002
EMULATOR_LOG="$FUNCTIONS_DIR/functions.log"
NEXT_LOG="$ROOT_DIR/next.log"
MONGO_TEST_SCRIPT="$FUNCTIONS_DIR/test-atlas.js"
FIREBASE_USER_SCRIPT="$FUNCTIONS_DIR/create-firebase-user.js"

# Helper functions
command_exists() { command -v "$1" >/dev/null 2>&1; }

echo "-- Full stack local runner for GreenGuardian --"

# Check prerequisites
missing=()
for cmd in node npm firebase; do
  if ! command_exists "$cmd"; then
    missing+=("$cmd")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "Missing required tools: ${missing[*]}"
  echo "Please install the missing tools before proceeding. Example: npm, node, firebase-tools"
  exit 1
fi

# Prompt for MONGODB_URI if not set
if [ -z "${MONGODB_URI:-}" ]; then
  read -r -p "Enter MongoDB URI (Atlas or mongodb://127.0.0.1:27017): " MONGODB_URI
  if [ -z "$MONGODB_URI" ]; then
    echo "No MONGODB_URI provided, aborting." >&2
    exit 1
  fi
fi
export MONGODB_URI

# Optional: FIREBASE_SERVICE_ACCOUNT (path to service account JSON) and FIREBASE_PROJECT_ID
if [ -z "${FIREBASE_SERVICE_ACCOUNT:-}" ]; then
  read -r -p "(Optional) Path to Firebase service account JSON (leave blank to skip creating a test Firebase user): " FIREBASE_SERVICE_ACCOUNT
fi
if [ -n "${FIREBASE_SERVICE_ACCOUNT}" ]; then
  if [ ! -f "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "Service account file not found: $FIREBASE_SERVICE_ACCOUNT" >&2
    exit 1
  fi
  export GOOGLE_APPLICATION_CREDENTIALS="$FIREBASE_SERVICE_ACCOUNT"
fi

if [ -z "${FIREBASE_PROJECT_ID:-}" ]; then
  read -r -p "(Optional) Firebase project ID (used when creating test user and for emulator messages): " FIREBASE_PROJECT_ID
fi

# Build functions
echo "Building functions (TypeScript)..."
cd "$FUNCTIONS_DIR"
npm run build

# Start functions emulator in background and log output
echo "Starting Firebase Functions emulator (logs -> $EMULATOR_LOG)"
# start emulator in background; keep PID
# we want to run in the background so the script can continue; redirect stdout/stderr
(npm run serve) > "$EMULATOR_LOG" 2>&1 &
EMU_PID=$!
echo "Emulator PID: $EMU_PID"

# Start Next dev server in background
cd "$ROOT_DIR"
echo "Starting Next dev server (port $NEXT_PORT) -> $NEXT_LOG"
(npm run dev) > "$NEXT_LOG" 2>&1 &
NEXT_PID=$!
echo "Next PID: $NEXT_PID"

# Wait a little for services to come up
sleep 6

# Run MongoDB test/seed script
echo "Testing MongoDB connection and seeding sample data using $MONGO_TEST_SCRIPT"
node "$MONGO_TEST_SCRIPT" || echo "MongoDB test-seed failed; check $EMULATOR_LOG and MongoDB connectivity"

# Optionally create a test Firebase Auth user
if [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] && [ -n "${FIREBASE_PROJECT_ID:-}" ]; then
  echo "Creating a test Firebase Auth user (project: $FIREBASE_PROJECT_ID)"
  node "$FIREBASE_USER_SCRIPT" "$FIREBASE_PROJECT_ID" || echo "Firebase user creation failed"
else
  echo "Skipping Firebase test user creation (service account or project id not provided)"
fi

# Print helpful URLs and tail logs suggestion
echo "\n--- Summary ---"
echo "Next dev server: http://localhost:$NEXT_PORT"
if [ -n "${FIREBASE_PROJECT_ID:-}" ]; then
  echo "Functions emulator base (approx): http://localhost:5001/$FIREBASE_PROJECT_ID/us-central1/api"
else
  echo "Functions emulator logs: $EMULATOR_LOG (search for 'http function initialized' to find exact URL)"
fi
echo "To follow logs: tail -f $EMULATOR_LOG"

echo "To stop both servers: kill $EMU_PID $NEXT_PID"

echo "Run the frontend app in a browser and the functions emulator will serve API routes under /api/v1"

# Wait on background processes so the script doesn't exit immediately
wait $EMU_PID $NEXT_PID

# End of script
