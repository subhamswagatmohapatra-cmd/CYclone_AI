#!/usr/bin/env bash
echo "========================================================"
echo "  Starting CycloneAI Disaster Management Platform"
echo "========================================================"
if ! command -v node &> /dev/null; then
    echo ""
    echo "[ERROR] Node.js is not installed on this machine!"
    echo "Please download and install Node.js from https://nodejs.org/ (v18 or higher LTS)."
    echo ""
    exit 1
fi

echo "Installing project dependencies..."
npm install

echo "Starting server on http://localhost:3000 ..."
npm run dev
