#!/usr/bin/env bash
set -euo pipefail

# Usage:
# export LOCAL_MONGODB_URI="mongodb://127.0.0.1:27017"
# export ATLAS_MONGODB_URI="mongodb+srv://user:pass@..."
# ./scripts/migrate-to-atlas.sh

if [ -z "${ATLAS_MONGODB_URI:-}" ]; then
  echo "Please set ATLAS_MONGODB_URI before running this script. Example:"
  echo " export ATLAS_MONGODB_URI=\"mongodb+srv://user:pass@cluster...\""
  exit 1
fi

export LOCAL_MONGODB_URI=${LOCAL_MONGODB_URI:-"mongodb://127.0.0.1:27017"}

node scripts/migrate-to-atlas.js
