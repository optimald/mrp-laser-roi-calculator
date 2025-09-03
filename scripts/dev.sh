#!/bin/bash

# MRP Aesthetics Laser ROI Calculator - Development Script
# This script kills any existing processes on port 3006 and starts the dev server

echo "🚀 Starting MRP Aesthetics Laser ROI Calculator Development Server"
echo "================================================================"

# Kill any existing processes on port 3006
echo "🔍 Checking for existing processes on port 3006..."
if lsof -ti:3006 > /dev/null 2>&1; then
    echo "⚠️  Found existing processes on port 3006. Killing them..."
    lsof -ti:3006 | xargs kill -9
    echo "✅ Killed existing processes on port 3006"
else
    echo "✅ Port 3006 is available"
fi

# Wait a moment for processes to fully terminate
sleep 1

# Start the development server on port 3006
echo "🎯 Starting development server on port 3006..."
echo "📱 Application will be available at: http://localhost:3006"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Run the development server with custom port
npm run dev -- --port 3006
