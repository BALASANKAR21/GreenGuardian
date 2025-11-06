#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
  echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
  echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
  echo -e "${RED}✗${NC} ${1}"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} ${1}"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}"

print_step "GreenGuardian Setup Script"
echo "Root: ${ROOT_DIR}"

# Check prerequisites
print_step "Checking prerequisites..."

if ! command_exists node; then
  print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi
print_success "Node.js $(node --version) found"

if ! command_exists npm; then
  print_error "npm is not installed"
  exit 1
fi
print_success "npm $(npm --version) found"

# Backend setup
print_step "Setting up backend..."

cd "${BACKEND_DIR}"

if [ ! -f "package.json" ]; then
  print_error "Backend package.json not found at ${BACKEND_DIR}"
  exit 1
fi

print_step "Installing backend dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
  print_warning ".env file not found. Creating from .env.example..."
  
  if [ -f ".env.example" ]; then
    cp .env.example .env
    print_success "Created .env file"
    
    print_warning "⚠️  IMPORTANT: You must configure the following in backend/.env:"
    echo "   - MONGODB_URI (get from MongoDB Atlas)"
    echo "   - OPENWEATHER_API_KEY (from https://openweathermap.org/api)"
    echo "   - AIRVISUAL_API_KEY (from https://www.iqair.com/air-pollution-data-api)"
    echo "   - PLANTNET_API_KEY (from https://my.plantnet.org/)"
    echo "   - IPINFO_TOKEN (from https://ipinfo.io/)"
    echo ""
    read -p "Press Enter after you've configured .env, or Ctrl+C to exit and configure later..."
  else
    print_error ".env.example not found. Creating minimal .env..."
    cat > .env << 'EOF'
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
MONGODB_URI=
OPENWEATHER_API_KEY=
AIRVISUAL_API_KEY=
PLANTNET_API_KEY=
IPINFO_TOKEN=
NASA_API_KEY=
EOF
    print_warning "Created .env with placeholders. Please fill in the required API keys before running."
    exit 1
  fi
else
  print_success ".env file found"
fi

# Verify critical env vars
print_step "Verifying environment variables..."
source .env 2>/dev/null || true

MISSING_VARS=()
if [ -z "$MONGODB_URI" ]; then
  MISSING_VARS+=("MONGODB_URI")
fi
if [ -z "$OPENWEATHER_API_KEY" ]; then
  MISSING_VARS+=("OPENWEATHER_API_KEY")
fi
if [ -z "$AIRVISUAL_API_KEY" ]; then
  MISSING_VARS+=("AIRVISUAL_API_KEY")
fi
if [ -z "$PLANTNET_API_KEY" ]; then
  MISSING_VARS+=("PLANTNET_API_KEY")
fi
if [ -z "$IPINFO_TOKEN" ]; then
  MISSING_VARS+=("IPINFO_TOKEN")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  print_warning "Missing required environment variables in backend/.env:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  print_warning "Setup will continue, but you must configure these before running the app."
  echo ""
  echo "Quick links to get API keys:"
  echo "  MongoDB Atlas:    https://www.mongodb.com/cloud/atlas/register"
  echo "  OpenWeatherMap:   https://home.openweathermap.org/api_keys"
  echo "  AirVisual:        https://www.iqair.com/air-pollution-data-api"
  echo "  Pl@ntNet:         https://my.plantnet.org/"
  echo "  IPinfo:           https://ipinfo.io/signup"
  echo ""
  read -p "Press Enter to continue setup or Ctrl+C to exit..."
else
  print_success "All required environment variables configured"
fi

# Test MongoDB connection only if URI is set
if [ -n "$MONGODB_URI" ]; then
  print_step "Testing MongoDB connection..."
  timeout 5 node -e "
  const mongoose = require('mongoose');
  mongoose.connect('${MONGODB_URI}')
    .then(() => {
      console.log('MongoDB connection successful');
      process.exit(0);
    })
    .catch(err => {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    });
  " 2>&1 | grep -q "connection successful" && print_success "MongoDB connected" || {
    print_warning "MongoDB connection failed. Check your MONGODB_URI before running the app."
  }
else
  print_warning "Skipping MongoDB connection test (MONGODB_URI not set)"
fi

# Build backend
print_step "Building backend..."
npm run build 2>&1 | grep -E "(error|ERROR)" && {
  print_error "Backend build failed. Check the output above."
  exit 1
} || print_success "Backend built successfully"

# Frontend setup (if exists)
if [ -f "${FRONTEND_DIR}/package.json" ] && [ "${FRONTEND_DIR}" != "${BACKEND_DIR}" ]; then
  print_step "Setting up frontend..."
  cd "${FRONTEND_DIR}"
  
  print_step "Installing frontend dependencies..."
  npm install
  
  # Create .env.local for frontend
  if [ ! -f ".env.local" ]; then
    print_warning "Creating .env.local for frontend..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_BASE=http://localhost:4000
EOF
    print_success "Created .env.local"
  else
    print_success ".env.local found"
  fi
fi

# Create run script
print_step "Creating run scripts..."

cat > "${ROOT_DIR}/run-backend.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/backend"
echo "Starting GreenGuardian Backend..."
npm run dev
EOF
chmod +x "${ROOT_DIR}/run-backend.sh"
print_success "Created run-backend.sh"

if [ -f "${FRONTEND_DIR}/package.json" ] && [ "${FRONTEND_DIR}" != "${BACKEND_DIR}" ]; then
  cat > "${ROOT_DIR}/run-frontend.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting GreenGuardian Frontend..."
