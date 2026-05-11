# Business Central Document API Issue

## Problem
Documents cannot be synced to Business Central for Partner Registrations through the API.

## What We've Tried

### 1. POST with nested documents (for new registrations)
```json
POST /partnerRegistrations
{
  "no": "VRG-000120",
  "tradeName": "...",
  "partnerRegDocuments": [
    {
      "regNo": "VRG-000120",
      "lineNo": 10000,
      "name": "document.pdf",
      "url": "https://sharepoint.com/...",
      "size": 288860
    }
  ]
}
```
**Result**: ❌ Error - `partnerRegDocuments` property doesn't exist on `partnerRegistration` type

### 2. PATCH with documents (for existing registrations)
```json
PATCH /partnerRegistrations('VRG-000120')
{
  "partnerRegDocuments": [...]
}
```
**Result**: ❌ Error - `partnerRegDocuments` property doesn't exist on `partnerRegistration` type

### 3. POST to sub-collection endpoint
```json
POST /partnerRegistrations('VRG-000120')/partnerRegDocuments
{
  "regNo": "VRG-000120",
  "lineNo": 10000,
  "name": "document.pdf",
  "url": "https://sharepoint.com/...",
  "size": 288860
}
```
**Result**: ❌ 404 Not Found - Endpoint doesn't exist

## What Works
- ✅ Documents upload to SharePoint successfully
- ✅ Documents save to local PostgreSQL database
- ✅ Delivery Staging API accepts documents in POST body with `$expand=documents`

## Expected Format (from BC team)
```json
"documents": [
  {
    "name": "trade-license3.xlsx",
    "url": "https://novasoftglobal.sharepoint.com/...",
    "size": 204800
  },
  {
    "name": "vat-cert1.xlsx",
    "url": "https://novasoftglobal.sharepoint.com/...",
    "size": 98304
  }
]
```

## Questions for BC Team

1. **Does the Partner Registration API support documents at all?**
   - If yes, what is the correct endpoint/method?
   - If no, when will it be available?

2. **Should we use a different field name?**
   - We tried: `partnerRegDocuments`, `documents`
   - What is the correct field name in the API?

3. **Should documents be posted separately or with the parent record?**
   - Delivery Staging uses nested documents in POST body
   - Should Partner Registration work the same way?

4. **Is there a sub-collection endpoint we should use?**
   - Expected: `/partnerRegistrations('{no}')/partnerRegDocuments`
   - Currently returns: 404 Not Found

## Current Workaround
Documents are stored locally in PostgreSQL and can be viewed in the portal. They need to be manually added to BC until the API is fixed.

## API Details
- **Base URL**: `https://api.businesscentral.dynamics.com/v2.0/{tenant}/{env}/api/partnerPortal/partnerPortal/v2.0/companies({companyId})`
- **Entity**: `partnerRegistrations`
- **Document Entity**: `partnerRegDocuments` (assumed)
- **Working Example**: `deliveryStagings` accepts documents with `$expand=documents`

## Request
Please provide the correct API method to post documents for Partner Registrations, or enable the document sub-collection endpoint.
