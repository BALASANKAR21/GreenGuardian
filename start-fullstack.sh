#!/usr/bin/env bash
set -euo pipefail

# start-fullstack.sh
# One-shot helper to run the full stack locally for demo:
# - verifies MongoDB connectivity
# - builds functions
# - starts Firebase Functions emulator (in background)
# - starts Next dev server (in background)
# - seeds MongoDB via functions/test-atlas.js
# - optionally creates a Firebase Auth test user (requires service account)

# Usage:
#   chmod +x start-fullstack.sh
#   ./start-fullstack.sh

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
FUNCTIONS_DIR="$ROOT_DIR/functions"
NEXT_PORT=9002
EMULATOR_LOG="$FUNCTIONS_DIR/functions.log"
NEXT_LOG="$ROOT_DIR/next.log"
INSPECT_SCRIPT="$ROOT_DIR/scripts/inspect-mongo.js"
MONGO_TEST_SCRIPT="$FUNCTIONS_DIR/test-atlas.js"
FIREBASE_USER_SCRIPT="$FUNCTIONS_DIR/create-firebase-user.js"

# Helper
command_exists() { command -v "$1" >/dev/null 2>&1; }

echo "\n=== GreenGuardian full-stack starter ===\n"

# Check prerequisites
missing=()
for cmd in node npm firebase mongosh openssl; do
  if ! command_exists "$cmd"; then
    missing+=("$cmd")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "Missing required tools: ${missing[*]}"
  echo "Install the missing tools and re-run. (npm/node, firebase-tools, mongosh, openssl)"
  exit 1
fi

# Ask for MONGODB_URI if not set
if [ -z "${MONGODB_URI:-}" ]; then
  read -r -p "Enter MongoDB URI (Atlas or mongodb://127.0.0.1:27017). Leave blank to try local mongod: " MONGODB_URI
fi

# If still empty, assume local
if [ -z "${MONGODB_URI:-}" ]; then
  echo "No MONGODB_URI provided; will try local mongod at mongodb://127.0.0.1:27017/greenguardian"
  export MONGODB_URI="mongodb://127.0.0.1:27017/greenguardian"
else
  export MONGODB_URI
fi

# Optional Firebase service account for creating a test user and for storage
if [ -z "${FIREBASE_SERVICE_ACCOUNT:-}" ]; then
  read -r -p "(Optional) Path to Firebase service account JSON (leave blank to skip Firebase Admin tasks): " FIREBASE_SERVICE_ACCOUNT
