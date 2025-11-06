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
