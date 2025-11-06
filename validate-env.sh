#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Validating backend/.env configuration...${NC}"
echo ""

if [ ! -f "backend/.env" ]; then
  echo -e "${RED}✗ backend/.env file not found${NC}"
  echo ""
  echo "Run: cp backend/.env.example backend/.env"
  echo "Then edit backend/.env with your API keys"
  exit 1
fi

# Read .env file properly, ignoring comments and empty lines
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  # Remove leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  # Export the variable
  export "$key"="$value"
done < backend/.env

ERRORS=0
WARNINGS=0

# Check required variables
check_var() {
  local var_name=$1
  local var_value="${!var_name}"
  local is_required=$2
  
  if [ -z "$var_value" ]; then
    if [ "$is_required" = "true" ]; then
      echo -e "${RED}✗ $var_name is not set${NC}"
      ((ERRORS++))
    else
      echo -e "${YELLOW}⚠ $var_name is not set (optional)${NC}"
      ((WARNINGS++))
    fi
  elif [[ "$var_value" =~ (your_|YOUR_|here|REPLACE|placeholder) ]]; then
    echo -e "${RED}✗ $var_name contains placeholder text${NC}"
    echo -e "   Current value: ${YELLOW}$var_value${NC}"
    ((ERRORS++))
  else
    echo -e "${GREEN}✓ $var_name is configured${NC}"
  fi
}

echo "Checking required variables:"
check_var "MONGODB_URI" true
check_var "OPENWEATHER_API_KEY" true
check_var "AIRVISUAL_API_KEY" true
check_var "PLANTNET_API_KEY" true
check_var "IPINFO_TOKEN" true

echo ""
echo "Checking optional variables:"
check_var "NASA_API_KEY" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ Configuration valid!${NC}"
  echo ""
  echo "You can now start the app:"
  echo "  ./run-all.sh"
  exit 0
else
  echo -e "${RED}✗ Found $ERRORS error(s)${NC}"
  echo ""
  echo "Please fix the issues above in backend/.env"
  echo ""
  echo "Quick guide:"
  echo "  1. Open: backend/.env"
  echo "  2. Replace placeholder text with real API keys"
  echo "  3. See SETUP_GUIDE.md for step-by-step instructions"
  echo ""
  echo "Get API keys from:"
  echo "  • MongoDB:       https://www.mongodb.com/cloud/atlas/register"
  echo "  • OpenWeather:   https://home.openweathermap.org/users/sign_up"
  echo "  • AirVisual:     https://www.iqair.com/air-pollution-data-api"
  echo "  • Pl@ntNet:      https://my.plantnet.org/"
  echo "  • IPinfo:        https://ipinfo.io/signup"
  exit 1
fi