fi
if [ -n "${FIREBASE_SERVICE_ACCOUNT}" ]; then
  if [ ! -f "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "Service account file not found: $FIREBASE_SERVICE_ACCOUNT" >&2
    exit 1
  fi
  export GOOGLE_APPLICATION_CREDENTIALS="$FIREBASE_SERVICE_ACCOUNT"
  if [ -z "${FIREBASE_PROJECT_ID:-}" ]; then
    read -r -p "Firebase project id for emulator messages (optional): " FIREBASE_PROJECT_ID
  fi
  export FIREBASE_PROJECT_ID
fi

# Function to test MongoDB connectivity via the inspector script
test_mongo() {
  echo "\n-> Testing MongoDB connection via $INSPECT_SCRIPT"
  if [ ! -f "$INSPECT_SCRIPT" ]; then
    echo "Inspector script not found at $INSPECT_SCRIPT" >&2
    return 2
  fi

  # run inspector; capture output
  if node "$INSPECT_SCRIPT"; then
    echo "MongoDB inspection succeeded"
    return 0
  else
    rc=$?
    echo "MongoDB inspection failed (exit $rc)"
    return $rc
  fi
}

# Try to test MongoDB with retries
attempt=1
max_attempts=2
while [ $attempt -le $max_attempts ]; do
  if test_mongo; then
    break
  fi
  attempt=$((attempt+1))
  echo "Retrying MongoDB test ($attempt/$max_attempts) in 2s..."
  sleep 2
done

# If still failing, offer fallback to local mongod
if ! test_mongo; then
  echo "\nMongoDB connection failed. Two common fixes:"
  echo "  1) Use a different network (mobile hotspot) if your network does TLS-inspection/firewall"
  echo "  2) For demo, run a local MongoDB and point MONGODB_URI to mongodb://127.0.0.1:27017/greenguardian"
  read -r -p "Would you like to set up and use a local mongod for demo? (y/N): " use_local
  if [ "$use_local" = "y" ] || [ "$use_local" = "Y" ]; then
    echo "Attempting to start local mongod via brew service (if installed) or fallback to direct mongod start..."
    if command_exists brew && brew services list | grep -q mong; then
      echo "Stopping any existing mongod service and starting brew-managed mongod"
      brew services restart mongodb-community@6.0 || brew services start mongodb-community@6.0 || true
      export MONGODB_URI="mongodb://127.0.0.1:27017/greenguardian"
      echo "Set MONGODB_URI=$MONGODB_URI"
    else
      echo "Please install MongoDB locally or run a mongod process. I'll set MONGODB_URI to local path anyway."
      export MONGODB_URI="mongodb://127.0.0.1:27017/greenguardian"
    fi
  else
    echo "Proceeding without MongoDB connection. Some features will fail."
  fi
fi

# Build functions
echo "\n-> Building functions (TypeScript)"
cd "$FUNCTIONS_DIR"
npm run build

# Start functions emulator in background
echo "\n-> Starting Firebase Functions emulator (logs -> $EMULATOR_LOG)"
# run in background and capture pid
(npm run serve) > "$EMULATOR_LOG" 2>&1 &
EMU_PID=$!
echo "Functions emulator PID: $EMU_PID"

# Start Next dev server in background
cd "$ROOT_DIR"
echo "\n-> Starting Next dev server (port $NEXT_PORT) -> $NEXT_LOG"
(npm run dev) > "$NEXT_LOG" 2>&1 &
NEXT_PID=$!
echo "Next PID: $NEXT_PID"

# Simple trap to stop background processes on exit
cleanup() {
  echo "\nShutting down child processes..."
  if [ -n "${EMU_PID:-}" ]; then
    kill $EMU_PID 2>/dev/null || true
  fi
  if [ -n "${NEXT_PID:-}" ]; then
    kill $NEXT_PID 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Wait a short while for services
sleep 6

# Seed MongoDB via functions/test-atlas.js (will use MONGODB_URI)
echo "\n-> Seeding / testing MongoDB via $MONGO_TEST_SCRIPT"
if node "$MONGO_TEST_SCRIPT"; then
  echo "MongoDB seed/test OK"
else
  echo "MongoDB seed/test failed — check $EMULATOR_LOG and network settings"
fi

# Optionally create Firebase user
if [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] && [ -n "${FIREBASE_PROJECT_ID:-}" ]; then
  echo "\n-> Creating a test Firebase Auth user (project: $FIREBASE_PROJECT_ID)"
  node "$FIREBASE_USER_SCRIPT" "$FIREBASE_PROJECT_ID" || echo "Firebase user creation failed"
else
  echo "\nSkipping Firebase test user creation (service account or project id not provided)"
fi

# Final summary and tail instruction
echo "\n--- Summary ---"
echo "Next dev server: http://localhost:$NEXT_PORT"
echo "Functions emulator logs: $EMULATOR_LOG"
echo "Next logs: $NEXT_LOG"
echo "To follow functions logs: tail -f $EMULATOR_LOG"
echo "To stop servers: kill $EMU_PID $NEXT_PID"

echo "Full stack should be running now. Press Ctrl-C to stop and clean up."

# Give the trap a chance to run; wait on child processes to keep the script alive
wait $EMU_PID $NEXT_PID
