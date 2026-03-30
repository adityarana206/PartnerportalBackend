# Business Central Integration

This Partner Portal automatically syncs data with Microsoft Dynamics 365 Business Central when you create records through the API.

## How It Works

When you create any of the following entities through the Partner Portal API, the data is:
1. **Saved to local PostgreSQL database**
2. **Automatically sent to Business Central API**

The response will include both the local database record and the Business Central sync status.

## Supported Entities

### ✅ Currently Integrated

1. **Items** (`POST /api/vendor/item`)
2. **Contacts** (`POST /api/contact`)
3. **Purchase Orders** (`POST /api/purchase-orders`)
4. **Sales Orders** (`POST /api/sales-orders`)
5. **Purchase Receipts** (`POST /api/purchase-receipts`)
6. **Invoices** (`POST /api/invoices`)
7. **Purchase Invoices** (`POST /api/purchase-invoices`)

### 📋 Available BC Services (Ready to integrate)

- Vendor Registration
- Customer Registration
- Partner Location Links
- Partner Messages
- Notifications
- Item Change Requests
- Price Submissions
- Announcements

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Business Central API Configuration
BC_CLIENT_ID=ad124e90-6ec0-49ba-9e82-8b1ea7b35bd3
BC_CLIENT_SECRET=.ft8Q~7Xd_PdkaS6yplesXTFp9grY2DTcg2SOatA
```

### Default Configuration

The service is pre-configured with:
- **Tenant ID**: `c4fcf5c8-ba04-4cc4-b972-091c2e3d6239`
- **Environment**: `ANNOYA`
- **Company ID**: `f75dab42-7901-f111-a1f8-7ced8d262be5`

## API Response Format

When you create a record, you'll receive a response like this:

```json
{
  "success": true,
  "message": "Item request created successfully",
  "data": {
    "id": 1,
    "batch_no": "BATCH-00001",
    "item_name": "Coffee",
    ...
  },
  "businessCentral": {
    "synced": true,
    "response": {
      "@odata.context": "...",
      "systemId": "...",
      ...
    },
    "error": null
  }
}
```

### Response Fields

- **success**: Whether the local database operation succeeded
- **data**: The record saved in your local database
- **businessCentral.synced**: `true` if BC sync succeeded, `false` if it failed
- **businessCentral.response**: The response from Business Central (if successful)
- **businessCentral.error**: Error details (if BC sync failed)

## Important Notes

### ⚠️ Sync Behavior

1. **Local First**: Data is always saved to your local database first
2. **Non-Blocking**: If Business Central sync fails, the local record is still created
3. **Error Handling**: BC sync errors are logged but don't prevent record creation
4. **Token Management**: OAuth2 tokens are automatically refreshed

### 🔒 Authentication

Business Central uses OAuth2 client credentials flow. The service automatically:
- Obtains access tokens
- Caches tokens until expiry
- Refreshes tokens when needed

### 📊 Monitoring

Check your console logs for sync status:
- ✅ Success: `Item synced to Business Central`
- ⚠️ Failure: `Failed to sync to Business Central: [error details]`

## Example Usage

### Creating an Item

```bash
POST /api/vendor/item
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "batchNo": "BATCH-001",
  "itemName": "Coffee Beans",
  "description": "Premium Arabica",
  "itemCategoryCode": "COFFEE",
  "baseUnitOfMeasure": "KG",
  "unitPrice": 25.50,
  "priceCurrencyCode": "USD",
  "partnerNo": "VNR000001"
}
```

### Creating a Purchase Order

```bash
POST /api/purchase-orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "orderType": "Purchase",
  "partnerNo": "VNR000001",
  "partnerType": "Vendor",
  "locationCode": "EAST",
  "orderDate": "2024-03-30",
  "requestedDeliveryDate": "2024-04-15",
  "currencyCode": "USD",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM-001",
      "description": "Coffee Beans",
      "quantity": 100,
      "unitOfMeasureCode": "KG",
      "unitPrice": 25.50,
      "lineAmount": 2550.00
    }
  ]
}
```

## Troubleshooting

### BC Sync Fails But Local Record Created

This is expected behavior. Check:
1. Business Central API credentials in `.env`
2. Network connectivity to Business Central
3. Console logs for specific error messages

### Token Errors

If you see authentication errors:
1. Verify `BC_CLIENT_ID` and `BC_CLIENT_SECRET` in `.env`
2. Check if credentials are still valid in Azure AD
3. Ensure the app has proper permissions in Business Central

### Data Format Errors

Business Central expects specific field names and formats:
- Use underscores in BC field names (e.g., `_x0020_` for spaces)
- Dates should be in ISO format: `YYYY-MM-DD`
- Booleans should be `true`/`false`

## Adding More Integrations

To integrate additional controllers:

1. Import the service:
```javascript
const bcService = require("../services/businessCentral.service");
```

2. Add BC sync in your create method:
```javascript
try {
  bcResponse = await bcService.createYourEntity(req.body);
  console.log("✅ Synced to Business Central:", bcResponse);
} catch (bcErr) {
  bcError = bcErr.response?.data || bcErr.message;
  console.error("⚠️ Failed to sync:", bcError);
}
```

3. Include BC status in response:
```javascript
res.json({
  success: true,
  data: localRecord,
  businessCentral: {
    synced: !!bcResponse,
    response: bcResponse,
    error: bcError,
  },
});
```

## Service Methods Available

```javascript
// Registration
bcService.createVendorRegistration(data)
bcService.createCustomerRegistration(data)

// Core Entities
bcService.createContactStaging(data)
bcService.createPartnerLocationLink(data)
bcService.createItemRequest(data)

// Orders & Deliveries
bcService.createOrderStaging(data)
bcService.createDeliveryStaging(data)
bcService.createInvoiceStaging(data)

// Communication
bcService.createMessage(data)
bcService.createNotification(data)

// Changes & Submissions
bcService.createItemChangeRequest(data)
bcService.createPriceSubmission(data)
bcService.createAnnouncement(data)
```

## Support

For Business Central API documentation, visit:
https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/
