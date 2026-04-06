# Quick Start Guide

## ✅ System is Ready!

The permission system is already set up and running. Here's what you need to know:

## 1. Test the API (2 minutes)

### Login as Super Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'
```
Copy the `token` from response.

### Get Your Permissions
```bash
curl -X GET http://localhost:3000/api/permissions/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Screens
```bash
curl -X GET http://localhost:3000/api/permissions/screens \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 2. Set User Permission (Super Admin Only)

```bash
curl -X POST http://localhost:3000/api/permissions/user/5 \
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

## 3. Use Visual Manager

Open `docs/permission-manager.html` in your browser:
1. Enter your super admin token
2. Enter user ID
3. Click "Load User Permissions"
4. Check/uncheck permissions
5. Click "Update"

## 4. Frontend Integration

### Step 1: Fetch on Login
```javascript
const response = await fetch('/api/permissions/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const permissions = await response.json();
// Store in state
```

### Step 2: Use in Components
```javascript
const screen = permissions.data.find(p => p.screen_code === 'ITEMS');

{screen?.can_write && <button>Create</button>}
{screen?.can_modify && <button>Edit</button>}
{screen?.can_delete && <button>Delete</button>}
```

## Screen IDs Quick Reference

| ID | Code | Name |
|----|------|------|
| 1 | USERS | Users Management |
| 2 | ITEMS | Items Management |
| 3 | CONTACTS | Contacts Management |
| 4 | PURCHASE_ORDERS | Purchase Orders |
| 5 | SALES_ORDERS | Sales Orders |
| 6 | INVOICES | Invoices |
| 7 | PURCHASE_INVOICES | Purchase Invoices |
| 8 | PURCHASE_RECEIPTS | Purchase Receipts |
| 9 | PURCHASE_PRICES | Purchase Prices |
| 10 | ITEM_CATEGORIES | Item Categories |
| 11 | PAYMENTS | Payments |
| 12 | UNIT_OF_MEASURES | Unit of Measures |
| 13 | PARTNER_LOCATIONS | Partner Locations |
| 14 | NO_SERIES | No Series |
| 15 | VAT_MASTER | VAT Master |

## Permission Examples

### Read Only
```json
{"screen_id": 2, "can_read": true, "can_write": false, "can_modify": false, "can_delete": false}
```

### Read + Create
```json
{"screen_id": 2, "can_read": true, "can_write": true, "can_modify": false, "can_delete": false}
```

### Full Access
```json
{"screen_id": 2, "can_read": true, "can_write": true, "can_modify": true, "can_delete": true}
```

## Documentation

- **API Reference**: `PERMISSIONS.md`
- **Frontend Guide**: `docs/FRONTEND_INTEGRATION.md`
- **User Guide**: `docs/USER_PERMISSION_GUIDE.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

## Important Notes

✅ Super admin bypasses all permission checks
✅ User permissions override role permissions
✅ All routes are already updated
✅ System is production-ready
