#!/bin/bash

# Delivery Orders API Test Script
# Run this to verify all endpoints are working

BASE_URL="http://localhost:5000/api"
TOKEN="YOUR_AUTH_TOKEN_HERE"

echo "🧪 Testing Delivery Orders API..."
echo "=================================="
echo ""

# Test 1: Get all delivery orders
echo "📋 Test 1: GET /delivery-orders"
curl -s -X GET "$BASE_URL/delivery-orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Create delivery order
echo "📝 Test 2: POST /delivery-orders (Create)"
RESPONSE=$(curl -s -X POST "$BASE_URL/delivery-orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partnerNo": "VEN000001",
    "partnerName": "Test Vendor",
    "erpPoNos": ["PO-TEST-001", "PO-TEST-002"],
    "shipmentDate": "2025-01-20",
    "expectedDeliveryDate": "2025-01-25",
    "actualDeliveryDate": null,
    "locationCode": "WH01",
    "carrierName": "DHL Express",
    "transportMode": "Road",
    "status": "Draft",
    "remarks": "Test delivery order - handle with care",
    "lines": [
      {
        "lineNo": 10000,
        "poId": 1,
        "poLineId": 1,
        "itemNo": "ITEM001",
        "description": "Test Product 1",
        "orderQty": 100,
        "toBeShipped": 50,
        "remaining": 50,
        "unitOfMeasure": "PCS",
        "lotNo": "LOT-001",
        "serialNo": null
      },
      {
        "lineNo": 20000,
        "poId": 1,
        "poLineId": 2,
        "itemNo": "ITEM002",
        "description": "Test Product 2",
        "orderQty": 200,
        "toBeShipped": 150,
        "remaining": 50,
        "unitOfMeasure": "KG",
        "lotNo": "LOT-002",
        "serialNo": null
      }
    ]
  }')

echo "$RESPONSE" | jq '.'
DO_ID=$(echo "$RESPONSE" | jq -r '.data.id')
echo ""
echo "Created DO ID: $DO_ID"
echo "---"
echo ""

# Test 3: Get single delivery order
if [ "$DO_ID" != "null" ] && [ -n "$DO_ID" ]; then
  echo "🔍 Test 3: GET /delivery-orders/$DO_ID"
  curl -s -X GET "$BASE_URL/delivery-orders/$DO_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
  echo "---"
  echo ""

  # Test 4: Update status
  echo "🔄 Test 4: PATCH /delivery-orders/$DO_ID/status"
  curl -s -X PATCH "$BASE_URL/delivery-orders/$DO_ID/status" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status": "Submitted"}' | jq '.'
  echo ""
  echo "---"
  echo ""

  # Test 5: Update full delivery order
  echo "✏️  Test 5: PUT /delivery-orders/$DO_ID"
  curl -s -X PUT "$BASE_URL/delivery-orders/$DO_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "partnerNo": "VEN000001",
      "partnerName": "Test Vendor Updated",
      "erpPoNos": ["PO-TEST-001"],
      "shipmentDate": "2025-01-20",
      "expectedDeliveryDate": "2025-01-26",
      "actualDeliveryDate": "2025-01-24",
      "locationCode": "WH02",
      "carrierName": "FedEx",
      "transportMode": "Air",
      "status": "In Transit",
      "remarks": "Updated remarks",
      "lines": [
        {
          "lineNo": 10000,
          "poId": 1,
          "poLineId": 1,
          "itemNo": "ITEM001",
          "description": "Test Product 1 Updated",
          "orderQty": 100,
          "toBeShipped": 75,
          "remaining": 25,
          "unitOfMeasure": "PCS",
          "lotNo": "LOT-001",
          "serialNo": null
        }
      ]
    }' | jq '.'
  echo ""
  echo "---"
  echo ""
fi

# Test 6: Get by partner
echo "👤 Test 6: GET /delivery-orders/partner/VEN000001"
curl -s -X GET "$BASE_URL/delivery-orders/partner/VEN000001" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "---"
echo ""

# Test 7: Filter by status
echo "🏷️  Test 7: GET /delivery-orders?status=Draft"
curl -s -X GET "$BASE_URL/delivery-orders?status=Draft" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "---"
echo ""

echo "✅ All tests completed!"
echo ""
echo "Note: Replace YOUR_AUTH_TOKEN_HERE with actual token"
echo "To get token, login first:"
echo "curl -X POST $BASE_URL/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"vendor@example.com\",\"password\":\"password\"}'"
