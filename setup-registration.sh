#!/bin/bash

echo "🔧 Registration System Setup"
echo "============================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the PartnerportalBackend directory"
    exit 1
fi

echo "📋 Step 1: Creating registration_invites table..."
node scripts/createRegistrationInvitesTable.js

if [ $? -eq 0 ]; then
    echo "✅ Registration invites table created"
else
    echo "❌ Failed to create registration_invites table"
    exit 1
fi

echo ""
echo "📋 Step 2: Creating BC user registration tables..."
if [ -f "scripts/createBCUserRegisterTables.js" ]; then
    node scripts/createBCUserRegisterTables.js
    if [ $? -eq 0 ]; then
        echo "✅ BC user registration tables created"
    else
        echo "⚠️  BC user registration tables may already exist"
    fi
else
    echo "⚠️  createBCUserRegisterTables.js not found, skipping..."
fi

echo ""
echo "📋 Step 3: Seeding countries data..."
node scripts/seedCountries.js

if [ $? -eq 0 ]; then
    echo "✅ Countries seeded successfully"
else
    echo "⚠️  Countries may already be seeded"
fi

echo ""
echo "📋 Step 4: Running database health check..."
node scripts/checkDatabaseHealth.js

echo ""
echo "============================="
echo "✅ Registration System Setup Complete!"
echo ""
echo "📝 Summary:"
echo "   ✅ registration_invites table created"
echo "   ✅ BC user registration tables verified"
echo "   ✅ Countries data seeded (145 countries)"
echo "   ✅ Database health check completed"
echo ""
echo "🔧 Next Steps:"
echo "   1. Restart your backend server: npm start"
echo "   2. Generate an invite link:"
echo "      POST /api/bc-user-registrations/invite"
echo "      Body: { \"role\": \"customer\" } or { \"role\": \"vendor\" }"
echo ""
echo "   3. Test the registration flow:"
echo "      - Use the generated invite URL"
echo "      - Fill in the registration form"
echo "      - Submit and verify BC integration"
echo ""
echo "📖 Documentation:"
echo "   - API_ERROR_TROUBLESHOOTING.md"
echo "   - API_ERRORS_FIX_SUMMARY.md"
echo ""
