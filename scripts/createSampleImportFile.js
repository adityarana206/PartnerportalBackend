const fs = require("fs");
const path = require("path");

// Create sample CSV file for testing
const csvContent = `partner_portal_no,partner_no,batch_no,variant_code,item_name,description,item_category_code,base_unit_of_measure,net_weight,gross_weight,specifications,ingredients,allergen_declaration,shelf_life_days,gtin,ean_code,unit_price,price_currency_code,block,status,rejection_reason
PORTAL000028,CUST001,BATCH-TEST-001,,Test Coffee Product,Premium coffee beans,COFFEE,KG,1.5,1.6,Premium quality coffee,100% Arabica beans,None,365,1234567890001,1234567890001,45.00,AED,false,Created,
PORTAL000029,CUST002,BATCH-TEST-002,,Test Tea Product,Organic green tea,TEA,KG,0.5,0.55,Organic certified,Green tea leaves,None,730,1234567890002,1234567890002,35.00,AED,false,Created,
PORTAL000030,CUST003,BATCH-TEST-003,,Test Spices Product,Mixed spices blend,SPICES,KG,0.25,0.28,Authentic blend,Cumin Coriander Turmeric,May contain traces of nuts,180,1234567890003,1234567890003,25.00,AED,false,Created,`;

const outputPath = path.join(__dirname, "sample_items_import.csv");
fs.writeFileSync(outputPath, csvContent);

console.log("✅ Sample CSV file created at:", outputPath);
console.log("\nYou can use this file to test the import API:");
console.log("curl -X POST http://localhost:3000/api/items/import \\");
console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
console.log(`  -F "file=@${outputPath}"`);
