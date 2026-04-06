# User Permission Management Guide

## How to Set Permissions for a User

### Step 1: Get All Screens
**Endpoint:** `GET /api/permissions/screens`

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "screen_name": "Users Management", "screen_code": "USERS" },
    { "id": 2, "screen_name": "Items Management", "screen_code": "ITEMS" },
    { "id": 3, "screen_name": "Contacts Management", "screen_code": "CONTACTS" },
    ...
  ]
}
```

### Step 2: Set User Permissions
**Endpoint:** `POST /api/permissions/user/{userId}`

**Request Body:**
```json
{
  "screen_id": 2,
  "can_read": true,
  "can_write": true,
  "can_modify": false,
  "can_delete": false
}
```

### Step 3: View User's Permissions
**Endpoint:** `GET /api/permissions/user/{userId}`

**Response:**
```json
{
  "success": true,
  "userId": "1",
  "data": [
    {
      "id": 1,
      "screen_name": "Users Management",
      "screen_code": "USERS",
      "can_read": true,
      "can_write": false,
      "can_modify": false,
      "can_delete": false,
      "has_override": false
    },
    {
      "id": 2,
      "screen_name": "Items Management",
      "screen_code": "ITEMS",
      "can_read": true,
      "can_write": true,
      "can_modify": false,
      "can_delete": false,
      "has_override": true
    }
  ]
}
```

## Permission Types Explained

| Permission | What it Controls | HTTP Methods |
|------------|------------------|--------------|
| **can_read** | View/List data | GET |
| **can_write** | Create new records | POST |
| **can_modify** | Update existing records | PUT, PATCH |
| **can_delete** | Delete records | DELETE |

## Example Scenarios

### Scenario 1: User can only view items
```json
{
  "screen_id": 2,
  "can_read": true,
  "can_write": false,
  "can_modify": false,
  "can_delete": false
}
```

### Scenario 2: User can view and create items
```json
{
  "screen_id": 2,
  "can_read": true,
  "can_write": true,
  "can_modify": false,
  "can_delete": false
}
```

### Scenario 3: User can view, create, and edit items
```json
{
  "screen_id": 2,
  "can_read": true,
  "can_write": true,
  "can_modify": true,
  "can_delete": false
}
```

### Scenario 4: User has full access to items
```json
{
  "screen_id": 2,
  "can_read": true,
  "can_write": true,
  "can_modify": true,
  "can_delete": true
}
```

## All Available Screens

| Screen ID | Screen Name | Screen Code |
|-----------|-------------|-------------|
| 1 | Users Management | USERS |
| 2 | Items Management | ITEMS |
| 3 | Contacts Management | CONTACTS |
| 4 | Purchase Orders | PURCHASE_ORDERS |
| 5 | Sales Orders | SALES_ORDERS |
| 6 | Invoices | INVOICES |
| 7 | Purchase Invoices | PURCHASE_INVOICES |
| 8 | Purchase Receipts | PURCHASE_RECEIPTS |
| 9 | Purchase Prices | PURCHASE_PRICES |
| 10 | Item Categories | ITEM_CATEGORIES |
| 11 | Payments | PAYMENTS |
| 12 | Unit of Measures | UNIT_OF_MEASURES |
| 13 | Partner Location Links | PARTNER_LOCATIONS |
| 14 | No Series | NO_SERIES |
| 15 | VAT Master | VAT_MASTER |

## Quick Commands (Using curl)

### Get all screens
```bash
curl -X GET http://localhost:3000/api/permissions/screens \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Set user permission
```bash
curl -X POST http://localhost:3000/api/permissions/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "screen_id": 2,
    "can_read": true,
    "can_write": true,
    "can_modify": false,
    "can_delete": false
  }'
```

### Get user permissions
```bash
curl -X GET http://localhost:3000/api/permissions/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- Only **super_admin** can set user permissions
- User-specific permissions **override** role permissions
- If no user-specific permission is set, role permission applies
- Super admin always has full access (bypasses all checks)
