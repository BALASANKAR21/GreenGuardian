#!/usr/bin/env bash
set -euo pipefail

# all-in-one-run.sh
# Comprehensive single-script runner for GreenGuardian demo.
# It will:
#  - Accept Atlas or local MongoDB URI (or prompt for them)
#  - Test connectivity to Atlas (if provided) and/or local
#  - Build functions and start Functions emulator + Next dev server
#  - Seed local DB (functions/test-atlas.js)
#  - Optionally migrate local DB to Atlas if Atlas is reachable
#  - Optionally create a Firebase test user (service account needed)
#  - Produce demo-report.txt summarizing state
#
# Usage (non-interactive):
#   ./all-in-one-run.sh --atlas-uri "mongodb+srv://user:pass@..." --service-account "/abs/path.json" --project-id "project-id"
# Or interactive: just run ./all-in-one-run.sh and answer prompts

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
FUNCTIONS_DIR="$ROOT_DIR/functions"
SCRIPTS_DIR="$ROOT_DIR/scripts"
REPORT="$ROOT_DIR/demo-report.txt"
DB_INSPECT="$ROOT_DIR/demo-db.txt"
EMULATOR_LOG="$FUNCTIONS_DIR/functions.log"
NEXT_LOG="$ROOT_DIR/next.log"
NEXT_PORT=${NEXT_PORT:-9002}

# Helpers
command_exists(){ command -v "$1" >/dev/null 2>&1; }
err(){ echo "[error] $*" >&2; }
info(){ echo "[info] $*"; }

# parse args
ATLAS_URI=""
LOCAL_URI="mongodb://127.0.0.1:27017"
SERVICE_ACCOUNT=""
PROJECT_ID=""
MIGRATE_TO_ATLAS="no"
NONINTERACTIVE="no"

while [[ $# -gt 0 ]]; do
  case $1 in
    --atlas-uri) ATLAS_URI="$2"; shift 2;;
    --local-uri) LOCAL_URI="$2"; shift 2;;
    --service-account) SERVICE_ACCOUNT="$2"; shift 2;;
    --project-id) PROJECT_ID="$2"; shift 2;;
    --migrate) MIGRATE_TO_ATLAS="yes"; shift;;
    --non-interactive) NONINTERACTIVE="yes"; shift;;
    -h|--help) echo "Usage: $0 [--atlas-uri <uri>] [--local-uri <uri>] [--service-account <path>] [--project-id <id>] [--migrate]"; exit 0;;
    *) err "Unknown arg: $1"; exit 1;;
  esac
done

# Interactive prompts if not provided
if [ -z "$ATLAS_URI" ] && [ "$NONINTERACTIVE" != "yes" ]; then
  read -r -p "(Optional) Paste Atlas MongoDB URI (leave blank to use local only): " ATLAS_URI
fi
if [ -z "$SERVICE_ACCOUNT" ] && [ "$NONINTERACTIVE" != "yes" ]; then
  read -r -p "(Optional) Path to Firebase service account JSON (leave blank to skip Firebase admin tasks): " SERVICE_ACCOUNT
fi
if [ -z "$PROJECT_ID" ] && [ "$SERVICE_ACCOUNT" ] && [ "$NONINTERACTIVE" != "yes" ]; then
  read -r -p "(Optional) Firebase project id (for messages / test user): " PROJECT_ID
fi

# Export envs for other scripts
if [ -n "$ATLAS_URI" ]; then
  export ATLAS_MONGODB_URI="$ATLAS_URI"
fi
export LOCAL_MONGODB_URI="$LOCAL_URI"

if [ -n "$SERVICE_ACCOUNT" ]; then
  if [ ! -f "$SERVICE_ACCOUNT" ]; then
    err "Service account file not found: $SERVICE_ACCOUNT"
    exit 1
  fi
  export GOOGLE_APPLICATION_CREDENTIALS="$SERVICE_ACCOUNT"
  export FIREBASE_PROJECT_ID="$PROJECT_ID"
fi

info "Using local URI: $LOCAL_MONGODB_URI"
if [ -n "$ATLAS_MONGODB_URI" ]; then
  info "Atlas URI provided"
fi

# Check prerequisites
missing=()
for cmd in node npm firebase mongosh nc openssl; do
  if ! command_exists "$cmd"; then
    missing+=("$cmd")
  fi
