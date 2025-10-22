#!/usr/bin/env bash
set -euo pipefail

# demo-runner.sh
# Non-interactive demo runner to:
# - Build functions
# - Start Functions emulator and Next dev server in background
# - Seed DB
# - Inspect DB and gather a short report in demo-report.txt
# Usage:
#   export MONGODB_URI=...   (optional; defaults to local)
#   export GOOGLE_APPLICATION_CREDENTIALS=... (optional)
#   export FIREBASE_PROJECT_ID=... (optional)
#   chmod +x demo-runner.sh
#   ./demo-runner.sh

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
FUNCTIONS_DIR="$ROOT_DIR/functions"
NEXT_PORT=${NEXT_PORT:-9002}
EMULATOR_LOG="$FUNCTIONS_DIR/functions.log"
NEXT_LOG="$ROOT_DIR/next.log"
REPORT="$ROOT_DIR/demo-report.txt"
DB_INSPECT="$ROOT_DIR/demo-db.txt"

# ensure scripts exist
if [ ! -f "$ROOT_DIR/scripts/inspect-mongo.js" ]; then
  echo "inspect-mongo.js missing"
  exit 1
fi

# Set defaults
export MONGODB_URI=${MONGODB_URI:-"mongodb://127.0.0.1:27017/greenguardian"}

# Clean previous logs
rm -f "$EMULATOR_LOG" "$NEXT_LOG" "$REPORT" "$DB_INSPECT"

# Build functions
echo "[demo] Building functions..."
cd "$FUNCTIONS_DIR"
npm run build

# Start functions emulator
echo "[demo] Starting Functions emulator (logs -> $EMULATOR_LOG)"
(npm run serve) > "$EMULATOR_LOG" 2>&1 &
EMU_PID=$!
sleep 2

# Start Next dev
cd "$ROOT_DIR"
echo "[demo] Starting Next dev (logs -> $NEXT_LOG)"
(npm run dev) > "$NEXT_LOG" 2>&1 &
NEXT_PID=$!

# Wait for things to warm up
echo "[demo] Waiting for services to initialize (8s)..."
sleep 8

# Seed DB via functions/test-atlas.js if present
if [ -f "$FUNCTIONS_DIR/test-atlas.js" ]; then
  echo "[demo] Seeding DB..."
  node "$FUNCTIONS_DIR/test-atlas.js" || true
fi

# Inspect DB
echo "[demo] Inspecting DB (output -> $DB_INSPECT)"
node "$ROOT_DIR/scripts/inspect-mongo.js" > "$DB_INSPECT" || true

# Simple health checks
EMULATOR_UP="no"
NEXT_UP="no"

# check emulator port 5001
if nc -z localhost 5001 >/dev/null 2>&1; then
  EMULATOR_UP="yes"
fi
# check next port
if nc -z localhost "$NEXT_PORT" >/dev/null 2>&1; then
  NEXT_UP="yes"
fi

# Build report
{
  echo "GreenGuardian demo report"
  echo "Generated: $(date)"
  echo
  echo "Environment"
  echo " MONGODB_URI=${MONGODB_URI}"
  echo " FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-(not set)}"
  echo
  echo "Services"
  echo " Functions emulator running (port 5001 reachable?): $EMULATOR_UP"
  echo " Next dev running (port $NEXT_PORT reachable?): $NEXT_UP"
  echo
  echo "DB Inspection (first 200 lines)"
  echo "--------------------------------"
  head -n 200 "$DB_INSPECT" || true
  echo
  echo "Functions log last 50 lines"
  echo "--------------------------------"
  tail -n 50 "$EMULATOR_LOG" || true
  echo
  echo "Next log last 20 lines"
  echo "--------------------------------"
  tail -n 20 "$NEXT_LOG" || true
  echo
  echo "Quick tips to demo"
  echo " - Open Next app at http://localhost:$NEXT_PORT"
  echo " - In Atlas UI, open 'greenguardian' DB and show collections to verify seeded data"
  echo " - To stop demo: kill $EMU_PID $NEXT_PID"
} > "$REPORT"

echo "[demo] Report written to $REPORT"

echo "[demo] Services started. Functions PID=$EMU_PID, Next PID=$NEXT_PID"

echo "[demo] To follow logs: tail -f $EMULATOR_LOG $NEXT_LOG"

# keep process alive so demo shows running processes; user can Ctrl-C to stop and we'll attempt cleanup
cleanup() {
  echo "[demo] Cleaning up..."
  kill $EMU_PID 2>/dev/null || true
  kill $NEXT_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# wait
wait $EMU_PID $NEXT_PID
