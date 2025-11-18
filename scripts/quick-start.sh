#!/bin/bash

# Page Assist - Quick Start Script
# This script sets up and runs the unified dashboard

set -e

echo "🚀 Page Assist - Quick Start"
echo "============================"
echo ""

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
echo "📍 Dashboard will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start dashboard
cd apps/dashboard
pnpm dev
