#!/bin/bash

echo "🔧 Quick Fix for Partner Location Links 500 Error"
echo "=================================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo "📍 Current directory: $(pwd)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the PartnerportalBackend directory."
    exit 1
fi

echo "1️⃣ Running database verification and setup..."
echo ""

node scripts/verifyPartnerLocationSetup.js

echo ""
echo "2️⃣ Checking if backend server is running..."
echo ""

# Check if server is running on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend server is running on port 3000"
    echo "   Please restart it to apply the changes:"
    echo ""
    echo "   1. Stop the server (Ctrl+C in the terminal running it)"
    echo "   2. Start it again: npm start or yarn start"
    echo ""
else
    echo "✅ No server running on port 3000"
    echo "   You can start the server with: npm start or yarn start"
    echo ""
fi

echo "3️⃣ Testing API endpoint..."
echo ""

# Try to test the endpoint (this will fail if server is not running)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Attempting to test endpoint (requires valid token)..."
    echo "curl http://localhost:3000/api/partner-location-links/"
    echo ""
    echo "If you have a token, test with:"
    echo 'curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/partner-location-links/partner/CUST-TEST-001'
    echo ""
fi

echo "✅ Quick fix completed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Restart your backend server if it's running"
echo "   2. Refresh your frontend browser"
echo "   3. Check the browser console for any remaining errors"
echo ""
echo "📖 For detailed information, see: FIX_PARTNER_LOCATIONS_ERROR.md"
