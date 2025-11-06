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
