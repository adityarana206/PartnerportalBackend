# Quick Reference - Business Central Integration

## 🚀 Quick Start (3 Steps)

### 1. Add to `.env`
```env
BC_CLIENT_ID=ad124e90-6ec0-49ba-9e82-8b1ea7b35bd3
BC_CLIENT_SECRET=.ft8Q~7Xd_PdkaS6yplesXTFp9grY2DTcg2SOatA
```

### 2. Seed Database
```bash
node scripts/seedAllData.js
```

### 3. Test API
```bash
POST /api/vendor/item
{
  "itemName": "Coffee",
  "batchNo": "TEST-001",
  "unitPrice": 25.50,
  "partnerNo": "VNR000001"
}
```

## ✅ Integrated Endpoints

| Endpoint | BC Sync | Status |
|----------|---------|--------|
| `POST /api/vendor/item` | ✅ | Ready |
| `POST /api/contact` | ✅ | Ready |
| `POST /api/purchase-orders` | ✅ | Ready |
| `POST /api/sales-orders` | ⏳ | Pending |
| `POST /api/invoices` | ⏳ | Pending |
| `POST /api/purchase-invoices` | ⏳ | Pending |
| `POST /api/purchase-receipts` | ⏳ | Pending |
| `POST /api/partner-location-links` | ⏳ | Pending |

## 📦 Response Format

```json
{
  "success": true,
  "data": { /* Local DB record */ },
  "businessCentral": {
    "synced": true,
    "response": { /* BC response */ },
    "error": null
  }
}
```

## 🔧 Add BC Sync to Any Controller

```javascript
// 1. Import
const bcService = require("../services/businessCentral.service");

// 2. After creating local record
let bcResponse = null, bcError = null;
try {
  bcResponse = await bcService.createYourEntity(req.body);
} catch (err) {
  bcError = err.response?.data || err.message;
}

// 3. Return with BC status
res.json({
  success: true,
  data: localRecord,
  businessCentral: {
    synced: !!bcResponse,
    response: bcResponse,
    error: bcError
  }
});
```

## 🎯 Available BC Methods

```javascript
// Registration
bcService.createVendorRegistration(data)
bcService.createCustomerRegistration(data)

// Entities
bcService.createContactStaging(data)
bcService.createPartnerLocationLink(data)
bcService.createItemRequest(data)
bcService.createOrderStaging(data)
bcService.createDeliveryStaging(data)
bcService.createInvoiceStaging(data)

// Communication
bcService.createMessage(data)
bcService.createNotification(data)

// Changes
bcService.createItemChangeRequest(data)
bcService.createPriceSubmission(data)
bcService.createAnnouncement(data)
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| BC sync fails | Check `.env` credentials |
| Token expired | Service auto-refreshes, check credentials |
| Data format error | Check BC field name format |
| Network error | Verify BC API accessibility |

## 📊 Monitoring

```bash
# Success
✅ Item synced to Business Central

# Failure (non-blocking)
⚠️ Failed to sync to Business Central: [error]
```

## 📁 Key Files

```
services/
  └── businessCentral.service.js    # BC API service

controllers/
  ├── Item.Controller.js            # ✅ Integrated
  ├── ContactController.js          # ✅ Integrated
  └── PurchaseOrder.controller.js   # ✅ Integrated

scripts/
  └── seedAllData.js                # Test data seeder

docs/
  ├── BUSINESS_CENTRAL_INTEGRATION.md  # Full guide
  └── IMPLEMENTATION_SUMMARY.md        # Detailed summary
```

## 🎉 What You Get

- ✅ Data saved to local PostgreSQL
- ✅ Data synced to Business Central
- ✅ Non-blocking (local always succeeds)
- ✅ Full sync status in response
- ✅ Automatic token management
- ✅ Error handling & logging

## 📞 Need Help?

1. Check `BUSINESS_CENTRAL_INTEGRATION.md` for detailed docs
2. Check `IMPLEMENTATION_SUMMARY.md` for implementation guide
3. Review console logs for sync status
4. Test with Postman collection: `Partner Portal.postman_collection.json`
