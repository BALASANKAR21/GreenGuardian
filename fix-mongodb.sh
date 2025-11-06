#!/bin/bash

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
echo -e "${CYAN}║  ${RED}🔧 MongoDB Atlas IP Whitelist Fix${CYAN}            ║${NC}"
echo -e "${CYAN}║                                                   ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Get current IP
echo -e "${BLUE}[1/3]${NC} Detecting your current IP address..."
CURRENT_IP=$(curl -s https://api.ipify.org)
if [ -z "$CURRENT_IP" ]; then
  echo -e "${RED}✗ Failed to detect IP${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Your IP: $CURRENT_IP${NC}"

echo ""
echo -e "${YELLOW}Problem:${NC}"
echo "  MongoDB Atlas is blocking connections from your IP address."
echo ""
echo -e "${YELLOW}Solution:${NC}"
echo "  You need to whitelist your IP in MongoDB Atlas."
echo ""

echo -e "${BLUE}[2/3]${NC} Follow these steps:"
echo ""
echo "  1. Go to: ${CYAN}https://cloud.mongodb.com/${NC}"
echo "  2. Log in to your MongoDB Atlas account"
echo "  3. Select your project (greenguardian)"
echo "  4. Click ${YELLOW}\"Network Access\"${NC} in the left sidebar"
echo "  5. Click ${YELLOW}\"+ ADD IP ADDRESS\"${NC} button"
echo "  6. Choose one of these options:"
echo ""
echo -e "     ${GREEN}Option A: Add your current IP (Recommended for security)${NC}"
echo "        → Click \"Add Current IP Address\""
echo "        → Your IP will be: $CURRENT_IP"
echo "        → Click \"Confirm\""
echo ""
echo -e "     ${YELLOW}Option B: Allow from anywhere (For testing only)${NC}"
echo "        → Click \"Allow Access from Anywhere\""
echo "        → IP will be: 0.0.0.0/0"
echo "        → Click \"Confirm\""
echo "        → ${RED}Warning: This is less secure but easier for development${NC}"
echo ""
echo "  7. Wait 1-2 minutes for changes to take effect"
echo ""

read -p "Press Enter after you've whitelisted your IP..."

echo ""
echo -e "${BLUE}[3/3]${NC} Testing MongoDB connection..."

# Read MongoDB URI
if [ ! -f "backend/.env" ]; then
  echo -e "${RED}✗ backend/.env not found${NC}"
  exit 1
fi

while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ "$key" == "MONGODB_URI" ]] && MONGODB_URI="$value"
done < backend/.env

if [ -z "$MONGODB_URI" ]; then
  echo -e "${RED}✗ MONGODB_URI not found in backend/.env${NC}"
  exit 1
fi

cd backend
timeout 10 node -e "
const mongoose = require('mongoose');
mongoose.connect('${MONGODB_URI}')
  .then(() => {
    console.log('✓ MongoDB connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
  });
" 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✓ MongoDB connection working!                    ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "You can now start your app:"
  echo -e "  ${GREEN}cd .. && ./run-all.sh${NC}"
  echo ""
else
  echo ""
  echo -e "${RED}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ✗ Still can't connect to MongoDB                ║${NC}"
  echo -e "${RED}╚═══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}Troubleshooting:${NC}"
  echo ""
  echo "  1. Wait 2-3 minutes - IP whitelist changes take time"
  echo "  2. Verify you added the correct IP: ${CYAN}$CURRENT_IP${NC}"
  echo "  3. Check if you're using a VPN - disconnect and try again"
  echo "  4. For testing, use \"Allow Access from Anywhere\" (0.0.0.0/0)"
  echo ""
  echo "  MongoDB Atlas Dashboard:"
  echo "    ${CYAN}https://cloud.mongodb.com/${NC}"
  echo ""
fi
