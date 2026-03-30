# Partner Portal - Business Central Integration Summary

## ✅ What Has Been Implemented

### 1. Business Central API Service
**File**: `services/businessCentral.service.js`

A comprehensive service that handles all Business Central API interactions:
- OAuth2 authentication with automatic token refresh
- Token caching to minimize API calls
- Generic API call method for all endpoints
- Pre-configured methods for all Business Central entities

### 2. Dual-Write Controllers
Updated controllers to write data to both local DB and Business Central:

#### ✅ Item Controller
- **File**: `controllers/Item.Controller.js`
- **Endpoint**: `POST /api/vendor/item`
- **BC Endpoint**: `itemRequests`

#### ✅ Contact Controller
- **File**: `controllers/ContactController.js`
- **Endpoint**: `POST /api/contact`
- **BC Endpoint**: `contactStagings`

#### ✅ Purchase Order Controller
- **File**: `controllers/PurchaseOrder.controller.js`
- **Endpoint**: `POST /api/purchase-orders`
- **BC Endpoint**: `orderStagings`

### 3. Data Seeding Script
**File**: `scripts/seedAllData.js`

Seeds your database with realistic test data:
- 25 items
- 30 contacts
- 20 purchase orders with lines
- 20 sales orders with lines
- 25 invoices with lines
- 20 purchase invoices with lines
- 20 purchase receipts with lines
- 25 partner location links

**Run**: `node scripts/seedAllData.js`

### 4. Documentation
**File**: `BUSINESS_CENTRAL_INTEGRATION.md`

Complete guide covering:
- How the integration works
- Configuration steps
- API response format
- Example requests
- Troubleshooting guide
- How to add more integrations

## 🎯 How It Works

### Data Flow

```
Client Request
     ↓
Your API Endpoint
     ↓
┌─────────────────────┐
│ 1. Save to Local DB │ ← Always succeeds
└─────────────────────┘
     ↓
┌─────────────────────┐
│ 2. Sync to BC API   │ ← Non-blocking
└─────────────────────┘
     ↓
Response with both results
```

### Example Response

```json
{
  "success": true,
  "message": "Item request created successfully",
  "data": {
    "id": 1,
    "batch_no": "BATCH-00001",
    "item_name": "Coffee",
    "created_at": "2024-03-30T10:00:00Z"
  },
  "businessCentral": {
    "synced": true,
    "response": {
      "@odata.context": "...",
      "systemId": "abc-123",
      "batchNo": "BATCH-00001"
    },
    "error": null
  }
}
```

## 📋 Available BC Service Methods

All ready to use in your controllers:

```javascript
const bcService = require("../services/businessCentral.service");

// Registration
await bcService.createVendorRegistration(data);
await bcService.createCustomerRegistration(data);

// Core Entities
await bcService.createContactStaging(data);
await bcService.createPartnerLocationLink(data);
await bcService.createItemRequest(data);

// Orders & Deliveries
await bcService.createOrderStaging(data);
await bcService.createDeliveryStaging(data);
await bcService.createInvoiceStaging(data);

// Communication
await bcService.createMessage(data);
await bcService.createNotification(data);

// Changes & Submissions
await bcService.createItemChangeRequest(data);
await bcService.createPriceSubmission(data);
await bcService.createAnnouncement(data);
```

## 🚀 Quick Start

### 1. Configure Environment Variables

Add to `.env`:
```env
BC_CLIENT_ID=ad124e90-6ec0-49ba-9e82-8b1ea7b35bd3
BC_CLIENT_SECRET=.ft8Q~7Xd_PdkaS6yplesXTFp9grY2DTcg2SOatA
```

### 2. Seed Test Data

```bash
node scripts/seedAllData.js
```

### 3. Test the Integration

```bash
# Create an item (saves locally + syncs to BC)
POST http://localhost:3000/api/vendor/item
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "batchNo": "TEST-001",
  "itemName": "Test Coffee",
  "itemCategoryCode": "COFFEE",
  "baseUnitOfMeasure": "KG",
  "unitPrice": 25.50,
  "priceCurrencyCode": "USD",
  "partnerNo": "VNR000001"
}
```

### 4. Check the Response

You'll see:
- ✅ Local database record created
- ✅ Business Central sync status
- ✅ BC response data (if successful)
- ⚠️ Error details (if BC sync failed)

## 🔧 Next Steps to Complete Integration

### Controllers to Update

Apply the same pattern to these controllers:

1. **Sales Order Controller**
   ```javascript
   bcResponse = await bcService.createOrderStaging({
     ...req.body,
     orderType: "Sales_x0020_Order"
   });
   ```

2. **Purchase Receipt Controller**
   ```javascript
   bcResponse = await bcService.createDeliveryStaging(req.body);
   ```

3. **Invoice Controller**
   ```javascript
   bcResponse = await bcService.createInvoiceStaging(req.body);
   ```

4. **Purchase Invoice Controller**
   ```javascript
   bcResponse = await bcService.createInvoiceStaging(req.body);
   ```

5. **Partner Location Link Controller**
   ```javascript
   bcResponse = await bcService.createPartnerLocationLink(req.body);
   ```

### Pattern to Follow

```javascript
// 1. Import service
const bcService = require("../services/businessCentral.service");

// 2. In your create method, after saving to local DB:
let bcResponse = null;
let bcError = null;
try {
  bcResponse = await bcService.createYourEntity(req.body);
  console.log("✅ Synced to Business Central:", bcResponse);
} catch (bcErr) {
  bcError = bcErr.response?.data || bcErr.message;
  console.error("⚠️ Failed to sync to BC:", bcError);
}

// 3. Include BC status in response:
res.status(201).json({
  success: true,
  message: "Record created successfully",
  data: localRecord,
  businessCentral: {
    synced: !!bcResponse,
    response: bcResponse,
    error: bcError,
  },
});
```

## 📊 Monitoring

### Console Logs

Watch for these messages:
- ✅ `Item synced to Business Central`
- ✅ `Contact synced to Business Central`
- ✅ `Purchase Order synced to Business Central`
- ⚠️ `Failed to sync to Business Central: [error]`

### Error Handling

The integration is designed to be **non-blocking**:
- Local DB operations always complete
- BC sync failures are logged but don't stop the request
- Clients receive full details about sync status

## 🎉 Benefits

1. **Dual Persistence**: Data saved in both systems
2. **Resilient**: Local operations succeed even if BC is down
3. **Transparent**: Clients know exactly what happened
4. **Automatic**: No manual sync needed
5. **Scalable**: Easy to add more entities

## 📝 Testing Checklist

- [ ] Seed database with test data
- [ ] Test item creation with BC sync
- [ ] Test contact creation with BC sync
- [ ] Test purchase order creation with BC sync
- [ ] Verify BC sync status in responses
- [ ] Test with invalid BC credentials (should still save locally)
- [ ] Check console logs for sync messages
- [ ] Verify data appears in Business Central

## 🆘 Troubleshooting

### BC Sync Always Fails

1. Check `.env` has correct credentials
2. Verify network access to Business Central
3. Check Azure AD app permissions
4. Review console error messages

### Token Errors

1. Credentials might be expired
2. App might not have proper permissions
3. Tenant ID might be incorrect

### Data Format Errors

1. Check field names match BC expectations
2. Ensure dates are in correct format
3. Verify required fields are present

## 📚 Resources

- [Business Central API Docs](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/)
- [OAuth2 Client Credentials Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
- Your Postman Collection: `Partner Portal.postman_collection.json`

---

**Status**: ✅ Ready for testing and deployment
**Last Updated**: March 30, 2024