done
if [ ${#missing[@]} -ne 0 ]; then
  err "Missing required tools: ${missing[*]}. Install them first (node, npm, firebase-tools, mongosh, nc, openssl)."
  # continue anyway; user can still run local mongod
fi

# Test Atlas connectivity (if provided)
ATLAS_OK="no"
if [ -n "${ATLAS_MONGODB_URI:-}" ]; then
  info "Testing Atlas connectivity..."
  export MONGODB_URI="$ATLAS_MONGODB_URI"
  if node "$SCRIPTS_DIR/inspect-mongo.js" > /dev/null 2>&1; then
    info "Connected to Atlas"
    ATLAS_OK="yes"
  else
    err "Failed to connect to Atlas (TLS/network). Will continue using local DB unless you fix network settings."
  fi
fi

# Ensure local DB is running (try mongosh)
LOCAL_OK="no"
export MONGODB_URI="$LOCAL_MONGODB_URI"
if node "$SCRIPTS_DIR/inspect-mongo.js" > /dev/null 2>&1; then
  info "Local MongoDB reachable"
  LOCAL_OK="yes"
else
  info "Local MongoDB not reachable. If you want a local DB, start mongod or use brew services."
fi

# If both exist and migration requested, run migration
if [ "$ATLAS_OK" = "yes" ] && [ "$LOCAL_OK" = "yes" ] && [ "$MIGRATE_TO_ATLAS" = "yes" ]; then
  info "Migrating local greenguardian -> Atlas greenguardian"
  export ATLAS_MONGODB_URI
  export LOCAL_MONGODB_URI
  ./scripts/migrate-to-atlas.sh
fi

# Build functions
info "Building functions..."
cd "$FUNCTIONS_DIR"
npm run build

# Start functions emulator
info "Starting Functions emulator (logs -> $EMULATOR_LOG)"
(npm run serve) > "$EMULATOR_LOG" 2>&1 &
EMU_PID=$!
info "Functions PID: $EMU_PID"

# Start Next dev
cd "$ROOT_DIR"
info "Starting Next dev (logs -> $NEXT_LOG)"
(npm run dev) > "$NEXT_LOG" 2>&1 &
NEXT_PID=$!
info "Next PID: $NEXT_PID"

# Wait a few seconds
sleep 6

# Seed local DB (we'll run with MONGODB_URI set to local)
export MONGODB_URI="$LOCAL_MONGODB_URI"
if [ -f "$FUNCTIONS_DIR/test-atlas.js" ]; then
  info "Seeding DB (local)..."
  node "$FUNCTIONS_DIR/test-atlas.js" || true
fi

# If Atlas reachable and migrate requested earlier, already done; otherwise show instructions
if [ "$ATLAS_OK" = "yes" ] && [ "$MIGRATE_TO_ATLAS" != "yes" ]; then
  info "Atlas is reachable but migration not requested. To migrate local -> Atlas run with --migrate"
fi

# Inspect DB and write report
info "Inspecting DB and creating report..."
export MONGODB_URI=${ATLAS_OK:-"no"}
# Write db inspection to file using local first, then Atlas
node "$SCRIPTS_DIR/inspect-mongo.js" > "$DB_INSPECT" 2>&1 || true

# Health checks
EMULATOR_UP="no"
NEXT_UP="no"
if nc -z localhost 5001 >/dev/null 2>&1; then EMULATOR_UP="yes"; fi
if nc -z localhost "$NEXT_PORT" >/dev/null 2>&1; then NEXT_UP="yes"; fi

{
  echo "GreenGuardian demo report"
  echo "Generated: $(date)"
  echo
  echo "Services"
  echo " Functions emulator PID: ${EMU_PID:-not-set} (5001 reachable: $EMULATOR_UP)"
  echo " Next dev PID: ${NEXT_PID:-not-set} (port $NEXT_PORT reachable: $NEXT_UP)"
  echo
  echo "DB Inspection (first 200 lines of scripts/inspect-mongo.js output)"
  echo "--------------------------------"
  head -n 200 "$DB_INSPECT" || true
  echo
  echo "Functions log (last 50 lines)"
  echo "--------------------------------"
  tail -n 50 "$EMULATOR_LOG" || true
  echo
  echo "Next log (last 20 lines)"
  echo "--------------------------------"
  tail -n 20 "$NEXT_LOG" || true
  echo
  echo "How to view data in Atlas: login to cloud.mongodb.com -> select your project -> Collections -> choose 'greenguardian' DB"
  echo
  echo "Commands used:"
  echo " ./all-in-one-run.sh --atlas-uri '<atlas-uri>' --migrate"
  echo
} > "$REPORT"

info "Report written to $REPORT"

info "Demo started. Functions PID=$EMU_PID Next PID=$NEXT_PID"
info "To stop: kill $EMU_PID $NEXT_PID"

# trap cleanup
cleanup(){
  info "Cleaning up..."
  kill ${EMU_PID:-0} 2>/dev/null || true
  kill ${NEXT_PID:-0} 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait $EMU_PID $NEXT_PID
