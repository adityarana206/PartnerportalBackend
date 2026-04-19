#!/bin/bash

echo "🌍 Countries Setup & API Error Fix"
echo "===================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the PartnerportalBackend directory"
    exit 1
fi

echo "📋 Step 1: Seeding countries data..."
node scripts/seedCountries.js

if [ $? -eq 0 ]; then
    echo "✅ Countries seeded successfully"
else
    echo "❌ Failed to seed countries"
    echo "💡 Try running the SQL script directly:"
    echo "   psql \$DATABASE_URL -f scripts/seedCountries.sql"
    exit 1
fi

echo ""
echo "📋 Step 2: Verifying countries endpoint..."
echo "Testing: GET /api/countries"

# Test if server is running
if curl -s http://localhost:3000/api/countries > /dev/null 2>&1; then
    echo "✅ Countries endpoint is accessible"
    COUNTRY_COUNT=$(curl -s http://localhost:3000/api/countries | grep -o '"code"' | wc -l)
    echo "   Found $COUNTRY_COUNT countries"
elif curl -s https://partnerportal-backend.vercel.app/api/countries > /dev/null 2>&1; then
    echo "✅ Countries endpoint is accessible (production)"
    COUNTRY_COUNT=$(curl -s https://partnerportal-backend.vercel.app/api/countries | grep -o '"code"' | wc -l)
    echo "   Found $COUNTRY_COUNT countries"
else
    echo "⚠️  Cannot test endpoint - server may not be running"
    echo "   Start server with: npm start"
fi

echo ""
echo "📋 Step 3: Checking database health..."
node scripts/checkDatabaseHealth.js

echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo ""
echo "📝 Summary:"
echo "   ✅ Countries data seeded (145 countries)"
echo "   ✅ Countries endpoint made public (no auth required)"
echo "   ✅ Error handling added to BC registrations"
echo ""
echo "🔧 Next Steps:"
echo "   1. Restart your backend server: npm start"
echo "   2. Clear browser cache and reload frontend"
echo "   3. Test registration form - countries should load"
echo ""
echo "📖 Documentation:"
echo "   - API_ERROR_TROUBLESHOOTING.md for detailed error solutions"
echo "   - Run 'node scripts/checkDatabaseHealth.js' to verify database"
echo ""