npm run dev
EOF
  chmod +x "${ROOT_DIR}/run-frontend.sh"
  print_success "Created run-frontend.sh"
fi

# Create combined run script
cat > "${ROOT_DIR}/run-all.sh" << 'EOF'
#!/bin/bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting GreenGuardian..."
echo ""

# Start backend in background
echo "Starting backend on port 4000..."
cd "${ROOT_DIR}/backend"
npm run dev > "${ROOT_DIR}/backend.log" 2>&1 &
BACKEND_PID=$!

sleep 3

# Check if backend started
if ps -p $BACKEND_PID > /dev/null; then
  echo "✓ Backend started (PID: $BACKEND_PID)"
  echo "  Logs: ${ROOT_DIR}/backend.log"
  echo "  API: http://localhost:4000/api/health"
else
  echo "✗ Backend failed to start. Check backend.log"
  exit 1
fi

# Start frontend if it exists
if [ -f "${ROOT_DIR}/package.json" ]; then
  echo ""
  echo "Starting frontend on port 3000..."
  cd "${ROOT_DIR}"
  npm run dev > "${ROOT_DIR}/frontend.log" 2>&1 &
  FRONTEND_PID=$!
  
  sleep 3
  
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "✓ Frontend started (PID: $FRONTEND_PID)"
    echo "  Logs: ${ROOT_DIR}/frontend.log"
    echo "  App: http://localhost:3000"
  else
    echo "✗ Frontend failed to start. Check frontend.log"
  fi
fi

echo ""
echo "GreenGuardian is running!"
echo ""
echo "To stop all services, run:"
echo "  kill $BACKEND_PID"
[ ! -z "$FRONTEND_PID" ] && echo "  kill $FRONTEND_PID"
echo ""
echo "Or use: ./stop-all.sh"

# Save PIDs to file for stop script
echo $BACKEND_PID > "${ROOT_DIR}/.backend.pid"
[ ! -z "$FRONTEND_PID" ] && echo $FRONTEND_PID > "${ROOT_DIR}/.frontend.pid"
EOF
chmod +x "${ROOT_DIR}/run-all.sh"
print_success "Created run-all.sh"

# Create stop script
cat > "${ROOT_DIR}/stop-all.sh" << 'EOF'
#!/bin/bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping GreenGuardian services..."

if [ -f "${ROOT_DIR}/.backend.pid" ]; then
  BACKEND_PID=$(cat "${ROOT_DIR}/.backend.pid")
  if ps -p $BACKEND_PID > /dev/null; then
    kill $BACKEND_PID
    echo "✓ Backend stopped"
  fi
  rm "${ROOT_DIR}/.backend.pid"
fi

if [ -f "${ROOT_DIR}/.frontend.pid" ]; then
  FRONTEND_PID=$(cat "${ROOT_DIR}/.frontend.pid")
  if ps -p $FRONTEND_PID > /dev/null; then
    kill $FRONTEND_PID
    echo "✓ Frontend stopped"
  fi
  rm "${ROOT_DIR}/.frontend.pid"
fi

echo "All services stopped"
EOF
chmod +x "${ROOT_DIR}/stop-all.sh"
print_success "Created stop-all.sh"

# Create database viewer script
cat > "${ROOT_DIR}/view-db.sh" << 'EOF'
#!/bin/bash

cd "$(dirname "$0")/backend"
source .env

if [ -z "$MONGODB_URI" ]; then
  echo "Error: MONGODB_URI not set in .env"
  exit 1
fi

echo "Connecting to MongoDB..."
echo "URI: ${MONGODB_URI}"
echo ""
echo "Use these commands in mongosh:"
echo "  show dbs"
echo "  use <your-database-name>"
echo "  show collections"
echo "  db.plants.find().limit(5)"
echo ""

if command -v mongosh >/dev/null 2>&1; then
  mongosh "${MONGODB_URI}"
else
  echo "mongosh not found. Install it from: https://www.mongodb.com/try/download/shell"
  echo ""
  echo "Or use MongoDB Compass (GUI): https://www.mongodb.com/try/download/compass"
  echo "Connection string: ${MONGODB_URI}"
fi
EOF
chmod +x "${ROOT_DIR}/view-db.sh"
print_success "Created view-db.sh"

# Summary
print_step "Setup complete! 🎉"
echo ""
echo "Quick start:"
echo "  ${GREEN}./run-all.sh${NC}        - Start both backend and frontend"
echo "  ${GREEN}./run-backend.sh${NC}    - Start backend only"
echo "  ${GREEN}./stop-all.sh${NC}       - Stop all services"
echo "  ${GREEN}./view-db.sh${NC}        - View MongoDB database"
echo ""
echo "Manual start:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: npm run dev"
echo ""
echo "Endpoints:"
echo "  Health:    ${BLUE}http://localhost:4000/api/health${NC}"
echo "  Location:  ${BLUE}http://localhost:4000/api/location/detect${NC}"
echo "  Plants:    ${BLUE}http://localhost:4000/api/plants${NC}"
echo "  Frontend:  ${BLUE}http://localhost:3000${NC}"
echo ""
print_warning "Next steps:"
echo "  1. Ensure all API keys are configured in backend/.env"
echo "  2. Run ${GREEN}./run-all.sh${NC} to start services"
echo "  3. Visit http://localhost:3000 in your browser"
echo ""
