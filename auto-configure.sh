#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                   ║${NC}"
echo -e "${CYAN}║  ${GREEN}🌱 GreenGuardian Auto-Configuration${CYAN}          ║${NC}"
echo -e "${CYAN}║                                                   ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Helper functions
print_step() {
  echo ""
  echo -e "${BLUE}▸${NC} ${1}"
}

print_success() {
  echo -e "  ${GREEN}✓${NC} ${1}"
}

print_error() {
  echo -e "  ${RED}✗${NC} ${1}"
}

print_info() {
  echo -e "  ${CYAN}ℹ${NC} ${1}"
}

prompt_input() {
  local var_name=$1
  local prompt_text=$2
  local default_value=$3
  local is_secret=$4
  
  echo ""
  echo -e "${YELLOW}${prompt_text}${NC}"
  if [ -n "$default_value" ]; then
    echo -e "${CYAN}(Press Enter to use: ${default_value})${NC}"
  fi
  
  if [ "$is_secret" = "true" ]; then
    read -s input_value
  else
    read input_value
  fi
  
  if [ -z "$input_value" ] && [ -n "$default_value" ]; then
    input_value="$default_value"
  fi
  
  eval "$var_name='$input_value'"
}

# Step 1: Check prerequisites
print_step "Step 1/6: Checking prerequisites..."

if ! command -v node >/dev/null 2>&1; then
  print_error "Node.js not found. Please install from https://nodejs.org"
  exit 1
fi
print_success "Node.js $(node --version) found"

if ! command -v npm >/dev/null 2>&1; then
  print_error "npm not found"
  exit 1
fi
print_success "npm $(npm --version) found"

# Step 2: Install dependencies
print_step "Step 2/6: Installing dependencies..."

print_info "Installing backend dependencies..."
cd "${ROOT_DIR}/backend"
npm install --silent 2>&1 | grep -E "(added|removed|changed|audited)" || true
print_success "Backend dependencies installed"

print_info "Installing frontend dependencies..."
cd "${ROOT_DIR}"
npm install --silent 2>&1 | grep -E "(added|removed|changed|audited)" || true
print_success "Frontend dependencies installed"

# Step 3: Configure Backend Environment
print_step "Step 3/6: Configuring backend environment..."

ENV_FILE="${ROOT_DIR}/backend/.env"

# Check if .env already exists and has values
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE" 2>/dev/null || true
  if [ -n "$MONGODB_URI" ] && [ -n "$OPENWEATHER_API_KEY" ]; then
    echo -e "${YELLOW}Existing configuration found.${NC}"
    echo -e "${YELLOW}Do you want to reconfigure? (y/N):${NC} "
    read reconfigure
    if [[ ! "$reconfigure" =~ ^[Yy]$ ]]; then
      print_success "Using existing configuration"
      SKIP_CONFIG=true
    fi
  fi
fi

