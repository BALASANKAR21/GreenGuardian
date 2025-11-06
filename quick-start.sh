#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  🌱 GreenGuardian Quick Start${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Step 1: Run diagnostics
echo -e "${BLUE}Step 1:${NC} Running diagnostics..."
chmod +x diagnose.sh
./diagnose.sh > /tmp/gg-diag.txt 2>&1

if grep -q "All checks passed" /tmp/gg-diag.txt; then
  echo -e "${GREEN}✓ All systems ready${NC}"
else
  echo -e "${RED}✗ Issues detected. Running full diagnostic:${NC}"
  cat /tmp/gg-diag.txt
  echo ""
  echo -e "${YELLOW}Fix the issues above and run ./quick-start.sh again${NC}"
  exit 1
fi

# Step 2: Ensure environment is configured
echo -e "${BLUE}Step 2:${NC} Checking environment configuration..."
if [ -f "backend/.env" ]; then
  source backend/.env 2>/dev/null
  if [ -z "$MONGODB_URI" ] || [ -z "$OPENWEATHER_API_KEY" ]; then
    echo -e "${YELLOW}⚠ API keys not configured${NC}"
    echo ""
    echo "Please configure backend/.env with your API keys:"
    echo "  1. Open: backend/.env"
    echo "  2. Fill in the required values"
    echo "  3. Run ./quick-start.sh again"
    echo ""
    echo "Get API keys from:"
    echo "  • MongoDB:       https://www.mongodb.com/cloud/atlas/register"
    echo "  • OpenWeather:   https://home.openweathermap.org/api_keys"
    echo "  • AirVisual:     https://www.iqair.com/air-pollution-data-api"
    echo "  • Pl@ntNet:      https://my.plantnet.org/"
    echo "  • IPinfo:        https://ipinfo.io/signup"
    exit 1
  fi
  echo -e "${GREEN}✓ Environment configured${NC}"
else
  echo -e "${RED}✗ backend/.env not found${NC}"
  exit 1
fi

# Step 3: Start services
echo -e "${BLUE}Step 3:${NC} Starting GreenGuardian..."
echo ""

chmod +x run-all.sh
./run-all.sh

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ GreenGuardian is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "Access your app:"
echo -e "  Frontend: ${BLUE}http://localhost:9002${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:4000/api/health${NC}"
echo ""
echo "To stop: ./stop-all.sh"
