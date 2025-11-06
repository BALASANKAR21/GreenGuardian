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
