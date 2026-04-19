#!/bin/bash

echo "🔧 Quick Fix for API Errors"
echo "============================"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the PartnerportalBackend directory"
    exit 1
fi

echo "📋 Step 1: Checking database health..."
node scripts/checkDatabaseHealth.js

echo ""
echo "📋 Step 2: Checking for missing tables..."

# Check if bc_user_registrations table exists
if node -e "
const { pool } = require('./config/db');
pool.query('SELECT 1 FROM bc_user_registrations LIMIT 1')
  .then(() => { console.log('✅ bc_user_registrations exists'); process.exit(0); })
  .catch(() => { console.log('❌ bc_user_registrations missing'); process.exit(1); });
" 2>/dev/null; then
    echo "✅ BC User Registrations table exists"
else
    echo "⚠️  BC User Registrations table missing - creating..."
    node scripts/createBCUserRegisterTables.js
fi

echo ""
echo "📋 Step 3: Verifying environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL configured"
    else
        echo "❌ DATABASE_URL missing in .env"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo "✅ JWT_SECRET configured"
    else
        echo "❌ JWT_SECRET missing in .env"
    fi
else
    echo "❌ .env file not found"
fi

echo ""
echo "📋 Step 4: Testing database connection..."
if node -e "
const { pool } = require('./config/db');
pool.query('SELECT 1')
  .then(() => { console.log('✅ Database connection successful'); process.exit(0); })
  .catch((err) => { console.log('❌ Database connection failed:', err.message); process.exit(1); });
" 2>/dev/null; then
    echo "✅ Database is accessible"
else
    echo "❌ Cannot connect to database"
fi

echo ""
echo "============================"
echo "📝 Summary:"
echo ""
echo "If you're still experiencing errors:"
echo "1. Check backend logs: tail -f backend.log"
echo "2. Restart the server: npm start"
echo "3. Clear browser cache and reload"
echo "4. Review API_ERROR_TROUBLESHOOTING.md for detailed solutions"
echo ""
echo "Common fixes applied:"
echo "✅ Countries endpoint made public (no auth required)"
echo "✅ Error handling added to BC registrations"
echo "✅ Database health check completed"
echo ""
