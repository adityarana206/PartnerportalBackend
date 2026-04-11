#!/bin/bash

# API Testing Script
BASE_URL="http://localhost:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjQsIm5hbWUiOiJTdXBlciBBZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJyZWZObyI6bnVsbCwiaWF0IjoxNzc1ODkzNzE0LCJleHAiOjE3NzU5ODAxMTR9.4kdSRlJq86c_QjiK2YCNbzHPDgFe-k42PM0IYhV2fJI"

echo "========================================="
echo "API TESTING REPORT"
echo "========================================="
echo ""

# Test function
test_api() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL$endpoint" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        success=$(echo "$body" | grep -o '"success":[^,}]*' | head -1 | cut -d':' -f2)
        count=$(echo "$body" | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
        
        if [ "$success" = "true" ]; then
            if [ -n "$count" ]; then
                echo "✅ PASS (HTTP $http_code, $count records)"
            else
                echo "✅ PASS (HTTP $http_code)"
            fi
        else
            echo "⚠️  WARN (HTTP $http_code, success=false)"
        fi
    elif [ "$http_code" = "401" ]; then
        echo "🔒 AUTH REQUIRED (HTTP $http_code)"
    elif [ "$http_code" = "404" ]; then
        echo "❌ NOT FOUND (HTTP $http_code)"
    else
        echo "❌ FAIL (HTTP $http_code)"
    fi
}

echo "1. AUTHENTICATION APIs"
echo "-----------------------------------"
test_api "Health Check" "/"
test_api "Verify Token" "/api/auth/verify-token"

echo ""
echo "2. USER APIs"
echo "-----------------------------------"
test_api "Get All Users" "/api/users"
test_api "Get Current User" "/api/users/me"

echo ""
echo "3. ITEM APIs"
echo "-----------------------------------"
test_api "Get All Items (vendor)" "/api/vendor/item"
test_api "Get All Items (new)" "/api/items"
test_api "Get Unit of Measures" "/api/vendor/item/unit-of-measures"

echo ""
echo "4. CONTACT APIs"
echo "-----------------------------------"
test_api "Get All Contacts" "/api/contact"

echo ""
echo "5. PURCHASE ORDER APIs"
echo "-----------------------------------"
test_api "Get All Purchase Orders" "/api/purchase-orders"
test_api "Get Locations" "/api/purchase-orders/locations"

echo ""
echo "6. SALES ORDER APIs"
echo "-----------------------------------"
test_api "Get All Sales Orders" "/api/sales-orders"

echo ""
echo "7. INVOICE APIs"
echo "-----------------------------------"
test_api "Get All Invoices" "/api/invoices"
test_api "Get All Purchase Invoices" "/api/purchase-invoices"

echo ""
echo "8. PURCHASE RECEIPT APIs"
echo "-----------------------------------"
test_api "Get All Purchase Receipts" "/api/purchase-receipts"

echo ""
echo "9. PARTNER LOCATION APIs"
echo "-----------------------------------"
test_api "Get All Partner Locations" "/api/partner-location-links"

echo ""
echo "10. SALES SHIPMENT APIs"
echo "-----------------------------------"
test_api "Get All Sales Shipments" "/api/sales-shipments"

echo ""
echo "11. PAYMENT APIs"
echo "-----------------------------------"
test_api "Get All Payments" "/api/payments"

echo ""
echo "12. PURCHASE PRICE APIs"
echo "-----------------------------------"
test_api "Get All Purchase Prices" "/api/purchase-prices"

echo ""
echo "13. ITEM CATEGORY APIs"
echo "-----------------------------------"
test_api "Get Item Categories" "/api/item-categories"

echo ""
echo "14. UNIT OF MEASURE APIs"
echo "-----------------------------------"
test_api "Get All UOM" "/api/unit-of-measures"

echo ""
echo "15. VAT MASTER APIs"
echo "-----------------------------------"
test_api "Get All VAT" "/api/vat-master"

echo ""
echo "16. NO SERIES APIs"
echo "-----------------------------------"
test_api "Get All No Series" "/api/no-series/getall"

echo ""
echo "17. PERMISSION APIs"
echo "-----------------------------------"
test_api "Get All Screens" "/api/permissions/screens"
test_api "Get My Permissions" "/api/permissions/me"

echo ""
echo "18. PERMISSION GROUP APIs"
echo "-----------------------------------"
test_api "Get All Groups" "/api/permission-groups/groups"

echo ""
echo "19. BC USER REGISTRATION APIs"
echo "-----------------------------------"
test_api "Get All BC Registrations" "/api/bc-user-registrations"

echo ""
echo "========================================="
echo "API TESTING COMPLETE"
echo "========================================="