if [ "$SKIP_CONFIG" != "true" ]; then
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  ${YELLOW}API Keys Configuration${CYAN}                         ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "You'll need to get API keys from these services:"
  echo ""
  echo -e "  1. ${CYAN}MongoDB Atlas${NC} (Database)"
  echo "     → https://www.mongodb.com/cloud/atlas/register"
  echo "     → Free tier: 512 MB storage"
  echo ""
  echo -e "  2. ${CYAN}OpenWeatherMap${NC} (Weather data)"
  echo "     → https://home.openweathermap.org/users/sign_up"
  echo "     → Free tier: 1,000 calls/day"
  echo ""
  echo -e "  3. ${CYAN}IQAir AirVisual${NC} (Air quality)"
  echo "     → https://www.iqair.com/air-pollution-data-api"
  echo "     → Free tier: 10,000 calls/month"
  echo ""
  echo -e "  4. ${CYAN}Pl@ntNet${NC} (Plant identification)"
  echo "     → https://my.plantnet.org/"
  echo "     → Free tier: 500 identifications/day"
  echo ""
  echo -e "  5. ${CYAN}IPinfo${NC} (Geolocation)"
  echo "     → https://ipinfo.io/signup"
  echo "     → Free tier: 50,000 requests/month"
  echo ""
  echo -e "${YELLOW}Choose configuration mode:${NC}"
  echo "  1) Interactive - I'll enter each API key now"
  echo "  2) Quick - Use demo/test mode (limited functionality)"
  echo "  3) Manual - I'll configure backend/.env myself later"
  echo ""
  read -p "Enter choice (1-3): " config_choice
  
  case $config_choice in
    1)
      # Interactive mode
      echo ""
      echo -e "${GREEN}Interactive Configuration Mode${NC}"
      echo ""
      
      # MongoDB URI
      echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${YELLOW}MongoDB Configuration${NC}"
      echo ""
      echo "To get MongoDB URI:"
      echo "  1. Go to: https://www.mongodb.com/cloud/atlas/register"
      echo "  2. Create free account & cluster"
      echo "  3. Click 'Connect' → 'Connect your application'"
      echo "  4. Copy the connection string"
      echo ""
      echo "Format: mongodb+srv://username:password@cluster.mongodb.net/database"
      prompt_input MONGODB_URI "Enter MongoDB URI:" "" false
      
      # OpenWeather
      echo ""
      echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${YELLOW}OpenWeatherMap Configuration${NC}"
      echo ""
      echo "To get API key:"
      echo "  1. Go to: https://home.openweathermap.org/users/sign_up"
      echo "  2. Sign up (free)"
      echo "  3. Go to API keys tab"
      echo "  4. Copy the API key"
      prompt_input OPENWEATHER_API_KEY "Enter OpenWeatherMap API key:" "" false
      
      # AirVisual
      echo ""
      echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${YELLOW}AirVisual Configuration${NC}"
      echo ""
      echo "To get API key:"
      echo "  1. Go to: https://www.iqair.com/air-pollution-data-api"
      echo "  2. Request API access"
      echo "  3. Wait for approval email (usually instant)"
      echo "  4. Copy the API key"
      prompt_input AIRVISUAL_API_KEY "Enter AirVisual API key:" "" false
      
      # PlantNet
      echo ""
      echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${YELLOW}Pl@ntNet Configuration${NC}"
      echo ""
      echo "To get API key:"
      echo "  1. Go to: https://my.plantnet.org/"
      echo "  2. Create account"
      echo "  3. Go to 'API' section"
      echo "  4. Generate API key"
      prompt_input PLANTNET_API_KEY "Enter Pl@ntNet API key:" "" false
      
      # IPinfo
      echo ""
      echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${YELLOW}IPinfo Configuration${NC}"
      echo ""
      echo "To get token:"
      echo "  1. Go to: https://ipinfo.io/signup"
      echo "  2. Sign up (free)"
      echo "  3. Copy your access token"
      prompt_input IPINFO_TOKEN "Enter IPinfo token:" "" false
      
      # NASA (optional)
      echo ""
      echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
      echo -e "${YELLOW}NASA API (Optional)${NC}"
      echo ""
      echo "To get API key (optional for soil moisture data):"
      echo "  1. Go to: https://api.nasa.gov/"
      echo "  2. Sign up"
      echo "  3. Copy API key"
      echo ""
      read -p "Enter NASA API key (or press Enter to skip): " NASA_API_KEY
      
      ;;
      
    2)
      # Demo mode
      echo ""
      echo -e "${YELLOW}Quick Demo Mode${NC}"
      echo ""
      print_info "This will set up the app with placeholder values."
      print_info "You'll need to configure real API keys later for full functionality."
      echo ""
      
      MONGODB_URI="mongodb+srv://demo:demo@cluster.mongodb.net/greenguardian?retryWrites=true&w=majority"
      OPENWEATHER_API_KEY="DEMO_KEY_REPLACE_ME"
      AIRVISUAL_API_KEY="DEMO_KEY_REPLACE_ME"
      PLANTNET_API_KEY="DEMO_KEY_REPLACE_ME"
      IPINFO_TOKEN="DEMO_KEY_REPLACE_ME"
      NASA_API_KEY=""
      
      print_info "Demo configuration set. You can edit backend/.env later."
      ;;
      
    3)
      # Manual mode
      echo ""
      echo -e "${GREEN}Manual Configuration Mode${NC}"
      echo ""
      print_info "Creating template .env file..."
      print_info "Please edit backend/.env manually before running the app."
      
      cat > "$ENV_FILE" << 'EOF'
# Server Configuration
PORT=4000
FRONTEND_ORIGIN=http://localhost:9002,http://localhost:3000

# Database (REQUIRED)
MONGODB_URI=

# Weather API (REQUIRED)
OPENWEATHER_API_KEY=

# Air Quality API (REQUIRED)
AIRVISUAL_API_KEY=

# Plant Identification API (REQUIRED)
PLANTNET_API_KEY=

# IP Geolocation API (REQUIRED)
IPINFO_TOKEN=

