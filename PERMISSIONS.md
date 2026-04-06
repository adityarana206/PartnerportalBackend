# Permission System Documentation

## Setup Complete ✅

The permission system is already set up and running. All routes have been updated to use the new permission middleware.

## How It Works

### For Users
- Each user has permissions based on their **role**
- Super admin can override permissions for specific users
- Permissions control: **Read**, **Write**, **Modify**, **Delete**

### For Developers
Routes now use simple permission checks:
```javascript
router.get("/", protect, canRead("ITEMS"), getAllItems);
router.post("/", protect, canWrite("ITEMS"), createItem);
router.put("/:id", protect, canModify("ITEMS"), updateItem);
router.delete("/:id", protect, canDelete("ITEMS"), deleteItem);
```

## API Endpoints

### Get My Permissions
```
GET /api/permissions/me
Authorization: Bearer {token}
```

### Get All Screens
```
GET /api/permissions/screens
Authorization: Bearer {token}
```

### Set User Permission (Super Admin Only)
```
POST /api/permissions/user/{userId}
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "screen_id": 2,
  "can_read": true,
  "can_write": true,
  "can_modify": false,
  "can_delete": false
}
```

### Get User Permissions (Super Admin Only)
```
GET /api/permissions/user/{userId}
Authorization: Bearer {super_admin_token}
```

## Available Screens

| ID | Screen Name | Code |
|----|-------------|------|
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
| 13 | Partner Locations | PARTNER_LOCATIONS |
| 14 | No Series | NO_SERIES |
| 15 | VAT Master | VAT_MASTER |

## Permission Types

- **can_read**: View/List data (GET requests)
- **can_write**: Create new records (POST requests)
- **can_modify**: Update existing records (PUT/PATCH requests)
- **can_delete**: Delete records (DELETE requests)

## Visual Manager

Open `docs/permission-manager.html` in your browser to manage permissions visually.

## Default Role Permissions

### super_admin
- Full access to all screens

### vendor_admin
- Full access to vendor-related screens
- Read-only on system configurations

### vendor
- Read/Write on Items
- Read-only on orders and invoices

### customer_admin
- Full access to customer-related screens
- Read-only on items

### customer
- Read/Write on Sales Orders
- Read-only on items and invoices

### company_admin
- Full access to all screens (except delete on critical data)

## Example: Set User Permission

```bash
curl -X POST http://localhost:3000/api/permissions/user/5 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "screen_id": 2,
    "can_read": true,
    "can_write": true,
    "can_modify": true,
    "can_delete": false
  }'
```

## Notes

- Super admin always has full access (bypasses all checks)
- User-specific permissions override role permissions
- If no user permission is set, role permission applies
- All existing routes have been updated to use the new system
