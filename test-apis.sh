#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${GREEN}🌱 GreenGuardian API Test Suite${CYAN}               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

API_BASE="http://localhost:4000"
PASSED=0
FAILED=0

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected_code=$4
  
  echo -ne "${BLUE}Testing:${NC} $name ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE$endpoint" 2>/dev/null)
  else
    response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_BASE$endpoint" 2>/dev/null)
  fi
  
  if [ "$response" = "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $response)"
    ((FAILED++))
  fi
}

test_json_response() {
  local name=$1
  local endpoint=$2
  local json_key=$3
  
  echo -ne "${BLUE}Testing:${NC} $name ... "
  
  response=$(curl -s "$API_BASE$endpoint" 2>/dev/null)
  
  if echo "$response" | grep -q "\"$json_key\""; then
    echo -e "${GREEN}✓ PASS${NC} (Found '$json_key')"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Missing '$json_key')"
    ((FAILED++))
  fi
}

# Check if backend is running
echo -e "${YELLOW}[1/3] Checking Backend Status${NC}"
echo ""

if ! curl -s "$API_BASE/api/health" > /dev/null 2>&1; then
  echo -e "${RED}✗ Backend is not running on $API_BASE${NC}"
  echo ""
  echo "Please start the backend first:"
  echo "  cd backend && npm run dev"
  echo ""
  echo "Or use: ./run-all.sh"
  exit 1
fi

echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Test Core Endpoints
echo -e "${YELLOW}[2/3] Testing Core Endpoints${NC}"
echo ""

test_endpoint "Health Check" "GET" "/api/health" "200"
test_json_response "Health Status" "/api/health" "status"

test_endpoint "Location Detection" "GET" "/api/location/detect" "200"
test_json_response "Location Data" "/api/location/detect" "city"

test_endpoint "Environment Data (valid)" "GET" "/api/environment?lat=12.97&lon=77.59" "200"
test_endpoint "Environment Data (invalid lat)" "GET" "/api/environment?lat=999&lon=77.59" "400"
test_endpoint "Environment Data (missing params)" "GET" "/api/environment" "400"

test_endpoint "Plants Search" "GET" "/api/plants" "200"
test_endpoint "Plants Search (with query)" "GET" "/api/plants?query=aloe" "200"
test_endpoint "Plants Search (with space)" "GET" "/api/plants?space=indoor" "200"
test_endpoint "Plants Search (invalid space)" "GET" "/api/plants?space=invalid" "400"

test_endpoint "Recommendations" "GET" "/api/recommendations?lat=12.97&lon=77.59&space=indoor" "200"
test_endpoint "Recommendations (invalid lat)" "GET" "/api/recommendations?lat=999&lon=77.59" "400"

test_endpoint "404 Handling" "GET" "/api/nonexistent" "404"

echo ""

# Test External API Integrations
echo -e "${YELLOW}[3/3] Testing External API Integrations${NC}"
echo ""

# Load env to check API keys
if [ -f "backend/.env" ]; then
  source backend/.env 2>/dev/null
fi

check_api_key() {
  local name=$1
  local var=$2
  
  echo -ne "${BLUE}Checking:${NC} $name ... "
  
  if [ -n "${!var}" ] && [[ ! "${!var}" =~ ^DEMO ]]; then
    echo -e "${GREEN}✓ Configured${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠ Not configured${NC}"
    return 1
  fi
}

check_api_key "MongoDB" "MONGODB_URI"
MONGO_OK=$?

check_api_key "OpenWeatherMap" "OPENWEATHER_API_KEY"
WEATHER_OK=$?

check_api_key "AirVisual" "AIRVISUAL_API_KEY"
AIR_OK=$?

check_api_key "Pl@ntNet" "PLANTNET_API_KEY"
PLANT_OK=$?

check_api_key "IPinfo" "IPINFO_TOKEN"
IP_OK=$?

echo ""

# Test actual API responses
if [ $WEATHER_OK -eq 0 ] && [ $AIR_OK -eq 0 ]; then
  echo -e "${BLUE}Testing:${NC} Environment API with real data ... "
  
  response=$(curl -s "$API_BASE/api/environment?lat=12.97&lon=77.59" 2>/dev/null)
  
  if echo "$response" | grep -q "\"weather\"" && echo "$response" | grep -q "\"air\""; then
    echo -e "${GREEN}✓ PASS${NC} (Weather & Air Quality data received)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (API response invalid)"
    ((FAILED++))
  fi
fi

# Summary
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Test Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Passed:  ${GREEN}$PASSED${NC}"
echo -e "  Failed:  ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "Your GreenGuardian backend is working correctly."
  echo ""
  echo "Next steps:"
  echo "  1. Open http://localhost:9002 in your browser"
  echo "  2. Test the frontend features"
  echo "  3. Upload a plant image to test identification"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  echo ""
  echo "Common issues:"
  echo "  • Check backend/.env has valid API keys"
  echo "  • Ensure MongoDB is accessible"
  echo "  • Verify API key quotas haven't been exceeded"
  echo ""
  echo "View detailed logs:"
  echo "  tail -f backend.log"
  exit 1
fi