# NASA Soil Moisture API (OPTIONAL)
NASA_API_KEY=
EOF
      
      print_success "Template created at backend/.env"
      echo ""
      echo "Please configure the API keys and run this script again."
      exit 0
      ;;
      
    *)
      print_error "Invalid choice"
      exit 1
      ;;
  esac
  
  # Write .env file
  cat > "$ENV_FILE" << EOF
# Server Configuration
PORT=4000
FRONTEND_ORIGIN=http://localhost:9002,http://localhost:3000

# Database
MONGODB_URI=${MONGODB_URI}

# External APIs
OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
AIRVISUAL_API_KEY=${AIRVISUAL_API_KEY}
PLANTNET_API_KEY=${PLANTNET_API_KEY}
IPINFO_TOKEN=${IPINFO_TOKEN}
NASA_API_KEY=${NASA_API_KEY}
EOF
  
  print_success "Backend .env configured"
fi

# Step 4: Configure Frontend
print_step "Step 4/6: Configuring frontend environment..."

cat > "${ROOT_DIR}/.env.local" << EOF
NEXT_PUBLIC_API_BASE=http://localhost:4000
EOF

print_success "Frontend .env.local configured"

# Step 5: Test MongoDB connection (if configured)
print_step "Step 5/6: Testing MongoDB connection..."

source "${ROOT_DIR}/backend/.env" 2>/dev/null || true

if [ -n "$MONGODB_URI" ] && [[ ! "$MONGODB_URI" =~ ^DEMO ]]; then
  print_info "Testing MongoDB connection..."
  cd "${ROOT_DIR}/backend"
  timeout 10 node -e "
  const mongoose = require('mongoose');
  mongoose.connect('${MONGODB_URI}')
    .then(() => {
      console.log('✓ MongoDB connected successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('✗ MongoDB connection failed:', err.message);
      process.exit(1);
    });
  " 2>&1 && print_success "MongoDB connection successful" || {
    print_error "MongoDB connection failed"
    echo ""
    echo "Common issues:"
    echo "  • Check if MongoDB URI is correct"
    echo "  • Ensure IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for testing)"
    echo "  • Verify database user has correct permissions"
    echo ""
    read -p "Continue anyway? (y/N): " continue_choice
    if [[ ! "$continue_choice" =~ ^[Yy]$ ]]; then
      exit 1
    fi
  }
else
  print_info "Skipping MongoDB test (demo mode or not configured)"
fi

# Step 6: Build backend
print_step "Step 6/6: Building backend..."

cd "${ROOT_DIR}/backend"
npm run build >/dev/null 2>&1 && print_success "Backend built successfully" || {
  print_error "Backend build failed"
  exit 1
}

# Create convenience scripts
cd "${ROOT_DIR}"

chmod +x setup.sh diagnose.sh quick-start.sh run-all.sh 2>/dev/null || true

# Create stop-all.sh if missing
if [ ! -f "stop-all.sh" ]; then
  cat > stop-all.sh << 'EOF'
#!/bin/bash
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Stopping GreenGuardian services..."
[ -f "${ROOT_DIR}/.backend.pid" ] && kill $(cat "${ROOT_DIR}/.backend.pid") 2>/dev/null && echo "✓ Backend stopped"
[ -f "${ROOT_DIR}/.frontend.pid" ] && kill $(cat "${ROOT_DIR}/.frontend.pid") 2>/dev/null && echo "✓ Frontend stopped"
rm -f "${ROOT_DIR}/.backend.pid" "${ROOT_DIR}/.frontend.pid"
echo "All services stopped"
EOF
  chmod +x stop-all.sh
fi

# Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║           ✓ Configuration Complete! 🎉           ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Quick Start Commands:${NC}"
echo ""
echo -e "  ${GREEN}./run-all.sh${NC}      Start backend + frontend"
echo -e "  ${GREEN}./stop-all.sh${NC}     Stop all services"
echo -e "  ${GREEN}./diagnose.sh${NC}     Run diagnostics"
echo ""
echo -e "${CYAN}Access URLs (after starting):${NC}"
echo ""
echo -e "  Frontend:   ${BLUE}http://localhost:9002${NC}"
echo -e "  Backend:    ${BLUE}http://localhost:4000/api/health${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "  1. Review your configuration in backend/.env"
echo "  2. Run: ${GREEN}./run-all.sh${NC}"
echo "  3. Open: ${BLUE}http://localhost:9002${NC}"
echo ""
echo -e "${YELLOW}Need help?${NC}"
echo "  • Check logs: tail -f backend.log frontend.log"
echo "  • Run diagnostics: ./diagnose.sh"
echo "  • Reconfigure: ./auto-configure.sh"
echo ""
