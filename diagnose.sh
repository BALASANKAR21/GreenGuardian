#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}GreenGuardian Diagnostic Tool${NC}"
echo "======================================"
echo ""

# Check Node.js
echo -e "${BLUE}[1/8]${NC} Node.js version:"
if command -v node >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} $(node --version)"
else
  echo -e "  ${RED}✗${NC} Not installed"
fi

# Check npm
echo -e "${BLUE}[2/8]${NC} npm version:"
if command -v npm >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} $(npm --version)"
else
  echo -e "  ${RED}✗${NC} Not installed"
fi

# Check backend dependencies
echo -e "${BLUE}[3/8]${NC} Backend dependencies:"
if [ -d "backend/node_modules" ]; then
  echo -e "  ${GREEN}✓${NC} Installed"
else
  echo -e "  ${RED}✗${NC} Not installed (run: cd backend && npm install)"
fi

# Check frontend dependencies
echo -e "${BLUE}[4/8]${NC} Frontend dependencies:"
if [ -d "node_modules" ]; then
  echo -e "  ${GREEN}✓${NC} Installed"
else
  echo -e "  ${RED}✗${NC} Not installed (run: npm install)"
fi

# Check backend .env
echo -e "${BLUE}[5/8]${NC} Backend .env configuration:"
if [ -f "backend/.env" ]; then
  echo -e "  ${GREEN}✓${NC} File exists"
  source backend/.env 2>/dev/null
  
  [ -n "$MONGODB_URI" ] && echo -e "    ${GREEN}✓${NC} MONGODB_URI" || echo -e "    ${RED}✗${NC} MONGODB_URI"
  [ -n "$OPENWEATHER_API_KEY" ] && echo -e "    ${GREEN}✓${NC} OPENWEATHER_API_KEY" || echo -e "    ${RED}✗${NC} OPENWEATHER_API_KEY"
  [ -n "$AIRVISUAL_API_KEY" ] && echo -e "    ${GREEN}✓${NC} AIRVISUAL_API_KEY" || echo -e "    ${RED}✗${NC} AIRVISUAL_API_KEY"
  [ -n "$PLANTNET_API_KEY" ] && echo -e "    ${GREEN}✓${NC} PLANTNET_API_KEY" || echo -e "    ${RED}✗${NC} PLANTNET_API_KEY"
  [ -n "$IPINFO_TOKEN" ] && echo -e "    ${GREEN}✓${NC} IPINFO_TOKEN" || echo -e "    ${RED}✗${NC} IPINFO_TOKEN"
else
  echo -e "  ${RED}✗${NC} File not found (run: cp backend/.env.example backend/.env)"
fi

# Check frontend .env.local
echo -e "${BLUE}[6/8]${NC} Frontend .env.local configuration:"
if [ -f ".env.local" ]; then
  echo -e "  ${GREEN}✓${NC} File exists"
  source .env.local 2>/dev/null
  [ -n "$NEXT_PUBLIC_API_BASE" ] && echo -e "    ${GREEN}✓${NC} NEXT_PUBLIC_API_BASE: $NEXT_PUBLIC_API_BASE" || echo -e "    ${RED}✗${NC} NEXT_PUBLIC_API_BASE"
else
  echo -e "  ${RED}✗${NC} File not found (run: echo 'NEXT_PUBLIC_API_BASE=http://localhost:4000' > .env.local)"
fi

# Check ports
echo -e "${BLUE}[7/8]${NC} Port availability:"
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "  ${YELLOW}⚠${NC} Port 4000 (backend) is in use"
else
  echo -e "  ${GREEN}✓${NC} Port 4000 (backend) is available"
fi

if lsof -Pi :9002 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "  ${YELLOW}⚠${NC} Port 9002 (frontend) is in use"
else
  echo -e "  ${GREEN}✓${NC} Port 9002 (frontend) is available"
fi

# Check MongoDB connection
echo -e "${BLUE}[8/8]${NC} MongoDB connection:"
if [ -f "backend/.env" ]; then
  source backend/.env 2>/dev/null
  if [ -n "$MONGODB_URI" ]; then
    timeout 5 node -e "
    const mongoose = require('mongoose');
    mongoose.connect('${MONGODB_URI}')
      .then(() => {
        console.log('  ✓ Connected');
        process.exit(0);
      })
      .catch(err => {
        console.log('  ✗ Failed:', err.message);
        process.exit(1);
      });
    " 2>&1
  else
    echo -e "  ${RED}✗${NC} MONGODB_URI not configured"
  fi
else
  echo -e "  ${RED}✗${NC} backend/.env not found"
fi

echo ""
echo "======================================"
echo -e "${BLUE}Recommendations:${NC}"
echo ""

# Provide specific recommendations
ISSUES=0

if ! command -v node >/dev/null 2>&1; then
  echo -e "${YELLOW}•${NC} Install Node.js 18+ from https://nodejs.org"
  ISSUES=1
fi

if [ ! -d "backend/node_modules" ]; then
  echo -e "${YELLOW}•${NC} Run: cd backend && npm install"
  ISSUES=1
fi

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}•${NC} Run: npm install"
  ISSUES=1
fi

if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}•${NC} Run: cp backend/.env.example backend/.env"
  ISSUES=1
fi

if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}•${NC} Run: echo 'NEXT_PUBLIC_API_BASE=http://localhost:4000' > .env.local"
  ISSUES=1
fi

if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Run ./run-all.sh to start the app.${NC}"
else
  echo -e "${RED}Fix the issues above, then run ./diagnose.sh again.${NC}"
fi
