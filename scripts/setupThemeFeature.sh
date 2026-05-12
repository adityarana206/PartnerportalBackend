dev#!/bin/bash

# Theme & Logo Feature - Quick Setup Script
# This script helps set up the theme and logo management feature

echo "🎨 Theme & Logo Management - Setup Script"
echo "=========================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the PartnerportalBackend directory"
    exit 1
fi

echo "📋 Step 1: Creating system_settings table..."
node scripts/createSystemSettingsTable.js

if [ $? -eq 0 ]; then
    echo "✅ Database table created successfully"
else
    echo "❌ Failed to create database table"
    exit 1
fi

echo ""
echo "📋 Step 2: Verifying Cloudinary configuration..."

if grep -q "CLOUDINARY_CLOUD_NAME" .env && \
   grep -q "CLOUDINARY_API_KEY" .env && \
   grep -q "CLOUDINARY_API_SECRET" .env; then
    echo "✅ Cloudinary environment variables found"
else
    echo "⚠️  Warning: Cloudinary environment variables not found in .env"
    echo "   Please add the following to your .env file:"
    echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name"
    echo "   CLOUDINARY_API_KEY=your_api_key"
    echo "   CLOUDINARY_API_SECRET=your_api_secret"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Ensure backend server is running: npm start"
echo "2. Ensure frontend is running: cd ../partner-portal-frontend && npm run dev"
echo "3. Login as super admin"
echo "4. Navigate to System Settings"
echo "5. Update theme colors and upload logo"
echo ""
echo "📖 For detailed documentation, see:"
echo "   docs/THEME_LOGO_IMPLEMENTATION.md"
echo ""
