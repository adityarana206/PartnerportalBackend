# Partner Portal Backend — API Testing Guide

**Base URL:** `http://localhost:3000`  
**Auth:** All protected routes require `Authorization: Bearer <token>` header.  
**Date Generated:** 2026-04-10

---

## Table of Contents

1. [Authentication APIs](#1-authentication-apis)
2. [User APIs](#2-user-apis)
3. [Contact APIs](#3-contact-apis)
4. [Invoice APIs](#4-invoice-apis)
5. [Purchase Invoice APIs](#5-purchase-invoice-apis)
6. [Purchase Order APIs](#6-purchase-order-apis)
7. [Sales Order APIs](#7-sales-order-apis)
8. [Purchase Receipt APIs](#8-purchase-receipt-apis)
9. [Sales Shipment APIs](#9-sales-shipment-apis)
10. [Item APIs](#10-item-apis)
11. [Item Category APIs](#11-item-category-apis)
12. [VAT Master APIs](#12-vat-master-apis)
13. [No Series APIs](#13-no-series-apis)
14. [Purchase Price APIs](#14-purchase-price-apis)
15. [Payment APIs](#15-payment-apis)
16. [Unit of Measure APIs](#16-unit-of-measure-apis)
17. [Partner Location Link APIs](#17-partner-location-link-apis)
18. [Permission APIs](#18-permission-apis)
19. [Permission Group APIs](#19-permission-group-apis)
20. [BC User Registration APIs](#20-bc-user-registration-apis)
21. [Bugs Found & Fixes Applied](#21-bugs-found--fixes-applied)

---

## 1. Authentication APIs

Base path: `/api/auth`

---

### 1.1 Get Registration Token
- **Method:** `POST`
- **URL:** `/api/auth/get-register-token`
- **Auth:** None
- **Body:** None

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Register token generated. Valid for 60 minutes.",
  "registerToken": "<jwt_token>",
  "expiresAt": "2026-04-10T11:00:00.000Z"
}
```

---

### 1.2 Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Auth:** None
- **Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "super_admin logged in successfully",
  "role": "super_admin",
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "data": {
    "id": 1,
    "ref_no": null,
    "name": "Super Admin",
    "email": "admin@example.com",
    "role": "super_admin",
    "created_at": "2026-04-10T..."
  }
}
```

**Error Cases:**
| Scenario | Status | Message |
|---|---|---|
| Missing email/password | 400 | "Email and password are required" |
| Wrong credentials | 401 | "Invalid email or password" |

---

### 1.3 Create Super Admin
- **Method:** `POST`
- **URL:** `/api/auth/create-super-admin`
- **Auth:** None
- **Body:**
```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Super admin created successfully",
  "data": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@example.com",
    "role": "super_admin",
    "created_at": "2026-04-10T..."
  }
}
```

**Error Cases:**
| Scenario | Status | Message |
|---|---|---|
| Missing fields | 400 | "Name, email and password are required" |
| Super admin already exists | 400 | "Super admin already exists" |
| Duplicate email | 400 | "Email already registered" |

---

### 1.4 Verify Token
- **Method:** `POST`
- **URL:** `/api/auth/verify-token`
- **Auth:** `Bearer <token>` (in Authorization header)
- **Body:** None

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "role": "super_admin",
  "data": {
    "id": 1,
    "ref_no": null,
    "name": "Super Admin",
    "email": "admin@example.com",
    "role": "super_admin",
    "created_at": "2026-04-10T..."
  }
}
```

**Error Cases:**
| Scenario | Status | Message |
|---|---|---|
| No token | 401 | "Token is required" |
| Expired token | 401 | "Token expired" |
| Invalid token | 401 | "Invalid token" |
| User not found | 404 | "User not found" |

---

### 1.5 Refresh Token
- **Method:** `POST`
- **URL:** `/api/auth/refresh-token`
- **Auth:** None
- **Body:**
```json
{
  "refreshToken": "<refresh_token_from_login>"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "<new_access_token>"
}
```

**Error Cases:**
| Scenario | Status | Message |
|---|---|---|
| Missing refreshToken | 400 | "Refresh token is required" |
| Invalid refreshToken | 401 | "Invalid refresh token" |
| Expired refreshToken | 401 | "Refresh token expired. Please log in again" |

---

### 1.6 Logout
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Auth:** `Bearer <token>` (Required)
- **Body:**
```json
{
  "refreshToken": "<refresh_token>"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.7 Change Password
- **Method:** `POST`
- **URL:** `/api/auth/change-password`
- **Auth:** `Bearer <token>` (Required)
- **Body:**
```json
{
  "oldPassword": "Admin@123",
  "newPassword": "NewAdmin@456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Cases:**
| Scenario | Status | Message |
|---|---|---|
| Missing fields | 400 | "Old password and new password are required" |
| New password < 6 chars | 400 | "New password must be at least 6 characters" |
| Wrong old password | 401 | "Old password is incorrect" |

---

## 2. User APIs

Base path: `/api/users`

---

### 2.1 Register User
- **Method:** `POST`
- **URL:** `/api/users/register`
- **Auth:** None
- **Allowed roles:** `customer`, `vendor`, `customer_admin`, `vendor_admin` (NOT `super_admin`)
- **Body (full payload):**
```json
{
  "role": "vendor",
  "name": "Acme Supplies LLC",
  "name2": "Acme Supplies",
  "partnerno": "V-0001",
  "email": "vendor@acme.com",
  "password": "Vendor@123",
  "address": "123 Industrial Zone",
  "address2": "Block B",
  "city": "Dubai",
  "postCode": "12345",
  "countryRegionCode": "AE",
  "phoneNo": "+971501234567",
  "vatRegistrationNo": "VAT123456",
  "currencyCode": "AED",
  "paymentTermsCode": "NET30"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "vendor registered successfully",
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "data": {
    "id": 2,
    "ref_no": "V-0001",
    "name": "Acme Supplies LLC",
    "email": "vendor@acme.com",
    "role": "vendor",
    "created_at": "2026-04-10T..."
  }
}
```

**Error Cases:**
| Scenario | Status | Message |
|---|---|---|
| Invalid/missing role | 400 | "Role is required. Allowed: customer, vendor, ..." |
| Role = super_admin | 403 | "Super admin cannot be registered via this API" |
| Missing name | 400 | "Name is required" |
| Missing password | 400 | "Password is required" |
| Duplicate ref_no | 400 | "Reference number already exists" |
| Duplicate email | 400 | "Email already registered" |

---

### 2.2 Get All Users
- **Method:** `GET`
- **URL:** `/api/users/`
- **Auth:** `Bearer <token>` (Required) + `canRead("USERS")` permission
- **Query Params:** None
- **Notes:** super_admin sees all; customer_admin sees customers only; vendor_admin sees vendors only

**Expected Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "ref_no": null,
      "name": "Super Admin",
      "email": "admin@example.com",
      "role": "super_admin",
      "permission_groups": []
    }
  ]
}
```

---

### 2.3 Get My Profile
- **Method:** `GET`
- **URL:** `/api/users/me`
- **Auth:** `Bearer <token>` (Required)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "ref_no": "V-0001",
    "name": "Acme Supplies LLC",
    "role": "vendor",
    "permission_groups": []
  }
}
```

---

### 2.4 Get User by ID
- **Method:** `GET`
- **URL:** `/api/users/:id`
- **Auth:** `Bearer <token>` + `canRead("USERS")`
- **Example:** `/api/users/2`

**Expected Response (200):**
```json
{
  "success": true,
  "data": { "id": 2, "name": "Acme Supplies LLC", "role": "vendor" }
}
```

**Error Cases:**
| Scenario | Status | Message |
|---|---|---|
| Not found | 404 | "User not found" |
| Access denied | 403 | "Access denied" |

---

### 2.5 Update User
- **Method:** `PUT`
- **URL:** `/api/users/:id`
- **Auth:** `Bearer <token>` + `canModify("USERS")`
- **Body (full payload):**
```json
{
  "name": "Acme Supplies Updated",
  "name2": "Acme",
  "address": "456 New Industrial Zone",
  "address2": "Block C",
  "city": "Abu Dhabi",
  "postCode": "54321",
  "countryRegionCode": "AE",
  "phoneNo": "+971507654321",
  "email": "updated@acme.com",
  "vatRegistrationNo": "VAT654321",
  "currencyCode": "USD",
  "paymentTermsCode": "NET60"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": { "id": 2, "name": "Acme Supplies Updated" }
}
```

---

### 2.6 Delete User
- **Method:** `DELETE`
- **URL:** `/api/users/:id`
- **Auth:** `Bearer <token>` (super_admin only)
- **Example:** `/api/users/2`

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 3. Contact APIs

Base path: `/api/contact`

---

### 3.1 Get All Contacts
- **Method:** `GET`
- **URL:** `/api/contact/`
- **Auth:** `Bearer <token>` + `canRead("CONTACTS")`

---

### 3.2 Get Contacts by Partner
- **Method:** `GET`
- **URL:** `/api/contact/partner/:partnerNo`
- **Auth:** `Bearer <token>` + `canRead("CONTACTS")`
- **Example:** `/api/contact/partner/V-0001`

---

### 3.3 Get Contact by ID
- **Method:** `GET`
- **URL:** `/api/contact/:id`
- **Auth:** `Bearer <token>` + `canRead("CONTACTS")`

---

### 3.4 Create Contact
- **Method:** `POST`
- **URL:** `/api/contact/`
- **Auth:** `Bearer <token>` + `canWrite("CONTACTS")`
- **Body (full payload):**
```json
{
  "contactNo": "CT-0001",
  "contactName": "John Doe",
  "email": "john.doe@acme.com",
  "phone": "+971501234567",
  "mobilePhoneNo": "+971551234567",
  "companyNo": "COMP-001",
  "companyName": "Acme Supplies LLC",
  "portalUser": true,
  "portalAdmin": false,
  "partnerType": "Vendor",
  "partnerNo": "V-0001",
  "shipToCode": "SHP-001",
  "vendorLocationCode": "LOC-001",
  "locationCode": "LOC-001",
  "address": "123 Industrial Zone",
  "address2": "Block B",
  "city": "Dubai",
  "postCode": "12345",
  "countryRegionCode": "AE",
  "jobTitle": "Procurement Manager",
  "languageCode": "ENG",
  "department": "Procurement",
  "faxNo": "+97142345678",
  "homePage": "https://acme.com",
  "syncStatus": "Pending",
  "lastSyncedDateTime": null
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": { "id": 1, "contact_name": "John Doe", "portal_contact_no": "PCNT-0001" }
}
```

---

### 3.5 Create Contact from Business Central
- **Method:** `POST`
- **URL:** `/api/contact/businesscentral`
- **Auth:** `protectRegister` (register token in `Authorization: Bearer <registerToken>`)
- **Body:** Same as 3.4 above

---

### 3.6 Update Contact
- **Method:** `PUT`
- **URL:** `/api/contact/:id`
- **Auth:** `Bearer <token>` + `canModify("CONTACTS")`
- **Body:** Same fields as create (partial update supported)

---

### 3.7 Update Sync Status
- **Method:** `PATCH`
- **URL:** `/api/contact/:id/sync`
- **Auth:** `Bearer <token>` + `canModify("CONTACTS")`
- **Body:**
```json
{
  "syncStatus": "Synced",
  "lastSyncedDateTime": "2026-04-10T10:00:00.000Z"
}
```

---

### 3.8 Update Portal Access
- **Method:** `PATCH`
- **URL:** `/api/contact/:id/portal`
- **Auth:** `Bearer <token>` + `canModify("CONTACTS")`
- **Body:**
```json
{
  "portalUser": true,
  "portalAdmin": false
}
```

---

### 3.9 Delete Contact
- **Method:** `DELETE`
- **URL:** `/api/contact/:id`
- **Auth:** `Bearer <token>` + `canDelete("CONTACTS")`

---

## 4. Invoice APIs

Base path: `/api/invoices`  
**Allowed roles:** `vendor`, `vendor_admin`, `customer`, `customer_admin`, `super_admin`

---

### 4.1 Create Invoice
- **Method:** `POST`
- **URL:** `/api/invoices/`
- **Auth:** `Bearer <token>` (all roles above)
- **Body (full payload with lines):**
```json
{
  "invoiceType": "Sales",
  "invoiceNo": "INV-2026-001",
  "invoiceDate": "2026-04-10",
  "dueDate": "2026-05-10",
  "partnerNo": "C-0001",
  "partnerType": "Customer",
  "totalAmount": 5000.00,
  "currencyCode": "AED",
  "outstandingAmount": 5000.00,
  "status": "Open",
  "bcInvoiceNo": "BC-INV-001",
  "linkedOrderNo": "SO-2026-001",
  "portalInvoiceLine": [
    {
      "lineNo": 1,
      "itemNo": "ITEM-001",
      "description": "Product A",
      "quantity": 10,
      "unitPrice": 400.00,
      "lineAmount": 4000.00,
      "lineDiscount": 5,
      "lineDiscountAmount": 200.00,
      "unitOfMeasureCode": "PCS",
      "vat": 5,
      "vatAmount": 190.00,
      "variantCode": null
    },
    {
      "lineNo": 2,
      "itemNo": "ITEM-002",
      "description": "Product B",
      "quantity": 5,
      "unitPrice": 200.00,
      "lineAmount": 1000.00,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "unitOfMeasureCode": "PCS",
      "vat": 5,
      "vatAmount": 50.00,
      "variantCode": null
    }
  ]
}
```

---

### 4.2 Create Invoice from Business Central
- **Method:** `POST`
- **URL:** `/api/invoices/businesscentral`
- **Auth:** `protectRegister`
- **Body:** Same as 4.1

---

### 4.3 Get All Invoices
- **Method:** `GET`
- **URL:** `/api/invoices/`
- **Auth:** `Bearer <token>`

---

### 4.4 Get Invoices by Partner
- **Method:** `GET`
- **URL:** `/api/invoices/partner/:partnerNo`
- **Auth:** `Bearer <token>`
- **Example:** `/api/invoices/partner/C-0001`

---

### 4.5 Get Invoice by Number
- **Method:** `GET`
- **URL:** `/api/invoices/no/:invoiceNo`
- **Auth:** `Bearer <token>`
- **Example:** `/api/invoices/no/INV-2026-001`

---

### 4.6 Get Invoice by ID
- **Method:** `GET`
- **URL:** `/api/invoices/:id`
- **Auth:** `Bearer <token>`

---

### 4.7 Update Invoice
- **Method:** `PUT`
- **URL:** `/api/invoices/:id`
- **Auth:** `Bearer <token>`
- **Body:** Same structure as create

---

### 4.8 Update Invoice Status
- **Method:** `PATCH`
- **URL:** `/api/invoices/:id/status`
- **Auth:** `Bearer <token>` (`vendor_admin`, `customer_admin`, `super_admin` only)
- **Body:**
```json
{
  "status": "Paid"
}
```

---

### 4.9 Delete Invoice
- **Method:** `DELETE`
- **URL:** `/api/invoices/:id`
- **Auth:** `Bearer <token>` (`vendor_admin`, `customer_admin`, `super_admin` only)

---

## 5. Purchase Invoice APIs

Base path: `/api/purchase-invoices`  
**Allowed roles:** `vendor`, `vendor_admin`, `super_admin`

---

### 5.1 Create Purchase Invoice
- **Method:** `POST`
- **URL:** `/api/purchase-invoices/`
- **Auth:** `Bearer <token>`
- **Body (full payload):**
```json
{
  "invoiceType": "Purchase",
  "invoiceNo": "PINV-2026-001",
  "invoiceDate": "2026-04-10",
  "dueDate": "2026-05-10",
  "partnerNo": "V-0001",
  "partnerType": "Vendor",
  "totalAmount": 10000.00,
  "currencyCode": "AED",
  "outstandingAmount": 10000.00,
  "status": "Open",
  "bcInvoiceNo": "BC-PINV-001",
  "linkedOrderNo": "PO-2026-001",
  "portalInvoiceLine": [
    {
      "lineNo": 1,
      "itemNo": "ITEM-001",
      "description": "Raw Material A",
      "quantity": 100,
      "unitPrice": 80.00,
      "lineAmount": 8000.00,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "unitOfMeasureCode": "KG",
      "vat": 5,
      "vatAmount": 400.00,
      "variantCode": null
    },
    {
      "lineNo": 2,
      "itemNo": "ITEM-003",
      "description": "Raw Material B",
      "quantity": 20,
      "unitPrice": 100.00,
      "lineAmount": 2000.00,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "unitOfMeasureCode": "KG",
      "vat": 5,
      "vatAmount": 100.00,
      "variantCode": null
    }
  ]
}
```

### 5.2–5.9
Same endpoints as Invoice APIs (getAll, getByPartner, getByNo, getById, update, updateStatus, delete) replacing `/api/invoices` with `/api/purchase-invoices`.

---

## 6. Purchase Order APIs

Base path: `/api/purchase-orders`

---

### 6.1 Create Purchase Order
- **Method:** `POST`
- **URL:** `/api/purchase-orders/`
- **Auth:** `Bearer <token>` + `canWrite("PURCHASE_ORDERS")`
- **Body (full payload with lines):**
```json
{
  "orderType": "Purchase Order",
  "partnerNo": "V-0001",
  "partnerType": "Vendor",
  "shipToCode": "SHP-001",
  "locationCode": "WH-MAIN",
  "orderDate": "2026-04-10",
  "requestedDeliveryDate": "2026-04-25",
  "currencyCode": "AED",
  "externalDocumentNo": "EXT-PO-001",
  "status": "Draft",
  "direction": "Portal_x002D_to_x002D_BC",
  "submittedDate": null,
  "orderStagingLines": [
    {
      "lineNo": 1,
      "itemNo": "ITEM-001",
      "description": "Raw Material A",
      "quantity": 50,
      "unitOfMeasureCode": "KG",
      "unitPrice": 80.00,
      "lineDiscountPercent": 0,
      "lineDiscountAmount": 0,
      "lineAmount": 4000.00,
      "locationCode": "WH-MAIN",
      "deliveryDate": "2026-04-25",
      "variantCode": null,
      "vatCode": "VAT5"
    },
    {
      "lineNo": 2,
      "itemNo": "ITEM-002",
      "description": "Raw Material B",
      "quantity": 30,
      "unitOfMeasureCode": "KG",
      "unitPrice": 60.00,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 90.00,
      "lineAmount": 1710.00,
      "locationCode": "WH-MAIN",
      "deliveryDate": "2026-04-25",
      "variantCode": null,
      "vatCode": "VAT5"
    }
  ]
}
```

**Notes:** VAT is auto-calculated from the `vat_masters` table if `vatCode` is provided on lines.

---

### 6.2 Create Purchase Order from Business Central
- **Method:** `POST`
- **URL:** `/api/purchase-orders/businesscentral`
- **Auth:** `protectRegister`
- **Body:** Same as 6.1

---

### 6.3 Get All Purchase Orders
- **Method:** `GET`
- **URL:** `/api/purchase-orders/`
- **Auth:** `Bearer <token>` + `canRead("PURCHASE_ORDERS")`

---

### 6.4 Get Orders by Partner
- **Method:** `GET`
- **URL:** `/api/purchase-orders/partner/:partnerNo`
- **Example:** `/api/purchase-orders/partner/V-0001`

---

### 6.5 Get Approved Items for Partner
- **Method:** `GET`
- **URL:** `/api/purchase-orders/items/:partnerNo`
- **Example:** `/api/purchase-orders/items/V-0001`

---

### 6.6 Get Approved Item Detail
- **Method:** `GET`
- **URL:** `/api/purchase-orders/items/:partnerNo/:batchNo`
- **Example:** `/api/purchase-orders/items/V-0001/BATCH-001`

---

### 6.7 Get Locations for Partner
- **Method:** `GET`
- **URL:** `/api/purchase-orders/locations`
- **Auth:** `Bearer <token>` + `canRead("PURCHASE_ORDERS")`

---

### 6.8 Get Purchase Order by ID
- **Method:** `GET`
- **URL:** `/api/purchase-orders/:id`

---

### 6.9 Update Purchase Order
- **Method:** `PUT`
- **URL:** `/api/purchase-orders/:id`
- **Auth:** `Bearer <token>` + `canModify("PURCHASE_ORDERS")`
- **Body:** Same structure as create

---

### 6.10 Update Order Status
- **Method:** `PATCH`
- **URL:** `/api/purchase-orders/:id/status`
- **Auth:** `Bearer <token>` + `canModify("PURCHASE_ORDERS")`
- **Body:**
```json
{
  "status": "Submitted"
}
```

---

### 6.11 Delete Purchase Order
- **Method:** `DELETE`
- **URL:** `/api/purchase-orders/:id`
- **Auth:** `Bearer <token>` + `canDelete("PURCHASE_ORDERS")`

---

## 7. Sales Order APIs

Base path: `/api/sales-orders`

---

### 7.1 Create Sales Order
- **Method:** `POST`
- **URL:** `/api/sales-orders/`
- **Auth:** `Bearer <token>` + `canWrite("SALES_ORDERS")`
- **Body (full payload with lines):**
```json
{
  "orderType": "Sales Order",
  "partnerNo": "C-0001",
  "partnerType": "Customer",
  "shipToCode": "SHP-001",
  "locationCode": "WH-MAIN",
  "orderDate": "2026-04-10",
  "requestedDeliveryDate": "2026-04-20",
  "currencyCode": "AED",
  "externalDocumentNo": "EXT-SO-001",
  "status": "Processed",
  "direction": "BC_x002D_to_x002D_Portal",
  "submittedDate": "2026-04-10",
  "orderStagingLines": [
    {
      "lineNo": 1,
      "itemNo": "ITEM-001",
      "description": "Product A",
      "quantity": 20,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 400.00,
      "lineDiscountPercent": 10,
      "lineDiscountAmount": 800.00,
      "lineAmount": 7200.00,
      "locationCode": "WH-MAIN",
      "deliveryDate": "2026-04-20",
      "variantCode": null
    }
  ]
}
```

---

### 7.2 Create Sales Order from Business Central
- **Method:** `POST`
- **URL:** `/api/sales-orders/businesscentral`
- **Auth:** `protectRegister`
- **Body:** Same as 7.1

---

### 7.3 Get All Sales Orders
- **Method:** `GET`
- **URL:** `/api/sales-orders/`
- **Auth:** `Bearer <token>` + `canRead("SALES_ORDERS")`

---

### 7.4 Get Orders by Partner
- **Method:** `GET`
- **URL:** `/api/sales-orders/partner/:partnerNo`

---

### 7.5 Get Sales Order by ID
- **Method:** `GET`
- **URL:** `/api/sales-orders/:id`

---

### 7.6 Update Sales Order
- **Method:** `PUT`
- **URL:** `/api/sales-orders/:id`
- **Auth:** `Bearer <token>` + `canModify("SALES_ORDERS")`

---

### 7.7 Update Sales Order Status
- **Method:** `PATCH`
- **URL:** `/api/sales-orders/:id/status`
- **Body:**
```json
{
  "status": "Shipped"
}
```

---

### 7.8 Delete Sales Order
- **Method:** `DELETE`
- **URL:** `/api/sales-orders/:id`
- **Auth:** `Bearer <token>` + `canDelete("SALES_ORDERS")`

---

## 8. Purchase Receipt APIs

Base path: `/api/purchase-receipts`  
**Allowed roles:** `vendor`, `vendor_admin`, `super_admin`

---

### 8.1 Create Purchase Receipt
- **Method:** `POST`
- **URL:** `/api/purchase-receipts/`
- **Auth:** `Bearer <token>`
- **Body (full payload):**
```json
{
  "deliveryType": "Purchase Receipt",
  "partnerNo": "V-0001",
  "partnerType": "Vendor",
  "linkedOrderNo": "PO-2026-001",
  "shipmentNo": "SHIP-2026-001",
  "trackingNo": "TRACK-12345",
  "carrierCode": "DHL",
  "shipmentDate": "2026-04-12",
  "expectedDeliveryDate": "2026-04-15",
  "locationCode": "WH-MAIN",
  "shipToCode": "SHP-001",
  "status": "Processed",
  "direction": "BC_x002D_to_x002D_Portal",
  "bcDocumentNo": "BC-REC-001",
  "deliveryStagingsLine": [
    {
      "lineNo": 1,
      "itemNo": "ITEM-001",
      "description": "Raw Material A",
      "quantity": 50,
      "unitOfMeasureCode": "KG",
      "unitPrice": 80.00,
      "lineAmount": 4000.00,
      "locationCode": "WH-MAIN",
      "variantCode": null
    }
  ]
}
```

---

### 8.2–8.8
Same endpoints pattern as Purchase Orders (getAll, getByPartner, getByShipmentNo, getById, update, updateStatus, delete) at `/api/purchase-receipts`.

---

## 9. Sales Shipment APIs

Base path: `/api/sales-shipments`

---

### 9.1 Create Sales Shipment
- **Method:** `POST`
- **URL:** `/api/sales-shipments/`
- **Auth:** `Bearer <token>` + `canWrite("SALES_SHIPMENTS")`
- **Body (full payload):**
```json
{
  "portalDocumentNo": "PSHIP-2026-001",
  "shipmentNo": "SHIP-2026-002",
  "deliveryType": "Shipment",
  "partnerNo": "C-0001",
  "partnerType": "Customer",
  "linkedOrderNo": "SO-2026-001",
  "trackingNo": "TRACK-67890",
  "carrierCode": "FedEx",
  "shipmentDate": "2026-04-12",
  "expectedDeliveryDate": "2026-04-15",
  "locationCode": "WH-MAIN",
  "shipToCode": "SHP-001",
  "status": "Inserted",
  "direction": "BC_x002D_to_x002D_Portal",
  "bcDocumentNo": "BC-SHIP-001",
  "deliveryStagingsLine": [
    {
      "lineNo": 1,
      "itemNo": "ITEM-001",
      "description": "Product A",
      "quantity": 20,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 400.00,
      "lineAmount": 8000.00,
      "locationCode": "WH-MAIN",
      "variantCode": null
    }
  ]
}
```

---

### 9.2 Create Sales Shipment from Business Central
- **Method:** `POST`
- **URL:** `/api/sales-shipments/businesscentral`
- **Auth:** `protectRegister`

---

### 9.3 Get All Sales Shipments
- **Method:** `GET`
- **URL:** `/api/sales-shipments/`
- **Auth:** `Bearer <token>` + `canRead("SALES_SHIPMENTS")`

---

### 9.4 Get Sales Shipment by ID
- **Method:** `GET`
- **URL:** `/api/sales-shipments/:id`

---

### 9.5 Get Sales Shipment by Portal Doc No
- **Method:** `GET`
- **URL:** `/api/sales-shipments/portal/:portalDocumentNo`
- **Example:** `/api/sales-shipments/portal/PSHIP-2026-001`

---

### 9.6 Update Sales Shipment Status
- **Method:** `PATCH`
- **URL:** `/api/sales-shipments/:id/status`
- **Auth:** `Bearer <token>` + `canModify("SALES_SHIPMENTS")`
- **Body:**
```json
{
  "status": "Delivered"
}
```

---

### 9.7 Delete Sales Shipment
- **Method:** `DELETE`
- **URL:** `/api/sales-shipments/:id`
- **Auth:** `Bearer <token>` + `canDelete("SALES_SHIPMENTS")`

---

## 10. Item APIs

Base path: `/api/vendor/item`

---

### 10.1 Create Item Request
- **Method:** `POST`
- **URL:** `/api/vendor/item/`
- **Auth:** `Bearer <token>` + `canWrite("ITEMS")`
- **Body (full payload):**
```json
{
  "partnerPortalNo": "PPO-0001",
  "partnerNo": "V-0001",
  "batchNo": "BATCH-001",
  "variantCode": "VAR-A",
  "itemName": "Organic Wheat Flour",
  "description": "Premium grade organic wheat flour 1kg pack",
  "itemCategoryCode": "FOOD-DRY",
  "baseUnitOfMeasure": "KG",
  "netWeight": 1.0,
  "grossWeight": 1.05,
  "specifications": "Moisture < 14%, Protein > 11%",
  "ingredients": "Wheat",
  "allergenDeclaration": "Contains gluten",
  "shelfLifeDays": 365,
  "gtin": "1234567890123",
  "eanCode": "EAN12345",
  "unitPrice": 5.50,
  "priceCurrencyCode": "AED",
  "block": false,
  "status": "Created"
}
```

---

### 10.2 Create Item from Business Central
- **Method:** `POST`
- **URL:** `/api/vendor/item/businesscentral`
- **Auth:** `protectRegister`
- **Body:** Same as 10.1

---

### 10.3 Import Items (Bulk)
- **Method:** `POST`
- **URL:** `/api/vendor/item/import`
- **Auth:** `Bearer <token>` + `canWrite("ITEMS")`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` field with CSV/Excel file

---

### 10.4 Download Import Template
- **Method:** `GET`
- **URL:** `/api/vendor/item/import/template`
- **Auth:** `Bearer <token>` + `canRead("ITEMS")`

---

### 10.5 Get All Items
- **Method:** `GET`
- **URL:** `/api/vendor/item/`
- **Auth:** `Bearer <token>` + `canRead("ITEMS")`

---

### 10.6 Get Items by Partner
- **Method:** `GET`
- **URL:** `/api/vendor/item/partner/:partnerNo`
- **Example:** `/api/vendor/item/partner/V-0001`

---

### 10.7 Get Items by Partner Portal No
- **Method:** `GET`
- **URL:** `/api/vendor/item/portal/:partnerPortalNo`
- **Example:** `/api/vendor/item/portal/PPO-0001`

---

### 10.8 Get Item by Key
- **Method:** `GET`
- **URL:** `/api/vendor/item/key/:partnerPortalNo/:partnerNo/:batchNo`
- **Example:** `/api/vendor/item/key/PPO-0001/V-0001/BATCH-001`

---

### 10.9 Get Unit of Measures (via Items)
- **Method:** `GET`
- **URL:** `/api/vendor/item/unit-of-measures`
- **Auth:** `Bearer <token>` + `canRead("ITEMS")`

---

### 10.10 Get Item by ID
- **Method:** `GET`
- **URL:** `/api/vendor/item/:id`

---

### 10.11 Create Price Change
- **Method:** `POST`
- **URL:** `/api/vendor/item/price-change`
- **Auth:** `Bearer <token>` + `canWrite("ITEMS")`
- **Body:**
```json
{
  "itemId": 1,
  "partnerNo": "V-0001",
  "batchNo": "BATCH-001",
  "oldPrice": 5.50,
  "newPrice": 6.00,
  "effectiveDate": "2026-05-01",
  "priceCurrencyCode": "AED",
  "reason": "Cost increase"
}
```

---

### 10.12 Create Item Change Request
- **Method:** `POST`
- **URL:** `/api/vendor/item/change-request`
- **Auth:** `Bearer <token>` + `canWrite("ITEMS")`
- **Body:**
```json
{
  "itemId": 1,
  "partnerNo": "V-0001",
  "changeType": "Specification Update",
  "description": "Updated moisture specification to < 13%",
  "newSpecifications": "Moisture < 13%, Protein > 11%"
}
```

---

### 10.13 Update Item
- **Method:** `PUT`
- **URL:** `/api/vendor/item/:id`
- **Auth:** `Bearer <token>` + `canModify("ITEMS")`
- **Body:** Same as create payload

---

### 10.14 Update Item Status
- **Method:** `PATCH`
- **URL:** `/api/vendor/item/:id/status`
- **Auth:** `Bearer <token>` + `canModify("ITEMS")`
- **Body:**
```json
{
  "status": "Approved",
  "rejectionReason": null
}
```

**Valid status values:** `Created`, `Submitted`, `Approved`, `Rejected`

---

### 10.15 Update Item Block
- **Method:** `PATCH`
- **URL:** `/api/vendor/item/:id/block`
- **Auth:** `Bearer <token>` + `canModify("ITEMS")`
- **Body:**
```json
{
  "block": true
}
```

---

### 10.16 Delete Item
- **Method:** `DELETE`
- **URL:** `/api/vendor/item/:id`
- **Auth:** `Bearer <token>` + `canDelete("ITEMS")`

---

## 11. Item Category APIs

Base path: `/api/item-categories`  
**Allowed roles:** `vendor`, `vendor_admin`, `super_admin`

---

### 11.1 Get Item Categories
- **Method:** `GET`
- **URL:** `/api/item-categories/`
- **Auth:** `Bearer <token>`

---

### 11.2 Sync Item Categories
- **Method:** `POST`
- **URL:** `/api/item-categories/sync`
- **Auth:** `Bearer <token>` (`vendor_admin`, `super_admin` only)
- **Body:**
```json
{
  "categories": [
    {
      "code": "FOOD-DRY",
      "description": "Dry Food Products",
      "parentCode": null
    },
    {
      "code": "FOOD-FRESH",
      "description": "Fresh Food Products",
      "parentCode": null
    }
  ]
}
```

---

## 12. VAT Master APIs

Base path: `/api/vat-master`  
**Auth:** All routes require `Bearer <token>`

---

### 12.1 Create VAT Master
- **Method:** `POST`
- **URL:** `/api/vat-master/`
- **Body (full payload):**
```json
{
  "vatCode": "VAT5",
  "description": "Standard VAT 5%",
  "vatPercent": 5,
  "vatType": "Normal",
  "isInclusive": false,
  "status": "Active"
}
```

---

### 12.2 Get All VAT Masters
- **Method:** `GET`
- **URL:** `/api/vat-master/`
- **Query Params (optional):** `?status=Active&vatType=Normal`

---

### 12.3 Get VAT by Code
- **Method:** `GET`
- **URL:** `/api/vat-master/code/:vatCode`
- **Example:** `/api/vat-master/code/VAT5`

---

### 12.4 Get VAT by ID
- **Method:** `GET`
- **URL:** `/api/vat-master/:id`

---

### 12.5 Update VAT Master
- **Method:** `PUT`
- **URL:** `/api/vat-master/:id`
- **Body:** Same as create

---

### 12.6 Update VAT Status
- **Method:** `PATCH`
- **URL:** `/api/vat-master/:id/status`
- **Body:**
```json
{
  "status": "Inactive"
}
```

---

### 12.7 Delete VAT Master
- **Method:** `DELETE`
- **URL:** `/api/vat-master/:id`

---

## 13. No Series APIs

Base path: `/api/no-series`  
**Auth:** No auth required (open routes — consider adding protection)

---

### 13.1 Create No Series
- **Method:** `POST`
- **URL:** `/api/no-series/`
- **Body (full payload):**
```json
{
  "code": "INVOICE",
  "description": "Invoice Number Series",
  "startingNo": 1,
  "endingNo": 999999,
  "lastNoUsed": 0,
  "warningNo": 999000,
  "incrementByNo": 1,
  "allowGaps": false,
  "dateOrder": false
}
```

---

### 13.2 Get All No Series
- **Method:** `GET`
- **URL:** `/api/no-series/getall`

---

### 13.3 Get No Series by Code
- **Method:** `GET`
- **URL:** `/api/no-series/code/:code`
- **Example:** `/api/no-series/code/INVOICE`

---

### 13.4 Get No Series by ID
- **Method:** `GET`
- **URL:** `/api/no-series/:id`

---

### 13.5 Update No Series
- **Method:** `PUT`
- **URL:** `/api/no-series/:id`
- **Body:** Same as create (excluding `code` which is immutable)

---

### 13.6 Get Next Number
- **Method:** `PATCH`
- **URL:** `/api/no-series/:id/next-number`
- **Body:** None
- **Notes:** Atomically increments `lastNoUsed` and returns the next number

**Expected Response (200):**
```json
{
  "success": true,
  "nextNumber": 1,
  "formatted": "INVOICE-000001"
}
```

---

### 13.7 Reset No Series
- **Method:** `PATCH`
- **URL:** `/api/no-series/:id/reset`
- **Body:**
```json
{
  "lastNoUsed": 0
}
```

---

### 13.8 Delete No Series
- **Method:** `DELETE`
- **URL:** `/api/no-series/:id`

---

## 14. Purchase Price APIs

Base path: `/api/purchase-prices`  
**Allowed roles:** `vendor`, `vendor_admin`, `super_admin`

---

### 14.1 Create Purchase Price
- **Method:** `POST`
- **URL:** `/api/purchase-prices/`
- **Auth:** `Bearer <token>`
- **Body (full payload):**
```json
{
  "batchNo": "BATCH-001",
  "itemName": "Organic Wheat Flour",
  "description": "Premium wheat flour",
  "itemCategoryCode": "FOOD-DRY",
  "baseUnitOfMeasure": "KG",
  "netWeight": 1.0,
  "grossWeight": 1.05,
  "specifications": "Moisture < 14%",
  "ingredients": "Wheat",
  "allergenDeclaration": "Contains gluten",
  "shelfLifeDays": 365,
  "gtin": "1234567890123",
  "eanCode": "EAN12345",
  "newPrice": 6.00,
  "oldPrice": 5.50,
  "effectiveDate": "2026-05-01",
  "endingDate": "2026-12-31",
  "currencyCode": "AED",
  "unitOfMeasureCode": "KG",
  "minimumQuantity": 10,
  "partnerNo": "V-0001",
  "status": "_x0020_",
  "rejectionReason": null
}
```

---

### 14.2 Get All Purchase Prices
- **Method:** `GET`
- **URL:** `/api/purchase-prices/`

---

### 14.3 Get Purchase Price by ID
- **Method:** `GET`
- **URL:** `/api/purchase-prices/:id`

---

### 14.4 Update Purchase Price
- **Method:** `PUT`
- **URL:** `/api/purchase-prices/:id`
- **Body:** Same as create

---

### 14.5 Delete Purchase Price
- **Method:** `DELETE`
- **URL:** `/api/purchase-prices/:id`

---

## 15. Payment APIs

Base path: `/api/payments`  
**Allowed roles:** Read: `vendor`, `vendor_admin`, `super_admin` | Write: `vendor_admin`, `super_admin` | Delete: `super_admin` only

---

### 15.1 Create Payment
- **Method:** `POST`
- **URL:** `/api/payments/`
- **Auth:** `Bearer <token>` (`vendor_admin`, `super_admin`)
- **Body (full payload):**
```json
{
  "paymentNumber": "PAY-2026-001",
  "invoiceId": 1,
  "partnerNo": "V-0001",
  "amount": 10500.00,
  "paymentDate": "2026-04-10",
  "method": "Bank Transfer",
  "status": "Pending"
}
```

---

### 15.2 Get All Payments
- **Method:** `GET`
- **URL:** `/api/payments/`
- **Auth:** `Bearer <token>`

---

### 15.3 Get Payments by Partner
- **Method:** `GET`
- **URL:** `/api/payments/partner/:partnerNo`
- **Example:** `/api/payments/partner/V-0001`

---

### 15.4 Get Payment by ID
- **Method:** `GET`
- **URL:** `/api/payments/:id`

---

### 15.5 Update Payment
- **Method:** `PUT`
- **URL:** `/api/payments/:id`
- **Auth:** `Bearer <token>` (`vendor_admin`, `super_admin`)
- **Body:** Same as create

---

### 15.6 Update Payment Status
- **Method:** `PATCH`
- **URL:** `/api/payments/:id/status`
- **Body:**
```json
{
  "status": "Completed"
}
```

---

### 15.7 Delete Payment
- **Method:** `DELETE`
- **URL:** `/api/payments/:id`
- **Auth:** `Bearer <token>` (`super_admin` only)

---

## 16. Unit of Measure APIs

Base path: `/api/unit-of-measures`  
**Allowed roles:** Read: `vendor`, `vendor_admin`, `super_admin` | Write: `vendor_admin`, `super_admin` | Delete: `super_admin` only

---

### 16.1 Create Unit of Measure
- **Method:** `POST`
- **URL:** `/api/unit-of-measures/`
- **Auth:** `Bearer <token>` (`vendor_admin`, `super_admin`)
- **Body:**
```json
{
  "code": "KG",
  "description": "Kilogram"
}
```

---

### 16.2 Get All Units of Measure
- **Method:** `GET`
- **URL:** `/api/unit-of-measures/`

---

### 16.3 Get Unit of Measure by ID
- **Method:** `GET`
- **URL:** `/api/unit-of-measures/:id`

---

### 16.4 Update Unit of Measure
- **Method:** `PUT`
- **URL:** `/api/unit-of-measures/:id`
- **Body:**
```json
{
  "code": "KG",
  "description": "Kilogram (Updated)"
}
```

---

### 16.5 Delete Unit of Measure
- **Method:** `DELETE`
- **URL:** `/api/unit-of-measures/:id`
- **Auth:** `Bearer <token>` (`super_admin` only)

---

## 17. Partner Location Link APIs

Base path: `/api/partner-location-links`

---

### 17.1 Create Partner Location Link
- **Method:** `POST`
- **URL:** `/api/partner-location-links/`
- **Auth:** `Bearer <token>` (all roles)
- **Body (full payload):**
```json
{
  "partnerType": "Vendor",
  "partnerNo": "V-0001",
  "description": "Main Warehouse",
  "addressCode": "ADDR-001",
  "addressName": "Dubai Industrial City",
  "locationCode": "WH-MAIN",
  "address": "Plot 123, Industrial Area",
  "address2": "Zone B",
  "city": "Dubai",
  "postCode": "12345",
  "countryRegionCode": "AE",
  "contact": "Ahmed Hassan",
  "phoneNo": "+971501234567",
  "isDefault": true,
  "blocked": false
}
```

---

### 17.2 Create Partner Location Link from Business Central
- **Method:** `POST`
- **URL:** `/api/partner-location-links/businesscentral`
- **Auth:** `protectRegister`
- **Body:** Same as 17.1

---

### 17.3 Get All Partner Location Links
- **Method:** `GET`
- **URL:** `/api/partner-location-links/`
- **Auth:** `Bearer <token>`

---

### 17.4 Get Links by Partner
- **Method:** `GET`
- **URL:** `/api/partner-location-links/partner/:partnerNo`
- **Example:** `/api/partner-location-links/partner/V-0001`

---

### 17.5 Get Default Link by Partner
- **Method:** `GET`
- **URL:** `/api/partner-location-links/partner/:partnerNo/default`

---

### 17.6 Get Partner Location Link by ID
- **Method:** `GET`
- **URL:** `/api/partner-location-links/:id`

---

### 17.7 Update Partner Location Link
- **Method:** `PUT`
- **URL:** `/api/partner-location-links/:id`
- **Body:** Same as create

---

### 17.8 Update Block Status
- **Method:** `PATCH`
- **URL:** `/api/partner-location-links/:id/block`
- **Auth:** `Bearer <token>` (`customer_admin`, `vendor_admin`, `super_admin`)
- **Body:**
```json
{
  "blocked": true
}
```

---

### 17.9 Update Default Status
- **Method:** `PATCH`
- **URL:** `/api/partner-location-links/:id/default`
- **Auth:** `Bearer <token>` (`customer_admin`, `vendor_admin`, `super_admin`)
- **Body:**
```json
{
  "isDefault": true
}
```

---

### 17.10 Delete Partner Location Link
- **Method:** `DELETE`
- **URL:** `/api/partner-location-links/:id`
- **Auth:** `Bearer <token>` (`customer_admin`, `vendor_admin`, `super_admin`)

---

## 18. Permission APIs

Base path: `/api/permissions`  
**Auth:** All routes protected. Most write routes require `super_admin`.

---

### 18.1 Get All Screens
- **Method:** `GET`
- **URL:** `/api/permissions/screens`
- **Auth:** `Bearer <token>`

---

### 18.2 Get My Permissions
- **Method:** `GET`
- **URL:** `/api/permissions/me`
- **Auth:** `Bearer <token>`

---

### 18.3 Check Permission
- **Method:** `GET`
- **URL:** `/api/permissions/check/:screenCode/:permissionType`
- **Auth:** `Bearer <token>`
- **Example:** `/api/permissions/check/ITEMS/can_read`

---

### 18.4 Sync Database Tables (Creates screens from DB)
- **Method:** `POST`
- **URL:** `/api/permissions/sync-tables`
- **Auth:** `Bearer <token>` (`super_admin` only)
- **Body:** None

---

### 18.5 Get Permissions by Role
- **Method:** `GET`
- **URL:** `/api/permissions/role/:role`
- **Auth:** `Bearer <token>` (`super_admin` only)
- **Example:** `/api/permissions/role/vendor`

---

### 18.6 Set Role Permissions
- **Method:** `POST`
- **URL:** `/api/permissions/role/:role`
- **Auth:** `Bearer <token>` (`super_admin` only)
- **Body:**
```json
{
  "screenId": 1,
  "canRead": true,
  "canWrite": true,
  "canModify": true,
  "canDelete": false
}
```

---

### 18.7 Bulk Set Role Permissions
- **Method:** `POST`
- **URL:** `/api/permissions/role/:role/bulk`
- **Auth:** `Bearer <token>` (`super_admin` only)
- **Body:**
```json
{
  "permissions": [
    { "screenId": 1, "canRead": true, "canWrite": true, "canModify": true, "canDelete": false },
    { "screenId": 2, "canRead": true, "canWrite": false, "canModify": false, "canDelete": false }
  ]
}
```

---

### 18.8 Get User Permissions
- **Method:** `GET`
- **URL:** `/api/permissions/user/:userId`
- **Auth:** `Bearer <token>` (`super_admin` only)

---

### 18.9 Set User Permissions (Override)
- **Method:** `POST`
- **URL:** `/api/permissions/user/:userId`
- **Auth:** `Bearer <token>` (`super_admin` only)
- **Body:**
```json
{
  "screenId": 1,
  "canRead": true,
  "canWrite": false,
  "canModify": false,
  "canDelete": false
}
```

---

### 18.10 Remove User Permission Override
- **Method:** `DELETE`
- **URL:** `/api/permissions/user/:userId/screen/:screenId`
- **Auth:** `Bearer <token>` (`super_admin` only)
- **Example:** `/api/permissions/user/2/screen/1`

---

## 19. Permission Group APIs

Base path: `/api/permission-groups`  
**Auth:** All routes protected. All write routes require `super_admin`.

---

### 19.1 Create Permission Group
- **Method:** `POST`
- **URL:** `/api/permission-groups/groups`
- **Auth:** `Bearer <token>` (`super_admin`)
- **Body:**
```json
{
  "groupName": "Vendor Read-Only",
  "description": "Can view all vendor data but cannot modify",
  "isActive": true
}
```

---

### 19.2 Get All Permission Groups
- **Method:** `GET`
- **URL:** `/api/permission-groups/groups`

---

### 19.3 Get Permission Group by ID
- **Method:** `GET`
- **URL:** `/api/permission-groups/groups/:groupId`

---

### 19.4 Update Permission Group
- **Method:** `PUT`
- **URL:** `/api/permission-groups/groups/:groupId`
- **Body:** Same as create

---

### 19.5 Delete Permission Group
- **Method:** `DELETE`
- **URL:** `/api/permission-groups/groups/:groupId`

---

### 19.6 Get Group Permissions
- **Method:** `GET`
- **URL:** `/api/permission-groups/groups/:groupId/permissions`

---

### 19.7 Set Group Permission
- **Method:** `POST`
- **URL:** `/api/permission-groups/groups/:groupId/permissions`
- **Body:**
```json
{
  "screenId": 1,
  "canRead": true,
  "canWrite": false,
  "canModify": false,
  "canDelete": false
}
```

---

### 19.8 Bulk Set Group Permissions
- **Method:** `POST`
- **URL:** `/api/permission-groups/groups/:groupId/permissions/bulk`
- **Body:**
```json
{
  "permissions": [
    { "screenId": 1, "canRead": true, "canWrite": true, "canModify": true, "canDelete": false },
    { "screenId": 2, "canRead": true, "canWrite": false, "canModify": false, "canDelete": false },
    { "screenId": 3, "canRead": true, "canWrite": false, "canModify": false, "canDelete": false }
  ]
}
```

---

### 19.9 Remove Group Permission
- **Method:** `DELETE`
- **URL:** `/api/permission-groups/groups/:groupId/permissions/:screenId`

---

### 19.10 Assign Group to User
- **Method:** `POST`
- **URL:** `/api/permission-groups/users/:userId/groups/:groupId`
- **Body:** None

---

### 19.11 Remove Group from User
- **Method:** `DELETE`
- **URL:** `/api/permission-groups/users/:userId/groups/:groupId`

---

### 19.12 Get User Groups
- **Method:** `GET`
- **URL:** `/api/permission-groups/users/:userId/groups`

---

### 19.13 Get User Effective Permissions
- **Method:** `GET`
- **URL:** `/api/permission-groups/users/:userId/effective-permissions`
- **Auth:** `Bearer <token>` (own user or super_admin)

---

### 19.14 Get Group Users
- **Method:** `GET`
- **URL:** `/api/permission-groups/groups/:groupId/users`

---

## 20. BC User Registration APIs

Base path: `/api/bc-user-registrations`

---

### 20.1 Create BC User Registration
- **Method:** `POST`
- **URL:** `/api/bc-user-registrations/`
- **Auth:** None (open registration endpoint)
- **Body (full payload with contact and bank lines):**
```json
{
  "partnerType": "Customer",
  "regType": "Create",
  "scope": "Current_x0020_Company",
  "status": "Draft",
  "partnerNo": "",
  "centralPartnerNo": "",
  "resultPartnerNo": "",
  "requesterUserId": "user-uuid-or-id",
  "businessJustification": "New partner onboarding from portal",
  "name": "ABC Trading LLC",
  "name2": "ABC Trading",
  "address": "Office 501, Tower B",
  "address2": "Business Bay",
  "city": "Dubai",
  "postCode": "12345",
  "countryRegionCode": "AE",
  "phoneNo": "+971501234567",
  "email": "contact@abctrading.ae",
  "vatRegistrationNo": "VAT100200300",
  "currencyCode": "AED",
  "paymentTermsCode": "NET30",
  "paymentMethodCode": "BANK",
  "partnerPostingGroup": "DOMESTIC",
  "genBusPostingGroup": "DOMESTIC",
  "vatBusPostingGroup": "DOMESTIC",
  "partnerEmail": "admin@abctrading.ae",
  "tradeName": "ABC Trading",
  "tradeLicenseNumber": "TL-2026-12345",
  "tradeLicenseExpiryDate": "2028-04-10",
  "companyRegNumber": "CR-2026-001",
  "entityType": "LLC",
  "countryOfIncorporation": "AE",
  "placeOfRegistration": "Dubai",
  "website": "https://abctrading.ae",
  "partnerCategory": "Tier-1",
  "partnerRegContactLines": [
    {
      "lineNo": 1,
      "fullName": "Mohammed Al Rashid",
      "designation": "CEO",
      "mobileNumber": "+971501234567",
      "emailAddress": "ceo@abctrading.ae"
    },
    {
      "lineNo": 2,
      "fullName": "Sarah Johnson",
      "designation": "Finance Manager",
      "mobileNumber": "+971509876543",
      "emailAddress": "finance@abctrading.ae"
    }
  ],
  "partnerRegBankLines": [
    {
      "lineNo": 1,
      "bankCode": "ENBD",
      "name": "Emirates NBD",
      "bankBranchNo": "001",
      "bankAccountNo": "1234567890123",
      "iban": "AE070331234567890123456",
      "swiftCode": "EBILAEAD",
      "currencyCode": "AED",
      "isPrimary": true
    },
    {
      "lineNo": 2,
      "bankCode": "FAB",
      "name": "First Abu Dhabi Bank",
      "bankBranchNo": "002",
      "bankAccountNo": "9876543210987",
      "iban": "AE070309876543210987654",
      "swiftCode": "NBADAEAA",
      "currencyCode": "USD",
      "isPrimary": false
    }
  ]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "BC User Registration created successfully",
  "data": {
    "id": 1,
    "name": "ABC Trading LLC",
    "status": "Draft",
    "partnerRegContactLines": [...],
    "partnerRegBankLines": [...]
  }
}
```

---

### 20.2 Get All BC User Registrations
- **Method:** `GET`
- **URL:** `/api/bc-user-registrations/`
- **Auth:** `Bearer <token>` + `canRead("BC_USER_REGISTRATIONS")`

---

### 20.3 Get BC User Registration by ID
- **Method:** `GET`
- **URL:** `/api/bc-user-registrations/:id`
- **Auth:** `Bearer <token>` + `canRead("BC_USER_REGISTRATIONS")`

---

### 20.4 Update BC User Registration Status
- **Method:** `PATCH`
- **URL:** `/api/bc-user-registrations/:id/status`
- **Auth:** `Bearer <token>` + `canModify("BC_USER_REGISTRATIONS")`
- **Body:**
```json
{
  "status": "Submitted"
}
```

**Valid status values:** `Draft`, `Submitted`, `Approved`, `Rejected`

---

### 20.5 Delete BC User Registration
- **Method:** `DELETE`
- **URL:** `/api/bc-user-registrations/:id`
- **Auth:** `Bearer <token>` + `canDelete("BC_USER_REGISTRATIONS")`

---

## 21. Bugs Found & Fixes Applied

### Bug 1 — Register: Token Generated Before DB Save (FIXED)

**File:** [controllers/Customer.controller.js](../controllers/Customer.controller.js)  
**Severity:** Critical  

**Problem (original code):**
```js
// ❌ Token was generated BEFORE user was saved to DB
const token = generateToken({
  name: req.body.name,    // no user.id available
  email: req.body.email,
  refNo: refNo || null,
  role: role,
});
// ... then user was created
const user = await User.create(...);
```

**Symptoms:**
- Access token payload was missing `id` field — all subsequent authenticated requests would fail because `req.user.id` was `undefined`
- No `refreshToken` was being generated or returned — frontend had no way to refresh sessions

**Fix applied:**
```js
// ✅ User saved FIRST, then token generated with real user.id
const user = await User.create({ ...req.body, password: hashedPassword }, role);

const token = generateToken({
  id: user.id,          // ← now correct
  name: user.name,
  email: user.email || null,
  refNo: user.ref_no || null,
  role: user.role,
});

const refreshToken = await generateRefreshToken(user.id);

return res.status(201).json({
  success: true,
  token,
  refreshToken,         // ← now returned
  data: userWithoutPassword,
});
```

---

### Known Issue — No Series Routes Have No Auth

**File:** [routes/NoSeries.route.js](../routes/NoSeries.route.js)  
**Severity:** Medium  

No authentication middleware is applied to any No Series route. This means any unauthenticated client can read, create, modify, or reset number series.

**Recommendation:** Add `protect` middleware to at minimum the write operations:
```js
router.post("/",              protect, isSuperAdmin, NoSeriesController.create);
router.put("/:id",            protect, isSuperAdmin, NoSeriesController.update);
router.patch("/:id/next-number", protect, NoSeriesController.getNextNumber);
router.patch("/:id/reset",    protect, isSuperAdmin, NoSeriesController.reset);
router.delete("/:id",         protect, isSuperAdmin, NoSeriesController.delete);
```

---

## Quick Reference — All Endpoints

| # | Method | Path | Auth | Role |
|---|--------|------|------|------|
| 1 | POST | /api/auth/get-register-token | None | - |
| 2 | POST | /api/auth/login | None | - |
| 3 | POST | /api/auth/create-super-admin | None | - |
| 4 | POST | /api/auth/verify-token | Bearer | Any |
| 5 | POST | /api/auth/refresh-token | None | - |
| 6 | POST | /api/auth/logout | Bearer | Any |
| 7 | POST | /api/auth/change-password | Bearer | Any |
| 8 | POST | /api/users/register | None | - |
| 9 | GET | /api/users/ | Bearer | canRead(USERS) |
| 10 | GET | /api/users/me | Bearer | Any |
| 11 | GET | /api/users/:id | Bearer | canRead(USERS) |
| 12 | PUT | /api/users/:id | Bearer | canModify(USERS) |
| 13 | DELETE | /api/users/:id | Bearer | super_admin |
| 14 | GET | /api/contact/ | Bearer | canRead(CONTACTS) |
| 15 | GET | /api/contact/partner/:partnerNo | Bearer | canRead(CONTACTS) |
| 16 | GET | /api/contact/:id | Bearer | canRead(CONTACTS) |
| 17 | POST | /api/contact/ | Bearer | canWrite(CONTACTS) |
| 18 | POST | /api/contact/businesscentral | Register | - |
| 19 | PUT | /api/contact/:id | Bearer | canModify(CONTACTS) |
| 20 | PATCH | /api/contact/:id/sync | Bearer | canModify(CONTACTS) |
| 21 | PATCH | /api/contact/:id/portal | Bearer | canModify(CONTACTS) |
| 22 | DELETE | /api/contact/:id | Bearer | canDelete(CONTACTS) |
| 23 | POST | /api/invoices/ | Bearer | all roles |
| 24 | POST | /api/invoices/businesscentral | Register | - |
| 25 | GET | /api/invoices/ | Bearer | all roles |
| 26 | GET | /api/invoices/partner/:partnerNo | Bearer | all roles |
| 27 | GET | /api/invoices/no/:invoiceNo | Bearer | all roles |
| 28 | GET | /api/invoices/:id | Bearer | all roles |
| 29 | PUT | /api/invoices/:id | Bearer | all roles |
| 30 | PATCH | /api/invoices/:id/status | Bearer | admin roles |
| 31 | DELETE | /api/invoices/:id | Bearer | admin roles |
| 32 | POST | /api/purchase-invoices/ | Bearer | vendor roles |
| 33 | POST | /api/purchase-invoices/businesscentral | Register | - |
| 34 | GET | /api/purchase-invoices/ | Bearer | vendor roles |
| 35 | GET | /api/purchase-invoices/partner/:partnerNo | Bearer | vendor roles |
| 36 | GET | /api/purchase-invoices/no/:invoiceNo | Bearer | vendor roles |
| 37 | GET | /api/purchase-invoices/:id | Bearer | vendor roles |
| 38 | PUT | /api/purchase-invoices/:id | Bearer | vendor roles |
| 39 | PATCH | /api/purchase-invoices/:id/status | Bearer | vendor admin |
| 40 | DELETE | /api/purchase-invoices/:id | Bearer | vendor admin |
| 41 | GET | /api/purchase-orders/ | Bearer | canRead(PO) |
| 42 | GET | /api/purchase-orders/partner/:partnerNo | Bearer | canRead(PO) |
| 43 | GET | /api/purchase-orders/items/:partnerNo | Bearer | canRead(PO) |
| 44 | GET | /api/purchase-orders/items/:partnerNo/:batchNo | Bearer | canRead(PO) |
| 45 | GET | /api/purchase-orders/locations | Bearer | canRead(PO) |
| 46 | GET | /api/purchase-orders/:id | Bearer | canRead(PO) |
| 47 | POST | /api/purchase-orders/ | Bearer | canWrite(PO) |
| 48 | POST | /api/purchase-orders/businesscentral | Register | - |
| 49 | PUT | /api/purchase-orders/:id | Bearer | canModify(PO) |
| 50 | PATCH | /api/purchase-orders/:id/status | Bearer | canModify(PO) |
| 51 | DELETE | /api/purchase-orders/:id | Bearer | canDelete(PO) |
| 52 | GET | /api/sales-orders/ | Bearer | canRead(SO) |
| 53 | GET | /api/sales-orders/partner/:partnerNo | Bearer | canRead(SO) |
| 54 | GET | /api/sales-orders/:id | Bearer | canRead(SO) |
| 55 | POST | /api/sales-orders/ | Bearer | canWrite(SO) |
| 56 | POST | /api/sales-orders/businesscentral | Register | - |
| 57 | PUT | /api/sales-orders/:id | Bearer | canModify(SO) |
| 58 | PATCH | /api/sales-orders/:id/status | Bearer | canModify(SO) |
| 59 | DELETE | /api/sales-orders/:id | Bearer | canDelete(SO) |
| 60 | POST | /api/purchase-receipts/ | Bearer | vendor roles |
| 61 | POST | /api/purchase-receipts/businesscentral | Register | - |
| 62 | GET | /api/purchase-receipts/ | Bearer | vendor roles |
| 63 | GET | /api/purchase-receipts/partner/:partnerNo | Bearer | vendor roles |
| 64 | GET | /api/purchase-receipts/no/:shipmentNo | Bearer | vendor roles |
| 65 | GET | /api/purchase-receipts/:id | Bearer | vendor roles |
| 66 | PUT | /api/purchase-receipts/:id | Bearer | vendor roles |
| 67 | PATCH | /api/purchase-receipts/:id/status | Bearer | vendor admin |
| 68 | DELETE | /api/purchase-receipts/:id | Bearer | vendor admin |
| 69 | GET | /api/sales-shipments/ | Bearer | canRead(SS) |
| 70 | GET | /api/sales-shipments/:id | Bearer | canRead(SS) |
| 71 | GET | /api/sales-shipments/portal/:portalDocumentNo | Bearer | canRead(SS) |
| 72 | POST | /api/sales-shipments/ | Bearer | canWrite(SS) |
| 73 | POST | /api/sales-shipments/businesscentral | Register | - |
| 74 | PATCH | /api/sales-shipments/:id/status | Bearer | canModify(SS) |
| 75 | DELETE | /api/sales-shipments/:id | Bearer | canDelete(SS) |
| 76 | GET | /api/vendor/item/import/template | Bearer | canRead(ITEMS) |
| 77 | GET | /api/vendor/item/ | Bearer | canRead(ITEMS) |
| 78 | GET | /api/vendor/item/partner/:partnerNo | Bearer | canRead(ITEMS) |
| 79 | GET | /api/vendor/item/portal/:partnerPortalNo | Bearer | canRead(ITEMS) |
| 80 | GET | /api/vendor/item/key/:pPN/:pN/:bN | Bearer | canRead(ITEMS) |
| 81 | GET | /api/vendor/item/unit-of-measures | Bearer | canRead(ITEMS) |
| 82 | GET | /api/vendor/item/:id | Bearer | canRead(ITEMS) |
| 83 | POST | /api/vendor/item/import | Bearer | canWrite(ITEMS) |
| 84 | POST | /api/vendor/item/ | Bearer | canWrite(ITEMS) |
| 85 | POST | /api/vendor/item/businesscentral | Register | - |
| 86 | POST | /api/vendor/item/price-change | Bearer | canWrite(ITEMS) |
| 87 | POST | /api/vendor/item/change-request | Bearer | canWrite(ITEMS) |
| 88 | PUT | /api/vendor/item/:id | Bearer | canModify(ITEMS) |
| 89 | PATCH | /api/vendor/item/:id/status | Bearer | canModify(ITEMS) |
| 90 | PATCH | /api/vendor/item/:id/block | Bearer | canModify(ITEMS) |
| 91 | DELETE | /api/vendor/item/:id | Bearer | canDelete(ITEMS) |
| 92 | GET | /api/item-categories/ | Bearer | vendor roles |
| 93 | POST | /api/item-categories/sync | Bearer | vendor_admin, super_admin |
| 94 | POST | /api/vat-master/ | Bearer | Any |
| 95 | GET | /api/vat-master/ | Bearer | Any |
| 96 | GET | /api/vat-master/code/:vatCode | Bearer | Any |
| 97 | GET | /api/vat-master/:id | Bearer | Any |
| 98 | PUT | /api/vat-master/:id | Bearer | Any |
| 99 | PATCH | /api/vat-master/:id/status | Bearer | Any |
| 100 | DELETE | /api/vat-master/:id | Bearer | Any |
| 101 | GET | /api/no-series/code/:code | None | - |
| 102 | GET | /api/no-series/getall | None | - |
| 103 | POST | /api/no-series/ | None | - |
| 104 | GET | /api/no-series/:id | None | - |
| 105 | PUT | /api/no-series/:id | None | - |
| 106 | PATCH | /api/no-series/:id/next-number | None | - |
| 107 | PATCH | /api/no-series/:id/reset | None | - |
| 108 | DELETE | /api/no-series/:id | None | - |
| 109 | GET | /api/purchase-prices/ | Bearer | vendor roles |
| 110 | GET | /api/purchase-prices/:id | Bearer | vendor roles |
| 111 | POST | /api/purchase-prices/ | Bearer | vendor roles |
| 112 | PUT | /api/purchase-prices/:id | Bearer | vendor roles |
| 113 | DELETE | /api/purchase-prices/:id | Bearer | vendor roles |
| 114 | GET | /api/payments/ | Bearer | vendor roles |
| 115 | GET | /api/payments/partner/:partnerNo | Bearer | vendor roles |
| 116 | GET | /api/payments/:id | Bearer | vendor roles |
| 117 | POST | /api/payments/ | Bearer | vendor_admin, super_admin |
| 118 | PUT | /api/payments/:id | Bearer | vendor_admin, super_admin |
| 119 | PATCH | /api/payments/:id/status | Bearer | vendor_admin, super_admin |
| 120 | DELETE | /api/payments/:id | Bearer | super_admin |
| 121 | GET | /api/unit-of-measures/ | Bearer | vendor roles |
| 122 | GET | /api/unit-of-measures/:id | Bearer | vendor roles |
| 123 | POST | /api/unit-of-measures/ | Bearer | vendor_admin, super_admin |
| 124 | PUT | /api/unit-of-measures/:id | Bearer | vendor_admin, super_admin |
| 125 | DELETE | /api/unit-of-measures/:id | Bearer | super_admin |
| 126 | POST | /api/partner-location-links/ | Bearer | all roles |
| 127 | POST | /api/partner-location-links/businesscentral | Register | - |
| 128 | GET | /api/partner-location-links/ | Bearer | all roles |
| 129 | GET | /api/partner-location-links/partner/:partnerNo | Bearer | all roles |
| 130 | GET | /api/partner-location-links/partner/:partnerNo/default | Bearer | all roles |
| 131 | GET | /api/partner-location-links/:id | Bearer | all roles |
| 132 | PUT | /api/partner-location-links/:id | Bearer | all roles |
| 133 | PATCH | /api/partner-location-links/:id/block | Bearer | admin roles |
| 134 | PATCH | /api/partner-location-links/:id/default | Bearer | admin roles |
| 135 | DELETE | /api/partner-location-links/:id | Bearer | admin roles |
| 136 | GET | /api/permissions/screens | Bearer | Any |
| 137 | GET | /api/permissions/me | Bearer | Any |
| 138 | GET | /api/permissions/check/:screen/:type | Bearer | Any |
| 139 | POST | /api/permissions/sync-tables | Bearer | super_admin |
| 140 | GET | /api/permissions/role/:role | Bearer | super_admin |
| 141 | POST | /api/permissions/role/:role | Bearer | super_admin |
| 142 | POST | /api/permissions/role/:role/bulk | Bearer | super_admin |
| 143 | GET | /api/permissions/user/:userId | Bearer | super_admin |
| 144 | POST | /api/permissions/user/:userId | Bearer | super_admin |
| 145 | DELETE | /api/permissions/user/:userId/screen/:screenId | Bearer | super_admin |
| 146 | GET | /api/permission-groups/groups | Bearer | super_admin |
| 147 | POST | /api/permission-groups/groups | Bearer | super_admin |
| 148 | GET | /api/permission-groups/groups/:groupId | Bearer | super_admin |
| 149 | PUT | /api/permission-groups/groups/:groupId | Bearer | super_admin |
| 150 | DELETE | /api/permission-groups/groups/:groupId | Bearer | super_admin |
| 151 | GET | /api/permission-groups/groups/:groupId/permissions | Bearer | super_admin |
| 152 | POST | /api/permission-groups/groups/:groupId/permissions | Bearer | super_admin |
| 153 | POST | /api/permission-groups/groups/:groupId/permissions/bulk | Bearer | super_admin |
| 154 | DELETE | /api/permission-groups/groups/:groupId/permissions/:screenId | Bearer | super_admin |
| 155 | POST | /api/permission-groups/users/:userId/groups/:groupId | Bearer | super_admin |
| 156 | DELETE | /api/permission-groups/users/:userId/groups/:groupId | Bearer | super_admin |
| 157 | GET | /api/permission-groups/users/:userId/groups | Bearer | super_admin |
| 158 | GET | /api/permission-groups/users/:userId/effective-permissions | Bearer | Any |
| 159 | GET | /api/permission-groups/groups/:groupId/users | Bearer | super_admin |
| 160 | GET | /api/bc-user-registrations/ | Bearer | canRead(BC_USER_REGISTRATIONS) |
| 161 | GET | /api/bc-user-registrations/:id | Bearer | canRead(BC_USER_REGISTRATIONS) |
| 162 | POST | /api/bc-user-registrations/ | None | - |
| 163 | PATCH | /api/bc-user-registrations/:id/status | Bearer | canModify(BC_USER_REGISTRATIONS) |
| 164 | DELETE | /api/bc-user-registrations/:id | Bearer | canDelete(BC_USER_REGISTRATIONS) |

**Total Endpoints: 164**
