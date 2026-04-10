# Item Import API Documentation

## Import Items from CSV/Excel

### Endpoint
`POST /api/items/import`

### Description
Import multiple items from a CSV or Excel file. This endpoint is designed for Super Admin to bulk import item data.

### Authentication
- Requires authentication token
- Requires WRITE permission for ITEMS

### Request
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: 
  - `file`: CSV or Excel file (required)

### File Format Requirements

#### Supported Formats
- CSV (.csv)
- Excel (.xlsx, .xls)

#### Required Columns
- `partner_portal_no` - Partner portal number
- `partner_no` - Partner number (must exist in users table)
- `batch_no` - Batch number (must be unique)
- `item_name` - Item name

#### Optional Columns (All Available)
- `variant_code` - Variant code
- `description` - Item description
- `item_category_code` - Item category code
- `base_unit_of_measure` - Base unit of measure
- `net_weight` - Net weight
- `gross_weight` - Gross weight
- `specifications` - Product specifications
- `ingredients` - Product ingredients
- `allergen_declaration` - Allergen declaration
- `shelf_life_days` - Shelf life in days
- `gtin` - GTIN code
- `ean_code` - EAN code
- `unit_price` - Unit price
- `price_currency_code` - Price currency code
- `block` - Block status (true/false)
- `status` - Item status (default: "Created")
- `rejection_reason` - Rejection reason

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Import completed. 10 items imported successfully, 2 failed",
  "data": {
    "total": 12,
    "success": 10,
    "failed": 2,
    "errors": [
      {
        "row": 5,
        "error": "Partner number 'CUST999' does not exist",
        "data": { ... }
      },
      {
        "row": 8,
        "error": "Item with this key already exists",
        "data": { ... }
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request** - No file uploaded
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**400 Bad Request** - Invalid file format
```json
{
  "success": false,
  "message": "Invalid file format. Only CSV and Excel files are supported"
}
```

**400 Bad Request** - No data in file
```json
{
  "success": false,
  "message": "No data found in the file"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Download Import Template

### Endpoint
`GET /api/items/import/template`

### Description
Download a sample template file for importing items. The template includes all required and optional columns with sample data.

### Authentication
- Requires authentication token
- Requires READ permission for ITEMS

### Request
- **Method**: GET
- **Query Parameters**:
  - `format` (optional): File format - "csv" or "xlsx" (default: "csv")

### Response
- Returns a downloadable file (CSV or Excel) with sample data

### Example Usage

#### Download CSV Template
```
GET /api/items/import/template?format=csv
```

#### Download Excel Template
```
GET /api/items/import/template?format=xlsx
```

---

## Usage Example with cURL

### Import Items
```bash
curl -X POST http://localhost:3000/api/items/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@items.csv"
```

### Download Template
```bash
curl -X GET "http://localhost:3000/api/items/import/template?format=xlsx" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o items_template.xlsx
```

---

## Validation Rules

1. **Partner Number**: Must exist in the users table
2. **Unique Key**: Combination of (partnerPortalNo, partnerNo, batchNo) must be unique
3. **File Size**: Maximum 5MB
4. **File Type**: Only CSV and Excel files allowed

---

## Error Handling

The import process validates each row individually. If a row fails validation:
- The error is logged in the response
- Other valid rows continue to be processed
- The final response includes a summary of successes and failures

---

## Best Practices

1. Download the template first to ensure correct column names
2. Validate partner numbers exist before importing
3. Ensure batch numbers are unique
4. Keep file size under 5MB for optimal performance
5. Review the error report after import to fix failed rows
