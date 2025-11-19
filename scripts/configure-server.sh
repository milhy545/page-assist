#!/bin/bash

# Interactive Server Selection Script
# Asks user to select backend server before starting dashboard

echo "🔧 Page Assist - Server Configuration"
echo "======================================"
echo ""
echo "This will configure your backend server connection."
echo ""
echo "Available options:"
echo ""
echo "  1) 🏠 Local Development"
echo "     → http://localhost:8080"
echo "     Use this when developing with a local backend"
echo ""
echo "  2) 🌐 Production Server"
echo "     → https://api.pageassist.app"
echo "     Use this to connect to the production API"
echo ""
echo "  3) 🔧 Custom Server"
echo "     → Enter your own URL"
echo "     Use this for staging or custom deployments"
echo ""
echo "  4) 💾 Standalone Mode"
echo "     → No backend connection"
echo "     All data stored locally in browser"
echo ""

read -p "Select option [1-4]: " choice

case $choice in
    1)
        SERVER_URL="http://localhost:8080"
        echo ""
        echo "✅ Selected: Local Development"
        echo "📡 Server: $SERVER_URL"
        ;;
    2)
        SERVER_URL="https://api.pageassist.app"
        echo ""
        echo "✅ Selected: Production Server"
        echo "📡 Server: $SERVER_URL"
        ;;
    3)
        echo ""
        read -p "Enter server URL (e.g., http://localhost:3001): " SERVER_URL
        echo ""
        echo "✅ Selected: Custom Server"
        echo "📡 Server: $SERVER_URL"
        ;;
    4)
        SERVER_URL=""
        echo ""
        echo "✅ Selected: Standalone Mode"
        echo "💾 All data will be stored locally"
        ;;
    *)
        echo ""
        echo "❌ Invalid selection. Defaulting to Standalone Mode."
        SERVER_URL=""
        ;;
esac

# Save to .env file
echo ""
echo "💾 Saving configuration to .env file..."

if [ -f "apps/dashboard/.env" ]; then
    # Update existing .env
    if grep -q "^VITE_API_URL=" apps/dashboard/.env; then
        sed -i "s|^VITE_API_URL=.*|VITE_API_URL=$SERVER_URL|" apps/dashboard/.env
    else
        echo "VITE_API_URL=$SERVER_URL" >> apps/dashboard/.env
    fi
else
    # Create new .env
    echo "VITE_API_URL=$SERVER_URL" > apps/dashboard/.env
fi

echo "✅ Configuration saved!"
echo ""
echo "You can change this later by:"
echo "  1) Running this script again"
echo "  2) Editing apps/dashboard/.env manually"
echo ""
echo "🚀 To start the dashboard, run:"
echo "   ./scripts/quick-start.sh"
echo ""
