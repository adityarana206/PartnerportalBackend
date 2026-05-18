const { pool } = require("../config/db");

const Item = {
  async create(data, userId) {
    const query = `
      INSERT INTO item_requests (
        partner_portal_no, partner_no, batch_no, variant_code,
        item_name, description, item_category_code,
        base_unit_of_measure, net_weight, gross_weight, specifications,
        ingredients, allergen_declaration, shelf_life_days, gtin,
        ean_code, vendor_item_no, gen_prod_posting_group, vat_prod_posting_group,
        unit_price, price_currency_code,
        block, status, rejection_reason, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      ) RETURNING *;
    `;
    const values = [
      data.partnerPortalNo, // $1  partner_portal_no
      data.partnerNo, // $2  partner_no
      data.batchNo, // $3  batch_no
      data.variantCode || null, // $4  variant_code
      data.itemName, // $5  item_name
      data.description || null, // $6  description
      data.itemCategoryCode || null, // $7  item_category_code
      data.baseUnitOfMeasure || null, // $8  base_unit_of_measure
      data.netWeight || null, // $9  net_weight
      data.grossWeight || null, // $10 gross_weight
      data.specifications || null, // $11 specifications
      data.ingredients || null, // $12 ingredients
      data.allergenDeclaration || null, // $13 allergen_declaration
      data.shelfLifeDays || null, // $14 shelf_life_days
      data.gtin || null, // $15 gtin
      data.eanCode || null, // $16 ean_code
      data.vendorItemNo || null, // $17 vendor_item_no
      data.genProdPostingGroup || null, // $18 gen_prod_posting_group
      data.vatProdPostingGroup || null, // $19 vat_prod_posting_group
      data.unitPrice || null, // $20 unit_price
      data.priceCurrencyCode || null, // $21 price_currency_code
      data.block || false, // $22 block
      data.status || "Created", // $23 status
      data.rejectionReason || null, // $24 rejection_reason
      userId || null, // $25 created_by
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM item_requests ORDER BY created_at DESC",
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  async findByKey(partnerPortalNo, partnerNo, batchNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE partner_portal_no = $1 AND partner_no = $2 AND batch_no = $3",
      [partnerPortalNo, partnerNo, batchNo],
    );
    return result.rows[0] || null;
  },

  async findByPartnerPortalNo(partnerPortalNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE partner_portal_no = $1 ORDER BY created_at DESC",
      [partnerPortalNo],
    );
    return result.rows;
  },

  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo],
    );
    return result.rows;
  },

  async findByBatchNo(batchNo) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE batch_no = $1",
      [batchNo],
    );
    return result.rows[0] || null;
  },

  async checkPartnerExists(partnerNo) {
    const result = await pool.query(
      "SELECT 1 FROM users WHERE ref_no = $1",
      [partnerNo],
    );
    return result.rows.length > 0;
  },

  async findByStatus(status) {
    const result = await pool.query(
      "SELECT * FROM item_requests WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );
    return result.rows;
  },

  async update(id, data) {
    const query = `
      UPDATE item_requests SET
        variant_code=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, net_weight=$6, gross_weight=$7,
        specifications=$8, ingredients=$9, allergen_declaration=$10,
        shelf_life_days=$11, gtin=$12, ean_code=$13,
        vendor_item_no=$14, gen_prod_posting_group=$15, vat_prod_posting_group=$16,
        unit_price=$17, price_currency_code=$18, block=$19,
        status=$20, rejection_reason=$21, updated_at=NOW()
      WHERE id=$22 RETURNING *;
    `;
    const values = [
      data.variantCode || null, // $1  variant_code
      data.itemName, // $2  item_name
      data.description || null, // $3  description
      data.itemCategoryCode || null, // $4  item_category_code
      data.baseUnitOfMeasure || null, // $5  base_unit_of_measure
      data.netWeight || null, // $6  net_weight
      data.grossWeight || null, // $7  gross_weight
      data.specifications || null, // $8  specifications
      data.ingredients || null, // $9  ingredients
      data.allergenDeclaration || null, // $10 allergen_declaration
      data.shelfLifeDays || null, // $11 shelf_life_days
      data.gtin || null, // $12 gtin
      data.eanCode || null, // $13 ean_code
      data.vendorItemNo || null, // $14 vendor_item_no
      data.genProdPostingGroup || null, // $15 gen_prod_posting_group
      data.vatProdPostingGroup || null, // $16 vat_prod_posting_group
      data.unitPrice || null, // $17 unit_price
      data.priceCurrencyCode || null, // $18 price_currency_code
      data.block || false, // $19 block
      data.status || "Created", // $20 status
      data.rejectionReason || null, // $21 rejection_reason
      id, // $22 id
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateByKey(partnerPortalNo, partnerNo, batchNo, data) {
    const query = `
      UPDATE item_requests SET
        variant_code=$1, item_name=$2, description=$3, item_category_code=$4,
        base_unit_of_measure=$5, net_weight=$6, gross_weight=$7,
        specifications=$8, ingredients=$9, allergen_declaration=$10,
        shelf_life_days=$11, gtin=$12, ean_code=$13,
        vendor_item_no=$14, gen_prod_posting_group=$15, vat_prod_posting_group=$16,
        unit_price=$17, price_currency_code=$18, block=$19,
        status=$20, rejection_reason=$21, updated_at=NOW()
      WHERE partner_portal_no=$22 AND partner_no=$23 AND batch_no=$24 RETURNING *;
    `;
    const values = [
      data.variantCode || null,
      data.itemName,
      data.description || null,
      data.itemCategoryCode || null,
      data.baseUnitOfMeasure || null,
      data.netWeight || null,
      data.grossWeight || null,
      data.specifications || null,
      data.ingredients || null,
      data.allergenDeclaration || null,
      data.shelfLifeDays || null,
      data.gtin || null,
      data.eanCode || null,
      data.vendorItemNo || null,
      data.genProdPostingGroup || null,
      data.vatProdPostingGroup || null,
      data.unitPrice || null,
      data.priceCurrencyCode || null,
      data.block || false,
      data.status || "Created",
      data.rejectionReason || null,
      partnerPortalNo,
      partnerNo,
      batchNo,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  async updateStatus(id, status, rejectionReason = null) {
    const result = await pool.query(
      `UPDATE item_requests SET status=$1, rejection_reason=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [status, rejectionReason, id],
    );
    return result.rows[0] || null;
  },

  async updateBlock(id, block) {
    const result = await pool.query(
      `UPDATE item_requests SET block=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [block, id],
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM item_requests WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = Item;
