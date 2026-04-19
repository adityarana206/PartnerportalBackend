#!/bin/bash

echo "🚨 FIXING 500 ERROR - Registration System"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

echo "📋 Step 1: Creating registration_invites table..."
psql "$DATABASE_URL" -f scripts/createRegistrationInvitesTable.sql

if [ $? -eq 0 ]; then
    echo "✅ registration_invites table created"
else
    echo "❌ Failed to create table"
    echo ""
    echo "Try manually:"
    echo "  psql \$DATABASE_URL -f scripts/createRegistrationInvitesTable.sql"
    exit 1
fi

echo ""
echo "📋 Step 2: Verifying table..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM registration_invites;"

if [ $? -eq 0 ]; then
    echo "✅ Table verified successfully"
else
    echo "❌ Table verification failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ FIX COMPLETED!"
echo ""
echo "🔧 Next Steps:"
echo "   1. If using Vercel, redeploy your backend"
echo "   2. Clear browser cache"
echo "   3. Try accessing the registration page again"
echo ""
echo "📝 The 500 error should now be resolved!"
echo ""
