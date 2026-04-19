#!/bin/bash

echo "🚀 Setting up Partial Shipment Workflow"
echo "========================================"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the PartnerportalBackend directory"
    exit 1
fi

echo "📋 Step 1: Running database migration..."
node scripts/addShippedQtyColumn.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Restart your backend server"
    echo "   2. Test the partial shipment workflow"
    echo ""
    echo "📖 Documentation:"
    echo "   - See PO_PARTIAL_SHIPMENT_WORKFLOW.md for detailed workflow"
    echo "   - See PO_STATUS_WORKFLOW.md for status definitions"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
