#!/bin/bash

# Page Assist - Quick Start Script with Server Selection
# This script sets up and runs the unified dashboard

set -e

echo "🚀 Page Assist - Quick Start"
echo "============================"
echo ""

# Function to ask for server URL
ask_for_server() {
    echo "📡 Server Configuration"
    echo "======================="
    echo ""
    echo "Select backend server option:"
    echo "  1) Local development (http://localhost:8080)"
    echo "  2) Production server"
    echo "  3) Custom URL"
    echo "  4) No backend (standalone mode)"
    echo ""

    read -p "Choose option [1-4]: " server_option

    case $server_option in
        1)
            export VITE_API_URL="http://localhost:8080"
            echo "✅ Using local development server: http://localhost:8080"
            ;;
        2)
            export VITE_API_URL="https://api.pageassist.app"
            echo "✅ Using production server: https://api.pageassist.app"
            ;;
        3)
            read -p "Enter custom server URL: " custom_url
            export VITE_API_URL="$custom_url"
            echo "✅ Using custom server: $custom_url"
            ;;
        4)
            export VITE_API_URL=""
            echo "✅ Running in standalone mode (no backend)"
            ;;
        *)
            echo "❌ Invalid option. Using standalone mode."
            export VITE_API_URL=""
            ;;
    esac

    echo ""
}

# Ask for server configuration
ask_for_server

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm is already installed"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📥 Installing dependencies..."
    pnpm install
else
    echo "✅ Dependencies already installed"
fi

# Check if packages are built
if [ ! -d "packages/event-bus/dist" ]; then
    echo ""
    echo "🔨 Building packages..."
    pnpm build
else
    echo "✅ Packages already built"
fi

echo ""
echo "✨ Starting Unified Dashboard..."
echo "================================"
echo ""
if [ -n "$VITE_API_URL" ]; then
    echo "📍 Backend server: $VITE_API_URL"
else
    echo "📍 Running in standalone mode (no backend)"
fi
echo "📍 Dashboard will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start dashboard with environment variable
cd apps/dashboard
VITE_API_URL="$VITE_API_URL" pnpm dev
